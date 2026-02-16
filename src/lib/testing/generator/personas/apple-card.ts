import type { Persona } from "../types";

/**
 * Apple Card — "Apple Ecosystem" Persona
 *
 * Heavy spending in Apple's merchant_match categories: Apple Services,
 * Uber rides, Nike purchases, Exxon gas, Walgreens pharmacy, and Booking.com travel.
 * Tests merchant_match classification at 3x earn rate.
 */
export const appleEcosystemUser: Persona = {
  cardType: "apple_card",
  personaName: "apple_ecosystem",
  description:
    "Apple ecosystem devotee who leverages 3x earn on Apple Services, Uber, Nike, Exxon, Walgreens, Ace Hardware, and Booking.com. Tests merchant_match conditions and daily cash accumulation.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "streaming",
      avgAmount: 40,
      variance: 0,
      transactionsPerMonth: 2,
      merchantKeys: ["apple_services"],
    },
    {
      category: "rideshare",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["uber_ride"],
    },
    {
      category: "shopping_instore",
      avgAmount: 180,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["lululemon_store"],
    },
    {
      category: "gas_stations",
      avgAmount: 150,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["exxon_mobil"],
    },
    {
      category: "drugstores",
      avgAmount: 80,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["cvs_pharmacy"],
    },
    {
      category: "travel_other",
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["cheesecake_factory"],
    },
    {
      category: "shopping_online",
      avgAmount: 400,
      variance: 0.4,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [],
};

/**
 * Apple Card — "General User" Persona
 *
 * Minimal Apple ecosystem engagement. Mostly 1% base rate spending on groceries,
 * dining, and general shopping. Some occasional Apple Services.
 * Tests fallback category classification and lower earn rates.
 */
export const appleGeneralUser: Persona = {
  cardType: "apple_card",
  personaName: "general_user",
  description:
    "Regular consumer with minimal Apple ecosystem usage. Mostly groceries, dining, and shopping at 1% base rate. Occasionally uses Apple Services. Tests category fallback and low-earn scenario.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.2,
      transactionsPerMonth: 8,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "dining",
      avgAmount: 350,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "starbucks"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.4,
      transactionsPerMonth: 5,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "shopping_instore",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["target_store", "walmart_plus"],
    },
    {
      category: "streaming",
      avgAmount: 20,
      variance: 0,
      transactionsPerMonth: 1,
      merchantKeys: ["apple_services"],
    },
  ],

  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [],
};

export const applePersonas = [appleEcosystemUser, appleGeneralUser];
