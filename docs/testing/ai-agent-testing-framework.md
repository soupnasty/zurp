# AI-Agent Testing Framework for zurp

## The Problem

zurp supports 30 credit cards with distinct benefit structures, earn rates, cycle types, and merchant matching rules. Testing the full matrix of card × transaction × benefit × insight interactions is combinatorially expensive, and obtaining real credentials for all 30 cards is impractical. The existing test suite (257 tests across 13 files) provides strong coverage of pure-function logic but has gaps in integration seams, realistic data variety, and regression detection when real-world card programs change.

This document proposes a testing framework that uses AI agents at three levels — synthetic data generation, test oracle / output validation, and exploratory testing — to close these gaps efficiently.

---

## Current State

**What's well-tested:** The pure-function core is solid. The matching engine (`runMatcher`), all 11 cycle types, merchant normalization, 10 insight generators, 5-factor scoring, 20+ templates, display rules, and the points calculator for all 30 earn configs all have dedicated unit tests with factory-pattern fixtures.

**What's not tested:**

| Gap | Risk |
|-----|------|
| DB orchestration (`processTransactionsForConnection`, `generateAndPersistInsights`) | Matching engine works in isolation but integration seams could silently break |
| Plaid sync pipeline (cursor management, webhook handling, reauth flows) | Transaction data could be incomplete or stale without detection |
| Benefit usage lifecycle (accumulation, carryover, cycle rollover) | Users could see incorrect remaining credits |
| Card detection from Plaid metadata | New cards or issuer changes could cause mis-detection |
| Cross-card interaction in comparison (30-card ranking with realistic data) | Simulator could rank incorrectly under real spending distributions |
| Real-world drift (issuers changing benefits, earn rates, merchant categories) | Card configs could become stale without anyone noticing |
| Full-page integration (Track, Compare, Insights pages rendering correct data) | Components could display correct data for one card but break for another |

---

## Architecture Overview

The framework has three agent tiers, each addressing different gaps:

```
┌─────────────────────────────────────────────────────────┐
│                    Tier 3: Explorer                      │
│  Browser-based agent that navigates the app,            │
│  connects mock accounts, and validates UI behavior      │
│  across all 30 cards                                    │
└───────────────────────┬─────────────────────────────────┘
                        │ validates
┌───────────────────────▼─────────────────────────────────┐
│                    Tier 2: Oracle                        │
│  Reviews test outputs, validates benefit matching,      │
│  checks cross-card consistency, flags anomalies         │
└───────────────────────┬─────────────────────────────────┘
                        │ validates
┌───────────────────────▼─────────────────────────────────┐
│                    Tier 1: Generator                     │
│  Creates realistic synthetic transaction histories,     │
│  Plaid API responses, and edge-case scenarios           │
│  for all 30 cards                                       │
└─────────────────────────────────────────────────────────┘
```

Each tier can be used independently. Tier 1 produces test data consumed by existing vitest tests and by Tiers 2-3. Tier 2 can validate any test run output. Tier 3 orchestrates end-to-end scenarios.

---

## Tier 1: Synthetic Data Generation Agent

### Purpose

Generate realistic, card-specific transaction histories that exercise the full benefit and points engine for each of the 30 cards. Replace hand-crafted fixtures with programmatically generated datasets that cover edge cases human testers would miss.

### Approach

Build a **card persona system** — each card gets one or more spending personas that reflect how a real holder of that card would actually spend. An AI agent generates these personas and corresponding transaction streams.

#### Card Persona Definition

```typescript
interface CardPersona {
  cardType: string;                    // e.g., "chase_sapphire_reserve"
  personaName: string;                 // e.g., "frequent_traveler"
  monthlySpendDistribution: {          // spending by earn category
    category: EarnCategory;
    avgMonthly: number;
    variance: number;                  // ± percentage
    merchants: string[];               // realistic merchant names
  }[];
  benefitUsagePatterns: {
    benefitKey: string;
    usageFrequency: "always" | "sometimes" | "never" | "partial";
    typicalAmount?: number;
  }[];
  specialBehaviors?: string[];         // e.g., "uses_travel_portal", "pays_rent_with_bilt"
}
```

#### What the Agent Generates

For each card × persona combination:

1. **12 months of transactions** (~50-200 per month) with realistic merchant names, amounts, Plaid category codes, and dates. The merchant names should include the messy prefixes and suffixes that real Plaid data has (e.g., "SQ *BLUE BOTTLE COFFEE SF", "UBER EATS PENDING", "TST* SWEETGREEN #1042").

