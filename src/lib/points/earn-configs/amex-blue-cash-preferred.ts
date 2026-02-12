import type { EarnConfig } from "../types";

export const amexBcpEarnConfig: EarnConfig = {
  cardId: "amex_blue_cash_preferred",
  cardName: "Amex Blue Cash Preferred",
  pointsCurrency: "cash_back",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["groceries", "grocery_online"],
      earnRate: 6,
      label: "US supermarkets",
    },
    {
      categories: ["streaming"],
      earnRate: 6,
      label: "Streaming services",
    },
    {
      categories: ["transit", "rideshare", "parking", "travel_flights", "travel_other"],
      earnRate: 3,
      label: "Transit (taxis, rideshare, parking, trains, buses, flights)",
    },
    {
      categories: ["gas_stations"],
      earnRate: 3,
      label: "US gas stations",
    },
  ],
  caps: [
    {
      capId: "bcp_grocery_6k",
      categories: ["groceries", "grocery_online"],
      maxSpend: 6000,
      period: "calendar_year",
    },
  ],
  annualFee: 95,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.0,
    upsideLabel: "Cash back (fixed value)",
  },
};
