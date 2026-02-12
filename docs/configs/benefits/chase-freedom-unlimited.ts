import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "chase_freedom_unlimited";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const doordashDetails: BenefitDetails = {
  description:
    "Complimentary DashPass membership (normally $9.99/month) through DoorDash. DashPass provides $0 delivery fees and reduced service fees on eligible orders. Must activate through DoorDash using your Freedom Unlimited card.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Freedom Unlimited as the default payment method",
    "Follow the prompts to activate your complimentary DashPass membership",
    "DashPass benefits apply automatically to eligible orders",
  ],
  links: [
    { label: "DoorDash", url: "https://www.doordash.com" },
    {
      label: "Chase Freedom Unlimited",
      url: "https://www.chase.com/personal/credit-cards/freedom/freedom-unlimited",
    },
  ],
};

// ── Card Definition ──
// Note: This card's primary value is from earning rates (1.5% everything, 5% Chase Travel,
// 3% dining, 3% drugstores). These are NOT statement credits and are not tracked here.

export const chaseFreedomUnlimited: CardDefinition = {
  id: CARD_ID,
  name: "Chase Freedom Unlimited\u00AE",
  issuer: "chase",
  network: "visa",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── DashPass (subscription) ──
    b({
      id: "cfu_dashpass",
      name: "DashPass by DoorDash",
      icon: "Bike",
      category: "subscription",
      type: "subscription",
      creditAmount: 0,
      cycle: "subscription",
      merchantPatterns: ["doordash", "dashpass"],
      autoMatchable: true,
      requiresActivation: true,
      priority: 50,
      description:
        "Complimentary DashPass membership for free delivery on DoorDash.",
      notes: "Must activate through DoorDash. DashPass normally $9.99/month.",
      sunsetDate: "2027-12-31",
      details: doordashDetails,
      brandSlug: "doordash",
    }),
  ],
};
