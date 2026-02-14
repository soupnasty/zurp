import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "./helpers";

const CARD_ID = "amex_blue_cash_preferred";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const disneyBundleCreditDetails: BenefitDetails = {
  description:
    "Up to $10 per month in statement credits for the Disney+, Hulu, and ESPN+ bundle subscription. Annual value of up to $120. Credit applies only to the official Disney bundle package (not individual services). Must be enrolled and have an eligible active subscription charged to the card.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Disney Bundle Credit",
    "Tap to enroll in the benefit",
    "Ensure your Disney+/Hulu/ESPN+ bundle is charged to the Blue Cash Preferred card",
    "The $10 monthly credit posts automatically as a statement credit",
  ],
  links: [
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
    { label: "Disney Bundle", url: "https://www.disneyplus.com" },
    {
      label: "Learn More",
      url: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/",
    },
  ],
};

// ── Card Definition ──
// Note: This card's primary value is from cash back earning rates (6% US supermarkets up to
// $6K/yr, 6% streaming, 3% gas, 3% transit/rideshare, 1% everything else). These are NOT
// statement credits and are not tracked as benefits here. Only the Disney Bundle credit is trackable.

export const amexBlueCashPreferred: CardDefinition = {
  id: CARD_ID,
  name: "Amex Blue Cash Preferred",
  issuer: "amex",
  network: "amex",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Disney Bundle Credit ($10/mo) ──
    b({
      id: "bcp_disney_bundle",
      name: "Disney Bundle Monthly Credit",
      icon: "Tv",
      category: "entertainment",
      type: "credit",
      creditAmount: 10,
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
        "Up to $10/month in statement credits for the Disney+/Hulu/ESPN+ bundle.",
      notes:
        "Annual value of $120. Must have official Disney bundle (not individual services) charged to card.",
      details: disneyBundleCreditDetails,
      brandSlug: "disneyplus",
    }),
  ],
};