2. **Benefit-triggering transactions** — transactions specifically designed to trigger (or nearly trigger) each benefit the card offers. For DoorDash sub-credits, streaming credits, travel credits, etc., the agent generates transactions at the right merchants, in the right amounts, in the right months.

3. **Edge case transactions** — near-cap spending (e.g., $5,990 of $6,000 grocery cap for Amex BCP), cross-midnight transactions for time-window conditions (Citi Nights), month-boundary recurring charges for A2 detection, anniversary fee charges at various points in the year.

4. **Plaid API response fixtures** — complete `transactions.sync` response bodies with cursor pagination, including pending → posted transitions, removed transactions, and account metadata for card detection.

5. **Competitor transactions** — spending at competitor merchants (from the competitor map) that should trigger A1/A2 insights.

#### Implementation

The generator agent reads three inputs for each card: the card definition file (`src/lib/cards/<card>.ts`), the earn config (`src/lib/points/earn-configs/<card>.ts`), and the competitor map entries. It then uses an LLM to produce transaction sets that are both realistic and coverage-maximizing.

The output is a set of JSON fixture files:

```
test/fixtures/generated/
  chase_sapphire_reserve/
    frequent_traveler.transactions.json
    frequent_traveler.plaid_responses.json
    frequent_traveler.expected_benefits.json    # oracle reference
    frequent_traveler.expected_points.json      # oracle reference
    budget_optimizer.transactions.json
    ...
  amex_platinum/
    premium_spender.transactions.json
    ...
```

#### Regeneration Strategy

Fixtures are generated once and committed. They're regenerated when card definitions change (detected by hashing card definition + earn config files) or on-demand. A CI step compares definition hashes to detect stale fixtures.

```bash
npm run test:generate-fixtures          # regenerate all
npm run test:generate-fixtures -- --card chase_sapphire_reserve  # one card
npm run test:check-fixture-staleness    # CI: fail if definitions changed but fixtures didn't
```

---

## Tier 2: Test Oracle Agent

### Purpose

Validate test outputs by reasoning about whether results are correct, consistent, and complete — catching the kinds of subtle bugs that pass assertion-based tests but would be obvious to a domain expert.

### Approach

The oracle agent operates in three modes.

#### Mode A: Benefit Match Validation

After running the matching engine against a generated fixture set, the oracle reviews every match and non-match. For each transaction, it has access to the card's benefit definitions and asks:

- Was this transaction matched to the right benefit? (e.g., a DoorDash order should match the DoorDash credit, not a generic dining credit)
- Was the credit amount correct given current cycle usage?
- Were any transactions incorrectly left unmatched?
- Were any ambiguous transactions flagged that should have been auto-matched?

The oracle outputs a structured validation report:

```typescript
interface OracleReport {
  cardType: string;
  persona: string;
  totalTransactions: number;
  matchedCorrectly: number;
  matchedIncorrectly: { txId: string; expected: string; got: string; reasoning: string }[];
  missedMatches: { txId: string; expectedBenefit: string; reasoning: string }[];
  suspiciousResults: { description: string; severity: "high" | "medium" | "low" }[];
}
```

#### Mode B: Cross-Card Consistency Check

After running the points simulator across all 30 cards for a given transaction set, the oracle checks for consistency anomalies:

- Does a flat 2% card (WF Active Cash) ever rank below a 1x card for general spending? (Should never happen)
- Does the #1 recommended card make intuitive sense for this spending pattern? (A heavy grocery spender should see Amex BCP near the top)
- Are net values monotonically consistent? (A card with strictly better rates and lower fees should always rank higher)
- Do portal mode results make logical sense? (Portal mode should help cards with portal bonuses)

#### Mode C: Insight Coherence Review

After generating insights, the oracle validates:

- Do A1 insights reference real competitor map entries?
- Do B1 "unused credit" insights only fire for benefits with actual remaining credit?
- Do urgency scores correlate with actual days remaining in cycle?
- Are templates rendered with correct dollar amounts and merchant names?
- Does the set of displayed insights follow all display rules (max 3, 1 per benefit, etc.)?

### Implementation

The oracle is invoked as a post-test step. It reads test output JSON files and the card definitions, then produces a validation report. Failed validations are surfaced as test failures.

```bash
npm run test:run                    # normal vitest
npm run test:oracle                 # run oracle on latest test outputs
npm run test:oracle -- --mode B     # just cross-card consistency
```

The oracle uses structured output (JSON schema) to ensure reports are machine-parseable. A thin vitest wrapper converts oracle findings into test assertions:

