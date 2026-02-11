import type { BenefitDetails, CardDefinition } from "@/lib/types";
import { defineBenefit, expandCycles, type BenefitInput } from "./helpers";

const CARD_ID = "chase_sapphire_reserve";
const b = (input: BenefitInput) => defineBenefit(CARD_ID, input);

// ── Benefit Details ──

const doordashDetails: BenefitDetails = {
  description:
    "Up to $25/month in DoorDash promos: one $5 promo on a restaurant order and two $10 promos on non-restaurant orders (grocery, convenience, retail). If the full promo value isn't used on a single order, the remaining value is forfeited for that promo. Requires DashPass membership (included separately with your Sapphire Reserve).",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Sapphire Reserve as the default payment method",
    "Each month, select the promo from your promotion wallet at checkout",
    "For non-restaurant promos: filter by \"Pickup\" \u2192 \"Grocery\" or \"Convenience\" for best value",
    "Make sure the \"Chase monthly benefit\" toggle is ON at checkout",
  ],
  links: [
    { label: "DoorDash App", url: "https://www.doordash.com" },
    { label: "Terms", url: "https://help.doordash.com/consumers/s/article/offer-terms-conditions?language=en_US" },
    { label: "Learn More", url: "https://www.doordash.com/dashpass/partner/chase/sapphire-reserve" },
  ],
};

const dashPassDetails: BenefitDetails = {
  description:
    "Complimentary DashPass membership ($0 delivery fees, reduced service fees on eligible orders) through DoorDash. DashPass normally costs $9.99/month \u2014 this benefit waives the fee entirely. Covers the primary cardmember only.",
  howToUse: [
    "Download or open the DoorDash app",
    "Add your Sapphire Reserve as the default payment method",
    "Follow the prompts to activate your complimentary DashPass membership",
    "Once activated, DashPass benefits apply automatically to eligible orders",
  ],
  links: [
    { label: "Activate DashPass", url: "https://www.doordash.com/dashpass/partner/chase/sapphire-reserve" },
    { label: "DoorDash App", url: "https://www.doordash.com" },
    { label: "Learn More", url: "https://www.doordash.com/dashpass/partner/chase/sapphire-reserve" },
  ],
};

const editHotelDetails: BenefitDetails = {
  description:
    "Up to $250 per credit ($500 annual total, delivered as two separate $250 statement credits) for prepaid hotel stays booked through The Edit by Chase Travel \u2014 Chase's curated luxury hotel collection of 1,100+ hand-picked properties. Two-night minimum stay required. Book through the Chase travel portal, pay with your Sapphire Reserve, and the credit posts as a statement credit afterward.",
  howToUse: [
    "Go to Chase Travel (chase.com/travel or the Chase app)",
    "Search for hotels and look for properties marked with \"The Edit\" badge",
    "Book a prepaid stay of at least 2 nights using your Sapphire Reserve",
    "The statement credit posts automatically after the charge",
  ],
  links: [
    { label: "Book via Chase Travel", url: "https://www.chase.com/travel" },
    { label: "The Edit Collection", url: "https://account.chase.com/sapphire/reserve/benefits" },
    { label: "Learn More", url: "https://account.chase.com/sapphire/reserve/benefits" },
  ],
};

const exclusiveTablesDetails: BenefitDetails = {
  description:
    "Up to $150 per half-year ($300 annual total) in statement credits when dining at restaurants participating in the Sapphire Reserve Exclusive Tables program. The credit is split into two semi-annual periods: up to $150 from January through June, and up to $150 from July through December. The program provides primetime reservations at 275+ curated restaurants in major U.S. cities through the Visa Dining Collection on OpenTable.",
  howToUse: [
    "Visit the OpenTable Chase Dining page and add your Sapphire Reserve card to your OpenTable account",
    "Browse participating restaurants by city",
    "Dine at any participating restaurant and pay with your Sapphire Reserve",
    "The statement credit posts automatically \u2014 you do NOT need to book through OpenTable to earn the credit, just pay with your CSR at a participating restaurant",
  ],
  links: [
    { label: "OpenTable Exclusive Tables", url: "https://www.opentable.com/c/chasedining/" },
    { label: "Learn More", url: "https://www.chase.com/personal/credit-cards/education/basics/guide-to-chase-sapphire-reserve-exclusive-tables" },
    { label: "How to Use", url: "https://www.chase.com/personal/credit-cards/education/basics/how-to-use-dining-credit-chase-sapphire-reserve-exclusive-tables" },
  ],
};

