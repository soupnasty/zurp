import type { Persona } from "../types";

export const amexGoldMaximizer: Persona = {
  cardType: "amex_gold",
  personaName: "maximizer",
  description: "Exercises all credits (dining, Uber monthly/Dec, Dunkin), heavy grocery/dining at 4x",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-02-10",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 2000,
      variance: 0.2,
      transactionsPerMonth: 20,
      merchantKeys: ["resy_restaurant", "cheesecake_factory", "dunkin"],
    },
    {
      category: "groceries",
      avgAmount: 1800,
      variance: 0.15,
      transactionsPerMonth: 12,
      merchantKeys: ["whole_foods", "trader_joes", "kroger"],
    },
    {
      category: "food_delivery",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["uber_eats", "grubhub_order"],
    },
    {
      category: "coffee",
      avgAmount: 150,
      variance: 0.25,
      transactionsPerMonth: 15,
      merchantKeys: ["dunkin", "starbucks"],
    },
    {
      category: "rideshare",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 16,
      merchantKeys: ["uber_ride"],
    },
    {
      category: "travel_flights",
      avgAmount: 1200,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines", "american_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 500,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["marriott_hotel", "hilton_hotel"],
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
    { benefitId: "gold_uber_cash", behavior: "always_use" },
    { benefitId: "gold_dining_credit", behavior: "always_use" },
    { benefitId: "gold_dunkin_credit", behavior: "always_use" },
  ],
  competitorSpend: [
    {
      competitorMerchant: "Chase Sapphire Reserve",
      merchantKey: "resy_restaurant",
      monthlyAmount: 300,
      recurring: false,
    },
  ],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 325,
        description: "Amex Gold annual fee",
        month: 2,
      },
    },
    {
      type: "near_cap",
      details: { benefitId: "gold_grocery_cap", percent: 0.98 },
    },
  ],
};

export const amexGoldGroceryFocused: Persona = {
  cardType: "amex_gold",
  personaName: "grocery_focused",
  description: "Hits 4x grocery $25K cap, ignores dining credits, heavy grocery spending",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-02-10",
  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 2200,
      variance: 0.15,
      transactionsPerMonth: 16,
      merchantKeys: ["whole_foods", "kroger", "safeway", "trader_joes"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["cheesecake_factory"],
    },
    {
      category: "coffee",
      avgAmount: 120,
      variance: 0.25,
      transactionsPerMonth: 12,
      merchantKeys: ["starbucks"],
    },
    {
      category: "rideshare",
      avgAmount: 200,
      variance: 0.35,
      transactionsPerMonth: 8,
      merchantKeys: ["uber_ride"],
    },
    {
      category: "travel_flights",
      avgAmount: 600,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines"],
    },
    {
      category: "streaming",
      avgAmount: 40,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["netflix", "hulu"],
    },
    {
      category: "other",
      avgAmount: 250,
      variance: 0.4,
      transactionsPerMonth: 5,
      merchantKeys: ["walmart_plus", "target_store"],
    },
  ],
  benefitBehavior: [
    { benefitId: "gold_uber_cash", behavior: "partial_use", targetUsagePercent: 20 },
    { benefitId: "gold_dining_credit", behavior: "never_use" },
    { benefitId: "gold_dunkin_credit", behavior: "never_use" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 325,
        description: "Amex Gold annual fee",
        month: 2,
      },
    },
    {
      type: "exceed_cap",
      details: { benefit: "gold_grocery_cap", amount: 27000 },
    },
  ],
};

export const amexGoldPersonas = [amexGoldMaximizer, amexGoldGroceryFocused];
