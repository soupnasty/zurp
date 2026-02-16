# Tier 1 & 2 Deep Dive: Synthetic Generation + Oracle Validation

This is a detailed implementation spec for the Generator and Oracle tiers of the AI-agent testing framework. It covers exactly what gets generated, how it maps to zurp's existing interfaces, how the oracle validates outputs, and how both integrate into the vitest pipeline.

---

## Part 1: The Generator

### What We're Generating (and Why)

The existing test suite uses hand-crafted fixtures with generic names like `"TESTMERCHANT"` and minimal transaction sets (1-5 per test). This works for unit-testing individual code paths but misses emergent behavior — what happens when 150 real-looking transactions hit the matcher across 21 Amex Platinum benefits in a given month? Does the Uber Cash `activeMonths` gating work correctly when a December Uber Eats charge hits on January 1st UTC? Does the points simulator rank correctly when a user splits spending across grocery, dining, and travel in realistic proportions?

The generator creates **fixture sets** that are realistic enough to catch these problems and structured enough for the oracle to validate automatically.

### Output Artifact Structure

Each card × persona combination produces four JSON files:

```
test/fixtures/generated/
  {cardType}/
    {persona}.transactions.json      # MatcherTransaction[] + point classification fields
    {persona}.plaid-responses.json   # Plaid transactions.sync API response mocks
    {persona}.expected.json          # Oracle reference: expected matches, points, insights
    {persona}.persona.json           # Persona definition (input to regeneration)
```

### The Transaction Schema

Every generated transaction must satisfy **both** `MatcherTransaction` (for the benefit engine) and the points system's `SimulationTransaction` shape. Here's the unified fixture format:

```typescript
interface GeneratedTransaction {
  // ── Core (MatcherTransaction) ──
  id: string;                          // "tx_{cardType}_{persona}_{seq}"
  date: string;                        // ISO date "2025-07-15"
  merchantName: string | null;         // Normalized: "doordash"
  merchantNameRaw: string | null;      // Raw Plaid: "DOORDASH*SWEETGREEN ORDER #4582"
  amount: number;                      // Always positive (refunds handled separately)
  plaidCategoryPrimary: string | null; // "FOOD_AND_DRINK"
  plaidCategoryDetailed: string | null;// "FOOD_AND_DRINK_RESTAURANTS"
  pending: boolean;                    // false for all committed transactions
  matchedStatus: "unmatched";          // Always unmatched (engine processes them)

  // ── Points classification (SimulationTransaction) ──
  datetime: string | null;             // ISO datetime for time-window conditions (Citi Nights)

  // ── Generator metadata (not consumed by engine, used by oracle) ──
  _meta: {
    intendedBenefit: string | null;    // benefit ID this tx is meant to trigger
    intendedCategory: string;          // EarnCategory for points classification
    edgeCaseTag: string | null;        // "near_cap", "cross_midnight", "month_boundary", etc.
    isCompetitorSpend: boolean;        // should trigger A1/A2 insight
    competitorBenefitKey: string | null;
    recurringGroupId: string | null;   // groups recurring charges for A2 detection
  };
}
```

The `_meta` field is the key innovation — it carries the generator's **intent** alongside the raw data. The oracle uses `_meta.intendedBenefit` to verify the matcher assigned the right benefit, `_meta.intendedCategory` to verify the points classifier assigned the right earn category, and `_meta.edgeCaseTag` to confirm edge cases were actually exercised.

### Persona Design

Each persona describes a realistic spending profile for a given card. Personas serve two purposes: they control what the generator produces, and they document the test's coverage intent.

```typescript
interface Persona {
  cardType: string;
  personaName: string;
  description: string;                // "Heavy traveler, uses all Amex portal benefits"

  // ── Time context ──
  generationWindow: {
    start: string;                    // "2025-01-01"
    end: string;                      // "2025-12-31"
  };
  anniversaryDate: string | null;     // "2025-03-15" (for annual_anniversary cycle)

  // ── Spending profile ──
  monthlySpend: {
    category: string;                 // EarnCategory
    avgAmount: number;                // average monthly total for this category
    variance: number;                 // 0.0–1.0 (percentage swing)
    transactionsPerMonth: number;     // how many individual charges
    merchants: MerchantSpec[];        // specific merchants to use
  }[];

  // ── Benefit engagement ──
  benefitBehavior: {
    benefitId: string;
    behavior: "always_use" | "partial_use" | "never_use" | "over_use";
    // always_use: generate enough spend to max the credit every cycle
    // partial_use: generate ~50-70% usage
    // never_use: skip entirely (tests B1 unused credit insight)
    // over_use: generate more than the credit amount (tests credit capping)
    targetUsagePercent?: number;      // override for partial_use
  }[];

  // ── Competitor spending ──
  competitorSpend: {
    competitorMerchant: string;       // "Uber Eats"
    plaidPattern: string;             // "uber eats"
    monthlyAmount: number;
    recurring: boolean;               // if true, generates monthly charges for A2
  }[];

  // ── Edge cases to inject ──
  edgeCases: EdgeCaseSpec[];
}

interface MerchantSpec {
  normalizedName: string;             // "doordash"
  rawVariants: string[];              // ["DOORDASH*SWEETGREEN", "DD *DOORDASH THAI BASIL"]
  plaidCategoryDetailed: string;      // "FOOD_AND_DRINK_RESTAURANTS"
  typicalAmount: { min: number; max: number };
}

interface EdgeCaseSpec {
  type: "near_cap"                    // generate spend just below a cap threshold
    | "exceed_cap"                    // generate spend exceeding a cap
    | "cross_midnight"                // transaction near midnight UTC (Citi Nights)
    | "month_boundary"                // transaction on last/first day of month
    | "quarter_boundary"              // transaction on quarter boundary (Amex quarterly credits)
    | "anniversary_boundary"          // transaction near anniversary date
    | "pending_to_posted"             // simulate pending → posted transition
    | "duplicate_merchant"            // same merchant, same amount, same day (dedup test)
    | "refund"                        // negative amount transaction
    | "zero_amount"                   // $0 authorization
    | "activeMonths_boundary"         // test activeMonths gating (e.g., Uber Dec/Jan)
    | "fee_charge";                   // annual fee for anniversary detection
  details: Record<string, unknown>;   // type-specific parameters
}
```

