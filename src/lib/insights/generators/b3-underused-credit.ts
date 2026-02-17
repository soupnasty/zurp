import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";
import { groupCreditBenefits, cycleToPeriodLabel } from "./group-utils";

/**
 * B3: Underused Credit
 * Benefit used > 0 but < 75%.
 *
 * Benefits sharing a displayGroup (e.g. DoorDash $5/$10/$10) are consolidated
 * into a single insight with combined dollar amounts.
 */
export function generateB3(ctx: GeneratorContext): InsightCandidate[] {
  const insights: InsightCandidate[] = [];

  for (const group of groupCreditBenefits(ctx.benefitUsages)) {
    const { groupKey, rep, totalCredit, totalUsed, displayName } = group;
    const totalRemaining = Math.round(totalCredit - totalUsed);

    // Must have some usage but not be fully used or >= 75%
    if (totalUsed === 0 || totalRemaining <= 0) continue;
    const usedPct = totalUsed / totalCredit;
    if (usedPct >= 0.75) continue;

    const period = cycleToPeriodLabel(rep.cycle);

    // Count consecutive underused prior cycles (up to 6)
    const priorUsages = (ctx.priorCycleBenefitUsages ?? [])
      .filter((p) => p.benefitId === rep.benefitId)
      .sort((a, b) => new Date(b.cycleStart).getTime() - new Date(a.cycleStart).getTime());

    let consecutiveUnderused = 0;
    for (const p of priorUsages) {
      if (p.creditAmount > 0 && p.amountUsed / p.creditAmount < 0.75) {
        consecutiveUnderused++;
      } else {
        break;
      }
    }

    let templateKey: string;
    if (consecutiveUnderused >= 3) {
      templateKey = "b3_deep_chronic";
    } else if (consecutiveUnderused >= 1) {
      templateKey = "b3_chronic";
    } else {
      templateKey = "b3_specific";
    }

    insights.push({
      category: "B3",
      benefitId: rep.benefitId,
      templateKey,
      templateVars: {
        benefit: displayName,
        remaining: totalRemaining,
        used: Math.round(totalUsed),
        max: Math.round(totalCredit),
        spent: 0,
        category: rep.category,
        period,
        streak: consecutiveUnderused,
        hint: `You've used $${Math.round(totalUsed)} of $${Math.round(totalCredit)} this ${period}.`,
      },
      dedupKey: `b3:${groupKey}:${rep.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: rep.cycleStart,
      periodEnd: rep.cycleEnd,
      dollarAmount: totalRemaining,
      daysRemaining: rep.daysRemaining,
      actionability: "plan_future",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}
