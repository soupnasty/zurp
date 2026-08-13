import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "united_explorer";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const unitedTravelCreditDetails: BenefitDetails = {
  description:
    "$100 in United TravelBank cash awarded once per calendar year after you spend $10,000 on the card in that calendar year. The cash is deposited into your MileagePlus TravelBank account (not issued as statement credits) and can be applied toward United flight purchases.",
  howToUse: [
    "Spend $10,000 on your Explorer card in a calendar year",
    "$100 in TravelBank cash is deposited into your MileagePlus account (allow 6-8 weeks)",
    "Apply TravelBank cash toward United flight purchases at checkout on united.com",
    "Awarded once per calendar year; spend counter resets each January 1",
  ],
  links: [
    { label: "United TravelBank", url: "https://www.united.com/en/us/travelbank" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/united-explorer",
    },
  ],
};

const rideshareCreditDetails: BenefitDetails = {
  description:
    "Up to $5 per month ($60 per calendar year) in statement credits for rideshare purchases (Uber, Lyft, etc.). Requires annual enrollment through your rideshare account each calendar year. Unused monthly credit does not roll over.",
  howToUse: [
    "Enroll in the benefit each calendar year (annual registration required)",
    "Pay for rideshare trips with your United Explorer card",
    "Statement credits of up to $5 post automatically each month",
    "Up to $60 per calendar year; unused monthly value is forfeited",
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
    "Up to $10 per month (up to $120 per calendar year) in statement credits for Instacart purchases. Requires an Instacart+ membership activation with your card. Benefit ends December 31, 2027.",
  howToUse: [
    "Add your United Explorer card as a payment method in the Instacart app",
    "Make eligible purchases through Instacart",
    "Statement credits of up to $10 post automatically each month",
    "Unused monthly credit does not roll over; benefit ends 12/31/2027",
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

const globalEntryDetails: BenefitDetails = {
  description:
    "One statement credit of up to $120 every four years to reimburse the application fee for Global Entry ($120), TSA PreCheck ($78–$98), or NEXUS ($50). Pay the fee with your Explorer card and the credit posts automatically.",
  howToUse: [
    "Apply for Global Entry, TSA PreCheck, or NEXUS through the official government site",
    "Pay the application fee with your United Explorer card",
    "The statement credit posts automatically within 1–2 billing cycles",
    "Credit is available once every 4 years",
  ],
  links: [
    { label: "Global Entry Application", url: "https://ttp.cbp.dhs.gov/" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/united-explorer",
    },
  ],
};

// ── Card Definition ──

export const unitedExplorer: CardDefinition = {
  id: CARD_ID,
  name: "United™ Explorer Card",
  issuer: "chase",
  network: "visa",
  annualFee: 150,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // United Club One-Time Passes (certificate) tracked in perk matrix only.
    // ── United TravelBank Cash ($100/year after $10K spend) ──
    // NOTE: This is a spend-gated TravelBank deposit, NOT auto-matching statement
    // credits — awarded once per calendar year after $10,000 calendar-year spend.
    b({
      id: "united_travel_credit",
      name: "United TravelBank Cash",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 10,
      description:
        "$100 in United TravelBank cash once per year after $10,000 calendar-year spend.",
      notes:
        "Spend-gated: requires $10K spend in the calendar year. Delivered as a TravelBank deposit (usable toward United flights), not a statement credit — mark used manually once deposited.",
      details: unitedTravelCreditDetails,
      lifestyleKey: "united",
    }),
    b({
      id: "united_rideshare_credit",
      name: "Airport Rideshare Credit",
      icon: "Car",
      category: "transport",
      type: "credit",
      creditAmount: 5,
      cycle: "monthly",
      merchantPatterns: ["uber", "lyft"],
      plaidCategories: ["TRANSPORTATION_RIDESHARE"],
      autoMatchable: true,
      requiresActivation: true,
      priority: 20,
      description: "Up to $5/month ($60/year) in rideshare statement credits.",
      notes:
        "Capped at $5 per month; unused value forfeited. Annual enrollment required each calendar year.",
      details: rideshareCreditDetails,
      lifestyleKey: "lyft",
    }),
    b({
      id: "united_instacart_credit",
      name: "Instacart Credit",
      icon: "ShoppingCart",
      category: "shopping",
      type: "credit",
      creditAmount: 10,
      cycle: "monthly",
      merchantPatterns: ["instacart"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $10/month (up to $120/year) in Instacart credits.",
      notes:
        "Monthly use-it-or-lose-it credit. Benefit ends 12/31/2027.",
      sunsetDate: "2027-12-31",
      details: instacartCreditDetails,
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
    // ── Global Entry / TSA PreCheck / NEXUS ($120/4 years) ──
    b({
      id: "united_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "ShieldCheck",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "tsa pre", "goes", "nexus", "trusted traveler"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 40,
      description:
        "Up to $120 credit for Global Entry, TSA PreCheck, or NEXUS application fee every 4 years.",
      notes: "Covers application fee only. One program per 4-year cycle.",
      details: globalEntryDetails,
      lifestyleKey: "global_entry",
    }),
  ],
};
