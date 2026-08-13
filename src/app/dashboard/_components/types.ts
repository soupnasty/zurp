import type { BenefitGroup } from "@/lib/benefit-grouping";
import type { CardSimulation, CategoryWinner, HeadlineVerdict } from "@/lib/points/types";
import type { InsightCategory, InsightState } from "@/lib/insights/types";

// Serialized types (dates as ISO strings)
export interface SerializedComparison {
  analysisPeriod: { start: string; end: string };
  monthCount: number;
  totalTransactions: number;
  totalSpend: number;
  totalCards: number;
  portalMode: boolean;
  cards: CardSimulation[];
  categoryBreakdown: CategoryWinner[];
  headline: HeadlineVerdict;
  classifiedSpendPct: number | null;
}

export interface ClassifiedBenefitGroup extends BenefitGroup {
  status: "captured" | "partial" | "expiring" | "unused";
}

export interface SerializedPointsSummary {
  cardId: string;
  totalSpend: number;
  totalPoints: number;
  valueConservative: number;
  valueUpside: number;
  categoryBreakdown: Array<{
    category: string;
    spend: number;
    points: number;
    earnRate: number;
    valueConservative: number;
  }>;
  lastTransactionDate: string | null;
}

export interface SerializedInsight {
  id: string;
  userId: string;
  category: InsightCategory;
  benefitId: string | null;
  templateKey: string;
  templateVars: Record<string, string | number>;
  renderedTitle: string;
  renderedBody: string;
  dollarImpactScore: number;
  urgencyScore: number;
  actionabilityScore: number;
  noveltyScore: number;
  confidenceScore: number;
  totalScore: number;
  floorOverride: boolean;
  state: InsightState;
  dedupKey: string;
  triggeredByTransactionId: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  generatedAt: string;
  shownAt: string | null;
  resolvedAt: string | null;
}

export interface UpcomingReset {
  id: string;
  name: string;
  icon: string;
  cycle: string;
  totalRemaining: number;
  daysRemaining: number;
  cycleEnd: string;
}
