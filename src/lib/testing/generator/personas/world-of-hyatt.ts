import type { Persona } from "../types";

/**
 * World of Hyatt — "Brand Loyalist" Persona
 *
 * Heavy Hyatt stays across multiple sub-brands. Tests merchant_match
 * across 23+ Hyatt brand patterns and 4x Hyatt earn rate.
 * Also exercises 2x dining/flights/transit bonus categories.
 */
export const hyattLoyalist: Persona = {
  cardType: "world_of_hyatt",
  personaName: "brand_loyalist",
  description:
    "Hyatt loyalist who stays at Hyatt Regency, Park Hyatt, Hyatt Place, Andaz, and Thompson. Tests merchant_match across Hyatt sub-brands, 4x earn rate, and 2x dining/flights. No tracked statement credits (Free Night Certs are perk-matrix only).",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-04-10",

  monthlySpend: [
    {
      category: "travel_hotels",
      avgAmount: 500,
      variance: 0.5,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.25,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin", "goldbelly"],
    },
    {
      category: "travel_flights",
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines", "southwest_airlines"],
    },
    {
      category: "rideshare",
      avgAmount: 60,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "fitness",
      avgAmount: 50,
      variance: 0.2,
      transactionsPerMonth: 1,
      merchantKeys: ["equinox"],
    },
    {
      category: "groceries",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 5,
      merchantKeys: ["whole_foods", "trader_joes"],
    },
  ],

  // World of Hyatt has no tracked statement credits — all benefits
  // are perk-matrix-only (Free Night Certificates)
  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 4,
      },
    },
    {
      type: "duplicate_merchant",
      details: {
        merchantKey: "hyatt_hotel",
        description:
          "Two Hyatt charges same day, same amount — both should earn 4x",
      },
    },
  ],
};

/**
 * World of Hyatt — "Diversified Traveler" Persona
 *
 * Mixes Hyatt stays with non-Hyatt hotels. Tests that Hyatt
 * merchant_match earns 4x while generic hotels earn 1x base.
 */
export const hyattDiversified: Persona = {
  cardType: "world_of_hyatt",
  personaName: "diversified_traveler",
  description:
    "Traveler who splits between Hyatt and competitor hotels. Tests differential earn rates: 4x for Hyatt merchant_match vs 1x for Marriott/Hilton.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-08-20",

  monthlySpend: [
    {
      category: "travel_hotels",
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["hyatt_hotel"],
    },
    {
      // Non-Hyatt hotels — should earn 1x base, NOT 4x
      category: "travel_hotels",
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["marriott_hotel", "hilton_hotel"],
    },
    {
      category: "dining",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 6,
      merchantKeys: ["cheesecake_factory"],
    },
    {
      category: "travel_flights",
      avgAmount: 200,
      variance: 0.6,
      transactionsPerMonth: 1,
      merchantKeys: ["delta_airlines"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 8,
      },
    },
  ],
};

export const hyattPersonas = [hyattLoyalist, hyattDiversified];
