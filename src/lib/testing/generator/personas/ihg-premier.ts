import type { Persona } from "../types";

/**
 * IHG One Rewards Premier — "IHG Loyalist" Persona
 *
 * Heavy IHG hotel stays at 10x earn rate, maximizes travel spending at 5x
 * (flights, cars, dining), and uses the quadrennial Global Entry credit.
 * Tests high-value card loyalty with premium earning rates.
 */
export const ihgLoyalist: Persona = {
  cardType: "ihg_premier",
  personaName: "ihg_loyalist",
  description:
    "IHG elite member with frequent stays across IHG brands (earning 10x), combined with travel and dining at 5x. Uses Global Entry benefit for convenience.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-02-10",

  monthlySpend: [
    {
      category: "travel_hotels",
      avgAmount: 1000,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["ihg_hotel"],
    },
    {
      category: "travel_flights",
      avgAmount: 500,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["resy_restaurant", "exclusive_dining"],
    },
    {
      category: "car_rentals",
      avgAmount: 250,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["car_rental"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "ihg_global_entry", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "anniversary_boundary",
      details: {
        benefitId: "ihg_global_entry",
        description:
          "Tests quadrennial Global Entry credit availability on anniversary date",
      },
    },
  ],
};

/**
 * IHG One Rewards Premier — "Mixed Traveler" Persona
 *
 * Divides hotel stays between IHG (10x) and other chains (5x earn on travel).
 * Light Global Entry usage. Tests portfolio diversification and lower earning rates.
 */
export const ihgMixedTraveler: Persona = {
  cardType: "ihg_premier",
  personaName: "mixed_traveler",
  description:
    "Flexible traveler who mixes IHG stays (10x) with competing chains like Marriott and Hilton (5x earning). Uses Global Entry occasionally. Tests multi-chain loyalty scenario.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-07-05",

  monthlySpend: [
    {
      category: "travel_hotels",
      avgAmount: 700,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["ihg_hotel", "marriott_hotel", "hilton_hotel"],
    },
    {
      category: "travel_flights",
      avgAmount: 400,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["delta_airlines", "southwest_airlines"],
    },
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "car_rentals",
      avgAmount: 200,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["car_rental"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.2,
      transactionsPerMonth: 7,
      merchantKeys: ["kroger", "safeway"],
    },
  ],

  benefitBehavior: [
    { benefitId: "ihg_global_entry", behavior: "partial_use", targetUsagePercent: 50 },
  ],

  competitorSpend: [],

  edgeCases: [],
};

export const ihgPersonas = [ihgLoyalist, ihgMixedTraveler];
