// ── Spending analysis types ──

export type SpendingCategory =
  | "dining"
  | "travel"
  | "groceries"
  | "shopping"
  | "transportation"
  | "entertainment"
  | "subscriptions"
  | "other";

export interface CategorizedTransaction {
  id: string;
  date: string; // ISO string for serialization
  merchantName: string | null;
  amount: number;
  category: SpendingCategory;
  plaidCategoryPrimary: string | null;
  plaidCategoryDetailed: string | null;
}

export interface CategorySpending {
  category: SpendingCategory;
  label: string;
  total: number;
  transactions: CategorizedTransaction[];
}

export interface MonthlyHeadline {
  total: number;
  previousTotal: number | null;
  percentChange: number | null;
  isFirstMonth: boolean;
}

export type InsightType =
  | "missed_platform"
  | "underused_credit"
  | "unused_credit"
  | "spending_without_benefit"
  | "positive_reinforcement";

export interface BenefitInsight {
  type: InsightType;
  title: string;
  body: string;
  dollarImpact: number;
  timeUrgency: number; // days remaining — lower = more urgent
  actionability: number; // 1 = most actionable, 3 = filler
}
