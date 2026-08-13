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
    "Up to $50 in annual statement credits for airline purchases. Any airline-MCC charge of $50 or more qualifies — flights, baggage fees, seat fees, upgrades, and lounge passes (charter and private jet purchases are excluded). The 12-month annual airline credit period begins the first day of the month after your annual fee is assessed, then renews every 12 months; unused credit does not carry over.",
  howToUse: [
    "Make any airline purchase of $50+ — a flight, baggage fee, seat fee, upgrade, or lounge pass — directly with the airline or through third-party travel sites (Kayak, Expedia, etc.)",
    "Charge the purchase to your Wells Fargo Autograph Journey card",
    "If the single charge is $50 or more, the $50 statement credit will automatically post to your account",
    "Credit typically posts within 1-2 billing cycles",
    "To maximize, make at least one $50+ airline purchase each 12-month credit period (starts the month after your annual fee is assessed)",
  ],
  links: [
    { label: "Wells Fargo Benefits", url: "https://www.wellsfargo.com" },
    {
      label: "Learn More",
      url: "https://creditcards.wellsfargo.com/autograph-journey-visa-credit-card/",
    },
  ],
};

// ── Card Definition ──
// Note: This card's primary value is from points earning rates (5x hotels, 4x airlines,
// 3x restaurants and other travel incl. rental cars/cruises, 1x base) and transfer partners
// (8 airlines at 1:1 — Aer Lingus, Avianca, Flying Blue, BA, Iberia, Virgin Atlantic,
// JetBlue added Nov 2025, Cathay Pacific added Apr 2026; hotels: Choice at 1:2 and Wyndham).
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
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // ── Annual Airline Credit ($50/year) ──
    b({
      id: "autograph_journey_airline_credit",
      name: "Annual Airline Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 50,
      cycle: "annual_anniversary",
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
        "Up to $50 in annual statement credits for airline purchases of $50 or more.",
      notes:
        "Minimum single airline-MCC charge of $50 required to trigger credit (flights, bags, seat fees, upgrades, lounge passes; charter/private jet excluded). The 12-month credit period begins the first day of the month after the annual fee is assessed, then renews every 12 months; unused credit does not carry over.",
      details: airlineCreditDetails,
      lifestyleKey: "airline_fee",
    }),
  ],
};
