# Merchant Data Generation Strategy

## The Problem

The generator needs to produce transaction data that exercises the full normalization → matching pipeline. The critical insight is that **Plaid gives two fields** and your code uses them differently:

```
Plaid API:
  merchant_name  →  "Uber"                       (enriched, often clean — can be null)
  name           →  "UBER *TRIP HELP.UBER.COM"   (lightly cleaned, always present)

zurp stores:
  merchantName    = merchant_name || name         (prefers enriched)
  merchantNameRaw = name                          (always the "raw" version)

Matcher input:
  normalizeMerchantName(merchantName || merchantNameRaw)
  → strips POS prefixes, order numbers, trailing IDs, lowercases
```

Most real transactions have a clean `merchant_name` from Plaid (e.g., `"Uber Eats"`), so the normalizer receives already-clean input and matching is straightforward. But the valuable test cases are:

1. **`merchant_name` is null** — engine falls back to `name`, which has POS prefixes, order numbers, and location suffixes
2. **`merchant_name` is wrong/generic** — Plaid enrichment fails and returns something like `"Payment"` or `"Online Purchase"`
3. **`merchant_name` is close but not exact** — e.g., `"Uber"` when the charge is actually Uber Eats (your merchant map handles this via priority-based prefix matching)

## Solution: A Merchant Template Registry

Instead of asking the LLM to invent merchant names (which leads to inconsistent, unrealistic strings), build a **deterministic registry** of real-world merchant appearances. The LLM's job becomes *selecting* from the registry and *composing* transaction sets, not *inventing* merchant strings.

### Registry Structure

```typescript
// test/generators/merchant-registry.ts

interface MerchantTemplate {
  /** Canonical merchant identifier */
  merchantKey: string;                    // "uber_eats", "doordash", "whole_foods"

  /** What Plaid's enrichment returns as merchant_name */
  plaidMerchantName: string | null;       // "Uber Eats" (or null for fallback testing)

  /** Variants of Plaid's `name` field (the lightly cleaned bank string) */
  nameVariants: string[];                 // ["UBER *EATS", "UBEREATS PENDING", "UBER EATS ORDER"]

  /** What normalizeMerchantName() produces from each variant */
  normalizedResult: string;               // "uber eats" (verify this matches your normalizer)

  /** Expected category from the points engine merchant map */
  expectedEarnCategory: string;           // "food_delivery"

  /** Plaid personal_finance_category fields */
  plaidCategoryPrimary: string;           // "FOOD_AND_DRINK"
  plaidCategoryDetailed: string;          // "FOOD_AND_DRINK_RESTAURANTS"

  /** Which benefit merchantPatterns this matches */
  matchesBenefitPatterns: string[];       // ["uber", "uber eats"]

  /** Typical transaction amount range */
  amountRange: { min: number; max: number };  // { min: 8, max: 65 }

  /** For testing — does this merchant have known normalization edge cases? */
  edgeCases?: NormalizationEdgeCase[];
}

interface NormalizationEdgeCase {
  /** The raw name variant that's tricky */
  rawName: string;
  /** What normalizeMerchantName produces */
  normalizedOutput: string;
  /** Why this is an edge case */
  description: string;
}
```

### Example: Uber Ecosystem

Uber is the single trickiest merchant in your system because the same company produces charges that should match different benefits (`rideshare` for rides, `food_delivery` for Eats) and different earn categories. Here's what real Plaid data looks like:

