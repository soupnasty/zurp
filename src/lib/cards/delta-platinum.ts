import type { BenefitDetails, CardDefinition } from "../types";
import { defineBenefit, type BenefitInput } from "./helpers";

const CARD_ID = "delta_platinum";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const deltaFlightCreditDetails: BenefitDetails = {
  description:
    "REMOVED after August 2026 audit: the $200 Delta flight credit is a Delta Gold Amex benefit and never applied to the Delta Platinum card. Retained here only for any historical usage records.",
  howToUse: [
    "This benefit does not exist on the Delta SkyMiles Platinum card",
    "The $200 Delta flight credit (after $10K annual spend) belongs to the Delta Gold Amex",
  ],
  links: [
    { label: "Delta Air Lines", url: "https://www.delta.com" },
    {
      label: "Learn More",
      url: "https://www.americanexpress.com/us/credit-cards/card/delta-skyMiles-platinum/",
    },
  ],
};

const uberOneMonthlyDetails: BenefitDetails = {
  description:
    "Monthly Uber One credit up to $9.99 per month. Enrollment window closed June 25, 2026 — no new enrollments are accepted. Cardmembers who enrolled before the deadline continue receiving trailing monthly credits that post into 2027. Includes $0 delivery fees, up to 10% off eligible Uber Eats orders, and 5% off eligible Uber rides.",
  howToUse: [
    "Enrollment closed June 25, 2026 — new enrollments are no longer accepted",
    "If you enrolled before the deadline, keep your Uber One membership charged to the card",
    "Trailing monthly credits continue to post into 2027 for enrollees",
    "Benefits apply to eligible Uber rides and Uber Eats orders",
  ],
  links: [
    {
      label: "Link your accounts",
      url: "https://www.americanexpress.com/en-us/benefits/uber/",
    },
    { label: "Uber One", url: "https://www.uber.com/us/en/u/uber-one/" },
  ],
};

const deltaStaysCreditDetails: BenefitDetails = {
  description:
    "Up to $150 per calendar year in statement credits for prepaid Delta Stays bookings (hotels and vacation rentals) made on delta.com. Credits apply automatically to eligible prepaid bookings charged to the card.",
  howToUse: [
    "Go to delta.com and navigate to Delta Stays (Hotels & Cars)",
    "Book a prepaid hotel or vacation rental through Delta Stays",
    "Pay with your Delta Platinum card",
    "Up to $150 in statement credits posts automatically each calendar year",
  ],
  links: [
    { label: "Delta Stays", url: "https://www.delta.com/stays" },
    {
      label: "Learn More",
      url: "https://www.americanexpress.com/us/credit-cards/card/delta-skyMiles-platinum/",
    },
  ],
};

const resyCreditDetails: BenefitDetails = {
  description:
    "Up to $120 per year in statement credits ($10/month) for purchases at U.S. restaurants on Resy. Enrollment required before first purchase. Unused monthly credit does not roll over.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Resy Credit",
    "Tap to enroll in the benefit",
    "Dine at a U.S. Resy restaurant and pay with your Delta Platinum card, or make a purchase on Resy.com/app",
    "The $10 monthly statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Resy", url: "https://resy.com" },
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
  ],
};

const rideshareCreditDetails: BenefitDetails = {
  description:
    "Up to $120 per year in statement credits ($10/month) for U.S. rideshare purchases with eligible providers including Uber, Lyft, Curb, Revel, and Alto. Enrollment required before first purchase. Unused monthly credit does not roll over.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Rideshare Credit",
    "Tap to enroll in the benefit",
    "Pay for U.S. rideshare (Uber, Lyft, Curb, Revel, Alto, etc.) with your Delta Platinum card",
    "The $10 monthly statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Uber", url: "https://www.uber.com" },
    { label: "Lyft", url: "https://www.lyft.com" },
    {
      label: "Amex Benefits",
      url: "https://www.americanexpress.com/en-us/benefits/discover/",
    },
  ],
};

// ── Card Definition ──

