// ── Earn Categories (19-category taxonomy for points engine) ──

export type EarnCategory =
  | "dining"
  | "grocery"
  | "grocery_online"
  | "food_delivery"
  | "coffee"
  | "streaming"
  | "rideshare"
  | "travel_flights"
  | "travel_hotels"
  | "travel_portal"
  | "travel_other"
  | "transit"
  | "gas"
  | "fitness"
  | "events"
  | "shopping_online"
  | "shopping_instore"
  | "bills_utilities"
  | "insurance"
  | "other";

export type CategoryConfidence = "high" | "medium" | "low";
export type MatchSource = "merchant_name" | "plaid_category" | "fallback";

export interface CategoryAssignment {
  category: EarnCategory;
  confidence: CategoryConfidence;
  matchSource: MatchSource;
  matchedValue: string | null;
}

// ── Earn Config (per-card) ──

export interface EarnCondition {
  merchant_match?: string[];
  merchant_exclude?: string[];
  amount_gte?: number;
  amount_lt?: number;
}

export interface EarnCap {
  capId: string;
  categories: EarnCategory[];
  maxSpend: number;
  period: "calendar_year";
}

export interface BonusCategory {
  categories: EarnCategory[];
  earnRate: number;
  label: string;
  conditions?: EarnCondition;
}

export interface PointsValuation {
  conservativeCpp: number;
  upsideCpp: number;
  upsideLabel: string;
}

export interface EarnConfig {
  cardId: string;
  cardName: string;
  pointsCurrency: string;
  baseRate: number;
  bonusCategories: BonusCategory[];
  caps: EarnCap[];
  annualFee: number;
  anniversaryBonus?: number; // e.g. 0.10 for CSP 10%
  valuation: PointsValuation;
}

// ── Calculator Results ──

export interface TransactionEarnResult {
  transactionId: string;
  category: EarnCategory;
  confidence: CategoryConfidence;
  amount: number;
  earnRate: number;
  points: number;
  bonusLabel: string | null;
  capApplied: boolean;
}

export interface CapState {
  [capId: string]: {
    spendToDate: number;
    maxSpend: number;
  };
}

// ── Simulation Results ──

export interface CategoryEarnSummary {
  category: EarnCategory;
  label: string;
  icon: string;
  totalSpend: number;
  transactionCount: number;
  earnRate: number;
  points: number;
  valueConservative: number;
  capNote: string | null;
}

export interface CardSimulation {
  cardId: string;
  cardName: string;
  isUsersCard: boolean;
  annualFee: number;
  totalPoints: number;
  bonusPoints: number;
  pointsValueConservative: number;
  pointsValueUpside: number;
  benefitsValue: number;
  benefitsCaptured: number | null;
  /** For non-user cards: simulated benefit capture from matcher. Null for user's card. */
  benefitsSimulated: number | null;
  /** Points only - fee (guaranteed value, no benefits assumed) */
  netFloor: number;
  /** Points + full catalog benefits - fee (max possible) */
  netCeiling: number;
  /** For user's card: points + captured benefits - fee. For others: points + estimated benefits - fee. */
  netActual: number;
  rank: number;
  categories: CategoryEarnSummary[];
}

export interface CategoryWinner {
  category: EarnCategory;
  label: string;
  icon: string;
  totalSpend: number;
  transactionCount: number;
  cards: {
    cardId: string;
    cardName: string;
    earnRate: number;
    points: number;
    value: number;
    isWinner: boolean;
    marginOverSecond: number | null;
    capNote: string | null;
  }[];
}

export interface HeadlineVerdict {
  type: "win" | "lose" | "close";
  usersCardName: string;
  usersCardNetValue: number;
  bestAlternativeName: string;
  bestAlternativeNetValue: number;
  margin: number;
}

export interface ComparisonOutput {
  analysisPeriod: { start: Date; end: Date };
  monthCount: number;
  totalTransactions: number;
  totalSpend: number;
  cards: CardSimulation[];
  categoryBreakdown: CategoryWinner[];
  headline: HeadlineVerdict;
}
