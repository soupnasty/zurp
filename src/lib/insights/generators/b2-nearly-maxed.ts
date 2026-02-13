import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * B2: Nearly Maxed Credit
 * Trigger: used ≥ 75% AND < 100% AND period < 85% elapsed.
 * Handles DoorDash grouping (aggregate sub-credits).
 */
export function generateB2(ctx: GeneratorContext): InsightCandidate[] {
  const { benefitUsages } = ctx;
  const insights: InsightCandidate[] = [];

  // Track already-processed display groups to avoid duplicates
  const processedGroups = new Set<string>();

  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.creditAmount === 0) continue;

    // Handle display groups (DoorDash)
    if (usage.displayGroup) {
      if (processedGroups.has(usage.displayGroup)) continue;
      processedGroups.add(usage.displayGroup);

      // Aggregate all sub-credits in this group
      const groupMembers = benefitUsages.filter(
        (u) => u.displayGroup === usage.displayGroup
      );
      const totalCredit = groupMembers.reduce((s, u) => s + u.creditAmount, 0);
      const totalUsed = groupMembers.reduce((s, u) => s + u.amountUsed, 0);
      const totalRemaining = groupMembers.reduce(
        (s, u) => s + u.amountRemaining,
        0
      );
      const allFullyUsed = groupMembers.every((u) => u.isFullyUsed);

      if (totalCredit === 0 || allFullyUsed) continue;

      const usedPct = totalUsed / totalCredit;
      if (usedPct < 0.75 || usedPct >= 1) continue;

      // Check period progress
      const progress = computeProgress(usage);
      if (progress >= 0.85) continue;

      const displayName = usage.displayGroupName || usage.benefitName;
      const period = cycleToPeriodLabel(usage.cycle);
      const remaining = Math.round(totalRemaining);
      const used = Math.round(totalUsed);
      const max = Math.round(totalCredit);

      const closeThreshold = Math.round(totalCredit * 0.2);
      insights.push({
        category: "B2",
        benefitId: usage.benefitId,
        templateKey: remaining <= closeThreshold ? "b2_close" : "b2_standard",
        templateVars: {
          used,
          max,
          benefit: displayName,
          remaining,
          action_type: "order",
          period,
        },
        dedupKey: `b2:${usage.displayGroup}:${usage.periodKey}`,
        triggeredByTransactionId: null,
        periodStart: usage.cycleStart,
        periodEnd: usage.cycleEnd,
        dollarAmount: remaining,
        daysRemaining: usage.daysRemaining,
        actionability: "switch_platform",
        confidence: "exact_confirmed",
      });
      continue;
    }

    // Non-grouped benefits
    if (usage.isFullyUsed) continue;
    const usedPct = usage.amountUsed / usage.creditAmount;
    if (usedPct < 0.75 || usedPct >= 1) continue;

    const progress = computeProgress(usage);
    if (progress >= 0.85) continue;

    const displayName = usage.displayGroupName || usage.benefitName;
    const period = cycleToPeriodLabel(usage.cycle);
    const remaining = Math.round(usage.amountRemaining);
    const used = Math.round(usage.amountUsed);
    const max = Math.round(usage.creditAmount);

    const closeThreshold = Math.round(usage.creditAmount * 0.2);
    insights.push({
      category: "B2",
      benefitId: usage.benefitId,
      templateKey: remaining <= closeThreshold ? "b2_close" : "b2_standard",
      templateVars: {
        used,
        max,
        benefit: displayName,
        remaining,
        action_type: inferActionType(usage.category),
        period,
      },
      dedupKey: `b2:${usage.benefitId}:${usage.periodKey}`,
      triggeredByTransactionId: null,
      periodStart: usage.cycleStart,
      periodEnd: usage.cycleEnd,
      dollarAmount: remaining,
      daysRemaining: usage.daysRemaining,
      actionability: "switch_platform",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}

function computeProgress(usage: {
  cycleStart: Date;
  cycleEnd: Date;
}): number {
  const start = new Date(usage.cycleStart).getTime();
  const end = new Date(usage.cycleEnd).getTime();
  const total = end - start;
  if (total <= 0) return 1;
  return (Date.now() - start) / total;
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
