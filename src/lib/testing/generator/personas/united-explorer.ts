import type { Persona } from "../types";

/**
 * United Explorer — "United Loyalist" Persona
 *
 * Heavy United flight spending (5x earn), maxes out all 3 statement credits:
 * $100 United travel credit, $60 airport rideshare credit, and $120 Instacart credit.
 * Tests high-value credit utilization across multiple benefit types.
 */
export const unitedLoyalist: Persona = {
  cardType: "united_explorer",
  personaName: "united_loyalist",
  description:
    "MileagePlus elite member with heavy United flight spending (5x) and dining (2x). Maximizes all 3 statement credits: $100 United travel, $60 rideshare, and $120 Instacart.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-02-28",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 900,
      variance: 0.5,
      transactionsPerMonth: 2,
      merchantKeys: ["united_airlines"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["resy_restaurant", "cheesecake_factory"],
    },
    {
      category: "travel_hotels",
      avgAmount: 500,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["generic_hotel"],
    },
    {
      category: "grocery_online",
      avgAmount: 250,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["instacart"],
    },
    {
      category: "rideshare",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "united_travel_credit", behavior: "always_use" },
    { benefitId: "united_rideshare_credit", behavior: "always_use" },
    { benefitId: "united_instacart_credit", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [],
};

/**
 * United Explorer — "Credit Optimizer" Persona
 *
 * Minimal United flight usage (doesn't justify airline credit). Maximizes the
 * $60 rideshare and $120 Instacart credits instead.
 * Tests B1 unused benefit insights for airline credit.
 */
export const unitedCreditOptimizer: Persona = {
  cardType: "united_explorer",
  personaName: "credit_optimizer",
  description:
    "Light flyer who focuses on extracting value from the $60 rideshare and $120 Instacart credits. Limited United flight spend. Tests B1 insights for underutilized travel benefits.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-07-12",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 300,
      variance: 0.6,
      transactionsPerMonth: 0,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "grocery_online",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 5,
      merchantKeys: ["instacart"],
    },
    {
      category: "rideshare",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 6,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.2,
      transactionsPerMonth: 7,
      merchantKeys: ["kroger", "whole_foods"],
    },
    {
      category: "shopping_online",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "united_travel_credit", behavior: "never_use" },
    { benefitId: "united_rideshare_credit", behavior: "always_use" },
    { benefitId: "united_instacart_credit", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 150,
        description: "Annual membership fee",
        month: 7,
      },
    },
  ],
};

export const unitedPersonas = [unitedLoyalist, unitedCreditOptimizer];
