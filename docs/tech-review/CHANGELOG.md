# Changelog

## Technical Review Implementation — February 2026

A 5-phase security, performance, and accessibility hardening pass based on a comprehensive technical audit of the zurp codebase.

### Phase 1: Security Hardening

**Webhook signature verification** — Plaid webhooks now require HMAC-SHA256 signature validation via the `plaid-verification` header. Sandbox mode logs a warning and allows unsigned requests; production rejects them. Signatures are compared using `crypto.timingSafeEqual()` to prevent timing attacks.

- `src/app/api/plaid/webhook/route.ts` — Rewrote with `verifyWebhookSignature()` function and raw body parsing for signature integrity.

**Timing-safe cron authentication** — The cron sync endpoint previously used a simple string comparison (`!==`) for bearer token validation, which is vulnerable to timing attacks. Replaced with `crypto.timingSafeEqual()`.

- `src/app/api/cron/sync/route.ts` — Added `verifyBearerToken()` using timing-safe comparison.

**Error response sanitization** — All API routes were leaking internal error details (stack traces, DB errors) via `error?.message` in catch blocks. Replaced with generic safe messages across 8 routes.

- `src/lib/api-error.ts` — New utility: `safeErrorResponse()` logs the real error server-side and returns a generic message to clients.
- `src/app/api/benefits/flag/route.ts` — Sanitized POST and DELETE error responses.
- `src/app/api/benefits/redeem/route.ts` — Sanitized POST and DELETE error responses.
- `src/app/api/benefits/confirm/route.ts` — Sanitized error responses.
- `src/app/api/benefits/activate/route.ts` — Sanitized POST and DELETE error responses.
- `src/app/api/plaid/sync/route.ts` — Sanitized error responses.
- `src/app/api/insights/impression/route.ts` — Sanitized error responses.
- `src/app/api/insights/dismiss/route.ts` — Sanitized error responses.

---

### Phase 2: Database Integrity

**Missing indexes** — Added 6 indexes on columns used in frequent WHERE/JOIN clauses that were unindexed, causing full table scans.

- `src/db/schema.ts` — Added indexes on:
  - `accounts.userId`
  - `plaidConnections.userId`
  - `benefitUsage(userId, cardProfileId)` (composite)
  - `transactionFlags(userId, flagType)` (composite)
  - `matchedTx.benefitUsageId`
  - `insightImpressions.insightId`

**N+1 query remediation** — Neon's HTTP driver creates a separate HTTP request per query. Using `Promise.all` with individual UPDATE statements creates parallel HTTP storms that can overwhelm connection limits. Replaced 4 `Promise.all` patterns with sequential `for...of` loops.

- `src/lib/engine/orchestrator.ts` — Fixed 3 N+1 patterns: override updates, benefit usage final state writes, and flag usage updates.
- `src/lib/plaid-sync.ts` — Fixed 1 N+1 pattern: modified transaction updates during sync.

> **Note:** Run `npm run db:generate && npm run db:push` to apply the new indexes.

---

### Phase 3: Input Validation & Authorization

**Validation utilities** — Created a centralized validation module to eliminate ad-hoc checks scattered across routes.

- `src/lib/validation.ts` — New module with `isValidUUID()` (regex-based), `isValidCardType()` (checks against card registry), and `safeJsonParse()` (returns fallback on failure instead of throwing).

**Card type validation** — The `updateCardType` server action accepted arbitrary strings and passed them to the database without checking against known card types.

- `src/lib/actions.ts` — Added `isValidCardType()` guard before `ensureCardSeeded()`.

**Benefit ID type checking** — The redeem endpoint accepted any value for `benefitId` without type validation.

- `src/app/api/benefits/redeem/route.ts` — Added string type check on `benefitId` before database queries.

**Safe JSON parsing** — The redeem DELETE handler used raw `JSON.parse()` on user-influenced data (`overrideNote`), which throws on malformed input and crashes the request.

- `src/app/api/benefits/redeem/route.ts` — Replaced `JSON.parse(usage.overrideNote)` with `safeJsonParse()` using a sensible fallback object.

**Cross-card benefit matching prevention** — The flag route allowed users to manually add a transaction to any benefit, even one belonging to a different card. Added authorization check that validates the benefit's card matches the transaction's card profile.

- `src/app/api/benefits/flag/route.ts` — Added cross-card validation for `flagType === "added"`: looks up the benefit's `cardId` and the transaction's card profile, rejects if they don't match.

---

### Phase 4: Idempotency & Type Safety

**Confirm endpoint idempotency** — The confirm endpoint would insert duplicate `matchedTx` rows if called twice with the same `(transactionId, benefitUsageId)` pair (e.g., due to network retries or double-clicks). Added a check-before-insert that returns the existing record if found.

