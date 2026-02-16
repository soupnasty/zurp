import type { Persona } from "../types";

export const cspCategoryOptimizer: Persona = {
  cardType: "chase_sapphire_preferred",
  personaName: "category_optimizer",
  description: "Maximizes 3x dining category and actively uses DoorDash/streaming benefits",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-03-15",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 1500,
      variance: 0.25,
      transactionsPerMonth: 15,
      merchantKeys: ["cheesecake_factory", "resy_restaurant"],
    },
    {
      category: "streaming",
      avgAmount: 60,
      variance: 0.1,
      transactionsPerMonth: 3,
      merchantKeys: ["hulu", "netflix", "disney_plus"],
    },
    {
      category: "grocery_online",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["instacart", "whole_foods"],
    },
    {
      category: "food_delivery",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 12,
      merchantKeys: ["doordash_order", "uber_eats"],
    },
    {
      category: "travel_portal",
      avgAmount: 600,
      variance: 0.5,
      transactionsPerMonth: 2,
      merchantKeys: ["chase_travel"],
    },
    {
      category: "travel_flights",
      avgAmount: 800,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["hyatt_hotel", "marriott_hotel"],
    },
    {
      category: "rideshare",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["lyft_ride"],
    },
    {
      category: "other",
      avgAmount: 400,
      variance: 0.4,
      transactionsPerMonth: 8,
      merchantKeys: ["walmart_plus", "target_store", "amazon_order"],
    },
  ],
  benefitBehavior: [
    { benefitId: "csp_hotel_credit", behavior: "always_use" },
    { benefitId: "csp_doordash_nonrestaurant_promo", behavior: "always_use" },
    // DashPass subscription benefit is not transaction-matchable (skipped by matcher)
  ],
  competitorSpend: [
    {
      competitorMerchant: "Amex Gold",
      merchantKey: "resy_restaurant",
      monthlyAmount: 200,
      recurring: false,
    },
  ],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Chase Sapphire Preferred annual fee",
        month: 3,
      },
    },
    { type: "near_cap", details: { benefit: "csp_dining", percent: 0.95 } },
  ],
};

export const cspLightUser: Persona = {
  cardType: "chase_sapphire_preferred",
  personaName: "light_user",
  description: "Minimal spending, mostly base rate, unused benefits (B1 insight candidate)",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-03-15",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "grocery_online",
      avgAmount: 100,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["whole_foods"],
    },
    {
      category: "streaming",
      avgAmount: 20,
      variance: 0.2,
      transactionsPerMonth: 1,
      merchantKeys: ["netflix"],
    },
    {
      category: "travel_portal",
      avgAmount: 200,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["chase_travel"],
    },
    {
      category: "other",
      avgAmount: 300,
      variance: 0.4,
      transactionsPerMonth: 6,
      merchantKeys: ["walmart_plus", "target_store"],
    },
  ],
  benefitBehavior: [
    { benefitId: "csp_hotel_credit", behavior: "never_use" },
    { benefitId: "csp_doordash_nonrestaurant_promo", behavior: "partial_use", targetUsagePercent: 10 },
    // DashPass subscription benefit is not transaction-matchable (skipped by matcher)
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Chase Sapphire Preferred annual fee",
        month: 3,
      },
    },
  ],
};

export const cspPersonas = [cspCategoryOptimizer, cspLightUser];