const stubhubDetails: BenefitDetails = {
  description:
    "Up to $150 per half-year ($300 annual total) in statement credits for concert, event, and sports tickets purchased on StubHub.com and viagogo.com. The credit is split into two semi-annual periods: up to $150 from January through June, and up to $150 from July through December. Purchases made before activation are NOT eligible.",
  howToUse: [
    "Log in to chase.com or the Chase Mobile app",
    "Go to Benefits (or Offers) and find the StubHub credit",
    "Click to activate the benefit",
    "Purchase tickets on StubHub.com or viagogo.com using your Sapphire Reserve",
    "Statement credit posts within 1\u20132 billing cycles",
  ],
  links: [
    { label: "StubHub", url: "https://www.stubhub.com" },
    { label: "viagogo", url: "https://www.viagogo.com" },
    { label: "Learn More", url: "https://www.chase.com/personal/credit-cards/education/rewards-benefits/how-to-use-the-$300-stubhub-credit-with-chase-sapphire-reserve" },
  ],
};

const appleTvDetails: BenefitDetails = {
  description:
    "Complimentary individual Apple TV+ subscription through June 22, 2027. This is a direct subscription waiver (not a statement credit) \u2014 once activated, Apple won't charge you. If you have an existing paid subscription, it will be automatically suspended. Does not cover Apple One bundles.",
  howToUse: [
    "Open the Chase Mobile app or log in to chase.com",
    "Go to Benefits & Travel \u2192 Card Benefits",
    "Find the Apple TV+ offer and tap \"Activate Now\" \u2014 this links your Apple ID",
    "You'll be redirected to Apple to connect your subscription",
    "On Apple devices, the benefit auto-links to the Apple ID signed in on your device",
  ],
  links: [
    { label: "Apple TV+", url: "https://tv.apple.com" },
    { label: "Learn More", url: "https://account.chase.com/sapphire/reserve/benefits" },
  ],
};

const appleMusicDetails: BenefitDetails = {
  description:
    "Complimentary individual Apple Music subscription through June 22, 2027. This is a direct subscription waiver (not a statement credit) \u2014 once activated, Apple won't charge you. If you have an existing paid subscription, it will be automatically suspended. Only covers the individual plan, not family or Apple One bundles.",
  howToUse: [
    "Open the Chase Mobile app or log in to chase.com",
    "Go to Benefits & Travel \u2192 Card Benefits",
    "Find the Apple Music offer and tap \"Activate Now\" \u2014 this links your Apple ID",
    "You'll be redirected to Apple to connect your subscription",
    "On Apple devices, the benefit auto-links to the Apple ID signed in on your device",
  ],
  links: [
    { label: "Apple Music", url: "https://music.apple.com" },
    { label: "Learn More", url: "https://account.chase.com/sapphire/reserve/benefits" },
  ],
};

// ── Card Definition ──

