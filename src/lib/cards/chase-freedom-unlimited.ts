import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, expandCycles, type BenefitInput } from "./helpers";

const CARD_ID = "chase_freedom_unlimited";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const dashpassDetails: BenefitDetails = {
  description:
    "6-month complimentary DashPass trial with $0 delivery fees and lower service fees on eligible DoorDash orders. Activate between 2/1/2025 and 12/31/2027 through DoorDash using your Freedom Unlimited card. After the 6 free months, you are automatically enrolled in DashPass at the then-current monthly rate unless you cancel.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Freedom Unlimited as the default payment method",
    "Activate the complimentary 6-month DashPass trial (activation window: 2/1/2025–12/31/2027)",
    "Set a reminder: after 6 months you are auto-enrolled at the paid monthly rate unless you cancel",
  ],
  links: [
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase/freedom" },
    { label: "DoorDash App", url: "https://www.doordash.com" },
  ],
};

const doordashQuarterlyDetails: BenefitDetails = {
  description:
    "Up to $10 per quarter in DoorDash credit on non-restaurant orders (grocery, convenience, retail) through 12/31/2027. Requires activation through DoorDash with your Freedom Unlimited card. Unused quarterly value is forfeited.",
  howToUse: [
    "Activate the benefit through DoorDash with your Freedom Unlimited card",
    "Place a non-restaurant order (grocery, convenience, retail) on DoorDash",
    "Apply the $10 promo at checkout",
    "Credit resets quarterly; unused value does not roll over. Ends 12/31/2027",
  ],
  links: [
    { label: "DoorDash App", url: "https://www.doordash.com" },
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase/freedom" },
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
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // ── DashPass (6-month complimentary trial) ──
    b({
      id: "cfu_dashpass",
      name: "DashPass by DoorDash", icon: "Bike",
      category: "subscription", type: "subscription", creditAmount: 0, cycle: "subscription",
      merchantPatterns: ["doordash", "dashpass"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "6-month complimentary DashPass trial (activate by 12/31/2027).",
      notes:
        "6-month trial, not an ongoing free membership. Activate between 2/1/2025 and 12/31/2027; auto-enrolls at the paid monthly rate after 6 months unless cancelled.",
      sunsetDate: "2027-12-31", // activation deadline
      lifestyleKey: "doordash",
      details: dashpassDetails,
    }),
    // ── DoorDash Non-Restaurant Credit ($10/quarter through 12/31/2027) ──
    ...expandCycles(CARD_ID, {
      name: "DoorDash Non-Restaurant Credit", icon: "Bike",
      category: "shopping", type: "credit", creditAmount: 10,
      merchantPatterns: ["doordash"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      notes: "Use-it-or-lose-it. Grocery, convenience, retail orders only. Ends 12/31/2027.",
      sunsetDate: "2027-12-31",
      lifestyleKey: "doordash",
      details: doordashQuarterlyDetails,
    }, [
      { id: "cfu_doordash_nonrestaurant_q1", cycle: "quarterly_q1", name: "DoorDash Non-Restaurant Credit (Q1)", description: "Up to $10 in DoorDash non-restaurant credit (Jan–Mar)." },
      { id: "cfu_doordash_nonrestaurant_q2", cycle: "quarterly_q2", name: "DoorDash Non-Restaurant Credit (Q2)", description: "Up to $10 in DoorDash non-restaurant credit (Apr–Jun)." },
      { id: "cfu_doordash_nonrestaurant_q3", cycle: "quarterly_q3", name: "DoorDash Non-Restaurant Credit (Q3)", description: "Up to $10 in DoorDash non-restaurant credit (Jul–Sep)." },
      { id: "cfu_doordash_nonrestaurant_q4", cycle: "quarterly_q4", name: "DoorDash Non-Restaurant Credit (Q4)", description: "Up to $10 in DoorDash non-restaurant credit (Oct–Dec)." },
    ]),
  ],
};
