import { normalizeMerchantName } from "@/lib/engine/normalize";
import { matchMerchant } from "./merchant-map";
import type { EarnCategory, CategoryAssignment } from "./types";

/**
 * Plaid detailed category → EarnCategory mapping.
 * Uses Plaid's personal_finance_category.detailed field.
 */
const PLAID_CATEGORY_MAP: Record<string, EarnCategory> = {
  // Dining
  FOOD_AND_DRINK_RESTAURANTS: "dining",
  FOOD_AND_DRINK_FAST_FOOD: "dining",
  FOOD_AND_DRINK_BAR: "dining",
  FOOD_AND_DRINK_RESTAURANT: "dining",

  // Coffee
  FOOD_AND_DRINK_COFFEE: "coffee",
  FOOD_AND_DRINK_COFFEE_SHOPS: "coffee",

  // Food Delivery / Meal Kits
  FOOD_AND_DRINK_DELIVERY: "food_delivery",

  // Grocery
  FOOD_AND_DRINK_GROCERIES: "groceries",
  SHOPS_SUPERMARKETS_AND_GROCERIES: "groceries",

  // Travel
  TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES: "travel_flights",
  TRAVEL_FLIGHTS: "travel_flights",
  TRAVEL_LODGING: "travel_hotels",
  TRANSPORTATION_CAR_RENTALS: "car_rentals",
  TRANSPORTATION_PARKING: "parking",
  TRANSPORTATION_TOLLS: "parking",
  TRAVEL_CAR_AND_TRUCK_RENTALS: "car_rentals",

  // Transit
  TRANSPORTATION_PUBLIC_TRANSIT: "transit",
  TRANSPORTATION_TAXIS_AND_RIDE_SHARES: "rideshare",

  // Gas
  TRANSPORTATION_GAS: "gas_stations",
  TRANSPORTATION_GAS_STATIONS: "gas_stations",

  // Streaming / Entertainment
  ENTERTAINMENT_MUSIC: "streaming",
  ENTERTAINMENT_TV_AND_MOVIES: "streaming",
  ENTERTAINMENT_VIDEO: "streaming",

  // Entertainment (events, movies, etc.)
  ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS: "entertainment",
  ENTERTAINMENT_EVENTS: "entertainment",
  ENTERTAINMENT_SPORTS: "streaming",

  // Shopping
  SHOPS_ELECTRONICS: "shopping_instore",
  SHOPS_CLOTHING_AND_ACCESSORIES: "shopping_instore",
  SHOPS_HARDWARE_STORE: "home_improvement",
  SHOPS_DEPARTMENT_STORES: "shopping_instore",
  SHOPS_DISCOUNT_STORES: "shopping_instore",
  SHOPS_PHARMACIES: "drugstores",
  SHOPS_PET_SUPPLIES: "shopping_instore",
  SHOPS_SPORTING_GOODS: "shopping_instore",
  SHOPS_BOOKS_AND_NEWSPAPERS: "shopping_online",
  SHOPS_DIGITAL_PURCHASE: "shopping_online",

  // Fitness
  RECREATION_FITNESS_AND_SPORTS: "fitness",
  PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS: "fitness",

  // Bills
  SERVICE_UTILITIES: "bills_utilities",
  SERVICE_TELECOMMUNICATION_SERVICES: "phone_services",
  SERVICE_INTERNET_AND_CABLE: "bills_utilities",

  // Insurance
  SERVICE_INSURANCE: "insurance",
  GENERAL_SERVICES_INSURANCE: "insurance",

  // Modern Plaid taxonomy (personal_finance_category) additions
  FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR: "other", // liquor stores don't earn dining/grocery bonuses
  TRANSPORTATION_BIKES_AND_SCOOTERS: "transit",
  TRAVEL_OTHER_TRAVEL: "travel_other",
  ENTERTAINMENT_CASINOS_AND_GAMBLING: "entertainment",
  ENTERTAINMENT_VIDEO_GAMES: "entertainment",
  ENTERTAINMENT_OTHER_ENTERTAINMENT: "entertainment",
  GENERAL_MERCHANDISE_ONLINE_MARKETPLACES: "shopping_online",
  GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS: "shopping_instore",
  GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES: "shopping_instore",
  GENERAL_MERCHANDISE_CONVENIENCE_STORES: "shopping_instore",
  GENERAL_MERCHANDISE_DEPARTMENT_STORES: "shopping_instore",
  GENERAL_MERCHANDISE_DISCOUNT_STORES: "shopping_instore",
  GENERAL_MERCHANDISE_ELECTRONICS: "shopping_instore",
  GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES: "shopping_instore",
  GENERAL_MERCHANDISE_OFFICE_SUPPLIES: "shopping_instore",
  GENERAL_MERCHANDISE_PET_SUPPLIES: "shopping_instore",
  GENERAL_MERCHANDISE_SPORTING_GOODS: "shopping_instore",
  GENERAL_MERCHANDISE_SUPERSTORES: "shopping_instore",
  HOME_IMPROVEMENT_HARDWARE: "home_improvement",
  RENT_AND_UTILITIES_GAS_AND_ELECTRICITY: "bills_utilities",
  RENT_AND_UTILITIES_WATER: "bills_utilities",
  RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT: "bills_utilities",
  RENT_AND_UTILITIES_INTERNET_AND_CABLE: "bills_utilities",
  RENT_AND_UTILITIES_OTHER_UTILITIES: "bills_utilities",
  RENT_AND_UTILITIES_TELEPHONE: "phone_services",
  RENT_AND_UTILITIES_RENT: "other", // rent is not bonus-eligible spend
};

