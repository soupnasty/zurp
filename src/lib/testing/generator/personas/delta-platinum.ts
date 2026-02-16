import type { Persona } from "../types";

/**
 * Delta SkyMiles Platinum — "Delta Loyalist" Persona
 *
 * Heavy Delta flight spending (exceeding $10K/yr to qualify for $200 credit).
 * Uses Uber One credit every month and hotel stays at 3x earn rate.
 * Tests activeMonths gating (Uber One monthly) and airline benefit threshold.
 */
export const deltaLoyalist: Persona = {
  cardType: "delta_platinum",
  personaName: "delta_loyalist",
  description:
    "Frequent Delta flyer with $10K+ annual airline spend who maximizes the $200 Delta flight credit and $9.99/mo Uber One benefit. Heavy hotel stays and dining at 3x earn rate.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-03-20",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 1000,
      variance: 0.5,
      transactionsPerMonth: 2,
      merchantKeys: ["delta_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 500,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["hilton_hotel", "marriott_hotel"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["resy_restaurant", "cheesecake_factory"],
    },
    {
      category: "groceries",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 6,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "rideshare",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["uber_ride"],
    },
  ],

  benefitBehavior: [
    { benefitId: "delta_flight_credit", behavior: "always_use" },
    { benefitId: "delta_uber_one", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "activeMonths_boundary",
      details: {
        benefitId: "delta_uber_one",
        description:
          "Uber charges throughout the year to trigger monthly activeMonths gating ($9.99/mo)",
      },
    },
    {
      type: "fee_charge",
      details: {
        amount: 350,
        description: "Annual membership fee",
        month: 3,
      },
    },
  ],
};

/**
 * Delta SkyMiles Platinum — "Casual Flyer" Persona
 *
 * Occasional Delta flights (under $10K/yr) who doesn't hit the spend threshold
 * for the $200 flight credit. Uses Uber One sporadically.
 * Tests B1 unused benefit insights for airline credit.
 */
export const deltaCasualFlyer: Persona = {
  cardType: "delta_platinum",
  personaName: "casual_flyer",
  description:
    "Infrequent flyer with limited annual airline spend ($5K-$7K) that doesn't qualify for the $200 Delta credit. Occasional Uber One usage. Tests B1 insights for underutilized airline benefits.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-06-15",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 500,
      variance: 0.6,
      transactionsPerMonth: 1,
      merchantKeys: ["delta_airlines", "united_airlines"],
    },
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.2,
      transactionsPerMonth: 8,
      merchantKeys: ["kroger", "safeway"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "rideshare",
      avgAmount: 100,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
  ],

  benefitBehavior: [
    { benefitId: "delta_flight_credit", behavior: "never_use" },
    { benefitId: "delta_uber_one", behavior: "partial_use", targetUsagePercent: 40 },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 350,
        description: "Annual membership fee",
        month: 6,
      },
    },
  ],
};

export const deltaPersonas = [deltaLoyalist, deltaCasualFlyer];
