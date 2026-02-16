/**
 * Matching Layer
 *
 * Tests runMatcher() against each transaction's _meta.intendedBenefit oracle.
 *
 * Severity:
 *   "bug"          — benefit exists on card but engine didn't match (or matched wrong)
 *   "gap"          — benefit credit was depleted by earlier txs (expected depletion)
 *   "oracle_error" — fixture references a benefit that doesn't exist on this card
 */

import type { GeneratedTransaction } from "../generator/types";
import type { Persona } from "../generator/types";
import type { CardDefinition } from "../../types";
import type { LayerResult } from "./types";
import { emptyLayerResult } from "./types";
import { runMatcher } from "../../engine/matcher";
import { normalizeMerchantName, matchesMerchantPattern } from "../../engine/normalize";
import { toMatcherTx, buildMatcherConfig } from "./adapters";

export function testMatching(
  transactions: GeneratedTransaction[],
  cardDef: CardDefinition,
  persona: Persona,
  card: string,
  personaName: string,
): LayerResult {
  const result = emptyLayerResult("matching");

  // Sort transactions by date before feeding to matcher (credit depletion is order-dependent)
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Convert to MatcherTransaction[]
  const matcherTxs = sorted.map(toMatcherTx);

  // Build config
  const config = buildMatcherConfig(cardDef, persona);

  // Run the matcher
  const output = runMatcher(matcherTxs, config);

  // Build a lookup: transactionId → MatchResult
  const matchMap = new Map<string, { benefitId: string; creditApplied: number }>();
  for (const m of output.matches) {
    matchMap.set(m.transactionId, {
      benefitId: m.benefitId,
      creditApplied: m.creditApplied,
    });
  }

  // Build a set of ambiguous transaction IDs (non-autoMatchable benefits matched)
  const ambiguousSet = new Set(output.ambiguousTransactions);

  // Build a set of benefit IDs that exist on this card
  const cardBenefitIds = new Set(cardDef.benefits.map((b) => b.id));

  // Build a map of benefit ID → BenefitDefinition for quick lookup
  const cardBenefitMap = new Map(cardDef.benefits.map((b) => [b.id, b]));

  // Track which benefits have been fully depleted
  // (for distinguishing "bug" from "gap" when a benefit-targeted tx doesn't match)
  const depletedBenefits = new Set<string>();
  for (const [key, amount] of output.usageUpdates) {
    const benefitId = key.split(":")[0];
    const benefit = cardDef.benefits.find((b) => b.id === benefitId);
    if (benefit && amount >= benefit.creditAmount) {
      depletedBenefits.add(benefitId);
    }
  }

  // Validate each transaction against its oracle
  for (const tx of sorted) {
    if (tx._meta.edgeCaseTag === "fee_charge") {
      result.skipped++;
      continue;
    }

    result.tested++;

    const expectedBenefit = tx._meta.intendedBenefit;
    const isCompetitor = tx._meta.isCompetitorSpend;
    const match = matchMap.get(tx.id);

    if (isCompetitor) {
      // Competitor transactions ideally should NOT match a merchant-specific benefit.
      // However, matching a broad category-fallback benefit (e.g., csr_travel matching
      // Uber rides via TRANSPORTATION plaid category) is EXPECTED behavior — it means
      // the card would have covered this spend, which drives A1/A2 insights.
      if (!match) {
        result.passed++;
      } else {
        const matchedBenefit = cardBenefitMap.get(match.benefitId);
        if (matchedBenefit?.isCategoryFallback) {
          // Category fallback match on competitor tx is expected (drives insights)
          result.passed++;
        } else {
          result.failed++;
          result.mismatches.push({
            txId: tx.id,
            merchant: tx.merchantName,
            card,
            persona: personaName,
            layer: "matching",
            expected: "NO MATCH (competitor)",
            actual: `matched ${match.benefitId}`,
            severity: "bug",
            detail: `Competitor tx for "${tx.merchantName}" incorrectly matched to ${match.benefitId}`,
          });
        }
      }
    } else if (expectedBenefit) {
      // Benefit-targeted transaction — should match the expected benefit
      if (match && match.benefitId === expectedBenefit) {
        result.passed++;
      } else if (!cardBenefitIds.has(expectedBenefit)) {
        // Fixture references a benefit that doesn't exist on this card
        result.failed++;
        result.mismatches.push({
          txId: tx.id,
          merchant: tx.merchantName,
          card,
          persona: personaName,
          layer: "matching",
          expected: expectedBenefit,
          actual: match?.benefitId ?? "NO MATCH",
          severity: "oracle_error",
          detail: `Benefit "${expectedBenefit}" does not exist on card "${card}"`,
        });
      } else if (depletedBenefits.has(expectedBenefit)) {
        // Benefit credit was depleted by earlier transactions — expected
        result.skipped++;
        result.tested--; // Don't count depleted as tested
      } else if (match && match.benefitId !== expectedBenefit) {
        // Matched to wrong benefit
        result.failed++;
        result.mismatches.push({
          txId: tx.id,
          merchant: tx.merchantName,
          card,
          persona: personaName,
          layer: "matching",
          expected: expectedBenefit,
          actual: match.benefitId,
          severity: "bug",
          detail: `Expected "${expectedBenefit}" but matched to "${match.benefitId}" for "${tx.merchantName}"`,
        });
      } else if (ambiguousSet.has(tx.id)) {
        // Transaction was flagged as ambiguous (non-autoMatchable benefit matched pattern
        // but requires manual user confirmation). Check if expected benefit is non-autoMatchable
        // — if so, this is expected behavior, not a bug.
        const expectedBenefitDef = cardBenefitMap.get(expectedBenefit);
        if (expectedBenefitDef && !expectedBenefitDef.autoMatchable) {
          // Verify the merchant pattern or plaid category would actually match
          const normalizedName = normalizeMerchantName(tx.merchantName || tx.merchantNameRaw);
          const merchantMatch = matchesMerchantPattern(normalizedName, expectedBenefitDef.merchantPatterns);
          // For isCategoryFallback benefits with empty merchantPatterns, check plaid category
          const plaidMatch =
            expectedBenefitDef.isCategoryFallback &&
            expectedBenefitDef.plaidCategories?.some(
              (cat: string) =>
                tx.plaidCategoryPrimary === cat ||
                tx.plaidCategoryDetailed === cat,
            );
          if (merchantMatch || plaidMatch) {
            result.passed++;
          } else {
            result.failed++;
            result.mismatches.push({
              txId: tx.id,
              merchant: tx.merchantName,
              card,
              persona: personaName,
              layer: "matching",
              expected: expectedBenefit,
              actual: "AMBIGUOUS (pattern mismatch)",
              severity: "bug",
              detail: `Benefit "${expectedBenefit}" (autoMatchable=false) was ambiguous but merchant "${tx.merchantName}" doesn't match its patterns [${expectedBenefitDef.merchantPatterns.join(", ")}]`,
            });
          }
        } else {
          result.failed++;
          result.mismatches.push({
            txId: tx.id,
            merchant: tx.merchantName,
            card,
            persona: personaName,
            layer: "matching",
            expected: expectedBenefit,
            actual: "AMBIGUOUS",
            severity: "bug",
            detail: `Benefit "${expectedBenefit}" exists on card and is autoMatchable, but tx "${tx.merchantName}" ended up in ambiguous`,
          });
        }
      } else {
        // Not matched at all, but benefit exists and isn't depleted.
        // Check if the benefit is non-autoMatchable with empty merchantPatterns —
        // these are portal/manual-confirmation benefits (e.g., hotel collection credits)
        // that can't be auto-matched from transaction data alone.
        const benefitDef = cardBenefitMap.get(expectedBenefit);
        if (benefitDef && !benefitDef.autoMatchable && benefitDef.merchantPatterns.length === 0) {
          // Expected: benefit requires portal booking or manual confirmation
          result.passed++;
        } else {
          result.failed++;
          result.mismatches.push({
            txId: tx.id,
            merchant: tx.merchantName,
            card,
            persona: personaName,
            layer: "matching",
            expected: expectedBenefit,
            actual: "NO MATCH",
            severity: "bug",
            detail: `Benefit "${expectedBenefit}" exists on card but tx "${tx.merchantName}" ($${tx.amount}) was not matched`,
          });
        }
      }
    } else {
      // General spend — no specific benefit expected, just check no crash
      result.passed++;
    }
  }

  return result;
}