export const chaseSapphireReserve: CardDefinition = {
  id: CARD_ID,
  name: "Chase Sapphire Reserve\u00AE",
  issuer: "chase",
  network: "visa",
  annualFee: 795,
  feeDescriptor: "annual membership fee",
  imageUrl: null,
  isActive: true,
  benefits: [
    // ── Travel Credit ($300/anniversary year) ──
    b({
      id: "csr_travel",
      name: "Travel Credit", icon: "Plane",
      category: "travel", type: "credit", creditAmount: 300, cycle: "annual_anniversary",
      merchantPatterns: [
        "airline", "hotel", "airbnb", "vrbo", "expedia", "booking.com",
        "hotels.com", "marriott", "hilton", "hyatt", "ihg", "united",
        "delta", "american airlines", "southwest", "jetblue", "alaska air",
        "spirit", "frontier", "uber", "lyft", "amtrak", "enterprise",
        "hertz", "avis", "national car", "turo", "cruise", "carnival",
        "royal caribbean", "parking", "toll",
      ],
      plaidCategories: ["TRAVEL"],
      autoMatchable: true, requiresActivation: false, priority: 30,
      description: "Up to $300 in statement credits for travel purchases each cardmember anniversary year.",
      notes: "Accumulates until $300 is reached. Broad travel category including hotels, flights, car rentals, tolls, parking, transit.",
      details: {
        description:
          "Up to $300 in automatic statement credits each cardmember anniversary year as reimbursement for travel purchases charged to your card. This is the most flexible travel credit available \u2014 there's no need to book through Chase Travel.",
        howToUse: [
          "Use your Sapphire Reserve to pay for any purchase that codes as travel",
          "This includes flights, hotels, car rentals, taxis, rideshares, tolls, parking, campgrounds, cruises, and more",
          "The credit posts automatically \u2014 no activation or portal booking required",
        ],
        links: [
          { label: "Learn More", url: "https://account.chase.com/sapphire/reserve/benefits" },
          { label: "Chase Travel Portal", url: "https://www.chase.com/travel" },
        ],
      },
    }),

    // ── The Edit Hotel ($250 × 2 annual, per-transaction cap) ──
    ...expandCycles(CARD_ID, {
      name: "The Edit Hotel Credit", icon: "ConciergeBell",
      category: "travel", type: "credit", creditAmount: 250,
      merchantPatterns: ["the edit"],
      autoMatchable: false, requiresActivation: false, priority: 5,
      notes: "Must book through Chase Travel portal. Two $250 credits per calendar year, usable anytime.",
      details: editHotelDetails,
    }, [
      { id: "csr_edit_h1", cycle: "annual_calendar", description: "Up to $250 per booking in statement credits for The Edit hotel collection (credit 1 of 2)." },
      { id: "csr_edit_h2", cycle: "annual_calendar", description: "Up to $250 per booking in statement credits for The Edit hotel collection (credit 2 of 2)." },
    ]),

    // ── Select Hotels Credit ($250 one-time, 2026 only) ──
    b({
      id: "csr_select_hotel_credit_2026",
      name: "Select Hotels Credit (2026)", icon: "ConciergeBell",
      category: "travel", type: "credit", creditAmount: 250, cycle: "annual_calendar",
      merchantPatterns: ["ihg", "montage", "pendry", "omni hotel", "virgin hotel", "minor hotel", "pan pacific"],
      autoMatchable: false, requiresActivation: false, priority: 6,
      description: "Up to $250 in statement credits for prepaid hotel stays at select Chase Travel partner hotels (2026 only).",
      notes: "Eligible chains: IHG, Montage, Pendry, Omni, Virgin Hotels, Minor Hotels, Pan Pacific. 2-night minimum. Booked through Chase Travel only. One-time credit expires Dec 31, 2026.",
      sunsetDate: "2026-12-31",
      details: {
        description:
          "A one-time $250 statement credit for prepaid hotel stays at select partner hotels booked through Chase Travel. Available only in 2026. Eligible chains include IHG Hotels & Resorts, Montage Hotels & Resorts, Pendry Hotels & Resorts, Omni Hotels & Resorts, Virgin Hotels, Minor Hotels, and Pan Pacific Hotels and Resorts. Two-night minimum stay required.",
        howToUse: [
          "Go to Chase Travel (chase.com/travel or the Chase app)",
          "Search for hotels from eligible chains: IHG, Montage, Pendry, Omni, Virgin Hotels, Minor Hotels, or Pan Pacific",
          "Book a prepaid stay of at least 2 nights using your Sapphire Reserve",
          "The statement credit posts automatically after the charge",
        ],
        links: [
          { label: "Book via Chase Travel", url: "https://www.chase.com/travel" },
          { label: "Learn More", url: "https://account.chase.com/sapphire/reserve/benefits" },
        ],
      },
    }),

    // ── Exclusive Tables ($150 × 2 biannual) ──
    ...expandCycles(CARD_ID, {
      name: "Exclusive Tables Credit", icon: "UtensilsCrossed",
      category: "dining", type: "credit", creditAmount: 150,
      merchantPatterns: ["exclusive tables", "chase dining"],
      autoMatchable: false, requiresActivation: true, priority: 10,
      notes: "Must book through Chase Exclusive Tables program.",
      details: exclusiveTablesDetails,
    }, [
      { id: "csr_dining_h1", cycle: "biannual_h1", description: "Up to $150 in statement credits for Exclusive Tables dining experiences (Jan-Jun)." },
      { id: "csr_dining_h2", cycle: "biannual_h2", description: "Up to $150 in statement credits for Exclusive Tables dining experiences (Jul-Dec)." },
    ]),

    // ── StubHub ($150 × 2 biannual) ──
    ...expandCycles(CARD_ID, {
      name: "StubHub Credit", icon: "Ticket",
      category: "entertainment", type: "credit", creditAmount: 150,
      merchantPatterns: ["stubhub", "viagogo"],
      autoMatchable: true, requiresActivation: true, priority: 15,
      sunsetDate: "2027-12-31",
      details: stubhubDetails,
      brandSlug: "stubhub",
    }, [
      { id: "csr_stubhub_h1", cycle: "biannual_h1", description: "Up to $150 in statement credits for StubHub purchases (Jan-Jun).", notes: "Must activate benefit first. Purchases on stubhub.com or app." },
      { id: "csr_stubhub_h2", cycle: "biannual_h2", description: "Up to $150 in statement credits for StubHub purchases (Jul-Dec).", notes: "Must activate benefit first. Purchases on stubhub.com or app." },
    ]),

    // ── DoorDash (3 sub-credits, displayed as one $25/month group) ──
    b({
      id: "csr_doordash_restaurant",
      name: "DoorDash Restaurant Promo", icon: "Bike",
      category: "dining", type: "credit", creditAmount: 5, cycle: "monthly",
      merchantPatterns: ["doordash"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "$5/month restaurant credit on DoorDash. Use-it-or-lose-it.",
      notes: "Applied at checkout on restaurant orders. If full value is not used on a single order, remaining is forfeited.",
      sunsetDate: "2027-12-31",
      displayGroup: "csr_doordash", displayGroupName: "DoorDash Credits", displayGroupIcon: "Bike",
      details: doordashDetails,
      brandSlug: "doordash",
    }),
    b({
      id: "csr_doordash_nonrestaurant_1",
      name: "DoorDash Non-Restaurant Promo 1", icon: "Bike",
      category: "shopping", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["doordash"],
      autoMatchable: true, requiresActivation: true, priority: 21,
      description: "$10/month non-restaurant credit on DoorDash (grocery, convenience, retail).",
      notes: "Use-it-or-lose-it. Grocery, convenience, retail orders.",
      sunsetDate: "2027-12-31",
      displayGroup: "csr_doordash", displayGroupName: "DoorDash Credits", displayGroupIcon: "Bike",
      details: doordashDetails,
      brandSlug: "doordash",
    }),
    b({
      id: "csr_doordash_nonrestaurant_2",
      name: "DoorDash Non-Restaurant Promo 2", icon: "Bike",
      category: "shopping", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["doordash"],
      autoMatchable: true, requiresActivation: true, priority: 22,
      description: "Second $10/month non-restaurant credit on DoorDash.",
      notes: "Same rules as Non-Restaurant Promo 1.",
      sunsetDate: "2027-12-31",
      displayGroup: "csr_doordash", displayGroupName: "DoorDash Credits", displayGroupIcon: "Bike",
      details: doordashDetails,
      brandSlug: "doordash",
    }),

    // ── Lyft ($10/month) ──
    b({
      id: "csr_lyft",
      name: "Lyft Credit", icon: "Car",
      category: "transport", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["lyft"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "Up to $10/month in Lyft ride credits.",
      sunsetDate: "2027-09-30",
      details: {
        description:
          "Up to $10 in monthly in-app Lyft credits, plus 5x total points on all Lyft rides. The credit applies automatically to your first qualifying ride each month. Cannot be used on Wait & Save rides, or bike/scooter rentals.",
        howToUse: [
          "Download or open the Lyft app",
          "Add your Sapphire Reserve as the default payment method",
          "The $10 monthly credit applies automatically to your next qualifying ride",
          "You also earn 5x total points (4 bonus + 1 base) on all Lyft rides",
        ],
        links: [
          { label: "Lyft App", url: "https://www.lyft.com" },
          { label: "Learn More", url: "https://account.chase.com/sapphire/reserve/benefits" },
        ],
      },
      brandSlug: "lyft",
    }),

    // ── Peloton ($10/month) ──
    b({
      id: "csr_peloton",
      name: "Peloton Credit", icon: "Dumbbell",
      category: "fitness", type: "credit", creditAmount: 10, cycle: "monthly",
      merchantPatterns: ["peloton"],
      autoMatchable: true, requiresActivation: true, priority: 20,
      description: "Up to $10/month credit for Peloton membership or equipment.",
      notes: "Must activate benefit. Applies to Peloton App or All-Access.",
      sunsetDate: "2027-12-31",
      details: {
        description:
          "Up to $120 in annual statement credits toward Peloton memberships, including All-Access Membership, Rental, App One, App+, Guide, or Strength+. Also earn 10x total points on eligible Peloton equipment/accessory purchases over $150 (up to $5,000 total, through 12/31/2027).",
        howToUse: [
          "Log in to chase.com or the Chase Mobile app",
          "Go to Benefits & Travel \u2192 Benefits",
          "Find the Peloton offer and activate it",
          "Go to onepeloton.com and sign up for (or sign into) a Peloton membership",
          "Use your Sapphire Reserve as the payment method",
          "Statement credits post automatically each month (allow 6\u20138 weeks)",
        ],
        links: [
          { label: "Peloton \u00D7 Chase", url: "https://www.onepeloton.com/chase-sapphire-reserve" },
          { label: "Learn More", url: "https://www.chase.com/personal/credit-cards/education/rewards-benefits/how-to-earn-10x-points-on-peloton-with-chase-sapphire-reserve" },
        ],
      },
      brandSlug: "peloton",
    }),

    // ── Global Entry / TSA PreCheck ($120/4 years) ──
    b({
      id: "csr_global_entry",
      name: "Global Entry / TSA PreCheck", icon: "ShieldCheck",
      category: "travel", type: "credit", creditAmount: 120, cycle: "quadrennial",
      merchantPatterns: ["global entry", "tsa", "goes"],
      autoMatchable: true, requiresActivation: false, priority: 40,
      description: "Up to $120 credit for Global Entry or TSA PreCheck application fee every 4 years.",
      details: {
        description:
          "One statement credit of up to $120 every four years to reimburse the application fee for Global Entry ($120), TSA PreCheck ($78\u2013$98), or NEXUS ($50). Only one program per 4-year cycle. The credit covers the primary cardmember or an authorized user.",
        howToUse: [
          "Apply for Global Entry, TSA PreCheck, or NEXUS through the official government site",
          "Pay the application fee with your Sapphire Reserve card",
          "The statement credit posts automatically within 1\u20132 billing cycles",
          "No activation needed \u2014 just use your CSR for payment",
        ],
        links: [
          { label: "Global Entry Application", url: "https://ttp.cbp.dhs.gov/" },
          { label: "TSA PreCheck", url: "https://www.tsa.gov/precheck" },
          { label: "Learn More", url: "https://www.chase.com/personal/credit-cards/education/basics/sapphire-reserve-tsa-precheck-global-entry" },
        ],
      },
    }),

    // ── Apple TV+ (subscription) ──
    b({
      id: "csr_apple_tv",
      name: "Apple TV+", icon: "Tv",
      category: "entertainment", type: "subscription", creditAmount: 12.99, cycle: "subscription",
      merchantPatterns: ["apple.com/bill", "apple tv"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "Complimentary Apple TV+ subscription.",
      notes: "Must activate through Chase benefits portal.",
      sunsetDate: "2027-06-22",
      details: appleTvDetails,
      brandSlug: "apple",
    }),

    // ── Apple Music (subscription) ──
    b({
      id: "csr_apple_music",
      name: "Apple Music", icon: "Music",
      category: "entertainment", type: "subscription", creditAmount: 10.99, cycle: "subscription",
      merchantPatterns: ["apple.com/bill", "apple music"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "Complimentary Apple Music subscription (Individual plan).",
      notes: "Must activate through Chase benefits portal.",
      sunsetDate: "2027-06-22",
      details: appleMusicDetails,
      brandSlug: "apple",
    }),

    // ── DashPass (subscription) ──
    b({
      id: "csr_dashpass",
      name: "DashPass by DoorDash", icon: "Bike",
      category: "subscription", type: "subscription", creditAmount: 9.99, cycle: "subscription",
      merchantPatterns: ["doordash", "dashpass"],
      autoMatchable: true, requiresActivation: true, priority: 50,
      description: "Complimentary DashPass membership for free delivery on DoorDash.",
      notes: "Must activate through DoorDash.",
      sunsetDate: "2027-12-31",
      details: dashPassDetails,
      brandSlug: "doordash",
    }),
  ],
};
