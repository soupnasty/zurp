import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

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

const southwestAnniversaryPointsDetails: BenefitDetails = {
  description:
    "7,500 bonus Rapid Rewards points awarded each cardmember anniversary. Annual value of approximately $97-$112 based on typical 1.3-1.5 cents per point redemption value.",
  howToUse: [
    "Bonus points are automatically deposited to your account on your anniversary date",
    "No enrollment or activation required",
    "Points can be redeemed for any Southwest flight or applied to seat upgrades",
    "Annual bonus issued every year you hold the card",
  ],
  links: [
    { label: "Southwest Airlines", url: "https://www.southwest.com" },
    {
      label: "Rapid Rewards Program",
      url: "https://www.southwest.com/rapidrewards/",
    },
  ],
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
    // Upgraded Boardings (certificate) tracked in perk matrix only.
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
    // ── Anniversary Bonus Points (7,500 points/year) ──
    b({
      id: "southwest_anniversary_points",
      name: "Anniversary Bonus Points",
      icon: "Gift",
      category: "travel",
      type: "credit",
      creditAmount: 112, // ~7,500 points × 1.5cpp
      cycle: "annual_anniversary",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 40,
      description:
        "7,500 bonus Rapid Rewards points each cardmember anniversary (~$97-$112 value).",
      notes:
        "Points auto-deposited on anniversary date. Value estimated at 1.3-1.5cpp.",
      details: southwestAnniversaryPointsDetails,
    }),
  ],
};
