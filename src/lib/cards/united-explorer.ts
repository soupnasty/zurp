import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

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

const rideshareCreditDetails: BenefitDetails = {
  description:
    "$60 annual airport rideshare credit for ground transportation to and from the airport. Credit is automatically applied as statement credits for eligible airport trips booked through designated rideshare apps.",
  howToUse: [
    "Use your United Explorer card to pay for rideshare trips to or from the airport",
    "Eligible trips are automatically detected based on pickup/dropoff location",
    "Statement credits post automatically after qualifying rideshare charges",
    "Up to $60 per calendar year",
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
    "Up to $120 per calendar year",
  ],
  links: [
    { label: "Instacart", url: "https://www.instacart.com" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/united-explorer",
    },
  ],
};

const unitedHotelsCreditDetails: BenefitDetails = {
  description:
    "$100 annual United Hotels credit: earn up to $50 in statement credits per qualifying stay at United Hotels, for up to 2 stays per year. Book through United Hotels on united.com.",
  howToUse: [
    "Go to united.com and search for United Hotels",
    "Book a qualifying stay using your United Explorer card",
    "Statement credit of up to $50 posts automatically per stay",
    "Up to 2 qualifying stays per calendar year ($100 total)",
  ],
  links: [
    { label: "United Hotels", url: "https://www.united.com/hotels" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/united-explorer",
    },
  ],
};

// ── Card Definition ──

export const unitedExplorer: CardDefinition = {
  id: CARD_ID,
  name: "United\u2122 Explorer Card",
  issuer: "chase",
  network: "visa",
  annualFee: 150,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // United Club One-Time Passes (certificate) tracked in perk matrix only.
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
      lifestyleKey: "united",
    }),
    b({
      id: "united_rideshare_credit",
      name: "Airport Rideshare Credit",
      icon: "Car",
      category: "transport",
      type: "credit",
      creditAmount: 60,
      cycle: "annual_calendar",
      merchantPatterns: ["uber", "lyft"],
      plaidCategories: ["TRANSPORTATION_RIDESHARE"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $60/year for rideshare trips to/from the airport.",
      notes:
        "Eligible trips are auto-detected based on airport pickup/dropoff location.",
      details: rideshareCreditDetails,
      lifestyleKey: "lyft",
    }),
    b({
      id: "united_instacart_credit",
      name: "Instacart Credit",
      icon: "ShoppingCart",
      category: "shopping",
      type: "credit",
      creditAmount: 120,
      cycle: "annual_calendar",
      merchantPatterns: ["instacart"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $120/year for Instacart grocery delivery purchases.",
      notes: "Credits distributed periodically throughout the year.",
      details: instacartCreditDetails,
      brandSlug: "instacart",
      lifestyleKey: "instacart",
    }),
    // ── United Hotels Credit ($100/year) ──
    b({
      id: "united_hotels_credit",
      name: "United Hotels Credit",
      icon: "Hotel",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_calendar",
      merchantPatterns: ["united hotels"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 15,
      description: "Up to $100/year for United Hotels bookings ($50 per stay, up to 2 stays).",
      notes: "Book through United Hotels on united.com. $50 per qualifying stay.",
      details: unitedHotelsCreditDetails,
      lifestyleKey: "hotel_portal",
    }),
  ],
};
