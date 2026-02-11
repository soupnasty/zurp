import type { CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "citi_strata_elite";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

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
    }),
  ],
};
