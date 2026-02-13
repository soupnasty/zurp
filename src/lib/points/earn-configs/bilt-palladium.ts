import type { EarnConfig } from "../types";

export const biltPalladiumEarnConfig: EarnConfig = {
  cardId: "bilt_palladium",
  cardName: "Bilt Palladium",
  pointsCurrency: "bilt_points",
  baseRate: 2,
  // Rent/mortgage can earn 1.25x conditionally (monthly non-rent spend >= rent amount).
  // Point Accelerator: spend $200 Bilt Cash to unlock 3x on next $5,000 (up to 5x/year).
  // Rent Day (1st of month): 75% transfer bonus to all partners (Palladium Gold status).
  bonusCategories: [],
  caps: [],
  annualFee: 495,
  // 4% Bilt Cash earned on all non-rent purchases (separate currency from Bilt Points)
  parallelEarnings: {
    label: "Bilt Cash (4%)",
    ratePercent: 4.0,
    currency: "bilt_cash",
  },
  valuation: {
    conservativeCpp: 1.5,
    upsideCpp: 2.2,
    upsideLabel: "Transfer partners (Hyatt, United) + Rent Day 75% bonus",
  },
};
