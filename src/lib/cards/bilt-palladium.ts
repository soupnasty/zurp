import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "./helpers";

const CARD_ID = "bilt_palladium";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const hotelCreditDetails: BenefitDetails = {
  description:
    "Up to $400 in annual statement credits for hotel bookings made through Bilt Travel portal ($200 semi-annual credits on Jan 1 and Jul 1). Requires 2-night minimum stay per credit. Must book through Bilt Travel portal, not direct with hotel or OTA.",
  howToUse: [
    "Log in to your Bilt account or use the Bilt app",
    "Navigate to Bilt Travel portal",
    "Search and book a hotel with 2+ night stay",
    "Ensure total booking is in the calendar period (Jan-Jun or Jul-Dec)",
    "Statement credit posts within 1-2 billing cycles",
  ],
  links: [
    { label: "Bilt Travel", url: "https://www.bilt.com/travel" },
    { label: "Bilt Rewards", url: "https://www.bilt.com" },
  ],
};

const biltCashAnnualDetails: BenefitDetails = {
  description:
    "Up to $200 in annual Bilt Cash credited to your account on January 1. Only $100 of unused Bilt Cash rolls over to the next year; remaining balance expires. Can be redeemed for hotel credits, fitness subscriptions, dining credits, Lyft rides, Priority Pass guests, or Point Accelerator.",
  howToUse: [
    "Log in to your Bilt account",
    "Go to Bilt Cash settings",
    "View your Bilt Cash balance (auto-credited Jan 1)",
    "Redeem for desired benefit category before Dec 31",
    "Monitor balance to ensure no expiration loss",
  ],
  links: [
    { label: "Bilt Cash Redemptions", url: "https://www.bilt.com/rewards" },
    { label: "Bilt Account", url: "https://www.bilt.com" },
  ],
};

// ── Card Definition ──

export const biltPalladium: CardDefinition = {
  id: CARD_ID,
  name: "Bilt Palladium Card",
  issuer: "bilt",
  network: "mastercard",
  annualFee: 495,
  feeDescriptor: "BILT ANNUAL MEMBERSHIP",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Hotel Credit ($400 semi-annual) ──
    ...expandCycles(
      CARD_ID,
      {
        name: "Bilt Travel Hotel Credit",
        icon: "Hotel",
        category: "travel",
        type: "credit",
        creditAmount: 200,
        merchantPatterns: ["bilt travel"],
        autoMatchable: true,
        requiresActivation: false,
        priority: 5,
        notes:
          "2-night minimum stay required per credit. Must book through Bilt Travel portal.",
        details: hotelCreditDetails,
      },
      [
        {
          id: "bilt_hotel_credit_h1",
          cycle: "biannual_h1",
          description:
            "Up to $200 in statement credits for hotel bookings Jan-Jun via Bilt Travel.",
        },
        {
          id: "bilt_hotel_credit_h2",
          cycle: "biannual_h2",
          description:
            "Up to $200 in statement credits for hotel bookings Jul-Dec via Bilt Travel.",
        },
      ]
    ),

    // ── Bilt Cash Annual Credit ($200) ──
    b({
      id: "bilt_bilt_cash_annual",
      name: "Bilt Cash Annual Credit",
      icon: "Zap",
      category: "subscription",
      type: "credit",
      creditAmount: 200,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 10,
      description: "Up to $200 annual Bilt Cash credit on January 1.",
      notes:
        "Annual account credit deposited Jan 1, not a transaction-matched benefit. Only $100 unused balance rolls to next year. Must redeem before Dec 31 to avoid expiration.",
      details: biltCashAnnualDetails,
    }),

    // ── No Foreign Transaction Fees ──
    b({
      id: "bilt_no_ftf",
      name: "No Foreign Transaction Fees",
      icon: "Globe",
      category: "travel",
      type: "credit",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 15,
      description: "No foreign transaction fees on international purchases.",
      notes:
        "Standard on Mastercard World Legend. International merchant detection via Plaid.",
    }),
  ],
};
