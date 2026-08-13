import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "citi_strata_premier";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const hotelCreditDetails: BenefitDetails = {
  description:
    "Up to $100 annual statement credit toward hotel bookings of $500 or more made through Citi Travel portal. Credit resets each calendar year (Jan 1). Applies only to portal bookings, not direct hotel reservations or other OTAs.",
  howToUse: [
    "Log in to your Citi account",
    "Go to Citi Travel portal",
    "Search and book a hotel with $500+ total booking",
    "Ensure booking qualifies through Citi Travel (not third-party)",
    "Credit posts within 1-2 billing cycles automatically",
  ],
  links: [
    { label: "Citi Travel", url: "https://www.citi.com/travel" },
    { label: "Citi Benefits", url: "https://www.citi.com" },
  ],
};

const noFtfDetails: BenefitDetails = {
  description:
    "Zero foreign transaction fee on all purchases made outside the United States, including currency conversions and wire transfers. Massive advantage for international travelers; eliminates typical 2-3% FTF charged by most cards.",
  howToUse: [
    "Use your card for any international purchase",
    "No foreign transaction fee applied",
    "Benefit applies automatically to all foreign transactions",
    "Save 2-3% on all international spending vs. typical cards",
  ],
  links: [{ label: "Citi Card Benefits", url: "https://www.citi.com" }],
};

// ── Card Definition ──

export const citiStrataPremier: CardDefinition = {
  id: CARD_ID,
  name: "Citi Strata Premier",
  issuer: "citi",
  network: "mastercard",
  annualFee: 95,
  feeDescriptor: "CITI CARD ANNUAL FEE",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // ── Annual Hotel Credit ($100) ──
    b({
      id: "citip_annual_hotel_credit",
      name: "Annual Hotel Credit",
      icon: "Hotel",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_calendar",
      merchantPatterns: ["citi travel"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 50,
      description:
        "Up to $100 annual statement credit for hotel bookings of $500+ via Citi Travel.",
      notes:
        "Resets Jan 1. Must book through Citi Travel portal, not direct or OTA.",
      details: hotelCreditDetails,
      lifestyleKey: "hotel_portal",
    }),

    // ── No Foreign Transaction Fees ──
    b({
      id: "citip_no_ftf",
      name: "No Foreign Transaction Fees",
      icon: "Globe",
      category: "travel",
      type: "credit",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 10,
      description:
        "Zero foreign transaction fees on all international purchases.",
      notes:
        "Saves 2-3% vs typical cards. Applies to all foreign transactions automatically.",
      details: noFtfDetails,
    }),
  ],
};
