import type { BenefitDetails, CardDefinition } from "../types";
import {
  defineBenefit,
  expandCycles,
  type BenefitInput,
} from "./helpers";

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

const wirelessCreditDetails: BenefitDetails = {
  description:
    "Up to $10/month in statement credits for wireless telephone service purchases made directly with a wireless provider in the U.S., totaling up to $120 back per year.",
  howToUse: [
    "Pay your wireless bill directly with your Business Platinum card",
    "Wireless providers include AT&T, T-Mobile, Verizon, Sprint, and others",
    "Statement credit posts automatically each month",
  ],
  links: [
    {
      label: "Business Platinum Benefits",
      url: "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/american-express-business-platinum-credit-card-amex/",
    },
  ],
};

const adobeCreditDetails: BenefitDetails = {
  description:
    "Up to $250 in annual statement credits for purchases made directly with Adobe per calendar year on adobe.com or through Adobe. Requires a minimum of $600 in qualifying U.S. purchases per calendar year.",
  howToUse: [
    "Make purchases at adobe.com or directly with Adobe",
    "Ensure you have at least $600 in qualifying U.S. purchases per calendar year",
    "Statement credit posts automatically after spending requirement is met",
  ],
  links: [
    {
      label: "Adobe Benefit Details",
      url: "https://global.americanexpress.com/card-benefits/detail/adobe-benefit/business-platinum",
    },
  ],
};

const indeedCreditDetails: BenefitDetails = {
  description:
    "Up to $360 in annual statement credits for recruiting services on Indeed.com, with up to $90 back per quarter available through sponsored job postings and other Indeed services.",
  howToUse: [
    "Enroll in the Indeed benefit through your Amex account",
    "Go to Indeed.com",
    "Use your Business Platinum card for job postings or sponsored content",
    "Statement credits are available up to $90 per quarter",
  ],
  links: [
    {
      label: "Indeed Benefit",
      url: "https://global.americanexpress.com/card-benefits/detail/indeed-benefit/business-platinum",
    },
  ],
};

const airlineFeeCreditDetails: BenefitDetails = {
  description:
    "$200 annual statement credit for qualifying airline incidental fees, such as baggage fees, seat selections, and in-flight beverages charged to your Business Platinum card with participating airlines.",
  howToUse: [
    "Charge airline incidental fees directly to your Business Platinum card",
    "Eligible fees include baggage, seat selection, in-flight beverages, and seat upgrades",
    "Participating airlines: Delta, United, American Airlines, Southwest, Alaska Airlines, JetBlue, Spirit, Frontier",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    {
      label: "Business Platinum Benefits",
      url: "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/american-express-business-platinum-credit-card-amex/",
    },
  ],
};

