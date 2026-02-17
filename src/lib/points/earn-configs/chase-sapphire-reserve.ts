import type { EarnConfig } from "../types";

export const csrEarnConfig: EarnConfig = {
  cardId: "chase_sapphire_reserve",
  cardName: "Chase Sapphire Reserve",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Dining",
    },
    {
      categories: ["travel_flights", "travel_hotels", "travel_other", "car_rentals", "transit"],
      earnRate: 4,
      label: "Direct travel",
    },
    {
      categories: ["travel_portal"],
      earnRate: 8,
      label: "Chase Travel portal",
    },
    {
      categories: ["rideshare"],
      earnRate: 5,
      label: "Lyft",
      conditions: { merchant_match: ["lyft"] },
    },
    {
      categories: ["rideshare"],
      earnRate: 1,
      label: "Other rideshare",
      conditions: { merchant_exclude: ["lyft"] },
    },
    {
      categories: ["fitness"],
      earnRate: 10,
      label: "Peloton equipment",
      conditions: { merchant_match: ["peloton"], amount_gte: 200 },
    },
    {
      categories: ["fitness"],
      earnRate: 1,
      label: "Peloton subscription",
      conditions: { merchant_match: ["peloton"], amount_lt: 200 },
    },
  ],
  caps: [],
  annualFee: 795,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 2.0,
    upsideLabel: "With transfer partners (Hyatt, United)",
  },
};
