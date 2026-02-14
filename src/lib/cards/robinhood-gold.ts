import type { CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "robinhood_gold";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

export const robinhoodGold: CardDefinition = {
  id: CARD_ID,
  name: "Robinhood Gold Card",
  issuer: "robinhood",
  network: "visa",
  annualFee: 50,
  feeDescriptor: "ROBINHOOD GOLD MEMBERSHIP",
  imageUrl: null,
  isActive: true,
  benefits: [
    // Non-tracked benefits (insurance/perks, not statement credits):
    // - Cell phone protection ($800/claim, 2 claims/yr)
    // - Purchase protection ($500/claim)
    // - Extended warranty (+1 year)
    // - Return protection (90 days)
    // - Travel accident insurance ($250K)
    // - Auto rental CDW (secondary)
    // - Roadside assistance
    // - Zero liability protection

    b({
      id: "rh_gold_no_ftf",
      name: "No Foreign Transaction Fees",
      icon: "Globe",
      category: "travel",
      type: "credit",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 15,
      description: "No foreign transaction fees on international purchases.",
    }),
  ],
};
