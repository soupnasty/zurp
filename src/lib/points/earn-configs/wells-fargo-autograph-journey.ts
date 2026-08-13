import type { EarnConfig } from "../types";

export const wellsFargoAutographJourneyEarnConfig: EarnConfig = {
  cardId: "wells_fargo_autograph_journey",
  cardName: "Wells Fargo Autograph Journey",
  pointsCurrency: "wf_points",
  baseRate: 1,
  // Transfer partners: 8 airlines at 1:1 (Aer Lingus, Avianca, Flying Blue,
  // British Airways, Iberia, Virgin Atlantic, JetBlue added Nov 2025, Cathay
  // Pacific added Apr 2026); hotels: Choice at 1:2 and Wyndham.
  bonusCategories: [
    {
      categories: ["travel_hotels"],
      earnRate: 5,
      label: "Hotels",
    },
    {
      categories: ["travel_flights"],
      earnRate: 4,
      label: "Airlines",
    },
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Restaurants",
    },
    // 3x on other travel (rental cars, cruises, travel agencies, etc.).
    // Gas, parking, transit, rideshare, streaming, and phone earn 1x base.
    {
      categories: ["travel_other", "car_rentals"],
      earnRate: 3,
      label: "Other travel",
    },
  ],
  caps: [],
  annualFee: 95,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.5,
    upsideLabel: "Transfer partners (8 airlines at 1:1, Choice at 1:2)",
  },
};
