import type { CardDefinition } from "@/lib/types";

const CARD_ID = "citi_custom_cash";

// ── Card Definition ──
// DISCONTINUED FOR NEW APPLICATIONS as of May 28, 2026 (verified 2026-08-13).
// Existing cardholders keep the card and its earn structure, so isActive stays true
// (CardDefinition has no "closed to new applicants" field; Compare-page framing is
// handled separately).
// Note: This card's value is from its auto-selected 5% cash back on your top spending category
// each billing cycle ($500 cap) and ThankYou Points pooling. These are NOT statement credits
// and are not tracked as benefits here. The card has no trackable credits or subscription waivers.

export const citiCustomCash: CardDefinition = {
  id: CARD_ID,
  name: "Citi Custom Cash® Card",
  issuer: "citi",
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [],
};
