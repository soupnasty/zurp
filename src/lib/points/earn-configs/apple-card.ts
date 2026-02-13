import type { EarnConfig } from "../types";

export const appleCardEarnConfig: EarnConfig = {
  cardId: "apple_card",
  cardName: "Apple Card",
  pointsCurrency: "cash_back",
  // NOTE: The base rate depends on payment method:
  //   - 2% on Apple Pay purchases (contactless/in-app)
  //   - 1% on physical titanium card purchases
  // We model 1% as the conservative base.
  baseRate: 1,
  bonusCategories: [
    // 3% on specific merchant partners
    {
      categories: ["shopping_online", "shopping_instore"],
      earnRate: 3,
      label: "Apple stores & Apple.com",
      conditions: {
        merchant_match: ["apple"],
      },
    },
    {
      categories: ["rideshare", "food_delivery"],
      earnRate: 3,
      label: "Uber & Uber Eats",
      conditions: {
        merchant_match: ["uber"],
      },
    },
    {
      categories: ["shopping_online", "shopping_instore"],
      earnRate: 3,
      label: "Nike",
      conditions: {
        merchant_match: ["nike"],
      },
    },
    {
      categories: ["gas_stations"],
      earnRate: 3,
      label: "Exxon & Mobil",
      conditions: {
        merchant_match: ["exxon", "mobil"],
      },
    },
    {
      categories: ["drugstores"],
      earnRate: 3,
      label: "Walgreens & Duane Reade",
      conditions: {
        merchant_match: ["walgreens", "duane reade"],
      },
    },
    {
      categories: ["home_improvement"],
      earnRate: 3,
      label: "Ace Hardware",
      conditions: {
        merchant_match: ["ace hardware"],
      },
    },
    {
      categories: ["travel_hotels"],
      earnRate: 3,
      label: "Booking.com",
      conditions: {
        merchant_match: ["booking.com"],
      },
    },
  ],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.0,
    upsideLabel: "Daily Cash (fixed value; no transfer partners)",
  },
};
