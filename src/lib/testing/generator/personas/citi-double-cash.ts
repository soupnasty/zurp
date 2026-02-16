import type { Persona } from "../types";

/**
 * Citi Double Cash — "High Volume" Persona
 *
 * Sustained, high monthly spending across all categories to test
 * flat 2% effective rate at scale. Tests uncapped 2% earning
 * on large transaction volumes.
 */
export const citiDoubleCashHighVolume: Persona = {
  cardType: "citi_double_cash",
  personaName: "high_volume",
  description:
    "High-spending user who uses the card for most purchases. Tests Citi Double Cash's uncapped 2% flat rate (1% purchase + 1% payment) at high volume. Net value should always be positive with no fees.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual-anniversary benefits

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.2,
      transactionsPerMonth: 15,
      merchantKeys: ["cheesecake_factory", "dunkin", "starbucks", "resy_restaurant"],
    },
    {
      category: "groceries",
      avgAmount: 500,
      variance: 0.15,
      transactionsPerMonth: 10,
      merchantKeys: ["whole_foods", "trader_joes", "kroger", "safeway"],
    },
    {
      category: "shopping_online",
      avgAmount: 600,
      variance: 0.25,
      transactionsPerMonth: 8,
      merchantKeys: ["amazon_order", "target_store", "best_buy", "walmart_plus"],
    },
    {
      category: "travel_flights",
      avgAmount: 400,
      variance: 0.35,
      transactionsPerMonth: 2,
      merchantKeys: ["united_airlines", "delta_airlines", "southwest_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["generic_hotel", "hyatt_hotel", "marriott_hotel"],
    },
    {
      category: "rideshare",
      avgAmount: 100,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "gas_stations",
      avgAmount: 120,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["chevron", "shell", "exxon_mobil"],
    },
    {
      category: "entertainment",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["best_buy"],
    },
    {
      category: "streaming",
      avgAmount: 40,
      variance: 0,
      transactionsPerMonth: 3,
      merchantKeys: ["netflix", "hulu", "disney_plus"],
    },
  ],

  benefitBehavior: [],
  // Citi Double Cash has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [],
};

/**
 * Citi Double Cash — "Low Volume" Persona
 *
 * Minimal monthly spending with mostly non-bonus categories.
 * Tests the card's value at low volume and ensures even flat-rate
 * cards don't go negative with a $0 annual fee.
 */
export const citiDoubleCashLowVolume: Persona = {
  cardType: "citi_double_cash",
  personaName: "low_volume",
  description:
    "Light spending user who occasionally uses the card. Tests Citi Double Cash at minimal volume to verify low-spend users still get positive value from uncapped 2%.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["dunkin", "starbucks"],
    },
    {
      category: "groceries",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "shopping_online",
      avgAmount: 100,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "gas_stations",
      avgAmount: 50,
      variance: 0.25,
      transactionsPerMonth: 1,
      merchantKeys: ["shell"],
    },
    {
      category: "other",
      avgAmount: 75,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["misc_services", "best_buy"],
    },
  ],

  benefitBehavior: [],
  // Citi Double Cash has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [],
};

export const citiDoubleCashPersonas = [
  citiDoubleCashHighVolume,
  citiDoubleCashLowVolume,
];