### Card-Specific Persona Examples

These illustrate what the generator needs to produce for cards with very different benefit structures:

#### Amex Platinum — "Maximizer" Persona

This persona exercises all 21 benefits across 5 cycle types:

```json
{
  "cardType": "amex_platinum",
  "personaName": "maximizer",
  "description": "Power user who activates and uses every benefit. Tests full benefit coverage, activeMonths gating, quarterly/semi-annual cycle rollover, and all merchant patterns.",
  "generationWindow": { "start": "2025-01-01", "end": "2025-12-31" },
  "anniversaryDate": "2025-03-15",
  "monthlySpend": [
    {
      "category": "dining",
      "avgAmount": 600,
      "variance": 0.2,
      "transactionsPerMonth": 12,
      "merchants": [
        { "normalizedName": "resy", "rawVariants": ["RESY - THE GRILL NYC", "RESY*ATOMIX"], "plaidCategoryDetailed": "FOOD_AND_DRINK_RESTAURANTS", "typicalAmount": { "min": 40, "max": 150 } }
      ]
    },
    {
      "category": "streaming",
      "avgAmount": 45,
      "variance": 0.0,
      "transactionsPerMonth": 3,
      "merchants": [
        { "normalizedName": "hulu", "rawVariants": ["HULU 73281954"], "plaidCategoryDetailed": "ENTERTAINMENT_TV_AND_MOVIES", "typicalAmount": { "min": 7.99, "max": 17.99 } },
        { "normalizedName": "peacock", "rawVariants": ["PEACOCK TV"], "plaidCategoryDetailed": "ENTERTAINMENT_TV_AND_MOVIES", "typicalAmount": { "min": 5.99, "max": 13.99 } },
        { "normalizedName": "nytimes", "rawVariants": ["NYT*NYTIMES DIGITAL"], "plaidCategoryDetailed": "ENTERTAINMENT_TV_AND_MOVIES", "typicalAmount": { "min": 4.25, "max": 17.00 } }
      ]
    },
    {
      "category": "rideshare",
      "avgAmount": 200,
      "variance": 0.3,
      "transactionsPerMonth": 8,
      "merchants": [
        { "normalizedName": "uber", "rawVariants": ["UBER *TRIP", "UBER BV TRIP HELP.UBER.COM"], "plaidCategoryDetailed": "TRANSPORTATION_TAXIS_AND_RIDE_SHARES", "typicalAmount": { "min": 12, "max": 45 } }
      ]
    },
    {
      "category": "shopping_instore",
      "avgAmount": 150,
      "variance": 0.4,
      "transactionsPerMonth": 2,
      "merchants": [
        { "normalizedName": "saks fifth avenue", "rawVariants": ["SAKS FIFTH AVENUE #611", "SAKS FIFTH AVE NYC"], "plaidCategoryDetailed": "SHOPS_CLOTHING_AND_ACCESSORIES", "typicalAmount": { "min": 30, "max": 120 } },
        { "normalizedName": "lululemon", "rawVariants": ["LULULEMON #04521", "LULULEMON ATHLETICA"], "plaidCategoryDetailed": "SHOPS_CLOTHING_AND_ACCESSORIES", "typicalAmount": { "min": 50, "max": 140 } }
      ]
    }
  ],
  "benefitBehavior": [
    { "benefitId": "plat_resy_credit_q1", "behavior": "always_use" },
    { "benefitId": "plat_resy_credit_q2", "behavior": "always_use" },
    { "benefitId": "plat_resy_credit_q3", "behavior": "partial_use", "targetUsagePercent": 60 },
    { "benefitId": "plat_resy_credit_q4", "behavior": "always_use" },
    { "benefitId": "plat_lululemon_credit_q1", "behavior": "always_use" },
    { "benefitId": "plat_lululemon_credit_q2", "behavior": "never_use" },
    { "benefitId": "plat_lululemon_credit_q3", "behavior": "always_use" },
    { "benefitId": "plat_lululemon_credit_q4", "behavior": "partial_use", "targetUsagePercent": 40 },
    { "benefitId": "plat_digital_entertainment", "behavior": "always_use" },
    { "benefitId": "plat_uber_cash", "behavior": "always_use" },
    { "benefitId": "plat_uber_cash_dec", "behavior": "always_use" },
    { "benefitId": "plat_walmart_plus", "behavior": "always_use" },
    { "benefitId": "plat_hotel_credit_h1", "behavior": "partial_use", "targetUsagePercent": 80 },
    { "benefitId": "plat_hotel_credit_h2", "behavior": "never_use" },
    { "benefitId": "plat_saks_h1", "behavior": "always_use" },
    { "benefitId": "plat_saks_h2", "behavior": "always_use" },
    { "benefitId": "plat_airline_fee_credit", "behavior": "partial_use", "targetUsagePercent": 50 },
    { "benefitId": "plat_equinox", "behavior": "never_use" },
    { "benefitId": "plat_clear", "behavior": "always_use" },
    { "benefitId": "plat_oura", "behavior": "never_use" },
    { "benefitId": "plat_global_entry", "behavior": "always_use" }
  ],
  "competitorSpend": [],
  "edgeCases": [
    { "type": "activeMonths_boundary", "details": { "benefitId": "plat_uber_cash_dec", "description": "Uber charge on Dec 31 at 11:55pm EST → should match Dec credit, not Jan" } },
    { "type": "activeMonths_boundary", "details": { "benefitId": "plat_uber_cash", "description": "Uber charge on Jan 1 → should match Jan credit (activeMonths [0..10])" } },
    { "type": "quarter_boundary", "details": { "benefitId": "plat_resy_credit_q1", "description": "Resy charge on March 31 → should match Q1, not Q2" } },
    { "type": "fee_charge", "details": { "amount": 895, "description": "Annual membership fee", "month": 3 } }
  ]
}
```

