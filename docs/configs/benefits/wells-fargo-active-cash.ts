import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "wells_fargo_active_cash";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const cellPhoneProtectionDetails: BenefitDetails = {
  description:
    "Coverage for eligible cell phones damaged, lost, or stolen when the device or monthly service is charged to the Wells Fargo Active Cash card. Maximum coverage is $600 per claim with a $25 deductible. Covers up to 2 claims per 12-month period ($1,200 annual aggregate). Filing deadline is typically 90 days from incident.",
  howToUse: [
    "Ensure your cell phone is purchased with the card or your monthly service is charged to the card",
    "If damage, theft, or loss occurs, file a claim within 90 days",
    "Provide proof of purchase or carrier service letter",
    "For theft claims, provide a police report",
    "Provide photos of damage and repair estimate or invoice",
    "Deductible of $25 applies per claim",
  ],
  links: [
    { label: "Wells Fargo Benefits", url: "https://www.wellsfargo.com" },
    {
      label: "Learn More",
      url: "https://www.wellsfargo.com/credit-cards/active-cash/",
    },
  ],
};

const cdwDetails: BenefitDetails = {
  description:
    "Secondary collision damage waiver (CDW) coverage for rental vehicles. Coverage limit is $50,000 per rental event. Domestic coverage applies for up to 15 consecutive days; international coverage extends to 31 consecutive days. Coverage applies after your personal auto insurance and requires you to decline the rental company's waiver.",
  howToUse: [
    "Charge the full rental car cost to your Wells Fargo Active Cash card",
    "Decline the rental company's collision damage waiver",
    "In case of damage, theft, or vandalism, file a claim",
    "Provide the original rental agreement, damage report from the rental agency, and police report if applicable",
    "Coverage applies as secondary after your personal auto insurance",
  ],
  links: [
    { label: "Wells Fargo Benefits", url: "https://www.wellsfargo.com" },
    {
      label: "Learn More",
      url: "https://www.wellsfargo.com/credit-cards/active-cash/",
    },
  ],
};

// ── Card Definition ──

export const wellsFargoActiveCash: CardDefinition = {
  id: CARD_ID,
  name: "Wells Fargo Active Cash Rewards Card",
  issuer: "wells_fargo",
  network: "visa",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Cell Phone Protection ($600/claim) ──
    b({
      id: "active_cash_cell_phone_protection",
      name: "Cell Phone Protection",
      icon: "Smartphone",
      category: "protection",
      type: "benefit",
      cycle: "one-time",
      merchantPatterns: [],
      autoMatchable: false,
      requiresActivation: false,
      priority: 10,
      description:
        "Up to $600 per claim for cell phone damage, theft, or mechanical failure.",
      notes:
        "$25 deductible per claim. Maximum 2 claims per 12-month period ($1,200 annual aggregate). Applies when phone or service is charged to card.",
      details: cellPhoneProtectionDetails,
    }),

    // ── Collision Damage Waiver (Secondary) ──
    b({
      id: "active_cash_cdw",
      name: "Collision Damage Waiver",
      icon: "Car",
      category: "travel",
      type: "benefit",
      cycle: "one-time",
      merchantPatterns: [
        "rental",
        "hertz",
        "budget",
        "enterprise",
        "avis",
        "national",
        "alamo",
      ],
      autoMatchable: true,
      requiresActivation: false,
      priority: 5,
      description:
        "Up to $50,000 secondary coverage for rental car collision and damage.",
      notes:
        "Secondary coverage applies after personal auto insurance. Covers 15 days domestic, 31 days international. No deductible (subject to primary insurance deductible).",
      details: cdwDetails,
    }),
  ],
};
