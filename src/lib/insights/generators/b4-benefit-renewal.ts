import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * B4: Benefit Renewal Reminder
 * Triggers in the last 7 days of a period for high-value benefits (>= $50/period).
 * Only for benefits that were well-used this period (>= 50% usage).
 * Nudges the user to plan ahead for the next cycle.
 */
export function generateB4(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages } = ctx;
  const insights: InsightCandidate[] = [];

  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.creditAmount < 50) continue; // only high-value benefits worth flagging

    const daysLeft = usage.daysRemaining;
    if (daysLeft > 7 || daysLeft <= 0) continue; // last 7 days only

    const usedPct = usage.amountUsed / usage.creditAmount;
    if (usedPct < 0.5) continue; // skip low-usage (B1 handles those)

    const displayName = usage.displayGroupName || usage.benefitName;
    const templateKey = usage.isFullyUsed ? "b4_maxed_renewing" : "b4_renewing";

    insights.push({
      category: "B4",
      benefitId: usage.benefitId,
      templateKey,
      templateVars: {
        benefit: displayName,
        credit: Math.round(usage.creditAmount),
        days: daysLeft,
        used: Math.round(usage.amountUsed),
      },
      dedupKey: `b4:${usage.benefitId}:${usage.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: usage.cycleStart,
      periodEnd: usage.cycleEnd,
      dollarAmount: Math.round(usage.creditAmount), // value of the renewing benefit
      daysRemaining: daysLeft,
      actionability: "plan_future",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}