#### Amex BCP — "Grocery Optimizer" Persona

Tests the $6K grocery cap and cash-back currency (no transfer partners):

```json
{
  "cardType": "amex_blue_cash_preferred",
  "personaName": "grocery_optimizer",
  "description": "Family shopper who heavily uses the 6% grocery category. Tests cap tracking, cash-back currency, and behavior when approaching/exceeding the $6K annual grocery cap.",
  "monthlySpend": [
    {
      "category": "groceries",
      "avgAmount": 550,
      "variance": 0.15,
      "transactionsPerMonth": 8,
      "merchants": [
        { "normalizedName": "whole foods", "rawVariants": ["WHOLE FOODS MKT #10421", "WFM *WHOLE FOODS 365"], "plaidCategoryDetailed": "FOOD_AND_DRINK_GROCERIES", "typicalAmount": { "min": 35, "max": 120 } },
        { "normalizedName": "trader joe", "rawVariants": ["TRADER JOE'S #247"], "plaidCategoryDetailed": "FOOD_AND_DRINK_GROCERIES", "typicalAmount": { "min": 25, "max": 85 } }
      ]
    },
    {
      "category": "streaming",
      "avgAmount": 50,
      "variance": 0.0,
      "transactionsPerMonth": 4,
      "merchants": [
        { "normalizedName": "netflix", "rawVariants": ["NETFLIX.COM"], "plaidCategoryDetailed": "ENTERTAINMENT_TV_AND_MOVIES", "typicalAmount": { "min": 15.49, "max": 22.99 } },
        { "normalizedName": "spotify", "rawVariants": ["SPOTIFY USA"], "plaidCategoryDetailed": "ENTERTAINMENT_MUSIC", "typicalAmount": { "min": 10.99, "max": 16.99 } }
      ]
    }
  ],
  "benefitBehavior": [],
  "competitorSpend": [],
  "edgeCases": [
    { "type": "near_cap", "details": { "capType": "grocery_6k", "targetSpendByMonth10": 5800, "description": "Cumulative grocery spend reaches $5,800 by October, then $250 in Nov tips over" } },
    { "type": "exceed_cap", "details": { "capType": "grocery_6k", "postCapSpend": 400, "description": "After exceeding $6K, verify 1% fallback rate" } }
  ]
}
```

#### World of Hyatt — "Loyalty Traveler" Persona

Tests co-brand merchant matching across 9 Hyatt sub-brands:

```json
{
  "cardType": "world_of_hyatt",
  "personaName": "loyalty_traveler",
  "description": "Hyatt loyalist who stays across multiple sub-brands. Tests merchant_match across 9 brand patterns and the 4x Hyatt earn rate.",
  "monthlySpend": [
    {
      "category": "travel_hotels",
      "avgAmount": 500,
      "variance": 0.5,
      "transactionsPerMonth": 2,
      "merchants": [
        { "normalizedName": "hyatt", "rawVariants": ["HYATT REGENCY SAN FRANCISCO", "PARK HYATT NEW YORK", "HYATT PLACE DFW AIRPORT", "ANDAZ FIFTH AVENUE NYC", "HYATT HOUSE SEATTLE"], "plaidCategoryDetailed": "TRAVEL_LODGING", "typicalAmount": { "min": 150, "max": 600 } }
      ]
    },
    {
      "category": "dining",
      "avgAmount": 400,
      "variance": 0.25,
      "transactionsPerMonth": 10,
      "merchants": [
        { "normalizedName": "sweetgreen", "rawVariants": ["TST* SWEETGREEN #1042", "SQ *SWEETGREEN"], "plaidCategoryDetailed": "FOOD_AND_DRINK_RESTAURANTS", "typicalAmount": { "min": 12, "max": 22 } }
      ]
    }
  ],
  "benefitBehavior": [],
  "competitorSpend": [],
  "edgeCases": [
    { "type": "duplicate_merchant", "details": { "merchant": "hyatt", "description": "Two Hyatt charges same day, same amount — should both earn 4x" } }
  ]
}
```

### Generator Implementation

The generator is a Node.js script that uses the Anthropic API with structured output. The process:

1. **Read card definition** → extract all benefits, their merchant patterns, cycle types, and amounts.
2. **Read earn config** → extract bonus categories, caps, and special conditions.
3. **Read competitor map** → extract competitor entries for this card.
4. **Build prompt** with persona spec + card context → ask LLM to generate transactions.
5. **Post-process** → assign IDs, sort by date, validate against schema, write JSON.

