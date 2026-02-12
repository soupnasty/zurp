import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

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
    "Must use within 12-month period",
  ],
  links: [
    { label: "Capital One Travel", url: "https://www.capitalone.com/travel" },
    { label: "Capital One Benefits", url: "https://www.capitalone.com" },
  ],
};

const globalEntryDetails: BenefitDetails = {
  description:
    "Up to $120 annual statement credit for TSA Global Entry ($100), NEXUS ($120), or SENTRI ($99) enrollment or renewal. Reimburses credential application fees. Credit is valid for 5-year period. Posts automatically upon approval.",
  howToUse: [
    "Apply for TSA Global Entry, NEXUS, or SENTRI through official channels",
    "Charge application/renewal fee to your Capital One Venture card",
    "Statement credit posts automatically upon approval",
    "Covers full cost of enrollment for most programs",
    "Resets annually; covers multiple family members if separate cards",
  ],
  links: [
    { label: "TSA Global Entry", url: "https://www.tsa.gov/globalentry" },
    { label: "Capital One Benefits", url: "https://www.capitalone.com" },
  ],
};

const noFtfDetails: BenefitDetails = {
  description:
    "Zero foreign transaction fee on all purchases made outside the United States. Applies to currency conversions and wire transfers. Saves 2-3% on all international spending vs typical cards.",
  howToUse: [
    "Use card for any international purchase",
    "No foreign transaction fee applied",
    "Benefit applies automatically to all foreign transactions",
    "Save money on all overseas spending",
  ],
  links: [
    { label: "Capital One Travel", url: "https://www.capitalone.com/travel" },
  ],
};

// ── Card Definition ──

export const capitalOneVenture: CardDefinition = {
  id: CARD_ID,
  name: "Capital One Venture Rewards",
  issuer: "capital_one",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
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
      merchantPatterns: [
        "airline",
        "hotel",
        "rental car",
        "airbnb",
        "vrbo",
        "expedia",
        "booking",
        "hotels.com",
        "kayak",
        "travel",
      ],
      autoMatchable: true,
      requiresActivation: false,
      priority: 5,
      description:
        "Up to $250 annual statement credit for eligible travel purchases.",
      notes:
        "Resets Jan 1. Covers airlines, hotels, rental cars, vacation rentals, tour operators. Not rideshare/gas/meals.",
      details: travelCreditDetails,
    }),

    // ── Global Entry Credit ($120) ──
    b({
      id: "cov_global_entry_credit",
      name: "Global Entry / TSA PreCheck Credit",
      icon: "Zap",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 10,
      description:
        "Up to $120 annual statement credit for TSA Global Entry, NEXUS, or SENTRI enrollment/renewal.",
      notes:
        "Covers full enrollment cost. Valid for 5-year period. Posts automatically upon approval.",
      details: globalEntryDetails,
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
      autoMatchable: true,
      requiresActivation: false,
      priority: 10,
      description:
        "Zero foreign transaction fees on all international purchases.",
      notes:
        "Saves 2-3% vs typical cards. Applies to all foreign transactions automatically.",
      details: noFtfDetails,
    }),
  ],
};
