import type { EarnCategory } from "./types";

export interface MerchantEntry {
  pattern: string;
  matchType: "prefix" | "contains" | "exact";
  category: EarnCategory;
  priority: number;
  /**
   * Ambiguous mega-merchants (Amazon, Walmart, Target): the category here
   * is the default, but the classifier yields to Plaid's grocery signal
   * for the specific transaction (per points-engine.md §4.3).
   */
  deferToPlaid?: boolean;
  /**
   * Disable the word-boundary guard for this entry (for deliberately
   * truncated patterns like "capitalonetrave").
   */
  noBoundary?: boolean;
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
  { pattern: "home chef", matchType: "prefix", category: "food_delivery", priority: 10 },
  { pattern: "homechef", matchType: "prefix", category: "food_delivery", priority: 10 },

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

  // ── Wholesale Clubs (before generic grocery — Amex Gold excludes these) ──
  { pattern: "costco", matchType: "prefix", category: "wholesale_clubs", priority: 15 },
  { pattern: "sam's club", matchType: "prefix", category: "wholesale_clubs", priority: 15 },

  // ── Grocery (in-store) ──
  { pattern: "whole foods", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "trader joe", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "kroger", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "safeway", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "albertsons", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "publix", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "aldi", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "heb", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "h-e-b", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "wegmans", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "sprouts", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "food lion", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "stop & shop", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "giant food", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "meijer", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "winco", matchType: "prefix", category: "groceries", priority: 10 },
  { pattern: "harris teeter", matchType: "prefix", category: "groceries", priority: 10 },

  // ── Dining — national chains ──
  { pattern: "chipotle", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "mcdonald", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "burger king", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "wendy's", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "wendys", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "taco bell", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "chick-fil-a", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "chickfila", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "chick fil a", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "panera", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "subway", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "five guys", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "shake shack", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "in-n-out", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "in n out", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "popeyes", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "kfc", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "panda express", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "olive garden", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "applebee", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "chili's", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "chilis", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "outback steakhouse", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "texas roadhouse", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "cheesecake factory", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "buffalo wild wings", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "domino's", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "dominos", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "pizza hut", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "papa john", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "little caesar", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "sweetgreen", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "cava", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "qdoba", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "jimmy john", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "jersey mike", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "raising cane", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "sonic drive", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "dairy queen", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "ihop", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "denny's", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "dennys", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "waffle house", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "red lobster", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "wingstop", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "jack in the box", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "arby's", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "arbys", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "culver's", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "culvers", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "whataburger", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "zaxby", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "bojangles", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "el pollo loco", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "firehouse subs", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "wing zone", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "noodles & company", matchType: "prefix", category: "dining", priority: 10 },
  { pattern: "crumbl", matchType: "prefix", category: "dining", priority: 10 },

  // ── Dining — generic descriptor words (long-tail independents).
  //    Low priority: any named chain or disambiguation outranks these. ──
  { pattern: "restaurant", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "pizzeria", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "pizza", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "taqueria", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "cantina", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "bistro", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "diner", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "steakhouse", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "sushi", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "ramen", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "brewery", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "brewpub", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "taproom", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "tavern", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "grill", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "bakery", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "bagel", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "deli", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "bbq", matchType: "contains", category: "dining", priority: 3 },
  { pattern: "barbecue", matchType: "contains", category: "dining", priority: 3 },

  // ── Coffee ──
  { pattern: "starbucks", matchType: "prefix", category: "coffee", priority: 10 },
  { pattern: "dutch bros", matchType: "prefix", category: "coffee", priority: 10 },
  { pattern: "coffee", matchType: "contains", category: "coffee", priority: 3 },
  { pattern: "espresso", matchType: "contains", category: "coffee", priority: 3 },
  { pattern: "roasters", matchType: "contains", category: "coffee", priority: 3 },
  { pattern: "roasting", matchType: "contains", category: "coffee", priority: 3 },
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
  // Exact only: "max" as a prefix would claim "max's deli" etc.
  { pattern: "max", matchType: "exact", category: "streaming", priority: 5 },
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
  { pattern: "espn", matchType: "prefix", category: "streaming", priority: 10 },

  // ── Airlines ──
  { pattern: "united air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "delta air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "american air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "southwest air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "jetblue", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "alaska air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "spirit air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "frontier air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "british air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "air france", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "lufthansa", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "emirates", matchType: "prefix", category: "travel_flights", priority: 10 },
  { pattern: "singapore air", matchType: "prefix", category: "travel_flights", priority: 10, noBoundary: true },
  { pattern: "cathay pacific", matchType: "prefix", category: "travel_flights", priority: 10 },

