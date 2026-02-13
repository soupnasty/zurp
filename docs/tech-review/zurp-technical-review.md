# ZURP — Technical Review & Code Quality Audit

**February 13, 2026**

---

## Executive Summary

This report presents the findings of a comprehensive technical review of the zurp codebase, a credit card benefits tracker built on Next.js 16, Drizzle ORM, and Neon Postgres. The audit covered five areas: database layer, core engines, API security, UI components, and general code health.

The codebase is well-architected with clean separation between pure logic engines and database integration layers. The 257-test suite covers core matching and simulation logic thoroughly. However, the review identified 80+ specific issues across all layers that will compound as user volume grows.

**Critical issues (12):** Missing database indexes, N+1 query patterns, no webhook signature verification, no rate limiting, timing-attack-vulnerable cron auth.

**High issues (18):** No database transactions for multi-step writes, silent error swallowing in orchestrator, CSRF gaps, error message information disclosure, missing input validation.

**Medium issues (30+):** Unbounded queries, hardcoded thresholds, type safety bypasses, component duplication, accessibility gaps, missing test coverage for critical modules.

**Low issues (20+):** Console.log in production, inline styles, connection pooling, column type oversizing.

| Category | Issues | Severity | Key Concern |
|----------|--------|----------|-------------|
| Database & Queries | 16 | **Critical** | Missing indexes, N+1 queries, no transactions |
| API Security | 14 | **Critical** | No webhook verification, no rate limiting |
| Core Engine Quality | 15 | **High** | 457-line functions, `as any` casts, silent failures |
| UI Components | 25 | **Medium** | 2,196-line page, duplicated patterns, a11y gaps |
| Code Health | 12 | **Medium** | Test gaps, inconsistent error handling |

---

## 1. Database Layer

The database layer uses Drizzle ORM with Neon Postgres over HTTP. While the schema covers 17 tables with appropriate relations, several performance and reliability issues will surface under load.

### 1.1 Missing Indexes

Six tables are missing indexes on columns that are filtered in hot-path queries. These will cause full table scans as data grows.

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **Critical** | `plaidConnections.userId` missing index | `db/schema.ts:123-142` | Queried on every sync and dashboard load. No user-level index exists despite frequent lookups. |
| **Critical** | `transactionFlags` missing composite index | `db/schema.ts:247-276` | Filtered by `(userId, flagType)` during every match cycle. Only has a unique constraint, no query index. |
| **High** | `matchedTx.benefitUsageId` missing index | `db/schema.ts:278-300` | Joined from benefitUsage lookups. Only the unique constraint on `(transactionId, benefitUsageId)` exists. |
| **High** | `accounts.userId` missing index | `db/schema.ts:34-54` | NextAuth accounts table lacks user-level index for manual queries. |
| **Medium** | `benefitUsage` missing compound index | `db/schema.ts:209-245` | Queried by `(userId, cardProfileId)` in orchestrator and queries.ts. Compound index would help. |
| **Medium** | `insightImpressions.insightId` missing index | `db/schema.ts:361-372` | Foreign key exists but no index for impression lookups by insight. |

### 1.2 N+1 Query Patterns

Multiple locations use `Promise.all()` with individual UPDATE statements per record, generating N database round-trips instead of a single batch operation.

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **Critical** | benefitUsage updates in `Promise.all` | `orchestrator.ts:245-257` | One UPDATE per usage record. With 21 benefits (Amex Platinum), this is 21 round-trips per sync. |
| **Critical** | Same pattern repeated for overrides | `orchestrator.ts:128-144` | Override updates also use per-record `Promise.all` pattern. |
| **High** | Modified transaction updates | `plaid-sync.ts:110-135` | Individual UPDATE per modified transaction. Plaid can return 500+ per batch. |

### 1.3 Transaction Safety

The core `processTransactionsForConnection()` function performs 10+ sequential database operations without any transaction wrapper. If any intermediate step fails, the database state becomes inconsistent: matched transactions might be written but usage records not updated, or vice versa.

- Phase 1: Insert matchedTx records
- Phase 2: Update transaction statuses to "matched"
- Phase 3: Update benefitUsage amounts
- Phase 4: Generate insights

If Phase 2 fails after Phase 1 succeeds, orphaned matchedTx records exist. If Phase 3 fails, usage records are stale and the next sync will re-match the same credits.

### 1.4 Unbounded Queries

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **Medium** | Debug report fetches all transactions | `debug-report.ts:75` | No LIMIT or date filter. Could load 100K+ rows for active connections. |
| **Medium** | benefitUsage fetches all history | `orchestrator.ts:94-99` | Loads all usage records for a user+card without period filtering. Multi-year history could mean thousands of records. |
| **Medium** | LIKE query on dedupKey | `insights/queries.ts:49-63` | ROI milestone lookup uses LIKE pattern match which cannot use existing indexes. |

