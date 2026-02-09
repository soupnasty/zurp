import type { CardDefinition } from "@/lib/types";

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
    // ── Chase Travel Hotel Credit ($50/year) ──
    {
      id: "csp_hotel",
      cardId: "chase_sapphire_preferred",
      name: "Chase Travel Hotel Credit",
      icon: "ConciergeBell",
      category: "travel",
      type: "credit",
      creditAmount: 50,
      cycle: "annual_calendar",
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
      notes: "Must book through Chase Travel portal. Calendar year cycle.",
      sunsetDate: null,
      sourceUrl: null,
      displayGroup: null,
      displayGroupName: null,
      displayGroupIcon: null,
      details: {
        description:
          "Up to $50 in statement credits each calendar year for hotel stays booked through the Chase Travel portal. The credit applies automatically when you book a prepaid hotel through Chase Travel using your Sapphire Preferred card.",
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
      },
    },
  ],
};
