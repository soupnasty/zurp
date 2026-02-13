import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "./helpers";

const CARD_ID = "amex_blue_cash_everyday";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const disneyBundleCreditDetails: BenefitDetails = {
  description:
    "Up to $7 per month in statement credits for the Disney+, Hulu, and ESPN+ bundle subscription. Annual value of up to $84. Credit applies only to the official Disney bundle package (not individual services). Must be enrolled and have an eligible active subscription charged to the card.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Disney Bundle Credit",
    "Tap to enroll in the benefit",
    "Ensure your Disney+/Hulu/ESPN+ bundle is charged to the Blue Cash Everyday card",
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

// ── Card Definition ──
// Note: This card's primary value is from cash back earning rates (3% US supermarkets up to
// $6K/yr, 3% gas, 3% online retail up to $6K/yr, 1% everything else). These are NOT statement
// credits and are not tracked as benefits here. Only the Disney Bundle credit is trackable.

export const amexBlueCashEveryday: CardDefinition = {
  id: CARD_ID,
  name: "American Express Blue Cash Everyday®",
  issuer: "amex",
  network: "amex",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Disney Bundle Credit ($7/mo) ──
    b({
      id: "bce_disney_bundle",
      name: "Disney Bundle Monthly Credit",
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
        "Up to $7/month in statement credits for the Disney+/Hulu/ESPN+ bundle.",
      notes:
        "Annual value of $84. Must have official Disney bundle (not individual services) charged to card.",
      details: disneyBundleCreditDetails,
      brandSlug: "disneyplus",
    }),
  ],
};