---

## 2. API Security & Reliability

The API layer handles Plaid integration, benefit operations, and cron scheduling. Several security-critical gaps exist.

### 2.1 Authentication & Authorization

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **Critical** | Plaid webhook has no signature verification | `api/plaid/webhook/route.ts:7-74` | Accepts POST requests without HMAC-SHA256 verification. Attackers can forge sync requests, modify connection status, or cause DoS. |
| **Critical** | Cron endpoint vulnerable to timing attacks | `api/cron/sync/route.ts:12-17` | Bearer token uses string `!==` comparison. Attackers can guess tokens character by character. Should use `crypto.timingSafeEqual()`. |
| **High** | No CSRF protection on state-changing routes | All POST routes | No CSRF tokens visible. Relies on framework defaults. Explicit `SameSite=Strict` and CSRF tokens recommended. |
| **Medium** | Cross-card benefit matching possible | `api/benefits/confirm/route.ts:24-35` | User ownership is checked, but a user could match a transaction from Card A to a benefit from Card B. |

### 2.2 Rate Limiting & Input Validation

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **Critical** | No rate limiting on any endpoint | All API routes | Users can spam `/api/plaid/sync` (exhausting Plaid quota), or flood benefit endpoints causing DB load. |
| **High** | benefitId not format-validated | `api/benefits/redeem/route.ts:18` | Accepted from request body without UUID format check. Could accept malicious input. |
| **High** | cardType not validated against known cards | `lib/actions.ts:32-59` | `updateCardType` accepts any string. `ensureCardSeeded()` called with unvalidated input. |
| **Medium** | Transaction query params loosely validated | `api/transactions/route.ts:12-15` | `limit`/`offset` accept NaN, Infinity, negative floats. `connectionId` not validated as belonging to user. |

### 2.3 Error Handling & Information Disclosure

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **High** | Raw error messages exposed to client | `api/benefits/flag/route.ts:141` | `error?.message` passed directly to response. Could expose DB column names, SQL errors. |
| **Medium** | Inconsistent error patterns across routes | All API routes | Some use generic messages, some expose `error.message`, some log full stack traces. No centralized error handler. |
| **Medium** | Missing idempotency on manual match creation | `api/benefits/confirm/route.ts:56` | No duplicate check before insert. Retried requests create duplicate matches. |
| **Low** | `JSON.parse` without try-catch | `api/benefits/redeem/route.ts:251` | Parsing `overrideNote` without error handling. Corrupted data throws unhandled exception. |

---

## 3. Core Engine Code Quality

The three core engines (matching, insights, points) use a clean pure-function architecture. However, the orchestrator that bridges them to the database has accumulated significant complexity.

### 3.1 Function Complexity

The `processTransactionsForConnection()` function in the engine orchestrator is **457 lines long** and handles anniversary detection, usage initialization, override replay, auto-matching, flag replay, points computation, and insight generation. It should be decomposed into phase functions.

- Lines 84–144: Override replay loop (57 lines)
- Lines 185–229: Match processing phase (45 lines)
- Lines 289–415: Manual flags replay (127 lines, essentially a sub-orchestrator)

The `getInsightsForDisplay()` function in the insights orchestrator (lines 232–368) performs 10 distinct operations: filtering, mutual exclusion, per-benefit dedup, scoring, priority sorting, C0 pinning, Group C reservation, slot filling, database updates, and impression recording.

### 3.2 Type Safety Bypasses

Five locations use `as any` to cast BenefitCycle types, bypassing TypeScript safety entirely. The cycle type union is well-defined and should be preserved through the call chain with proper type guards.

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **High** | BenefitCycle cast to `any` (5 locations) | `matcher.ts:74`, `orchestrator.ts:199,308,496,593` | Bypasses type checking for cycle type union. Should use type guard function instead. |
| **Medium** | CategoryAssignment lacks validation | `points/categories.ts:81-133` | `matchMerchant()` return not validated as valid EarnCategory before use. |
| **Medium** | Cap tracking silent failure | `points/simulator.ts:204-208` | If `capApplied` is true but cap config not found, `capNote` silently stays null. |

### 3.3 Error Resilience

The orchestrator wraps points computation and insight generation in try-catch blocks that log and continue. While preventing total failure, this means users can see stale data without any indication that processing partially failed. No structured error return, no circuit-breaker, no retry logic.

