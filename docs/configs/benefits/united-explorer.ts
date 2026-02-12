import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "united_explorer";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const unitedTravelCreditDetails: BenefitDetails = {
  description:
    "$100 annual United travel credit applied toward any eligible United purchase including airfare, baggage fees, seat selections, and other airline incidentals. Credit is issued each cardmember anniversary year.",
  howToUse: [
    "Make any United Airlines purchase using your Explorer card",
    "Up to $100 in statement credits apply automatically",
    "Credit covers airfare, baggage, seat upgrades, and incidentals",
    "New credit issued each cardmember anniversary",
  ],
  links: [
    { label: "United Airlines", url: "https://www.united.com" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/united-explorer",
    },
  ],
};

const unitedClubDetails: BenefitDetails = {
  description:
    "Two complimentary United Club one-time passes per calendar year, granting access to United Club lounges at select airport locations. Passes are non-transferable and must be used within the same calendar year.",
  howToUse: [
    "Log in to mileageplus.united.com",
    "Go to My Account \u2192 United Club passes",
    "Select available pass dates",
    "Download pass or email to yourself",
    "Present pass at United Club entrance on travel day",
  ],
  links: [
    {
      label: "United Club",
      url: "https://www.united.com/en/us/fly/united-club/",
    },
  ],
};

const rideshareCreditDetails: BenefitDetails = {
  description:
    "$60 annual airport rideshare credit for ground transportation to and from the airport. Credit is automatically applied as statement credits for eligible airport trips booked through designated rideshare apps.",
  howToUse: [
    "Use your United Explorer card to pay for rideshare trips to or from the airport",
    "Eligible trips are automatically detected based on pickup/dropoff location",
    "Statement credits post automatically after qualifying rideshare charges",
    "Up to $60 per cardmember anniversary year",
  ],
  links: [
    { label: "United Airlines", url: "https://www.united.com" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/united-explorer",
    },
  ],
};

const instacartCreditDetails: BenefitDetails = {
  description:
    "Up to $120 annually in Instacart credits for grocery delivery and convenience item purchases on the Instacart platform. Credits are typically distributed as periodic credits throughout the year.",
  howToUse: [
    "Add your United Explorer card as a payment method in the Instacart app",
    "Make eligible grocery delivery purchases through Instacart",
    "Statement credits post automatically after qualifying Instacart charges",
    "Up to $120 per cardmember year",
  ],
  links: [
    { label: "Instacart", url: "https://www.instacart.com" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/united-explorer",
    },
  ],
};

// ── Card Definition ──

export const unitedExplorer: CardDefinition = {
  id: CARD_ID,
  name: "United\u2120 Explorer Card",
  issuer: "chase",
  network: "visa",
  annualFee: 150,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── United Travel Credit ($100/year) ──
    b({
      id: "united_travel_credit",
      name: "United Travel Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_anniversary",
      merchantPatterns: ["united", "united airlines", "united air"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 10,
      description: "Up to $100/year for eligible United Airlines purchases.",
      notes:
        "Covers airfare, baggage, seat upgrades, and incidentals. Anniversary year cycle.",
      details: unitedTravelCreditDetails,
    }),

    // ── Airport Rideshare Credit ($60/year) ──
    b({
      id: "united_rideshare_credit",
      name: "Airport Rideshare Credit",
      icon: "Car",
      category: "transport",
      type: "credit",
      creditAmount: 60,
      cycle: "annual_anniversary",
      merchantPatterns: ["uber", "lyft"],
      plaidCategories: ["TRANSPORTATION_RIDESHARE"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 20,
      description: "Up to $60/year for rideshare trips to/from the airport.",
      notes:
        "Eligible trips are auto-detected based on airport pickup/dropoff location.",
      details: rideshareCreditDetails,
    }),

    // ── Instacart Credit ($120/year) ──
    b({
      id: "united_instacart_credit",
      name: "Instacart Credit",
      icon: "ShoppingCart",
      category: "shopping",
      type: "credit",
      creditAmount: 120,
      cycle: "annual_anniversary",
      merchantPatterns: ["instacart"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $120/year for Instacart grocery delivery purchases.",
      notes: "Credits distributed periodically throughout the year.",
      details: instacartCreditDetails,
      brandSlug: "instacart",
    }),

    // ── United Club One-Time Passes (2/year) ──
    b({
      id: "united_club_passes",
      name: "United Club One-Time Passes",
      icon: "Coffee",
      category: "travel",
      type: "certificate",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: ["united"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 30,
      description: "Two complimentary United Club one-time passes per year.",
      notes: "Non-transferable. Must be used within same calendar year.",
      details: unitedClubDetails,
    }),
  ],
};
