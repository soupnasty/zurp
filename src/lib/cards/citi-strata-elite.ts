import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "citi_strata_elite";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const hotelCollectionDetails: BenefitDetails = {
  description:
    "Annual credit for bookings through Citi Hotel Collection on cititravel.com. Must be a single hotel stay of 2 or more nights. Applied at time of booking (portal credit, not a statement credit). Excludes taxes and fees. Can be booked online at cititravel.com or by calling 1-833-737-1288. Resets on January 1 each calendar year.",
  howToUse: [
    "Go to cititravel.com and log in with your Citi credentials",
    "Search for hotels and look for Citi Hotel Collection properties",
    "Book a stay of 2 or more nights — the credit applies automatically at checkout",
    "Can also book by calling 1-833-737-1288",
  ],
  links: [
    { label: "Citi Travel", url: "https://cititravel.com" },
    { label: "Card Benefits", url: "https://www.citi.com/credit-cards/citi-strata-premier-credit-card" },
  ],
};

const globalEntryDetails: BenefitDetails = {
  description:
    "One statement credit of up to $120 every four years to reimburse the application fee for Global Entry ($120), TSA PreCheck ($78–$98), or NEXUS ($50). Only one program per 4-year cycle. Global Entry includes TSA PreCheck, making it the better value. Covers the primary cardmember only.",
  howToUse: [
    "Apply for Global Entry, TSA PreCheck, or NEXUS through the official government site (ttp.cbp.dhs.gov)",
    "Pay the application fee with your Citi Strata Elite card",
    "The statement credit posts automatically within 1–2 billing cycles",
    "No activation or enrollment needed — just use your card for payment",
  ],
  links: [
    { label: "Global Entry Application", url: "https://ttp.cbp.dhs.gov/" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
    { label: "Card Benefits", url: "https://www.citi.com/credit-cards/citi-strata-premier-credit-card" },
  ],
};

export const citiStrataElite: CardDefinition = {
  id: CARD_ID,
  name: "Citi Strata Elite",
  issuer: "citi",
  network: "visa",
  annualFee: 595,
  feeDescriptor: "CITI CARD ANNUAL FEE",
  imageUrl: null,
  isActive: true,
  benefits: [
    b({
      id: "citi_hotel_collection",
      name: "Citi Hotel Collection Credit",
      icon: "hotel",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_calendar",
      autoMatchable: false,
      requiresActivation: true,
      priority: 50,
      merchantPatterns: [],
      description:
        "$100 annual credit for bookings through Citi Hotel Collection.",
      details: hotelCollectionDetails,
    }),

    b({
      id: "citi_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "ShieldCheck",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa", "goes"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 40,
      description:
        "Up to $120 credit for Global Entry or TSA PreCheck application fee every 4 years.",
      details: globalEntryDetails,
    }),
  ],
};
