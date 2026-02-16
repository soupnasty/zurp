import type { Persona } from "../types";

/**
 * US Bank Altitude Connect — "Commuter" Persona
 *
 * Heavy gas and transit spending at 4x, hitting the $4K/year gas cap.
 * Tests commuting-focused spending, the gas category cap, and transit classification.
 */
export const usbacCommuter: Persona = {
  cardType: "us_bank_altitude_connect",
  personaName: "commuter",
  description:
    "Commuting-focused user with high gas and transit expenses. Tests US Bank Altitude Connect's 4x gas ($4K/yr cap) and 4x transit, plus quadrennial Global Entry benefit redemption.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null, // No annual fee, quadrennial benefit checked separately

  monthlySpend: [
    {
      category: "gas_stations",
      avgAmount: 350,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["chevron", "shell", "exxon_mobil"],
    },
    {
      category: "transit",
      avgAmount: 100,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["mta_nyc", "generic_transit"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.15,
      transactionsPerMonth: 6,
      merchantKeys: ["whole_foods", "kroger", "safeway"],
    },
    {
      category: "dining",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 5,
      merchantKeys: ["dunkin", "starbucks"],
    },
    {
      category: "shopping_online",
      avgAmount: 150,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "streaming",
      avgAmount: 30,
      variance: 0,
      transactionsPerMonth: 2,
      merchantKeys: ["netflix", "hulu"],
    },
    {
      category: "rideshare",
      avgAmount: 50,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
  ],

  benefitBehavior: [
    // Global Entry: quadrennial ($100 every 4 years) — mark as partial for testing
    { benefitId: "altitude_connect_global_entry", behavior: "partial_use", targetUsagePercent: 25 },
  ],

  competitorSpend: [],

  edgeCases: [
    // Test hitting $4K/year gas cap
    {
      type: "near_cap",
      details: {
        category: "gas_stations",
        capAmount: 4000,
        period: "annual",
        description: "Monthly gas spending scaled to approach $4K/year cap",
      },
    },
  ],
};

/**
 * US Bank Altitude Connect — "Foodie" Persona
 *
 * High dining and grocery spending to maximize 2x categories.
 * Tests dining/grocery classification and 2x category frequency.
 */
export const usbacFoodie: Persona = {
  cardType: "us_bank_altitude_connect",
  personaName: "foodie",
  description:
    "Food-focused user who maximizes 2x dining and grocery spending. Tests US Bank Altitude Connect's 2x dining/groceries/streaming categories and balanced food spending.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: null,

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.2,
      transactionsPerMonth: 15,
      merchantKeys: ["cheesecake_factory", "resy_restaurant", "dunkin", "starbucks"],
    },
    {
      category: "groceries",
      avgAmount: 500,
      variance: 0.15,
      transactionsPerMonth: 10,
      merchantKeys: ["whole_foods", "trader_joes", "kroger", "safeway"],
    },
    {
      category: "streaming",
      avgAmount: 50,
      variance: 0,
      transactionsPerMonth: 3,
      merchantKeys: ["netflix", "hulu", "disney_plus", "peacock"],
    },
    {
      category: "travel_flights",
      avgAmount: 200,
      variance: 0.35,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["hyatt_hotel", "marriott_hotel"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "gas_stations",
      avgAmount: 80,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["shell", "chevron"],
    },
  ],

  benefitBehavior: [
    // Global Entry: quadrennial — mark as never used to test non-redemption
    { benefitId: "altitude_connect_global_entry", behavior: "never_use" },
  ],

  competitorSpend: [],

  edgeCases: [],
};

export const usbacPersonas = [usbacCommuter, usbacFoodie];
