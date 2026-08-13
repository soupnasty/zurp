import type { EarnConfig } from "../types";

export const biltPalladiumEarnConfig: EarnConfig = {
  cardId: "bilt_palladium",
  cardName: "Bilt Palladium",
  pointsCurrency: "bilt_points",
  baseRate: 2,
  // Rent/mortgage/HOA payments earn up to 1.25x — not modeled: the 26-category
  // taxonomy has no rent/housing category (RENT_AND_UTILITIES_RENT maps to "other").
  // Point Accelerator: spend $200 Bilt Cash to unlock 3x on next $5,000 (up to 5x/year).
  // Rent Day (1st of month): 75% transfer bonus to all partners (Palladium Gold status).
  // Transfer partners: 24-25 total (17-19 airlines + 7 hotels), incl. Wyndham 1:1
  // (added Mar 2026) and Preferred Hotels "I Prefer" 1:2 (added Jun 2026).
  // Note: Accor transfers at 3:2, not 1:1.
  bonusCategories: [
    // Up to 5x at Bilt Dining network restaurants. Modeled as 5x on all dining;
    // the boosted rate only applies at Bilt Dining partner restaurants.
    {
      categories: ["dining"],
      earnRate: 5,
      label: "Bilt Dining restaurants",
    },
    // Portal flights: 3x (match airline merchants first)
    {
      categories: ["travel_portal"],
      earnRate: 3,
      label: "Bilt Travel flights",
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
    // Portal hotels: 4x (everything else through Bilt Travel)
    {
      categories: ["travel_portal"],
      earnRate: 4,
      label: "Bilt Travel hotels",
    },
    // 4x on Lyft rides (requires linked Lyft account)
    {
      categories: ["rideshare"],
      earnRate: 4,
      label: "Lyft (linked account)",
      conditions: {
        merchant_match: ["lyft"],
      },
    },
  ],
  caps: [],
  annualFee: 495,
  valuation: {
    conservativeCpp: 1.5,
    upsideCpp: 2.2,
    upsideLabel: "Transfer partners (Hyatt, United) + Rent Day 75% bonus",
  },
};
