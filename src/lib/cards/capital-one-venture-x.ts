import type { CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "capital_one_venture_x";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

export const capitalOneVentureX: CardDefinition = {
  id: CARD_ID,
  name: "Capital One Venture X",
  issuer: "capital_one",
  network: "visa",
  annualFee: 395,
  feeDescriptor: "CAPITAL ONE ANNUAL FEE",
  imageUrl: null,
  isActive: true,
  benefits: [
    b({
      id: "vx_travel_credit",
      name: "$300 Capital One Travel Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 300,
      cycle: "annual_anniversary",
      autoMatchable: false,
      requiresActivation: false,
      priority: 50,
      merchantPatterns: [],
      description:
        "$300 annual credit for bookings through Capital One Travel portal. Resets on card anniversary.",
    }),

    b({
      id: "vx_anniversary_miles",
      name: "10,000 Anniversary Bonus Miles",
      icon: "Gift",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "annual_anniversary",
      autoMatchable: false,
      requiresActivation: false,
      priority: 40,
      merchantPatterns: [],
      description:
        "10,000 bonus miles auto-deposited on each anniversary. Valued at $100 (1.0cpp floor).",
    }),

    b({
      id: "vx_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "ShieldCheck",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa", "goes"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 30,
      description:
        "Up to $120 credit for Global Entry or TSA PreCheck application fee every 4 years.",
    }),
  ],
};