### 3.4 Performance Concerns

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **High** | O(n×m) cycle bounds calculation | `orchestrator.ts:473-522` | For Amex Platinum (21 benefits) × 12 tx dates = 252 `getCurrentCycleBounds()` calls. Should cache by `(cycle, date)`. |
| **Medium** | Sequential category classification | `spending/categories.ts:77-109` | O(n) linear scan of `CATEGORY_MAPPINGS` for every transaction. Should build lookup map at module init. |

### 3.5 Code Duplication

Merchant pattern matching logic is duplicated across four modules: the engine matcher, points calculator, and two insight generators (A1, A2). The matching implementation in the insight generators rebuilds the same string-includes logic rather than importing it from `normalize.ts`.

Insight generator template variable assembly is repeated between C0 (value snapshot) and C2 (ROI milestone), with near-identical code for computing totals, checking points data, and selecting template keys.

### 3.6 Hardcoded Thresholds

Scoring thresholds, percentage cutoffs, and interval ranges are hardcoded as magic numbers throughout the insights engine. These should be extracted to a configuration object for testability and tuning.

- Dollar impact: $300/$150/$50 thresholds in `scoring.ts`
- Urgency: 7/30/90 day thresholds in `scoring.ts`
- B1 unused: 25% threshold, B3 underused: 75% threshold
- A2 recurring detection: 20% amount variance, 25–35 day interval range

---

## 4. UI Components & Frontend

The frontend uses a dark-first design system with Tailwind CSS v4 and Lucide React icons. The design tokens in `globals.css` are well-organized. However, several components have grown unwieldy and share duplicated patterns.

### 4.1 Oversized Components

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **High** | Landing page: 2,196 lines | `app/page.tsx` | Contains 3 duplicated icon systems, hardcoded demo data arrays, and inline SVG definitions. Should split into TrackerSection, CompareSection, InsightSection. |
| **High** | BenefitRow: 766 lines | `dashboard/BenefitRow.tsx` | Contains BenefitIcon, BenefitDetail sub-components, inline status config, and 40+ inline style objects. Should be 3 separate files. |
| **Medium** | ProcessingReveal: 1,011 lines | `onboarding/ProcessingReveal.tsx` | Monolithic reveal animation component. Could decompose into phase-specific sub-components. |

### 4.2 Component Duplication

- **Confirmation dialog:** `RemoveCardButton.tsx` and `UnlinkButton.tsx` share identical 2-button confirmation UI. Should extract to a reusable `ConfirmationPrompt` component.
- **Inline gradients:** Settings page repeats the same gradient style object 3 times (lines 60–64, 170–174, 267–272) instead of using the `--gradient-top-bar` CSS variable already defined in `globals.css`.
- **Icon systems:** Landing page defines 3 separate SVG icon approaches (TrackerIcon, InsightIcon, trust bar) with 90% duplicate code, while the rest of the app uses Lucide React.
- **Card selection buttons:** Onboarding `CardSelection.tsx` duplicates button styling between detected and other card buttons with only 2–3 class differences.
- **Settings row containers:** Three sections repeat the same flex/border/hover layout with 95% identical styling.

### 4.3 Accessibility Gaps

| Severity | Issue | Location | Description |
|----------|-------|----------|-------------|
| **High** | Modal missing focus trap | `components/ui/Modal.tsx` | No focus trap, no focus restoration, close button lacks `aria-label`, missing `role="dialog"` on content div. |
| **High** | Input missing `aria-describedby` | `components/ui/Input.tsx:16-48` | Error/helper text not linked to input via `aria-describedby`. Screen readers cannot associate errors. |
| **High** | Dropdown missing keyboard navigation | `CardSelectorDropdown.tsx` | Click-outside handler present but no arrow key navigation between options. |
| **Medium** | BenefitRow expand state not announced | `BenefitRow.tsx:357-361` | ChevronDown rotates on expand but no `aria-expanded` attribute on trigger button. |
| **Medium** | Leaderboard lacks table semantics | `Leaderboard.tsx:54-140` | Grid divs used for tabular data. Screen readers interpret as plain divs, not a data table. |
| **Medium** | ProgressBar missing `aria-label` | `ProgressBar.tsx:31-35` | Has role but no label describing what is being measured. |

### 4.4 Performance Optimization

- `BenefitRow` is not wrapped in `React.memo`. If the parent re-renders, all BenefitRow children recalculate, even if their props are unchanged.
- `StackedBar` in Leaderboard is not memoized. Sorting state changes trigger all children to recalculate.
- `MONTH_ABBREVS` array is created inside `getCycleLabel()` on every call instead of being defined at module scope.
- Settings page creates identical gradient style objects on every render instead of using module-level constants.
- `OnboardingWizard` is fully client-side (`"use client"`) but could be split: server wrapper for data fetching, client component only for Plaid interaction.

