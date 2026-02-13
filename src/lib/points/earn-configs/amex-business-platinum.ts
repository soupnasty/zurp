import type { EarnConfig } from "../types";

export const amexBusinessPlatinumEarnConfig: EarnConfig = {
  cardId: "amex_business_platinum",
  cardName: "Amex Business Platinum",
  pointsCurrency: "amex_mr",
  baseRate: 1,
  // NOTE: 2x on all US purchases $5,000+ (capped at $2M/year) is not modeled
  // in static bonus categories because it applies globally based on transaction
  // amount, not merchant category.
  bonusCategories: [
    // 5x flights & prepaid hotels booked through Amex Travel
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Amex Travel flights & prepaid hotels",
    },
  ],
  caps: [],
  annualFee: 895,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 2.0,
    upsideLabel: "Transfer partners (ANA, Aeroplan, Hilton 1:2)",
  },
};