export const deltaPlatinum: CardDefinition = {
  id: CARD_ID,
  name: "Delta SkyMiles Platinum American Express",
  issuer: "amex",
  network: "amex",
  annualFee: 350,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  lastVerifiedAt: "2026-08-13",
  benefits: [
    // Non-tracked benefits (certificates, tracked in perk matrix only):
    // - Companion Certificate (annual, no spend requirement)

    // ── Delta Flight Credit (REMOVED — never a Delta Platinum benefit) ──
    // Kept (not deleted) because users may have usage history. sunsetDate in
    // the past deactivates it going forward.
    b({
      id: "delta_flight_credit",
      name: "Delta Flight Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 200,
      cycle: "annual_calendar",
      merchantPatterns: ["delta", "delta air lines"],
      autoMatchable: true,
      requiresActivation: true,
      priority: 30,
      description:
        "Removed: the $200 Delta flight credit belongs to the Delta Gold Amex, not the Platinum.",
      notes:
        "audit 2026-08: benefit belongs to Delta Gold Amex, never applied to Platinum. Retained for historical usage only.",
      sunsetDate: "2026-08-12",
      details: deltaFlightCreditDetails,
      lifestyleKey: "delta",
    }),

    // ── Uber One Monthly Credit (enrollment window closed 6/25/2026) ──
    // Kept (not deleted) because users may have usage history. sunsetDate in
    // the past deactivates it going forward.
    b({
      id: "delta_uber_one",
      name: "Uber One Monthly Credit",
      icon: "Car",
      category: "transport",
      type: "credit",
      creditAmount: 9.99,
      cycle: "monthly",
      merchantPatterns: ["uber"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description:
        "Up to $9.99/month Uber One membership credit (enrollment closed 6/25/2026).",
      notes:
        "Enrollment window closed 6/25/2026. Trailing credits post into 2027 for cardmembers who enrolled before the deadline. Includes $0 delivery fees, discounts on rides and Uber Eats.",
      // Uber One enrollment window closed June 25, 2026
      sunsetDate: "2026-06-25",
      details: uberOneMonthlyDetails,
      activeMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      lifestyleKey: "uber",
    }),

    // ── Delta Stays Credit ($150/calendar year) ──
    b({
      id: "delta_stays_credit",
      name: "Delta Stays Credit",
      icon: "Hotel",
      category: "travel",
      type: "credit",
      creditAmount: 150,
      cycle: "annual_calendar",
      merchantPatterns: ["delta stays", "delta hotels"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 25,
      description:
        "Up to $150/year in statement credits for prepaid Delta Stays bookings on delta.com.",
      notes:
        "Prepaid hotels and vacation rentals booked through Delta Stays on delta.com only.",
      details: deltaStaysCreditDetails,
      lifestyleKey: "hotel_portal",
    }),

    // ── Resy Credit ($10/mo, $120/yr) ──
    b({
      id: "delta_resy_credit",
      name: "Resy Credit",
      icon: "UtensilsCrossed",
      category: "dining",
      type: "credit",
      creditAmount: 10,
      cycle: "monthly",
      merchantPatterns: ["resy"],
      // Resy restaurants charge as ordinary restaurant merchants, so
      // transactions can't be reliably auto-matched (same as Amex Gold Resy).
      autoMatchable: false,
      requiresActivation: true,
      priority: 20,
      description:
        "Up to $10/month in statement credits at U.S. Resy restaurants ($120/year).",
      notes:
        "Enrollment required. Resy restaurants appear as ordinary restaurant merchants — mark usage manually.",
      details: resyCreditDetails,
      lifestyleKey: "fine_dining",
    }),

    // ── Rideshare Credit ($10/mo, $120/yr) ──
    b({
      id: "delta_rideshare_credit",
      name: "Rideshare Credit",
      icon: "Car",
      category: "transport",
      type: "credit",
      creditAmount: 10,
      cycle: "monthly",
      // No bare "uber" — too broad, matches "uber eats" (CSR precedent).
      // Uber rides match via plaidCategories instead.
      merchantPatterns: ["lyft", "curb", "revel", "alto"],
      plaidCategories: ["TRANSPORTATION_RIDESHARE"],
      autoMatchable: true,
      requiresActivation: true,
      priority: 20,
      description:
        "Up to $10/month in statement credits on U.S. rideshare ($120/year).",
      notes:
        "Enrollment required. Eligible U.S. rideshare providers include Uber, Lyft, Curb, Revel, and Alto.",
      details: rideshareCreditDetails,
      lifestyleKey: ["uber", "lyft"],
    }),
  ],
};
