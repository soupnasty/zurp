import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";
import { groupCreditBenefits, cycleToPeriodLabel, computeCycleProgress } from "./group-utils";

/**
 * B2: Nearly Maxed Credit
 * Trigger: used ≥ 75% AND < 100% AND period < 85% elapsed.
 * Handles DoorDash grouping (aggregate sub-credits).
 */
export function generateB2(ctx: GeneratorContext): InsightCandidate[] {
  const insights: InsightCandidate[] = [];

  for (const group of groupCreditBenefits(ctx.benefitUsages)) {
    const { groupKey, rep, totalCredit, totalUsed, totalRemaining: rawRemaining, allFullyUsed, displayName } = group;

    if (allFullyUsed) continue;

    const usedPct = totalUsed / totalCredit;
    if (usedPct < 0.75 || usedPct >= 1) continue;

    const progress = computeCycleProgress(rep);
    if (progress >= 0.85) continue;

    const period = cycleToPeriodLabel(rep.cycle);
    const remaining = Math.round(rawRemaining);
    const used = Math.round(totalUsed);
    const max = Math.round(totalCredit);

    const closeThreshold = Math.round(totalCredit * 0.2);
    insights.push({
      category: "B2",
      benefitId: rep.benefitId,
      templateKey: remaining <= closeThreshold ? "b2_close" : "b2_standard",
      templateVars: {
        used,
        max,
        benefit: displayName,
        remaining,
        action_type: inferActionType(rep.category),
        period,
      },
      dedupKey: `b2:${groupKey}:${rep.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: rep.cycleStart,
      periodEnd: rep.cycleEnd,
      dollarAmount: remaining,
      daysRemaining: rep.daysRemaining,
      actionability: "switch_platform",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}

function inferActionType(category: string): string {
  switch (category) {
    case "travel":
      return "booking";
    case "dining":
      return "meal";
    case "entertainment":
      return "purchase";
    case "fitness":
      return "session";
    default:
      return "purchase";
  }
}
