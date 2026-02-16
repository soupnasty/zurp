import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "./helpers";

const CARD_ID = "wells_fargo_autograph_journey";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const airlineCreditDetails: BenefitDetails = {
  description:
    "Up to $50 in annual statement credits for airline purchases. Credit applies to base airline ticket purchases only and requires a minimum single charge of $50 to trigger the credit. Credit resets each calendar year on January 1 and does not carry over if unused.",
  howToUse: [
    "Book an airline ticket directly with any major carrier (United, Delta, American, Southwest, etc.) or through third-party travel sites (Kayak, Expedia, etc.)",
    "Charge the ticket purchase to your Wells Fargo Autograph Journey card",
    "If the charge is $50 or more, the $50 statement credit will automatically post to your account",
    "Credit typically posts within 1-2 billing cycles",
    "To maximize, book at least one $50+ ticket purchase per calendar year",
  ],
  links: [
    { label: "Wells Fargo Benefits", url: "https://www.wellsfargo.com" },
    {
      label: "Learn More",
      url: "https://www.wellsfargo.com/credit-cards/autograph-journey/",
    },
  ],
};

// ── Card Definition ──
// Note: This card's primary value is from points earning rates (5x hotels, 4x flights/dining,
// 3x gas/transit/streaming, 1x base) and transfer partners (Flying Blue, Avianca, BA at 1:1).
// Non-credit perks (Cell Phone Protection $1K/claim, Trip Cancellation, CDW) are tracked
// in the perk matrix, not as benefits here.

export const wellsFargoAutographJourney: CardDefinition = {
  id: CARD_ID,
  name: "Wells Fargo Autograph Journey℠",
  issuer: "wells_fargo",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Annual Airline Credit ($50/year) ──
    b({
      id: "autograph_journey_airline_credit",
      name: "Annual Airline Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 50,
      cycle: "annual_calendar",
      merchantPatterns: [
        "airline",
        "united",
        "delta",
        "american air",
        "southwest",
        "alaska air",
        "jetblue",
        "spirit",
        "frontier",
      ],
      plaidCategories: ["TRAVEL_FLIGHTS", "TRANSPORTATION_AIRLINES_AND_AVIATION_SERVICES"],
      autoMatchable: true,
      requiresActivation: false,
      isCategoryFallback: true,
      priority: 15,
      description:
        "Up to $50 in annual statement credits for airline purchases.",
      notes:
        "Minimum single charge of $50 required to trigger credit. Credit resets January 1 each year and does not carry over if unused.",
      details: airlineCreditDetails,
      lifestyleKey: "airline_fee",
    }),
  ],
};
