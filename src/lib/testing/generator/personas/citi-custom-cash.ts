import type { Persona } from "../types";

/**
 * Citi Custom Cash — "Dining Focused" Persona
 *
 * Dining is always the top category each billing cycle, maximizing the
 * auto-5% bonus up to $500 cap. Tests recurring category consistency
 * and high transaction frequency in a single category.
 */
export const citiCustomCashDiningFocused: Persona = {
  cardType: "citi_custom_cash",
  personaName: "dining_focused",
  description:
    "User whose top spending category is consistently dining every month. Tests Citi Custom Cash auto-5% top category detection, monthly category concentration, and recurring pattern.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual-anniversary benefits

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 1000,
      variance: 0.15,
      transactionsPerMonth: 20,
      merchantKeys: ["cheesecake_factory", "dunkin", "starbucks", "resy_restaurant"],
    },
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.15,
      transactionsPerMonth: 7,
      merchantKeys: ["whole_foods", "trader_joes", "kroger"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "gas_stations",
      avgAmount: 60,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["shell", "chevron"],
    },
    {
      category: "rideshare",
      avgAmount: 50,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
  ],

  benefitBehavior: [],
  // Citi Custom Cash has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [
    // Test spending that hits $500 cap on 5% category
    {
      type: "near_cap",
      details: {
        category: "dining",
        capAmount: 500,
        description: "Monthly dining spending scaled to approach $500 monthly cap for 5% bonus",
      },
    },
  ],
};

/**
 * Citi Custom Cash — "Rotating Spender" Persona
 *
 * Different top category each month to test dynamic 5% bonus targeting.
 * Tests category rotation and varying monthly spending patterns.
 */
export const citiCustomCashRotatingSpender: Persona = {
  cardType: "citi_custom_cash",
  personaName: "rotating_spender",
  description:
    "User whose top spending category rotates month-to-month (dining some months, online others). Tests Citi Custom Cash adaptability to changing spending patterns and monthly category variance.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["dunkin", "cheesecake_factory", "starbucks"],
    },
    {
      category: "shopping_online",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["amazon_order", "target_store", "best_buy"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.2,
      transactionsPerMonth: 6,
      merchantKeys: ["whole_foods", "kroger", "safeway"],
    },
    {
      category: "gas_stations",
      avgAmount: 100,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["chevron", "shell", "exxon_mobil"],
    },
    {
      category: "travel_flights",
      avgAmount: 200,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines", "southwest_airlines"],
    },
    {
      category: "rideshare",
      avgAmount: 80,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
  ],

  benefitBehavior: [],
  // Citi Custom Cash has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [
    // Test category variance affecting top-category detection month to month
    {
      type: "month_boundary",
      details: {
        merchantKey: "resy_restaurant",
        description: "Transactions at month boundaries to test category reset for auto-5% detection",
      },
    },
  ],
};

export const citiCustomCashPersonas = [
  citiCustomCashDiningFocused,
  citiCustomCashRotatingSpender,
];
