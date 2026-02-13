import type { EarnConfig } from "../types";
import { buildCFFRotatingBonuses } from "../rotating-categories";

// Pre-build rotating bonuses and caps at module load
const { bonuses: rotatingBonuses, caps: rotatingCaps } =
  buildCFFRotatingBonuses();

export const cffEarnConfig: EarnConfig = {
  cardId: "chase_freedom_flex",
  cardName: "Chase Freedom Flex",
  pointsCurrency: "chase_ur",
  baseRate: 1,
  bonusCategories: [
    // Rotating 5% categories come FIRST so they match before permanent 3x dining.
    // First-match-wins: a Q3 dining transaction earns 5x (rotating) not 3x (permanent).
    ...rotatingBonuses,
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
  caps: [
    // Quarterly $1,500 caps on rotating categories
    ...rotatingCaps,
  ],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 2.0,
    upsideLabel: "With CSR/CSP transfer partners (Hyatt, United)",
  },
};
