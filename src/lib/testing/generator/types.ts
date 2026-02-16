/**
 * Transaction Generator Types
 *
 * Defines the interfaces for:
 * - Card personas (spending profiles + benefit engagement)
 * - Generated transactions (fixture output format)
 * - Edge case specifications
 * - Oracle reference (expected outcomes)
 */

import type { EarnCategory } from "@/lib/points/types";

// ─── Persona Definition ────────────────────────────────────────────

export interface Persona {
  cardType: string;
  personaName: string;
  description: string;

  /** 12-month generation window */
  generationWindow: {
    start: string; // ISO date "2025-01-01"
    end: string; // ISO date "2025-12-31"
  };

  /** Card anniversary date (for annual_anniversary cycle benefits) */
  anniversaryDate: string | null; // ISO date "2025-03-15"

  /** Monthly spending distribution by earn category */
  monthlySpend: MonthlySpendProfile[];

  /** How each benefit should be exercised */
  benefitBehavior: BenefitBehavior[];

  /** Competitor merchant spending (triggers A1/A2 insights) */
  competitorSpend: CompetitorSpendSpec[];

  /** Edge cases to inject into the transaction stream */
  edgeCases: EdgeCaseSpec[];
}

export interface MonthlySpendProfile {
  /** EarnCategory this spending falls into */
  category: EarnCategory;
  /** Average monthly total for this category */
  avgAmount: number;
  /** 0.0–1.0 percentage swing (0.2 = ±20%) */
  variance: number;
  /** How many individual charges per month */
  transactionsPerMonth: number;
  /** Which merchants from the registry to use (by merchantKey) */
  merchantKeys: string[];
}

export interface BenefitBehavior {
  benefitId: string;
  behavior: "always_use" | "partial_use" | "never_use" | "over_use";
  /** Override for partial_use (0-100) */
  targetUsagePercent?: number;
}

export interface CompetitorSpendSpec {
  /** Display name */
  competitorMerchant: string;
  /** Merchant key from the registry */
  merchantKey: string;
  /** Monthly spend amount */
  monthlyAmount: number;
  /** If true, generates monthly charges for A2 recurring detection */
  recurring: boolean;
}

export interface EdgeCaseSpec {
  type: EdgeCaseType;
  details: Record<string, unknown>;
}

export type EdgeCaseType =
  | "near_cap" // Spend just below a cap threshold
  | "exceed_cap" // Spend exceeding a cap
  | "cross_midnight" // Transaction near midnight UTC
  | "month_boundary" // Transaction on last/first day of month
  | "quarter_boundary" // Transaction on quarter boundary
  | "anniversary_boundary" // Transaction near anniversary date
  | "pending_to_posted" // Pending → posted transition
  | "duplicate_merchant" // Same merchant, same amount, same day
  | "refund" // Negative amount transaction
  | "zero_amount" // $0 authorization
  | "activeMonths_boundary" // Test activeMonths gating (Uber Dec/Jan)
  | "fee_charge"; // Annual fee for anniversary detection

// ─── Generated Transaction ─────────────────────────────────────────

export interface GeneratedTransaction {
  // Core fields (MatcherTransaction shape)
  id: string;
  date: string; // ISO date "2025-07-15"
  merchantName: string | null; // Plaid enriched or raw fallback
  merchantNameRaw: string | null; // Raw bank string
  amount: number; // Always positive (refunds handled separately)
  plaidCategoryPrimary: string | null;
  plaidCategoryDetailed: string | null;
  pending: boolean;
  matchedStatus: "unmatched";

  // Points classification (SimulationTransaction)
  datetime: string | null; // ISO datetime for time-window conditions

  // Generator metadata (used by oracle, not by engine)
  _meta: TransactionMeta;
}

export interface TransactionMeta {
  /** Benefit ID this transaction is intended to trigger */
  intendedBenefit: string | null;
  /** EarnCategory the points engine should classify this as */
  intendedCategory: EarnCategory;
  /** Edge case tag for verification */
  edgeCaseTag: EdgeCaseType | null;
  /** Should trigger A1/A2 insight */
  isCompetitorSpend: boolean;
  /** Which benefit this competitor spend relates to */
  competitorBenefitKey: string | null;
  /** Groups recurring charges for A2 detection */
  recurringGroupId: string | null;
}

// ─── Fixture Set ────────────────────────────────────────────────────

export interface FixtureSet {
  persona: Persona;
  transactions: GeneratedTransaction[];
  generatedAt: string; // ISO datetime
  inputHash: string; // Hash of card def + earn config (for staleness)
}

// ─── Oracle Reference ───────────────────────────────────────────────

export interface ExpectedOutcomes {
  /** Benefits that should be triggered (by benefit ID) */
  expectedBenefitMatches: {
    benefitId: string;
    expectedTransactionCount: number;
    expectedTotalCredit: number;
  }[];

  /** Benefits that should NOT be triggered */
  expectedUnusedBenefits: string[];

  /** Insight categories expected to fire */
  expectedInsights: {
    category: string; // "A1", "B1", "C1", etc.
    benefitId?: string;
    merchantPattern?: string;
  }[];
}
