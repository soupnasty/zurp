import type { EarnConfig } from "./types";

export const capitalOneSavorEarnConfig: EarnConfig = {
  cardId: "capital_one_savor",
  cardName: "Capital One SavorOne",
  pointsCurrency: "cash_back",
  baseRate: 1,
  bonusCategories: [
    // 8x on Capital One Entertainment purchases (portal)
    {
      categories: ["entertainment"],
      earnRate: 8,
      label: "Capital One Entertainment purchases",
      conditions: {
        merchant_match: ["capital one entertainment"],
      },
    },
    // 5x on hotels & rental cars booked through Capital One Travel
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Capital One Travel hotels & rental cars",
    },
    {
      categories: ["dining", "coffee", "food_delivery"],
      earnRate: 3,
      label: "Dining",
    },
    {
      categories: ["entertainment"],
      earnRate: 3,
      label: "Entertainment",
    },
    {
      categories: ["streaming"],
      earnRate: 3,
      label: "Streaming services",
    },
    {
      categories: ["groceries", "grocery_online"],
      earnRate: 3,
      label: "Grocery stores",
    },
  ],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.0,
    upsideLabel: "Cash back (fixed value; no transfer partners)",
  },
};
