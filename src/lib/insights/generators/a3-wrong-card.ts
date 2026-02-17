import type { InsightCandidate } from "../types";
import type { GeneratorContext } from "./types";
import { getEarnConfig } from "@/lib/points/earn-configs";
import type { EarnConfig, EarnCategory } from "@/lib/points/types";

/**
 * A3: Wrong Card
 * Cross-card insight that compares the user's current card's earn rates
 * against tier-1 alternatives (CSR, CSP, Amex Platinum).
 *
 * Surfaces when another card would earn significantly more for the user's
 * actual spending in a given category (monthly rolling window).
 *
 * Scoped to tier-1 cards only to keep recommendations focused on premium
 * alternatives rather than overwhelming users with 30 options.
 */

/** Tier-1 cards to compare against. */
const TIER1_CARDS = [
  "chase_sapphire_reserve",
  "chase_sapphire_preferred",
  "amex_platinum",
];

/** Minimum extra value (in dollars) to surface an A3 insight. */
const MIN_EXTRA_VALUE = 15;

/** Minimum monthly spend in a category to consider. */
const MIN_CATEGORY_SPEND = 100;

/** Categories worth comparing across cards. */
const COMPARE_CATEGORIES: EarnCategory[] = [
  "dining",
  "groceries",
  "travel_flights",
  "travel_hotels",
  "travel_other",
  "car_rentals",
  "rideshare",
  "transit",
  "gas_stations",
  "streaming",
  "entertainment",
  "fitness",
  "shopping_online",
];

/** Human-readable category labels for templates. */
const CATEGORY_LABELS: Partial<Record<EarnCategory, string>> = {
  dining: "dining",
  groceries: "groceries",
  travel_flights: "flights",
  travel_hotels: "hotels",
  travel_other: "travel",
  car_rentals: "car rentals",
  rideshare: "rideshare",
  transit: "transit",
  gas_stations: "gas",
  streaming: "streaming",
  entertainment: "entertainment",
  fitness: "fitness",
  shopping_online: "online shopping",
};

export function generateA3(ctx: GeneratorContext): InsightCandidate[] {
  const { cardType, pointsData } = ctx;
  if (!pointsData) return [];

  // Don't compare a tier-1 card against itself
  const altCards = TIER1_CARDS.filter((c) => c !== cardType);
  if (altCards.length === 0) return [];

  const userConfig = getEarnConfig(cardType);
  if (!userConfig) return [];

  const insights: InsightCandidate[] = [];
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Track best A3 per category to avoid duplicates
  const bestByCategory = new Map<
    string,
    { insight: InsightCandidate; extraValue: number }
  >();

  for (const altCardId of altCards) {
    const altConfig = getEarnConfig(altCardId);
    if (!altConfig) continue;

    for (const category of COMPARE_CATEGORIES) {
      const catData = pointsData.categories.find((c) => c.category === category);
      if (!catData || catData.spend < MIN_CATEGORY_SPEND) continue;

      const userRate = getBestRate(userConfig, category);
      const altRate = getBestRate(altConfig, category);

      if (altRate <= userRate) continue;

      const extraPoints = Math.round(catData.spend * (altRate - userRate));
      const extraValue = Math.round(
        (extraPoints * pointsData.conservativeCpp) / 100
      );

      if (extraValue < MIN_EXTRA_VALUE) continue;

      const existing = bestByCategory.get(category);
      if (existing && existing.extraValue >= extraValue) continue;

      const label = CATEGORY_LABELS[category] || category;
      const templateKey =
        extraValue >= 50 ? "a3_category_switch_high" : "a3_category_switch";

      const candidate: InsightCandidate = {
        category: "A3",
        benefitId: null,
        templateKey,
        templateVars: {
          category: label,
          spend: Math.round(catData.spend),
          user_rate: userRate,
          alt_rate: altRate,
          alt_card: altConfig.cardName,
          extra_value: extraValue,
        },
        dedupKey: `a3:${cardType}:${category}:${month}`,
        triggeredByTransactionId: null,
        periodStart: null,
        periodEnd: null,
        dollarAmount: extraValue,
        daysRemaining: null,
        actionability: "plan_future",
        confidence: "category_match",
      };

      bestByCategory.set(category, { insight: candidate, extraValue });
    }
  }

  // Emit best A3 per category
  for (const { insight } of bestByCategory.values()) {
    insights.push(insight);
  }

  return insights;
}

/**
 * Find the best non-portal earn rate for a category on a card.
 * Ignores portal-specific and merchant-conditional bonuses
 * (those are handled by P2).
 */
function getBestRate(config: EarnConfig, category: EarnCategory): number {
  let best = config.baseRate;

  for (const bonus of config.bonusCategories) {
    if (!bonus.categories.includes(category)) continue;
    // Skip portal bonuses (P2 handles those)
    if (bonus.categories.includes("travel_portal")) continue;
    // Skip merchant-specific conditions (P2 rideshare handles those)
    if (bonus.conditions?.merchant_match) continue;
    if (bonus.earnRate > best) best = bonus.earnRate;
  }

  return best;
}