```typescript
const UBER_TEMPLATES: MerchantTemplate[] = [
  // ── Uber Rides (rideshare) ──
  {
    merchantKey: "uber_ride",
    plaidMerchantName: "Uber",
    nameVariants: [
      "UBER *TRIP",                       // Most common ride format
      "UBER *TRIP HELP.UBER.COM",         // With help URL suffix
      "UBER BV TRIP HELP.UBER.COM",       // International variant (Dutch entity)
      "UBER *RIDE",                       // Alternate ride label
      "UBER TRIP",                        // No asterisk variant
    ],
    normalizedResult: "uber",             // After normalization — note this!
    expectedEarnCategory: "rideshare",    // merchant-map prefix match "uber" → rideshare (priority 10)
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_TAXIS_AND_RIDE_SHARES",
    matchesBenefitPatterns: ["uber"],     // Matches Amex Plat uber_cash benefit
    amountRange: { min: 8, max: 85 },
    edgeCases: [
      {
        rawName: "UBER BV TRIP HELP.UBER.COM",
        normalizedOutput: "uber bv trip help.uber.com",
        description: "International entity name — still matches 'uber' prefix via substring"
      }
    ]
  },

  // ── Uber Eats (food_delivery) ──
  {
    merchantKey: "uber_eats",
    plaidMerchantName: "Uber Eats",
    nameVariants: [
      "UBER *EATS",                       // Standard Uber Eats
      "UBER* EATS PENDING",               // Pending state label
      "UBEREATS *ORDER",                  // No space variant
      "UBER EATS HELP.UBER.COM",         // With help URL
      "UBER *EATS ORDER",                // With ORDER suffix
    ],
    normalizedResult: "uber eats",        // Critical: must normalize to "uber eats" not "uber"
    expectedEarnCategory: "food_delivery", // merchant-map prefix "uber eats" → food_delivery (priority 20)
    plaidCategoryPrimary: "FOOD_AND_DRINK",
    plaidCategoryDetailed: "FOOD_AND_DRINK_RESTAURANTS",
    matchesBenefitPatterns: ["uber"],     // Also matches Amex Plat uber_cash
    amountRange: { min: 12, max: 65 },
    edgeCases: [
      {
        rawName: "UBER *EATS",
        normalizedOutput: "uber eats",
        description: "Asterisk cleaning: 'UBER *EATS' → 'uber eats'. The space around * becomes a single space. Correctly matches 'uber eats' prefix (priority 20) over bare 'uber' (priority 10)."
      },
      {
        rawName: "UBEREATS *ORDER",
        normalizedOutput: "ubereats order",
        description: "No-space variant normalizes to 'ubereats order'. This matches 'ubereats' prefix in merchant-map (priority 20). If your merchant-map only has 'uber eats' (with space), this variant would fall through to bare 'uber' (rideshare). Verify the merchant-map has 'ubereats' entry."
      },
    ]
  },

  // ── Uber One membership (subscription) ──
  {
    merchantKey: "uber_one",
    plaidMerchantName: "Uber",
    nameVariants: [
      "UBER *UBER ONE",                   // Subscription charge
      "UBER *MONTHLY",                    // Generic monthly
    ],
    normalizedResult: "uber uber one",
    expectedEarnCategory: "rideshare",    // Falls to generic "uber" prefix
    plaidCategoryPrimary: "TRANSPORTATION",
    plaidCategoryDetailed: "TRANSPORTATION_TAXIS_AND_RIDE_SHARES",
    matchesBenefitPatterns: ["uber"],
    amountRange: { min: 9.99, max: 9.99 },
  },
];
```

### The Critical Disambiguation: Uber Eats vs Uber Rides

This is the most important edge case in the whole system. Your merchant map has:

```
{ pattern: "uber eats",  priority: 20, category: "food_delivery" }  // Higher priority
{ pattern: "ubereats",   priority: 20, category: "food_delivery" }
{ pattern: "uber trip",  priority: 20, category: "rideshare" }
{ pattern: "uber bv",    priority: 15, category: "rideshare" }
{ pattern: "uber",       priority: 10, category: "rideshare" }      // Fallback
```

When `merchant_name` is `"Uber Eats"` → normalizes to `"uber eats"` → matches `"uber eats"` prefix at priority 20 → `food_delivery`. Correct.

When `merchant_name` is `null` and `name` is `"UBER *EATS"` → normalizes to `"uber eats"` → same result. Correct.

