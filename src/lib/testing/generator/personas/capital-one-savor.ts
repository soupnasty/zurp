import type { Persona } from "../types";

/**
 * Capital One SavorOne — "Entertainment Buff" Persona
 *
 * Maximizes 8x Capital One Entertainment portal and 3x dining/entertainment/streaming.
 * Uses the $100 first-year travel credit and tests entertainment category spending.
 */
export const savorEntertainmentBuff: Persona = {
  cardType: "capital_one_savor",
  personaName: "entertainment_buff",
  description:
    "Entertainment enthusiast who spends heavily on dining, streaming services, and entertainment. Uses Capital One Entertainment portal for event bookings and leverages the $100 first-year travel credit.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-04-10",

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.3,
      transactionsPerMonth: 12,
      merchantKeys: ["resy_restaurant", "cheesecake_factory", "dunkin"],
    },
    {
      category: "streaming",
      avgAmount: 80,
      variance: 0,
      transactionsPerMonth: 5,
      merchantKeys: ["hulu", "netflix", "peacock", "paramount_plus", "espn_plus"],
    },
    {
      category: "entertainment",
      avgAmount: 250,
      variance: 0.5,
      transactionsPerMonth: 3,
      merchantKeys: ["entertainment"],
    },
    {
      category: "travel_portal",
      avgAmount: 400,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["capital_one_travel"],
    },
    {
      category: "travel_flights",
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [],
};

/**
 * Capital One SavorOne — "Grocery Optimizer" Persona
 *
 * Focuses on 3x earn rate for groceries and streaming/entertainment.
 * Tests category-specific earn rate optimization without portal usage.
 */
export const savorGroceryOptimizer: Persona = {
  cardType: "capital_one_savor",
  personaName: "grocery_optimizer",
  description:
    "Budget-conscious shopper who maximizes 3x on groceries, streaming, and entertainment while minimizing portal spending. Uses the $100 first-year travel credit sparingly.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-07-20",

  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 500,
      variance: 0.2,
      transactionsPerMonth: 10,
      merchantKeys: ["whole_foods", "trader_joes", "kroger"],
    },
    {
      category: "streaming",
      avgAmount: 60,
      variance: 0,
      transactionsPerMonth: 4,
      merchantKeys: ["hulu", "netflix", "disney_plus"],
    },
    {
      category: "entertainment",
      avgAmount: 150,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["entertainment"],
    },
    {
      category: "dining",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["cheesecake_factory", "starbucks"],
    },
    {
      category: "shopping_online",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [],
};

export const savorPersonas = [savorEntertainmentBuff, savorGroceryOptimizer];
