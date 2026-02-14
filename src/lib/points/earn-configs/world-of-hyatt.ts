import type { EarnConfig } from "../types";

export const worldOfHyattEarnConfig: EarnConfig = {
  cardId: "world_of_hyatt",
  cardName: "World of Hyatt Chase",
  pointsCurrency: "hyatt_points",
  baseRate: 1,
  bonusCategories: [
    // 4x at Hyatt hotels (room rates, F&B, resort fees)
    {
      categories: ["travel_hotels"],
      earnRate: 4,
      label: "Hyatt hotels",
      conditions: {
        merchant_match: [
          "hyatt",
          "park hyatt",
          "andaz",
          "thompson hotel",
          "hyatt regency",
          "hyatt place",
          "hyatt house",
          "caption by hyatt",
          "alila",
        ],
      },
    },
    {
      categories: ["dining", "coffee"],
      earnRate: 2,
      label: "Dining",
    },
    {
      categories: ["travel_flights"],
      earnRate: 2,
      label: "Airlines",
    },
    {
      categories: ["car_rentals"],
      earnRate: 2,
      label: "Car rentals",
    },
    {
      categories: ["transit", "rideshare"],
      earnRate: 2,
      label: "Transit & rideshare",
    },
    {
      categories: ["fitness"],
      earnRate: 2,
      label: "Gym & fitness memberships",
    },
  ],
  caps: [],
  annualFee: 95,
  valuation: {
    conservativeCpp: 1.5,
    upsideCpp: 2.2,
    upsideLabel: "Park Hyatt & category 8 redemptions",
  },
};
