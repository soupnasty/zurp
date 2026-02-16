import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * C1: Benefit Maxed
 * Positive reinforcement for fully used benefits.
 *
 * Benefits sharing a displayGroup (e.g. DoorDash $5/$10/$10) are consolidated
 * into a single insight — only fires when ALL sub-credits are maxed.
 */
export function generateC1(ctx: GeneratorContext): InsightCandidate[] {
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
    // All members must be fully used
    if (!members.every((m) => m.isFullyUsed)) continue;

    const rep = members[0];
    const totalCredit = members.reduce((s, m) => s + m.creditAmount, 0);
    const displayName = rep.displayGroupName || rep.benefitName;
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