```typescript
// test/oracle/validate-matches.test.ts
describe("oracle: benefit match validation", () => {
  for (const fixture of allFixtures) {
    it(`validates ${fixture.cardType}/${fixture.persona}`, async () => {
      const matches = runMatcher(fixture.transactions, fixture.config);
      const report = await runOracle("match_validation", { matches, fixture });
      expect(report.matchedIncorrectly).toHaveLength(0);
      expect(report.suspiciousResults.filter(s => s.severity === "high")).toHaveLength(0);
    });
  }
});
```

---

## Tier 3: Exploratory Testing Agent

### Purpose

Autonomously navigate the zurp app in a browser, simulating real user flows across all 30 cards. This catches UI bugs, rendering issues, state management errors, and integration failures that unit tests can't reach.

### Approach

The explorer agent operates against a local dev server with a seeded test database. It uses browser automation (Playwright or similar) and an LLM to decide what to do next, what to verify, and when something looks wrong.

#### Test Scenarios

Each scenario is a multi-step user journey. The agent receives the scenario description and card context, then autonomously navigates, interacts, and validates.

**Scenario 1: First-Time User Onboarding (per card)**
1. Log in → arrive at onboarding
2. Select card type from the picker
3. Connect Plaid (sandbox mode with pre-configured test credentials)
4. Set anniversary date
5. Verify: Track page shows the card's benefits with correct cycle types and amounts
6. Verify: No console errors, no loading spinners stuck, no empty states where data should exist

**Scenario 2: Benefit Tracking Accuracy (per card)**
1. Start with pre-seeded transactions that should trigger specific benefits
2. Navigate to Track page
3. Verify each benefit shows correct usage amount and remaining credit
4. Verify cycle labels are correct (monthly, quarterly, annual, etc.)
5. Verify DoorDash grouping works (for cards with DoorDash sub-credits)
6. Trigger a manual sync and verify counts update

**Scenario 3: Compare Page Ranking (multi-card)**
1. Start with pre-seeded 12-month transaction history
2. Navigate to Compare page
3. Verify all 30 cards appear in simulation results
4. Verify the user's card is tagged and highlighted
5. Toggle portal mode; verify rankings change appropriately
6. Check that stacked bar segments (points/benefits/fees) sum correctly
7. Check Benefits & Perks tab renders perk matrix for all cards

**Scenario 4: Insights Quality (per card)**
1. Seed transactions that should trigger specific insight categories (competitor spend for A1, unused credit for B1, maxed benefit for C1)
2. Navigate to Insights section
3. Verify insights appear with correct copy, amounts, and actions
4. Verify display rules are respected (max 3, no duplicate benefits)
5. Verify insights update after new transaction sync

**Scenario 5: Edge Case Resilience**
1. Card with no transactions → verify empty states
2. Card with transactions but no benefit matches → verify zero-usage display
3. Anniversary date near cycle boundary → verify correct cycle shown
4. Plaid connection in error state → verify health alert banner

#### Validation Strategy

The explorer agent uses two validation approaches:

**Screenshot comparison:** After each step, the agent takes a screenshot and uses vision to assess whether the page looks correct — are numbers present where expected? Are there any error messages? Does the layout look broken? This catches CSS issues, rendering bugs, and visual regressions that DOM-only testing misses.

**DOM assertion:** The agent reads the accessibility tree and validates specific values — the benefit amount shown matches the expected value from the fixture, the card name is correct, the number of insight cards matches expectations.

#### Implementation

The explorer runs against a dedicated test database that's seeded per-scenario. Each card gets its own test user with pre-loaded transactions.

```bash
npm run test:explore                           # all scenarios, all cards
npm run test:explore -- --card amex_platinum    # one card
npm run test:explore -- --scenario onboarding   # one scenario, all cards
```

The explorer produces a report per scenario:

```typescript
interface ExplorerReport {
  scenario: string;
  cardType: string;
  steps: {
    description: string;
    action: string;
    screenshot?: string;           // path to captured screenshot
    domAssertions: { selector: string; expected: string; actual: string; passed: boolean }[];
    visualAssessment: string;      // LLM's assessment of the screenshot
    passed: boolean;
  }[];
  errors: string[];                // console errors, unhandled exceptions
  duration: number;
}
```

---

## Tier 4: Real-World Drift Detection

### Purpose

Detect when card issuers change their benefit programs, earn rates, or merchant partnerships — before users report incorrect tracking.

### Approach

This is a scheduled agent (weekly or monthly) that scrapes authoritative sources and compares them against zurp's card definitions.

#### What It Checks

For each of the 30 cards:

