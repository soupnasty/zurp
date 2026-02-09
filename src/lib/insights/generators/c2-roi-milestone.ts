import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

const MILESTONES = [
  { threshold: 0.5, label: "50%" },
  { threshold: 0.75, label: "75%" },
  { threshold: 1.0, label: "100%" },
  { threshold: 1.5, label: "150%" },
];

/**
 * C2: ROI Milestone
 * Thresholds: 50%, 75%, 100%, 150% of annual fee.
 */
export function generateC2(ctx: GeneratorContext): InsightCandidate[] {
  const { annualFee, totalBenefitsCaptured, existingMilestoneKeys } = ctx;
  if (annualFee <= 0) return [];

  const insights: InsightCandidate[] = [];
  const ratio = totalBenefitsCaptured / annualFee;

  for (const { threshold, label } of MILESTONES) {
    const dedupKey = `c2:${Math.round(threshold * 100)}pct`;

    // Skip if already generated
    if (existingMilestoneKeys.includes(dedupKey)) continue;

    // Check if user has reached this milestone
    if (ratio < threshold) continue;

    const total = Math.round(totalBenefitsCaptured);
    const fee = annualFee;

    let templateKey: string;
    let templateVars: Record<string, string | number>;

    if (threshold === 1.0) {
      templateKey = "c2_break_even";
      templateVars = { total, fee };
    } else if (threshold > 1.0) {
      const surplus = Math.round(totalBenefitsCaptured - annualFee);
      const multiplier = (totalBenefitsCaptured / annualFee).toFixed(1);
      templateKey = "c2_profitable";
      templateVars = { total, surplus, fee, multiplier };
    } else {
      templateKey = "c2_milestone";
      const multiplier = (totalBenefitsCaptured / annualFee).toFixed(1);
      templateVars = { total, fee, multiplier };
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
