import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "chase_sapphire_preferred";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const doordashPromoDetails: BenefitDetails = {
  description:
    "$10/month DoorDash promo on non-restaurant orders (grocery, convenience, retail). If the full promo value isn't used on a single order, the remaining value is forfeited for that promo.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Sapphire Preferred as the default payment method",
    "Activate your DashPass membership first (required for promos)",
    "Each month, select the promo from your promotion wallet at checkout",
    "Filter by \"Pickup\" \u2192 \"Grocery\" or \"Convenience\" for best value",
    "Make sure the \"Chase monthly benefit\" toggle is ON at checkout",
  ],
  links: [
    { label: "DoorDash App", url: "https://www.doordash.com" },
    { label: "Terms", url: "https://help.doordash.com/consumers/s/article/offer-terms-conditions?language=en_US" },
  ],
};

const dashpassDetails: BenefitDetails = {
  description:
    "Complimentary DashPass membership with $0 delivery fees and lower service fees on eligible DoorDash orders. Must be activated through DoorDash using your Sapphire Preferred card.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Sapphire Preferred as the default payment method",
    "Follow the prompts to activate your complimentary DashPass membership",
    "DashPass benefits apply automatically to eligible orders",
  ],
  links: [
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase/sapphire-preferred" },
    { label: "DoorDash App", url: "https://www.doordash.com" },
    { label: "Learn More", url: "https://www.doordash.com/dashpass/partner/chase/sapphire-preferred" },
  ],
};

const hotelCreditDetails: BenefitDetails = {
  description:
    "Up to $50 in statement credits each cardmember anniversary year for hotel stays booked through the Chase Travel portal. The credit applies automatically when you book a prepaid hotel through Chase Travel using your Sapphire Preferred card.",
  howToUse: [
    "Go to Chase Travel (chase.com/travel or the Chase app)",
    "Search for hotels and book a prepaid stay",
    "Pay with your Sapphire Preferred card",
    "The statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Book via Chase Travel", url: "https://www.chase.com/travel" },
    { label: "Learn More", url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred" },
  ],
};

// ── Card Definition ──

export const chaseSapphirePreferred: CardDefinition = {
  id: CARD_ID,
  name: "Chase Sapphire Preferred\u00AE",
  issuer: "chase",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // Note: Earning multipliers (5x Lyft, 5x Chase Travel portal, 3x online grocery,
    // 3x streaming, 2x general travel) are defined in the earn config at
    // src/lib/points/earn-configs/chase-sapphire-preferred.ts, not as benefits here.
    // Benefits in this file are only trackable statement credits and subscriptions.

    // ── Chase Travel Hotel Credit ($50/anniversary year) ──
    b({
      id: "csp_hotel_credit",
      name: "Chase Travel Hotel Credit", icon: "ConciergeBell",
      category: "travel", type: "credit", creditAmount: 50, cycle: "annual_anniversary",
      merchantPatterns: ["chase travel"],
      autoMatchable: false, requiresActivation: false, priority: 10,
      description: "Up to $50 in annual statement credits for hotel stays booked through Chase Travel.",
      notes: "Must book through Chase Travel portal. Anniversary year cycle.",
      lifestyleKey: "hotel_portal",
      details: hotelCreditDetails,
    }),

    // ── DoorDash Non-Restaurant Promo ($10/month) ──
    b({
      id: "csp_doordash_nonrestaurant_promo",
      name: "DoorDash Non-Restaurant Promo", icon: "Bike",
      category: "shopping", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["doordash"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "$10/month non-restaurant credit on DoorDash (grocery, convenience, retail).",
      notes: "Use-it-or-lose-it. If full value is not used on a single order, remaining is forfeited.",
      sunsetDate: "2027-12-31",
      lifestyleKey: "doordash",
      details: doordashPromoDetails,
      brandSlug: "doordash",
    }),

    // ── DashPass (subscription) ──
    b({
      id: "csp_dashpass",
      name: "DashPass by DoorDash", icon: "Bike",
      category: "subscription", type: "subscription", creditAmount: 0, cycle: "subscription",
      merchantPatterns: ["doordash", "dashpass"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "Complimentary DashPass membership for free delivery on DoorDash.",
      notes: "Must activate through DoorDash.",
      sunsetDate: "2027-12-31",
      lifestyleKey: "doordash",
      details: dashpassDetails,
      brandSlug: "doordash",
    }),
  ],
};