- `src/app/api/benefits/confirm/route.ts` — Added `findFirst` query before insert; returns existing `creditApplied` value on duplicate.

**Removed unsafe type casts** — The engine code had 5 `as any` casts on `BenefitCycle` values that were unnecessary (the types already align) and suppressed potential type errors.

- `src/lib/engine/matcher.ts` — Removed `benefit.cycle as any` cast (1 location).
- `src/lib/engine/orchestrator.ts` — Removed `benefit.cycle as any` (3 locations) and changed `tx.matchedStatus as any` to `tx.matchedStatus as MatchedStatus` (1 location).

---

### Phase 5: Rate Limiting & Accessibility

**Rate limiting** — Created an in-memory sliding-window rate limiter and applied it to 4 mutation-heavy API routes to prevent abuse.

- `src/lib/rate-limiter.ts` — New module: `createRateLimiter(windowMs, maxRequests)` with automatic stale-entry cleanup. Returns `{ allowed, retryAfterMs }`.
- `src/app/api/plaid/sync/route.ts` — 10 requests/minute per user.
- `src/app/api/benefits/flag/route.ts` — 30 requests/minute per user.
- `src/app/api/benefits/redeem/route.ts` — 30 requests/minute per user.
- `src/app/api/benefits/confirm/route.ts` — 30 requests/minute per user.

All rate-limited routes return `429 Too Many Requests` with a `Retry-After` header.

**Modal accessibility** — The Modal component lacked focus management, trapping, and ARIA attributes, making it unusable for keyboard and screen reader users.

- `src/components/ui/Modal.tsx` — Rewrote with:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
  - Focus trap (Tab/Shift+Tab cycles within modal)
  - Auto-focus first focusable element on open
  - Focus restoration to triggering element on close
  - `aria-label="Close dialog"` on close button

**Input accessibility** — Form inputs had no programmatic association between error messages and the input field.

- `src/components/ui/Input.tsx` — Added `aria-invalid`, `aria-describedby` linking to helper/error text, and `role="alert"` on error messages for live announcements.

**Dropdown keyboard navigation** — The CardSelectorDropdown was mouse-only with no keyboard support.

- `src/components/CardSelectorDropdown.tsx` — Rewrote with full ARIA listbox pattern:
  - Arrow Up/Down to navigate options (wraps around)
  - Enter/Space to select
  - Escape to close and restore focus
  - Home/End to jump to first/last option
  - `role="listbox"`, `role="option"`, `aria-selected`, `aria-activedescendant`
  - Visual focus indicator on the active option
  - Auto-scrolls focused item into view

---

### New Files

| File | Purpose |
|------|---------|
| `src/lib/api-error.ts` | Safe error response utility (logs internally, returns generic message) |
| `src/lib/validation.ts` | Centralized validation: UUID, card type, safe JSON parse |
| `src/lib/rate-limiter.ts` | In-memory sliding-window rate limiter with auto-cleanup |

### Modified Files

| File | Changes |
|------|---------|
| `src/db/schema.ts` | 6 new database indexes |
| `src/lib/engine/orchestrator.ts` | N+1 fixes (3), removed `as any` casts (4) |
| `src/lib/engine/matcher.ts` | Removed `as any` cast (1) |
| `src/lib/plaid-sync.ts` | N+1 fix (1) |
| `src/lib/actions.ts` | Card type validation |
| `src/app/api/plaid/webhook/route.ts` | HMAC-SHA256 signature verification |
| `src/app/api/plaid/sync/route.ts` | Error sanitization, rate limiting |
| `src/app/api/cron/sync/route.ts` | Timing-safe auth, error sanitization |
| `src/app/api/benefits/flag/route.ts` | Error sanitization, rate limiting, cross-card validation |
| `src/app/api/benefits/redeem/route.ts` | Error sanitization, rate limiting, input validation, safe JSON parse |
| `src/app/api/benefits/confirm/route.ts` | Error sanitization, rate limiting, idempotency check |
| `src/app/api/benefits/activate/route.ts` | Error sanitization |
| `src/app/api/insights/impression/route.ts` | Error sanitization |
| `src/app/api/insights/dismiss/route.ts` | Error sanitization |
| `src/components/ui/Modal.tsx` | Focus trap, ARIA dialog, focus restoration |
| `src/components/ui/Input.tsx` | aria-invalid, aria-describedby, role="alert" |
| `src/components/CardSelectorDropdown.tsx` | Keyboard navigation, ARIA listbox pattern |

### Post-Merge Checklist

1. Run `npm run db:generate && npm run db:push` to apply the 6 new indexes
2. Set `PLAID_WEBHOOK_SECRET` environment variable in production for webhook signature verification
3. Run `npm run test:run` to verify all 257 tests still pass
4. Run `npm run build` to confirm production build succeeds
