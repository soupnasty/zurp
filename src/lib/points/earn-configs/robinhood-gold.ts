import type { EarnConfig } from "../types";

export const robinhoodGoldEarnConfig: EarnConfig = {
  cardId: "robinhood_gold",
  cardName: "Robinhood Gold Card",
  pointsCurrency: "robinhood_points",
  baseRate: 3,
  bonusCategories: [
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Robinhood Travel portal",
    },
  ],
  caps: [
    {
      capId: "rh_travel_portal_3500",
      categories: ["travel_portal"],
      maxSpend: 3500,
      period: "calendar_year",
    },
  ],
  annualFee: 50,
  valuation: {
    conservativeCpp: 0.7,
    upsideCpp: 1.0,
    upsideLabel: "Points to brokerage account (1:1 cent)",
  },
};
