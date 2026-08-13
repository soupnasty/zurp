import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  type BenefitInput,
} from "./helpers";

const CARD_ID = "us_bank_altitude_connect";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const globalEntryTsaPreCheckDetails: BenefitDetails = {
  description:
    "Up to $100 credit toward Global Entry, TSA PreCheck, or other trusted traveler programs. Credit provided once every 4 years. Covers the full application and renewal fees for eligible expedited security programs.",
  howToUse: [
    "Apply for Global Entry, TSA PreCheck, NEXUS, SENTRI, or another eligible trusted traveler program",
    "Charge the application or renewal fee to your US Bank Altitude Connect card",
    "Credit of up to $100 will post as a statement credit automatically",
    "Benefit resets every 4 years from date of last reimbursement",
  ],
  links: [
    { label: "US Bank Benefits", url: "https://www.usbank.com" },
    { label: "Global Entry", url: "https://www.globalentry.gov" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
    {
      label: "Learn More",
      url: "https://www.usbank.com/credit-cards/altitude-connect-visa-signature-credit-card.html",
    },
  ],
};

const gigSkyDetails: BenefitDetails = {
  description:
    "Complimentary GigSky global eSIM data for international travel. Enroll your Altitude Connect card with GigSky to redeem complimentary data plans. Redeemable through November 30, 2026.",
  howToUse: [
    "Download the GigSky app on an eSIM-compatible phone",
    "Create a GigSky account and add your US Bank Altitude Connect card",
    "Redeem the complimentary global eSIM data plan before November 30, 2026",
    "Activate the eSIM data plan when you travel internationally",
  ],
  links: [
    { label: "GigSky", url: "https://www.gigsky.com" },
    {
      label: "Learn More",
      url: "https://www.usbank.com/credit-cards/altitude-connect-visa-signature-credit-card.html",
    },
  ],
};

// ── Card Definition ──
// Note: This card's primary value is from points earning rates (5x prepaid hotels/cars via
// US Bank Rewards Center, 4x travel/gas, 2x dining/groceries/streaming, 1x base). Non-credit
// perks like Priority Pass (4 visits/yr) are tracked in the perk matrix, not here.

export const usBankAltitudeConnect: CardDefinition = {
  id: CARD_ID,
  name: "US Bank Altitude Connect",
  issuer: "us_bank",
  network: "visa",
  annualFee: 0,
  feeDescriptor: "no annual fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // ── Global Entry/TSA PreCheck Credit ($100 every 4 years) ──
    b({
      id: "altitude_connect_global_entry",
      name: "Global Entry/TSA PreCheck Credit",
      icon: "Zap",
      category: "travel",
      type: "credit",
      creditAmount: 100,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "tsa pre", "goes", "trusted traveler"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description:
        "Up to $100 credit toward Global Entry, TSA PreCheck, or trusted traveler programs.",
      notes:
        "Credit provided once every 4 years from date of last reimbursement. Covers application and renewal fees for expedited security programs.",
      details: globalEntryTsaPreCheckDetails,
      lifestyleKey: "global_entry",
    }),

    // ── GigSky Global eSIM Data (complimentary, through 11/30/2026) ──
    // Non-dollar perk modeled like DashPass (subscription, $0 credit).
    b({
      id: "altitude_connect_gigsky",
      name: "GigSky Global eSIM Data",
      icon: "Globe",
      category: "subscription",
      type: "subscription",
      creditAmount: 0,
      cycle: "subscription",
      merchantPatterns: ["gigsky"],
      autoMatchable: false,
      requiresActivation: true,
      priority: 50,
      sunsetDate: "2026-11-30",
      description:
        "Complimentary GigSky global eSIM data for international travel.",
      notes:
        "Must enroll with GigSky using your Altitude Connect card. Redeemable through November 30, 2026.",
      details: gigSkyDetails,
    }),
  ],
};
