import type { CardDefinition } from "@/lib/types";

const CARD_ID = "discover_it_cash_back";

// ── Card Definition ──
// Note: This card's value is entirely from cash back earning rates (5% rotating quarterly
// categories up to $1,500/qtr, 1% everything else) and the first-year Cashback Match that
// doubles all earnings. These are NOT statement credits and are not tracked as benefits here.

export const discoverItCashBack: CardDefinition = {
  id: CARD_ID,
  name: "Discover it\u00AE Cash Back",
  issuer: "discover",
  network: "discover",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [],
};
