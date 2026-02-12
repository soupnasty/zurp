import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "world_of_hyatt";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const freeNightCertDetails: BenefitDetails = {
  description:
    "Annual free night certificate valid at any World of Hyatt property in Category 1-4. Limited to available suite inventory at select properties. Certificate expires December 31st of the following year.",
  howToUse: [
    "Log in to world.hyatt.com",
    "Go to My Benefits → Free Night Certificate",
    "Search for a Category 1-4 property available on your dates",
    "Redeem the certificate for a free night",
    "Certificate automatically renews each cardmember anniversary",
  ],
  links: [
    { label: "World of Hyatt", url: "https://world.hyatt.com" },
    {
      label: "Learn More",
      url: "https://www.chase.com/personal/credit-cards/hyatt",
    },
  ],
};

const secondFncDetails: BenefitDetails = {
  description:
    "Additional free night certificate in the same Category 1-4 range earned after $15,000 in card spending within a calendar year.",
  howToUse: [
    "Spend $15,000 on your World of Hyatt card in a calendar year",
    "Additional free night certificate is automatically issued",
    "Certificate is valid same as primary FNC",
  ],
  links: [{ label: "World of Hyatt", url: "https://world.hyatt.com" }],
};

// ── Card Definition ──

export const worldOfHyatt: CardDefinition = {
  id: CARD_ID,
  name: "World of Hyatt Chase",
  issuer: "chase",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    b({
      id: "hyatt_fnc",
      name: "Annual Free Night Certificate",
      icon: "Hotel",
      category: "travel",
      type: "certificate",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: ["hyatt"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 30,
      description:
        "Annual free night certificate at any World of Hyatt Category 1-4 property.",
      notes: "Valid worldwide. Expires December 31 of following year.",
      details: freeNightCertDetails,
    }),
    b({
      id: "hyatt_fnc_15k",
      name: "Free Night Certificate (at $15K spend)",
      icon: "Hotel",
      category: "travel",
      type: "certificate",
      creditAmount: 0,
      cycle: "annual_calendar",
      merchantPatterns: ["hyatt"],
      autoMatchable: false,
      requiresActivation: false,
      priority: 25,
      description:
        "Additional free night certificate after $15,000 annual card spending.",
      notes: "Category 1-4. Automatic upon reaching $15K spend threshold.",
      details: secondFncDetails,
    }),
  ],
};
