import type { Persona } from "../types";

export const rhgHeavySpender: Persona = {
  cardType: "robinhood_gold",
  personaName: "heavy_spender",
  description: "High volume spending to maximize 3x flat base rate, tests earning at scale",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-08-01",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 1500,
      variance: 0.25,
      transactionsPerMonth: 18,
      merchantKeys: ["resy_restaurant", "cheesecake_factory", "dunkin"],
    },
    {
      category: "groceries",
      avgAmount: 1200,
      variance: 0.2,
      transactionsPerMonth: 10,
      merchantKeys: ["whole_foods", "kroger", "trader_joes"],
    },
    {
      category: "shopping_online",
      avgAmount: 1000,
      variance: 0.35,
      transactionsPerMonth: 10,
      merchantKeys: ["amazon_order", "target_store", "walmart_plus"],
    },
    {
      category: "entertainment",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["entertainment"],
    },
    {
      category: "gas_stations",
      avgAmount: 400,
      variance: 0.25,
      transactionsPerMonth: 5,
      merchantKeys: ["shell", "chevron", "exxon_mobil"],
    },
    {
      category: "travel_flights",
      avgAmount: 700,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 600,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["hyatt_hotel", "marriott_hotel"],
    },
    {
      category: "streaming",
      avgAmount: 80,
      variance: 0.15,
      transactionsPerMonth: 4,
      merchantKeys: ["netflix", "hulu", "disney_plus"],
    },
    {
      category: "other",
      avgAmount: 500,
      variance: 0.4,
      transactionsPerMonth: 8,
      merchantKeys: ["best_buy", "home_depot"],
    },
  ],
  benefitBehavior: [{ benefitId: "rh_gold_no_ftf", behavior: "passive" }],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 50,
        description: "Robinhood Gold membership fee",
        month: 8,
      },
    },
  ],
};

export const rhgTravelPortalUser: Persona = {
  cardType: "robinhood_gold",
  personaName: "travel_portal_user",
  description: "Tests 5x Robinhood Travel portal with $3,500/yr cap, exercises portal benefit",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-08-01",
  monthlySpend: [
    {
      category: "travel_portal",
      avgAmount: 800,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["bilt_travel"],
    },
    {
      category: "travel_hotels",
      avgAmount: 1000,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "generic_hotel"],
    },
    {
      category: "travel_flights",
      avgAmount: 900,
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
      avgAmount: 400,
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
      category: "gas_stations",
      avgAmount: 200,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["shell", "chevron"],
    },
    {
      category: "streaming",
      avgAmount: 50,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["netflix", "hulu"],
    },
  ],
  benefitBehavior: [{ benefitId: "rh_gold_no_ftf", behavior: "passive" }],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 50,
        description: "Robinhood Gold membership fee",
        month: 8,
      },
    },
    {
      type: "exceed_cap",
      details: { benefit: "robinhood_travel_portal_cap", amount: 3500 },
    },
  ],
};

export const rhgPersonas = [rhgHeavySpender, rhgTravelPortalUser];
