import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, expandCycles, type BenefitInput } from "./helpers";

const CARD_ID = "amex_platinum";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const uberCashDetails: BenefitDetails = {
  description:
    "Up to $200/year in Uber Cash: $15/month (Jan–Nov) and $35 in December. Uber Cash can be used for Uber rides, Uber Eats orders, and other Uber services. Credits are automatically added to your connected Uber account each month.",
  howToUse: [
    "Open the Uber app and go to Wallet",
    "Add your Platinum Card as the payment method",
    "Link your Amex and Uber accounts via amex.com/uber or the Amex app",
    "Uber Cash is automatically added at the start of each month",
    "Use for rides, Uber Eats, or grocery delivery",
  ],
  links: [
    { label: "Link your accounts", url: "https://www.americanexpress.com/en-us/benefits/uber/" },
    { label: "Uber", url: "https://www.uber.com" },
    { label: "Learn More", url: "https://www.americanexpress.com/us/credit-cards/card/platinum/" },
  ],
};

const uberOneDetails: BenefitDetails = {
  description:
    "Complimentary Uber One membership (normally $9.99/mo). Includes $0 delivery fees, up to 10% off eligible Uber Eats orders, and 5% off eligible Uber rides. Must link Amex and Uber accounts.",
  howToUse: [
    "Link your Amex and Uber accounts via amex.com/uber",
    "Uber One membership is automatically activated",
    "Benefits apply to eligible Uber rides and Uber Eats orders",
  ],
  links: [
    { label: "Link your accounts", url: "https://www.americanexpress.com/en-us/benefits/uber/" },
    { label: "Uber One", url: "https://www.uber.com/us/en/u/uber-one/" },
  ],
};

const digitalEntertainmentDetails: BenefitDetails = {
  description:
    "Up to $25/month in statement credits for eligible digital entertainment subscriptions: Disney+, Disney+ Bundle, Hulu, ESPN+, The New York Times, The Wall Street Journal, YouTube Premium, YouTube TV, Peacock, and Paramount+. Must enroll before first purchase.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Digital Entertainment Credit",
    "Tap to enroll in the benefit",
    "Subscribe to an eligible streaming service using your Platinum Card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
    { label: "Eligible services", url: "https://www.americanexpress.com/us/credit-cards/card/platinum/digital-entertainment-credit/" },
    { label: "Learn More", url: "https://www.americanexpress.com/us/credit-cards/card/platinum/" },
  ],
};

const walmartPlusDetails: BenefitDetails = {
  description:
    "Up to $12.95/month in statement credits covering the cost of a Walmart+ membership. Includes free delivery from your local store, free shipping with no minimum, member prices on fuel, and more.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Walmart+ Credit",
    "Tap to enroll in the benefit",
    "Sign up for Walmart+ using your Platinum Card",
    "Statement credit posts automatically after the monthly charge",
  ],
  links: [
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
    { label: "Walmart+", url: "https://www.walmart.com/plus" },
  ],
};

const resyCreditDetails: BenefitDetails = {
  description:
    "Up to $100 per quarter in statement credits for purchases made at Resy restaurants or on Resy.com/app. Must enroll before first purchase. Unused credit in one quarter does NOT carry to the next.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Resy Credit",
    "Tap to enroll in the benefit",
    "Dine at a Resy-affiliated restaurant and pay with your Platinum Card, or make a purchase on Resy.com/app",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Resy", url: "https://resy.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
  ],
};

const lululemonDetails: BenefitDetails = {
  description:
    "Up to $75 per quarter in statement credits for purchases at lululemon (in-store or online). Must enroll before first purchase. Unused credit in one quarter does NOT carry to the next.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the lululemon Credit",
    "Tap to enroll in the benefit",
    "Shop at any lululemon location or on lululemon.com using your Platinum Card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "lululemon", url: "https://www.lululemon.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
  ],
};

const hotelCreditDetails: BenefitDetails = {
  description:
    "Up to $300 per half-year ($600 annual total) in statement credits for prepaid hotel stays booked through The Hotel Collection or Fine Hotels + Resorts via AmexTravel.com. Two-night minimum stay required.",
  howToUse: [
    "Go to AmexTravel.com or use the Amex app",
    "Search for hotels and look for Fine Hotels + Resorts or The Hotel Collection properties",
    "Book a prepaid stay of at least 2 nights using your Platinum Card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "AmexTravel.com", url: "https://travel.americanexpress.com" },
    { label: "Fine Hotels + Resorts", url: "https://www.americanexpress.com/en-us/travel/fine-hotels-resorts/" },
  ],
};

