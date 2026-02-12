import type { BenefitDetails, CardDefinition } from "@/lib/types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "../../../src/lib/cards/helpers";

const CARD_ID = "amex_business_platinum";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const hotelCreditDetails: BenefitDetails = {
  description:
    "$600 annual hotel credit distributed as two $300 semi-annual credits for eligible bookings at Fine Hotels and Resorts properties or The Hotel Collection luxury properties booked through AmexTravel.com.",
  howToUse: [
    "Go to AmexTravel.com or use the Amex app",
    "Search for Fine Hotels + Resorts or The Hotel Collection properties",
    "Book a prepaid stay using your Business Platinum card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "AmexTravel.com", url: "https://travel.americanexpress.com" },
    {
      label: "Fine Hotels + Resorts",
      url: "https://www.americanexpress.com/en-us/travel/fine-hotels-resorts/",
    },
  ],
};

const dellCreditDetails: BenefitDetails = {
  description:
    "$150 automatic annual Dell Technologies credit applied toward qualifying Dell purchases on the Dell Business website. Additional credit up to $1,000 earned upon accumulation of $5,000 in annual card spending.",
  howToUse: [
    "Go to dell.com/business",
    "Make qualifying purchases using your Business Platinum card",
    "$150 automatic credit applies annually",
    "Additional credit up to $1,000 available after $5,000 annual spend",
  ],
  links: [
    { label: "Dell Business", url: "https://www.dell.com/en-us/business" },
  ],
};

const globalEntryDetails: BenefitDetails = {
  description:
    "Up to $120 statement credit every 4 years for Global Entry or TSA PreCheck application fees.",
  howToUse: [
    "Apply for Global Entry ($120) or TSA PreCheck ($85) through official government sites",
    "Pay with your Business Platinum card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    {
      label: "Global Entry",
      url: "https://www.cbp.gov/travel/trusted-traveler-programs/global-entry",
    },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
  ],
};

const clearDetails: BenefitDetails = {
  description:
    "Up to $209/year in statement credits covering a CLEAR Plus membership (expedited security screening at 50+ airports).",
  howToUse: [
    "Sign up for CLEAR Plus at clearme.com",
    "Pay with your Business Platinum card",
    "Statement credit posts automatically after the charge",
  ],
  links: [{ label: "CLEAR", url: "https://www.clearme.com" }],
};

// ── Card Definition ──

export const amexBusinessPlatinum: CardDefinition = {
  id: CARD_ID,
  name: "American Express Business Platinum Card",
  issuer: "amex",
  network: "amex",
  annualFee: 895,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Semi-annual Hotel Credits ($300/half × 2) ──
    ...expandCycles(
      CARD_ID,
      {
        name: "Hotel Credit",
        icon: "Hotel",
        category: "travel",
        type: "credit",
        creditAmount: 300,
        merchantPatterns: [
          "fine hotels",
          "hotel collection",
          "amextravel",
          "amex travel",
        ],
        autoMatchable: false,
        requiresActivation: false,
        priority: 25,
        notes:
          "Fine Hotels + Resorts or The Hotel Collection. Book through AmexTravel.com.",
        details: hotelCreditDetails,
      },
      [
        {
          id: "biz_plat_hotel_h1",
          cycle: "biannual_h1",
          name: "Hotel Credit (H1)",
          description: "Up to $300 hotel credit via FHR/THC (Jan–Jun).",
        },
        {
          id: "biz_plat_hotel_h2",
          cycle: "biannual_h2",
          name: "Hotel Credit (H2)",
          description: "Up to $300 hotel credit via FHR/THC (Jul–Dec).",
        },
      ]
    ),

    // ── Annual Benefits ──
    b({
      id: "biz_plat_dell_credit",
      name: "Dell Credit",
      icon: "Laptop",
      category: "shopping",
      type: "credit",
      creditAmount: 150,
      cycle: "annual_calendar",
      merchantPatterns: ["dell"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $150 annual automatic Dell Technologies credit.",
      notes: "Additional up to $1,000 available after $5,000 annual spend.",
      details: dellCreditDetails,
    }),
    b({
      id: "biz_plat_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "Shield",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "tsa pre"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $120 every 4 years for Global Entry or TSA PreCheck.",
      notes: "Covers application fee only.",
      details: globalEntryDetails,
    }),
    b({
      id: "biz_plat_clear",
      name: "CLEAR Plus Credit",
      icon: "Shield",
      category: "travel",
      type: "credit",
      creditAmount: 209,
      cycle: "annual_calendar",
      merchantPatterns: ["clear", "clearme"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $209/year covering CLEAR Plus membership.",
      notes: "Covers annual CLEAR Plus membership fee.",
      details: clearDetails,
    }),
  ],
};
