import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * C0: First-Connect Value Snapshot
 * Generated after card connect to show existing value captured.
 *
 * Two-phase dedup:
 * - `c0:{cardType}:initial` — first connect (may have low history)
 * - `c0:{cardType}:mature`  — refresh after 6+ months if initial was low_history
 */
export function generateC0(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages, annualFee, totalBenefitsCaptured, cardType, pointsData, existingMilestoneKeys } = ctx;

  const pointsValue = pointsData?.valueConservative ?? 0;
  const totalValue = totalBenefitsCaptured + pointsValue;

  if (totalValue <= 0) return [];

  const total = Math.round(totalValue);
  const credits = Math.round(totalBenefitsCaptured);
  const pctOfFee = annualFee > 0 ? Math.round((totalValue / annualFee) * 100) : 0;

  // Determine how many months of history we have
  const usagePeriods = new Set(benefitUsages.map((u) => u.periodKey));
  const monthCount = usagePeriods.size;

  const hasPoints = pointsValue > 0;

  const initialKey = `c0:${cardType}:initial`;
  const matureKey = `c0:${cardType}:mature`;
  // Also check legacy key (pre-v3) for backwards compatibility
  const legacyKey = `c0:${cardType}`;

  const hasInitial = existingMilestoneKeys.includes(initialKey) || existingMilestoneKeys.includes(legacyKey);
  const hasMature = existingMilestoneKeys.includes(matureKey);

  // Determine which phase to generate
  let dedupKey: string;
  let isRefresh = false;

  if (!hasInitial) {
    // First-time generation
    dedupKey = initialKey;
  } else if (!hasMature && monthCount >= 6) {
    // Refresh: initial exists, 6+ months of data now available
    dedupKey = matureKey;
    isRefresh = true;
  } else {
    // Already generated both phases, or not enough data for refresh
    return [];
  }

  // Select template variant
  let templateKey: string;
  if (isRefresh) {
    templateKey = hasPoints ? "c0_refresh_with_points" : "c0_refresh";
  } else if (hasPoints && pointsValue > credits * 2) {
    templateKey = "c0_points_dominant";
  } else if (monthCount < 3) {
    templateKey = hasPoints ? "c0_low_history_with_points" : "c0_low_history";
  } else if (pctOfFee >= 50) {
    templateKey = hasPoints ? "c0_strong_with_points" : "c0_strong";
  } else {
    templateKey = hasPoints ? "c0_standard_with_points" : "c0_standard";
  }

  const templateVars: Record<string, string | number> = {
    total,
    pct_of_fee: pctOfFee,
    months: monthCount,
    credits,
    points_value: Math.round(pointsValue),
  };

  return [
    {
      category: "C0",
      benefitId: null,
      templateKey,
      templateVars,
      dedupKey,
      triggeredByTransactionId: null,
      periodStart: null,
      periodEnd: null,
      dollarAmount: total,
      daysRemaining: null,
      actionability: "plan_future",
      confidence: "exact_confirmed",
    },
  ];
}
