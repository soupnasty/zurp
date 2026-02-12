import type { CardDefinition } from "@/lib/types";

const CARD_ID = "amex_blue_cash_preferred";

// ── Card Definition ──
// Note: This card's primary value is from cash back earning rates (6% US supermarkets up to
// $6K/yr, 6% streaming, 3% gas, 3% transit/rideshare, 1% everything else). These are NOT
// statement credits and are not tracked as benefits here. The card has no trackable statement
// credits, subscription waivers, or reimbursement benefits.

export const amexBlueCashPreferred: CardDefinition = {
  id: CARD_ID,
  name: "Amex Blue Cash Preferred",
  issuer: "amex",
  network: "amex",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [],
};
