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
  iconType: "lucide";
  iconSlug: string; // Lucide icon name (e.g. "Car", "Bike")
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
  { key: "uber", label: "Uber", description: "Rides, Uber Eats, Uber One", group: "rides_delivery", iconType: "lucide", iconSlug: "Car" },
  { key: "doordash", label: "DoorDash", description: "Food & grocery delivery", group: "rides_delivery", iconType: "lucide", iconSlug: "Bike" },
  { key: "lyft", label: "Lyft", description: "Rideshare", group: "rides_delivery", iconType: "lucide", iconSlug: "Navigation" },
  { key: "instacart", label: "Instacart", description: "Grocery delivery", group: "rides_delivery", iconType: "lucide", iconSlug: "ShoppingBasket" },

  // Dining
  { key: "grubhub", label: "Grubhub", description: "Food delivery & pickup", group: "dining", iconType: "lucide", iconSlug: "UtensilsCrossed" },
  { key: "dunkin", label: "Dunkin'", description: "Coffee & breakfast", group: "dining", iconType: "lucide", iconSlug: "Coffee" },
  { key: "home_chef", label: "Home Chef", description: "Meal kits", group: "dining", iconType: "lucide", iconSlug: "ChefHat" },
  { key: "cheesecake_factory", label: "Cheesecake Factory", description: "Casual dining", group: "dining", iconType: "lucide", iconSlug: "Utensils" },
  { key: "fine_dining", label: "Fine Dining", description: "Resy, Exclusive Tables credits", group: "dining", iconType: "lucide", iconSlug: "Wine" },

  // Streaming
  { key: "disney_plus", label: "Disney+", description: "Disney+, Hulu & ESPN+ bundle", group: "streaming", iconType: "lucide", iconSlug: "Clapperboard" },
  { key: "youtube_premium", label: "YouTube Premium", description: "Premium, TV & Music", group: "streaming", iconType: "lucide", iconSlug: "Play" },
  { key: "peacock", label: "Peacock", description: "NBCUniversal streaming", group: "streaming", iconType: "lucide", iconSlug: "Tv" },
  { key: "paramount_plus", label: "Paramount+", description: "Paramount streaming", group: "streaming", iconType: "lucide", iconSlug: "Tv" },
  { key: "nyt", label: "NYT Digital", description: "New York Times subscription", group: "streaming", iconType: "lucide", iconSlug: "Newspaper" },
  { key: "wsj", label: "WSJ Digital", description: "Wall Street Journal subscription", group: "streaming", iconType: "lucide", iconSlug: "Newspaper" },
  { key: "apple_tv", label: "Apple TV+", description: "Apple streaming", group: "streaming", iconType: "lucide", iconSlug: "MonitorPlay" },
  { key: "apple_music", label: "Apple Music", description: "Music streaming", group: "streaming", iconType: "lucide", iconSlug: "Music" },

  // Entertainment
  { key: "stubhub", label: "StubHub", description: "Concerts, sports, events", group: "entertainment", iconType: "lucide", iconSlug: "Ticket" },
  { key: "peloton", label: "Peloton", description: "Connected fitness", group: "entertainment", iconType: "lucide", iconSlug: "Bike" },
  { key: "equinox", label: "Equinox", description: "Premium gym membership", group: "entertainment", iconType: "lucide", iconSlug: "Dumbbell" },

  // Shopping
  { key: "saks", label: "Saks Fifth Avenue", description: "Luxury retail", group: "shopping", iconType: "lucide", iconSlug: "ShoppingBag" },
  { key: "lululemon", label: "lululemon", description: "Athletic apparel", group: "shopping", iconType: "lucide", iconSlug: "Shirt" },
  { key: "walmart_plus", label: "Walmart+", description: "Free delivery, fuel discounts", group: "shopping", iconType: "lucide", iconSlug: "ShoppingCart" },
  { key: "dell", label: "Dell", description: "Computers & tech", group: "shopping", iconType: "lucide", iconSlug: "Monitor" },
  { key: "adobe", label: "Adobe", description: "Creative Cloud", group: "shopping", iconType: "lucide", iconSlug: "Palette" },

  // Travel
  { key: "travel_portal", label: "Travel Portal Credits", description: "Book flights/hotels through card portal", group: "travel", iconType: "lucide", iconSlug: "Plane" },
  { key: "hotel_portal", label: "Hotel Credits", description: "Portal hotel bookings, FHR, resort credits", group: "travel", iconType: "lucide", iconSlug: "Hotel" },
  { key: "airline_fee", label: "Airline Fee Credits", description: "Baggage, seat upgrades, incidentals", group: "travel", iconType: "lucide", iconSlug: "Luggage" },
  { key: "global_entry", label: "Global Entry / TSA Pre", description: "Trusted traveler programs", group: "travel", iconType: "lucide", iconSlug: "Shield" },
  { key: "hilton_resorts", label: "Hilton Resorts", description: "Hilton property credits", group: "travel", iconType: "lucide", iconSlug: "Building" },
  { key: "blacklane", label: "Blacklane", description: "Premium car service", group: "travel", iconType: "lucide", iconSlug: "Car" },

  // Airlines
  { key: "southwest", label: "Southwest", description: "Southwest travel credits", group: "airlines", iconType: "lucide", iconSlug: "PlaneTakeoff" },
  { key: "united", label: "United", description: "United travel & Instacart", group: "airlines", iconType: "lucide", iconSlug: "Plane" },
  { key: "delta", label: "Delta", description: "Delta flight credits", group: "airlines", iconType: "lucide", iconSlug: "PlaneLanding" },

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
