import { normalizeMerchantName, matchesMerchantPattern } from "@/lib/engine/normalize";

export interface CompetitorEntry {
  /** Patterns to match against normalized merchant name */
  competitorPatterns: string[];
  /** The benefit partner they should use instead */
  benefitPartner: string;
  /** Benefit IDs that the competitor maps to */
  benefitIds: string[];
}

/**
 * Competitor map — more specific patterns listed first.
 * "uber eats" must be checked before "uber" to avoid false positives.
 */
export const COMPETITOR_MAP: CompetitorEntry[] = [
  {
    competitorPatterns: ["ticketmaster", "seatgeek", "vivid seats", "axs"],
    benefitPartner: "StubHub",
    benefitIds: ["csr_stubhub_h1", "csr_stubhub_h2"],
  },
  {
    competitorPatterns: ["uber eats", "grubhub", "postmates"],
    benefitPartner: "DoorDash",
    benefitIds: [
      "csr_doordash_restaurant",
      "csr_doordash_nonrestaurant_1",
      "csr_doordash_nonrestaurant_2",
    ],
  },
  {
    competitorPatterns: ["uber", "taxi", "yellow cab"],
    benefitPartner: "Lyft",
    benefitIds: ["csr_lyft"],
  },
  {
    competitorPatterns: ["spotify", "youtube music", "tidal", "amazon music"],
    benefitPartner: "Apple Music",
    benefitIds: ["csr_apple_music"],
  },
  {
    competitorPatterns: ["netflix", "hulu", "disney+", "max", "paramount+"],
    benefitPartner: "Apple TV+",
    benefitIds: ["csr_apple_tv"],
  },
  {
    competitorPatterns: [
      "hotels.com",
      "expedia",
      "booking.com",
      "marriott",
      "hilton",
      "hyatt",
    ],
    benefitPartner: "The Edit",
    benefitIds: ["csr_edit_h1", "csr_edit_h2"],
  },
  {
    competitorPatterns: ["soulcycle", "equinox", "classpass", "gym"],
    benefitPartner: "Peloton",
    benefitIds: ["csr_peloton"],
  },
];

/**
 * Find the competitor entry that matches a given merchant name.
 * Returns null if no match.
 */
export function findCompetitorMatch(
  merchantName: string | null
): CompetitorEntry | null {
  if (!merchantName) return null;
  const normalized = normalizeMerchantName(merchantName);
  if (!normalized) return null;

  for (const entry of COMPETITOR_MAP) {
    if (matchesMerchantPattern(normalized, entry.competitorPatterns)) {
      return entry;
    }
  }
  return null;
}
