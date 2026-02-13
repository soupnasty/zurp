import type { BenefitGroup } from "@/lib/benefit-grouping";

export function classifyBenefitStatus(
  b: BenefitGroup
): "captured" | "partial" | "expiring" | "unused" {
  if (b.isFullyUsed) return "captured";
  if (b.totalUsed === 0) return "unused";
  if (b.daysRemaining <= 14 && b.totalRemaining > 0) return "expiring";
  return "partial";
}
