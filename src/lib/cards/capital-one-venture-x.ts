import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "capital_one_venture_x";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const travelCreditDetails: BenefitDetails = {
  description:
    "Up to $300 per anniversary year in credits for bookings made through Capital One Travel (flights, hotels, rental cars, activities). Applied as a coupon at checkout — not a statement credit. Does not need to be used all at once; can be split across multiple bookings. If a booking is canceled after the credit period expires, the credit is lost. Stacks with Premier Collection and Lifestyle Collection hotel perks.",
  howToUse: [
    "Log in to Capital One Travel at capitalone.com/travel or the Capital One app",
    "Search for and book flights, hotels, rental cars, or activities",
    "The credit applies automatically at checkout — no enrollment needed",
    "Track remaining balance in the Capital One app under Rewards & Benefits",
  ],
  links: [
    { label: "Capital One Travel", url: "https://travel.capitalone.com" },
    { label: "Venture X Benefits", url: "https://www.capitalone.com/credit-cards/venture-x/#benefits" },
  ],
};

const anniversaryMilesDetails: BenefitDetails = {
  description:
    "10,000 Capital One miles deposited automatically into your account on each card anniversary. No spending requirement. Miles never expire while the account is open. At the 1.0cpp floor (portal/erase), this is worth $100; at transfer partner valuations (~1.85cpp), up to $185. Combined with the $300 travel credit, this makes the card's annual value exceed the $395 fee before any spending.",
  howToUse: [
    "No action needed — miles are deposited automatically on your card anniversary",
    "Miles appear in your Capital One rewards balance within a few days of anniversary",
    "Redeem via Capital One Travel portal, purchase eraser, or transfer to airline/hotel partners",
  ],
  links: [
    { label: "Transfer Partners", url: "https://www.capitalone.com/credit-cards/miles-transfer/" },
    { label: "Venture X Benefits", url: "https://www.capitalone.com/credit-cards/venture-x/#benefits" },
  ],
};

const globalEntryDetails: BenefitDetails = {
  description:
    "One statement credit of up to $120 every four years to reimburse the application fee for Global Entry ($120), TSA PreCheck ($78–$98), or NEXUS ($50). Only one program per 4-year cycle. Global Entry includes TSA PreCheck, making it the better value. Covers the primary cardmember only.",
  howToUse: [
    "Apply for Global Entry, TSA PreCheck, or NEXUS through the official government site (ttp.cbp.dhs.gov)",
    "Pay the application fee with your Venture X card",
    "The statement credit posts automatically within 1–2 billing cycles",
    "No activation or enrollment needed — just use your Venture X for payment",
  ],
  links: [
    { label: "Global Entry Application", url: "https://ttp.cbp.dhs.gov/" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
    { label: "Venture X Benefits", url: "https://www.capitalone.com/credit-cards/venture-x/#benefits" },
  ],
};

export const capitalOneVentureX: CardDefinition = {
  id: CARD_ID,
  name: "Capital One Venture X",
  issuer: "capital_one",
  network: "visa",
  annualFee: 395,
  feeDescriptor: "CAPITAL ONE ANNUAL FEE",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [
    b({
      id: "vx_travel_credit",
      name: "$300 Capital One Travel Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 300,
      cycle: "annual_anniversary",
      autoMatchable: true,
      requiresActivation: false,
      priority: 50,
      merchantPatterns: ["capital one travel", "capitalone travel"],
      description:
        "$300 annual credit for bookings through Capital One Travel portal. Resets on card anniversary.",
      details: travelCreditDetails,
      lifestyleKey: "travel_portal",
    }),

    b({
      id: "vx_anniversary_miles",
      name: "10,000 Anniversary Bonus Miles",
      icon: "Gift",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_anniversary",
      autoMatchable: false,
      requiresActivation: false,
      priority: 40,
      merchantPatterns: [],
      description:
        "10,000 bonus miles auto-deposited on each anniversary. Valued at $100 (1.0cpp floor).",
      details: anniversaryMilesDetails,
    }),

    b({
      id: "vx_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "ShieldCheck",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa", "goes", "trusted traveler"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 30,
      description:
        "Up to $120 credit for Global Entry or TSA PreCheck application fee every 4 years.",
      details: globalEntryDetails,
      lifestyleKey: "global_entry",
    }),
  ],
};