---

## 5. Code Health & Testing

### 5.1 Test Coverage Gaps

While the 257-test suite thoroughly covers the matching engine, cycle utilities, insights generators, and points calculator, several critical modules have zero test coverage:

- `plaid-sync.ts` — Shared sync logic called from 3 entry points (API, webhook, cron)
- `auth-helpers.ts` — `getAuthUser()`, `requireAuth()` used by every protected route
- `actions.ts` — Server actions for card type updates and card removal
- `queries.ts` — Complex database queries powering the dashboard
- `encryption.ts` — AES-256-GCM encryption for Plaid access tokens
- All 30 earn-config files — Individual card earning rate definitions
- All API route handlers — Zero endpoint-level tests

### 5.2 Type Safety

The codebase has 20+ locations using `: any` in catch blocks across API routes. While this is a common TypeScript pattern, it reduces type safety for error handling. The `auth.ts` file uses 5 `as any` casts to work around Drizzle adapter type incompatibilities.

### 5.3 Inconsistencies

- `STALE_THRESHOLD_HOURS` is 24 in `notifications.ts` but 6 in `cron/sync/route.ts`. These serve different purposes (alerting vs. re-syncing) but should be explicitly documented to avoid confusion.
- Error handling varies across API routes: some use generic messages, some expose `error.message`, some log full stack traces. No centralized error handling middleware exists.
- `console.log` statements remain in `plaid-sync.ts` and the webhook handler. Should use structured logging.

### 5.4 Edge Cases

- **Anniversary date on February 29:** No handling for leap year boundaries in `cycle-utils.ts`. `Date` constructor behavior is undefined for Feb 29 in non-leap years.
- Free cards skip anniversary detection entirely (only runs when `annualFee > 0`), but anniversary-based cycle calculations still fall back silently to calendar year.
- **Missing cascade delete on `insights.benefitId`:** If a benefit is deleted, insight rows are orphaned (`RESTRICT` default).

---

## 6. Prioritized Recommendations

### 6.1 Immediate (Security)

- **Add Plaid webhook signature verification.** Without this, any attacker can forge sync requests or manipulate connection status.
- **Implement rate limiting.** Even a simple in-memory sliding window on `/api/plaid/sync` and benefit endpoints prevents quota exhaustion and DoS.
- **Fix cron endpoint timing attack.** Replace string `!==` with `crypto.timingSafeEqual()` for bearer token comparison.
- **Sanitize error responses.** Replace `error?.message` in client responses with generic messages. Log details server-side only.

### 6.2 Short-Term (Performance)

- **Add missing database indexes.** Six indexes needed on hot-path query columns. Immediate impact on dashboard load times.
- **Batch N+1 updates.** Replace `Promise.all` individual UPDATEs with batch operations (Drizzle supports SQL template literals for batch updates).
- **Wrap multi-step writes in transactions.** At minimum, the match-write phase (matchedTx insert, transaction status update, usage update) should be atomic.
- **Add date-range filters to unbounded queries.** Debug report and benefitUsage fetches should limit to relevant periods.

### 6.3 Medium-Term (Quality)

- **Decompose orchestrator.** Split the 457-line `processTransactionsForConnection()` into phase functions: `processAnniversary()`, `replayOverrides()`, `processAutoMatches()`, `replayManualFlags()`.
- **Extract shared utilities.** Merchant pattern matching, confirmation dialogs, inline gradient styles, and icon systems should each have a single source of truth.
- **Add input validation layer.** Use Zod schemas for request body and search parameter validation across all API routes.
- **Fix accessibility gaps.** Focus trap on Modal, `aria-describedby` on Input, keyboard navigation on CardSelectorDropdown, and `aria-expanded` on BenefitRow.
- **Expand test coverage.** Prioritize `plaid-sync.ts`, `encryption.ts`, and `auth-helpers.ts`. Add integration tests for at least the top 5 API routes.

### 6.4 Long-Term (Architecture)

- **Extract configuration.** Scoring thresholds, percentage cutoffs, and detection intervals should live in a configuration object, not inline magic numbers.
- **Refactor large components.** Split the 2,196-line landing page and 766-line BenefitRow into focused sub-components. Add `React.memo` where appropriate.
- **Implement structured logging.** Replace `console.log`/`error` with a structured logger that tags phase, userId, and error codes for observability.
- **Consider connection pooling.** The Neon HTTP client creates a new HTTP request per query. For cron jobs syncing many users, a persistent connection pool would reduce latency.
