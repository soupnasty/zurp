import type { CardDefinition } from "@/lib/types";

const CARD_ID = "citi_double_cash";

// ── Card Definition ──
// Note: This card's value is from its 2% cash back earning rate (1% on purchase + 1% when
// paid) and ThankYou Points pooling with Citi Strata cards. These are NOT statement credits
// and are not tracked as benefits here. The card has no trackable credits or subscription waivers.

export const citiDoubleCash: CardDefinition = {
  id: CARD_ID,
  name: "Citi Double Cash\u00AE Card",
  issuer: "citi",
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [],
};
