import type { Persona } from "../types";

/**
 * Amex BCP — "Grocery Optimizer" Persona
 *
 * Heavy grocery spender testing the 6% US supermarket earn rate with
 * $6K annual cap. Also tests streaming 6% (uncapped) and Disney Bundle
 * monthly credit. This is the key persona for cap-tracking validation.
 */
export const bcpGroceryOptimizer: Persona = {
  cardType: "amex_blue_cash_preferred",
  personaName: "grocery_optimizer",
  description:
    "Family shopper who heavily uses the 6% grocery category. Tests $6K annual grocery cap (near-cap, exceed-cap transitions), streaming 6% rate, Disney Bundle credit, and cash-back currency (1.0cpp fixed).",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No anniversary-cycle benefits

  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 550,
      variance: 0.15,
      transactionsPerMonth: 8,
      merchantKeys: ["whole_foods", "trader_joes", "kroger", "safeway"],
    },
    {
      category: "streaming",
      avgAmount: 50,
      variance: 0,
      transactionsPerMonth: 4,
      merchantKeys: ["netflix", "hulu", "disney_plus", "youtube_premium"],
    },
    {
      category: "gas_stations",
      avgAmount: 80,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["shell", "exxon_mobil"],
    },
    {
      category: "transit",
      avgAmount: 120,
      variance: 0.1,
      transactionsPerMonth: 20,
      merchantKeys: ["mta_nyc"],
    },
    {
      category: "dining",
      avgAmount: 200,
      variance: 0.25,
      transactionsPerMonth: 5,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "shopping_online",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order", "target_store"],
    },
  ],

  benefitBehavior: [
    // Disney Bundle: always use
    { benefitId: "bcp_disney_bundle", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "near_cap",
      details: {
        capType: "grocery_6k",
        targetSpendByMonth: 10, // By October, cumulative ~$5,800
        description:
          "Cumulative grocery spend reaches ~$5,800 by October, then November's $550 tips over the $6K cap. Verify earn rate drops from 6% to 1%.",
      },
    },
    {
      type: "exceed_cap",
      details: {
        capType: "grocery_6k",
        postCapMonths: [11, 12], // Nov + Dec after cap exceeded
        description:
          "After exceeding $6K, November and December grocery transactions should earn at 1% base rate.",
      },
    },
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 1,
      },
    },
  ],
};

/**
 * Amex BCP — "General Spender" Persona
 *
 * Even spending across categories. Doesn't hit grocery cap.
 * Tests base rate accuracy and flat cash-back valuation.
 */
export const bcpGeneralSpender: Persona = {
  cardType: "amex_blue_cash_preferred",
  personaName: "general_spender",
  description:
    "Moderate spender across all categories. Never hits the $6K grocery cap. Tests base rate and mid-tier earn rates accurately.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 5,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "gas_stations",
      avgAmount: 100,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["shell", "chevron"],
    },
    {
      category: "streaming",
      avgAmount: 30,
      variance: 0,
      transactionsPerMonth: 2,
      merchantKeys: ["netflix", "hulu"],
    },
    {
      category: "dining",
      avgAmount: 300,
      variance: 0.25,
      transactionsPerMonth: 6,
      merchantKeys: ["cheesecake_factory"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "bcp_disney_bundle", behavior: "never_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 5,
      },
    },
  ],
};

export const bcpPersonas = [bcpGroceryOptimizer, bcpGeneralSpender];
