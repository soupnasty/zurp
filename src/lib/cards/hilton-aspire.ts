import type { BenefitDetails, CardDefinition } from "../types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "./helpers";

const CARD_ID = "hilton_aspire";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const hiltonResortCreditDetails: BenefitDetails = {
  description:
    "$400 annual Hilton resort credit distributed as two $200 semi-annual credits for prepaid room rates, resort fees, food and beverage, or other hotel incidentals at Hilton properties. Credits reset semi-annually and do not carry over if unused.",
  howToUse: [
    "Book a stay at any Hilton Honors property",
    "Pay with your Hilton Honors Amex Aspire",
    "Charge room, food & beverage, resort fees, or incidentals",
    "Statement credit posts automatically after the charge",
    "Credits reset each 6 months",
  ],
  links: [
    { label: "Hilton Properties", url: "https://www.hilton.com" },
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
  ],
};

const hiltonAirlineDetails: BenefitDetails = {
  description:
    "$200 annual airline credit distributed as four $50 quarterly credits toward airline tickets, baggage fees, seat selections, or other airline incidentals with any carrier worldwide.",
  howToUse: [
    "Log in to americanexpress.com",
    "Go to Benefits → Airline Fee Credit",
    "Pay for airline purchases with your Hilton Honors Amex Aspire",
    "Statement credit posts automatically after the charge",
    "Credits reset each quarter",
  ],
  links: [
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
  ],
};

const clearPlusCreditDetails: BenefitDetails = {
  description:
    "$209 annual credit toward CLEAR Plus membership (biometric airport security screening at 50+ U.S. airports).",
  howToUse: [
    "Sign up for CLEAR Plus at clearme.com",
    "Pay with your Hilton Honors Amex Aspire",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "CLEAR", url: "https://www.clearme.com" },
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
  ],
};

// ── Card Definition ──

export const hiltonAspire: CardDefinition = {
  id: CARD_ID,
  name: "Hilton Honors American Express Aspire Card",
  issuer: "amex",
  network: "amex",
  annualFee: 550,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // Non-tracked benefits (certificates, tracked in perk matrix only):
    // - Free Night Certificate (annual)

    // ── Semi-annual Hilton Resort Credits ($200/half × 2) ──
    ...expandCycles(
      CARD_ID,
      {
        name: "Hilton Resort Credit",
        icon: "Hotel",
        category: "travel",
        type: "credit",
        creditAmount: 200,
        merchantPatterns: [
          "hilton", "waldorf", "conrad", "lxr",
          "doubletree", "embassy suites", "hilton garden inn",
          "hampton inn", "hampton by hilton", "homewood suites",
          "home2 suites", "tru by hilton", "canopy by hilton",
          "curio collection", "tapestry collection", "tempo by hilton",
          "motto by hilton", "signia", "graduate hotel",
          "spark by hilton", "nomad",
        ],
        autoMatchable: true,
        requiresActivation: false,
        priority: 25,
        notes:
          "Valid at any Hilton property worldwide for room, F&B, and resort fees.",
        details: hiltonResortCreditDetails,
      },
      [
        {
          id: "hilton_resort_h1",
          cycle: "biannual_h1",
          name: "Hilton Resort Credit (H1)",
          description: "Up to $200 Hilton resort credit (Jan–Jun).",
        },
        {
          id: "hilton_resort_h2",
          cycle: "biannual_h2",
          name: "Hilton Resort Credit (H2)",
          description: "Up to $200 Hilton resort credit (Jul–Dec).",
        },
      ]
    ),

    // ── Quarterly Airline Credits ($50/quarter × 4) ──
    ...expandCycles(
      CARD_ID,
      {
        name: "Airline Fee Credit",
        icon: "Plane",
        category: "travel",
        type: "credit",
        creditAmount: 50,
        merchantPatterns: [
          "delta",
          "united",
          "southwest",
          "american airlines",
          "united airlines",
          "spirit airlines",
          "frontier airlines",
          "alaska airlines",
          "jetblue",
          "alaska air",
        ],
        autoMatchable: true,
        requiresActivation: true,
        priority: 20,
        notes:
          "Any carrier. Covers baggage, seat upgrades, and incidentals. NOT airfare.",
        details: hiltonAirlineDetails,
      },
      [
        {
          id: "hilton_airline_q1",
          cycle: "quarterly_q1",
          name: "Airline Fee Credit (Q1)",
          description: "Up to $50 airline incidental credit (Jan–Mar).",
        },
        {
          id: "hilton_airline_q2",
          cycle: "quarterly_q2",
          name: "Airline Fee Credit (Q2)",
          description: "Up to $50 airline incidental credit (Apr–Jun).",
        },
        {
          id: "hilton_airline_q3",
          cycle: "quarterly_q3",
          name: "Airline Fee Credit (Q3)",
          description: "Up to $50 airline incidental credit (Jul–Sep).",
        },
        {
          id: "hilton_airline_q4",
          cycle: "quarterly_q4",
          name: "Airline Fee Credit (Q4)",
          description: "Up to $50 airline incidental credit (Oct–Dec).",
        },
      ]
    ),

    // ── Annual Benefits ──
    b({
      id: "hilton_clear_credit",
      name: "CLEAR Plus Credit",
      icon: "Shield",
      category: "travel",
      type: "credit",
      creditAmount: 209,
      cycle: "annual_calendar",
      merchantPatterns: ["clear", "clearme"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $209/year covering CLEAR Plus membership.",
      notes: "Covers annual CLEAR Plus membership fee.",
      details: clearPlusCreditDetails,
    }),
  ],
};
