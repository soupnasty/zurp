import type { EarnConfig } from "../types";

export const citiDoubleCashEarnConfig: EarnConfig = {
  cardId: "citi_double_cash",
  cardName: "Citi Double Cash",
  pointsCurrency: "citi_tp",
  // Effective 2% flat: 1% on purchases + 1% on payments
  baseRate: 2,
  bonusCategories: [
    // Portal flights: base rate (2%), explicit entry prevents 5% catch-all match
    {
      categories: ["travel_portal"],
      earnRate: 2,
      label: "Citi Travel flights",
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
          "air france",
          "british air",
          "emirates",
          "singapore air",
        ],
      },
    },
    // Portal hotels/cars/attractions: 5% total (2% base + 3% extra) via Citi Travel
    {
      categories: ["travel_portal"],
      earnRate: 5,
      label: "Citi Travel hotels, cars & attractions",
    },
  ],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.5,
    upsideLabel: "With Strata Premier/Elite transfer partners",
  },
};
