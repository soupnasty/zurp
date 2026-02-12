import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "robinhood_gold";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Card Definition ──

export const robinhoodGold: CardDefinition = {
  id: CARD_ID,
  name: "Robinhood Gold Card",
  issuer: "coastal_community_bank",
  network: "visa",
  annualFee: 50,
  feeDescriptor: "Robinhood Gold membership fee (card is free)",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── No Foreign Transaction Fees ──
    b({
      id: "rh_gold_no_ftf",
      name: "No Foreign Transaction Fees",
      icon: "Globe",
      category: "travel",
      type: "credit",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: true,
      requiresActivation: false,
      priority: 15,
      description: "No foreign transaction fees on international purchases.",
      notes:
        "Standard on Visa Signature. Tracks international merchants automatically.",
    }),
  ],
};
