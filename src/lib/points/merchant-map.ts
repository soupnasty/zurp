import type { EarnCategory } from "./types";

export interface MerchantEntry {
  pattern: string;
  matchType: "prefix" | "contains" | "exact";
  category: EarnCategory;
  priority: number;
}

/**
 * Static merchant lookup table (~200 entries).
 * Sorted by priority descending — first match wins.
 * Patterns are matched against normalized (lowercased, trimmed) merchant names.
 */
const MERCHANT_MAP_UNSORTED: MerchantEntry[] = [
  // ── Food Delivery (high-priority disambiguations first) ──
  { pattern: "uber eats", matchType: "prefix", category: "food_delivery", priority: 20 },
  { pattern: "ubereats", matchType: "prefix", category: "food_delivery", priority: 20 },
  { pattern: "doordash", matchType: "prefix", category: "food_delivery", priority: 10 },
  { pattern: "grubhub", matchType: "prefix", category: "food_delivery", priority: 10 },
  { pattern: "postmates", matchType: "prefix", category: "food_delivery", priority: 10 },
  { pattern: "caviar", matchType: "prefix", category: "food_delivery", priority: 10 },
  { pattern: "seamless", matchType: "prefix", category: "food_delivery", priority: 10 },
  { pattern: "gopuff", matchType: "prefix", category: "food_delivery", priority: 10 },

  // ── Rideshare (Uber disambiguation) ──
  { pattern: "uber trip", matchType: "prefix", category: "rideshare", priority: 20 },
  { pattern: "uber bv", matchType: "prefix", category: "rideshare", priority: 15 },
  { pattern: "uber", matchType: "prefix", category: "rideshare", priority: 10 },
  { pattern: "lyft", matchType: "prefix", category: "rideshare", priority: 10 },

  // ── Online Grocery (before generic grocery) ──
  { pattern: "amazon fresh", matchType: "prefix", category: "grocery_online", priority: 20 },
  { pattern: "amazonfresh", matchType: "prefix", category: "grocery_online", priority: 20 },
  { pattern: "instacart", matchType: "prefix", category: "grocery_online", priority: 10 },
  { pattern: "walmart grocery", matchType: "prefix", category: "grocery_online", priority: 15 },
  { pattern: "shipt", matchType: "prefix", category: "grocery_online", priority: 10 },
  { pattern: "freshdirect", matchType: "prefix", category: "grocery_online", priority: 10 },
  { pattern: "peapod", matchType: "prefix", category: "grocery_online", priority: 10 },
  { pattern: "thrive market", matchType: "prefix", category: "grocery_online", priority: 10 },

  // ── Grocery (in-store) ──
  { pattern: "whole foods", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "trader joe", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "kroger", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "safeway", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "albertsons", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "publix", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "aldi", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "costco", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "sam's club", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "heb ", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "wegmans", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "sprouts", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "food lion", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "stop & shop", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "giant food", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "meijer", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "winco", matchType: "prefix", category: "grocery", priority: 10 },
  { pattern: "harris teeter", matchType: "prefix", category: "grocery", priority: 10 },

  // ── Coffee ──
  { pattern: "starbucks", matchType: "prefix", category: "coffee", priority: 10 },
  { pattern: "dunkin", matchType: "prefix", category: "coffee", priority: 10 },
  { pattern: "peet's", matchType: "prefix", category: "coffee", priority: 10 },
  { pattern: "peets", matchType: "prefix", category: "coffee", priority: 10 },
  { pattern: "blue bottle", matchType: "prefix", category: "coffee", priority: 10 },
  { pattern: "philz", matchType: "prefix", category: "coffee", priority: 10 },

  // ── Streaming ──
  { pattern: "netflix", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "spotify", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "hulu", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "disney plus", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "disney+", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "hbo max", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "max ", matchType: "prefix", category: "streaming", priority: 5 },
  { pattern: "paramount+", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "paramount plus", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "peacock", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "apple.com/bill", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "apple music", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "apple tv", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "youtube premium", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "amazon prime", matchType: "contains", category: "streaming", priority: 15 },
  { pattern: "audible", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "nytimes", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "new york times", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "washington post", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "wall street journal", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "wsj", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "sirius", matchType: "prefix", category: "streaming", priority: 10 },
  { pattern: "crunchyroll", matchType: "prefix", category: "streaming", priority: 10 },

  // ── Airlines ──
  { pattern: "united air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "delta air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "american air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "southwest air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "jetblue", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "alaska air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "spirit air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "frontier air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "british air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "air france", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "lufthansa", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "emirates", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "singapore air", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "cathay pacific", matchType: "prefix", category: "travel_flights", priority: 10 },

  // ── Hotels ──
  { pattern: "marriott", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "hilton", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "hyatt", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "ihg", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "intercontinental", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "holiday inn", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "best western", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "wyndham", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "choice hotel", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "airbnb", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "vrbo", matchType: "prefix", category: "travel_hotels", priority: 10 },

  // ── Travel Portal ──
  { pattern: "chase travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "amex travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "citi travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "cititravel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "expedia", matchType: "prefix", category: "travel_portal", priority: 10 },

  // ── Car Rental / Travel Other ──
  { pattern: "hertz", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "enterprise", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "avis", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "national car", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "budget rent", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "turo", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "amtrak", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "carnival cruise", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "royal caribbean", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "norwegian cruise", matchType: "prefix", category: "travel_other", priority: 10 },

  // ── Transit ──
  { pattern: "mta", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "wmata", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "bart", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "cta ", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "metro ", matchType: "prefix", category: "transit", priority: 5 },

  // ── Gas ──
  { pattern: "shell oil", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "shell ", matchType: "prefix", category: "gas", priority: 8 },
  { pattern: "exxon", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "mobil", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "chevron", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "bp ", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "sunoco", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "speedway", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "circle k", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "wawa", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "racetrac", matchType: "prefix", category: "gas", priority: 10 },
  { pattern: "quiktrip", matchType: "prefix", category: "gas", priority: 10 },

  // ── Fitness ──
  { pattern: "peloton", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "equinox", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "classpass", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "planet fitness", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "orangetheory", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "soulcycle", matchType: "prefix", category: "fitness", priority: 10 },

  // ── Events ──
  { pattern: "ticketmaster", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "stubhub", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "axs", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "seatgeek", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "vivid seats", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "eventbrite", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "fandango", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "amc theatre", matchType: "prefix", category: "events", priority: 10 },
  { pattern: "regal cinema", matchType: "prefix", category: "events", priority: 10 },

  // ── Shopping Online (before Amazon generic) ──
  { pattern: "amazon", matchType: "prefix", category: "shopping_online", priority: 5 },
  { pattern: "amzn", matchType: "prefix", category: "shopping_online", priority: 5 },
  { pattern: "ebay", matchType: "prefix", category: "shopping_online", priority: 10 },
  { pattern: "etsy", matchType: "prefix", category: "shopping_online", priority: 10 },
  { pattern: "wayfair", matchType: "prefix", category: "shopping_online", priority: 10 },
  { pattern: "chewy", matchType: "prefix", category: "shopping_online", priority: 10 },

  // ── Shopping In-Store ──
  { pattern: "target", matchType: "prefix", category: "shopping_instore", priority: 5 },
  { pattern: "walmart", matchType: "prefix", category: "shopping_instore", priority: 5 },
  { pattern: "best buy", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "home depot", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "lowes", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "ikea", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "apple store", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "nordstrom", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "tj maxx", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "marshalls", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "ross ", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "cvs", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "walgreens", matchType: "prefix", category: "shopping_instore", priority: 10 },

  // ── Bills & Utilities ──
  { pattern: "verizon", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "at&t", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "t-mobile", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "comcast", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "xfinity", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "spectrum", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "con edison", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "duke energy", matchType: "prefix", category: "bills_utilities", priority: 10 },
  { pattern: "pg&e", matchType: "prefix", category: "bills_utilities", priority: 10 },

  // ── Insurance ──
  { pattern: "geico", matchType: "prefix", category: "insurance", priority: 10 },
  { pattern: "progressive", matchType: "prefix", category: "insurance", priority: 10 },
  { pattern: "state farm", matchType: "prefix", category: "insurance", priority: 10 },
  { pattern: "allstate", matchType: "prefix", category: "insurance", priority: 10 },
];

export const MERCHANT_MAP: MerchantEntry[] = MERCHANT_MAP_UNSORTED.sort(
  (a, b) => b.priority - a.priority
);

/**
 * Match a normalized merchant name against the merchant map.
 * Returns the first matching entry's category, or null.
 */
export function matchMerchant(
  normalizedName: string
): { category: EarnCategory; matchedValue: string } | null {
  if (!normalizedName) return null;

  for (const entry of MERCHANT_MAP) {
    const pattern = entry.pattern;
    let matched = false;

    switch (entry.matchType) {
      case "exact":
        matched = normalizedName === pattern;
        break;
      case "prefix":
        matched = normalizedName.startsWith(pattern);
        break;
      case "contains":
        matched = normalizedName.includes(pattern);
        break;
    }

    if (matched) {
      return { category: entry.category, matchedValue: pattern };
    }
  }

  return null;
}
