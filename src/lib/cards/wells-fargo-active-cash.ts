import type { CardDefinition } from "@/lib/types";

const CARD_ID = "wells_fargo_active_cash";

// ── Card Definition ──
// Note: This card's value is from its flat 2% cash back earning rate on all purchases (uncapped).
// Non-credit perks (Cell Phone Protection $600/claim, CDW $50K secondary) are tracked in the
// perk matrix, not as benefits here.

export const wellsFargoActiveCash: CardDefinition = {
  id: CARD_ID,
  name: "Wells Fargo Active Cash® Card",
  issuer: "wells_fargo",
  network: "visa",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [],
};
