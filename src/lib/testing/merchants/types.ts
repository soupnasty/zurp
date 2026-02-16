import type { EarnCategory } from "@/lib/points/types";

export type { EarnCategory };

/** A realistic merchant template for generating test fixtures. */
export interface MerchantTemplate {
  /** Canonical merchant identifier (snake_case). */
  merchantKey: string;

  /** What Plaid's merchant_name enrichment returns. Null for fallback-path testing. */
  plaidMerchantName: string | null;

  /** Realistic variants of Plaid's `name` field (lightly cleaned bank strings). */
  nameVariants: string[];

  /** What normalizeMerchantName() produces from the enriched name (or first variant). */
  normalizedResult: string;

  /** Expected category from the points engine's classifyForPoints(). */
  expectedEarnCategory: EarnCategory;

  /** Plaid personal_finance_category.primary */
  plaidCategoryPrimary: string;

  /** Plaid personal_finance_category.detailed */
  plaidCategoryDetailed: string;

  /** Which card benefit merchantPatterns this merchant matches. */
  matchesBenefitPatterns: string[];

  /** Typical transaction amount range for this merchant. */
  amountRange: { min: number; max: number };

  /** Known normalization or classification edge cases. */
  edgeCases?: MerchantEdgeCase[];
}

/** A documented normalization edge case for a merchant. */
export interface MerchantEdgeCase {
  /** The raw `name` field variant that's tricky. */
  rawName: string;

  /** What normalizeMerchantName() produces from this variant. */
  normalizedOutput: string;

  /** Why this is an edge case. */
  description: string;

  /** If classification differs from the template's expectedEarnCategory. */
  expectedCategoryOverride?: EarnCategory;
}