const hiltonCreditDetails: BenefitDetails = {
  description:
    "$200 annual statement credit distributed as four $50 quarterly credits for qualifying stays at Hilton for Business properties worldwide when booked directly.",
  howToUse: [
    "Book a stay at a Hilton for Business property",
    "Book directly through hiltonbusiness.com or by calling Hilton",
    "Charge the stay to your Business Platinum card",
    "Up to $50 quarterly credit applies per quarter",
  ],
  links: [
    {
      label: "Hilton for Business",
      url: "https://www.hiltonbusinesstravel.com/",
    },
    {
      label: "Business Platinum Benefits",
      url: "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/american-express-business-platinum-credit-card-amex/",
    },
  ],
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
        lifestyleKey: "hotel_portal",
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
      lifestyleKey: "dell",
    }),
    b({
      id: "biz_plat_global_entry",
      name: "Global Entry / TSA PreCheck",
      icon: "Shield",
      category: "travel",
      type: "credit",
      creditAmount: 120,
      cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "tsa pre", "goes", "trusted traveler"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $120 every 4 years for Global Entry or TSA PreCheck.",
      notes: "Covers application fee only.",
      details: globalEntryDetails,
      lifestyleKey: "global_entry",
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
      lifestyleKey: "clear_plus",
    }),

    // ── 2025 Refresh Benefits ──
    b({
      id: "biz_plat_wireless_credit",
      name: "Wireless Telephone Credit",
      icon: "Phone",
      category: "subscription",
      type: "credit",
      creditAmount: 10,
      cycle: "monthly",
      merchantPatterns: ["at&t", "t-mobile", "verizon", "sprint", "wireless"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 15,
      description: "Up to $10/month wireless telephone credit ($120/year).",
      notes: "For U.S. wireless providers (AT&T, T-Mobile, Verizon, Sprint, etc.).",
      details: wirelessCreditDetails,
    }),
    b({
      id: "biz_plat_adobe_credit",
      name: "Adobe Credit",
      icon: "Paintbrush",
      category: "shopping",
      type: "credit",
      creditAmount: 250,
      cycle: "annual_calendar",
      merchantPatterns: ["adobe"],
      autoMatchable: true,
      requiresActivation: false,
      priority: 20,
      description: "Up to $250/year Adobe Creative Cloud credit.",
      notes: "Requires $600 in qualifying U.S. purchases per calendar year.",
      details: adobeCreditDetails,
      lifestyleKey: "adobe",
    }),

    // ── Quarterly Credits ──
    ...expandCycles(
      CARD_ID,
      {
        name: "Indeed Recruiting Credit",
        icon: "Briefcase",
        category: "shopping",
        type: "credit",
        creditAmount: 90,
        merchantPatterns: ["indeed"],
        autoMatchable: true,
        requiresActivation: true,
        priority: 15,
        notes: "Requires enrollment. Up to $360 annually across all quarters.",
        details: indeedCreditDetails,
      },
      [
        {
          id: "biz_plat_indeed_credit_q1",
          cycle: "quarterly_q1",
          name: "Indeed Credit (Q1)",
          description: "Up to $90 Indeed recruiting credit (Jan–Mar).",
        },
        {
          id: "biz_plat_indeed_credit_q2",
          cycle: "quarterly_q2",
          name: "Indeed Credit (Q2)",
          description: "Up to $90 Indeed recruiting credit (Apr–Jun).",
        },
        {
          id: "biz_plat_indeed_credit_q3",
          cycle: "quarterly_q3",
          name: "Indeed Credit (Q3)",
          description: "Up to $90 Indeed recruiting credit (Jul–Sep).",
        },
        {
          id: "biz_plat_indeed_credit_q4",
          cycle: "quarterly_q4",
          name: "Indeed Credit (Q4)",
          description: "Up to $90 Indeed recruiting credit (Oct–Dec).",
        },
      ]
    ),
    ...expandCycles(
      CARD_ID,
      {
        name: "Hilton Credit",
        icon: "Hotel",
        category: "travel",
        type: "credit",
        creditAmount: 50,
        merchantPatterns: ["hilton"],
        autoMatchable: true,
        requiresActivation: true,
        priority: 15,
        notes:
          "For Hilton for Business properties. Book directly through hiltonbusiness.com.",
        details: hiltonCreditDetails,
        lifestyleKey: "hilton_resorts",
      },
      [
        {
          id: "biz_plat_hilton_credit_q1",
          cycle: "quarterly_q1",
          name: "Hilton Credit (Q1)",
          description: "Up to $50 Hilton for Business credit (Jan–Mar).",
        },
        {
          id: "biz_plat_hilton_credit_q2",
          cycle: "quarterly_q2",
          name: "Hilton Credit (Q2)",
          description: "Up to $50 Hilton for Business credit (Apr–Jun).",
        },
        {
          id: "biz_plat_hilton_credit_q3",
          cycle: "quarterly_q3",
          name: "Hilton Credit (Q3)",
          description: "Up to $50 Hilton for Business credit (Jul–Sep).",
        },
        {
          id: "biz_plat_hilton_credit_q4",
          cycle: "quarterly_q4",
          name: "Hilton Credit (Q4)",
          description: "Up to $50 Hilton for Business credit (Oct–Dec).",
        },
      ]
    ),
    b({
      id: "biz_plat_airline_fee_credit",
      name: "Airline Fee Credit",
      icon: "Plane",
      category: "travel",
      type: "credit",
      creditAmount: 200,
      cycle: "annual_calendar",
      merchantPatterns: [
        "airline",
        "delta",
        "united",
        "american air",
        "southwest",
        "alaska air",
        "jetblue",
        "spirit",
        "frontier",
      ],
      autoMatchable: true,
      requiresActivation: true,
      priority: 15,
      description: "Up to $200/year for airline incidental fees.",
      notes:
        "Baggage fees, seat selection, in-flight beverages, and seat upgrades.",
      details: airlineFeeCreditDetails,
      lifestyleKey: "airline_fee",
    }),
  ],
};
