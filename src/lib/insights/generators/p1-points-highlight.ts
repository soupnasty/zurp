import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";

/**
 * P1: Points Earning Highlight (Group C — Celebrate)
 * Surfaces when a bonus category has earned significant extra value over the base rate.
 * Threshold: extra value >= $50 over what base rate would have earned.
 */
export function generateP1(ctx: GeneratorContext): InsightCandidate[] {
  const { pointsData, cardType } = ctx;
  if (!pointsData || pointsData.categories.length === 0) return [];

  const insights: InsightCandidate[] = [];
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (const cat of pointsData.categories) {
    if (cat.earnRate <= pointsData.baseRate) continue;

    // Calculate extra value over base rate
    const basePoints = Math.round(cat.spend * pointsData.baseRate);
    const extraPoints = cat.points - basePoints;
    if (extraPoints <= 0) continue;

    const extraValue = Math.round(
      (extraPoints * pointsData.conservativeCpp) / 100
    );
    if (extraValue < 50) continue;

    const dedupKey = `p1:${cardType}:${cat.category}:${month}`;
    const templateKey = extraValue >= 200 ? "p1_high_value" : "p1_standard";

    insights.push({
      category: "P1",
      benefitId: null,
      templateKey,
      templateVars: {
        category: cat.category,
        spend: Math.round(cat.spend),
        points: cat.points,
        earn_rate: cat.earnRate,
        extra_value: extraValue,
        base_rate: pointsData.baseRate,
      },
      dedupKey,
      triggeredByTransactionId: null,
      periodStart: null,
      periodEnd: null,
      dollarAmount: extraValue,
      daysRemaining: null,
      actionability: "plan_future",
      confidence: "exact_confirmed",
    });
  }

  return insights;
}
