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
    "$400 annual Hilton resort credit distributed as two $200 semi-annual credits for eligible purchases — including room rate, resort fees, food and beverage, and other incidentals — at participating Hilton Resorts (properties on Hilton's eligible resort list, NOT all Hilton properties). Credits reset semi-annually and do not carry over if unused.",
  howToUse: [
    "Check Hilton's eligible resort list for participating Hilton Resorts",
    "Book a stay at a participating resort",
    "Pay with your Hilton Honors Amex Aspire",
    "Charge room rate, food & beverage, resort fees, or incidentals to the card",
    "Statement credit posts automatically after the charge",
    "Credits reset each 6 months",
  ],
  links: [
    {
      label: "Eligible Hilton Resorts",
      url: "https://www.hilton.com/en/amex-cards/eligible-hotels/",
    },
    { label: "Hilton Properties", url: "https://www.hilton.com" },
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
  ],
};

const hiltonAirlineDetails: BenefitDetails = {
  description:
    "$200 annual flight credit distributed as four $50 quarterly credits on flight purchases — INCLUDING airfare — made directly with airlines or through AmexTravel.com. No airline pre-selection required and no incidentals-only restriction.",
  howToUse: [
    "Buy a flight directly from any airline, or book through AmexTravel.com",
    "Pay with your Hilton Honors Amex Aspire",
    "Statement credit posts automatically after the charge",
    "Credits reset each quarter",
  ],
  links: [
    { label: "AmexTravel.com", url: "https://travel.americanexpress.com" },
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
  ],
};

const clearPlusCreditDetails: BenefitDetails = {
  description:
    "$219 annual credit toward CLEAR Plus membership (currently $219/yr after the 7/1/2026 price increase; biometric airport security screening at 50+ U.S. airports).",
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
  lastVerifiedAt: "2026-08-13",
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
          "Valid only at participating Hilton Resorts (see Hilton's eligible resort list), not all Hilton properties. Covers room rate, F&B, and resort fees.",
        details: hiltonResortCreditDetails,
        lifestyleKey: "hilton_resorts",
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

    // ── Quarterly Airline Flight Credits ($50/quarter × 4) ──
    ...expandCycles(
      CARD_ID,
      {
        name: "Airline Flight Credit",
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
          "amextravel",
          "amex travel",
        ],
        autoMatchable: true,
        requiresActivation: true,
        priority: 20,
        notes:
          "Flight purchases INCLUDING airfare, made directly with airlines or via AmexTravel.com. No airline pre-selection, no incidentals-only restriction.",
        details: hiltonAirlineDetails,
        lifestyleKey: "airline_fee",
      },
      [
        {
          id: "hilton_airline_q1",
          cycle: "quarterly_q1",
          name: "Airline Flight Credit (Q1)",
          description: "Up to $50 flight credit, airfare included (Jan–Mar).",
        },
        {
          id: "hilton_airline_q2",
          cycle: "quarterly_q2",
          name: "Airline Flight Credit (Q2)",
          description: "Up to $50 flight credit, airfare included (Apr–Jun).",
        },
        {
          id: "hilton_airline_q3",
          cycle: "quarterly_q3",
          name: "Airline Flight Credit (Q3)",
          description: "Up to $50 flight credit, airfare included (Jul–Sep).",
        },
        {
          id: "hilton_airline_q4",
          cycle: "quarterly_q4",
          name: "Airline Flight Credit (Q4)",
          description: "Up to $50 flight credit, airfare included (Oct–Dec).",
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
      creditAmount: 219,
      cycle: "annual_calendar",
      merchantPatterns: ["clear", "clearme"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $219/year covering CLEAR Plus membership.",
      notes: "Covers annual CLEAR Plus membership fee ($219/yr as of 7/1/2026).",
      details: clearPlusCreditDetails,
      lifestyleKey: "clear_plus",
    }),
  ],
};
