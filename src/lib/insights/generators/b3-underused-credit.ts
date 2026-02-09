import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * B3: Underused Credit
 * Benefit used > 0 but < 75%.
 */
export function generateB3(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages } = ctx;
  const insights: InsightCandidate[] = [];

  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.creditAmount === 0) continue;
    if (usage.amountUsed === 0 || usage.isFullyUsed) continue;

    const usedPct = usage.amountUsed / usage.creditAmount;
    if (usedPct >= 0.75) continue;

    const remaining = Math.round(usage.amountRemaining);
    if (remaining <= 0) continue;

    const displayName = usage.displayGroupName || usage.benefitName;
    const period = cycleToPeriodLabel(usage.cycle);

    insights.push({
      category: "B3",
      benefitId: usage.benefitId,
      templateKey: "b3_specific",
      templateVars: {
        benefit: displayName,
        remaining,
        used: Math.round(usage.amountUsed),
        max: Math.round(usage.creditAmount),
        spent: 0, // filled in by orchestrator if category spend is available
        category: usage.category,
        period,
        hint: `You've used $${Math.round(usage.amountUsed)} of $${Math.round(usage.creditAmount)} this ${period}.`,
      },
      dedupKey: `b3:${usage.benefitId}:${usage.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: usage.cycleStart,
      periodEnd: usage.cycleEnd,
      dollarAmount: remaining,
      daysRemaining: usage.daysRemaining,
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
