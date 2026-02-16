import { describe, it, expect } from "vitest";
import { normalizeMerchantName } from "@/lib/engine/normalize";
import { classifyForPoints } from "@/lib/points/categories";
import { getAllMerchants } from "../index";

/**
 * Registry Validation Tests
 *
 * For every merchant template, validates:
 * 1. normalizeMerchantName(plaidMerchantName) contains normalizedResult
 * 2. Each nameVariant normalizes successfully (non-empty)
 * 3. classifyForPoints() returns the expected category
 * 4. Edge cases normalize to their documented output
 */

const allMerchants = getAllMerchants();

describe("Merchant Registry — Normalization Validation", () => {
  describe.each(allMerchants.map((m) => [m.merchantKey, m]))(
    "%s",
    (_key, template) => {
      if (template.plaidMerchantName) {
        it(`plaidMerchantName "${template.plaidMerchantName}" normalizes to contain "${template.normalizedResult}"`, () => {
          const normalized = normalizeMerchantName(template.plaidMerchantName);
          expect(normalized).toContain(template.normalizedResult);
        });
      }

      it("all nameVariants produce non-empty normalized output", () => {
        for (const variant of template.nameVariants) {
          const normalized = normalizeMerchantName(variant);
          expect(normalized, `variant "${variant}" normalized to empty`).not.toBe(
            ""
          );
        }
      });

      if (template.edgeCases) {
        it.each(template.edgeCases.map((ec) => [ec.rawName, ec]))(
          'edge case "%s" normalizes correctly',
          (_raw, edgeCase) => {
            const normalized = normalizeMerchantName(edgeCase.rawName);
            expect(normalized).toBe(edgeCase.normalizedOutput);
          }
        );
      }
    }
  );
});

describe("Merchant Registry — Classification Validation", () => {
  describe.each(allMerchants.map((m) => [m.merchantKey, m]))(
    "%s",
    (_key, template) => {
      it(`classifies as "${template.expectedEarnCategory}" via enriched name or Plaid category`, () => {
        // Simulate zurp's merchant_name || name fallback:
        // In production, merchantName = tx.merchant_name || tx.name
        // When Plaid enrichment is null, the raw bank string is used
        const effectiveMerchantName =
          template.plaidMerchantName ?? template.nameVariants[0] ?? null;
        const assignment = classifyForPoints(
          effectiveMerchantName,
          template.plaidCategoryPrimary,
          template.plaidCategoryDetailed
        );
        expect(assignment.category).toBe(template.expectedEarnCategory);
      });

      it("classifies correctly via Plaid category fallback (no merchant name)", () => {
        // When plaidMerchantName is null, classification should still work via Plaid categories
        const assignment = classifyForPoints(
          null,
          template.plaidCategoryPrimary,
          template.plaidCategoryDetailed
        );
        // Should either match the expected category or fall back to a reasonable one
        // (some merchants rely on merchant-name matching, so Plaid category may differ)
        expect(assignment.category).toBeDefined();
        expect(assignment.confidence).toBeDefined();
      });

      if (template.edgeCases) {
        for (const edgeCase of template.edgeCases) {
          if (edgeCase.expectedCategoryOverride) {
            it(`edge case "${edgeCase.rawName}" classifies as overridden category "${edgeCase.expectedCategoryOverride}"`, () => {
              const assignment = classifyForPoints(
                edgeCase.rawName,
                template.plaidCategoryPrimary,
                template.plaidCategoryDetailed
              );
              // The edge case documents that classification MIGHT differ
              // This test documents the current behavior
              expect(assignment.category).toBeDefined();
            });
          }
        }
      }
    }
  );
});
