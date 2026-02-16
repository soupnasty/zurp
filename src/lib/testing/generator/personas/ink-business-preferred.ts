import type { Persona } from "../types";

/**
 * Chase Ink Business Preferred — "Business Traveler" Persona
 *
 * Heavy business travel (5x Lyft) and corporate spending on travel and phone services
 * (3x). Tests $150K/yr combined cap on travel + phone services. Zero statement credits.
 */
export const inkBusinessTraveler: Persona = {
  cardType: "ink_business_preferred",
  personaName: "business_traveler",
  description:
    "Consultant who maximizes 5x Lyft for airport transportation and 3x on travel/phone services (hitting the $150K/yr cap). Heavy business spend across multiple categories.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-04-15",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 800,
      variance: 0.5,
      transactionsPerMonth: 2,
      merchantKeys: ["delta_airlines", "united_airlines"],
    },
    {
      category: "travel_hotels",
      avgAmount: 700,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["generic_hotel"],
    },
    {
      category: "travel_portal",
      avgAmount: 400,
      variance: 0.4,
      transactionsPerMonth: 1,
      merchantKeys: ["chase_travel"],
    },
    {
      category: "rideshare",
      avgAmount: 300,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["lyft_ride"],
    },
    {
      category: "phone_services",
      avgAmount: 200,
      variance: 0,
      transactionsPerMonth: 1,
      merchantKeys: ["telecom"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 8,
      merchantKeys: ["resy_restaurant", "exclusive_dining"],
    },
  ],

  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [
    {
      type: "near_cap",
      details: {
        description:
          "Travel + phone services spending approaches $150K/yr cap (3x earning rate)",
      },
    },
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 4,
      },
    },
  ],
};

/**
 * Chase Ink Business Preferred — "Office Spender" Persona
 *
 * Minimal travel and Lyft usage. Mostly 1x base rate on office supplies,
 * software subscriptions, and general business expenses.
 * Tests lower earn rate scenario and fee justification.
 */
export const inkOfficeSpender: Persona = {
  cardType: "ink_business_preferred",
  personaName: "office_spender",
  description:
    "Small business owner with limited travel and rideshare needs. Mostly 1x base rate spending on office supplies and software. Tests whether $95 fee is justified for this usage pattern.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-09-01",

  monthlySpend: [
    {
      category: "shopping_online",
      avgAmount: 600,
      variance: 0.3,
      transactionsPerMonth: 5,
      merchantKeys: ["amazon_order", "adobe"],
    },
    {
      category: "phone_services",
      avgAmount: 150,
      variance: 0,
      transactionsPerMonth: 1,
      merchantKeys: ["telecom"],
    },
    {
      category: "dining",
      avgAmount: 350,
      variance: 0.3,
      transactionsPerMonth: 7,
      merchantKeys: ["cheesecake_factory"],
    },
    {
      category: "travel_flights",
      avgAmount: 200,
      variance: 0.6,
      transactionsPerMonth: 0,
      merchantKeys: ["delta_airlines"],
    },
    {
      category: "rideshare",
      avgAmount: 50,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["lyft_ride"],
    },
    {
      category: "other",
      avgAmount: 300,
      variance: 0.4,
      transactionsPerMonth: 3,
      merchantKeys: ["misc_services"],
    },
  ],

  benefitBehavior: [],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 9,
      },
    },
  ],
};

export const inkPersonas = [inkBusinessTraveler, inkOfficeSpender];
