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

    const displayName = usage.displayGroupName || usage.benefitName;

    // Check if benefit was also unused in prior cycle
    const priorUsage = ctx.priorCycleBenefitUsages?.find(
      (p) => p.benefitId === usage.benefitId
    );
    const wasUnusedPrior =
      priorUsage && priorUsage.creditAmount > 0 &&
      priorUsage.amountUsed / priorUsage.creditAmount < 0.25;

    // Select template variant based on repeat pattern or urgency
    let templateKey: string;
    if (wasUnusedPrior) {
      templateKey = "b1_repeat_unused";
    } else if (days <= 7) {
      templateKey = "b1_very_late";
    } else if (days <= 30) {
      templateKey = "b1_urgent";
    } else {
      templateKey = "b1_standard";
    }

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

    const period = cycleToPeriodLabel(usage.cycle);

    const templateVars: Record<string, string | number> = {
      benefit: displayName,
      remaining,
      days,
      date: dateStr,
      time_left: timeLeft,
      period,
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

  // B1 variant: unactivated subscription benefits with real value
  for (const usage of benefitUsages) {
    if (usage.type !== "subscription") continue;
    if (usage.creditAmount <= 0) continue;
    if (usage.isActivated) continue;

    // creditAmount meaning depends on cycle:
    // "subscription" cycle → monthly rate, "annual_*" → yearly total
    const isMonthlyRate = usage.cycle === "subscription" || usage.cycle === "monthly";
    const monthly = isMonthlyRate ? usage.creditAmount : usage.creditAmount / 12;
    const annual = isMonthlyRate ? Math.round(usage.creditAmount * 12) : Math.round(usage.creditAmount);

    insights.push({
      category: "B1",
      benefitId: usage.benefitId,
      templateKey: "b1_unactivated_subscription",
      templateVars: {
        benefit: usage.benefitName,
        monthly: monthly.toFixed(2),
        annual,
      },
      dedupKey: `b1:unsub:${usage.benefitId}`,
      triggeredByTransactionId: null,
      periodStart: usage.cycleStart,
      periodEnd: usage.cycleEnd,
      dollarAmount: annual,
      daysRemaining: 365,
      actionability: "one_click",
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