But when `name` is `"UBEREATS *ORDER"` → normalizes to `"ubereats order"` → matches `"ubereats"` prefix. Correct only if that entry exists in the merchant map.

The generator should produce all three cases for every Uber transaction set.

### Full Registry (Organized by Benefit Pattern)

The registry is organized around the benefit `merchantPatterns` from the card definitions, since that's what we're ultimately testing:

```typescript
// test/generators/merchant-registry.ts

export const MERCHANT_REGISTRY: Record<string, MerchantTemplate[]> = {

  // ══════════════════════════════════════════════════
  // Benefit pattern: "doordash"
  // Cards: CSR, CFF, CFU (DoorDash sub-credits)
  // ══════════════════════════════════════════════════
  doordash: [
    {
      merchantKey: "doordash_order",
      plaidMerchantName: "DoorDash",
      nameVariants: [
        "DOORDASH*SWEETGREEN",
        "DOORDASH*CHIPOTLE ORDER",
        "DOORDASH DASHPASS",
        "DD *DOORDASH THAI BASIL",
        "DOORDASH*ORDER #4582",
        "DOORDASH INC",
      ],
      normalizedResult: "doordash",
      expectedEarnCategory: "food_delivery",
      plaidCategoryPrimary: "FOOD_AND_DRINK",
      plaidCategoryDetailed: "FOOD_AND_DRINK_RESTAURANTS",
      matchesBenefitPatterns: ["doordash"],
      amountRange: { min: 8, max: 55 },
    },
  ],

  // ══════════════════════════════════════════════════
  // Benefit pattern: "resy"
  // Cards: Amex Platinum (quarterly Resy credit)
  // ══════════════════════════════════════════════════
  resy: [
    {
      merchantKey: "resy_restaurant",
      plaidMerchantName: null,          // Resy often doesn't have enriched merchant_name!
      nameVariants: [
        "RESY - THE GRILL NYC",
        "RESY*ATOMIX",
        "RESY*RESERVATION",
        "RESY INC",
        "RESY - ELEVEN MADISON PARK",
      ],
      normalizedResult: "resy",
      expectedEarnCategory: "dining",
      plaidCategoryPrimary: "FOOD_AND_DRINK",
      plaidCategoryDetailed: "FOOD_AND_DRINK_RESTAURANTS",
      matchesBenefitPatterns: ["resy"],
      amountRange: { min: 50, max: 400 },
      edgeCases: [
        {
          rawName: "RESY - THE GRILL NYC",
          normalizedOutput: "resy - the grill nyc",
          description: "Restaurant name after dash — 'resy' still matches via substring"
        },
      ],
    },
  ],

  // ══════════════════════════════════════════════════
  // Benefit pattern: "lululemon"
  // Cards: Amex Platinum (quarterly lululemon credit)
  // ══════════════════════════════════════════════════
  lululemon: [
    {
      merchantKey: "lululemon_store",
      plaidMerchantName: "lululemon",
      nameVariants: [
        "LULULEMON #04521",
        "LULULEMON ATHLETICA",
        "LULULEMON.COM",
        "LULULEMON ONLINE",
      ],
      normalizedResult: "lululemon",
      expectedEarnCategory: "shopping_instore",
      plaidCategoryPrimary: "SHOPS",
      plaidCategoryDetailed: "SHOPS_CLOTHING_AND_ACCESSORIES",
      matchesBenefitPatterns: ["lululemon"],
      amountRange: { min: 28, max: 198 },
    },
  ],

  // ══════════════════════════════════════════════════
  // Benefit pattern: "saks", "saks fifth avenue"
  // Cards: Amex Platinum (semi-annual Saks credit)
  // ══════════════════════════════════════════════════
  saks: [
    {
      merchantKey: "saks_store",
      plaidMerchantName: "Saks Fifth Avenue",
      nameVariants: [
        "SAKS FIFTH AVENUE #611",
        "SAKS FIFTH AVE NYC",
        "SAKS.COM",
        "SAKS DIRECT",
        "SAKSFIFTHAVE.COM",
      ],
      normalizedResult: "saks fifth avenue",
      expectedEarnCategory: "shopping_instore",
      plaidCategoryPrimary: "SHOPS",
      plaidCategoryDetailed: "SHOPS_CLOTHING_AND_ACCESSORIES",
      matchesBenefitPatterns: ["saks fifth avenue", "saks", "saks.com"],
      amountRange: { min: 25, max: 120 },
      edgeCases: [
        {
          rawName: "SAKSFIFTHAVE.COM",
          normalizedOutput: "saksfifthave.com",
          description: "Online variant without spaces — does NOT contain 'saks fifth avenue' substring. But DOES contain 'saks'. Matches only if 'saks' is in merchantPatterns."
        },
      ],
    },
  ],

  // ══════════════════════════════════════════════════
  // Benefit patterns: streaming services
  // "disney+", "hulu", "espn+", "nytimes", "youtube premium", etc.
  // Cards: Amex Platinum (digital entertainment credit)
  // ══════════════════════════════════════════════════
  streaming: [
    {
      merchantKey: "hulu",
      plaidMerchantName: "Hulu",
      nameVariants: ["HULU 73281954", "HULU, LLC", "HULU *SUBSCRIPTION"],
      normalizedResult: "hulu",
      expectedEarnCategory: "streaming",
      plaidCategoryPrimary: "ENTERTAINMENT",
      plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
      matchesBenefitPatterns: ["hulu"],
      amountRange: { min: 7.99, max: 17.99 },
    },
    {
      merchantKey: "disney_plus",
      plaidMerchantName: "Disney Plus",
      nameVariants: ["DISNEYPLUS*", "DISNEY PLUS", "WALT DISNEY*DISNEYPLUS"],
      normalizedResult: "disney plus",
      expectedEarnCategory: "streaming",
      plaidCategoryPrimary: "ENTERTAINMENT",
      plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
      matchesBenefitPatterns: ["disney+", "disneyplus"],
      amountRange: { min: 7.99, max: 13.99 },
      edgeCases: [
        {
          rawName: "DISNEYPLUS*",
          normalizedOutput: "disneyplus",
          description: "No space variant — matches 'disneyplus' pattern. But 'disney+' pattern would NOT match 'disneyplus' via substring. Verify both patterns are in the benefit definition."
        },
      ],
    },
    {
      merchantKey: "nytimes",
      plaidMerchantName: "The New York Times",
      nameVariants: [
        "NYT*NYTIMES DIGITAL",
        "NYTIMES.COM",
        "NEW YORK TIMES DIGITAL",
        "NYT*NYTIMES.COM",
      ],
      normalizedResult: "nytimes",       // varies by variant!
      expectedEarnCategory: "streaming",
      plaidCategoryPrimary: "ENTERTAINMENT",
      plaidCategoryDetailed: "ENTERTAINMENT_TV_AND_MOVIES",
      matchesBenefitPatterns: ["new york times", "nytimes"],
      amountRange: { min: 4.25, max: 17.00 },
      edgeCases: [
        {
          rawName: "NYT*NYTIMES DIGITAL",
          normalizedOutput: "nyt nytimes digital",
          description: "NYT prefix is NOT in the POS prefix strip list (SQ, TST, PP, etc). 'nyt nytimes digital' does contain 'nytimes' substring → matches."
        },
        {
          rawName: "NEW YORK TIMES DIGITAL",
          normalizedOutput: "new york times digital",
          description: "Full name variant matches 'new york times' pattern."
        },
      ],
    },
    {
      merchantKey: "youtube_premium",
      plaidMerchantName: "YouTube",
      nameVariants: [
        "YOUTUBE PREMIUM",
        "GOOGLE *YOUTUBE PREMIUM",
        "YOUTUBE MUSIC",
      ],
      normalizedResult: "youtube premium",
      expectedEarnCategory: "streaming",
      plaidCategoryPrimary: "ENTERTAINMENT",
      plaidCategoryDetailed: "ENTERTAINMENT_MUSIC",
      matchesBenefitPatterns: ["youtube premium", "youtube music"],
      amountRange: { min: 10.99, max: 13.99 },
      edgeCases: [
        {
          rawName: "GOOGLE *YOUTUBE PREMIUM",
          normalizedOutput: "google youtube premium",
          description: "GOOGLE prefix is NOT stripped by normalizer. 'google youtube premium' contains 'youtube premium' → matches. But if Plaid enriches merchant_name to just 'YouTube' (without Premium), the benefit match relies on the name field containing 'premium'."
        },
      ],
    },
  ],

  // ══════════════════════════════════════════════════
  // Benefit pattern: "walmart", "walmart+"
  // Cards: Amex Platinum (Walmart+ credit)
  // ══════════════════════════════════════════════════
  walmart: [
    {
      merchantKey: "walmart_plus",
      plaidMerchantName: "Walmart",
      nameVariants: [
        "WALMART+ MEMBERSHIP",
        "WAL-MART *PLUS",
        "WALMART.COM W+",
      ],
      normalizedResult: "walmart",
      expectedEarnCategory: "shopping_instore",
      plaidCategoryPrimary: "SHOPS",
      plaidCategoryDetailed: "SHOPS_DISCOUNT_STORES",
      matchesBenefitPatterns: ["walmart+", "walmart plus", "walmart"],
      amountRange: { min: 12.95, max: 12.95 },
      edgeCases: [
        {
          rawName: "WAL-MART *PLUS",
          normalizedOutput: "wal-mart plus",
          description: "Hyphenated variant. 'wal-mart plus' does NOT contain 'walmart' (no hyphen in pattern). This would NOT match 'walmart' or 'walmart+' patterns. Must fall through to plaidCategory or go unmatched. This is a real-world normalization gap."
        },
      ],
    },
    {
      merchantKey: "walmart_grocery",
      plaidMerchantName: "Walmart",
      nameVariants: [
        "WAL-MART #1700",
        "WALMART SUPERCENTER",
        "WALMART.COM",
        "WM SUPERCENTER #1700",
      ],
      normalizedResult: "walmart",
      expectedEarnCategory: "shopping_instore",
      plaidCategoryPrimary: "SHOPS",
      plaidCategoryDetailed: "SHOPS_SUPERMARKETS_AND_GROCERIES",
      matchesBenefitPatterns: ["walmart"],
      amountRange: { min: 15, max: 180 },
    },
  ],

  // ══════════════════════════════════════════════════
  // Groceries (for cap testing — Amex BCP 6% $6K cap)
  // ══════════════════════════════════════════════════
  groceries: [
    {
      merchantKey: "whole_foods",
      plaidMerchantName: "Whole Foods Market",
      nameVariants: [
        "WHOLE FOODS MKT #10421",
        "WFM *WHOLE FOODS 365",
        "WHOLE FOODS MARKET",
        "WHOLEFDS MKT #04217",
      ],
      normalizedResult: "whole foods",
      expectedEarnCategory: "groceries",
      plaidCategoryPrimary: "FOOD_AND_DRINK",
      plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
      matchesBenefitPatterns: [],
      amountRange: { min: 15, max: 185 },
      edgeCases: [
        {
          rawName: "WFM *WHOLE FOODS 365",
          normalizedOutput: "wfm whole foods",
          description: "WFM is NOT in the POS prefix strip list (only WF is). 'wfm whole foods' still contains 'whole foods' for merchant map match."
        },
        {
          rawName: "WHOLEFDS MKT #04217",
          normalizedOutput: "wholefds mkt",
          description: "Abbreviated variant. Does NOT match 'whole foods' substring. Falls to plaidCategory 'FOOD_AND_DRINK_GROCERIES' → 'groceries' at medium confidence. This is a real-world classification gap."
        },
      ],
    },
    {
      merchantKey: "trader_joes",
      plaidMerchantName: "Trader Joe's",
      nameVariants: [
        "TRADER JOE'S #247",
        "TRADER JOES #247",
        "TRADER JOE S",
      ],
      normalizedResult: "trader joe",     // Note: apostrophe handling
      expectedEarnCategory: "groceries",
      plaidCategoryPrimary: "FOOD_AND_DRINK",
      plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
      matchesBenefitPatterns: [],
      amountRange: { min: 20, max: 95 },
    },
    {
      merchantKey: "kroger",
      plaidMerchantName: "Kroger",
      nameVariants: [
        "KROGER #531",
        "KROGER FUEL CENTER",
        "KROGER MARKETPLACE",
      ],
      normalizedResult: "kroger",
      expectedEarnCategory: "groceries",
      plaidCategoryPrimary: "FOOD_AND_DRINK",
      plaidCategoryDetailed: "FOOD_AND_DRINK_GROCERIES",
      matchesBenefitPatterns: [],
      amountRange: { min: 25, max: 150 },
    },
  ],

  // ══════════════════════════════════════════════════
  // Hotels (for co-brand and portal testing)
  // ══════════════════════════════════════════════════
  hotels: [
    {
      merchantKey: "hyatt_stay",
      plaidMerchantName: "Hyatt",
      nameVariants: [
        "HYATT REGENCY SAN FRANCISCO",
        "PARK HYATT NEW YORK",
        "HYATT PLACE DFW AIRPORT",
        "HYATT HOUSE SEATTLE",
        "ANDAZ FIFTH AVENUE NYC",         // Hyatt sub-brand — does it match "hyatt"?
        "THOMPSON HOTEL NASHVILLE",       // Another Hyatt brand
        "ALILA VENTANA BIG SUR",          // Hyatt luxury brand
      ],
      normalizedResult: "hyatt",          // varies — Andaz normalizes to "andaz fifth avenue nyc"
      expectedEarnCategory: "travel_hotels",
      plaidCategoryPrimary: "TRAVEL",
      plaidCategoryDetailed: "TRAVEL_LODGING",
      matchesBenefitPatterns: ["hyatt"],
      amountRange: { min: 150, max: 800 },
      edgeCases: [
        {
          rawName: "ANDAZ FIFTH AVENUE NYC",
          normalizedOutput: "andaz fifth avenue nyc",
          description: "Andaz is a Hyatt brand but the name doesn't contain 'hyatt'. Without Plaid enriching merchant_name to 'Hyatt', this would NOT match the 'hyatt' benefit pattern. Falls to plaidCategory 'TRAVEL_LODGING' → travel_hotels. Earn rate depends on whether the earn config uses merchant_match or category."
        },
        {
          rawName: "THOMPSON HOTEL NASHVILLE",
          normalizedOutput: "thompson hotel nashville",
          description: "Thompson is a Hyatt brand. Same issue as Andaz — no 'hyatt' in the name."
        },
      ],
    },
  ],

  // ══════════════════════════════════════════════════
  // Travel portal charges (for portal mode testing)
  // ══════════════════════════════════════════════════
  travel_portal: [
    {
      merchantKey: "chase_travel",
      plaidMerchantName: null,
      nameVariants: [
        "CHASE TRAVEL",
        "ULTIMATE REWARDS TRAVEL",
        "CHASE ULTIMATE REWARDS",
      ],
      normalizedResult: "chase travel",
      expectedEarnCategory: "travel_portal",
      plaidCategoryPrimary: "TRAVEL",
      plaidCategoryDetailed: "TRAVEL_LODGING",
      matchesBenefitPatterns: [],
      amountRange: { min: 150, max: 2000 },
    },
    {
      merchantKey: "amex_travel",
      plaidMerchantName: null,
      nameVariants: [
        "AMEX TRAVEL",
        "AMEXTRAVEL.COM",
      ],
      normalizedResult: "amex travel",
      expectedEarnCategory: "travel_portal",
      plaidCategoryPrimary: "TRAVEL",
      plaidCategoryDetailed: "TRAVEL_LODGING",
      matchesBenefitPatterns: ["amextravel", "amex travel"],
      amountRange: { min: 200, max: 3000 },
    },
  ],

  // ══════════════════════════════════════════════════
  // Annual fee charges (for anniversary detection)
  // ══════════════════════════════════════════════════
  annual_fees: [
    {
      merchantKey: "chase_annual_fee",
      plaidMerchantName: null,
      nameVariants: [
        "ANNUAL MEMBERSHIP FEE",
        "CHASE ANNUAL FEE",
        "ANNUAL FEE",
      ],
      normalizedResult: "annual membership fee",
      expectedEarnCategory: "other",
      plaidCategoryPrimary: "BANK_FEES",
      plaidCategoryDetailed: "BANK_FEES_ATM_FEES",
      matchesBenefitPatterns: [],
      amountRange: { min: 95, max: 550 },
    },
    {
      merchantKey: "amex_annual_fee",
      plaidMerchantName: null,
      nameVariants: [
        "ANNUAL MEMBERSHIP FEE",
        "CARD MEMBERSHIP FEE",
        "AMEX ANNUAL FEE",
      ],
      normalizedResult: "annual membership fee",
      expectedEarnCategory: "other",
      plaidCategoryPrimary: "BANK_FEES",
      plaidCategoryDetailed: "BANK_FEES_ATM_FEES",
      matchesBenefitPatterns: [],
      amountRange: { min: 95, max: 895 },
    },
  ],
};
```