1. **Annual fee** — has it changed? (Source: issuer's product page)
2. **Earn rates** — have bonus categories or rates changed? (Source: issuer's rewards page)
3. **Benefits** — have statement credits been added, removed, or modified? (Source: issuer's benefits page, TPG/NerdWallet card reviews)
4. **Merchant partnerships** — are DoorDash, Uber, streaming, etc. still active? (Source: partner landing pages)

#### Output

A drift report comparing the live source data against the card definition:

```typescript
interface DriftReport {
  cardType: string;
  checkedAt: Date;
  sources: string[];
  drifts: {
    field: string;              // e.g., "annualFee", "benefits.uber_cash.amount"
    currentValue: string;
    detectedValue: string;
    confidence: "high" | "medium" | "low";
    source: string;
    recommendation: string;
  }[];
  noChangeConfirmed: string[];  // fields verified as unchanged
}
```

#### Integration

The drift detector runs as a scheduled CI job. High-confidence drifts create GitHub issues automatically. Medium/low-confidence findings are collected into a weekly digest for manual review.

```bash
npm run test:drift                              # check all cards
npm run test:drift -- --card amex_platinum      # one card
npm run test:drift -- --dry-run                 # report only, no issues
```

---

## Implementation Roadmap

### Phase 1: Generator Foundation (Week 1-2)

Build the card persona system and generate fixtures for 5 representative cards (one from each tier): CSR (tier-1 premium), Amex BCP (tier-0 cash-back), CFF (tier-2 no-fee), Amex Platinum (complex benefits), World of Hyatt (co-brand). Deliverables: persona schema, generator script, 5 card fixture sets, vitest integration consuming generated fixtures.

### Phase 2: Oracle Integration (Week 2-3)

Build the match validation oracle (Mode A) and cross-card consistency checker (Mode B). Run against Phase 1 fixtures. Deliverables: oracle runner, structured report schema, vitest wrapper, CI integration.

### Phase 3: Full Card Coverage (Week 3-4)

Extend generator to all 30 cards with at least 2 personas each. Expand oracle to cover insights (Mode C). Deliverables: 60+ fixture sets, full oracle coverage.

### Phase 4: Explorer Agent (Week 4-6)

Build browser-based explorer for Scenarios 1-3. Requires test database seeding infrastructure and Plaid sandbox configuration per card. Deliverables: explorer agent, 3 scenario scripts, per-card reports.

### Phase 5: Drift Detection (Week 6-8)

Build web scraping agent for the top 10 highest-value cards. Expand to all 30 over time. Deliverables: drift checker, scheduled CI job, GitHub issue automation.

---

## Cost and Efficiency Considerations

AI agent testing introduces API costs. Here are strategies to keep them manageable.

**Tiered execution:** Tier 1 (generation) runs only when card definitions change. Tier 2 (oracle) runs on every test suite execution but uses a small/fast model for structured validation. Tier 3 (explorer) runs nightly or on PR branches touching card/engine/points code. Tier 4 (drift) runs weekly.

**Caching:** Generated fixtures are committed to the repo, so generation cost is one-time per card change. Oracle reports for unchanged fixtures are cached.

**Model selection:** The generator needs a capable model (Claude Sonnet or better) for realistic transaction data. The oracle can use a smaller model since it's doing structured validation against known schemas. The explorer needs a capable model for vision-based validation. The drift detector can use a smaller model for structured web scraping.

**Estimated monthly cost (30 cards, active development):**

| Tier | Frequency | Est. tokens/run | Monthly cost |
|------|-----------|-----------------|--------------|
| Generator | ~2×/month | 500K | ~$5 |
| Oracle | ~60×/month (CI) | 200K | ~$15 |
| Explorer | ~20×/month (nightly) | 1M | ~$30 |
| Drift | 4×/month | 300K | ~$5 |
| **Total** | | | **~$55/month** |

---

## Appendix: Interface Contracts

These are the key pure-function interfaces that the framework exercises. All are importable and testable without DB access.

**Matching engine:**
```
runMatcher(transactions: MatcherTransaction[], config: MatcherConfig) → MatcherOutput
```

**Insight generators:**
```
generate<Category>(ctx: GeneratorContext) → InsightCandidate[]
```

**Points calculator:**
```
calculatePointsForTransaction(tx, earnConfig, capState) → { points, value, ... }
```

**Points simulator:**
```
runSimulation(input: SimulationInput) → ComparisonOutput
```

**Category mapper:**
```
classifyTransaction(tx) → CategoryAssignment
```

Each tier of the framework plugs into these interfaces, either feeding them synthetic data (Tier 1), validating their outputs (Tier 2), or testing them through the UI layer that calls them (Tier 3).
