import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "chase_freedom_unlimited";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const dashpassDetails: BenefitDetails = {
  description:
    "Complimentary DashPass membership with $0 delivery fees and lower service fees on eligible DoorDash orders. Must be activated through DoorDash using your Freedom Unlimited card.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Freedom Unlimited as the default payment method",
    "Follow the prompts to activate your complimentary DashPass membership",
    "DashPass benefits apply automatically to eligible orders",
  ],
  links: [
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase/freedom" },
    { label: "DoorDash App", url: "https://www.doordash.com" },
  ],
};

// ── Card Definition ──

export const chaseFreedomUnlimited: CardDefinition = {
  id: CARD_ID,
  name: "Chase Freedom Unlimited",
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
      name: "DashPass by DoorDash", icon: "Bike",
      category: "subscription", type: "subscription", creditAmount: 0, cycle: "subscription",
      merchantPatterns: ["doordash", "dashpass"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "Complimentary DashPass membership for free delivery on DoorDash.",
      notes: "Must activate through DoorDash.",
      sunsetDate: "2027-12-31",
      lifestyleKey: "doordash",
      details: dashpassDetails,
    }),
  ],
};
