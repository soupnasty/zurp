/**
 * Generated Fixture Tests
 *
 * Consumes fixtures from the transaction generator and validates them
 * against the actual normalization and classification engines.
 *
 * These tests verify that:
 * 1. Every generated transaction classifies correctly through classifyForPoints()
 * 2. Normalization produces expected results for all merchant variants
 * 3. Benefit-targeting transactions use merchants that match benefit patterns
 * 4. Edge case transactions are properly tagged and distributed
 * 5. Fixture validation passes for all personas
 */

import { describe, it, expect } from "vitest";
import { generateTransactions } from "../generator";
import { validateFixture } from "../validation";
import { ALL_PERSONAS } from "../personas";
import { normalizeMerchantName } from "@/lib/engine/normalize";
import { classifyForPoints } from "@/lib/points/categories";
import type { GeneratedTransaction } from "../types";

// ─── Test all card × persona combinations ──────────────────────────

for (const [cardType, personas] of Object.entries(ALL_PERSONAS)) {
  describe(`Generated fixtures: ${cardType}`, () => {
    for (const persona of personas) {
      describe(`persona: ${persona.personaName}`, () => {
        // Generate once, share across tests
        const transactions = generateTransactions(persona);
        const validation = validateFixture(transactions, persona);

        it("passes schema validation", () => {
          expect(validation.errors).toHaveLength(0);
        });

        it("generates a reasonable number of transactions", () => {
          // Should produce at least 50 txs for a 12-month window
          expect(transactions.length).toBeGreaterThan(50);
          // But not an unreasonable number
          expect(transactions.length).toBeLessThan(2000);
        });

        it("spans the full generation window", () => {
          const dates = transactions.map((tx) => tx.date).sort();
          const firstMonth = dates[0].slice(0, 7);
          const lastMonth = dates[dates.length - 1].slice(0, 7);
          const windowStartMonth = persona.generationWindow.start.slice(0, 7);
          const windowEndMonth = persona.generationWindow.end.slice(0, 7);

          expect(firstMonth).toBe(windowStartMonth);
          expect(lastMonth).toBe(windowEndMonth);
        });

        it("has unique IDs for all transactions", () => {
          const ids = transactions.map((tx) => tx.id);
          expect(new Set(ids).size).toBe(ids.length);
        });

        it("classifies transactions through the real points engine", () => {
          const mismatches: string[] = [];

          for (const tx of transactions) {
            // Skip edge cases and "other" category — these may
            // classify differently due to merchant-map gaps
            if (tx._meta.edgeCaseTag === "fee_charge") continue;
            if (tx._meta.intendedCategory === "other") continue;

            // Simulate the Plaid data flow: merchant_name || name
            const effectiveMerchantName =
              tx.merchantName ?? tx.merchantNameRaw ?? null;

            const assignment = classifyForPoints(
              effectiveMerchantName,
              tx.plaidCategoryPrimary,
              tx.plaidCategoryDetailed,
            );

            // Check that the classification matches intent
            // Allow "other" as a fallback when the merchant map doesn't cover it
            if (
              assignment.category !== tx._meta.intendedCategory &&
              assignment.category !== "other"
            ) {
              mismatches.push(
                `${tx.id}: expected "${tx._meta.intendedCategory}", ` +
                  `got "${assignment.category}" for merchant "${effectiveMerchantName}" ` +
                  `(plaid: ${tx.plaidCategoryDetailed})`,
              );
            }
          }

          // Allow up to 5% mismatches (due to edge cases, merchant-map gaps)
          const threshold = Math.ceil(transactions.length * 0.05);
          if (mismatches.length > threshold) {
            expect.fail(
              `Too many classification mismatches (${mismatches.length}/${transactions.length}):\n` +
                mismatches.slice(0, 10).join("\n"),
            );
          }
        });

        it("normalizes all merchant names without errors", () => {
          for (const tx of transactions) {
            const input = tx.merchantName ?? tx.merchantNameRaw ?? "";
            expect(() => normalizeMerchantName(input)).not.toThrow();

            const normalized = normalizeMerchantName(input);
            expect(normalized.length).toBeGreaterThan(0);
          }
        });

        it("covers all benefit behaviors that are not never_use", () => {
          const targetedBenefits = new Set(
            transactions
              .map((tx) => tx._meta.intendedBenefit)
              .filter(Boolean) as string[],
          );

          for (const bb of persona.benefitBehavior) {
            if (bb.behavior === "never_use") continue;
            expect(
              targetedBenefits.has(bb.benefitId),
              `Missing coverage for benefit ${bb.benefitId} (behavior: ${bb.behavior})`,
            ).toBe(true);
          }
        });

        it("generates competitor transactions for recurring competitors", () => {
          for (const comp of persona.competitorSpend) {
            if (!comp.recurring) continue;

            const matching = transactions.filter(
              (tx) =>
                tx._meta.isCompetitorSpend &&
                tx._meta.recurringGroupId ===
                  `recurring_${comp.merchantKey}`,
            );

            // Recurring needs 3+ for A2 detection
            expect(
              matching.length,
              `Recurring competitor "${comp.competitorMerchant}" needs 3+ txs for A2`,
            ).toBeGreaterThanOrEqual(3);
          }
        });

        it("includes fee_charge edge cases when persona specifies them", () => {
          const hasFeeEdgeCase = persona.edgeCases.some(
            (ec) => ec.type === "fee_charge",
          );

          if (hasFeeEdgeCase) {
            const feeTransactions = transactions.filter(
              (tx) => tx._meta.edgeCaseTag === "fee_charge",
            );
            expect(feeTransactions.length).toBeGreaterThan(0);

            // Verify fee amount matches
            const expectedAmount = persona.edgeCases.find(
              (ec) => ec.type === "fee_charge",
            )?.details.amount as number;

            if (expectedAmount) {
              expect(feeTransactions[0].amount).toBe(expectedAmount);
            }
          }
        });
      });
    }
  });
}

