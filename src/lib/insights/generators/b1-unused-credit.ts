import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";
import { groupCreditBenefits, cycleToPeriodLabel, computeCycleProgress } from "./group-utils";

/**
 * B1: Unused Credit (Time Pressure)
 * Benefit used < 25% AND period elapsed > 50%.
 *
 * Benefits sharing a displayGroup (e.g. DoorDash $5/$10/$10) are consolidated
 * into a single insight with combined dollar amounts.
 */
export function generateB1(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages } = ctx;
  const insights: InsightCandidate[] = [];

  for (const group of groupCreditBenefits(benefitUsages)) {
    const { groupKey, rep, totalCredit, totalUsed, displayName } = group;

    const usedPct = totalUsed / totalCredit;
    if (usedPct >= 0.25) continue;

    const progress = computeCycleProgress(rep);
    if (progress < 0.5) continue;

    const remaining = Math.round(totalCredit - totalUsed);
    const days = rep.daysRemaining;

    // Count consecutive unused prior cycles (up to 6)
    const priorUsages = (ctx.priorCycleBenefitUsages ?? [])
      .filter((p) => p.benefitId === rep.benefitId)
      .sort((a, b) => new Date(b.cycleStart).getTime() - new Date(a.cycleStart).getTime()); // most recent first

    let consecutiveUnused = 0;
    for (const p of priorUsages) {
      if (p.creditAmount > 0 && p.amountUsed / p.creditAmount < 0.25) {
        consecutiveUnused++;
      } else {
        break; // streak broken
      }
    }

    // Select template variant based on streak depth or urgency
    let templateKey: string;
    if (consecutiveUnused >= 3) {
      templateKey = "b1_chronic_unused";
    } else if (consecutiveUnused >= 1) {
      templateKey = "b1_repeat_unused";
    } else if (days <= 7) {
      templateKey = "b1_very_late";
    } else if (days <= 30) {
      templateKey = "b1_urgent";
    } else {
      templateKey = "b1_standard";
    }

    const endDate = new Date(rep.cycleEnd);
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

    const period = cycleToPeriodLabel(rep.cycle);

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
      benefitId: rep.benefitId,
      templateKey,
      templateVars,
      dedupKey: `b1:${groupKey}:${rep.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: rep.cycleStart,
      periodEnd: rep.cycleEnd,
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
