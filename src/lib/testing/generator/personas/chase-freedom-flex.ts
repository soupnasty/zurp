import type { Persona } from "../types";

/**
 * CFF — "Points Optimizer" Persona
 *
 * Exercises CFF's 3x dining/drugstores, 5x Chase Travel portal,
 * and DashPass subscription benefit. Light spending (no-fee card).
 * Tests pooling with CSR/CSP for transfer partner valuation.
 */
export const cffPointsOptimizer: Persona = {
  cardType: "chase_freedom_flex",
  personaName: "points_optimizer",
  description:
    "User who strategically uses CFF for 3x dining/drugstores bonus categories and DashPass subscription. Tests no-fee card earn rates, DashPass subscription benefit, and drugstore classification.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual-anniversary benefits

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.25,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "food_delivery",
      avgAmount: 60,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["doordash_order"],
    },
    {
      category: "drugstores",
      avgAmount: 80,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["cvs_pharmacy"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.15,
      transactionsPerMonth: 6,
      merchantKeys: ["whole_foods", "trader_joes"],
    },
    {
      category: "gas_stations",
      avgAmount: 60,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["shell"],
    },
    {
      category: "shopping_online",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "streaming",
      avgAmount: 25,
      variance: 0,
      transactionsPerMonth: 2,
      merchantKeys: ["netflix", "hulu"],
    },
  ],

  benefitBehavior: [
    // DashPass subscription benefit is not transaction-matchable (skipped by matcher)
  ],

  competitorSpend: [],

  edgeCases: [
    // No fee charge (CFF has $0 annual fee)
  ],
};

/**
 * CFF — "Flat Spender" Persona
 *
 * Mostly non-bonus-category spending. Tests base rate (1x)
 * accuracy for a no-fee card. Net value should always be ≥ 0.
 */
export const cffFlatSpender: Persona = {
  cardType: "chase_freedom_flex",
  personaName: "flat_spender",
  description:
    "Non-strategic spender — mostly 'other' category spending. Tests that a no-fee card never goes negative net value.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "shopping_online",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 6,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "other",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["best_buy", "misc_services"],
    },
    {
      category: "dining",
      avgAmount: 100,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["dunkin"],
    },
  ],

  benefitBehavior: [
    // DashPass subscription benefit is not transaction-matchable (skipped by matcher)
  ],

  competitorSpend: [],
  edgeCases: [],
};

export const cffPersonas = [cffPointsOptimizer, cffFlatSpender];
