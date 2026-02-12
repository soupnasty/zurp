import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "ihg_premier";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const freeNightDetails: BenefitDetails = {
  description:
    "Annual free night certificate valid at any IHG property worldwide up to 40,000 points per night in redemption value. Non-elite members may use at lower-category properties.",
  howToUse: [
    "Log in to ihg.com/rewards",
    "Go to Account → My Benefits",
    "Redeem certificate for a free night at any IHG property",
    "Certificate is automatically reissued each cardmember anniversary",
  ],
  links: [
    { label: "IHG One Rewards", url: "https://www.ihg.com/en/rewards" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/ihg-premier",
    },
  ],
};

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
    b({
      id: "ihg_fnc",
      name: "Annual Free Night Certificate",
      icon: "Hotel",
      category: "travel",
      type: "certificate",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [
        "ihg",
        "holiday inn",
        "crowne plaza",
        "intercontinental",
      ],
      autoMatchable: false,
      requiresActivation: false,
      priority: 30,
      description:
        "Annual free night certificate at any IHG property (up to 40,000 points value).",
      notes: "Valid worldwide. Automatically renews each year.",
      details: freeNightDetails,
    }),
    b({
      id: "ihg_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "Shield",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "tsa pre"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $120 every 4 years for Global Entry or TSA PreCheck.",
      notes: "Covers application fee only.",
      details: globalEntryDetails,
    }),
  ],
};