```typescript
// test/generators/generate-fixtures.ts

import Anthropic from "@anthropic-ai/sdk";
import { getCardDefinition } from "@/lib/cards";
import { getEarnConfig } from "@/lib/points/earn-configs";
import { readPersona, writeFixtures } from "./io";
import { validateTransactions } from "./validation";

const client = new Anthropic();

async function generateForPersona(cardType: string, personaName: string) {
  const card = getCardDefinition(cardType);
  const earnConfig = getEarnConfig(cardType);
  const persona = readPersona(cardType, personaName);

  // Build context for the LLM
  const cardContext = {
    benefits: card.benefits.map(b => ({
      id: b.id,
      name: b.name,
      creditAmount: b.creditAmount,
      cycle: b.cycle,
      merchantPatterns: b.merchantPatterns,
      plaidCategories: b.plaidCategories,
      activeMonths: b.activeMonths,
      autoMatchable: b.autoMatchable,
      priority: b.priority,
    })),
    earnConfig: {
      baseRate: earnConfig.baseRate,
      bonusCategories: earnConfig.bonusCategories,
      caps: earnConfig.caps,
    },
    annualFee: card.annualFee,
  };

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 16000,
    messages: [{
      role: "user",
      content: buildGeneratorPrompt(persona, cardContext),
    }],
    // Structured output ensures valid JSON
  });

  const transactions = parseTransactions(response);

  // Validate every transaction against the schema
  const errors = validateTransactions(transactions, card, earnConfig);
  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.join("\n")}`);
  }

  // Write fixture files
  writeFixtures(cardType, personaName, {
    transactions,
    persona,
  });
}
```

### The Generator Prompt

The prompt is the core of Tier 1. It needs to produce transactions that are simultaneously realistic (merchant names that look like real Plaid data) and coverage-aware (hitting all the right benefits and edge cases). Here's the structure:

```
You are generating synthetic credit card transaction data for testing a
benefits tracking engine. Your output must be valid JSON matching the
schema below.

CARD: {cardName} ({cardType})
Annual fee: ${annualFee}
Benefits: [list each benefit with id, creditAmount, cycle, merchantPatterns, activeMonths]
Earn rates: [list bonus categories with rate and cap]
Competitor map: [list competitor entries]

PERSONA: {personaName}
Description: {description}
Window: {start} to {end}
Anniversary: {anniversaryDate}

SPENDING PROFILE:
{for each monthlySpend category, show merchants, amounts, frequency}

BENEFIT TARGETS:
{for each benefitBehavior, show target usage}

EDGE CASES TO INCLUDE:
{for each edgeCase, show specification}

