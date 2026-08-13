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
    "Up to $100 in statement credits each cardmember anniversary year for hotel stays booked through the Chase Travel portal. The credit applies automatically when you book a prepaid hotel through Chase Travel using your Sapphire Preferred card. Increased from $50 in the June 2026 card refresh (existing cardholders convert October 1, 2026).",
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

const globalEntryDetails: BenefitDetails = {
  description:
    "One statement credit of up to $120 every four years to reimburse the application fee for Global Entry ($120), TSA PreCheck ($78\u2013$98), or NEXUS ($50). Only one program per 4-year cycle. Added in the June 2026 card refresh (existing cardholders convert October 1, 2026).",
  howToUse: [
    "Apply for Global Entry, TSA PreCheck, or NEXUS through the official government site",
    "Pay the application fee with your Sapphire Preferred card",
    "The statement credit posts automatically within 1\u20132 billing cycles",
    "No activation needed \u2014 just use your CSP for payment",
  ],
  links: [
    { label: "Global Entry Application", url: "https://ttp.cbp.dhs.gov/" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
    { label: "Learn More", url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred" },
  ],
};

const appleTvDetails: BenefitDetails = {
  description:
    "Complimentary individual Apple TV+ subscription for 12 months (~$156 value). This is a direct subscription waiver (not a statement credit) \u2014 once activated, Apple won't charge you for 12 months. Activation must happen by December 31, 2026. If you have an existing paid subscription, it will be automatically suspended. Does not cover Apple One bundles.",
  howToUse: [
    "Open the Chase Mobile app or log in to chase.com",
    "Go to Benefits & Travel \u2192 Card Benefits",
    "Find the Apple TV+ offer and tap \"Activate Now\" \u2014 this links your Apple ID",
    "You'll be redirected to Apple to connect your subscription",
    "Activate by December 31, 2026 to receive the full 12 months",
  ],
  links: [
    { label: "Apple TV+", url: "https://tv.apple.com" },
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
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // Note: Earning multipliers (5x Lyft, 5x Chase Travel portal, 3x online grocery,
    // 3x streaming, 3x gas & EV charging, 3x vacation home rentals, 2x general
    // travel) are defined in the earn config at
    // src/lib/points/earn-configs/chase-sapphire-preferred.ts, not as benefits here.
    // Benefits in this file are only trackable statement credits and subscriptions.

    // ── Chase Travel Hotel Credit ($100/anniversary year) ──
    b({
      id: "csp_hotel_credit",
      name: "Chase Travel Hotel Credit", icon: "ConciergeBell",
      category: "travel", type: "credit", creditAmount: 100, cycle: "annual_anniversary",
      merchantPatterns: ["chase travel"],
      autoMatchable: false, requiresActivation: false, priority: 10,
      description: "Up to $100 in annual statement credits for hotel stays booked through Chase Travel.",
      notes: "Must book through Chase Travel portal. Anniversary year cycle. Increased from $50 in the June 2026 refresh.",
      lifestyleKey: "hotel_portal",
      details: hotelCreditDetails,
    }),

    // ── Global Entry / TSA PreCheck ($120/4 years) ──
    b({
      id: "csp_global_entry",
      name: "Global Entry / TSA PreCheck", icon: "ShieldCheck",
      category: "travel", type: "credit", creditAmount: 120, cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa", "goes", "nexus"],
      autoMatchable: true, requiresActivation: false, priority: 40,
      description: "Up to $120 credit for Global Entry or TSA PreCheck application fee every 4 years.",
      notes: "Added in the June 2026 refresh (existing cardholders convert Oct 1, 2026).",
      lifestyleKey: "global_entry",
      details: globalEntryDetails,
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
    }),

    // ── Apple TV+ (subscription, 12 months) ──
    b({
      id: "csp_apple_tv",
      name: "Apple TV+", icon: "Tv",
      category: "entertainment", type: "subscription", creditAmount: 12.99, cycle: "subscription",
      merchantPatterns: ["apple.com/bill", "apple tv"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "Complimentary Apple TV+ subscription for 12 months (~$156 value).",
      notes: "Must activate through Chase benefits portal by 12/31/2026.",
      sunsetDate: "2026-12-31",
      lifestyleKey: "apple_tv",
      details: appleTvDetails,
    }),
  ],
};
