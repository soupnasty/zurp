import type { BenefitDetails, CardDefinition } from "@/lib/types";

const doordashDetails: BenefitDetails = {
  description:
    "Complimentary DashPass membership ($0 delivery fee, lower service fees) plus a $10/month DoorDash promo on non-restaurant orders (grocery, convenience, retail). If the full promo value isn't used on a single order, the remaining value is forfeited for that promo.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Sapphire Preferred as the default payment method",
    "Follow the prompts to activate your complimentary DashPass membership",
    "Each month, select the promo from your promotion wallet at checkout",
    "For non-restaurant promos: filter by \"Pickup\" → \"Grocery\" or \"Convenience\" for best value",
    "Make sure the \"Chase monthly benefit\" toggle is ON at checkout",
  ],
  links: [
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase/sapphire-preferred" },
    { label: "DoorDash App", url: "https://www.doordash.com" },
    { label: "Terms", url: "https://help.doordash.com/consumers/s/article/offer-terms-conditions?language=en_US" },
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

export const chaseSapphirePreferred: CardDefinition = {
  id: "chase_sapphire_preferred",
  name: "Chase Sapphire Preferred\u00AE",
  issuer: "chase",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Chase Travel Hotel Credit ($50/anniversary year) ──
    {
      id: "csp_hotel_credit",
      cardId: "chase_sapphire_preferred",
      name: "Chase Travel Hotel Credit",
      icon: "ConciergeBell",
      category: "travel",
      type: "credit",
      creditAmount: 50,
      cycle: "annual_anniversary",
      carriesOver: false,
      maxCarryoverPeriods: null,
      maxAccrued: null,
      merchantPatterns: ["chase travel"],
      plaidCategories: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 10,
      description:
        "Up to $50 in annual statement credits for hotel stays booked through Chase Travel.",
      notes: "Must book through Chase Travel portal. Anniversary year cycle.",
      sunsetDate: null,
      sourceUrl: null,
      displayGroup: null,
      displayGroupName: null,
      displayGroupIcon: null,
      details: hotelCreditDetails,
    },

    // ── DoorDash Non-Restaurant Promo ($10/month) ──
    {
      id: "csp_doordash_nonrestaurant_promo",
      cardId: "chase_sapphire_preferred",
      name: "DoorDash Non-Restaurant Promo",
      icon: "Bike",
      category: "shopping",
      type: "credit",
      creditAmount: 10,
      cycle: "monthly",
      carriesOver: false,
      maxCarryoverPeriods: null,
      maxAccrued: null,
      merchantPatterns: ["doordash"],
      plaidCategories: [],
      autoMatchable: true,
      requiresActivation: true,
      priority: 20,
      description:
        "$10/month non-restaurant credit on DoorDash (grocery, convenience, retail).",
      notes:
        "Use-it-or-lose-it. If full value is not used on a single order, remaining is forfeited.",
      sunsetDate: "2027-12-31",
      sourceUrl: null,
      displayGroup: null,
      displayGroupName: null,
      displayGroupIcon: null,
      details: doordashDetails,
    },

    // ── DashPass (subscription) ──
    {
      id: "csp_dashpass",
      cardId: "chase_sapphire_preferred",
      name: "DashPass by DoorDash",
      icon: "Bike",
      category: "subscription",
      type: "subscription",
      creditAmount: 0,
      cycle: "subscription",
      carriesOver: false,
      maxCarryoverPeriods: null,
      maxAccrued: null,
      merchantPatterns: ["doordash", "dashpass"],
      plaidCategories: [],
      autoMatchable: true,
      requiresActivation: true,
      priority: 50,
      description:
        "Complimentary DashPass membership for free delivery on DoorDash.",
      notes: "Must activate through DoorDash.",
      sunsetDate: "2027-12-31",
      sourceUrl: null,
      displayGroup: null,
      displayGroupName: null,
      displayGroupIcon: null,
      details: doordashDetails,
    },
  ],
};
