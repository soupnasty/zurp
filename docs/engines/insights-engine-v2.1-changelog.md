# Insights Engine v2.1 — Changelog

## Bug Fixes

**C2: Milestone iteration order** — The MILESTONES array was iterated forward (50% → 200%) with an early `break`, causing the generator to emit the *lowest* reached milestone instead of the highest. A user at 175% ROI would get a "50% milestone" insight. Fixed by iterating in reverse so the highest reached milestone is emitted first.

**A1: Dollar amount inflation** — `dollarAmount` was set to total competitor spend rather than recoverable credit. A user who spent $200 at Uber with only $10 remaining on their Lyft credit would score as a $200 insight. Fixed with `Math.min(amount, remaining)` so the score reflects what the user can actually recover.

**B2: Inconsistent close thresholds** — DoorDash display groups used a hardcoded `remaining <= 5` threshold while individual benefits used `remaining <= 25`. A $300 hotel credit and a $10 Lyft credit both triggered "close" at the same dollar amount. Normalized to percentage-based: `Math.round(credit * 0.2)` for both paths.

## Scoring Calibration

**Urgency: ongoing cost sentinel** — A2 subscription swap insights had `daysRemaining: null`, scoring urgency at 20 (same as "no expiration"). But a user paying $16/mo for Netflix when they have a free streaming benefit has real ongoing urgency. Added a `-1` sentinel value that maps to urgency score 45, sitting between "no expiration" (20) and "> 90 days" (50). Both A2 branches now emit `daysRemaining: -1`.

**Novelty: gradient for 1–30 day range** — The novelty function had a dead zone: an insight shown once between 1–30 days ago fell through to `return 20`, the same score as "shown 2+ times recently." Added a tier at `daysSinceLast >= 7 → 40` so the progression is 0 → 20 → 40 → 60 instead of 0 → 20 → 60.

**Floor override: clarifying comment** — Added documentation that P2 maps to Group A (eligible for floor override) while P1 maps to Group C (not eligible), since this isn't obvious from the `isFloorOverride` function signature.

## Architecture

**Multi-card generation** — The orchestrator previously picked a single "active" card profile. Now it loops over all card profiles for a user, running every generator per card. Supersession is scoped to `cardProfileId` so insights from one card don't overwrite another's.

**Query batching** — Replaced per-row DB calls with batch operations. `getExistingInsightsByUser` fetches all existing insights for a user in one query and returns a `Map<dedupKey, insight>`. `markInsightsShown` and `recordImpressions` accept arrays and execute single batch queries. Impression history and existing insights are fetched once (user-wide) and reused per card in the generation loop.

**Expiration unification** — `expireStaleInsights` was two separate queries for pending and shown states. Combined into a single query with `IN ('pending', 'shown')` and a 90-day cutoff.

**Dismissed insight cleanup** — New `cleanupDismissedInsights` function auto-prunes dismissed insights older than 90 days. Called at the start of each generation run. The persist loop also skips re-generating insights that are currently dismissed.

## New Features

**B4: Benefit Renewal Reminder** — New generator that fires in the last 7 days of a benefit period for credits ≥ $50 with ≥ 50% usage. Two templates: `b4_renewing` ("Your $200 Hotel Credit renews in 5 days") and `b4_maxed_renewing` ("Nice — you maxed Hotel Credit. It renews in 3 days"). Dedup key: `b4:{benefitId}:{periodKey}`. This complements B1 (unused credits) by covering the opposite case — credits that were well-used and are about to reset.

**P2: Scenario configuration** — Extracted P2 scenarios from inline constants into a declarative `p2-scenarios.ts` file. Expanded from 5 to 12 scenarios covering Chase (CSR, CSP), Amex (Platinum, Gold), Capital One (Venture X, Venture), Citi (Strata Elite, Strata Premier), and Bilt (Palladium). Added car rental portal scenario for Capital One. Adding a new P2 scenario is now a single config object instead of touching generator logic.

**Client-side impression tracking** — New `useInsightImpression` React hook using Intersection Observer (50% threshold, fire-once). Sends a POST to `/api/insights/impression` when an insight card scrolls into view. The API endpoint validates auth, verifies the insight belongs to the user, and inserts an impression record. This replaces the server-side impression recording in `getInsightsForDisplay` with accurate viewport-based tracking.

## Tests

**Updated existing tests** — Fixed A1 `dollarAmount` assertions (30 → 10, 35 → 10) to reflect the `Math.min` cap. Fixed urgency score test for `-1` (was 0, now 45). Added novelty gradient tests for the 7–30 day tier.

**New generator tests** — 5 tests for B4: generates for high-value credit with ≥ 50% usage, uses `b4_maxed_renewing` for fully used benefits, skips low-value credits, skips > 7 days remaining, skips < 50% usage. 1 test for C2 highest milestone selection (ratio 1.75 → picks 150pct, not 50pct).

**New template tests** — `b4_renewing` and `b4_maxed_renewing` rendering. Updated `getTemplateKeys` count assertion from ≥ 27 to ≥ 29.

**Display rules test suite** — 12 new tests covering: score floor filtering (with and without floorOverride), max 1 per benefit dedup, A1/P2 mutual exclusion (same merchant filtered, different merchant kept), Group A outranks Group B within 10 points, C0 pending always first, Group C slot reservation, max output cap, and `insightGroup` mapping for all categories including B4.

## Design Document

**Cross-card insights (A3)** — Design-only document at `docs/engines/cross-card-insights-design.md`. Describes a future generator that compares spending across linked cards to surface optimization opportunities (e.g., "groceries on CSR at 1x when Amex Gold earns 4x"). Includes algorithm, templates, scoring approach, orchestrator integration plan, and open questions. Deferred to a future phase.

## Files

New files: `generators/b4-benefit-renewal.ts`, `generators/p2-scenarios.ts`, `components/useInsightImpression.ts`, `app/api/insights/impression/route.ts`, `__tests__/display-rules.test.ts`, `docs/engines/cross-card-insights-design.md`

Modified files: `generators/c2-roi-milestone.ts`, `generators/a1-competitor-redirect.ts`, `generators/b2-nearly-maxed.ts`, `generators/a2-subscription-swap.ts`, `generators/index.ts`, `scoring.ts`, `orchestrator.ts`, `queries.ts`, `templates.ts`, `types.ts`, `__tests__/generators.test.ts`, `__tests__/scoring.test.ts`, `__tests__/templates.test.ts`
