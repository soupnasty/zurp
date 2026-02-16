import type { Persona } from "../types";

/**
 * ABCE — "Balanced Spender" Persona
 *
 * Uses all three 3% categories (supermarkets, gas, online retail) evenly.
 * Tests balanced distribution across capped categories and Disney Bundle benefit.
 * First cash_back currency card in the system.
 */
export const abceBalancedSpender: Persona = {
  cardType: "amex_blue_cash_everyday",
  personaName: "balanced_spender",
  description:
    "User who distributes spending evenly across all three 3% categories (supermarkets, gas, online retail), hitting each category cap proportionally. Tests cash-back currency, all three capped categories, and Disney Bundle benefit.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual-anniversary benefits

  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 500,
      variance: 0.15,
      transactionsPerMonth: 8,
      merchantKeys: ["whole_foods", "trader_joes", "safeway", "kroger"],
    },
    {
      category: "gas_stations",
      avgAmount: 500,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["chevron", "shell", "exxon_mobil"],
    },
    {
      category: "shopping_online",
      avgAmount: 500,
      variance: 0.25,
      transactionsPerMonth: 5,
      merchantKeys: ["amazon_order", "target_store", "walmart_plus"],
    },
    {
      category: "dining",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 6,
      merchantKeys: ["dunkin", "cheesecake_factory", "starbucks"],
    },
    {
      category: "rideshare",
      avgAmount: 60,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "streaming",
      avgAmount: 40,
      variance: 0,
      transactionsPerMonth: 2,
      merchantKeys: ["disney_plus", "netflix", "hulu"],
    },
  ],

  benefitBehavior: [
    // Disney Bundle: $7/mo credit
    { benefitId: "bce_disney_bundle", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    // Test spending that approaches $6K cap on groceries
    {
      type: "near_cap",
      details: {
        category: "groceries",
        capAmount: 6000,
        description: "Monthly grocery spending scaled to hit ~$500/mo targeting annual $6K cap",
      },
    },
  ],
};

/**
 * ABCE — "Online Shopper" Persona
 *
 * Concentrates spending on online retail (3% category), with minimal other categories.
 * Tests heavy online shopping classification and points concentration.
 */
export const abceOnlineShopper: Persona = {
  cardType: "amex_blue_cash_everyday",
  personaName: "online_shopper",
  description:
    "Heavy online shopper maximizing 3% online retail category. Tests online retail spending at scale, single-category focus, and Disney Bundle subscription.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "shopping_online",
      avgAmount: 800,
      variance: 0.25,
      transactionsPerMonth: 8,
      merchantKeys: ["amazon_order", "target_store", "best_buy", "walmart_plus"],
    },
    {
      category: "groceries",
      avgAmount: 300,
      variance: 0.15,
      transactionsPerMonth: 5,
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
      category: "streaming",
      avgAmount: 30,
      variance: 0,
      transactionsPerMonth: 2,
      merchantKeys: ["disney_plus", "netflix"],
    },
    {
      category: "other",
      avgAmount: 50,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["misc_services"],
    },
  ],

  benefitBehavior: [
    { benefitId: "bce_disney_bundle", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    // Test exceeding $6K online retail cap
    {
      type: "exceed_cap",
      details: {
        category: "shopping_online",
        capAmount: 6000,
        description: "Monthly online spending scaled to exceed annual $6K cap partway through year",
      },
    },
  ],
};

export const abcePersonas = [abceBalancedSpender, abceOnlineShopper];
