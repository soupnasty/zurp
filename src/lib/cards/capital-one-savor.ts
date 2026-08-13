import type { CardDefinition } from "../types";

// ── Card Definition ──
// Renamed "Savor Cash Rewards" in Oct 2024 (formerly "SavorOne Cash Rewards").
// CAUTION: Capital One reused the "SavorOne" name for a DIFFERENT fair-credit
// card that carries an annual fee — a detection collision (handled in detect.ts,
// not here). The card id stays "capital_one_savor" for continuity.
// Note: Savor's primary value is from cash back earning rates (8x Capital One Entertainment,
// 5x travel portal, 3x dining/entertainment/streaming/groceries, 1% base).
// No trackable statement credits. The Savor has $0 annual fee.

export const capitalOneSavor: CardDefinition = {
  id: "capital_one_savor",
  name: "Capital One Savor Cash Rewards",
  issuer: "capital_one",
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [],
};
