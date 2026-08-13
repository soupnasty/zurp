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
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // Non-tracked benefits (insurance/perks, not statement credits):
    // NOTE: This card has NO cell phone protection (verified against
    // Robinhood's official Visa benefits page).
    // - Purchase protection ($500/claim)
    // - Extended warranty (+1 year)
    // - Return protection (90 days)
    // - Travel accident insurance ($250K)
    // - Auto rental CDW (secondary)
    // - Roadside assistance
    // - Zero liability protection

    // Deactivated (sunset) rather than deleted — may have usage history.
    // Accounts opened on/after 2026-07-01 pay a 3% foreign transaction fee;
    // only accounts opened before 2026-07-01 are grandfathered into no FTF.
    // Since Compare mostly serves prospective applicants, this benefit is
    // sunset as of 2026-06-30 (source: robinhood.com FAQ, primary).
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
      sunsetDate: "2026-06-30",
      description:
        "No foreign transaction fees for accounts opened before July 1, 2026.",
      notes:
        "Accounts opened on/after 7/1/2026 pay 3% FTF. Pre-7/2026 accounts are grandfathered into no foreign transaction fees.",
    }),
  ],
};
