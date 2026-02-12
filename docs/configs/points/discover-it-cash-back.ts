import type { EarnConfig } from "./types";

export const discoverItCashBackEarnConfig: EarnConfig = {
  cardId: "discover_it",
  cardName: "Discover it Cash Back",
  pointsCurrency: "cash_back",
  baseRate: 1,
  // NOTE: Rotating 5% quarterly categories ($1,500/quarter combined cap,
  // activation required) are not modeled here because they change each
  // quarter. Categories vary (e.g., grocery, streaming, wholesale clubs,
  // restaurants, gas, Amazon/Target, PayPal, etc.).
  //
  // Year 1 Cashback Match: Discover doubles all cash back earned in the
  // first year (no cap). This effectively makes the card 2x base / 10x
  // rotating in year 1. Not modeled in static config.
  bonusCategories: [],
  caps: [],
  annualFee: 0,
  valuation: {
    conservativeCpp: 1.0,
    upsideCpp: 1.0,
    upsideLabel: "Cash back (fixed value; 2x with Year 1 Cashback Match)",
  },
};
