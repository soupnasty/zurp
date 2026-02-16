import type { Persona } from "../types";

export const cvFrequentTraveler: Persona = {
  cardType: "capital_one_venture",
  personaName: "frequent_traveler",
  description: "Uses $250 travel credit fully, books hotels/rentals via portal, frequent flights",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-07-10",
  monthlySpend: [
    {
      category: "travel_portal",
      avgAmount: 800,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["capital_one_travel"],
    },
    {
      category: "travel_hotels",
      avgAmount: 900,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "generic_hotel"],
    },
    {
      category: "car_rentals",
      avgAmount: 400,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["car_rental"],
    },
    {
      category: "travel_flights",
      avgAmount: 800,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["resy_restaurant", "cheesecake_factory"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.35,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order"],
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
      transactionsPerMonth: 3,
      merchantKeys: ["target_store"],
    },
  ],
  benefitBehavior: [
    { benefitId: "cov_annual_travel_credit", behavior: "always_use" },
    { benefitId: "cov_global_entry_credit", behavior: "always_use" },
    { benefitId: "cov_no_ftf", behavior: "passive" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Capital One Venture annual fee",
        month: 7,
      },
    },
  ],
};

export const cvLightSpender: Persona = {
  cardType: "capital_one_venture",
  personaName: "light_spender",
  description: "2x base rate testing, moderate spend, low travel usage",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-07-10",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "groceries",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "shopping_online",
      avgAmount: 350,
      variance: 0.35,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "gas_stations",
      avgAmount: 200,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["shell", "chevron"],
    },
    {
      category: "entertainment",
      avgAmount: 100,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["entertainment"],
    },
    {
      category: "travel_flights",
      avgAmount: 200,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines"],
    },
    {
      category: "streaming",
      avgAmount: 40,
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
    { benefitId: "cov_annual_travel_credit", behavior: "partial_use", targetUsagePercent: 40 },
    { benefitId: "cov_global_entry_credit", behavior: "never_use" },
    { benefitId: "cov_no_ftf", behavior: "passive" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Capital One Venture annual fee",
        month: 7,
      },
    },
  ],
};

export const cvPersonas = [cvFrequentTraveler, cvLightSpender];
