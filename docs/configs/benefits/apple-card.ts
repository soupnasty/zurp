import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "apple_card";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const dailyCashDetails: BenefitDetails = {
  description:
    "Daily Cash rewards credited to Apple Cash or applied to Apple Card balance daily. 3% on select merchants (Apple, Uber, Nike, etc.), 2% on Apple Pay purchases, and 1% on physical card transactions. Rewards paid daily, not monthly.",
  howToUse: [
    "Use your Apple Card for purchases",
    "Daily Cash is automatically credited each day",
    "View Daily Cash in Wallet app",
    "Redeem to Apple Cash, apply to card balance, or transfer to bank account",
  ],
  links: [
    { label: "Apple Card", url: "https://www.apple.com/apple-card/" },
    { label: "Learn More", url: "https://support.apple.com/en-us/HT209218" },
  ],
};

const savingsAccountDetails: BenefitDetails = {
  description:
    "Apple Card Savings account lets you save your Daily Cash with 4.15% APY. Rate subject to change. Issued by Goldman Sachs Bank USA.",
  howToUse: [
    "Open Wallet app",
    "Go to Apple Card",
    "Tap 'Savings'",
    "Transfer Daily Cash to Savings account",
    "Earn 4.15% APY on savings balance",
  ],
  links: [
    {
      label: "Apple Card Savings",
      url: "https://www.apple.com/apple-card/savings/",
    },
  ],
};

const interestFreeFinancingDetails: BenefitDetails = {
  description:
    "Interest-free financing available on Apple devices including iPhone, iPad, Mac, Apple Watch, and accessories. Specific terms vary by product and promotion.",
  howToUse: [
    "Visit apple.com or Apple Store",
    "Select an Apple device",
    "At checkout, choose financing option",
    "Apply with Apple Card to qualify",
    "No interest if paid in full during promotional period",
  ],
  links: [
    { label: "Apple Store", url: "https://www.apple.com/shop" },
    {
      label: "Apple Card Financing",
      url: "https://support.apple.com/en-us/HT209455",
    },
  ],
};

// ── Card Definition ──

export const appleCard: CardDefinition = {
  id: CARD_ID,
  name: "Apple Card",
  issuer: "goldman_sachs",
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    b({
      id: "apple_daily_cash",
      name: "Daily Cash Rewards",
      icon: "Wallet",
      category: "cashback",
      type: "credit",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [
        "apple.com/bill",
        "apple store",
        "apple",
        "uber",
        "uber eats",
        "nike",
        "exxon",
        "mobil",
        "ace hardware",
        "booking.com",
        "walgreens",
        "duane reade",
        "chargepoint",
      ],
      autoMatchable: true,
      requiresActivation: false,
      priority: 30,
      description:
        "Daily Cash rewards: 3% on select merchants, 2% on Apple Pay, 1% on physical card.",
      notes:
        "Credited daily to Apple Cash or card balance. Unique daily frequency vs. monthly competitors.",
      details: dailyCashDetails,
    }),
    b({
      id: "apple_savings",
      name: "Apple Card Savings Account",
      icon: "PiggyBank",
      category: "savings",
      type: "subscription",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 15,
      description: "Save Daily Cash with 4.15% APY through Apple Card Savings.",
      notes: "Rate subject to change. Issued by Goldman Sachs Bank USA.",
      details: savingsAccountDetails,
    }),
    b({
      id: "apple_interest_free",
      name: "Interest-Free Apple Device Financing",
      icon: "Smartphone",
      category: "travel",
      type: "certificate",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: ["apple"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 20,
      description:
        "Interest-free financing on Apple devices with no interest during promotional periods.",
      notes:
        "Terms vary by product. Available on iPhone, iPad, Mac, Apple Watch, etc.",
      details: interestFreeFinancingDetails,
    }),
  ],
};
