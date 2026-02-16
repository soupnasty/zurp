import type { Persona } from "../types";

/**
 * CSR — "Maximizer" Persona
 *
 * Power user who exercises most CSR benefits: DoorDash monthly credits,
 * Lyft rides, Peloton membership, travel credit, StubHub events.
 * Also generates competitor spend for A1 insights (Uber Eats vs DoorDash,
 * Uber rides vs Lyft, Ticketmaster vs StubHub).
 */
export const csrMaximizer: Persona = {
  cardType: "chase_sapphire_reserve",
  personaName: "maximizer",
  description:
    "Power user who activates and uses most CSR benefits. Tests DoorDash sub-credit depletion, Lyft monthly credit, Peloton credit, travel credit broad matching, StubHub semi-annual credits, and competitor insights.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-03-15",

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.25,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin", "resy_restaurant"],
    },
    {
      category: "food_delivery",
      avgAmount: 120,
      variance: 0.15,
      transactionsPerMonth: 6,
      merchantKeys: ["doordash_order"],
    },
    {
      category: "rideshare",
      avgAmount: 80,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["lyft_ride"],
    },
    {
      category: "travel_flights",
      avgAmount: 200,
      variance: 0.6,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["hyatt_hotel", "marriott_hotel"],
    },
    {
      category: "fitness",
      avgAmount: 45,
      variance: 0,
      transactionsPerMonth: 1,
      merchantKeys: ["peloton"],
    },
    {
      category: "streaming",
      avgAmount: 30,
      variance: 0,
      transactionsPerMonth: 2,
      merchantKeys: ["netflix", "hulu"],
    },
    {
      category: "entertainment",
      avgAmount: 150,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["entertainment"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
    {
      category: "gas_stations",
      avgAmount: 60,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["shell", "chevron"],
    },
  ],

  benefitBehavior: [
    // DoorDash sub-credits: always use all 3
    { benefitId: "csr_doordash_restaurant", behavior: "always_use" },
    { benefitId: "csr_doordash_nonrestaurant_1", behavior: "always_use" },
    { benefitId: "csr_doordash_nonrestaurant_2", behavior: "always_use" },

    // Lyft: always use
    { benefitId: "csr_lyft", behavior: "always_use" },

    // Peloton: always use (subscription)
    { benefitId: "csr_peloton", behavior: "always_use" },

    // Travel credit: partial (doesn't always travel)
    { benefitId: "csr_travel", behavior: "partial_use", targetUsagePercent: 70 },

    // StubHub: use H1, skip H2 (tests B1 unused credit)
    { benefitId: "csr_stubhub_h1", behavior: "always_use" },
    { benefitId: "csr_stubhub_h2", behavior: "never_use" },

    // Edit hotel: use H1, skip H2 (tests B1)
    { benefitId: "csr_edit_h1", behavior: "always_use" },
    { benefitId: "csr_edit_h2", behavior: "never_use" },

    // Select hotel: use it (IHG is a qualifying chain)
    { benefitId: "csr_select_hotel_credit_2026", behavior: "always_use" },

    // Dining: Exclusive Tables — use H1, skip H2 (tests B1)
    { benefitId: "csr_dining_h1", behavior: "always_use" },
    { benefitId: "csr_dining_h2", behavior: "never_use" },

    // Global Entry: one-time
    { benefitId: "csr_global_entry", behavior: "always_use" },

    // Subscriptions: passive (auto-benefiting)
    { benefitId: "csr_apple_tv", behavior: "passive" },
    { benefitId: "csr_apple_music", behavior: "passive" },
    { benefitId: "csr_dashpass", behavior: "passive" },
  ],

  competitorSpend: [
    {
      competitorMerchant: "Uber Eats",
      merchantKey: "uber_eats",
      monthlyAmount: 40,
      recurring: true, // Should trigger A2
    },
    {
      competitorMerchant: "Uber Rides",
      merchantKey: "uber_ride",
      monthlyAmount: 30,
      recurring: true, // Should trigger A2
    },
    {
      competitorMerchant: "Ticketmaster",
      merchantKey: "entertainment", // maps to generic entertainment
      monthlyAmount: 80,
      recurring: false, // Should trigger A1
    },
  ],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 795,
        description: "Annual membership fee",
        month: 3, // March (anniversary month)
      },
    },
    {
      type: "month_boundary",
      details: {
        benefitId: "csr_doordash_restaurant",
        description:
          "DoorDash charge on last day of month — should match current month credit, not next",
      },
    },
    {
      type: "duplicate_merchant",
      details: {
        merchantKey: "doordash_order",
        description:
          "Two DoorDash orders same day — first $5 depletes restaurant credit, second starts on nonrestaurant_1",
      },
    },
  ],
};

/**
 * CSR — "Minimalist" Persona
 *
 * Light user: mostly dining and some travel. Doesn't use DoorDash,
 * StubHub, Peloton. Tests B1 unused credit insights extensively.
 */
export const csrMinimalist: Persona = {
  cardType: "chase_sapphire_reserve",
  personaName: "minimalist",
  description:
    "Light user who only leverages dining earn rate and occasional travel credit. Many benefits go unused, producing B1 insights.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-06-01",

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.2,
      transactionsPerMonth: 12,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "groceries",
      avgAmount: 400,
      variance: 0.15,
      transactionsPerMonth: 6,
      merchantKeys: ["whole_foods", "trader_joes"],
    },
    {
      category: "travel_flights",
      avgAmount: 150,
      variance: 0.8,
      transactionsPerMonth: 0.5, // ~6 flights per year
      merchantKeys: ["united_airlines"],
    },
  ],

  benefitBehavior: [
    // Travel credit: partial
    { benefitId: "csr_travel", behavior: "partial_use", targetUsagePercent: 40 },

    // All monthly credits unused
    { benefitId: "csr_doordash_restaurant", behavior: "never_use" },
    { benefitId: "csr_doordash_nonrestaurant_1", behavior: "never_use" },
    { benefitId: "csr_doordash_nonrestaurant_2", behavior: "never_use" },
    { benefitId: "csr_lyft", behavior: "never_use" },
    { benefitId: "csr_peloton", behavior: "never_use" },
    { benefitId: "csr_stubhub_h1", behavior: "never_use" },
    { benefitId: "csr_stubhub_h2", behavior: "never_use" },
    { benefitId: "csr_edit_h1", behavior: "never_use" },
    { benefitId: "csr_edit_h2", behavior: "never_use" },
    { benefitId: "csr_select_hotel_credit_2026", behavior: "never_use" },
    { benefitId: "csr_dining_h1", behavior: "never_use" },
    { benefitId: "csr_dining_h2", behavior: "never_use" },
    { benefitId: "csr_global_entry", behavior: "never_use" },

    // Subscriptions: passive (auto-benefiting)
    { benefitId: "csr_apple_tv", behavior: "passive" },
    { benefitId: "csr_apple_music", behavior: "passive" },
    { benefitId: "csr_dashpass", behavior: "passive" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 795,
        description: "Annual membership fee",
        month: 6,
      },
    },
  ],
};

export const csrPersonas = [csrMaximizer, csrMinimalist];
