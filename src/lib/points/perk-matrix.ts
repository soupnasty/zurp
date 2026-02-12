export interface PerkCellValue {
  value: string | null;
  isBest?: boolean;
  detail?: string;
  footnote?: boolean;
}

export interface PerkRow {
  label: string;
  tracked: boolean;
  isTotalRow?: boolean;
  cards: Record<string, PerkCellValue>;
}

export interface PerkSection {
  sectionId: string;
  label: string;
  tracked: boolean;
  rows: PerkRow[];
}

export const PERK_SECTIONS: PerkSection[] = [
  {
    sectionId: "benefits",
    label: "Benefits",
    tracked: true,
    rows: [
      {
        label: "Travel benefit",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "$300", detail: "per anniversary year" },
          amex_platinum: { value: "$200", detail: "airline fee credit per calendar year" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: "$50", detail: "hotel credit per anniversary year" },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: "$300", detail: "Capital One Travel portal, per anniversary year" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Dining benefit",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "$300", detail: "Exclusive Tables, semi-annual" },
          amex_platinum: { value: "$400", detail: "Resy ($100/quarter)", isBest: true },
          amex_gold: { value: "$220", detail: "$10/mo at select merchants + $50/semi Resy", footnote: true },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "DoorDash",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "$300", detail: "$5 restaurant + 2x$10 non-restaurant/mo" },
          amex_platinum: { value: null },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: "$120", detail: "$10/mo non-restaurant" },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Rideshare",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "$120", detail: "Lyft Pink" },
          amex_platinum: { value: "$320", detail: "$200/yr Uber Cash + $120 Uber One", isBest: true },
          amex_gold: { value: "$120", detail: "Uber Cash ($10/mo)", footnote: true },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Events",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "$300", detail: "StubHub credit" },
          amex_platinum: { value: null },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Streaming",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "~$250", detail: "Apple Music/TV+" },
          amex_platinum: { value: "$300", detail: "Digital entertainment ($25/mo)", isBest: true },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Fitness",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "$120", detail: "Peloton credit" },
          amex_platinum: { value: "$300", detail: "Equinox credit", isBest: true },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Hotel",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "$750", detail: "Edit + Select hotels" },
          amex_platinum: { value: "$600", detail: "FHR/THC ($300/half)" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: "$100", detail: "Citi hotel collection credit" },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: "$400", detail: "Bilt Travel portal ($200/half)" },
        },
      },
      {
        label: "Shopping",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: "$400", detail: "lululemon ($75/qtr) + Saks ($50/half)", isBest: true },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Coffee",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: null },
          amex_gold: { value: "$84", detail: "Dunkin' ($7/mo)" },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Total tracked benefits",
        tracked: true,
        isTotalRow: true,
        cards: {
          chase_sapphire_reserve: { value: "$2,060" },
          amex_platinum: { value: "$2,850", isBest: true },
          amex_gold: { value: "$424" },
          chase_sapphire_preferred: { value: "$290" },
          citi_strata_elite: { value: "$100" },
          capital_one_venture_x: { value: "$400", detail: "$300 travel + $100 anniversary miles" },
          robinhood_gold: { value: "$0", detail: "Value is in 3x earning rate" },
          bilt_palladium: { value: "$600", detail: "$400 hotel + $200 Bilt Cash annual" },
        },
      },
    ],
  },
  {
    sectionId: "points",
    label: "Points Earning",
    tracked: true,
    rows: [
      {
        label: "Dining",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "3x" },
          amex_platinum: { value: "1x" },
          amex_gold: { value: "4x", isBest: true },
          chase_sapphire_preferred: { value: "3x" },
          citi_strata_elite: { value: "3x", detail: "6x Fri/Sat nights" },
          capital_one_venture_x: { value: "2x" },
          robinhood_gold: { value: "3x" },
          bilt_palladium: { value: "2x" },
        },
      },
      {
        label: "Groceries",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "1x" },
          amex_platinum: { value: "1x" },
          amex_gold: { value: "4x", isBest: true, detail: "cap $25K/yr" },
          chase_sapphire_preferred: { value: "1x" },
          citi_strata_elite: { value: "1.5x" },
          capital_one_venture_x: { value: "2x" },
          robinhood_gold: { value: "3x" },
          bilt_palladium: { value: "2x" },
        },
      },
      {
        label: "Travel (direct)",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "4x" },
          amex_platinum: { value: "5x", isBest: true, detail: "flights only" },
          amex_gold: { value: "3x", detail: "flights only" },
          chase_sapphire_preferred: { value: "2x" },
          citi_strata_elite: { value: "1.5x" },
          capital_one_venture_x: { value: "2x" },
          robinhood_gold: { value: "3x" },
          bilt_palladium: { value: "2x" },
        },
      },
      {
        label: "Travel (portal)",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "8x" },
          amex_platinum: { value: "5x", detail: "hotels via AmexTravel" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: "5x" },
          citi_strata_elite: { value: "12x", isBest: true, detail: "hotels; 6x flights" },
          capital_one_venture_x: { value: "10x", detail: "hotels; 5x flights" },
          robinhood_gold: { value: "5x", detail: "cap $3,500/yr" },
          bilt_palladium: { value: "2x" },
        },
      },
      {
        label: "Streaming",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "1x" },
          amex_platinum: { value: "1x" },
          amex_gold: { value: "1x" },
          chase_sapphire_preferred: { value: "3x", isBest: true },
          citi_strata_elite: { value: "1.5x" },
          capital_one_venture_x: { value: "2x" },
          robinhood_gold: { value: "3x", isBest: true },
          bilt_palladium: { value: "2x" },
        },
      },
      {
        label: "Rideshare (Lyft)",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "5x", isBest: true },
          amex_platinum: { value: "1x" },
          amex_gold: { value: "1x" },
          chase_sapphire_preferred: { value: "5x", isBest: true },
          citi_strata_elite: { value: "1.5x" },
          capital_one_venture_x: { value: "2x" },
          robinhood_gold: { value: "3x" },
          bilt_palladium: { value: "2x" },
        },
      },
      {
        label: "Base rate",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "1x" },
          amex_platinum: { value: "1x" },
          amex_gold: { value: "1x" },
          chase_sapphire_preferred: { value: "1x" },
          citi_strata_elite: { value: "1.5x" },
          capital_one_venture_x: { value: "2x" },
          robinhood_gold: { value: "3x", isBest: true },
          bilt_palladium: { value: "2x" },
        },
      },
      {
        label: "Point value",
        tracked: true,
        cards: {
          chase_sapphire_reserve: { value: "1.25\u00A2", isBest: true },
          amex_platinum: { value: "1.0\u00A2" },
          amex_gold: { value: "1.0\u00A2" },
          chase_sapphire_preferred: { value: "1.25\u00A2", isBest: true },
          citi_strata_elite: { value: "1.0\u00A2", detail: "up to 1.9\u00A2 via partners" },
          capital_one_venture_x: { value: "1.0\u00A2", detail: "up to 1.85\u00A2 via partners" },
          robinhood_gold: { value: "0.7\u00A2", detail: "up to 1.0\u00A2 to brokerage" },
          bilt_palladium: { value: "1.5\u00A2", detail: "up to 2.2\u00A2 via partners" },
        },
      },
    ],
  },
  {
    sectionId: "travel_perks",
    label: "Travel Perks",
    tracked: false,
    rows: [
      {
        label: "Airport lounge",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Priority Pass + Sapphire Lounge" },
          amex_platinum: { value: "Centurion + Priority Pass + Delta Sky Club", detail: "1,550+ lounges" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: "Priority Pass + Centurion (via AA)" },
          capital_one_venture_x: { value: "Capital One Lounges + Priority Pass" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: "Priority Pass", detail: "2 guest passes/yr" },
        },
      },
      {
        label: "Hotel status",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "IHG Platinum Elite" },
          amex_platinum: { value: "Hilton Gold + Marriott Gold" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Global Entry/TSA",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "$30/yr" },
          amex_platinum: { value: "$120/4yr" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: "$120/4yr" },
          capital_one_venture_x: { value: "$120/4yr" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "DashPass",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Included" },
          amex_platinum: { value: null },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: "Included" },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Uber One",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: "Included" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Walmart+",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: "Included" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "CLEAR+",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: "$209/yr credit" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Travel concierge",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Reserve Designer" },
          amex_platinum: { value: "Platinum Concierge" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: "Citi Concierge" },
          capital_one_venture_x: { value: "Visa Infinite Concierge" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Amex Travel access",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: "Yes", detail: "FHR + THC" },
          amex_gold: { value: "Yes" },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Rental car status",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: null },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: "Hertz President's Circle" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
    ],
  },
  {
    sectionId: "protections",
    label: "Protections & Insurance",
    tracked: false,
    rows: [
      {
        label: "Auto rental CDW",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Primary" },
          amex_platinum: { value: "Secondary" },
          amex_gold: { value: "Secondary" },
          chase_sapphire_preferred: { value: "Primary" },
          citi_strata_elite: { value: "Primary" },
          capital_one_venture_x: { value: "Primary" },
          robinhood_gold: { value: "Primary" },
          bilt_palladium: { value: "Primary" },
        },
      },
      {
        label: "Trip cancellation",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Yes" },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: "Yes" },
          citi_strata_elite: { value: "Yes" },
          capital_one_venture_x: { value: "Yes" },
          robinhood_gold: { value: "Yes", detail: "$2K/person" },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Trip delay reimburse",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Yes" },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: "Yes" },
          citi_strata_elite: { value: "Yes" },
          capital_one_venture_x: { value: "Yes" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: "Yes", detail: "$300/trip" },
        },
      },
      {
        label: "Lost luggage reimburse",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Yes" },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: "Yes" },
          citi_strata_elite: { value: "Yes" },
          capital_one_venture_x: { value: "Yes" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Cell phone protection",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Yes" },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: null },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: "Yes", detail: "$800/claim, 2 claims/yr" },
          robinhood_gold: { value: "Yes", detail: "$600/claim" },
          bilt_palladium: { value: "Yes", detail: "$800/claim, 2 claims/yr" },
        },
      },
      {
        label: "Purchase protection",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Yes" },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: "Yes" },
          chase_sapphire_preferred: { value: "Yes" },
          citi_strata_elite: { value: "Yes" },
          capital_one_venture_x: { value: "Yes" },
          robinhood_gold: { value: "Yes" },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Extended warranty",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Yes" },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: "Yes" },
          chase_sapphire_preferred: { value: "Yes" },
          citi_strata_elite: { value: "Yes" },
          capital_one_venture_x: { value: "Yes" },
          robinhood_gold: { value: "Yes" },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Return protection",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: null },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: "Yes" },
          chase_sapphire_preferred: { value: null },
          citi_strata_elite: { value: null },
          capital_one_venture_x: { value: "Yes" },
          robinhood_gold: { value: "Yes" },
          bilt_palladium: { value: null },
        },
      },
      {
        label: "Roadside assistance",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Yes" },
          amex_platinum: { value: "Yes" },
          amex_gold: { value: "Yes" },
          chase_sapphire_preferred: { value: "Yes" },
          citi_strata_elite: { value: "Yes" },
          capital_one_venture_x: { value: null },
          robinhood_gold: { value: null },
          bilt_palladium: { value: null },
        },
      },
    ],
  },
  {
    sectionId: "transfer_partners",
    label: "Transfer Partners",
    tracked: false,
    rows: [
      {
        label: "Hotel partners",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "Hyatt, IHG, Marriott" },
          amex_platinum: { value: "Hilton, Marriott, Choice" },
          amex_gold: { value: "Hilton, Choice" },
          chase_sapphire_preferred: { value: "Hyatt, IHG, Marriott" },
          citi_strata_elite: { value: "Choice (1:2), Wyndham" },
          capital_one_venture_x: { value: "Accor, Choice, Wyndham, I Prefer" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: "Hyatt, Marriott, Hilton, IHG, Accor" },
        },
      },
      {
        label: "Airline partners",
        tracked: false,
        cards: {
          chase_sapphire_reserve: { value: "United, SW, BA, Air France" },
          amex_platinum: { value: "Delta, JetBlue, ANA, Singapore, Virgin Atlantic" },
          amex_gold: { value: "Delta, JetBlue, ANA, Singapore" },
          chase_sapphire_preferred: { value: "United, SW, BA, Air France" },
          citi_strata_elite: { value: "AA, JetBlue, Singapore, Turkish, Qatar" },
          capital_one_venture_x: { value: "Avianca, Aeroplan, BA, Air France, Turkish", detail: "18 airline partners" },
          robinhood_gold: { value: null },
          bilt_palladium: { value: "United, AA, Aeroplan, Emirates, Singapore, JAL", detail: "12+ airline partners" },
        },
      },
    ],
  },
];

