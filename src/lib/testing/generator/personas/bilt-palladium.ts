import type { Persona } from "../types";

export const biltRentPayer: Persona = {
  cardType: "bilt_palladium",
  personaName: "rent_payer",
  description: "Exercises Bilt's unique rent payment + hotel credits (semi-annual & annual), exercises Rent Day benefits",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-09-01",
  monthlySpend: [
    {
      category: "bills_utilities",
      avgAmount: 2000,
      variance: 0.05,
      transactionsPerMonth: 1,
      merchantKeys: ["bilt_rent"],
    },
    {
      category: "travel_portal",
      avgAmount: 700,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["bilt_travel"],
    },
    {
      category: "travel_hotels",
      avgAmount: 1000,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "hilton_hotel"],
    },
    {
      category: "dining",
      avgAmount: 700,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["resy_restaurant", "cheesecake_factory"],
    },
    {
      category: "entertainment",
      avgAmount: 300,
      variance: 0.35,
      transactionsPerMonth: 4,
      merchantKeys: ["entertainment"],
    },
    {
      category: "shopping_online",
      avgAmount: 400,
      variance: 0.35,
      transactionsPerMonth: 5,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "travel_flights",
      avgAmount: 600,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
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
    { benefitId: "bilt_hotel_credit_h1", behavior: "always_use" },
    { benefitId: "bilt_hotel_credit_h2", behavior: "always_use" },
    // bilt_bilt_cash_annual is an account credit (not transaction-matchable, skipped by matcher)
    { benefitId: "bilt_no_ftf", behavior: "passive" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 495,
        description: "Bilt Palladium annual fee",
        month: 9,
      },
    },
    {
      type: "anniversary_boundary",
      details: { benefit: "bilt_hotel_credit_h1", month: 1 },
    },
    {
      type: "anniversary_boundary",
      details: { benefit: "bilt_hotel_credit_h2", month: 7 },
    },
  ],
};

export const biltGeneralSpender: Persona = {
  cardType: "bilt_palladium",
  personaName: "general_spender",
  description: "2x flat rate on everything, minimal rent/hotel spending, underutilizes benefits",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-09-01",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["cheesecake_factory", "resy_restaurant"],
    },
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "shopping_online",
      avgAmount: 500,
      variance: 0.35,
      transactionsPerMonth: 6,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "entertainment",
      avgAmount: 200,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["entertainment"],
    },
    {
      category: "gas_stations",
      avgAmount: 250,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["shell", "chevron"],
    },
    {
      category: "travel_flights",
      avgAmount: 400,
      variance: 0.45,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines"],
    },
    {
      category: "streaming",
      avgAmount: 60,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["netflix", "hulu"],
    },
    {
      category: "bills_utilities",
      avgAmount: 300,
      variance: 0.1,
      transactionsPerMonth: 2,
      merchantKeys: ["bills_utilities"],
    },
  ],
  benefitBehavior: [
    { benefitId: "bilt_hotel_credit_h1", behavior: "partial_use", targetUsagePercent: 20 },
    { benefitId: "bilt_hotel_credit_h2", behavior: "never_use" },
    // bilt_bilt_cash_annual is an account credit (not transaction-matchable, skipped by matcher)
    { benefitId: "bilt_no_ftf", behavior: "passive" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 495,
        description: "Bilt Palladium annual fee",
        month: 9,
      },
    },
  ],
};

export const biltPersonas = [biltRentPayer, biltGeneralSpender];