## How the Generator Uses the Registry

The generator's job becomes **selection and composition**, not invention:

```typescript
function generateTransaction(
  template: MerchantTemplate,
  date: Date,
  seq: number,
  cardType: string,
  persona: string,
  options: {
    forceNullMerchantName?: boolean;    // test fallback path
    useEdgeCaseVariant?: number;         // index into edgeCases
    intendedBenefit?: string;
    edgeCaseTag?: string;
  } = {}
): GeneratedTransaction {
  // Pick a random name variant
  const variantIndex = options.useEdgeCaseVariant
    ?? Math.floor(Math.random() * template.nameVariants.length);
  const rawName = template.nameVariants[variantIndex];

  // merchantName: use Plaid's enriched version (or null for fallback testing)
  const merchantName = options.forceNullMerchantName
    ? null
    : template.plaidMerchantName;

  // merchantNameRaw: always the "name" field variant
  const merchantNameRaw = rawName;

  // Amount: random within range
  const amount = randomInRange(template.amountRange.min, template.amountRange.max);

  return {
    id: `tx_${cardType}_${persona}_${seq}`,
    date: date.toISOString().split("T")[0],
    merchantName: merchantName ?? rawName,  // mirrors plaid-sync.ts: merchant_name || name
    merchantNameRaw: rawName,
    amount: Math.round(amount * 100) / 100,
    plaidCategoryPrimary: template.plaidCategoryPrimary,
    plaidCategoryDetailed: template.plaidCategoryDetailed,
    pending: false,
    matchedStatus: "unmatched",
    datetime: null,
    _meta: {
      intendedBenefit: options.intendedBenefit ?? null,
      intendedCategory: template.expectedEarnCategory,
      edgeCaseTag: options.edgeCaseTag ?? null,
      isCompetitorSpend: false,
      competitorBenefitKey: null,
      recurringGroupId: null,
    },
  };
}
```

