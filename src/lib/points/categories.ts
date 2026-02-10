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
  FOOD_AND_DRINK_GROCERIES: "grocery",
  SHOPS_SUPERMARKETS_AND_GROCERIES: "grocery",

  // Travel
  TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES: "travel_flights",
  TRAVEL_FLIGHTS: "travel_flights",
  TRAVEL_LODGING: "travel_hotels",
  TRANSPORTATION_CAR_RENTALS: "travel_other",
  TRANSPORTATION_PARKING: "travel_other",
  TRANSPORTATION_TOLLS: "travel_other",
  TRAVEL_CAR_AND_TRUCK_RENTALS: "travel_other",

  // Transit
  TRANSPORTATION_PUBLIC_TRANSIT: "transit",
  TRANSPORTATION_TAXIS_AND_RIDE_SHARES: "rideshare",

  // Gas
  TRANSPORTATION_GAS: "gas",
  TRANSPORTATION_GAS_STATIONS: "gas",

  // Streaming / Entertainment
  ENTERTAINMENT_MUSIC: "streaming",
  ENTERTAINMENT_TV_AND_MOVIES: "streaming",
  ENTERTAINMENT_VIDEO: "streaming",

  // Events
  ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS: "events",
  ENTERTAINMENT_EVENTS: "events",

  // Shopping
  SHOPS_ELECTRONICS: "shopping_instore",
  SHOPS_CLOTHING_AND_ACCESSORIES: "shopping_instore",
  SHOPS_HARDWARE_STORE: "shopping_instore",
  SHOPS_DEPARTMENT_STORES: "shopping_instore",
  SHOPS_DISCOUNT_STORES: "shopping_instore",
  SHOPS_PHARMACIES: "shopping_instore",
  SHOPS_PET_SUPPLIES: "shopping_instore",
  SHOPS_SPORTING_GOODS: "shopping_instore",
  SHOPS_BOOKS_AND_NEWSPAPERS: "shopping_online",
  SHOPS_DIGITAL_PURCHASE: "shopping_online",

  // Fitness
  RECREATION_FITNESS_AND_SPORTS: "fitness",
  PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS: "fitness",

  // Bills
  SERVICE_UTILITIES: "bills_utilities",
  SERVICE_TELECOMMUNICATION_SERVICES: "bills_utilities",
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

// ── Display labels and icons for categories ──

export const EARN_CATEGORY_LABELS: Record<EarnCategory, string> = {
  dining: "Dining",
  grocery: "Groceries",
  grocery_online: "Online Grocery",
  food_delivery: "Food Delivery",
  coffee: "Coffee",
  streaming: "Streaming",
  rideshare: "Rideshare",
  travel_flights: "Flights",
  travel_hotels: "Hotels",
  travel_portal: "Travel Portal",
  travel_other: "Other Travel",
  transit: "Transit",
  gas: "Gas",
  fitness: "Fitness",
  events: "Events",
  shopping_online: "Online Shopping",
  shopping_instore: "In-Store Shopping",
  bills_utilities: "Bills & Utilities",
  insurance: "Insurance",
  other: "Other",
};

export const EARN_CATEGORY_ICONS: Record<EarnCategory, string> = {
  dining: "utensils",
  grocery: "shopping-cart",
  grocery_online: "shopping-basket",
  food_delivery: "truck",
  coffee: "coffee",
  streaming: "tv",
  rideshare: "car",
  travel_flights: "plane",
  travel_hotels: "building",
  travel_portal: "globe",
  travel_other: "map",
  transit: "train-front",
  gas: "fuel",
  fitness: "dumbbell",
  events: "ticket",
  shopping_online: "package",
  shopping_instore: "store",
  bills_utilities: "zap",
  insurance: "shield",
  other: "circle-dot",
};
