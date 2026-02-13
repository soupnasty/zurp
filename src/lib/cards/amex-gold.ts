import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, expandCycles, type BenefitInput } from "./helpers";

const CARD_ID = "amex_gold";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const diningCreditDetails: BenefitDetails = {
  description:
    "Up to $10/month in statement credits at Grubhub, The Cheesecake Factory, Goldbelly, Wine.com, and Five Guys. Must enroll before first purchase \u2014 purchases before enrollment do not trigger retroactive credits. Shared across primary + authorized users ($10 total, not $10 each).",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits \u2192 find the Monthly Dining Credit",
    "Tap to enroll in the benefit",
    "Make a purchase at Grubhub, The Cheesecake Factory, Goldbelly, Wine.com, or Five Guys using your Gold Card",
    "Statement credit posts within a few days (up to 8 weeks per terms)",
  ],
  links: [
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
    { label: "Grubhub", url: "https://www.grubhub.com" },
    { label: "Learn More", url: "https://www.americanexpress.com/us/credit-cards/card/gold-card/" },
  ],
};

const resyCreditDetails: BenefitDetails = {
  description:
    "Up to $50 in semi-annual statement credits for dining at Resy-affiliated restaurants or purchases on Resy.com/app. Reservation through Resy is NOT required \u2014 just dine at a Resy-affiliated restaurant and pay with your Gold Card. Unused H1 credit does NOT carry to H2.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits \u2192 find the Resy Dining Credit",
    "Tap to enroll in the benefit",
    "Dine at a Resy-affiliated restaurant and pay with your Gold Card, or make a purchase on Resy.com/app",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Resy", url: "https://resy.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
    { label: "Learn More", url: "https://www.americanexpress.com/us/credit-cards/card/gold-card/" },
  ],
};

const uberCashDetails: BenefitDetails = {
  description:
    "Up to $10/month ($120/year) in Uber Cash for Uber rides and Uber Eats orders in the U.S. Credits are automatically added to your linked Uber account at the start of each month. Unused Uber Cash expires at the end of each month and does not roll over. An Amex card must be selected as the payment method to redeem Uber Cash.",
  howToUse: [
    "Open the Uber app and go to Wallet",
    "Add your Gold Card as a payment method",
    "Uber Cash is automatically added at the start of each month",
    "Make sure Uber Cash is toggled on before requesting a ride or placing an order",
    "Use for Uber rides or Uber Eats orders in the U.S.",
  ],
  links: [
    { label: "Amex Gold Uber Benefit", url: "https://www.uber.com/us/en/u/amex/" },
    { label: "Uber", url: "https://www.uber.com" },
    { label: "Learn More", url: "https://www.americanexpress.com/us/credit-cards/card/gold-card/" },
  ],
};

const dunkinCreditDetails: BenefitDetails = {
  description:
    "Up to $7/month in statement credits for purchases at U.S. Dunkin' locations (in-store or via the Dunkin' app with Gold Card as payment). Tip: load $7 onto Dunkin' app balance to bank the credit even without a store visit.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits \u2192 find the Monthly Dunkin' Credit",
    "Tap to enroll in the benefit",
    "Visit any U.S. Dunkin' location and pay with your Gold Card, or order through the Dunkin' app",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Dunkin'", url: "https://www.dunkindonuts.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
    { label: "Learn More", url: "https://www.americanexpress.com/us/credit-cards/card/gold-card/" },
  ],
};

// ── Card Definition ──

export const amexGold: CardDefinition = {
  id: CARD_ID,
  name: "American Express\u00AE Gold Card",
  issuer: "amex",
  network: "amex",
  annualFee: 325,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Monthly Dining Credit ($10/mo) ──
    b({
      id: "gold_dining_credit",
      name: "Monthly Dining Credit", icon: "UtensilsCrossed",
      category: "dining", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["grubhub", "cheesecake factory", "goldbelly", "wine.com", "five guys"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "Up to $10/month in statement credits at Grubhub, The Cheesecake Factory, Goldbelly, Wine.com, and Five Guys.",
      notes: "Must enroll before first purchase. Shared across primary + authorized users ($10 total). Gift cards do not qualify.",
      details: diningCreditDetails,
    }),

    // ── Resy Dining Credit ($50 × 2 biannual) ──
    ...expandCycles(CARD_ID, {
      name: "Resy Dining Credit", icon: "UtensilsCrossed",
      category: "dining", type: "credit", creditAmount: 50,
      merchantPatterns: ["resy"],
      autoMatchable: false, requiresActivation: true, priority: 10,
      notes: "Dine at Resy-affiliated restaurants or purchase on Resy.com/app. Reservation through Resy not required.",
      details: resyCreditDetails,
    }, [
      { id: "gold_resy_credit_h1", cycle: "biannual_h1", description: "Up to $50 in statement credits for Resy dining experiences (Jan-Jun)." },
      { id: "gold_resy_credit_h2", cycle: "biannual_h2", description: "Up to $50 in statement credits for Resy dining experiences (Jul-Dec)." },
    ]),

    // ── Monthly Uber Cash ($10/mo) ──
    b({
      id: "gold_uber_cash",
      name: "Uber Cash", icon: "Car",
      category: "transport", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["uber"],
      autoMatchable: true, requiresActivation: false, priority: 20,
      description: "Up to $10/month in Uber Cash for Uber rides and Uber Eats.",
      notes: "Uber Cash auto-deposits monthly. Use-it-or-lose-it — expires at end of month. U.S. only. Must have Amex card selected as payment method.",
      details: uberCashDetails,
      brandSlug: "uber",
    }),

    // ── Monthly Dunkin' Credit ($7/mo) ──
    b({
      id: "gold_dunkin_credit",
      name: "Monthly Dunkin' Credit", icon: "Coffee",
      category: "dining", type: "credit", creditAmount: 7, cycle: "monthly",
      merchantPatterns: ["dunkin"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "Up to $7/month in statement credits at Dunkin'.",
      notes: "U.S. Dunkin' locations only (in-store or via Dunkin' app). Must enroll before first purchase.",
      details: dunkinCreditDetails,
    }),
  ],
};