## The Verification Layer: Normalizer Round-Trip

Before any fixture is written, every transaction runs through the actual normalizer to verify the registry is correct:

```typescript
import { normalizeMerchantName } from "@/lib/engine/normalize";
import { classifyForPoints } from "@/lib/points/categories";

function verifyRegistryEntry(template: MerchantTemplate): string[] {
  const errors: string[] = [];

  for (const variant of template.nameVariants) {
    // Test what the matcher would actually see
    const input = template.plaidMerchantName ?? variant;
    const normalized = normalizeMerchantName(input);

    // Verify normalization produces expected result
    if (!normalized.includes(template.normalizedResult)) {
      errors.push(
        `${template.merchantKey}: normalizing "${input}" produced "${normalized}", ` +
        `expected to contain "${template.normalizedResult}"`
      );
    }

    // Verify points classification
    const assignment = classifyForPoints(
      template.plaidMerchantName,
      template.plaidCategoryPrimary,
      template.plaidCategoryDetailed
    );
    if (assignment.category !== template.expectedEarnCategory) {
      errors.push(
        `${template.merchantKey}: classifyForPoints returned "${assignment.category}", ` +
        `expected "${template.expectedEarnCategory}"`
      );
    }
  }

  // Also verify edge cases
  for (const edge of template.edgeCases ?? []) {
    const normalized = normalizeMerchantName(edge.rawName);
    if (normalized !== edge.normalizedOutput) {
      errors.push(
        `${template.merchantKey} edge case: normalizing "${edge.rawName}" produced ` +
        `"${normalized}", expected "${edge.normalizedOutput}"`
      );
    }
  }

  return errors;
}
```

