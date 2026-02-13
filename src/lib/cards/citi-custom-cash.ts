import type { CardDefinition } from "@/lib/types";

const CARD_ID = "citi_custom_cash";

// ── Card Definition ──
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
  benefits: [],
};
