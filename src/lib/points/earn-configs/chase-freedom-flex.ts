import type { EarnConfig } from "../types";

export const cffEarnConfig: EarnConfig = {
  cardId: "chase_freedom_flex",
  cardName: "Chase Freedom Flex",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  bonusCategories: [
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
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Chase Travel portal",
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
