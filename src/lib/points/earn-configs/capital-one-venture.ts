import type { EarnConfig } from "../types";

export const capitalOneVentureEarnConfig: EarnConfig = {
  cardId: "capital_one_venture",
  cardName: "Capital One Venture",
  pointsCurrency: "capital_one_miles",
  baseRate: 2,
  bonusCategories: [
    // Portal flights: base rate (2x), explicit entry prevents 5x catch-all match
    {
      categories: ["travel_portal"],
      earnRate: 2,
      label: "Capital One Travel flights",
      conditions: {
        merchant_match: [
          "united",
          "delta",
          "american air",
          "southwest",
          "jetblue",
          "alaska air",
          "spirit",
          "frontier",
        ],
      },
    },
    // Portal hotels & rental cars: 5x (everything else through portal)
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Capital One Travel hotels & rental cars",
    },
  ],
  caps: [],
  annualFee: 95,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.85,
    upsideLabel: "Transfer partners (Avianca, Aeroplan, etc.)",
  },
};