This is the key insight: **the registry itself becomes a test of the normalizer**. If someone changes `normalizeMerchantName()` and it breaks a merchant pattern, the registry verification catches it immediately — before any fixtures are even generated.

## Where the LLM Fits In

The LLM does NOT generate merchant names. Its role is:

1. **Persona creation**: Given a card's benefit structure and earn rates, design realistic spending profiles with the right category mix and amounts.
2. **Transaction composition**: Given a persona and the merchant registry, compose a 12-month transaction timeline that hits all the right benefits in the right cycles with realistic date distribution.
3. **Edge case orchestration**: Place edge-case transactions at the right moments (near cap thresholds, month boundaries, etc.) with correct cumulative amounts.

The prompt to the LLM includes the merchant registry as available building blocks:

```
Available merchants for this persona's transactions:
- doordash: [doordash_order] — $8-55 per transaction
- uber_eats: [uber_eats] — $12-65 per transaction
- uber_ride: [uber_ride] — $8-85 per transaction
- resy: [resy_restaurant] — $50-400 per transaction
- ...

For each transaction, specify:
  { merchantKey, date, intendedBenefit, edgeCaseTag }

Do NOT invent merchant names. Use only merchantKeys from the registry.
The generator will select the actual name variants.
```

## How Many Merchant Templates Do We Need?

