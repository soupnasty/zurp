import { describe, it, expect } from "vitest";
import { cardRegistry } from "@/lib/cards";
import { getAllMerchants, getRegistryStats } from "../index";

/**
 * Registry Completeness Tests
 *
 * Extracts all unique merchantPatterns from the 30-card registry
 * and checks coverage against the merchant template registry.
 * Target: ≥80% of benefit patterns covered.
 */

/** Extract all unique merchantPatterns across all cards and benefits. */
function getAllBenefitPatterns(): Set<string> {
  const patterns = new Set<string>();
  for (const card of cardRegistry) {
    for (const benefit of card.benefits) {
      for (const pattern of benefit.merchantPatterns) {
        patterns.add(pattern.toLowerCase());
      }
    }
  }
  return patterns;
}

/** Get all benefit patterns covered by the merchant registry. */
function getCoveredPatterns(): Set<string> {
  const covered = new Set<string>();
  const allMerchants = getAllMerchants();
  for (const merchant of allMerchants) {
    for (const pattern of merchant.matchesBenefitPatterns) {
      covered.add(pattern.toLowerCase());
    }
  }
  return covered;
}

describe("Merchant Registry — Completeness", () => {
  it("registry has at least 50 merchant templates", () => {
    const stats = getRegistryStats();
    expect(stats.totalTemplates).toBeGreaterThanOrEqual(50);
  });

  it("registry covers at least 15 categories", () => {
    const stats = getRegistryStats();
    expect(stats.categories).toBeGreaterThanOrEqual(15);
  });

  it("registry has at least 100 name variants", () => {
    const stats = getRegistryStats();
    expect(stats.totalVariants).toBeGreaterThanOrEqual(100);
  });

  it("all merchantKeys are unique", () => {
    const allMerchants = getAllMerchants();
    const keys = allMerchants.map((m) => m.merchantKey);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it("covers ≥80% of benefit patterns from cardRegistry", () => {
    const allPatterns = getAllBenefitPatterns();
    const covered = getCoveredPatterns();

    const uncovered: string[] = [];
    for (const pattern of allPatterns) {
      if (!covered.has(pattern)) {
        uncovered.push(pattern);
      }
    }

    const coveragePercent =
      ((allPatterns.size - uncovered.length) / allPatterns.size) * 100;

    // Log uncovered patterns for visibility
    if (uncovered.length > 0) {
      console.log(
        `\nUncovered benefit patterns (${uncovered.length}/${allPatterns.size}):`
      );
      for (const p of uncovered.sort()) {
        console.log(`  - ${p}`);
      }
    }

    console.log(
      `\nRegistry coverage: ${coveragePercent.toFixed(1)}% (${allPatterns.size - uncovered.length}/${allPatterns.size} patterns)`
    );

    // Allow up to 20% uncovered (rare/niche patterns)
    expect(coveragePercent).toBeGreaterThanOrEqual(80);
  });

  it("every merchantKey follows snake_case convention", () => {
    const allMerchants = getAllMerchants();
    for (const merchant of allMerchants) {
      expect(
        merchant.merchantKey,
        `merchantKey "${merchant.merchantKey}" is not snake_case`
      ).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it("every template has at least one nameVariant", () => {
    const allMerchants = getAllMerchants();
    for (const merchant of allMerchants) {
      expect(
        merchant.nameVariants.length,
        `${merchant.merchantKey} has no nameVariants`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it("amountRange min ≤ max for all templates", () => {
    const allMerchants = getAllMerchants();
    for (const merchant of allMerchants) {
      expect(
        merchant.amountRange.min,
        `${merchant.merchantKey}: min ${merchant.amountRange.min} > max ${merchant.amountRange.max}`
      ).toBeLessThanOrEqual(merchant.amountRange.max);
    }
  });
});
