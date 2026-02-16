import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "ihg_premier";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const globalEntryDetails: BenefitDetails = {
  description:
    "$120 statement credit every 4 years toward Global Entry, TSA PreCheck, or other trusted traveler programs.",
  howToUse: [
    "Apply for Global Entry ($120) or TSA PreCheck ($85) through official government sites",
    "Pay with your IHG Premier card",
    "Statement credit posts automatically after the charge",
    "Credit is available every 4 years",
  ],
  links: [
    {
      label: "Global Entry",
      url: "https://www.cbp.gov/travel/trusted-traveler-programs/global-entry",
    },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
  ],
};

// ── Card Definition ──

export const ihgPremier: CardDefinition = {
  id: CARD_ID,
  name: "IHG One Rewards Premier Chase",
  issuer: "chase",
  network: "visa",
  annualFee: 99,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // Non-tracked benefits (certificates, tracked in perk matrix only):
    // - Free Night Certificate (annual, up to 40,000 points value)
    b({
      id: "ihg_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "Shield",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "tsa pre", "goes", "trusted traveler"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $120 every 4 years for Global Entry or TSA PreCheck.",
      notes: "Covers application fee only.",
      details: globalEntryDetails,
      lifestyleKey: "global_entry",
    }),
  ],
};
