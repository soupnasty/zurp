import type { Persona } from "../types";

export const cvxPortalUser: Persona = {
  cardType: "capital_one_venture_x",
  personaName: "portal_user",
  description: "Heavy travel portal usage, exercises all 3 benefits ($300 credit, 10K miles, Global Entry)",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-06-15",
  monthlySpend: [
    {
      category: "travel_portal",
      avgAmount: 2000,
      variance: 0.4,
      transactionsPerMonth: 4,
      merchantKeys: ["capital_one_travel"],
    },
    {
      category: "travel_hotels",
      avgAmount: 1500,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "hilton_hotel"],
    },
    {
      category: "travel_flights",
      avgAmount: 1200,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "dining",
      avgAmount: 800,
      variance: 0.25,
      transactionsPerMonth: 10,
      merchantKeys: ["resy_restaurant", "cheesecake_factory"],
    },
    {
      category: "shopping_online",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 6,
      merchantKeys: ["amazon_order", "first_dibs"],
    },
    {
      category: "streaming",
      avgAmount: 70,
      variance: 0.15,
      transactionsPerMonth: 3,
      merchantKeys: ["hulu", "netflix", "disney_plus"],
    },
    {
      category: "other",
      avgAmount: 300,
      variance: 0.4,
      transactionsPerMonth: 5,
      merchantKeys: ["target_store"],
    },
  ],
  benefitBehavior: [
    { benefitId: "vx_travel_credit", behavior: "always_use" },
    { benefitId: "vx_anniversary_miles", behavior: "passive" },
    { benefitId: "vx_global_entry", behavior: "always_use" },
  ],
  competitorSpend: [
    {
      competitorMerchant: "Chase Sapphire Reserve",
      merchantKey: "capital_one_travel",
      monthlyAmount: 800,
      recurring: false,
    },
  ],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 395,
        description: "Capital One Venture X annual fee",
        month: 6,
      },
    },
    // vx_anniversary_miles is an account credit (auto-deposited), not transaction-matchable
    // No anniversary_boundary edge case needed for it
  ],
};

export const cvxFlatSpender: Persona = {
  cardType: "capital_one_venture_x",
  personaName: "flat_spender",
  description: "2x flat earning on everything, minimal travel, unused benefits (B1 candidate)",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-06-15",
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
      avgAmount: 400,
      variance: 0.35,
      transactionsPerMonth: 5,
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
      merchantKeys: ["netflix", "hulu"],
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
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines"],
    },
    {
      category: "other",
      avgAmount: 250,
      variance: 0.4,
      transactionsPerMonth: 4,
      merchantKeys: ["walmart_plus"],
    },
  ],
  benefitBehavior: [
    { benefitId: "vx_travel_credit", behavior: "never_use" },
    { benefitId: "vx_anniversary_miles", behavior: "passive" },
    { benefitId: "vx_global_entry", behavior: "never_use" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 395,
        description: "Capital One Venture X annual fee",
        month: 6,
      },
    },
  ],
};

export const cvxPersonas = [cvxPortalUser, cvxFlatSpender];
