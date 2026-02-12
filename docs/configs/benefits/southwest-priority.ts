import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "southwest_priority";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const southwestTravelCreditDetails: BenefitDetails = {
  description:
    "$75 annual Southwest travel credit applied toward any eligible Southwest Airlines purchase including airfare, baggage fees, seat selections, early check-in, and other airline incidentals. Credit is issued each cardmember anniversary.",
  howToUse: [
    "Make any Southwest Airlines purchase using your card",
    "Up to $75 in statement credits apply automatically",
    "Credit covers airfare, baggage, seat upgrades, and incidentals",
    "New credit issued each cardmember anniversary",
  ],
  links: [
    { label: "Southwest Airlines", url: "https://www.southwest.com" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/southwest-rapid-rewards-priority",
    },
  ],
};

const upgradedBoardingDetails: BenefitDetails = {
  description:
    "4 complimentary upgraded boardings per year (valid through 2026) allowing the cardholder to secure earlier boarding positions than standard Group 5 priority boarding. Boarding upgrades expire at year-end.",
  howToUse: [
    "Log in to southwest.com",
    "Go to Manage Bookings → My Trips",
    "Select flight and click 'Upgrade Boarding'",
    "Use one of your 4 annual upgraded boarding certificates",
    "You'll board in an earlier group on that flight",
  ],
  links: [{ label: "Southwest Airlines", url: "https://www.southwest.com" }],
};

// ── Card Definition ──

export const southwestPriority: CardDefinition = {
  id: CARD_ID,
  name: "Southwest Rapid Rewards Priority Visa Signature",
  issuer: "chase",
  network: "visa",
  annualFee: 229,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    b({
      id: "southwest_travel_credit",
      name: "Southwest Travel Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 75,
      cycle: "annual_calendar",
      merchantPatterns: ["southwest", "southwest airlines"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 30,
      description: "Up to $75/year for eligible Southwest purchases.",
      notes: "Covers airfare, baggage, seats, and incidentals.",
      details: southwestTravelCreditDetails,
    }),
    b({
      id: "southwest_upgraded_boarding",
      name: "Upgraded Boardings",
      icon: "Plane",
      category: "travel",
      type: "certificate",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: ["southwest"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 25,
      description: "4 complimentary upgraded boardings per year.",
      notes:
        "Valid through 2026. Expire at year-end. Secure earlier boarding group.",
      details: upgradedBoardingDetails,
    }),
  ],
};
