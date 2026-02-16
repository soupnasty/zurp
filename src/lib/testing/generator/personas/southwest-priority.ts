import type { Persona } from "../types";

/**
 * Southwest Rapid Rewards Priority — "Southwest Flyer" Persona
 *
 * Heavy Southwest flight and dining spending. Uses the $75/yr travel credit
 * and earns at 2x on flights + 2x dining. Tests whether the $229 fee is justified
 * with strong engagement.
 */
export const swoutwestFlyer: Persona = {
  cardType: "southwest_priority",
  personaName: "southwest_flyer",
  description:
    "Southwest enthusiast with frequent flights and dining spending. Maximizes $75 annual travel credit and benefits from 2x Rapid Rewards on flights and dining.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-05-20",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 700,
      variance: 0.5,
      transactionsPerMonth: 2,
      merchantKeys: ["southwest_airlines"],
    },
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["resy_restaurant", "cheesecake_factory"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.2,
      transactionsPerMonth: 7,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "shopping_online",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "travel_hotels",
      avgAmount: 400,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["generic_hotel"],
    },
  ],

  benefitBehavior: [
    { benefitId: "southwest_travel_credit", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 229,
        description: "Annual membership fee",
        month: 5,
      },
    },
  ],
};

/**
 * Southwest Rapid Rewards Priority — "Occasional Flyer" Persona
 *
 * Light Southwest usage with minimal airline spend. Only occasionally uses
 * the $75 travel credit. Tests B1 unused benefit insights and fee ROI concerns.
 */
export const southwestOccasionalFlyer: Persona = {
  cardType: "southwest_priority",
  personaName: "occasional_flyer",
  description:
    "Casual Southwest flyer with $4K-$5K annual airline spend who doesn't fully justify the $229 fee. Minimal dining spend. Tests B1 insights for underutilized annual benefits.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-10-10",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 350,
      variance: 0.6,
      transactionsPerMonth: 1,
      merchantKeys: ["southwest_airlines", "united_airlines"],
    },
    {
      category: "dining",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 6,
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
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "southwest_travel_credit", behavior: "partial_use", targetUsagePercent: 60 },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 229,
        description: "Annual membership fee",
        month: 10,
      },
    },
  ],
};

export const southwestPersonas = [swoutwestFlyer, southwestOccasionalFlyer];
