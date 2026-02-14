import type { EarnConfig } from "../types";

export const citiCustomCashEarnConfig: EarnConfig = {
  cardId: "citi_custom_cash",
  cardName: "Citi Custom Cash",
  pointsCurrency: "citi_tp",
  baseRate: 1,
  // DYNAMIC BONUS FEATURE — Cannot be modeled statically:
  // The Citi Custom Cash's signature feature is a 5% auto-select bonus on
  // the cardholder's top spending category per billing cycle. The system
  // automatically determines the category with the highest spend each cycle
  // and applies 5% to those purchases (capped at $500 spend = $25 max reward).
  //
  // Eligible 5% categories: restaurants, gas stations, groceries, travel,
  // transit, streaming, drugstores, home improvement, fitness, entertainment.
  //
  // Since this feature requires dynamic per-cycle category tracking at the
  // time of statement closing (not at transaction time), it cannot be
  // modeled in this static earn config. Instead, the simulator uses a
  // heuristic: for each calendar month, it determines the top category by
  // spending, then retroactively applies 5% capped at $500 as if that
  // category was selected for that month.
  //
  // UI should display a footnote on earn simulations: "Estimated based on
  // your top spending category per month; actual bonus resets on your
  // billing cycle and applies to your #1 category that cycle."
  bonusCategories: [],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.5,
    upsideLabel: "With Strata Premier/Elite transfer partners",
  },
};