const saksCreditDetails: BenefitDetails = {
  description:
    "Up to $50 per half-year ($100 annual total) in statement credits for purchases at Saks Fifth Avenue stores or saks.com. Must enroll before first purchase.",
  howToUse: [
    "Open the Amex app or log in to americanexpress.com",
    "Go to Benefits → find the Saks Fifth Avenue Credit",
    "Tap to enroll in the benefit",
    "Shop at Saks Fifth Avenue (in-store or online) using your Platinum Card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Saks Fifth Avenue", url: "https://www.saksfifthavenue.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
  ],
};

const airlineFeeCreditDetails: BenefitDetails = {
  description:
    "Up to $200/year in statement credits for incidental fees charged by your selected qualifying airline. Covers baggage fees, seat upgrades, in-flight purchases, and other incidental charges. Does NOT cover airfare. Must select one airline per calendar year.",
  howToUse: [
    "Log in to americanexpress.com",
    "Go to Benefits → Airline Fee Credit",
    "Select your preferred qualifying airline for the calendar year",
    "Pay for incidental fees (bags, seats, etc.) with your Platinum Card on that airline",
    "Statement credit posts automatically",
  ],
  links: [
    { label: "Select your airline", url: "https://global.americanexpress.com/card-benefits/detail/airline-fee/platinum" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
  ],
};

const equinoxDetails: BenefitDetails = {
  description:
    "Up to $300/year ($25/month) in statement credits toward an Equinox+ digital fitness membership or eligible Equinox club membership fees. Must pay with your Platinum Card.",
  howToUse: [
    "Sign up for Equinox or Equinox+ using your Platinum Card",
    "Statement credits of up to $25/month post automatically",
    "Applies to Equinox club dues and Equinox+ digital membership",
  ],
  links: [
    { label: "Equinox", url: "https://www.equinox.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
  ],
};

const clearDetails: BenefitDetails = {
  description:
    "Up to $209/year in statement credits covering a CLEAR Plus membership (currently $209/yr). CLEAR provides expedited security screening at 50+ airports and select stadiums.",
  howToUse: [
    "Sign up for CLEAR Plus at clearme.com or at an airport CLEAR pod",
    "Pay with your Platinum Card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "CLEAR", url: "https://www.clearme.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
  ],
};

const globalEntryDetails: BenefitDetails = {
  description:
    "Up to $120 statement credit every 4 years for Global Entry or TSA PreCheck application fees. Applies to the application fee only.",
  howToUse: [
    "Apply for Global Entry ($120) or TSA PreCheck ($78–$85) through the official government sites",
    "Pay the application fee with your Platinum Card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Global Entry", url: "https://www.cbp.gov/travel/trusted-traveler-programs/global-entry" },
    { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
  ],
};

const ouraDetails: BenefitDetails = {
  description:
    "Up to $200/year in statement credits toward an Oura Ring purchase or Oura membership fees. Must pay with your Platinum Card.",
  howToUse: [
    "Purchase an Oura Ring or pay for Oura membership using your Platinum Card",
    "Statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Oura", url: "https://ouraring.com" },
    { label: "Amex Benefits", url: "https://www.americanexpress.com/en-us/benefits/discover/" },
  ],
};

// ── Card Definition ──

export const amexPlatinum: CardDefinition = {
  id: CARD_ID,
  name: "American Express\u00AE Platinum Card",
  issuer: "amex",
  network: "amex",
  annualFee: 895,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Quarterly Resy Credits ($100/quarter × 4) ──
    ...expandCycles(CARD_ID, {
      name: "Resy Credit", icon: "UtensilsCrossed", category: "dining",
      type: "credit", creditAmount: 100, merchantPatterns: ["resy"],
      autoMatchable: false, requiresActivation: true, priority: 10,
      notes: "Must enroll before first purchase. Reservation through Resy not required.",
      details: resyCreditDetails,
      lifestyleKey: "fine_dining",
    }, [
      { id: "plat_resy_credit_q1", cycle: "quarterly_q1", name: "Resy Credit (Q1)", description: "Up to $100 in statement credits for Resy dining (Jan\u2013Mar)." },
      { id: "plat_resy_credit_q2", cycle: "quarterly_q2", name: "Resy Credit (Q2)", description: "Up to $100 in statement credits for Resy dining (Apr\u2013Jun)." },
      { id: "plat_resy_credit_q3", cycle: "quarterly_q3", name: "Resy Credit (Q3)", description: "Up to $100 in statement credits for Resy dining (Jul\u2013Sep)." },
      { id: "plat_resy_credit_q4", cycle: "quarterly_q4", name: "Resy Credit (Q4)", description: "Up to $100 in statement credits for Resy dining (Oct\u2013Dec)." },
    ]),

    // ── Quarterly lululemon Credits ($75/quarter × 4) ──
    ...expandCycles(CARD_ID, {
      name: "lululemon Credit", icon: "ShoppingBag", category: "shopping",
      type: "credit", creditAmount: 75, merchantPatterns: ["lululemon"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      notes: "Must enroll before first purchase.",
      details: lululemonDetails,
      lifestyleKey: "lululemon",
    }, [
      { id: "plat_lululemon_credit_q1", cycle: "quarterly_q1", name: "lululemon Credit (Q1)", description: "Up to $75 in statement credits at lululemon (Jan\u2013Mar)." },
      { id: "plat_lululemon_credit_q2", cycle: "quarterly_q2", name: "lululemon Credit (Q2)", description: "Up to $75 in statement credits at lululemon (Apr\u2013Jun)." },
      { id: "plat_lululemon_credit_q3", cycle: "quarterly_q3", name: "lululemon Credit (Q3)", description: "Up to $75 in statement credits at lululemon (Jul\u2013Sep)." },
      { id: "plat_lululemon_credit_q4", cycle: "quarterly_q4", name: "lululemon Credit (Q4)", description: "Up to $75 in statement credits at lululemon (Oct\u2013Dec)." },
    ]),

    // ── Semi-annual Hotel Credits ($300/half × 2) ──
    ...expandCycles(CARD_ID, {
      name: "Hotel Credit", icon: "Hotel", category: "travel",
      type: "credit", creditAmount: 300,
      merchantPatterns: ["fine hotels", "hotel collection", "amextravel", "amex travel"],
      autoMatchable: false, requiresActivation: false, priority: 15,
      notes: "Two-night minimum stay required. Book through AmexTravel.com.",
      details: hotelCreditDetails,
      lifestyleKey: "hotel_portal",
    }, [
      { id: "plat_hotel_credit_h1", cycle: "biannual_h1", name: "Hotel Credit (H1)", description: "Up to $300 in hotel credits via FHR/THC on AmexTravel.com (Jan\u2013Jun)." },
      { id: "plat_hotel_credit_h2", cycle: "biannual_h2", name: "Hotel Credit (H2)", description: "Up to $300 in hotel credits via FHR/THC on AmexTravel.com (Jul\u2013Dec)." },
    ]),

    // ── Semi-annual Saks Credits ($50/half × 2) ──
    ...expandCycles(CARD_ID, {
      name: "Saks Fifth Avenue Credit", icon: "ShoppingBag", category: "shopping",
      type: "credit", creditAmount: 50,
      merchantPatterns: ["saks fifth avenue", "saks", "saks.com"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      notes: "Must enroll before first purchase.",
      details: saksCreditDetails,
      lifestyleKey: "saks",
    }, [
      { id: "plat_saks_h1", cycle: "biannual_h1", name: "Saks Fifth Avenue Credit (H1)", description: "Up to $50 at Saks Fifth Avenue (Jan\u2013Jun)." },
      { id: "plat_saks_h2", cycle: "biannual_h2", name: "Saks Fifth Avenue Credit (H2)", description: "Up to $50 at Saks Fifth Avenue (Jul\u2013Dec)." },
    ]),

    // ── Monthly Benefits ──
    b({
      id: "plat_digital_entertainment",
      name: "Digital Entertainment Credit", icon: "Tv",
      category: "entertainment", type: "credit", creditAmount: 25, cycle: "monthly",
      merchantPatterns: [
        "disney+", "disneyplus", "hulu", "espn+", "espnplus",
        "new york times", "nytimes", "wall street journal", "wsj",
        "youtube premium", "youtube music", "youtube tv",
        "peacock", "paramount+", "paramount plus", "paramountplus",
      ],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "Up to $25/month for eligible digital entertainment subscriptions.",
      notes: "Must enroll before first purchase. Eligible services include Disney+, Disney+ Bundle, Hulu, ESPN+, NYT, WSJ, YouTube Premium, YouTube TV, Peacock, Paramount+.",
      details: digitalEntertainmentDetails,
      lifestyleKey: ["disney_plus", "youtube_premium", "peacock", "paramount_plus", "nyt", "wsj"],
    }),
    b({
      id: "plat_uber_cash",
      name: "Uber Cash", icon: "Car",
      category: "transport", type: "credit", creditAmount: 15, cycle: "monthly",
      merchantPatterns: ["uber"],
      autoMatchable: true, requiresActivation: false, priority: 20,
      description: "Up to $15/month in Uber Cash (Jan\u2013Nov).",
      notes: "Uber Cash auto-deposits monthly. Use for rides, Uber Eats, or grocery delivery.",
      details: uberCashDetails,
      brandSlug: "uber",
      activeMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      lifestyleKey: "uber",
    }),
    b({
      id: "plat_uber_cash_dec",
      name: "Uber Cash", icon: "Car",
      category: "transport", type: "credit", creditAmount: 35, cycle: "monthly",
      merchantPatterns: ["uber"],
      autoMatchable: true, requiresActivation: false, priority: 19,
      description: "Up to $35 in Uber Cash for December.",
      notes: "December bonus \u2014 higher Uber Cash allowance.",
      details: uberCashDetails,
      brandSlug: "uber",
      activeMonths: [11],
      lifestyleKey: "uber",
    }),
    b({
      id: "plat_walmart_plus",
      name: "Walmart+ Credit", icon: "ShoppingCart",
      category: "shopping", type: "credit", creditAmount: 12.95, cycle: "monthly",
      merchantPatterns: ["walmart+", "walmart plus", "walmart"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "Up to $12.95/month covering Walmart+ membership.",
      notes: "Must enroll before first purchase. Covers monthly Walmart+ subscription fee.",
      details: walmartPlusDetails,
      lifestyleKey: "walmart_plus",
    }),

    // ── Annual Calendar Benefits ──
    b({
      id: "plat_uber_one",
      name: "Uber One Membership", icon: "Car",
      category: "transport", type: "subscription", creditAmount: 120, cycle: "annual_calendar",
      merchantPatterns: ["uber"],
      autoMatchable: false, requiresActivation: true, priority: 25,
      description: "Complimentary Uber One membership (valued at ~$120/year).",
      notes: "Must link Amex and Uber accounts. Includes $0 delivery fees and discounts on rides.",
      details: uberOneDetails,
      brandSlug: "uber",
      lifestyleKey: "uber",
    }),
    b({
      id: "plat_airline_fee_credit",
      name: "Airline Fee Credit", icon: "Plane",
      category: "travel", type: "credit", creditAmount: 200, cycle: "annual_calendar",
      merchantPatterns: [],
      plaidCategories: ["TRAVEL_FLIGHTS"],
      autoMatchable: false, requiresActivation: true, priority: 30,
      isCategoryFallback: true,
      description: "Up to $200/year for incidental airline fees on your selected airline.",
      notes: "Must select one airline per calendar year. Covers bags, seat upgrades, in-flight purchases \u2014 NOT airfare.",
      details: airlineFeeCreditDetails,
      lifestyleKey: "airline_fee",
    }),
    b({
      id: "plat_equinox",
      name: "Equinox Credit", icon: "Dumbbell",
      category: "fitness", type: "credit", creditAmount: 300, cycle: "annual_calendar",
      merchantPatterns: ["equinox"],
      autoMatchable: true, requiresActivation: false, priority: 20,
      description: "Up to $300/year toward Equinox membership.",
      notes: "Applies to Equinox club dues or Equinox+ digital membership.",
      details: equinoxDetails,
      lifestyleKey: "equinox",
    }),
    b({
      id: "plat_clear",
      name: "CLEAR+ Credit", icon: "Shield",
      category: "travel", type: "credit", creditAmount: 209, cycle: "annual_calendar",
      merchantPatterns: ["clear", "clearme"],
      autoMatchable: true, requiresActivation: false, priority: 20,
      description: "Up to $209/year covering CLEAR Plus membership.",
      notes: "Covers the annual CLEAR Plus membership fee.",
      details: clearDetails,
      lifestyleKey: "clear_plus",
    }),
    b({
      id: "plat_oura",
      name: "Oura Ring Credit", icon: "Activity",
      category: "fitness", type: "credit", creditAmount: 200, cycle: "annual_calendar",
      merchantPatterns: ["oura"],
      autoMatchable: true, requiresActivation: false, priority: 20,
      description: "Up to $200/year toward Oura Ring or membership.",
      notes: "Covers Oura Ring purchase or ongoing membership fees.",
      details: ouraDetails,
      lifestyleKey: "oura",
    }),

    // ── Quadrennial ──
    b({
      id: "plat_global_entry",
      name: "Global Entry / TSA PreCheck", icon: "Shield",
      category: "travel", type: "credit", creditAmount: 120, cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa precheck", "tsa pre", "goes", "trusted traveler"],
      autoMatchable: true, requiresActivation: false, priority: 20,
      description: "Up to $120 every 4 years for Global Entry or TSA PreCheck.",
      notes: "Covers application fee only.",
      details: globalEntryDetails,
      lifestyleKey: "global_entry",
    }),
  ],
};
