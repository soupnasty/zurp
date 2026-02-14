import type { CardDefinition } from "../types";

// ── Card Definition ──
// Note: SavorOne's primary value is from cash back earning rates (8x Capital One Entertainment,
// 5x travel portal, 3x dining/entertainment/streaming/groceries, 1% base).
// No trackable statement credits. The SavorOne has $0 annual fee (the original Savor has $95 fee).

export const capitalOneSavor: CardDefinition = {
  id: "capital_one_savor",
  name: "Capital One SavorOne Cash Rewards",
  issuer: "capital_one",
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [],
};