One template per unique benefit pattern × earn category intersection. Estimated:

| Category | Templates | Covers |
|----------|-----------|--------|
| Food delivery (DoorDash, Uber Eats, Grubhub) | 3 | CSR DoorDash credits, A1 competitor |
| Rideshare (Uber, Lyft) | 2 | Amex Plat Uber Cash, CSR Lyft, A1 competitor |
| Streaming (8 services) | 8 | Amex Plat digital entertainment |
| Dining (Resy + generic) | 3 | Amex Plat Resy credit, dining earn rates |
| Groceries (5 chains) | 5 | Amex BCP/Gold grocery rates, cap testing |
| Shopping (Saks, lululemon, Walmart, generic) | 4 | Amex Plat credits |
| Hotels (5 chains + sub-brands) | 6 | Co-brand earn rates, portal benefits |
| Travel portal (5 portals) | 5 | Portal mode testing |
| Gas (3 chains) | 3 | Gas earn rates, cap testing |
| Airlines (4 carriers) | 4 | Flight earn rates, airline fee credit |
| Fitness (Equinox, Peloton) | 2 | Amex Plat Equinox credit |
| Transit (MTA, BART, etc.) | 3 | Transit earn rates |
| Generic (Amazon, Target, misc) | 5 | Base rate testing, "other" category |
| Annual fees | 3 | Anniversary detection |
| CLEAR, Global Entry, TSA | 2 | Travel credits |
| **Total** | **~58** | All 30 cards |

This is a one-time investment. Once built, the registry is the single source of truth for "what do real merchant transactions look like" across the entire test suite.
