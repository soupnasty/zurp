import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "capital_one_savor";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const capitalOneTravel: BenefitDetails = {
  description:
    "First-year Capital One Travel credit of $100 toward hotel, airline, and rental car bookings made through the Capital One Travel portal. Must be used within the first year of account opening.",
  howToUse: [
    "Log in to your Capital One account",
    "Go to Capital One Travel portal",
    "Search for and book hotels, flights, or rental cars",
    "$100 credit automatically applies at checkout",
    "Credit is one-time and expires after first year",
  ],
  links: [
    { label: "Capital One Travel", url: "https://travel.capitalone.com" },
    {
      label: "Learn More",
      url: "https://www.capitalone.com/credit-cards/savor/",
    },
  ],
};

// ── Card Definition ──

export const capitalOneSavor: CardDefinition = {
  id: CARD_ID,
  name: "Capital One SavorOne Cash Rewards",
  issuer: "capital_one",
  network: "mastercard",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    b({
      id: "co_savor_travel_credit",
      name: "Capital One Travel Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_calendar",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 20,
      description: "$100 first-year Capital One Travel credit.",
      notes:
        "One-time credit in first year only. Book through Capital One Travel portal.",
      details: capitalOneTravel,
    }),
  ],
};