/**
 * Plaid PRIMARY category → EarnCategory mapping.
 * Coarser than the detailed map — used only when the detailed value is
 * missing or unmapped. Only primaries with an unambiguous earn category
 * are listed; ambiguous ones (TRANSPORTATION spans gas/transit/parking,
 * RENT_AND_UTILITIES includes rent) intentionally fall through to "other".
 */
const PLAID_PRIMARY_MAP: Record<string, EarnCategory> = {
  FOOD_AND_DRINK: "dining",
  TRAVEL: "travel_other",
  ENTERTAINMENT: "entertainment",
  HOME_IMPROVEMENT: "home_improvement",
  // GENERAL_MERCHANDISE handled separately — payment channel decides
  // shopping_online vs shopping_instore.
};

export interface ClassifyContext {
  /** Plaid payment_channel: "online" | "in store" | "other" */
  paymentChannel?: string | null;
  /** Plaid merchant_entity_id — preferred Tier L cache key when present. */
  merchantEntityId?: string | null;
  /** Per-user corrections keyed by normalized merchant name. */
  overrides?: ReadonlyMap<string, EarnCategory>;
  /**
   * Global LLM merchant-classification cache (Tier L), keyed by
   * "ent:<entity id>" or normalized merchant name.
   * See docs/engines/llm-classification-tier.md.
   */
  llmClassifications?: ReadonlyMap<string, EarnCategory>;
}

/**
 * Tiered category classifier for the points engine.
 *
 * Tier 0: User override (high confidence — the user told us)
 * Tier 1: Merchant name match (high confidence). Entries flagged
 *         `deferToPlaid` (Amazon, Walmart, Target) yield to Plaid's
 *         grocery signal so grocery runs aren't binned as shopping.
 * Tier 2: Plaid detailed category (medium confidence)
 * Tier L: Cached LLM merchant classification (medium confidence). A cached
 *         "other" is an abstention and falls through to Tier 2b.
 * Tier 2b: Plaid primary category (low confidence — coarse but real)
 * Tier 3: Fallback → "other" (low confidence)
 */
export function classifyForPoints(
  merchantName: string | null,
  plaidCategoryPrimary: string | null,
  plaidCategoryDetailed: string | null,
  context?: ClassifyContext
): CategoryAssignment {
  const paymentChannel = context?.paymentChannel ?? null;

  const normalized = normalizeMerchantName(merchantName);

  // Tier 0: User override
  if (normalized && context?.overrides) {
    const override = context.overrides.get(normalized);
    if (override) {
      return {
        category: override,
        confidence: "high",
        matchSource: "user_override",
        matchedValue: normalized,
      };
    }
  }

  // Tier 1: Merchant name lookup
  if (normalized) {
    const merchantMatch = matchMerchant(normalized);
    if (merchantMatch) {
      // Ambiguous mega-merchants: when Plaid says this specific purchase
      // was groceries, believe Plaid over the static default.
      if (
        merchantMatch.deferToPlaid &&
        plaidCategoryDetailed === "FOOD_AND_DRINK_GROCERIES"
      ) {
        return {
          category: paymentChannel === "in store" ? "groceries" : "grocery_online",
          confidence: "medium",
          matchSource: "plaid_category",
          matchedValue: plaidCategoryDetailed,
        };
      }
      return {
        category: merchantMatch.category,
        confidence: "high",
        matchSource: "merchant_name",
        matchedValue: merchantMatch.matchedValue,
      };
    }
  }

  // Tier 2: Plaid detailed category
  if (plaidCategoryDetailed) {
    const mapped = PLAID_CATEGORY_MAP[plaidCategoryDetailed];
    if (mapped) {
      return {
        category: mapped,
        confidence: "medium",
        matchSource: "plaid_category",
        matchedValue: plaidCategoryDetailed,
      };
    }
  }

  // Tier L: cached LLM merchant classification
  if (context?.llmClassifications) {
    const keys: string[] = [];
    if (context.merchantEntityId) keys.push(`ent:${context.merchantEntityId}`);
    if (normalized) keys.push(normalized);
    for (const key of keys) {
      const cached = context.llmClassifications.get(key);
      if (cached === undefined) continue;
      if (cached !== "other") {
        return {
          category: cached,
          confidence: "medium",
          matchSource: "llm",
          matchedValue: key,
        };
      }
      // "other" is a recorded abstention — the coarse Plaid primary tier
      // below still gets its shot.
      break;
    }
  }

  // Tier 2b: Plaid primary category — coarse fallback, low confidence
  if (plaidCategoryPrimary) {
    if (plaidCategoryPrimary === "GENERAL_MERCHANDISE") {
      return {
        category:
          paymentChannel === "online" ? "shopping_online" : "shopping_instore",
        confidence: "low",
        matchSource: "plaid_category",
        matchedValue: plaidCategoryPrimary,
      };
    }
    const mapped = PLAID_PRIMARY_MAP[plaidCategoryPrimary];
    if (mapped) {
      return {
        category: mapped,
        confidence: "low",
        matchSource: "plaid_category",
        matchedValue: plaidCategoryPrimary,
      };
    }
  }

  // Tier 3: Fallback
  return {
    category: "other",
    confidence: "low",
    matchSource: "fallback",
    matchedValue: null,
  };
}

// Re-export display labels and icons from shared module (no server-only)
export { EARN_CATEGORY_LABELS, EARN_CATEGORY_ICONS } from "./category-labels";
