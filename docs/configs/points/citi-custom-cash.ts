import type { EarnConfig } from "./types";

export const citiCustomCashEarnConfig: EarnConfig = {
  cardId: "citi_custom_cash",
  cardName: "Citi Custom Cash",
  pointsCurrency: "citi_tp",
  baseRate: 1,
  // NOTE: The card's signature feature — 5% back on your top eligible
  // spending category each billing cycle ($500/cycle cap) — is dynamic
  // and not modeled in this static config. Eligible categories include:
  // restaurants, gas stations, groceries, travel, transit, streaming,
  // drugstores, home improvement, fitness, and entertainment.
  //
  // The engine should track per-cycle spending across these 10 categories
  // and apply 5% to whichever had the highest dollar total that cycle.
  bonusCategories: [],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.5,
    upsideLabel: "With Strata Premier/Elite transfer partners",
  },
};
