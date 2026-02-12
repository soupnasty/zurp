import type { EarnConfig } from "./types";

export const wellsFargoActiveCashEarnConfig: EarnConfig = {
  cardId: "wf_active_cash",
  cardName: "Wells Fargo Active Cash",
  pointsCurrency: "cash_back",
  // Flat 2% cash back on all purchases
  baseRate: 2,
  bonusCategories: [],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.0,
    upsideLabel: "Cash back (fixed value)",
  },
};
