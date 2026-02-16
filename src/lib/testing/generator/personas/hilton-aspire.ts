import type { Persona } from "../types";

/**
 * Hilton Honors Aspire — "Hilton Loyalist" Persona
 *
 * Heavy Hilton hotel stays at 14x earn rate, maximizes $400/yr resort credit
 * (2 x $200 semi-annual), uses all 4 quarterly airline fee credits ($50 ea),
 * and activates CLEAR Plus benefit.
 * Tests semi-annual and quarterly cycle rollover with high-value benefits.
 */
export const hiltonLoyalist: Persona = {
  cardType: "hilton_aspire",
  personaName: "hilton_loyalist",
  description:
    "Hilton elite member with frequent resort stays who maximizes both semi-annual $200 resort credits and all 4 quarterly $50 airline fee credits. Uses CLEAR Plus for airport convenience.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-01-30",

  monthlySpend: [
    {
      category: "travel_hotels",
      avgAmount: 1200,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["hilton_hotel", "hilton_subbrand"],
    },
    {
      category: "travel_flights",
      avgAmount: 600,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["delta_airlines", "united_airlines", "american_airlines"],
    },
    {
      category: "dining",
      avgAmount: 500,
      variance: 0.3,
      transactionsPerMonth: 10,
      merchantKeys: ["resy_restaurant", "exclusive_dining"],
    },
    {
      category: "car_rentals",
      avgAmount: 300,
      variance: 0.5,
      transactionsPerMonth: 1,
      merchantKeys: ["car_rental"],
    },
    {
      category: "shopping_online",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "hilton_resort_h1", behavior: "always_use" },
    { benefitId: "hilton_resort_h2", behavior: "always_use" },
    { benefitId: "hilton_airline_q1", behavior: "always_use" },
    { benefitId: "hilton_airline_q2", behavior: "always_use" },
    { benefitId: "hilton_airline_q3", behavior: "always_use" },
    { benefitId: "hilton_airline_q4", behavior: "always_use" },
    { benefitId: "hilton_clear_credit", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "quarter_boundary",
      details: {
        benefitId: "hilton_airline_q1",
        description:
          "Airline charges on each quarter boundary (March 31, June 30, Sept 30, Dec 31) to trigger quarterly benefits",
      },
    },
    {
      type: "fee_charge",
      details: {
        amount: 550,
        description: "Annual membership fee",
        month: 1,
      },
    },
  ],
};

/**
 * Hilton Honors Aspire — "Airline User" Persona
 *
 * Focuses exclusively on quarterly $50 airline fee credits. Minimal hotel stays.
 * Tests B1 unused benefit insights for resort credit.
 */
export const hiltonAirlineUser: Persona = {
  cardType: "hilton_aspire",
  personaName: "airline_user",
  description:
    "Frequent flyer who maximizes 4 quarterly $50 airline fee credits but rarely uses Hilton hotels. Minimal resort credit and CLEAR usage. Tests B1 insights for high-value unused benefits.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-08-10",

  monthlySpend: [
    {
      category: "travel_flights",
      avgAmount: 800,
      variance: 0.4,
      transactionsPerMonth: 2,
      merchantKeys: ["delta_airlines", "united_airlines", "southwest_airlines"],
    },
    {
      category: "dining",
      avgAmount: 600,
      variance: 0.3,
      transactionsPerMonth: 12,
      merchantKeys: ["cheesecake_factory", "dunkin"],
    },
    {
      category: "groceries",
      avgAmount: 350,
      variance: 0.2,
      transactionsPerMonth: 7,
      merchantKeys: ["kroger", "whole_foods"],
    },
    {
      category: "shopping_online",
      avgAmount: 250,
      variance: 0.3,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order"],
    },
  ],

  benefitBehavior: [
    { benefitId: "hilton_resort_h1", behavior: "never_use" },
    { benefitId: "hilton_resort_h2", behavior: "never_use" },
    { benefitId: "hilton_airline_q1", behavior: "always_use" },
    { benefitId: "hilton_airline_q2", behavior: "always_use" },
    { benefitId: "hilton_airline_q3", behavior: "always_use" },
    { benefitId: "hilton_airline_q4", behavior: "always_use" },
    { benefitId: "hilton_clear_credit", behavior: "partial_use", targetUsagePercent: 30 },
  ],

  competitorSpend: [],

  edgeCases: [
    {
      type: "fee_charge",
      details: {
        amount: 550,
        description: "Annual membership fee",
        month: 8,
      },
    },
  ],
};

export const hiltonPersonas = [hiltonLoyalist, hiltonAirlineUser];
