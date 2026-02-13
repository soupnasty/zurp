import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

const MILESTONES = [
  { threshold: 0.5, label: "50%" },
  { threshold: 0.75, label: "75%" },
  { threshold: 1.0, label: "100%" },
  { threshold: 1.5, label: "150%" },
  { threshold: 2.0, label: "200%" },
];

/**
 * C2: ROI Milestone
 * Thresholds: 50%, 75%, 100%, 150%, 200% of annual fee.
 * Total value = benefits captured + points value (if available).
 */
export function generateC2(ctx: GeneratorContext): InsightCandidate[] {
  const {
    annualFee,
    totalBenefitsCaptured,
    existingMilestoneKeys,
    cardType,
    pointsData,
  } = ctx;
  if (annualFee <= 0) return [];

  const pointsValue = pointsData?.valueConservative ?? 0;
  const totalValue = totalBenefitsCaptured + pointsValue;
  const insights: InsightCandidate[] = [];
  const ratio = totalValue / annualFee;

  // Iterate in reverse so we emit the highest reached milestone, not the lowest
  for (const { threshold } of [...MILESTONES].reverse()) {
    const dedupKey = `c2:${cardType}:${Math.round(threshold * 100)}pct`;

    // Skip if already generated
    if (existingMilestoneKeys.includes(dedupKey)) continue;

    // Check if user has reached this milestone
    if (ratio < threshold) continue;

    const total = Math.round(totalValue);
    const credits = Math.round(totalBenefitsCaptured);
    const fee = annualFee;
    const hasPoints = pointsValue > 0;

    let templateKey: string;
    let templateVars: Record<string, string | number>;

    if (threshold === 1.0) {
      templateKey = hasPoints ? "c2_break_even_with_points" : "c2_break_even";
      templateVars = hasPoints
        ? {
            total,
            fee,
            credits,
            points_value: Math.round(pointsValue),
          }
        : { total, fee };
    } else if (threshold > 1.0) {
      const surplus = Math.round(totalValue - annualFee);
      const multiplier = (totalValue / annualFee).toFixed(1);
      templateKey =
        hasPoints ? "c2_profitable_with_points" : "c2_profitable";
      templateVars = hasPoints
        ? { total, surplus, fee, multiplier, credits, points_value: Math.round(pointsValue) }
        : { total, surplus, fee, multiplier };
    } else {
      const multiplier = (totalValue / annualFee).toFixed(1);
      const pct_of_fee = Math.round((totalValue / annualFee) * 100);
      templateKey = hasPoints ? "c2_milestone_with_points" : "c2_milestone";
      templateVars = hasPoints
        ? { total, fee, multiplier, credits, points_value: Math.round(pointsValue), pct_of_fee }
        : { total, fee, multiplier };
    }

    insights.push({
      category: "C2",
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
    });

    // Only generate the highest reached milestone (not multiple at once)
    break;
  }

  return insights;
}
