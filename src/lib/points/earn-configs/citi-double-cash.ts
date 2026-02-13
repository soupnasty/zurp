import type { EarnConfig } from "../types";

export const citiDoubleCashEarnConfig: EarnConfig = {
  cardId: "citi_double_cash",
  cardName: "Citi Double Cash",
  pointsCurrency: "citi_tp",
  // Effective 2% flat: 1% on purchases + 1% on payments
  baseRate: 2,
  bonusCategories: [],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.5,
    upsideLabel: "With Strata Premier/Elite transfer partners",
  },
};
