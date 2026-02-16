import type { Persona } from "../types";

export const cseNightDiner: Persona = {
  cardType: "citi_strata_elite",
  personaName: "night_diner",
  description: "Exercises Citi Nights 6x time-window dining benefit heavily, late evening dining",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-05-01",
  monthlySpend: [
    {
      category: "dining",
      avgAmount: 2500,
      variance: 0.25,
      transactionsPerMonth: 20,
      merchantKeys: ["resy_restaurant", "cheesecake_factory"],
    },
    {
      category: "travel_flights",
      avgAmount: 800,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 1000,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "hilton_hotel"],
    },
    {
      category: "travel_portal",
      avgAmount: 600,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["citi_travel"],
    },
    {
      category: "entertainment",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["broadway", "concert_venue"],
    },
    {
      category: "streaming",
      avgAmount: 50,
      variance: 0.15,
      transactionsPerMonth: 2,
      merchantKeys: ["hulu", "netflix"],
    },
    {
      category: "other",
      avgAmount: 250,
      variance: 0.4,
      transactionsPerMonth: 5,
      merchantKeys: ["amazon_order", "target_store"],
    },
  ],
  benefitBehavior: [
    { benefitId: "citi_hotel_collection", behavior: "always_use" },
    { benefitId: "citi_global_entry", behavior: "always_use" },
  ],
  competitorSpend: [],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 695,
        description: "Citi Strata Elite annual fee",
        month: 5,
      },
    },
  ],
};

export const cseTravelFocused: Persona = {
  cardType: "citi_strata_elite",
  personaName: "travel_focused",
  description: "Heavy hotel/flight spending, leverages 10x portal, minimal dining/Citi Nights usage",
  generationWindow: { start: "2025-01-01", end: "2025-12-31" },
  anniversaryDate: "2025-05-01",
  monthlySpend: [
    {
      category: "travel_portal",
      avgAmount: 1500,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["citi_travel"],
    },
    {
      category: "travel_hotels",
      avgAmount: 1200,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "generic_hotel"],
    },
    {
      category: "travel_flights",
      avgAmount: 1000,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines", "american_airlines"],
    },
    {
      category: "car_rentals",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["car_rental"],
    },
    {
      category: "dining",
      avgAmount: 300,
      variance: 0.35,
      transactionsPerMonth: 4,
      merchantKeys: ["resy_restaurant"],
    },
    {
      category: "other",
      avgAmount: 200,
      variance: 0.4,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order"],
    },
  ],
  benefitBehavior: [
    { benefitId: "citi_hotel_collection", behavior: "always_use" },
    { benefitId: "citi_global_entry", behavior: "partial_use", targetUsagePercent: 50 },
  ],
  competitorSpend: [
    {
      competitorMerchant: "Chase Sapphire Reserve",
      merchantKey: "citi_travel",
      monthlyAmount: 500,
      recurring: false,
    },
  ],
  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 695,
        description: "Citi Strata Elite annual fee",
        month: 5,
      },
    },
    {
      type: "near_cap",
      details: { benefit: "cse_portal_earn", percent: 0.92 },
    },
  ],
};

export const csePersonas = [cseNightDiner, cseTravelFocused];
