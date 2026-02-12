import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * C0: First-Connect Value Snapshot
 * One-time insight generated after first card connect.
 * Sums all amountUsed from benefit usage + points value to show existing value captured.
 */
export function generateC0(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages, annualFee, totalBenefitsCaptured, cardType, pointsData } = ctx;

  // Dedup key: exactly once per card
  const dedupKey = `c0:${cardType}`;

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

  // Select template variant
  let templateKey: string;
  if (hasPoints && pointsValue > credits * 2) {
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
