// ── Benefit cycles ──

export type BenefitCycle =
  | "monthly"
  | "biannual_h1"
  | "biannual_h2"
  | "annual_calendar"
  | "annual_anniversary"
  | "quadrennial"
  | "subscription";

export type BenefitCategory =
  | "travel"
  | "dining"
  | "entertainment"
  | "transport"
  | "fitness"
  | "shopping"
  | "subscription";

export type BenefitType = "credit" | "subscription";

export type MatchConfidence = "high" | "medium" | "low";
export type MatchMethod = "auto" | "manual";
export type MatchedStatus = "unmatched" | "matched" | "ambiguous" | "skipped";
export type AnniversarySource = "auto_detected" | "user_provided" | "pending";
export type ConnectionStatus = "active" | "needs_reauth" | "disconnected";
export type FlagType = "removed" | "added";

export interface TransactionFlag {
  id: string;
  userId: string;
  transactionId: string;
  benefitId: string;
  flagType: FlagType;
  reason: string | null;
  originalMatch: boolean;
  createdAt: Date;
}

// ── Benefit detail content (modal data) ──

export interface BenefitDetails {
  description: string;
  howToUse: string[];
  links: { label: string; url: string }[];
}

// ── Card definition (code-side, used in registry) ──

export interface CardDefinition {
  id: string;
  name: string;
  issuer: string;
  network: "visa" | "amex" | "mastercard";
  annualFee: number;
  feeDescriptor: string;
  imageUrl: string | null;
  isActive: boolean;
  benefits: BenefitDefinition[];
}

export interface BenefitDefinition {
  id: string;
  cardId: string;
  name: string;
  icon: string;
  category: BenefitCategory;
  type: BenefitType;
  creditAmount: number;
  cycle: BenefitCycle;
  carriesOver: boolean;
  maxCarryoverPeriods: number | null;
  maxAccrued: number | null;
  merchantPatterns: string[];
  plaidCategories: string[];
  autoMatchable: boolean;
  requiresActivation: boolean;
  priority: number;
  description: string;
  notes: string | null;
  sunsetDate: string | null;
  sourceUrl: string | null;
  displayGroup: string | null;
  displayGroupName: string | null;
  displayGroupIcon: string | null;
  details: BenefitDetails | null;
}

// ── Computed summaries ──

export interface CardSummary {
  cardId: string;
  cardName: string;
  annualFee: number;
  creditsAvailable: number;
  creditsUsed: number;
  creditsExpired: number;
  effectiveFee: number;
  roiPercent: number;
  daysUntilNextExpiry: number | null;
  valueAtRisk: number;
}

export interface BenefitUsageSummary {
  benefitId: string;
  benefitName: string;
  icon: string;
  category: BenefitCategory;
  type: BenefitType;
  cycle: BenefitCycle;
  creditAmount: number;
  amountUsed: number;
  amountRemaining: number;
  isFullyUsed: boolean;
  daysRemaining: number;
  requiresActivation: boolean;
  autoMatchable: boolean;
  sunsetDate: string | null;
  displayGroup: string | null;
  displayGroupName: string | null;
  displayGroupIcon: string | null;
  details: BenefitDetails | null;
  periodKey: string;
  cycleStart: Date;
  cycleEnd: Date;
}

export interface TransactionWithMatch {
  id: string;
  date: Date;
  merchantName: string | null;
  amount: number;
  matchedStatus: MatchedStatus;
  matchedBenefitName: string | null;
  benefitId: string | null;
  benefitUsageId: string | null;
  creditApplied: number | null;
  matchConfidence: MatchConfidence | null;
  matchMethod: MatchMethod | null;
}

// ── Engine types ──

export interface CycleBounds {
  periodKey: string;
  cycleStart: Date;
  cycleEnd: Date;
}

export interface AnniversaryDetectionResult {
  detected: boolean;
  transactionId: string | null;
  anniversaryDate: Date | null;
  confidence: MatchConfidence;
}

export interface MatcherConfig {
  benefits: BenefitDefinition[];
  usageMap: Map<string, { amountUsed: number; creditAmount: number }>;
  anniversaryDate: Date | null;
  referenceDate?: Date;
}

export interface MatcherTransaction {
  id: string;
  date: Date;
  merchantName: string | null;
  merchantNameRaw: string | null;
  amount: number;
  plaidCategoryPrimary: string | null;
  plaidCategoryDetailed: string | null;
  pending: boolean;
  matchedStatus: MatchedStatus;
}

export interface MatchResult {
  transactionId: string;
  benefitId: string;
  creditApplied: number;
  matchMethod: MatchMethod;
  matchConfidence: MatchConfidence;
}

export interface MatcherOutput {
  matches: MatchResult[];
  usageUpdates: Map<string, number>;
  ambiguousTransactions: string[];
  unmatchedTransactionIds: string[];
}
