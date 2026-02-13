import type { EarnConfig } from "../types";

export const hiltonAspireEarnConfig: EarnConfig = {
  cardId: "hilton_aspire",
  cardName: "Hilton Honors Amex Aspire",
  pointsCurrency: "hilton_points",
  baseRate: 3,
  bonusCategories: [
    // 14x at Hilton properties (rooms + on-site dining)
    {
      categories: ["travel_hotels"],
      earnRate: 14,
      label: "Hilton hotels & resorts",
      conditions: {
        merchant_match: [
          "hilton",
          "doubletree",
          "hampton inn",
          "embassy suites",
          "waldorf",
          "conrad",
          "canopy",
          "curio",
          "tapestry",
          "lxr",
          "homewood suites",
          "home2 suites",
          "tru by hilton",
        ],
      },
    },
    {
      categories: ["travel_flights"],
      earnRate: 7,
      label: "Airlines",
    },
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 7,
      label: "Restaurants (non-Hilton)",
    },
    {
      categories: ["car_rentals"],
      earnRate: 7,
      label: "Car rentals",
    },
  ],
  caps: [],
  annualFee: 550,
  valuation: {
    conservativeCpp: 0.5,
    upsideCpp: 0.8,
    upsideLabel: "Aspirational Hilton redemptions (Waldorf, Conrad)",
  },
};
