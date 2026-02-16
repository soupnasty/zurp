import type { Persona } from "../types";

/**
 * CFU — "Everyday Spender" Persona
 *
 * Exercises CFU's 1.5x flat base rate (highest non-rotating Chase base),
 * 3x dining/drugstores bonus, and DashPass subscription benefit.
 * Tests daily spending without strategic targeting. No annual fee.
 */
export const cfuEverydaySpender: Persona = {
  cardType: "chase_freedom_unlimited",
  personaName: "everyday_spender",
  description:
    "User who leverages CFU's 1.5x flat base rate for everyday spending while also hitting 3x dining/drugstores. Tests highest base rate Chase card, DashPass subscription, and balanced monthly spending.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual-anniversary benefits

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.2,
      transactionsPerMonth: 12,
      merchantKeys: ["cheesecake_factory", "dunkin", "starbucks"],
    },
    {
      category: "drugstores",
      avgAmount: 100,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["cvs_pharmacy", "walgreens"],
    },
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.15,
      transactionsPerMonth: 8,
      merchantKeys: ["whole_foods", "trader_joes", "kroger"],
    },
    {
      category: "food_delivery",
      avgAmount: 100,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["doordash_order", "uber_eats"],
    },
    {
      category: "rideshare",
      avgAmount: 80,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "streaming",
      avgAmount: 30,
      variance: 0,
      transactionsPerMonth: 3,
      merchantKeys: ["netflix", "hulu", "spotify"],
    },
    {
      category: "gas_stations",
      avgAmount: 80,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["chevron", "shell"],
    },
  ],

  benefitBehavior: [
    // DashPass subscription benefit is not transaction-matchable (skipped by matcher)
  ],

  competitorSpend: [],

  edgeCases: [
    // No fee charge (CFU has $0 annual fee)
  ],
};

/**
 * CFU — "Drugstore User" Persona
 *
 * Heavy drugstore and pharmacy spending to maximize 3x category.
 * Tests drugstore classification and category bonus frequency.
 */
export const cfuDrugstoreUser: Persona = {
  cardType: "chase_freedom_unlimited",
  personaName: "drugstore_user",
  description:
    "Frequent drugstore/pharmacy shopper who maximizes the 3x bonus category. Tests heavy drugstore spending, transaction frequency, and points accumulation from concentrated category.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "drugstores",
      avgAmount: 250,
      variance: 0.25,
      transactionsPerMonth: 10,
      merchantKeys: ["cvs_pharmacy", "walgreens"],
    },
    {
      category: "dining",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 6,
      merchantKeys: ["dunkin", "cheesecake_factory"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.15,
      transactionsPerMonth: 7,
      merchantKeys: ["whole_foods", "safeway", "kroger"],
    },
    {
      category: "shopping_online",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "other",
      avgAmount: 100,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["best_buy", "misc_services"],
    },
  ],

  benefitBehavior: [
    // DashPass subscription benefit is not transaction-matchable (skipped by matcher)
  ],

  competitorSpend: [],

  edgeCases: [],
};

export const cfuPersonas = [cfuEverydaySpender, cfuDrugstoreUser];
