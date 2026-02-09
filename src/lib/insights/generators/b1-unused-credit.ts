import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * B1: Unused Credit (Time Pressure)
 * Benefit used < 25% AND period elapsed > 50%.
 */
export function generateB1(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages } = ctx;
  const insights: InsightCandidate[] = [];

  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.creditAmount === 0) continue;

    const usedPct = usage.amountUsed / usage.creditAmount;
    if (usedPct >= 0.25) continue;

    // Calculate period progress
    const cycleStart = new Date(usage.cycleStart).getTime();
    const cycleEnd = new Date(usage.cycleEnd).getTime();
    const now = Date.now();
    const totalDuration = cycleEnd - cycleStart;
    const elapsed = now - cycleStart;
    const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

    if (progress < 0.5) continue;

    const remaining = Math.round(usage.amountRemaining);
    const days = usage.daysRemaining;

    // Select template variant based on urgency
    let templateKey: string;
    if (days <= 7) {
      templateKey = "b1_very_late";
    } else if (days <= 30) {
      templateKey = "b1_urgent";
    } else {
      templateKey = "b1_standard";
    }

    const displayName = usage.displayGroupName || usage.benefitName;

    const endDate = new Date(usage.cycleEnd);
    const dateStr = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const timeLeft =
      days <= 7
        ? `${days} days`
        : days <= 30
          ? `${days} days`
          : `${Math.ceil(days / 30)} months`;

    const templateVars: Record<string, string | number> = {
      benefit: displayName,
      remaining,
      days,
      date: dateStr,
      time_left: timeLeft,
    };

    insights.push({
      category: "B1",
      benefitId: usage.benefitId,
      templateKey,
      templateVars,
      dedupKey: `b1:${usage.benefitId}:${usage.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: usage.cycleStart,
      periodEnd: usage.cycleEnd,
      dollarAmount: remaining,
      daysRemaining: days,
      actionability: "plan_future",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}
