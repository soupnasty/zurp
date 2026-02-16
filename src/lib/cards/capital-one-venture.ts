import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "capital_one_venture";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const travelCreditDetails: BenefitDetails = {
  description:
    "Up to $250 annual statement credit for eligible travel purchases. Resets each calendar year. Covers airline tickets, hotels, rental cars, vacation rentals, tour operators, and travel agencies. Does not cover rideshare, gas, parking, or meals during travel.",
  howToUse: [
    "Make an eligible travel purchase (airline, hotel, rental car, etc.)",
    "Charge to your Capital One Venture card",
    "Statement credit posts automatically within 1-2 billing cycles",
    "Resets Jan 1 each year; unused credits do not roll over",
  ],
  links: [
    { label: "Capital One Travel", url: "https://travel.capitalone.com" },
    { label: "Venture Benefits", url: "https://www.capitalone.com/credit-cards/venture/" },
  ],
};

const globalEntryDetails: BenefitDetails = {
  description:
    "Up to $120 statement credit for Global Entry ($120), TSA PreCheck ($78-$98), or NEXUS ($50) application fee every four years. Global Entry includes TSA PreCheck, making it the better value. Covers the primary cardmember only.",
  howToUse: [
    "Apply for Global Entry, TSA PreCheck, or NEXUS through the official government site (ttp.cbp.dhs.gov)",
    "Pay the application fee with your Venture card",
    "The statement credit posts automatically within 1-2 billing cycles",
    "No activation or enrollment needed — just use your Venture for payment",
  ],
  links: [
    { label: "Global Entry Application", url: "https://ttp.cbp.dhs.gov/" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
    { label: "Venture Benefits", url: "https://www.capitalone.com/credit-cards/venture/" },
  ],
};

const noFtfDetails: BenefitDetails = {
  description:
    "Zero foreign transaction fee on all purchases made outside the United States. Applies to currency conversions and international merchants. Saves 2-3% on all international spending vs typical cards.",
  howToUse: [
    "Use card for any international purchase",
    "No foreign transaction fee applied",
    "Benefit applies automatically to all foreign transactions",
  ],
  links: [
    { label: "Venture Benefits", url: "https://www.capitalone.com/credit-cards/venture/" },
  ],
};

// ── Card Definition ──

export const capitalOneVenture: CardDefinition = {
  id: CARD_ID,
  name: "Capital One Venture Rewards",
  issuer: "capital_one",
  network: "mastercard",
  annualFee: 95,
  feeDescriptor: "CAPITAL ONE ANNUAL FEE",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Annual Travel Credit ($250) ──
    b({
      id: "cov_annual_travel_credit",
      name: "Annual Travel Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 250,
      cycle: "annual_calendar",
      autoMatchable: false,
      requiresActivation: false,
      priority: 50,
      merchantPatterns: ["capital one travel", "capitalone travel"],
      description:
        "$250 annual statement credit for eligible travel purchases. Resets each calendar year.",
      details: travelCreditDetails,
      lifestyleKey: "travel_portal",
    }),

    // ── Global Entry / TSA PreCheck Credit ($120) ──
    b({
      id: "cov_global_entry_credit",
      name: "Global Entry / TSA PreCheck",
      icon: "ShieldCheck",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa", "goes", "trusted traveler"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 30,
      description:
        "Up to $120 credit for Global Entry or TSA PreCheck application fee every 4 years.",
      details: globalEntryDetails,
      lifestyleKey: "global_entry",
    }),

    // ── No Foreign Transaction Fees ──
    b({
      id: "cov_no_ftf",
      name: "No Foreign Transaction Fees",
      icon: "Globe",
      category: "travel",
      type: "credit",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 10,
      description:
        "Zero foreign transaction fees on all international purchases.",
      details: noFtfDetails,
    }),
  ],
};
