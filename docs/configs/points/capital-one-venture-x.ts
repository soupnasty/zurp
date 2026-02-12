import type { EarnConfig } from "./types";

export const ventureXEarnConfig: EarnConfig = {
  cardId: "capital_one_venture_x",
  cardName: "Capital One Venture X",
  pointsCurrency: "capital_one_miles",
  baseRate: 2,
  bonusCategories: [
    // Portal flights: 5x (match airline merchants first)
    {
      categories: ["travel_portal"],
      earnRate: 5,
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
    // Portal hotels & rentals: 10x (everything else through portal)
    {
      categories: ["travel_portal"],
      earnRate: 10,
      label: "Capital One Travel hotels & rentals",
    },
    // Everything else: 2x (base rate handles this — no explicit bonus entries needed)
  ],
  caps: [],
  annualFee: 395,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.85,
    upsideLabel: "Transfer partners (Avianca, Aeroplan, etc.)",
  },
};
