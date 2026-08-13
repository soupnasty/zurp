import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "./helpers";

const CARD_ID = "amex_blue_cash_everyday";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const disneyStreamingCreditDetails: BenefitDetails = {
  description:
    "Up to $7 per month in statement credits for eligible subscription purchases at Disneyplus.com, Hulu.com, or ESPN — individual services qualify, not just the Disney Bundle. Annual value of up to $84. Must be enrolled and have an eligible active subscription charged to the card.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Disney streaming credit",
    "Tap to enroll in the benefit",
    "Subscribe to Disney+, Hulu, ESPN, or a bundle and charge it to the Blue Cash Everyday card",
    "The $7 monthly credit posts automatically as a statement credit",
  ],
  links: [
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
    { label: "Disney Bundle", url: "https://www.disneyplus.com" },
    {
      label: "Learn More",
      url: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/",
    },
  ],
};

const homeChefCreditDetails: BenefitDetails = {
  description:
    "Up to $15 per month in statement credits for Home Chef meal kit subscription and deliveries. Annual value of up to $180. Must be enrolled and have Home Chef charged to the Blue Cash Everyday card.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Home Chef Credit",
    "Tap to enroll in the benefit",
    "Order meal kits from Home Chef using your Blue Cash Everyday card",
    "The $15 monthly credit posts automatically as a statement credit",
  ],
  links: [
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
    { label: "Home Chef", url: "https://www.homechef.com" },
  ],
};

// ── Card Definition ──
// Note: This card's primary value is from cash back earning rates (3% US supermarkets up to
// $6K/yr, 3% gas, 3% online retail up to $6K/yr, 1% everything else). These are NOT statement
// credits and are not tracked as benefits here. Only the Disney Bundle and Home Chef credits are trackable.

export const amexBlueCashEveryday: CardDefinition = {
  id: CARD_ID,
  name: "American Express Blue Cash Everyday®",
  issuer: "amex",
  network: "amex",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // ── Disney Streaming Credit ($7/mo) ──
    b({
      id: "bce_disney_bundle",
      name: "Disney Streaming Credit",
      icon: "Tv",
      category: "entertainment",
      type: "credit",
      creditAmount: 7,
      cycle: "monthly",
      merchantPatterns: [
        "disney",
        "disneyplus",
        "disney+",
        "hulu",
        "espn+",
        "espnplus",
      ],
      autoMatchable: true,
      requiresActivation: true,
      priority: 15,
      description:
        "Up to $7/month in statement credits for Disney+, Hulu, or ESPN subscriptions.",
      notes:
        "Annual value of $84. Applies to subscription purchases at Disneyplus.com, Hulu.com, or ESPN — individual services qualify, not bundle-only. Must enroll.",
      details: disneyStreamingCreditDetails,
      lifestyleKey: "disney_plus",
    }),
    // ── Home Chef Credit ($15/mo) ──
    b({
      id: "bce_home_chef",
      name: "Home Chef Monthly Credit",
      icon: "ChefHat",
      category: "dining",
      type: "credit",
      creditAmount: 15,
      cycle: "monthly",
      merchantPatterns: ["home chef", "homechef"],
      autoMatchable: true,
      requiresActivation: true,
      priority: 15,
      description:
        "Up to $15/month in statement credits for Home Chef meal kit deliveries.",
      notes:
        "Annual value of $180. Must enroll before first purchase. Charged to card.",
      details: homeChefCreditDetails,
      lifestyleKey: "home_chef",
    }),
  ],
};
