import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "ink_business_preferred";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

// Ink Business Preferred is primarily an earning card with limited statement credits
// Focus on trackable benefits only (no multipliers per requirements)

// ── Card Definition ──

export const inkBusinessPreferred: CardDefinition = {
  id: CARD_ID,
  name: "Chase Ink Business Preferred Credit Card",
  issuer: "chase",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // Ink Business Preferred has very few trackable statement credits
    // The primary benefits are earning rates (3x on travel, shipping, internet, phone, advertising)
    // and Lyft 5x bonus through Sep 2027, which are not included per requirements
    // This card has minimal benefits to display
  ],
};
