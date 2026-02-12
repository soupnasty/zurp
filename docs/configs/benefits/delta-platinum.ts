import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "delta_platinum";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const deltaFlightCreditDetails: BenefitDetails = {
  description:
    "$200 annual Delta flight credit automatically applied to eligible Delta Air Lines purchases including airfare, baggage fees, seat selections, and other airline incidentals. Requires $10,000 in annual card spending to be activated.",
  howToUse: [
    "Spend $10,000 on your Delta Platinum card within a calendar year",
    "Credit becomes active at the time spending requirement is met",
    "Make Delta purchases using your card",
    "Up to $200 in statement credits apply automatically to Delta charges",
  ],
  links: [
    { label: "Delta Air Lines", url: "https://www.delta.com" },
    {
      label: "Learn More",
      url: "https://www.americanexpress.com/us/credit-cards/card/delta-skyMiles-platinum/",
    },
  ],
};

const companionCertDetails: BenefitDetails = {
  description:
    "Annual companion certificate allowing a companion to fly free in main cabin economy on any paid Delta domestic flight or select flights to the Caribbean and Central America. Certificate is issued at card anniversary and valid for one year from issuance. Non-transferable.",
  howToUse: [
    "Log in to delta.com",
    "Navigate to My Account → Benefits",
    "Select your companion certificate",
    "Book a paid domestic Delta flight using your card",
    "Companion flies free in main cabin economy on the same itinerary",
  ],
  links: [{ label: "Delta Air Lines", url: "https://www.delta.com" }],
};

const uberOneMonthlyDetails: BenefitDetails = {
  description:
    "Monthly Uber One credit up to $9.99 per month through June 2026, providing ride-sharing and delivery service value. Includes $0 delivery fees, up to 10% off eligible Uber Eats orders, and 5% off eligible Uber rides.",
  howToUse: [
    "Link your Amex and Uber accounts via amex.com/uber",
    "Uber One membership is automatically activated",
    "Benefits apply to eligible Uber rides and Uber Eats orders",
    "Credit continues monthly through June 2026",
  ],
  links: [
    {
      label: "Link your accounts",
      url: "https://www.americanexpress.com/en-us/benefits/uber/",
    },
    { label: "Uber One", url: "https://www.uber.com/us/en/u/uber-one/" },
  ],
};

// ── Card Definition ──

export const deltaPlatinum: CardDefinition = {
  id: CARD_ID,
  name: "Delta SkyMiles Platinum American Express",
  issuer: "amex",
  network: "amex",
  annualFee: 350,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    b({
      id: "delta_flight_credit",
      name: "Delta Flight Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 200,
      cycle: "annual_calendar",
      merchantPatterns: ["delta", "delta air lines"],
      autoMatchable: true,
      requiresActivation: true,
      priority: 30,
      description:
        "Up to $200/year Delta flight credit (after $10K annual spend).",
      notes:
        "Covers baggage fees, seats, and incidentals—NOT airfare. Requires $10K spend to activate.",
      details: deltaFlightCreditDetails,
    }),
    b({
      id: "delta_companion_cert",
      name: "Annual Companion Certificate",
      icon: "Users",
      category: "travel",
      type: "certificate",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: ["delta"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 30,
      description:
        "Companion flies free in main cabin economy on any paid Delta domestic flight.",
      notes:
        "Issued at card anniversary. Valid for one year. Non-transferable.",
      details: companionCertDetails,
    }),
    b({
      id: "delta_uber_one",
      name: "Uber One Monthly Credit",
      icon: "Car",
      category: "transport",
      type: "credit",
      creditAmount: 9.99,
      cycle: "monthly",
      merchantPatterns: ["uber"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description:
        "Up to $9.99/month Uber One membership credit through June 2026.",
      notes: "Includes $0 delivery fees, discounts on rides and Uber Eats.",
      details: uberOneMonthlyDetails,
      brandSlug: "uber",
      activeMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    }),
  ],
};
