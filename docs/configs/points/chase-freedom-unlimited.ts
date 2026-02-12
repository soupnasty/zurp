import type { EarnConfig } from "./types";

export const chaseFreedomUnlimitedEarnConfig: EarnConfig = {
  cardId: "chase_freedom_unlimited",
  cardName: "Chase Freedom Unlimited",
  pointsCurrency: "chase_ur",
  baseRate: 1.5,
  bonusCategories: [
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Chase Travel portal",
    },
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Dining",
    },
    {
      categories: ["drugstores"],
      earnRate: 3,
      label: "Drugstores",
    },
  ],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 2.0,
    upsideLabel: "With CSR/CSP transfer partners (Hyatt, United)",
  },
};
