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
          "grand hyatt",
          "hyatt regency",
          "hyatt centric",
          "hyatt place",
          "hyatt house",
          "hyatt studios",
          "andaz",
          "thompson hotel",
          "caption by hyatt",
          "alila",
          "destination by hyatt",
          "jdv by hyatt",
          "unbound collection",
          "dream hotel",
          "miraval",
          "hyatt ziva",
          "hyatt zilara",
          "urcove",
          "the standard hotel",
          "bunkhouse hotel",
          "secrets resorts",
          "breathless resorts",
          "dreams resorts",
          "zoetry",
          "sunscape resorts",
          "hyatt vivid",
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
    // NOTE: Car rentals earn base 1x (NOT 2x). Only the World of Hyatt
    // Business card earns 2x on car rentals via flexible category selection.
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
    conservativeCpp: 1.7,
    upsideCpp: 2.2,
    upsideLabel: "Park Hyatt & category 8 redemptions",
  },
};
