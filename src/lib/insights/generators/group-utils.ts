/**
 * Shared utilities for insight generators.
 * Consolidates display group aggregation and cycle label logic
 * that was previously duplicated across B1, B2, B3, C1.
 */

import type { BenefitUsageSummary } from "@/lib/types";

/** Grouped benefit members keyed by displayGroup or benefitId. */
export interface GroupedBenefits {
  groupKey: string;
  members: BenefitUsageSummary[];
  /** Representative member (first in group) for cycle bounds, display name, etc. */
  rep: BenefitUsageSummary;
  totalCredit: number;
  totalUsed: number;
  totalRemaining: number;
  allFullyUsed: boolean;
  displayName: string;
}

/**
 * Group credit-type benefit usages by displayGroup (or benefitId if ungrouped).
 * Aggregates dollar amounts across sub-credits (e.g. DoorDash $5/$10/$10).
 */
export function groupCreditBenefits(
  benefitUsages: BenefitUsageSummary[]
): GroupedBenefits[] {
  const grouped = new Map<string, BenefitUsageSummary[]>();

  for (const usage of benefitUsages) {
    if (usage.type !== "credit") continue;
    if (usage.creditAmount === 0) continue;
    const key = usage.displayGroup || usage.benefitId;
    const list = grouped.get(key) ?? [];
    list.push(usage);
    grouped.set(key, list);
  }

  const results: GroupedBenefits[] = [];
  for (const [groupKey, members] of grouped) {
    const rep = members[0];
    const totalCredit = members.reduce((s, m) => s + m.creditAmount, 0);
    const totalUsed = members.reduce((s, m) => s + m.amountUsed, 0);
    const totalRemaining = members.reduce((s, m) => s + m.amountRemaining, 0);
    const allFullyUsed = members.every((m) => m.isFullyUsed);
    const displayName = rep.displayGroupName || rep.benefitName;

    results.push({
      groupKey,
      members,
      rep,
      totalCredit,
      totalUsed,
      totalRemaining,
      allFullyUsed,
      displayName,
    });
  }

  return results;
}

/**
 * Convert a cycle type to a human-readable period label.
 */
export function cycleToPeriodLabel(cycle: string): string {
  switch (cycle) {
    case "monthly":
      return "month";
    case "biannual_h1":
      return "half (Jan–Jun)";
    case "biannual_h2":
      return "half (Jul–Dec)";
    case "quarterly_q1":
      return "quarter (Jan–Mar)";
    case "quarterly_q2":
      return "quarter (Apr–Jun)";
    case "quarterly_q3":
      return "quarter (Jul–Sep)";
    case "quarterly_q4":
      return "quarter (Oct–Dec)";
    case "annual_calendar":
    case "annual_anniversary":
      return "year";
    default:
      return "period";
  }
}

/**
 * Compute cycle progress (0..1) for a benefit usage.
 */
export function computeCycleProgress(usage: {
  cycleStart: Date;
  cycleEnd: Date;
}): number {
  const start = new Date(usage.cycleStart).getTime();
  const end = new Date(usage.cycleEnd).getTime();
  const total = end - start;
  if (total <= 0) return 1;
  return (Date.now() - start) / total;
}
