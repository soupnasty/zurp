import type { Persona } from "../types";

/**
 * Wells Fargo Active Cash — "Maximizer" Persona
 *
 * Very high monthly spend across all categories to test
 * uncapped 2% flat cash back at scale. Tests high-volume earning
 * and ensures unlimited earning potential.
 */
export const wfacMaximizer: Persona = {
  cardType: "wells_fargo_active_cash",
  personaName: "maximizer",
  description:
    "High-spending user who maximizes uncapped 2% cash back on all purchases. Tests Wells Fargo Active Cash's unlimited flat-rate earning potential at high volume.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual-anniversary benefits

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 700,
      variance: 0.2,
      transactionsPerMonth: 18,
      merchantKeys: ["cheesecake_factory", "resy_restaurant", "dunkin", "starbucks"],
    },
    {
      category: "groceries",
      avgAmount: 600,
      variance: 0.15,
      transactionsPerMonth: 12,
      merchantKeys: ["whole_foods", "trader_joes", "kroger", "safeway", "costco"],
    },
    {
      category: "shopping_online",
      avgAmount: 700,
      variance: 0.25,
      transactionsPerMonth: 9,
      merchantKeys: ["amazon_order", "target_store", "best_buy", "walmart_plus"],
    },
    {
      category: "travel_flights",
      avgAmount: 500,
      variance: 0.35,
      transactionsPerMonth: 2,
      merchantKeys: ["united_airlines", "delta_airlines", "southwest_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "hilton_hotel"],
    },
    {
      category: "rideshare",
      avgAmount: 150,
      variance: 0.25,
      transactionsPerMonth: 5,
      merchantKeys: ["uber_ride", "lyft_ride", "blacklane"],
    },
    {
      category: "gas_stations",
      avgAmount: 150,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["chevron", "shell", "exxon_mobil"],
    },
    {
      category: "entertainment",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["best_buy"],
    },
    {
      category: "streaming",
      avgAmount: 50,
      variance: 0,
      transactionsPerMonth: 3,
      merchantKeys: ["netflix", "hulu", "disney_plus", "peacock"],
    },
    {
      category: "fitness",
      avgAmount: 100,
      variance: 0.1,
      transactionsPerMonth: 2,
      merchantKeys: ["equinox", "peloton"],
    },
  ],

  benefitBehavior: [],
  // Wells Fargo Active Cash has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [],
};

/**
 * Wells Fargo Active Cash — "Budget Spender" Persona
 *
 * Low monthly spending across limited categories.
 * Tests the card's value at minimal spend levels with uncapped 2%.
 */
export const wfacBudgetSpender: Persona = {
  cardType: "wells_fargo_active_cash",
  personaName: "budget_spender",
  description:
    "Light spending user who occasionally uses the card. Tests Wells Fargo Active Cash's uncapped 2% value for minimal monthly spend.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 250,
      variance: 0.15,
      transactionsPerMonth: 4,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "dining",
      avgAmount: 150,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["dunkin", "starbucks"],
    },
    {
      category: "rideshare",
      avgAmount: 60,
      variance: 0.25,
      transactionsPerMonth: 2,
      merchantKeys: ["uber_ride", "lyft_ride"],
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
      avgAmount: 40,
      variance: 0.2,
      transactionsPerMonth: 1,
      merchantKeys: ["shell"],
    },
  ],

  benefitBehavior: [],
  // Wells Fargo Active Cash has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [],
};

export const wfacPersonas = [wfacMaximizer, wfacBudgetSpender];
