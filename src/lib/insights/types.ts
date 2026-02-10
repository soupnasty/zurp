// ── Insights Engine v2 types ──

export type InsightCategory = "A1" | "A2" | "B1" | "B2" | "B3" | "C0" | "C1" | "C2";

export type InsightState = "pending" | "shown" | "expired" | "superseded" | "dismissed";

export type InsightGroup = "A" | "B" | "C";

export type ActionabilityTier =
  | "one_click"        // 100
  | "switch_platform"  // 80
  | "book_portal"      // 60
  | "change_recurring" // 40
  | "plan_future";     // 20

export type ConfidenceTier =
  | "exact_confirmed"  // 100
  | "exact_inferred"   // 80
  | "category_match"   // 50
  | "amount_heuristic"; // 30

/** Raw candidate output from a generator (pre-scoring). */
export interface InsightCandidate {
  category: InsightCategory;
  benefitId: string | null;
  templateKey: string;
  templateVars: Record<string, string | number>;
  dedupKey: string;
  triggeredByTransactionId: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;

  // Scoring inputs
  dollarAmount: number;
  daysRemaining: number | null;
  actionability: ActionabilityTier;
  confidence: ConfidenceTier;
}

/** Fully scored insight ready for persistence or display. */
export interface ScoredInsight {
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
  periodStart: Date | null;
  periodEnd: Date | null;
  generatedAt: Date;
  shownAt: Date | null;
  resolvedAt: Date | null;
}

export interface InsightImpressionHistory {
  insightId: string;
  showCount: number;
  lastShownAt: Date | null;
  firstShownAt: Date | null;
}

export function insightGroup(category: InsightCategory): InsightGroup {
  if (category.startsWith("A")) return "A";
  if (category.startsWith("B")) return "B";
  return "C";
}
