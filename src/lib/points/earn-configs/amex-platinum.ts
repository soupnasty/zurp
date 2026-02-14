import type { EarnConfig } from "../types";

export const amexPlatinumEarnConfig: EarnConfig = {
  cardId: "amex_platinum",
  cardName: "Amex Platinum",
  pointsCurrency: "amex_mr",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["travel_flights"],
      earnRate: 5,
      label: "Flights (direct + AmexTravel)",
    },
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Prepaid hotels via AmexTravel.com",
    },
  ],
  caps: [],
  annualFee: 895,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 2.0,
    upsideLabel: "With transfer partners (ANA, Virgin Atlantic)",
  },
};
