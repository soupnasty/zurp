import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

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

export const wellsFargoAutographJourney: CardDefinition = {
  id: CARD_ID,
  name: "Wells Fargo Autograph Journey Visa Signature",
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
      cycle: "annual",
      merchantPatterns: [
        "airline",
        "united",
        "delta",
        "american",
        "southwest",
        "alaska",
        "jetblue",
        "spirit",
        "frontier",
      ],
      autoMatchable: true,
      requiresActivation: false,
      priority: 15,
      description:
        "Up to $50 in annual statement credits for airline purchases.",
      notes:
        "Minimum single charge of $50 required to trigger credit. Credit resets January 1 each year and does not carry over if unused.",
      details: airlineCreditDetails,
    }),
  ],
};
