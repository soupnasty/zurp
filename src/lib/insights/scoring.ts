import type {
  ActionabilityTier,
  ConfidenceTier,
  InsightCandidate,
  InsightCategory,
  InsightImpressionHistory,
} from "./types";
import { insightGroup } from "./types";

// ── Individual score computations ──

export function computeDollarImpactScore(annualValue: number): number {
  if (annualValue >= 300) return 100;
  if (annualValue >= 150) return 80;
  if (annualValue >= 50) return 60;
  if (annualValue >= 20) return 40;
  if (annualValue >= 10) return 20;
  return 10;
}

export function computeUrgencyScore(daysRemaining: number | null): number {
  if (daysRemaining === null) return 20; // no expiration, no ongoing cost
  if (daysRemaining === -1) return 45; // ongoing cost sentinel (e.g. subscription you're paying for monthly)
  if (daysRemaining <= 0) return 0; // expired — don't show
  if (daysRemaining <= 7) return 100;
  if (daysRemaining <= 30) return 80;
  if (daysRemaining <= 90) return 60;
  return 50; // resets monthly with time remaining
}

const ACTIONABILITY_SCORES: Record<ActionabilityTier, number> = {
  one_click: 100,
  switch_platform: 80,
  book_portal: 60,
  change_recurring: 40,
  plan_future: 20,
};

export function computeActionabilityScore(tier: ActionabilityTier): number {
  return ACTIONABILITY_SCORES[tier];
}

export function computeNoveltyScore(
  history: InsightImpressionHistory | null
): number {
  if (!history || history.showCount === 0) return 100;

  const now = Date.now();
  const daysSinceLast = history.lastShownAt
    ? (now - history.lastShownAt.getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  if (daysSinceLast < 1) return 0; // shown this session
  if (history.showCount >= 2 && daysSinceLast < 60) return 20; // repeat viewer
  if (daysSinceLast >= 30) return 60; // stale enough to resurface
  if (daysSinceLast >= 7) return 40; // shown once, 7-30 days ago
  return 20; // shown once, 1-7 days ago
}

const CONFIDENCE_SCORES: Record<ConfidenceTier, number> = {
  exact_confirmed: 100,
  exact_inferred: 80,
  category_match: 50,
  amount_heuristic: 30,
  stale_data: 15,
};

export function computeConfidenceScore(tier: ConfidenceTier): number {
  return CONFIDENCE_SCORES[tier];
}

// ── Composite scoring ──

const WEIGHTS = {
  dollarImpact: 0.30,
  urgency: 0.25,
  actionability: 0.25,
  novelty: 0.10,
  confidence: 0.10,
} as const;

export function computeTotalScore(scores: {
  dollarImpactScore: number;
  urgencyScore: number;
  actionabilityScore: number;
  noveltyScore: number;
  confidenceScore: number;
}): number {
  return Math.round(
    scores.dollarImpactScore * WEIGHTS.dollarImpact +
      scores.urgencyScore * WEIGHTS.urgency +
      scores.actionabilityScore * WEIGHTS.actionability +
      scores.noveltyScore * WEIGHTS.novelty +
      scores.confidenceScore * WEIGHTS.confidence
  );
}

/**
 * Floor override: high-stakes insights always shown regardless of total score.
 * Only applies to Group A and Group B (not Group C celebrations).
 * Note: P2 benefits from this via insightGroup() mapping P2→"A".
 * P1 intentionally doesn't — it maps to Group C.
 */
export function isFloorOverride(
  category: InsightCategory,
  dollarImpactScore: number,
  urgencyScore: number
): boolean {
  const group = insightGroup(category);
  if (group === "C") return false;
  return dollarImpactScore >= 80 && urgencyScore >= 80;
}

/** Score a candidate with impression history. */
export function scoreCandidate(
  candidate: InsightCandidate,
  history: InsightImpressionHistory | null
) {
  const dollarImpactScore = computeDollarImpactScore(candidate.dollarAmount);
  const urgencyScore = computeUrgencyScore(candidate.daysRemaining);
  const actionabilityScore = computeActionabilityScore(candidate.actionability);
  const noveltyScore = computeNoveltyScore(history);
  const confidenceScore = computeConfidenceScore(candidate.confidence);
  const totalScore = computeTotalScore({
    dollarImpactScore,
    urgencyScore,
    actionabilityScore,
    noveltyScore,
    confidenceScore,
  });
  const floorOverride = isFloorOverride(
    candidate.category,
    dollarImpactScore,
    urgencyScore
  );

  return {
    dollarImpactScore,
    urgencyScore,
    actionabilityScore,
    noveltyScore,
    confidenceScore,
    totalScore,
    floorOverride,
  };
}
