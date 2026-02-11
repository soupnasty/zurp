import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, expandCycles, type BenefitInput } from "./helpers";

const CARD_ID = "citi_strata_elite";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const hotelCollectionDetails: BenefitDetails = {
  description:
    "Up to $300 per calendar year off a hotel stay of 2 or more nights booked through cititravel.com. Applied at time of booking (portal credit, not a statement credit). Can be applied to any hotel (not limited to a curated collection). Excludes taxes and fees. Can be booked online at cititravel.com or by calling 1-833-737-1288. Resets on January 1 each calendar year. You won't earn points on the portion covered by the credit.",
  howToUse: [
    "Go to cititravel.com and log in with your Citi credentials",
    "Search for any hotel and book a stay of 2 or more nights",
    "The credit applies automatically at checkout",
    "Can also book by calling 1-833-737-1288",
  ],
  links: [
    { label: "Citi Travel", url: "https://cititravel.com" },
    { label: "Card Benefits", url: "https://www.citi.com/credit-cards/credit-card-rewards/citi-strata-elite-benefits" },
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
    { label: "Card Benefits", url: "https://www.citi.com/credit-cards/credit-card-rewards/citi-strata-elite-benefits" },
  ],
};

const splurgeCreditDetails: BenefitDetails = {
  description:
    "Up to $200 per calendar year in statement credits on purchases from your choice of up to 2 of the following brands: 1stDibs, American Airlines (exclusions apply), Best Buy, Future Personal Training, and Live Nation (exclusions apply). Select your 2 brands through Citi's benefits portal. Resets on January 1 each calendar year.",
  howToUse: [
    "Log in to your Citi account online or via the Citi app",
    "Go to Benefits and find the Splurge Credit",
    "Select up to 2 brands from the available list",
    "Make eligible purchases at your chosen brands using your Citi Strata Elite card",
    "Statement credits post automatically after the charge",
  ],
  links: [
    { label: "Card Benefits", url: "https://www.citi.com/credit-cards/credit-card-rewards/citi-strata-elite-benefits" },
  ],
};

const blacklaneCreditDetails: BenefitDetails = {
  description:
    "Up to $200 per calendar year in statement credits for rides booked through Blacklane, a premium chauffeur service. The credit is split into two semi-annual periods: up to $100 from January through June, and up to $100 from July through December. Unused credits do not roll over between periods.",
  howToUse: [
    "Download the Blacklane app or visit blacklane.com",
    "Book a ride and pay with your Citi Strata Elite card",
    "Statement credits post automatically after the charge",
  ],
  links: [
    { label: "Blacklane", url: "https://www.blacklane.com" },
    { label: "Card Benefits", url: "https://www.citi.com/credit-cards/credit-card-rewards/citi-strata-elite-benefits" },
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
      icon: "Hotel",
      category: "travel",
      type: "credit",
      creditAmount: 300,
      cycle: "annual_calendar",
      autoMatchable: false,
      requiresActivation: false,
      priority: 50,
      merchantPatterns: [],
      description:
        "$300 annual credit for hotel stays of 2+ nights booked through cititravel.com.",
      notes: "Applied at checkout (portal credit, not statement credit). Can be used at any hotel. Resets January 1.",
      details: hotelCollectionDetails,
    }),

    // ── Splurge Credit ($200/year) ──
    b({
      id: "citi_splurge_credit",
      name: "Splurge Credit",
      icon: "ShoppingBag",
      category: "shopping",
      type: "credit",
      creditAmount: 200,
      cycle: "annual_calendar",
      merchantPatterns: ["1stdibs", "american airlines", "best buy", "future personal training", "live nation"],
      autoMatchable: true,
      requiresActivation: true,
      priority: 30,
      description:
        "Up to $200/year in statement credits at your choice of up to 2 brands: 1stDibs, American Airlines, Best Buy, Future Personal Training, or Live Nation.",
      notes: "Must select up to 2 brands through Citi's benefits portal. Resets January 1.",
      details: splurgeCreditDetails,
    }),

    // ── Blacklane Credit ($100 × 2 biannual) ──
    ...expandCycles(CARD_ID, {
      name: "Blacklane Credit", icon: "Car",
      category: "transport", type: "credit", creditAmount: 100,
      merchantPatterns: ["blacklane"],
      autoMatchable: true, requiresActivation: false, priority: 20,
      notes: "Statement credits for rides booked through Blacklane. Unused credits do not roll over.",
      details: blacklaneCreditDetails,
    }, [
      { id: "citi_blacklane_h1", cycle: "biannual_h1", description: "Up to $100 in statement credits for Blacklane rides (Jan–Jun)." },
      { id: "citi_blacklane_h2", cycle: "biannual_h2", description: "Up to $100 in statement credits for Blacklane rides (Jul–Dec)." },
    ]),

    // ── Global Entry / TSA PreCheck ──
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