  // ── Hotels ──
  { pattern: "marriott", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "hilton", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "conrad", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "canopy", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "curio", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "doubletree", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "embassy suites", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "hampton", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "hilton garden inn", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "home2 suites", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "homewood suites", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "lxr", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "motto", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "signia", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "tru", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "waldorf astoria", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "tapestry collection", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "yoko", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "hyatt", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "ihg", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "intercontinental", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "voco", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "ruby hotel", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "hualuxe", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "iberostar", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "holiday inn express", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "holiday inn club", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "garner hotel", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "avid hotel", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "holiday inn", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "best western", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "wyndham", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "choice hotel", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "booking.com", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "airbnb", matchType: "prefix", category: "travel_hotels", priority: 10 },
  { pattern: "vrbo", matchType: "prefix", category: "travel_hotels", priority: 10 },

  // ── Travel Portal ──
  { pattern: "chase travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "ultimate rewards travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "chase ultimate rewards", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "amex travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "citi travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "cititravel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "capital one travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "capitalonetrave", matchType: "prefix", category: "travel_portal", priority: 10, noBoundary: true },
  { pattern: "robinhood travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "bilt travel", matchType: "prefix", category: "travel_portal", priority: 10 },
  { pattern: "expedia", matchType: "prefix", category: "travel_portal", priority: 10 },

  // ── Car Rentals ──
  { pattern: "hertz", matchType: "prefix", category: "car_rentals", priority: 10 },
  { pattern: "enterprise", matchType: "prefix", category: "car_rentals", priority: 10 },
  { pattern: "avis", matchType: "prefix", category: "car_rentals", priority: 10 },
  { pattern: "national car", matchType: "prefix", category: "car_rentals", priority: 10 },
  { pattern: "budget rent", matchType: "prefix", category: "car_rentals", priority: 10 },
  { pattern: "turo", matchType: "prefix", category: "car_rentals", priority: 10 },

  // ── Travel Other (cruises, rail, etc.) ──
  { pattern: "amtrak", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "carnival cruise", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "royal caribbean", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "norwegian cruise", matchType: "prefix", category: "travel_other", priority: 10 },
  { pattern: "cruise line", matchType: "contains", category: "travel_other", priority: 5 },

  // ── Transit ──
  { pattern: "mta", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "wmata", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "bart", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "cta", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "metro", matchType: "prefix", category: "transit", priority: 5 },
  { pattern: "mbta", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "septa", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "nj transit", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "caltrain", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "sfmta", matchType: "prefix", category: "transit", priority: 10 },
  { pattern: "metra", matchType: "prefix", category: "transit", priority: 10 },

  // ── Parking ──
  { pattern: "parkmobile", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "spothero", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "paybyphone", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "parkwhiz", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "laz parking", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "sp plus", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "impark", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "ace parking", matchType: "prefix", category: "parking", priority: 10 },
  { pattern: "parking", matchType: "contains", category: "parking", priority: 3 },
  { pattern: "garage", matchType: "contains", category: "parking", priority: 2 },

  // ── Gas Stations ──
  { pattern: "shell oil", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "shell", matchType: "prefix", category: "gas_stations", priority: 8 },
  { pattern: "exxon", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "mobil", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "chevron", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "bp", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "valero", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "phillips 66", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "conoco", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "texaco", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "arco", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "sheetz", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "casey's", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "caseys", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "buc-ee", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "sunoco", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "speedway", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "circle k", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "wawa", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "racetrac", matchType: "prefix", category: "gas_stations", priority: 10 },
  { pattern: "quiktrip", matchType: "prefix", category: "gas_stations", priority: 10 },

  // ── Fitness ──
  { pattern: "peloton", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "equinox", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "classpass", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "planet fitness", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "orangetheory", matchType: "prefix", category: "fitness", priority: 10 },
  { pattern: "soulcycle", matchType: "prefix", category: "fitness", priority: 10 },

  // ── Entertainment ──
  { pattern: "ticketmaster", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "stubhub", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "live nation", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "viagogo", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "axs", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "seatgeek", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "vivid seats", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "eventbrite", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "fandango", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "amc theatre", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "regal cinema", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "chaan thai massage", matchType: "prefix", category: "entertainment", priority: 10 },
  { pattern: "king spa", matchType: "prefix", category: "entertainment", priority: 10 },

  // ── Shopping Online (before Amazon generic) ──
  { pattern: "amazon", matchType: "prefix", category: "shopping_online", priority: 5, deferToPlaid: true },
  { pattern: "amzn", matchType: "prefix", category: "shopping_online", priority: 5, deferToPlaid: true },
  { pattern: "ebay", matchType: "prefix", category: "shopping_online", priority: 10 },
  { pattern: "etsy", matchType: "prefix", category: "shopping_online", priority: 10 },
  { pattern: "wayfair", matchType: "prefix", category: "shopping_online", priority: 10 },
  { pattern: "chewy", matchType: "prefix", category: "shopping_online", priority: 10 },
  { pattern: "supermaven", matchType: "prefix", category: "shopping_online", priority: 10 },

  // ── Drugstores ──
  { pattern: "cvs", matchType: "prefix", category: "drugstores", priority: 10 },
  { pattern: "walgreens", matchType: "prefix", category: "drugstores", priority: 10 },

  // ── Home Improvement ──
  { pattern: "home depot", matchType: "prefix", category: "home_improvement", priority: 10 },
  { pattern: "lowes", matchType: "prefix", category: "home_improvement", priority: 10 },
  { pattern: "ikea", matchType: "prefix", category: "home_improvement", priority: 10 },

  // ── Shopping In-Store ──
  { pattern: "target", matchType: "prefix", category: "shopping_instore", priority: 5, deferToPlaid: true },
  { pattern: "walmart", matchType: "prefix", category: "shopping_instore", priority: 5, deferToPlaid: true },
  { pattern: "wal-mart", matchType: "prefix", category: "shopping_instore", priority: 5, deferToPlaid: true },
  { pattern: "best buy", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "nordstrom", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "tj maxx", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "marshalls", matchType: "prefix", category: "shopping_instore", priority: 10 },
  { pattern: "ross", matchType: "prefix", category: "shopping_instore", priority: 10 },

  // ── Apple (merchant match for Apple Card 3%) ──
  { pattern: "apple.com", matchType: "contains", category: "shopping_online", priority: 15 },
  { pattern: "apple store", matchType: "prefix", category: "shopping_instore", priority: 15 },

  // ── Phone Services ──
  { pattern: "verizon", matchType: "prefix", category: "phone_services", priority: 10 },
  { pattern: "at&t", matchType: "prefix", category: "phone_services", priority: 10 },
  { pattern: "t-mobile", matchType: "prefix", category: "phone_services", priority: 10 },

  // ── Bills & Utilities ──
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

export const MERCHANT_MAP: MerchantEntry[] = [...MERCHANT_MAP_UNSORTED].sort(
  (a, b) => b.priority - a.priority
);

/**
 * Word characters for boundary checks. Apostrophe is a boundary so stem
 * patterns match possessive brand names ("mcdonald" → "mcdonald's",
 * "trader joe" → "trader joe's").
 */
const WORD_CHAR = /[a-z0-9]/;

function boundaryAt(name: string, index: number): boolean {
  return index < 0 || index >= name.length || !WORD_CHAR.test(name[index]);
}

/**
 * Match a normalized merchant name against the merchant map.
 * Returns the first matching entry, or null.
 *
 * Prefix/contains matches require a word boundary at the pattern edges
 * (unless the entry opts out or the pattern edge is already a non-word
 * char) so short patterns like "tru" or "bp" can't match "truckee" or
 * "bpretty".
 */
export function matchMerchant(
  normalizedName: string
): { category: EarnCategory; matchedValue: string; deferToPlaid: boolean } | null {
  if (!normalizedName) return null;

  for (const entry of MERCHANT_MAP) {
    const pattern = entry.pattern;
    let matched = false;

    // The boundary guard only applies at edges where the pattern itself
    // ends in a word char (a pattern ending in "+" or "/" carries its own
    // boundary).
    const guardEnd = !entry.noBoundary && WORD_CHAR.test(pattern[pattern.length - 1]);
    const guardStart = !entry.noBoundary && WORD_CHAR.test(pattern[0]);

    switch (entry.matchType) {
      case "exact":
        matched = normalizedName === pattern;
        break;
      case "prefix":
        matched =
          normalizedName.startsWith(pattern) &&
          (!guardEnd || boundaryAt(normalizedName, pattern.length));
        break;
      case "contains": {
        let from = 0;
        while (!matched) {
          const idx = normalizedName.indexOf(pattern, from);
          if (idx === -1) break;
          matched =
            (!guardStart || boundaryAt(normalizedName, idx - 1)) &&
            (!guardEnd || boundaryAt(normalizedName, idx + pattern.length));
          from = idx + 1;
        }
        break;
      }
    }

    if (matched) {
      return {
        category: entry.category,
        matchedValue: pattern,
        deferToPlaid: entry.deferToPlaid ?? false,
      };
    }
  }

  return null;
}
