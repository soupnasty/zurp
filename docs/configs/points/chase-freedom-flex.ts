import type { EarnConfig } from "./types";

export const chaseFreedomFlexEarnConfig: EarnConfig = {
  cardId: "chase_freedom_flex",
  cardName: "Chase Freedom Flex",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  // NOTE: Rotating 5% quarterly categories ($1,500/quarter cap, activation required)
  // are not modeled here because they change each quarter. The engine should track
  // quarterly activations and caps separately.
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
