import type { Persona } from "../types";

/**
 * Wells Fargo Autograph Journey — "Travel Enthusiast" Persona
 *
 * High hotel and flight spending to maximize 5x hotels and 4x flights/dining.
 * Tests travel-focused earning and annual airline credit benefit redemption.
 */
export const wfajTravelEnthusiast: Persona = {
  cardType: "wells_fargo_autograph_journey",
  personaName: "travel_enthusiast",
  description:
    "Frequent traveler maximizing 5x hotels and 4x flights/dining. Tests Wells Fargo Autograph Journey's travel earn rates, annual $50 airline credit, and premium card value proposition.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-03-15", // Annual fee + airline credit anniversary

  monthlySpend: [
    {
      category: "travel_hotels",
      avgAmount: 400,
      variance: 0.3,
      transactionsPerMonth: 2,
      merchantKeys: ["hyatt_hotel", "marriott_hotel", "hilton_hotel", "generic_hotel"],
    },
    {
      category: "travel_flights",
      avgAmount: 500,
      variance: 0.35,
      transactionsPerMonth: 3,
      merchantKeys: ["united_airlines", "delta_airlines", "southwest_airlines", "jetblue"],
    },
    {
      category: "dining",
      avgAmount: 400,
      variance: 0.2,
      transactionsPerMonth: 10,
      merchantKeys: ["resy_restaurant", "cheesecake_factory", "dunkin", "starbucks"],
    },
    {
      category: "rideshare",
      avgAmount: 100,
      variance: 0.25,
      transactionsPerMonth: 4,
      merchantKeys: ["uber_ride", "lyft_ride", "blacklane"],
    },
    {
      category: "car_rentals",
      avgAmount: 200,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["car_rental", "turo"],
    },
    {
      category: "travel_other",
      avgAmount: 100,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["cruise_line"],
    },
    {
      category: "groceries",
      avgAmount: 250,
      variance: 0.15,
      transactionsPerMonth: 4,
      merchantKeys: ["whole_foods", "kroger"],
    },
    {
      category: "gas_stations",
      avgAmount: 80,
      variance: 0.2,
      transactionsPerMonth: 2,
      merchantKeys: ["chevron", "shell"],
    },
  ],

  benefitBehavior: [
    // Annual Airline Credit: $50/yr (minimum $50 charge required)
    { benefitId: "autograph_journey_airline_credit", behavior: "always_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    // Annual fee charged at anniversary
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 3,
      },
    },
    // Airline credit redemption near anniversary
    {
      type: "anniversary_boundary",
      details: {
        benefitId: "autograph_journey_airline_credit",
        description: "Airline credit usage near anniversary date for testing renewal cycle",
      },
    },
  ],
};

/**
 * Wells Fargo Autograph Journey — "Streaming Commuter" Persona
 *
 * Focuses on streaming, gas, and transit at 3x, plus dining at 4x.
 * Tests non-travel usage patterns and benefit value without heavy hotel/flight spend.
 */
export const wfajStreamingCommuter: Persona = {
  cardType: "wells_fargo_autograph_journey",
  personaName: "streaming_commuter",
  description:
    "User who leverages 3x streaming/gas/transit and 4x dining on Autograph Journey. Tests value on non-traditional travel spending and how well the $95 fee is justified through alternate categories.",

  generationWindow: {
    start: "2025-01-01",
    end: "2025-12-31",
  },
  anniversaryDate: "2025-06-01", // Different anniversary for variety in testing

  monthlySpend: [
    {
      category: "streaming",
      avgAmount: 100,
      variance: 0,
      transactionsPerMonth: 5,
      merchantKeys: ["netflix", "hulu", "disney_plus", "peacock", "paramount_plus"],
    },
    {
      category: "gas_stations",
      avgAmount: 200,
      variance: 0.2,
      transactionsPerMonth: 5,
      merchantKeys: ["chevron", "shell", "exxon_mobil"],
    },
    {
      category: "transit",
      avgAmount: 80,
      variance: 0.2,
      transactionsPerMonth: 4,
      merchantKeys: ["mta_nyc", "generic_transit"],
    },
    {
      category: "dining",
      avgAmount: 300,
      variance: 0.2,
      transactionsPerMonth: 8,
      merchantKeys: ["dunkin", "cheesecake_factory", "starbucks"],
    },
    {
      category: "groceries",
      avgAmount: 300,
      variance: 0.15,
      transactionsPerMonth: 6,
      merchantKeys: ["whole_foods", "kroger", "safeway"],
    },
    {
      category: "shopping_online",
      avgAmount: 150,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["amazon_order", "target_store"],
    },
    {
      category: "rideshare",
      avgAmount: 80,
      variance: 0.25,
      transactionsPerMonth: 3,
      merchantKeys: ["uber_ride", "lyft_ride"],
    },
    {
      category: "other",
      avgAmount: 50,
      variance: 0.3,
      transactionsPerMonth: 1,
      merchantKeys: ["misc_services"],
    },
  ],

  benefitBehavior: [
    // Annual Airline Credit: may not use if not traveling
    { benefitId: "autograph_journey_airline_credit", behavior: "never_use" },
  ],

  competitorSpend: [],

  edgeCases: [
    // Annual fee charged at different anniversary (June)
    {
      type: "fee_charge",
      details: {
        amount: 95,
        description: "Annual membership fee",
        month: 6,
      },
    },
  ],
};

export const wfajPersonas = [wfajTravelEnthusiast, wfajStreamingCommuter];
