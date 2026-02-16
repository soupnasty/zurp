import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * B3: Underused Credit
 * Benefit used > 0 but < 75%.
 *
 * Benefits sharing a displayGroup (e.g. DoorDash $5/$10/$10) are consolidated
 * into a single insight with combined dollar amounts.
 */
export function generateB3(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages } = ctx;
  const insights: InsightCandidate[] = [];

  // Group credit benefits by displayGroup (or benefitId if ungrouped)
  const grouped = new Map<string, typeof benefitUsages>();
  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.creditAmount === 0) continue;
    const key = usage.displayGroup || usage.benefitId;
    const list = grouped.get(key) ?? [];
    list.push(usage);
    grouped.set(key, list);
  }

  for (const [groupKey, members] of grouped) {
    const totalCredit = members.reduce((s, m) => s + m.creditAmount, 0);
    const totalUsed = members.reduce((s, m) => s + m.amountUsed, 0);
    const totalRemaining = Math.round(totalCredit - totalUsed);

    // Must have some usage but not be fully used or >= 75%
    if (totalUsed === 0 || totalRemaining <= 0) continue;
    const usedPct = totalUsed / totalCredit;
    if (usedPct >= 0.75) continue;

    const rep = members[0];
    const displayName = rep.displayGroupName || rep.benefitName;
    const period = cycleToPeriodLabel(rep.cycle);

    // Check if benefit was also underused in prior cycle
    const priorUsage = ctx.priorCycleBenefitUsages?.find(
      (p) => p.benefitId === rep.benefitId
    );
    const wasUnderusedPrior =
      priorUsage && priorUsage.creditAmount > 0 &&
      priorUsage.amountUsed / priorUsage.creditAmount < 0.75;

    const templateKey = wasUnderusedPrior ? "b3_chronic" : "b3_specific";

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
