import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "us_bank_altitude_connect";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const globalEntryTsaPreCheckDetails: BenefitDetails = {
  description:
    "Up to $100 credit toward Global Entry, TSA PreCheck, or other trusted traveler programs. Credit provided once every 4 years. Covers the full application and renewal fees for eligible expedited security programs. Must submit receipt for reimbursement.",
  howToUse: [
    "Apply for Global Entry, TSA PreCheck, NEXUS, SENTRI, or another eligible trusted traveler program",
    "Charge the application or renewal fee to your US Bank Altitude Connect card",
    "After approval, submit your receipt to US Bank for reimbursement",
    "Credit of up to $100 will post as a statement credit",
    "Benefit resets every 4 years from date of last reimbursement",
  ],
  links: [
    { label: "US Bank Benefits", url: "https://www.usbank.com" },
    { label: "Global Entry", url: "https://www.globalentry.gov" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
    {
      label: "Learn More",
      url: "https://www.usbank.com/credit-cards/altitude-connect-visa-signature-card.html",
    },
  ],
};

const priorityPassDetails: BenefitDetails = {
  description:
    "Priority Pass Select membership with 4 complimentary airport lounge visits per year at over 1,300 lounges worldwide. Additional visits incur standard Priority Pass fees. Benefit is renewed annually on your card anniversary.",
  howToUse: [
    "Enroll in Priority Pass through your US Bank account",
    "Download the Priority Pass app or visit prioritypass.com",
    "Locate and visit participating airport lounges worldwide",
    "Present your Priority Pass membership card or app at lounge entrance",
    "Enjoy complimentary access for you and one additional guest per visit (4 visits per year)",
    "Additional visits beyond 4 per year incur standard fees",
  ],
  links: [
    { label: "Priority Pass", url: "https://www.prioritypass.com" },
    { label: "US Bank Benefits", url: "https://www.usbank.com" },
    {
      label: "Learn More",
      url: "https://www.usbank.com/credit-cards/altitude-connect-visa-signature-card.html",
    },
  ],
};

// ── Card Definition ──

export const usBankAltitudeConnect: CardDefinition = {
  id: CARD_ID,
  name: "US Bank Altitude Connect",
  issuer: "us_bank",
  network: "visa",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Global Entry/TSA PreCheck Credit ($100 every 4 years) ──
    b({
      id: "altitude_connect_global_entry_credit",
      name: "Global Entry/TSA PreCheck Credit",
      icon: "Zap",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "trusted traveler"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description:
        "Up to $100 credit toward Global Entry, TSA PreCheck, or trusted traveler programs.",
      notes:
        "Credit provided once every 4 years from date of last reimbursement. Covers application and renewal fees for expedited security programs.",
      details: globalEntryTsaPreCheckDetails,
    }),

    // ── Priority Pass Select (4 lounge visits annually) ──
    b({
      id: "altitude_connect_priority_pass",
      name: "Priority Pass Select",
      icon: "DoorOpen",
      category: "travel",
      type: "benefit",
      cycle: "annual",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: true,
      priority: 15,
      description:
        "Priority Pass Select membership with 4 complimentary airport lounge visits per year.",
      notes:
        "Provides access to over 1,300 lounges worldwide. Additional visits beyond 4 per year incur standard fees. Benefits renew annually on card anniversary.",
      details: priorityPassDetails,
    }),
  ],
};
