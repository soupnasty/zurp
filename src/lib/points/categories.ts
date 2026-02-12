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
};

/**
 * 3-tier category classifier for the points engine.
 *
 * Tier 1: Merchant name match (high confidence)
 * Tier 2: Plaid detailed category (medium confidence)
 * Tier 3: Fallback → "other" (low confidence)
 */
export function classifyForPoints(
  merchantName: string | null,
  plaidCategoryPrimary: string | null,
  plaidCategoryDetailed: string | null
): CategoryAssignment {
  // Tier 1: Merchant name lookup
  const normalized = normalizeMerchantName(merchantName);
  if (normalized) {
    const merchantMatch = matchMerchant(normalized);
    if (merchantMatch) {
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

  // Also try primary category as fallback
  if (plaidCategoryPrimary) {
    const mapped = PLAID_CATEGORY_MAP[plaidCategoryPrimary];
    if (mapped) {
      return {
        category: mapped,
        confidence: "medium",
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
