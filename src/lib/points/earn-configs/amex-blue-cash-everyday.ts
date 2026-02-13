import type { EarnConfig } from "../types";

export const amexBceEarnConfig: EarnConfig = {
  cardId: "amex_blue_cash_everyday",
  cardName: "Amex Blue Cash Everyday",
  pointsCurrency: "cash_back",
  baseRate: 1,
  bonusCategories: [
    {
      categories: ["groceries", "grocery_online"],
      earnRate: 3,
      label: "US supermarkets",
    },
    {
      categories: ["gas_stations"],
      earnRate: 3,
      label: "US gas stations",
    },
    {
      categories: ["shopping_online"],
      earnRate: 3,
      label: "US online retail",
    },
  ],
  caps: [
    {
      capId: "bce_grocery_6k",
      categories: ["groceries", "grocery_online"],
      maxSpend: 6000,
      period: "calendar_year",
    },
    {
      capId: "bce_gas_6k",
      categories: ["gas_stations"],
      maxSpend: 6000,
      period: "calendar_year",
    },
    {
      capId: "bce_online_retail_6k",
      categories: ["shopping_online"],
      maxSpend: 6000,
      period: "calendar_year",
    },
  ],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.0,
    upsideLabel: "Cash back (fixed value)",
  },
};
