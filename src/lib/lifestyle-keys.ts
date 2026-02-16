/**
 * Lifestyle key taxonomy for benefit assumption mode.
 *
 * Each key represents a brand or service category users can select
 * during onboarding. Benefits across all 30 cards map to these keys
 * via `lifestyleKey` on BenefitDefinition.
 */

export interface LifestyleOption {
  key: string;
  label: string;
  description: string;
  group: LifestyleGroup;
  iconType: "brand" | "lucide";
  iconSlug: string; // brandSlug for Simple Icons CDN, or lucide icon name
}

export type LifestyleGroup =
  | "rides_delivery"
  | "dining"
  | "streaming"
  | "entertainment"
  | "shopping"
  | "travel"
  | "airlines"
  | "memberships";

export interface LifestyleGroupDef {
  key: LifestyleGroup;
  label: string;
  items: LifestyleOption[];
}

// ── All lifestyle options ──

export const LIFESTYLE_OPTIONS: LifestyleOption[] = [
  // Rides & Delivery
  { key: "uber", label: "Uber", description: "Rides, Uber Eats, Uber One", group: "rides_delivery", iconType: "brand", iconSlug: "uber" },
  { key: "doordash", label: "DoorDash", description: "Food & grocery delivery", group: "rides_delivery", iconType: "brand", iconSlug: "doordash" },
  { key: "lyft", label: "Lyft", description: "Rideshare", group: "rides_delivery", iconType: "brand", iconSlug: "lyft" },
  { key: "instacart", label: "Instacart", description: "Grocery delivery", group: "rides_delivery", iconType: "brand", iconSlug: "instacart" },

  // Dining
  { key: "resy", label: "Resy", description: "Fine dining reservations", group: "dining", iconType: "lucide", iconSlug: "UtensilsCrossed" },
  { key: "dunkin", label: "Dunkin'", description: "Coffee & breakfast", group: "dining", iconType: "lucide", iconSlug: "Coffee" },
  { key: "home_chef", label: "Home Chef", description: "Meal kits", group: "dining", iconType: "lucide", iconSlug: "ChefHat" },
  { key: "dining_portal", label: "Dining Experiences", description: "Exclusive Tables, OpenTable", group: "dining", iconType: "lucide", iconSlug: "Utensils" },

  // Streaming
  { key: "streaming", label: "Streaming Services", description: "Disney+, Hulu, Peacock, YouTube, NYT, WSJ", group: "streaming", iconType: "lucide", iconSlug: "Tv" },
  { key: "apple_tv", label: "Apple TV+ & Music", description: "Apple subscriptions", group: "streaming", iconType: "brand", iconSlug: "appletv" },

  // Entertainment
  { key: "stubhub", label: "StubHub", description: "Concerts, sports, events", group: "entertainment", iconType: "brand", iconSlug: "stubhub" },
  { key: "peloton", label: "Peloton", description: "Connected fitness", group: "entertainment", iconType: "brand", iconSlug: "peloton" },
  { key: "equinox", label: "Equinox", description: "Premium gym membership", group: "entertainment", iconType: "lucide", iconSlug: "Dumbbell" },

  // Shopping
  { key: "saks", label: "Saks Fifth Avenue", description: "Luxury retail", group: "shopping", iconType: "lucide", iconSlug: "ShoppingBag" },
  { key: "lululemon", label: "lululemon", description: "Athletic apparel", group: "shopping", iconType: "lucide", iconSlug: "Shirt" },
  { key: "walmart_plus", label: "Walmart+", description: "Free delivery, fuel discounts", group: "shopping", iconType: "lucide", iconSlug: "ShoppingCart" },
  { key: "dell", label: "Dell", description: "Computers & tech", group: "shopping", iconType: "brand", iconSlug: "dell" },
  { key: "adobe", label: "Adobe", description: "Creative Cloud", group: "shopping", iconType: "lucide", iconSlug: "Palette" },

  // Travel
  { key: "travel_portal", label: "Travel Portal Credits", description: "Book flights/hotels through card portal", group: "travel", iconType: "lucide", iconSlug: "Plane" },
  { key: "hotel_portal", label: "Hotel Credits", description: "Portal hotel bookings, FHR, resort credits", group: "travel", iconType: "lucide", iconSlug: "Hotel" },
  { key: "airline_fee", label: "Airline Fee Credits", description: "Baggage, seat upgrades, incidentals", group: "travel", iconType: "lucide", iconSlug: "Luggage" },
  { key: "global_entry", label: "Global Entry / TSA Pre", description: "Trusted traveler programs", group: "travel", iconType: "lucide", iconSlug: "Shield" },
  { key: "hilton_resorts", label: "Hilton Resorts", description: "Hilton property credits", group: "travel", iconType: "lucide", iconSlug: "Building" },
  { key: "blacklane", label: "Blacklane", description: "Premium car service", group: "travel", iconType: "lucide", iconSlug: "Car" },

  // Airlines
  { key: "southwest", label: "Southwest", description: "Southwest travel credits", group: "airlines", iconType: "brand", iconSlug: "southwestairlines" },
  { key: "united", label: "United", description: "United travel & Instacart", group: "airlines", iconType: "brand", iconSlug: "unitedairlines" },
  { key: "delta", label: "Delta", description: "Delta flight credits", group: "airlines", iconType: "brand", iconSlug: "delta" },

  // Memberships
  { key: "clear_plus", label: "CLEAR Plus", description: "Airport security fast lane", group: "memberships", iconType: "lucide", iconSlug: "ScanFace" },
  { key: "oura", label: "Oura Ring", description: "Health tracking ring", group: "memberships", iconType: "lucide", iconSlug: "Watch" },
];

// ── Grouped structure for picker UI ──

const GROUP_LABELS: Record<LifestyleGroup, string> = {
  rides_delivery: "Rides & Delivery",
  dining: "Dining",
  streaming: "Streaming",
  entertainment: "Entertainment & Fitness",
  shopping: "Shopping",
  travel: "Travel",
  airlines: "Airlines",
  memberships: "Memberships",
};

const GROUP_ORDER: LifestyleGroup[] = [
  "rides_delivery",
  "dining",
  "streaming",
  "entertainment",
  "shopping",
  "travel",
  "airlines",
  "memberships",
];

export const LIFESTYLE_GROUPS: LifestyleGroupDef[] = GROUP_ORDER.map((key) => ({
  key,
  label: GROUP_LABELS[key],
  items: LIFESTYLE_OPTIONS.filter((opt) => opt.group === key),
}));

/** Quick lookup: key → option */
export const LIFESTYLE_MAP = new Map(
  LIFESTYLE_OPTIONS.map((opt) => [opt.key, opt])
);
