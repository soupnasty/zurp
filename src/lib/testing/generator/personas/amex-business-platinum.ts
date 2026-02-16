import type { Persona } from "../types";

/**
 * Amex Business Platinum — "Business Traveler" Persona
 *
 * Heavy Amex Travel portal usage, maxes out hotel credit across both H1/H2,
 * uses Dell credit fully, and activates CLEAR membership.
 * Tests semi-annual cycle rollover and travel portal points earn.
 */
export const abpBusinessTraveler: Persona = {
  cardType: "amex_business_platinum",
  personaName: "business_traveler",
  description:
    "Executive who relies on Amex Travel portal for all bookings, maximizes hotel credits semi-annually, uses Dell for equipment purchases, and maintains CLEAR membership for airport efficiency. Tests benefit maximization across multiple cycle types.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-02-15",

  monthlySpend: [
    {
      category: "travel_portal",
      avgAmount: 1200,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["amex_travel"],
    },
    {
      category: "travel_hotels",
      avgAmount: 800,
      variance: 0.5,
      transactionsPerMonth: 2,
      merchantKeys: ["generic_hotel"],
    },
    {
      category: "travel_flights",
      avgAmount: 600,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["delta_airlines", "united_airlines"],
    },
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["resy_restaurant", "exclusive_dining"],
    },
    {
      category: "shopping_online",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["dell", "adobe"],
    },
    {
      category: "other",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["clear_membership"],
    },
  ],

  benefitBehavior: [
    { benefitId: "biz_plat_hotel_h1", behavior: "always_use" },
    { benefitId: "biz_plat_hotel_h2", behavior: "always_use" },
    { benefitId: "biz_plat_dell_credit", behavior: "always_use" },
    { benefitId: "biz_plat_global_entry", behavior: "always_use" },
    { benefitId: "biz_plat_clear", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 895,
        description: "Annual membership fee",
        month: 2,
      },
    },
  ],
};

/**
 * Amex Business Platinum — "Minimalist" Persona
 *
 * Only uses Dell credit and ignores all other benefits.
 * Tests B1 unused benefit insights for travel credits and CLEAR.
 */
export const abpMinimalist: Persona = {
  cardType: "amex_business_platinum",
  personaName: "minimalist",
  description:
    "Cost-conscious user who only leverages the $200/yr Dell credit. Ignores hotel credits, Global Entry, and CLEAR. Tests B1 insights for high-value unused benefits.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-05-01",

  monthlySpend: [
    {
      category: "shopping_online",
      avgAmount: 400,
      variance: 0.2,
      transactionsPerMonth: 3,
      merchantKeys: ["dell", "adobe"],
    },
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "other",
      avgAmount: 300,
      variance: 0.4,
      transactionsPerMonth: 4,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "biz_plat_dell_credit", behavior: "always_use" },
    { benefitId: "biz_plat_hotel_h1", behavior: "never_use" },
    { benefitId: "biz_plat_hotel_h2", behavior: "never_use" },
    { benefitId: "biz_plat_global_entry", behavior: "never_use" },
    { benefitId: "biz_plat_clear", behavior: "never_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 895,
        description: "Annual membership fee",
        month: 5,
      },
    },
  ],
};

export const abpPersonas = [abpBusinessTraveler, abpMinimalist];
