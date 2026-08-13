import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "southwest_priority";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const southwestTravelCreditDetails: BenefitDetails = {
  description:
    "DISCONTINUED: The $75 annual Southwest travel credit was removed in the July 2025 card refresh and ended 12/31/2025. It previously applied toward eligible Southwest Airlines purchases including airfare, baggage fees, seat selections, and other airline incidentals.",
  howToUse: [
    "This benefit ended 12/31/2025 and is no longer available",
    "Historical usage before that date remains tracked",
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
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // Extra Legroom seat upgrades (unlimited, within 48h of departure) + Group 5
    // boarding (replaced Upgraded Boardings on Jan 27, 2026) tracked in perk
    // matrix only.
    // ── Southwest Travel Credit (DISCONTINUED 12/31/2025) ──
    // Kept (not deleted) because users may have usage history. sunsetDate in
    // the past deactivates it going forward.
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
      description: "Discontinued: $75/year Southwest travel credit ended 12/31/2025.",
      notes:
        "DISCONTINUED in the July 2025 card refresh; last valid 12/31/2025. Retained for historical usage only.",
      sunsetDate: "2025-12-31",
      details: southwestTravelCreditDetails,
      lifestyleKey: "southwest",
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
