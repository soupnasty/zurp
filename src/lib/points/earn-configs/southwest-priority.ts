import type { EarnConfig } from "../types";

export const southwestPriorityEarnConfig: EarnConfig = {
  cardId: "southwest_priority",
  cardName: "Southwest Rapid Rewards Priority",
  pointsCurrency: "southwest_rr",
  baseRate: 1,
  bonusCategories: [
    // 4x on Southwest flights
    {
      categories: ["travel_flights"],
      earnRate: 4,
      label: "Southwest flights",
      conditions: {
        merchant_match: ["southwest"],
      },
    },
    // 2x on dining
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 2,
      label: "Dining",
    },
  ],
  caps: [],
  annualFee: 229,
  valuation: {
    conservativeCpp: 1.3,
    upsideCpp: 1.5,
    upsideLabel: "Wanna Get Away Plus redemptions",
  },
};
