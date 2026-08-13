import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "ink_business_preferred";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const dashpassDetails: BenefitDetails = {
  description:
    "Complimentary DashPass subscription with $0 delivery fees and lower service fees on eligible DoorDash orders. Must be activated through DoorDash using your Ink Business Preferred card.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Ink Business Preferred as the default payment method",
    "Follow the prompts to activate your complimentary DashPass subscription",
    "DashPass benefits apply automatically to eligible orders",
  ],
  links: [
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase" },
    { label: "DoorDash App", url: "https://www.doordash.com" },
  ],
};

const doordashNonRestaurantDetails: BenefitDetails = {
  description:
    "Up to $10 per month in DoorDash credit on non-restaurant orders (grocery, convenience, retail). Requires activation through DoorDash with your Ink Business Preferred card. Unused monthly value is forfeited.",
  howToUse: [
    "Activate the benefit through DoorDash with your Ink Business Preferred card",
    "Place a non-restaurant order (grocery, convenience, retail) on DoorDash",
    "Apply the $10 promo at checkout",
    "Credit resets monthly; unused value does not roll over",
  ],
  links: [
    { label: "DoorDash App", url: "https://www.doordash.com" },
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase" },
  ],
};

// ── Card Definition ──

export const inkBusinessPreferred: CardDefinition = {
  id: CARD_ID,
  name: "Chase Ink Business Preferred Credit Card",
  issuer: "chase",
  network: "visa",
  annualFee: 95,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  // Ink Business Preferred is primarily an earning card (3x travel/shipping/internet/phone/advertising),
  // plus DoorDash partner benefits (DashPass + monthly non-restaurant credit).
  benefits: [
    // ── DashPass (subscription) ──
    b({
      id: "ink_dashpass",
      name: "DashPass by DoorDash", icon: "Bike",
      category: "subscription", type: "subscription", creditAmount: 0, cycle: "subscription",
      merchantPatterns: ["doordash", "dashpass"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "Complimentary DashPass subscription for free delivery on DoorDash.",
      notes: "Must activate through DoorDash.",
      sunsetDate: "2027-12-31",
      lifestyleKey: "doordash",
      details: dashpassDetails,
    }),
    // ── DoorDash Non-Restaurant Credit ($10/month) ──
    b({
      id: "ink_doordash_nonrestaurant",
      name: "DoorDash Non-Restaurant Credit", icon: "Bike",
      category: "shopping", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["doordash"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "$10/month DoorDash credit on non-restaurant orders (grocery, retail).",
      notes: "Use-it-or-lose-it. Grocery, convenience, retail orders only.",
      sunsetDate: "2027-12-31",
      lifestyleKey: "doordash",
      details: doordashNonRestaurantDetails,
    }),
  ],
};
