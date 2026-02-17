/**
 * P2 scenario configurations for missed bonus opportunity detection.
 *
 * Dynamically generated from earn configs so new cards automatically
 * produce P2 scenarios without manual maintenance.
 *
 * Two types:
 *   - "portal": Card has a travel_portal bonus > direct booking rate for
 *     hotels, flights, or car rentals. Suggests booking through the portal.
 *   - "rideshare": Card has a merchant_match bonus for a specific rideshare
 *     provider. Suggests switching from competing providers.
 */

import { getAllEarnConfigs } from "@/lib/points/earn-configs";
import type { EarnConfig, EarnCategory } from "@/lib/points/types";

export interface P2Scenario {
  id: string;
  cardTypes: string[];
  type: "rideshare" | "portal";
  merchantPattern?: string;
  spendCategory?: string;
  redirectTo: string;
  bonusRate: number;
  baseRate: number;
  templateKey: string;
}

/** Map card issuer prefix to portal brand name. */
const PORTAL_NAMES: Record<string, string> = {
  chase: "Chase Travel Portal",
  amex: "Amex Travel Portal",
  capital_one: "Capital One Travel Portal",
  citi: "Citi Travel Portal",
  bilt: "Bilt Travel Portal",
  robinhood: "Robinhood Travel Portal",
  wells_fargo: "Wells Fargo Travel Portal",
  us_bank: "US Bank Rewards Center",
};

/** Direct-booking categories that have a portal alternative. */
const PORTAL_REDIRECT_CATEGORIES: EarnCategory[] = [
  "travel_hotels",
  "travel_flights",
  "car_rentals",
];

/** Known rideshare redirect pairs: if a card bonuses merchant X, users of merchant Y should switch. */
const RIDESHARE_REDIRECTS: Record<string, { from: string; to: string }> = {
  lyft: { from: "uber", to: "Lyft" },
  uber: { from: "lyft", to: "Uber" },
};

function getIssuerPrefix(cardId: string): string {
  // Try known prefixes first (longest match)
  const prefixes = Object.keys(PORTAL_NAMES).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (cardId.startsWith(prefix)) return prefix;
  }
  return cardId.split("_")[0];
}

/**
 * Find the best direct earn rate for a category on this card.
 * Ignores portal and merchant-conditional bonuses.
 */
function getDirectRate(config: EarnConfig, category: EarnCategory): number {
  let best = config.baseRate;
  for (const bonus of config.bonusCategories) {
    if (bonus.categories.includes(category) && !bonus.categories.includes("travel_portal")) {
      // Skip merchant-specific conditions (those are portal or rideshare bonuses)
      if (bonus.conditions?.merchant_match) continue;
      if (bonus.earnRate > best) best = bonus.earnRate;
    }
  }
  return best;
}

/**
 * Find the best portal earn rate for a specific travel sub-category.
 * For portal bonuses with merchant_match conditions (like Venture X flights vs hotels),
 * we look at the general portal rate for hotels/car_rental (non-flight portal entries).
 */
function getPortalRate(config: EarnConfig, targetCategory: EarnCategory): number {
  let best = 0;

  for (const bonus of config.bonusCategories) {
    if (!bonus.categories.includes("travel_portal")) continue;

    // If portal bonus has merchant_match conditions, it's flight-specific
    if (bonus.conditions?.merchant_match) {
      // This matches flights through the portal
      if (targetCategory === "travel_flights") {
        if (bonus.earnRate > best) best = bonus.earnRate;
      }
      continue;
    }

    // General portal rate applies to hotels/car_rental (and flights without merchant_match)
    if (bonus.earnRate > best) best = bonus.earnRate;
  }

  return best;
}

function buildPortalScenarios(config: EarnConfig): P2Scenario[] {
  const scenarios: P2Scenario[] = [];
  const issuer = getIssuerPrefix(config.cardId);
  const portalName = PORTAL_NAMES[issuer];
  if (!portalName) return scenarios;

  for (const category of PORTAL_REDIRECT_CATEGORIES) {
    const directRate = getDirectRate(config, category);
    const portalRate = getPortalRate(config, category);

    // Portal must earn meaningfully more (at least 2x more or +3 points)
    if (portalRate <= directRate) continue;
    if (portalRate - directRate < 2) continue;

    scenarios.push({
      id: `${category}_to_${issuer}_portal`,
      cardTypes: [config.cardId],
      type: "portal",
      spendCategory: category,
      redirectTo: portalName,
      bonusRate: portalRate,
      baseRate: directRate,
      templateKey: "p2_portal",
    });
  }

  return scenarios;
}

function buildRideshareScenarios(config: EarnConfig): P2Scenario[] {
  const scenarios: P2Scenario[] = [];

  for (const bonus of config.bonusCategories) {
    if (!bonus.categories.includes("rideshare")) continue;
    if (!bonus.conditions?.merchant_match) continue;

    for (const merchant of bonus.conditions.merchant_match) {
      const redirect = RIDESHARE_REDIRECTS[merchant.toLowerCase()];
      if (!redirect) continue;

      scenarios.push({
        id: `${redirect.from}_to_${merchant}`,
        cardTypes: [config.cardId],
        type: "rideshare",
        merchantPattern: redirect.from,
        redirectTo: redirect.to,
        bonusRate: bonus.earnRate,
        baseRate: config.baseRate,
        templateKey: "p2_rideshare",
      });
    }
  }

  return scenarios;
}

/**
 * Generate all P2 scenarios dynamically from earn configs.
 * Memoized — computed once at module load.
 */
function generateAllScenarios(): P2Scenario[] {
  const configs = getAllEarnConfigs();
  const scenarios: P2Scenario[] = [];

  for (const config of configs) {
    scenarios.push(...buildPortalScenarios(config));
    scenarios.push(...buildRideshareScenarios(config));
  }

  // Consolidate: merge scenarios with same id (different cards) into one entry
  const byId = new Map<string, P2Scenario>();
  for (const s of scenarios) {
    const existing = byId.get(s.id);
    if (existing) {
      // Same scenario for multiple cards — merge card types
      for (const ct of s.cardTypes) {
        if (!existing.cardTypes.includes(ct)) {
          existing.cardTypes.push(ct);
        }
      }
      // Keep the higher bonus rate
      if (s.bonusRate > existing.bonusRate) {
        existing.bonusRate = s.bonusRate;
      }
    } else {
      byId.set(s.id, { ...s });
    }
  }

  return Array.from(byId.values());
}

export const P2_SCENARIOS: P2Scenario[] = generateAllScenarios();
