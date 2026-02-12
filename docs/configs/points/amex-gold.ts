import type { EarnConfig } from "./types";

export const amexGoldEarnConfig: EarnConfig = {
  cardId: "amex_gold",
  cardName: "Amex Gold",
  pointsCurrency: "amex_mr",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 4,
      label: "Dining",
    },
    {
      categories: ["groceries", "grocery_online"],
      earnRate: 4,
      label: "US supermarkets",
    },
    {
      categories: ["travel_flights"],
      earnRate: 3,
      label: "Flights",
    },
    {
      categories: ["travel_portal"],
      earnRate: 2,
      label: "AmexTravel.com (non-flight)",
    },
  ],
  caps: [
    {
      capId: "gold_restaurant_50k",
      categories: ["dining", "coffee", "food_delivery"],
      maxSpend: 50000,
      period: "calendar_year",
    },
    {
      capId: "gold_grocery_25k",
      categories: ["groceries", "grocery_online"],
      maxSpend: 25000,
      period: "calendar_year",
    },
  ],
  annualFee: 325,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.75,
    upsideLabel: "With transfer partners (Delta, ANA)",
  },
};
