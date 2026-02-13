import type { EarnConfig } from "../types";

export const unitedExplorerEarnConfig: EarnConfig = {
  cardId: "united_explorer",
  cardName: "United Explorer Chase",
  pointsCurrency: "united_miles",
  baseRate: 1,
  bonusCategories: [
    // 5x on United flights purchased directly
    {
      categories: ["travel_flights"],
      earnRate: 5,
      label: "United flights",
      conditions: {
        merchant_match: ["united"],
      },
    },
    // 2x on dining and hotels
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 2,
      label: "Dining",
    },
    {
      categories: ["travel_hotels"],
      earnRate: 2,
      label: "Hotels",
    },
  ],
  caps: [],
  annualFee: 150,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.5,
    upsideLabel: "United partner awards (ANA, Lufthansa, etc.)",
  },
};