CRITICAL RULES:
1. Merchant `merchantNameRaw` must look like real Plaid data — include
   POS prefixes (SQ *, TST*, PP*, CKE*, SP *), order numbers (#1234),
   location suffixes (NYC, SF, #247), and inconsistent casing.
2. `merchantName` should be the normalized version that Plaid provides
   (lowercased, trimmed — this is what the matching engine sees after
   further normalization).
3. `plaidCategoryDetailed` must use real Plaid category codes (e.g.,
   FOOD_AND_DRINK_RESTAURANTS, TRANSPORTATION_TAXIS_AND_RIDE_SHARES).
4. For each transaction intended to trigger a specific benefit, set
   `_meta.intendedBenefit` to the benefit ID.
5. For each transaction, set `_meta.intendedCategory` to the EarnCategory
   the points engine should classify it as.
6. Distribute transactions realistically across the date range —
   not all on the 15th of each month. Vary days, include weekends.
7. Amounts should vary within the ranges specified — no two transactions
   at exactly the same amount.
8. Include the annual fee charge in month {anniversaryMonth} with
   merchantName matching "{feeDescriptor}".
9. For "near_cap" edge cases, carefully compute cumulative spend to
   land within $50-200 of the cap threshold by the specified month.

Generate {transactionCount} transactions. Output as a JSON array.
```

### Post-Generation Validation

Before writing fixtures, validate programmatically (no LLM needed):

```typescript
function validateTransactions(
  txs: GeneratedTransaction[],
  card: CardDefinition,
  earnConfig: EarnConfig
): string[] {
  const errors: string[] = [];

  // 1. Schema validation: all required fields present with correct types
  for (const tx of txs) {
    if (!tx.id || !tx.date || tx.amount === undefined) {
      errors.push(`Transaction missing required fields: ${tx.id}`);
    }
  }

  // 2. Benefit coverage: every benefit with behavior != "never_use" has
  //    at least one transaction targeting it
  const targetedBenefits = new Set(txs.map(tx => tx._meta.intendedBenefit).filter(Boolean));
  for (const b of card.benefits) {
    if (!targetedBenefits.has(b.id)) {
      // Only error if persona specifies this benefit should be used
      errors.push(`No transactions targeting benefit ${b.id} (${b.name})`);
    }
  }

  // 3. Merchant pattern validity: intended benefit transactions use
  //    merchants that actually match the benefit's merchantPatterns
  for (const tx of txs) {
    if (tx._meta.intendedBenefit) {
      const benefit = card.benefits.find(b => b.id === tx._meta.intendedBenefit);
      if (benefit && benefit.merchantPatterns.length > 0) {
        const normalized = tx.merchantName?.toLowerCase() ?? "";
        const matches = benefit.merchantPatterns.some(p => normalized.includes(p));
        if (!matches && benefit.plaidCategories.length === 0) {
          errors.push(
            `Tx ${tx.id} targets benefit ${benefit.name} but merchantName ` +
            `"${tx.merchantName}" doesn't match patterns [${benefit.merchantPatterns}]`
          );
        }
      }
    }
  }

  // 4. Date range: all dates within generation window
  // 5. Amount sanity: no negative amounts except refunds, no $0 except zero_amount edge cases
  // 6. Edge case presence: every requested edge case has at least one tagged transaction

  return errors;
}
```

### Fixture Staleness Detection

When a card definition or earn config changes, existing fixtures may be stale. A CI step detects this:

```typescript
// test/generators/check-staleness.ts

import { createHash } from "crypto";
import { readFileSync, existsSync } from "fs";

function hashCardInputs(cardType: string): string {
  const cardDef = readFileSync(`src/lib/cards/${cardType}.ts`, "utf8");
  const earnConfig = readFileSync(`src/lib/points/earn-configs/${cardType}.ts`, "utf8");
  const hash = createHash("sha256");
  hash.update(cardDef);
  hash.update(earnConfig);
  return hash.digest("hex").slice(0, 16);
}

function checkStaleness(): string[] {
  const stale: string[] = [];
  for (const cardType of ALL_CARD_TYPES) {
    const currentHash = hashCardInputs(cardType);
    const hashFile = `test/fixtures/generated/${cardType}/.input-hash`;
    if (!existsSync(hashFile)) {
      stale.push(`${cardType}: no fixtures generated yet`);
    } else {
      const storedHash = readFileSync(hashFile, "utf8").trim();
      if (storedHash !== currentHash) {
        stale.push(`${cardType}: card definition changed since fixtures were generated`);
      }
    }
  }
  return stale;
}
```

### Minimum Persona Coverage per Card

Every card needs at least two personas to cover its benefit and earn-rate surface:

| Card Tier | Persona 1 | Persona 2 | Optional Persona 3 |
|-----------|-----------|-----------|-------------------|
| Premium (CSR, Amex Plat, Venture X) | **Maximizer**: uses all benefits, generates edge cases | **Minimalist**: uses only 1-2 benefits, tests B1 unused credit insights | **Competitor**: heavy competitor spending, tests A1/A2 insights |
| Mid-tier (CSP, Amex Gold, Strata Premier) | **Category optimizer**: focuses on bonus categories near caps | **General spender**: flat spending across categories | — |
| No-fee (CFF, CFU, WF Active Cash) | **Points optimizer**: exercises bonus categories | **Flat spender**: tests base rate accuracy | — |
| Co-brand (Hyatt, Hilton, Delta, United) | **Brand loyalist**: heavy merchant-match spending | **Diversified**: mixes brand + non-brand spending | — |

---

## Part 2: The Oracle

### What the Oracle Validates

The oracle is not a fuzzy "does this look right?" check. It runs **deterministic logic enhanced by LLM reasoning** across three validation modes. Each mode has both programmatic checks (fast, cheap, always run) and LLM-assisted checks (deeper reasoning for ambiguous cases).

### Mode A: Benefit Match Validation

Given a fixture set and the matcher's output, validate every assignment.

#### Programmatic Checks (no LLM needed)

These run in vitest directly and cover the majority of validation:

```typescript
// test/oracle/programmatic-checks.ts

interface ProgrammaticResult {
  passed: boolean;
  failures: { txId: string; check: string; details: string }[];
  warnings: { txId: string; check: string; details: string }[];
}

function validateMatchesProgram(
  transactions: GeneratedTransaction[],
  matcherOutput: MatcherOutput,
  card: CardDefinition,
  persona: Persona
): ProgrammaticResult {
  const failures: ProgrammaticResult["failures"] = [];
  const warnings: ProgrammaticResult["warnings"] = [];

  const matchMap = new Map(matcherOutput.matches.map(m => [m.transactionId, m]));

  for (const tx of transactions) {
    const match = matchMap.get(tx.id);
    const intended = tx._meta.intendedBenefit;

    // ── Check 1: Intended benefit was matched ──
    if (intended && !match) {
      // Transaction was supposed to trigger a benefit but didn't
      const benefit = card.benefits.find(b => b.id === intended);
      failures.push({
        txId: tx.id,
        check: "intended_benefit_unmatched",
        details: `Expected match to ${benefit?.name} (${intended}) but transaction was unmatched`,
      });
    }

    // ── Check 2: Matched to correct benefit ──
    if (intended && match && match.benefitId !== intended) {
      // Matched to wrong benefit — this might be OK (priority routing)
      // but flag it for LLM review
      warnings.push({
        txId: tx.id,
        check: "benefit_mismatch",
        details: `Expected ${intended}, got ${match.benefitId}`,
      });
    }

    // ── Check 3: Credit amount doesn't exceed benefit amount ──
    if (match) {
      const benefit = card.benefits.find(b => b.id === match.benefitId);
      if (benefit && match.creditApplied > benefit.creditAmount) {
        failures.push({
          txId: tx.id,
          check: "credit_exceeds_limit",
          details: `Credit ${match.creditApplied} exceeds benefit limit ${benefit.creditAmount}`,
        });
      }
    }

    // ── Check 4: Non-benefit transactions not matched ──
    if (!intended && match) {
      // Transaction wasn't intended for any benefit but got matched
      warnings.push({
        txId: tx.id,
        check: "unexpected_match",
        details: `Transaction not targeting any benefit but matched to ${match.benefitId}`,
      });
    }

    // ── Check 5: Credit depletion correctness ──
    // After processing all transactions in a cycle, total credits applied
    // should not exceed the benefit's creditAmount for that cycle
    // (Checked at cycle level, not per-transaction — see below)

    // ── Check 6: Pending transactions skipped ──
    if (tx.pending && match) {
      failures.push({
        txId: tx.id,
        check: "pending_matched",
        details: `Pending transaction should not be matched`,
      });
    }

    // ── Check 7: activeMonths gating ──
    if (intended && match) {
      const benefit = card.benefits.find(b => b.id === intended);
      if (benefit?.activeMonths) {
        const txMonth = new Date(tx.date).getMonth();
        if (!benefit.activeMonths.includes(txMonth)) {
          failures.push({
            txId: tx.id,
            check: "activeMonths_violation",
            details: `Matched in month ${txMonth} but benefit only active in [${benefit.activeMonths}]`,
          });
        }
      }
    }
  }

  // ── Cycle-level credit cap check ──
  const cycleCredits = new Map<string, number>(); // "benefitId:periodKey" → total credits
  for (const match of matcherOutput.matches) {
    for (const [key, amount] of matcherOutput.usageUpdates) {
      cycleCredits.set(key, (cycleCredits.get(key) ?? 0) + amount);
    }
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings,
  };
}
```

#### LLM-Assisted Checks (for ambiguous cases)

The programmatic checks produce `warnings` — cases that *might* be wrong but require contextual reasoning. The oracle LLM reviews only these:

```typescript
// test/oracle/llm-review.ts

async function reviewWarnings(
  warnings: ProgrammaticResult["warnings"],
  transactions: GeneratedTransaction[],
  card: CardDefinition,
  matcherOutput: MatcherOutput
): Promise<OracleVerdict[]> {
  if (warnings.length === 0) return [];

  const prompt = `
You are validating benefit matching for the ${card.name} credit card.

CARD BENEFITS:
${card.benefits.map(b => `- ${b.id}: ${b.name}, $${b.creditAmount}/${b.cycle}, patterns: [${b.merchantPatterns}], priority: ${b.priority}`).join("\n")}

The following ${warnings.length} transactions have ambiguous matches that need
your review. For each, determine if the match is CORRECT, INCORRECT, or ACCEPTABLE.

ACCEPTABLE means: the match isn't what the test intended, but it's a valid
outcome given the engine's priority rules (e.g., a generic dining transaction
matching a higher-priority Resy credit instead of a lower-priority dining credit
is correct behavior, even if the test intended the dining credit).

${warnings.map(w => `
  TX ${w.txId}:
    Check: ${w.check}
    Details: ${w.details}
    Transaction: ${JSON.stringify(transactions.find(t => t.id === w.txId))}
    Match: ${JSON.stringify(matcherOutput.matches.find(m => m.transactionId === w.txId))}
`).join("\n")}

For each warning, respond with:
{ "txId": "...", "verdict": "correct" | "incorrect" | "acceptable", "reasoning": "..." }
`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",   // cheap, fast — sufficient for structured review
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  return parseVerdicts(response);
}
```

### Mode B: Points Consistency Validation

After running `runSimulation()` on a fixture set with all 30 earn configs, validate ranking logic.

#### Invariant Checks (programmatic)

These are mathematical truths that must always hold:

```typescript
function validatePointsConsistency(output: ComparisonOutput): ConsistencyResult {
  const failures: string[] = [];

  // ── Invariant 1: Flat-rate dominance ──
  // A card with flat 2x and $0 fee must rank above a card with flat 1x and $0 fee
  // when spending is diversified (no single category > 50%)
  const wfActiveCash = output.cards.find(c => c.cardId === "wells_fargo_active_cash");
  const citiDoubleCash = output.cards.find(c => c.cardId === "citi_double_cash");
  if (wfActiveCash && citiDoubleCash) {
    // Both are effectively 2% flat — should be very close
    const diff = Math.abs(wfActiveCash.netValue - citiDoubleCash.netValue);
    if (diff > 50) { // Allow some tolerance for fee/benefit differences
      failures.push(
        `WF Active Cash and Citi Double Cash have unexpectedly different ` +
        `net values: $${wfActiveCash.netValue} vs $${citiDoubleCash.netValue}`
      );
    }
  }

  // ── Invariant 2: No-fee card floor ──
  // A $0-fee card should never have negative net value
  for (const card of output.cards) {
    if (card.annualFee === 0 && card.netValue < 0) {
      failures.push(
        `${card.cardName} has $0 fee but negative net value: $${card.netValue}`
      );
    }
  }

  // ── Invariant 3: Points value positivity ──
  // Total points × conservative cpp should always be positive for any non-zero spending
  for (const card of output.cards) {
    if (card.totalPoints > 0 && card.pointsValue <= 0) {
      failures.push(
        `${card.cardName} earned ${card.totalPoints} points but value is $${card.pointsValue}`
      );
    }
  }

  // ── Invariant 4: Category winner earn rate ──
  // The winner for each category should have the highest earn rate for that category
  // (modulo caps — a capped card may not be the true winner if the user exceeds the cap)
  for (const catWinner of output.categoryWinners) {
    // Verify the winning card actually has a bonus for this category or the highest base rate
  }

  // ── Invariant 5: Portal mode directionality ──
  // Cards with portal bonuses (CSR 10x, Venture X 10x/5x) should improve in portal mode
  // Cards without portal bonuses should stay the same or slightly decrease

  // ── Invariant 6: Ranking stability ──
  // The #1 card's net value should be >= #2 card's net value
  // (rankings are sorted correctly)
  for (let i = 0; i < output.cards.length - 1; i++) {
    if (output.cards[i].netValue < output.cards[i + 1].netValue) {
      failures.push(
        `Ranking error: #${i + 1} ${output.cards[i].cardName} ($${output.cards[i].netValue}) ` +
        `ranked above #${i + 2} ${output.cards[i + 1].cardName} ($${output.cards[i + 1].netValue})`
      );
    }
  }

  return { passed: failures.length === 0, failures };
}
```

#### Spending Profile Sanity Checks (LLM-assisted)

For spending profiles that heavily favor a category, the oracle checks if the #1 card "makes sense":

```typescript
const SPENDING_PROFILES_TO_CHECK = [
  {
    name: "heavy_grocery",
    description: "User spends $1000+/month on groceries, minimal other spending",
    expectedTopCards: ["amex_blue_cash_preferred", "amex_blue_cash_everyday"],
    reasoning: "6% grocery rate (even with $6K cap) should dominate for grocery-heavy spenders"
  },
  {
    name: "heavy_dining",
    description: "User spends $800+/month on dining, moderate other",
    expectedTopCards: ["amex_gold", "chase_sapphire_reserve"],
    reasoning: "4x dining (Gold) or 3x dining + high cpp (CSR) should lead"
  },
  {
    name: "travel_only",
    description: "User spends mostly on flights and hotels",
    expectedTopCards: ["chase_sapphire_reserve", "capital_one_venture_x", "amex_platinum"],
    reasoning: "Portal bonuses and travel earn rates should dominate"
  },
  {
    name: "flat_spender",
    description: "Even spending across all categories, ~$3K/month total",
    expectedTopCards: ["wells_fargo_active_cash", "citi_double_cash", "robinhood_gold"],
    reasoning: "Flat 2-3% cards should win when no single category dominates"
  },
];
```

The oracle verifies that for each spending profile, the actual #1 card is either in the `expectedTopCards` list or the oracle LLM can explain why a different card won (e.g., a card with enough benefits to offset a lower earn rate).

### Mode C: Insight Coherence Validation

After running `runAllGenerators()` on a fixture set, validate insight quality.

#### Programmatic Checks

```typescript
function validateInsightCoherence(
  insights: InsightCandidate[],
  context: GeneratorContext,
  transactions: GeneratedTransaction[]
): CoherenceResult {
  const failures: string[] = [];

  // ── Check 1: A1 insights reference valid competitor map entries ──
  const a1Insights = insights.filter(i => i.category === "A1");
  for (const insight of a1Insights) {
    const entry = context.competitorEntries.find(
      e => e.plaidMerchantPattern === insight.merchantPattern
    );
    if (!entry) {
      failures.push(`A1 insight references unknown competitor pattern: ${insight.merchantPattern}`);
    }
  }

  // ── Check 2: B1 unused credit insights have actual remaining credit ──
  const b1Insights = insights.filter(i => i.category === "B1");
  for (const insight of b1Insights) {
    const usage = context.benefitUsages.find(u => u.benefitId === insight.benefitId);
    if (usage && usage.amountRemaining <= 0) {
      failures.push(`B1 insight for ${insight.benefitId} but benefit is fully used`);
    }
  }

  // ── Check 3: C1 maxed-benefit insights have 100% usage ──
  const c1Insights = insights.filter(i => i.category === "C1");
  for (const insight of c1Insights) {
    const usage = context.benefitUsages.find(u => u.benefitId === insight.benefitId);
    if (usage && !usage.isFullyUsed) {
      failures.push(`C1 insight for ${insight.benefitId} but benefit is not fully used`);
    }
  }

  // ── Check 4: Dollar amounts in insights match reality ──
  for (const insight of insights) {
    if (insight.dollarImpact !== undefined && insight.dollarImpact < 0) {
      failures.push(`Insight ${insight.dedupKey} has negative dollar impact: ${insight.dollarImpact}`);
    }
  }

  // ── Check 5: No insights for benefits that don't exist on this card ──
  const cardBenefitIds = new Set(context.benefitUsages.map(u => u.benefitId));
  for (const insight of insights) {
    if (insight.benefitId && !cardBenefitIds.has(insight.benefitId)) {
      failures.push(`Insight references non-existent benefit: ${insight.benefitId}`);
    }
  }

  // ── Check 6: A2 recurring detection uses valid recurring groups ──
  const a2Insights = insights.filter(i => i.category === "A2");
  for (const insight of a2Insights) {
    // Verify the merchant actually appears 3+ times with ~30-day spacing
    const merchantTxs = transactions.filter(
      tx => tx._meta.recurringGroupId === insight.merchantPattern
    );
    if (merchantTxs.length < 3) {
      failures.push(
        `A2 insight for "${insight.merchantPattern}" but only ${merchantTxs.length} ` +
        `recurring transactions found (need 3+)`
      );
    }
  }

  return { passed: failures.length === 0, failures };
}
```

#### Coverage Verification

For personas designed to trigger specific insights, verify they actually fire:

```typescript
function validateInsightCoverage(
  insights: InsightCandidate[],
  persona: Persona,
  transactions: GeneratedTransaction[]
): CoverageResult {
  const missing: string[] = [];

  // Benefits marked "never_use" should trigger B1 (unused credit)
  const neverUseBenefits = persona.benefitBehavior
    .filter(b => b.behavior === "never_use")
    .map(b => b.benefitId);

  for (const benefitId of neverUseBenefits) {
    const hasB1 = insights.some(
      i => i.category === "B1" && i.benefitId === benefitId
    );
    if (!hasB1) {
      missing.push(`Expected B1 insight for never-used benefit ${benefitId}`);
    }
  }

  // Benefits marked "always_use" should trigger C1 (maxed)
  const alwaysUseBenefits = persona.benefitBehavior
    .filter(b => b.behavior === "always_use")
    .map(b => b.benefitId);

  for (const benefitId of alwaysUseBenefits) {
    const hasC1 = insights.some(
      i => i.category === "C1" && i.benefitId === benefitId
    );
    // C1 only fires when fully used in current cycle — may not always fire
    // depending on timing, so this is a warning, not a failure
  }

  // Competitor spending should trigger A1
  for (const comp of persona.competitorSpend) {
    if (!comp.recurring) {
      const hasA1 = insights.some(
        i => i.category === "A1" && i.merchantPattern === comp.plaidPattern
      );
      if (!hasA1) {
        missing.push(`Expected A1 insight for competitor merchant ${comp.competitorMerchant}`);
      }
    }
  }

  // Recurring competitor spending should trigger A2
  for (const comp of persona.competitorSpend) {
    if (comp.recurring) {
      const hasA2 = insights.some(
        i => i.category === "A2" && i.merchantPattern === comp.plaidPattern
      );
      if (!hasA2) {
        missing.push(`Expected A2 insight for recurring competitor ${comp.competitorMerchant}`);
      }
    }
  }

  return { passed: missing.length === 0, missing };
}
```

### Vitest Integration

Both tiers integrate into the existing vitest pipeline as additional test suites:

```typescript
// test/integration/generated-fixtures.test.ts

import { describe, it, expect } from "vitest";
import { runMatcher } from "@/lib/engine/matcher";
import { runSimulation } from "@/lib/points/simulator";
import { classifyForPoints } from "@/lib/points/categories";
import { getCardDefinition } from "@/lib/cards";
import { loadFixtures, loadPersona } from "../fixtures/loader";
import { validateMatchesProgram } from "../oracle/programmatic-checks";
import { validatePointsConsistency } from "../oracle/points-checks";
import { validateInsightCoherence, validateInsightCoverage } from "../oracle/insight-checks";

const FIXTURE_CARDS = fs.readdirSync("test/fixtures/generated");

describe("generated fixture tests", () => {
  for (const cardType of FIXTURE_CARDS) {
    const personas = fs.readdirSync(`test/fixtures/generated/${cardType}`)
      .filter(f => f.endsWith(".persona.json"))
      .map(f => f.replace(".persona.json", ""));

    describe(cardType, () => {
      for (const personaName of personas) {
        describe(personaName, () => {
          const { transactions, expected } = loadFixtures(cardType, personaName);
          const persona = loadPersona(cardType, personaName);
          const card = getCardDefinition(cardType);

          it("benefit matching passes programmatic validation", () => {
            const config = buildConfigFromFixture(card, transactions);
            const output = runMatcher(transactions, config);
            const result = validateMatchesProgram(transactions, output, card, persona);

            if (!result.passed) {
              const summary = result.failures
                .map(f => `  ${f.txId}: ${f.check} — ${f.details}`)
                .join("\n");
              expect.fail(`Match validation failed:\n${summary}`);
            }
          });

          it("points classification matches intended categories", () => {
            for (const tx of transactions) {
              const assignment = classifyForPoints(
                tx.merchantName,
                tx.plaidCategoryPrimary,
                tx.plaidCategoryDetailed
              );
              if (tx._meta.intendedCategory !== "other") {
                // For specific category intent, verify correct classification
                expect(assignment.category).toBe(tx._meta.intendedCategory);
              }
            }
          });

          it("edge cases are properly exercised", () => {
            for (const edgeCase of persona.edgeCases) {
              const tagged = transactions.filter(
                tx => tx._meta.edgeCaseTag === edgeCase.type
              );
              expect(tagged.length).toBeGreaterThan(0);
            }
          });
        });
      }
    });
  }

  describe("cross-card consistency", () => {
    it("validates ranking invariants for grocery-heavy profile", () => {
      // Load the grocery optimizer fixture, run simulation with all 30 configs
      // Check invariants
    });

    it("validates ranking invariants for flat-spender profile", () => {
      // ...
    });
  });
});
```

### Running the Full Pipeline

```bash
# Normal dev workflow — runs fast programmatic checks only
npm run test:run

# Generate new fixtures (when card definitions change)
npm run test:generate -- --card amex_platinum
npm run test:generate -- --all

# Run oracle with LLM review (CI or pre-release)
npm run test:oracle

# Check for stale fixtures (CI)
npm run test:check-staleness
```

### Cost Model

| Operation | Model | Tokens | Cost per card | Cost for 30 cards |
|-----------|-------|--------|--------------|-------------------|
| Generate fixtures (1 persona) | Sonnet | ~8K in, ~12K out | ~$0.10 | $3.00 |
| Generate fixtures (2 personas) | Sonnet | ~16K in, ~24K out | ~$0.20 | $6.00 |
| LLM oracle review (Mode A warnings) | Haiku | ~4K in, ~2K out | ~$0.01 | $0.30 |
| LLM oracle review (Mode B spending profiles) | Haiku | ~3K in, ~1K out | ~$0.005 | $0.15 |

**Total one-time generation:** ~$6 for all 30 cards with 2 personas each.
**Per-CI-run oracle cost:** ~$0.45 (Haiku for LLM review of ambiguous cases only).
**Programmatic checks:** $0 (pure vitest, no API calls).
