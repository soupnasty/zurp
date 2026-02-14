import type { EarnConfig } from "../types";

export const ihgPremierEarnConfig: EarnConfig = {
  cardId: "ihg_premier",
  cardName: "IHG One Rewards Premier",
  pointsCurrency: "ihg_points",
  baseRate: 3,
  bonusCategories: [
    // 10x at IHG hotels
    {
      categories: ["travel_hotels"],
      earnRate: 10,
      label: "IHG hotels",
      conditions: {
        merchant_match: [
          "ihg",
          "intercontinental",
          "holiday inn",
          "holiday inn express",
          "holiday inn club vacations",
          "crowne plaza",
          "kimpton",
          "indigo",
          "even hotels",
          "staybridge",
          "candlewood",
          "atwell",
          "vignette",
          "regent",
          "six senses",
          "voco",
          "ruby",
          "hualuxe",
          "iberostar",
          "garner",
          "avid",
        ],
      },
    },
    {
      categories: ["travel_flights"],
      earnRate: 5,
      label: "Airlines",
    },
    {
      categories: ["car_rentals"],
      earnRate: 5,
      label: "Car rentals",
    },
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 5,
      label: "Dining",
    },
  ],
  caps: [],
  annualFee: 99,
  valuation: {
    conservativeCpp: 0.5,
    upsideCpp: 0.8,
    upsideLabel: "Aspirational IHG redemptions (InterContinental, Kimpton)",
  },
};
