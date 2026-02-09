import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * C1: Benefit Maxed
 * Positive reinforcement for fully used benefits.
 */
export function generateC1(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages } = ctx;
  const insights: InsightCandidate[] = [];

  for (const usage of benefitUsages) {
    if (!usage.isFullyUsed) continue;
    if (usage.type !== "credit") continue;
    if (usage.creditAmount === 0) continue;

    const displayName = usage.displayGroupName || usage.benefitName;
    const period = cycleToPeriodLabel(usage.cycle);
    const value = Math.round(usage.creditAmount);

    insights.push({
      category: "C1",
      benefitId: usage.benefitId,
      templateKey: "c1_standard",
      templateVars: {
        benefit: displayName,
        value,
        period,
      },
      dedupKey: `c1:${usage.benefitId}:${usage.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: usage.cycleStart,
      periodEnd: usage.cycleEnd,
      dollarAmount: value,
      daysRemaining: null, // no urgency — celebration
      actionability: "plan_future",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}

function cycleToPeriodLabel(cycle: string): string {
  switch (cycle) {
    case "monthly":
      return "month";
    case "biannual_h1":
      return "half (Jan–Jun)";
    case "biannual_h2":
      return "half (Jul–Dec)";
    case "annual_calendar":
    case "annual_anniversary":
      return "year";
    default:
      return "period";
  }
}