export interface CardReferenceLink {
  label: string;
  url: string;
}

export interface CardReferenceLinks {
  cardId: string;
  cardName: string;
  links: CardReferenceLink[];
}

export const CARD_REFERENCE_LINKS: CardReferenceLinks[] = [
  {
    cardId: "chase_sapphire_reserve",
    cardName: "Chase Sapphire Reserve",
    links: [
      { label: "Card benefits overview", url: "https://www.chase.com/personal/credit-cards/sapphire/reserve" },
      { label: "Rewards & earn rates", url: "https://www.chase.com/personal/credit-cards/sapphire/reserve/earn-rewards" },
      { label: "Transfer partners", url: "https://ultimaterewardspoints.chase.com/transfer-partners" },
      { label: "Insurance & protections", url: "https://www.chase.com/personal/credit-cards/sapphire/reserve/card-benefits" },
    ],
  },
  {
    cardId: "amex_platinum",
    cardName: "Amex Platinum",
    links: [
      { label: "Card benefits overview", url: "https://www.americanexpress.com/us/credit-cards/card/platinum/" },
      { label: "Rewards & earn rates", url: "https://www.americanexpress.com/us/credit-cards/card/platinum/rewards" },
      { label: "Transfer partners", url: "https://global.americanexpress.com/rewards/transfer" },
      { label: "Insurance & protections", url: "https://www.americanexpress.com/us/credit-cards/card/platinum/benefits" },
    ],
  },
  {
    cardId: "amex_gold",
    cardName: "Amex Gold",
    links: [
      { label: "Card benefits overview", url: "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card" },
      { label: "Rewards & earn rates", url: "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card/rewards" },
      { label: "Transfer partners", url: "https://global.americanexpress.com/rewards/transfer" },
      { label: "Insurance & protections", url: "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card/benefits" },
    ],
  },
  {
    cardId: "chase_sapphire_preferred",
    cardName: "Chase Sapphire Preferred",
    links: [
      { label: "Card benefits overview", url: "https://www.chase.com/personal/credit-cards/sapphire/preferred" },
      { label: "Rewards & earn rates", url: "https://www.chase.com/personal/credit-cards/sapphire/preferred/earn-rewards" },
      { label: "Transfer partners", url: "https://ultimaterewardspoints.chase.com/transfer-partners" },
      { label: "Insurance & protections", url: "https://www.chase.com/personal/credit-cards/sapphire/preferred/card-benefits" },
    ],
  },
  {
    cardId: "citi_strata_elite",
    cardName: "Citi Strata Elite",
    links: [
      { label: "Card benefits overview", url: "https://www.citi.com/credit-cards/citi-strata-premier-credit-card" },
      { label: "Transfer partners", url: "https://www.thankyou.com/cms/thankyou/program/transfer.page" },
    ],
  },
  {
    cardId: "capital_one_venture_x",
    cardName: "Capital One Venture X",
    links: [
      { label: "Card overview", url: "https://www.capitalone.com/credit-cards/venture-x/" },
      { label: "Rewards & benefits", url: "https://www.capitalone.com/credit-cards/venture-x/#benefits" },
    ],
  },
  {
    cardId: "robinhood_gold",
    cardName: "Robinhood Gold Card",
    links: [
      { label: "Card overview", url: "https://robinhood.com/creditcard/" },
    ],
  },
  {
    cardId: "bilt_palladium",
    cardName: "Bilt Palladium Card",
    links: [
      { label: "Card overview", url: "https://www.bilt.com/palladium" },
      { label: "Bilt Rewards", url: "https://www.bilt.com" },
      { label: "Bilt Travel", url: "https://www.bilt.com/travel" },
    ],
  },
];
