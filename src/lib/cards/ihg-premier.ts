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

const unitedTravelBankDetails: BenefitDetails = {
  description:
    "$50 in United TravelBank cash each calendar year. Requires registering your MileagePlus number for the benefit. The cash is deposited into your United TravelBank account (not issued as a statement credit) and can be applied toward United flight purchases.",
  howToUse: [
    "Register your MileagePlus number for the benefit (required each account)",
    "$50 in TravelBank cash is deposited into your United TravelBank account",
    "Apply TravelBank cash toward United flight purchases at checkout on united.com",
    "New $50 deposit each calendar year",
  ],
  links: [
    { label: "United TravelBank", url: "https://www.united.com/en/us/travelbank" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/ihg-rewards-premier",
    },
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
  lastVerifiedAt: "2026-08-13",
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
    // ── United TravelBank Cash ($50/year) ──
    // NOTE: Delivered as a TravelBank deposit, not a statement credit, so it
    // cannot be auto-matched against card transactions.
    b({
      id: "ihg_united_travelbank",
      name: "United TravelBank Cash",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 50,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: true,
      priority: 30,
      description: "$50 in United TravelBank cash per calendar year.",
      notes:
        "Requires MileagePlus registration. Deposited to your United TravelBank account (not a statement credit) — mark used manually once deposited.",
      details: unitedTravelBankDetails,
    }),
  ],
};
