import type { EarnConfig } from "../types";

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
      categories: ["grocery", "grocery_online"],
      earnRate: 4,
      label: "US supermarkets",
    },
    {
      categories: ["travel_flights"],
      earnRate: 3,
      label: "Flights",
    },
  ],
  caps: [
    {
      capId: "gold_grocery_25k",
      categories: ["grocery", "grocery_online"],
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
