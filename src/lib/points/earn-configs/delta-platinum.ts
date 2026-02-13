import type { EarnConfig } from "../types";

export const deltaPlatinumEarnConfig: EarnConfig = {
  cardId: "delta_platinum",
  cardName: "Delta SkyMiles Platinum Amex",
  pointsCurrency: "delta_skymiles",
  baseRate: 1,
  bonusCategories: [
    // 3x on Delta flights
    {
      categories: ["travel_flights"],
      earnRate: 3,
      label: "Delta flights",
      conditions: {
        merchant_match: ["delta"],
      },
    },
    // 3x on hotel reservations
    {
      categories: ["travel_hotels"],
      earnRate: 3,
      label: "Hotels",
    },
    // 2x on restaurants and supermarkets
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 2,
      label: "Restaurants",
    },
    {
      categories: ["groceries", "grocery_online"],
      earnRate: 2,
      label: "Supermarkets",
    },
  ],
  caps: [],
  annualFee: 350,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.4,
    upsideLabel: "Delta partner awards & flash sales",
  },
};