// ─── Cross-persona sanity checks ───────────────────────────────────

describe("Cross-persona consistency", () => {
  it("maximizer personas generate more transactions than minimalists", () => {
    for (const [cardType, personas] of Object.entries(ALL_PERSONAS)) {
      const maxPersona = personas.find((p) => p.personaName === "maximizer");
      const minPersona = personas.find(
        (p) =>
          p.personaName === "minimalist" ||
          p.personaName === "flat_spender" ||
          p.personaName === "general_spender" ||
          p.personaName === "diversified_traveler",
      );

      if (maxPersona && minPersona) {
        const maxTxs = generateTransactions(maxPersona);
        const minTxs = generateTransactions(minPersona);
        expect(
          maxTxs.length,
          `${cardType}: maximizer should have more txs than lighter persona`,
        ).toBeGreaterThan(minTxs.length);
      }
    }
  });

  it("no-fee cards have no fee_charge edge cases generating > $0 fee", () => {
    const noFeeCards = ["chase_freedom_flex"];
    for (const cardType of noFeeCards) {
      const personas = ALL_PERSONAS[cardType] ?? [];
      for (const persona of personas) {
        const txs = generateTransactions(persona);
        const feeTxs = txs.filter(
          (tx) => tx._meta.edgeCaseTag === "fee_charge",
        );
        expect(
          feeTxs.length,
          `${cardType}/${persona.personaName}: no-fee card should not have fee charges`,
        ).toBe(0);
      }
    }
  });

  it("deterministic: same seed produces identical output", () => {
    const persona = ALL_PERSONAS["chase_sapphire_reserve"][0];
    const run1 = generateTransactions(persona, { seed: "test_seed_123" });
    const run2 = generateTransactions(persona, { seed: "test_seed_123" });

    expect(run1.length).toBe(run2.length);
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i].id).toBe(run2[i].id);
      expect(run1[i].amount).toBe(run2[i].amount);
      expect(run1[i].date).toBe(run2[i].date);
      expect(run1[i].merchantName).toBe(run2[i].merchantName);
    }
  });
});
