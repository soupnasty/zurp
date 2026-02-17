import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";
import { groupCreditBenefits, cycleToPeriodLabel } from "./group-utils";

/**
 * C1: Benefit Maxed
 * Positive reinforcement for fully used benefits.
 *
 * Benefits sharing a displayGroup (e.g. DoorDash $5/$10/$10) are consolidated
 * into a single insight — only fires when ALL sub-credits are maxed.
 */
export function generateC1(ctx: GeneratorContext): InsightCandidate[] {
  const insights: InsightCandidate[] = [];

  for (const group of groupCreditBenefits(ctx.benefitUsages)) {
    if (!group.allFullyUsed) continue;

    const { rep, groupKey, displayName, totalCredit } = group;
    const period = cycleToPeriodLabel(rep.cycle);
    const value = Math.round(totalCredit);

    insights.push({
      category: "C1",
      benefitId: rep.benefitId,
      templateKey: "c1_standard",
      templateVars: {
        benefit: displayName,
        value,
        period,
      },
      dedupKey: `c1:${groupKey}:${rep.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: rep.cycleStart,
      periodEnd: rep.cycleEnd,
      dollarAmount: value,
      daysRemaining: null,
      actionability: "plan_future",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}
