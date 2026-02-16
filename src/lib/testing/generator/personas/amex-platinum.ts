import type { Persona } from "../types";

/**
 * Amex Platinum — "Maximizer" Persona
 *
 * Exercises all 21 benefits across 5 cycle types: quarterly Resy ($400/yr),
 * quarterly lululemon ($300/yr), monthly Uber Cash with activeMonths gating,
 * monthly streaming ($25), monthly Walmart+, semi-annual hotel & Saks,
 * annual airline fee, Equinox, CLEAR, Oura, Global Entry.
 */
export const platMaximizer: Persona = {
  cardType: "amex_platinum",
  personaName: "maximizer",
  description:
    "Power user who activates every benefit. Tests activeMonths gating (Uber Dec bonus), quarterly cycle rollover (Resy/lululemon), all 5 cycle types, DoorDash grouping from streaming overlap, and monthly depletion patterns.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-03-15",

  monthlySpend: [
    {
      category: "dining",
      avgAmount: 700,
      variance: 0.2,
      transactionsPerMonth: 12,
      merchantKeys: ["resy_restaurant", "cheesecake_factory", "dunkin"],
    },
    {
      category: "rideshare",
      avgAmount: 150,
      variance: 0.3,
      transactionsPerMonth: 6,
      merchantKeys: ["uber_ride"],
    },
    {
      category: "food_delivery",
      avgAmount: 80,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["uber_eats"],
    },
    {
      category: "streaming",
      avgAmount: 50,
      variance: 0,
      transactionsPerMonth: 4,
      merchantKeys: ["hulu", "disney_plus", "peacock", "nytimes"],
    },
    {
      category: "shopping_instore",
      avgAmount: 200,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["saks_store"],
    },
    {
      category: "fitness",
      avgAmount: 300,
      variance: 0,
      transactionsPerMonth: 1,
      merchantKeys: ["equinox"],
    },
    {
      category: "travel_flights",
      avgAmount: 400,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["united_airlines", "delta_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 500,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["hyatt_hotel", "marriott_hotel"],
    },
  ],

  benefitBehavior: [
    // Quarterly Resy: always use all 4 quarters
    { benefitId: "plat_resy_credit_q1", behavior: "always_use" },
    { benefitId: "plat_resy_credit_q2", behavior: "always_use" },
    { benefitId: "plat_resy_credit_q3", behavior: "partial_use", targetUsagePercent: 60 },
    { benefitId: "plat_resy_credit_q4", behavior: "always_use" },

    // Quarterly lululemon: use Q1/Q3, skip Q2/Q4 (tests B1)
    { benefitId: "plat_lululemon_credit_q1", behavior: "always_use" },
    { benefitId: "plat_lululemon_credit_q2", behavior: "never_use" },
    { benefitId: "plat_lululemon_credit_q3", behavior: "always_use" },
    { benefitId: "plat_lululemon_credit_q4", behavior: "never_use" },

    // Monthly Uber Cash: always use (tests activeMonths gating)
    { benefitId: "plat_uber_cash", behavior: "always_use" },
    { benefitId: "plat_uber_cash_dec", behavior: "always_use" },

    // Monthly streaming: always use
    { benefitId: "plat_digital_entertainment", behavior: "always_use" },

    // Monthly Walmart+: always use
    { benefitId: "plat_walmart_plus", behavior: "always_use" },

    // Semi-annual hotel: use H1, skip H2 (tests B1)
    { benefitId: "plat_hotel_credit_h1", behavior: "partial_use", targetUsagePercent: 80 },
    { benefitId: "plat_hotel_credit_h2", behavior: "never_use" },

    // Semi-annual Saks: always use both
    { benefitId: "plat_saks_h1", behavior: "always_use" },
    { benefitId: "plat_saks_h2", behavior: "always_use" },

    // Annual credits
    { benefitId: "plat_uber_one", behavior: "always_use" },
    { benefitId: "plat_airline_fee_credit", behavior: "partial_use", targetUsagePercent: 50 },
    { benefitId: "plat_equinox", behavior: "always_use" },
    { benefitId: "plat_clear", behavior: "always_use" },
    { benefitId: "plat_oura", behavior: "never_use" }, // Tests B1

    // Quadrennial
    { benefitId: "plat_global_entry", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "activeMonths_boundary",
      details: {
        benefitId: "plat_uber_cash_dec",
        description:
          "Uber charge on Dec 31 at 11:55pm EST — should match Dec credit ($35), not Jan ($15)",
      },
    },
    {
      type: "activeMonths_boundary",
      details: {
        benefitId: "plat_uber_cash",
        description:
          "Uber charge on Jan 1 — should match Jan credit (activeMonths [0..10])",
      },
    },
    {
      type: "quarter_boundary",
      details: {
        benefitId: "plat_resy_credit_q1",
        description:
          "Resy charge on March 31 — should match Q1, not Q2",
      },
    },
    {
      type: "fee_charge",
      details: {
        amount: 895,
        description: "Annual membership fee",
        month: 3,
      },
    },
  ],
};

/**
 * Amex Platinum — "Minimalist" Persona
 *
 * Only uses Uber Cash and streaming. Everything else unused.
 * Tests B1 unused credit insights for quarterly, semi-annual, and annual benefits.
 */
export const platMinimalist: Persona = {
  cardType: "amex_platinum",
  personaName: "minimalist",
  description:
    "Light user — only Uber Cash and streaming credit. Tests B1 insights for all unused quarterly/semi-annual/annual benefits.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-09-01",

  monthlySpend: [
    {
      category: "rideshare",
      avgAmount: 100,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["uber_ride"],
    },
    {
      category: "food_delivery",
      avgAmount: 60,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["uber_eats"],
    },
    {
      category: "streaming",
      avgAmount: 35,
      variance: 0,
      transactionsPerMonth: 3,
      merchantKeys: ["hulu", "disney_plus", "nytimes"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.2,
      transactionsPerMonth: 8,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "shopping_online",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "plat_uber_cash", behavior: "always_use" },
    { benefitId: "plat_uber_cash_dec", behavior: "always_use" },
    { benefitId: "plat_digital_entertainment", behavior: "always_use" },

    // Everything else unused
    { benefitId: "plat_resy_credit_q1", behavior: "never_use" },
    { benefitId: "plat_resy_credit_q2", behavior: "never_use" },
    { benefitId: "plat_resy_credit_q3", behavior: "never_use" },
    { benefitId: "plat_resy_credit_q4", behavior: "never_use" },
    { benefitId: "plat_lululemon_credit_q1", behavior: "never_use" },
    { benefitId: "plat_lululemon_credit_q2", behavior: "never_use" },
    { benefitId: "plat_lululemon_credit_q3", behavior: "never_use" },
    { benefitId: "plat_lululemon_credit_q4", behavior: "never_use" },
    { benefitId: "plat_hotel_credit_h1", behavior: "never_use" },
    { benefitId: "plat_hotel_credit_h2", behavior: "never_use" },
    { benefitId: "plat_saks_h1", behavior: "never_use" },
    { benefitId: "plat_saks_h2", behavior: "never_use" },
    { benefitId: "plat_walmart_plus", behavior: "never_use" },
    { benefitId: "plat_uber_one", behavior: "never_use" },
    { benefitId: "plat_airline_fee_credit", behavior: "never_use" },
    { benefitId: "plat_equinox", behavior: "never_use" },
    { benefitId: "plat_clear", behavior: "never_use" },
    { benefitId: "plat_oura", behavior: "never_use" },
    { benefitId: "plat_global_entry", behavior: "never_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 895,
        description: "Annual membership fee",
        month: 9,
      },
    },
  ],
};

export const platPersonas = [platMaximizer, platMinimalist];
