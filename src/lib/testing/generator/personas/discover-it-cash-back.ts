import type { Persona } from "../types";

/**
 * Discover it Cash Back — "Category Chaser" Persona
 *
 * Concentrates spending on the rotating quarterly 5% categories,
 * hitting the $1,500/quarter cap multiple times per year.
 * Tests category awareness and cap enforcement.
 */
export const discoverCategoryChacer: Persona = {
  cardType: "discover_it_cash_back",
  personaName: "category_chaser",
  description:
    "Strategic user who plans purchases around rotating 5% categories. Tests Discover it's quarterly rotating categories, transaction concentration, and awareness of $1,500/quarter cap.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual-anniversary benefits

  monthlySpend: [
    {
      category: "shopping_online",
      avgAmount: 500,
      variance: 0.25,
      transactionsPerMonth: 6,
      merchantKeys: ["amazon_order", "target_store", "best_buy"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.2,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin", "starbucks"],
    },
    {
      category: "gas_stations",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 5,
      merchantKeys: ["chevron", "shell", "exxon_mobil"],
    },
    {
      category: "groceries",
      avgAmount: 250,
      variance: 0.15,
      transactionsPerMonth: 4,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "rideshare",
      avgAmount: 60,
      variance: 0.25,
      transactionsPerMonth: 2,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "other",
      avgAmount: 100,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["misc_services"],
    },
  ],

  benefitBehavior: [],
  // Discover it Cash Back has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [
    // Test hitting $1,500 quarterly cap on rotating 5% categories
    {
      type: "near_cap",
      details: {
        category: "shopping_online",
        capAmount: 1500,
        period: "quarterly",
        description: "Monthly spending scaled to approach $1,500/quarter cap on rotating categories",
      },
    },
    {
      type: "quarter_boundary",
      details: {
        merchantKey: "amazon_order",
        description: "Transactions at quarter boundaries to test category cap reset",
      },
    },
  ],
};

/**
 * Discover it Cash Back — "Base Spender" Persona
 *
 * Minimal engagement with rotating categories, mostly 1% base rate earning.
 * Tests value at non-strategic usage where 1% is primary earn source.
 */
export const discoverBaseSpender: Persona = {
  cardType: "discover_it_cash_back",
  personaName: "base_spender",
  description:
    "Non-strategic user who doesn't track rotating categories. Tests Discover it's 1% base rate performance and overall value for passive users.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.15,
      transactionsPerMonth: 7,
      merchantKeys: ["whole_foods", "kroger", "safeway"],
    },
    {
      category: "dining",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 6,
      merchantKeys: ["dunkin", "starbucks"],
    },
    {
      category: "rideshare",
      avgAmount: 100,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "shopping_instore",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["target_store", "walmart_plus"],
    },
    {
      category: "other",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["best_buy", "misc_services"],
    },
    {
      category: "gas_stations",
      avgAmount: 80,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["shell"],
    },
  ],

  benefitBehavior: [],
  // Discover it Cash Back has no tracked statement credit benefits

  competitorSpend: [],

  edgeCases: [],
};

export const discoverItPersonas = [discoverCategoryChacer, discoverBaseSpender];
