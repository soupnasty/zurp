import type { Persona } from "../types";

export const cspPremierCategorySpender: Persona = {
  cardType: "citi_strata_premier",
  personaName: "category_spender",
  description: "Maximizes 3x categories (flights, dining, groceries, gas), uses hotel credit",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-04-20",
  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 900,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines", "american_airlines"],
    },
    {
      category: "dining",
      avgAmount: 1200,
      variance: 0.25,
      transactionsPerMonth: 15,
      merchantKeys: ["resy_restaurant", "cheesecake_factory", "dunkin"],
    },
    {
      category: "groceries",
      avgAmount: 1000,
      variance: 0.2,
      transactionsPerMonth: 10,
      merchantKeys: ["whole_foods", "kroger", "safeway"],
    },
    {
      category: "gas_stations",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["shell", "chevron", "exxon_mobil"],
    },
    {
      category: "travel_hotels",
      avgAmount: 700,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["hyatt_hotel", "marriott_hotel"],
    },
    {
      category: "travel_portal",
      avgAmount: 400,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["citi_travel"],
    },
    {
      category: "streaming",
      avgAmount: 60,
      variance: 0.15,
      transactionsPerMonth: 3,
      merchantKeys: ["netflix", "hulu"],
    },
    {
      category: "other",
      avgAmount: 300,
      variance: 0.4,
      transactionsPerMonth: 6,
      merchantKeys: ["amazon_order", "target_store"],
    },
  ],
  benefitBehavior: [
    { benefitId: "citip_annual_hotel_credit", behavior: "always_use" },
    { benefitId: "citip_no_ftf", behavior: "passive" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Citi Strata Premier annual fee",
        month: 4,
      },
    },
  ],
};

export const cspPremierGeneralSpender: Persona = {
  cardType: "citi_strata_premier",
  personaName: "general_spender",
  description: "Flat moderate spending across all categories, minimal category optimization",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-04-20",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 6,
      merchantKeys: ["cheesecake_factory", "dunkin", "resy_restaurant"],
    },
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["kroger", "whole_foods"],
    },
    {
      category: "gas_stations",
      avgAmount: 200,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["shell", "chevron"],
    },
    {
      category: "travel_flights",
      avgAmount: 400,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.35,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "entertainment",
      avgAmount: 150,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["entertainment"],
    },
    {
      category: "streaming",
      avgAmount: 50,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["netflix"],
    },
    {
      category: "other",
      avgAmount: 200,
      variance: 0.4,
      transactionsPerMonth: 4,
      merchantKeys: ["walmart_plus"],
    },
  ],
  benefitBehavior: [
    { benefitId: "citip_annual_hotel_credit", behavior: "partial_use", targetUsagePercent: 30 },
    { benefitId: "citip_no_ftf", behavior: "passive" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Citi Strata Premier annual fee",
        month: 4,
      },
    },
  ],
};

export const cspPremierPersonas = [cspPremierCategorySpender, cspPremierGeneralSpender];
