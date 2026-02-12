# zurp — Credit Card Benefits Tracker

## Project Overview

A credit card benefits tracker that syncs transactions via Plaid, matches them against card-specific benefit rulesets, and shows users which credits they've used, which are expiring, and whether each card is paying for itself. Supports Chase Sapphire Reserve, Chase Sapphire Preferred, Amex Gold, Amex Platinum, Citi Strata Elite, Capital One Venture X, and Robinhood Gold.

## Tech Stack

- **Framework**: Next.js 16 (App Router, `src/` dir)
- **ORM**: Drizzle (`drizzle-orm/neon-http`)
- **Database**: PostgreSQL on Neon
- **Auth**: NextAuth v5 beta (`next-auth@5`) + Resend (magic link)
- **Styling**: Tailwind CSS v4 (CSS-based config, NOT `tailwind.config.ts`)
- **Icons**: Lucide React
- **Bank Link**: Plaid (sandbox mode)
- **Testing**: Vitest
- **Hosting**: Vercel

## Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test:run     # Run all tests (257 tests across 13 files)
npm run db:push      # Push schema to Neon
npm run db:seed      # Seed cards + benefits + competitor map from registry
npm run db:studio    # Open Drizzle Studio
```

## Architecture

### Design System (Tailwind v4)

Tailwind v4 uses CSS-based config via `@theme inline` in `src/app/globals.css` — there is NO `tailwind.config.ts`. All design tokens (colors, typography, spacing, shadows, motion) are CSS custom properties defined in `globals.css`.

Brand palette is dark-first:
- Void `#0D1117` (background), Surface `#161B22` (cards), Border `#30363D`
- Frost `#E6EDF3` (text), Muted `#484F58` (secondary text)
- Signal `#58A6FF` (accent), semantic colors for success/warning/danger/info
- Typography: Inter (body) + JetBrains Mono (data/numbers via `.font-data` class)
- Uppercase labels: `.label-caps` utility class
- 4px base spacing unit, glow shadows, `ease-out-expo` easing

See `docs/styling/style-guide.md` for full brand reference.

### Lazy Initialization Patterns

**Critical**: Both the DB client and NextAuth config use lazy initialization to allow Next.js builds without environment variables:

- **DB** (`src/db/index.ts`): Returns a Proxy stub when `DATABASE_URL` is missing. Real client created on first use.
- **Auth** (`src/lib/auth.ts`): Uses a `getAuth()` memoized factory. `DrizzleAdapter` gets its own `createAuthDb()` to avoid Proxy type issues. Exported `handlers`, `auth`, `signIn`, `signOut` are wrapper functions.
- Pages that need DB at render time use `export const dynamic = "force-dynamic"` to prevent static prerendering.

### Core Engine (`src/lib/engine/`)

Pure-function matching engine with no DB dependencies:
- `cycle-utils.ts` — Date math for 11 cycle types (monthly, biannual_h1/h2, quarterly_q1/q2/q3/q4, annual_calendar, annual_anniversary, quadrennial, subscription)
- `normalize.ts` — Merchant name normalization (lowercase, strip order numbers/trailing IDs)
- `matcher.ts` — Priority-based transaction matching, DoorDash sub-credit depletion, negative matching for travel credit
- `anniversary-detector.ts` — Detects annual fee charge to determine card anniversary date
- `orchestrator.ts` — DB integration layer connecting engine to Drizzle

### DoorDash Grouping

DoorDash has 3 separate sub-credits ($5/$10/$10) tracked internally but displayed as a single $25/month card in the UI. Grouping uses `displayGroup`, `displayGroupName`, and `displayGroupIcon` fields on benefits. The `groupBenefits()` function in the dashboard page handles this.

### Insights Engine v2 (`src/lib/insights/`)

Persistent, scored insight system with 8 categories across 3 groups:

- **Group A — Competitor Redirects**: A1 (one-time competitor spend), A2 (recurring subscription swap)
- **Group B — Benefit Optimization**: B1 (unused credit), B2 (nearly maxed), B3 (underused credit)
- **Group C — Positive Reinforcement**: C0 (first-connect value snapshot), C1 (benefit maxed), C2 (ROI milestone)

**Architecture** (three layers, mirrors the engine pattern):
```
src/lib/insights/
  generators/              ← Pure functions, no DB (like matcher.ts)
    a1-competitor-redirect.ts
    a2-subscription-swap.ts
    b1-unused-credit.ts
    b2-nearly-maxed.ts
    b3-underused-credit.ts
    c0-value-snapshot.ts
    c1-benefit-maxed.ts
    c2-roi-milestone.ts
    index.ts               ← Registry, runAllGenerators()
    types.ts               ← GeneratorContext, InsightGenerator
  scoring.ts               ← 5-factor weighted scoring (pure)
  templates.ts             ← ~20 copy templates + interpolation
  orchestrator.ts          ← DB bridge: persist, display, expire
  queries.ts               ← Server-only DB queries
  types.ts                 ← InsightCandidate, ScoredInsight, etc.
  __tests__/               ← 50 tests (scoring, templates, generators)
```

**Scoring**: 5-factor weighted composite — dollar_impact (0.35), urgency (0.25), actionability (0.20), novelty (0.10), confidence (0.10). Floor override: if dollar_impact ≥ 80 AND urgency ≥ 80 for Group A/B, always shown.

**Lifecycle**: `pending` → `shown` → `expired` | `superseded`. Dedup via unique `(userId, dedupKey)` constraint; existing insights update-in-place preserving state/generatedAt/shownAt.

**Display rules** (in `getInsightsForDisplay`): Score floor ≥ 30, max 1 per benefit, at least 1 Group C if available, A outranks B within 10 points, C0 always first, max 3 per page.

**DB tables**: `insights`, `insight_impressions`, `competitor_map`. Competitor map seeded from `db:seed` (~50 CSR entries).

**Integration points**:
- `generateAndPersistInsights(userId)` called after `processTransactionsForConnection()` in engine orchestrator
- `getInsightsForDisplay(userId, surface, max)` called in benefits page
- `expireStaleInsights(userId)` called in cron job

### Points Earn Model (`src/lib/points/`)

On-demand simulation engine that answers "which card earns the most for your actual spending?"

- **Category mapper** (`categories.ts`): 3-tier classification — merchant name match → Plaid category fallback → `other`. Uses 26-category taxonomy separate from the 8-category spending system.
- **Merchant map** (`merchant-map.ts`): ~200 static merchant→category entries with priority-based matching.
- **Earn configs** (`earn-configs/`): Per-card earn rate definitions (bonus categories, caps, conditions, point valuations). Files: `chase-sapphire-reserve.ts`, `chase-sapphire-preferred.ts`, `amex-gold.ts`, `amex-platinum.ts`, `citi-strata-elite.ts`, `capital-one-venture-x.ts`, `robinhood-gold.ts`.
- **Calculator** (`calculator.ts`): Per-transaction points calculation with cap tracking. Supports `time_window` conditions for time-based earn rates (e.g., Citi Nights).
- **Simulator** (`simulator.ts`): Full pipeline — classify → calculate per card → aggregate → compute net value (points + benefits - fee). Supports `portalMode` to reclassify travel as `travel_portal`.
- **Perk matrix** (`perk-matrix.ts`): Static benefit comparison data for the Benefits & Perks tab (7 cards).
- **Queries** (`queries.ts`): Server-only DB queries for transaction data (includes `datetime` for time-window matching).
- **Orchestrator** (`index.ts`): `computeComparison(userId, options?)` — main entry point called from the compare page. Accepts `{ portalMode?: boolean }`.

No new DB tables — computed on-demand from existing transaction data.

### Card Registry

Card definitions live in `src/lib/cards/`. Each card file exports a `CardDefinition` with all benefits. The registry at `src/lib/cards/index.ts` aggregates them. `detect.ts` auto-detects card type from Plaid account metadata. To add a new card, create a new file in `src/lib/cards/` and register it in `index.ts`.

7 cards: CSR, CSP, Amex Gold, Amex Platinum, Citi Strata Elite, Capital One Venture X, Robinhood Gold.

The Amex Platinum (`amex-platinum.ts`) has 21 benefits across 5 period types including quarterly (a new cycle type). It uses `activeMonths` gating for Uber Cash month-specific credits ($15 Jan-Nov, $35 Dec).

The Citi Strata Elite (`citi-strata-elite.ts`) has 2 benefits (hotel collection credit, Global Entry/TSA PreCheck). Its primary value is in earning rates via the points engine, not statement credits.

The Capital One Venture X (`capital-one-venture-x.ts`) has 3 benefits ($300 travel credit, 10K anniversary miles, Global Entry). Simplest premium card — 2x base rate on everything, 10x/5x portal hotels/flights, no monthly/quarterly credits.

The Robinhood Gold (`robinhood-gold.ts`) has 1 benefit (No FTF). Its value is entirely in its 3x flat earning rate (highest base rate of any card). 5x on Robinhood Travel portal with $3,500/yr cap. $50/yr fee (Robinhood Gold membership). Points valued at 0.7-1.0cpp (brokerage transfer). No transfer partners, no lounges, no statement credits.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Design tokens + theme (Tailwind v4)
│   ├── layout.tsx          # Root layout (fonts, ThemeProvider)
│   ├── page.tsx            # Landing page
│   ├── login/              # Auth pages (login, verify, error)
│   ├── onboarding/         # Multi-step wizard (card select, Plaid, anniversary)
│   ├── benefits/           # Benefits dashboard (insights, benefit cards, sync)
│   ├── spending/           # Spending analysis (categories, monthly breakdown)
│   ├── compare/            # Card comparison (points earn simulation, perk matrix)
│   ├── settings/           # User settings (card type, anniversary, connections)
│   ├── sandbox/            # Plaid test page (gated by NEXT_PUBLIC_ENABLE_SANDBOX)
│   ├── error.tsx           # Global error boundary
│   ├── not-found.tsx       # 404 page
│   └── api/                # API routes (auth, plaid, benefits, transactions, cron, insights)
├── components/
│   ├── ui/                 # 11 primitives (Button, Card, Badge, ProgressBar, Table, etc.)
│   ├── AppShell.tsx        # Sidebar layout
│   ├── RemoveCardButton.tsx # Card removal with confirmation
│   ├── PlaidLink.tsx       # Plaid Link wrapper
│   └── ThemeProvider.tsx   # Dark mode provider
├── lib/
│   ├── engine/             # Pure matching engine + tests
│   ├── insights/           # Insights Engine v2 (generators, scoring, orchestrator)
│   ├── spending/           # Spending analysis (categories, queries)
│   ├── cards/              # Card definitions registry + auto-detection
│   ├── points/             # Points earn model (category mapper, earn configs, simulator)
│   ├── auth.ts             # NextAuth config (lazy)
│   ├── auth-helpers.ts     # getAuthUser(), requireAuth()
│   ├── actions.ts          # Server actions (updateCardType, removeCardProfile)
│   ├── queries.ts          # Server-only data fetching
│   ├── plaid.ts            # Plaid API client
│   ├── plaid-sync.ts       # Shared sync logic (API, webhook, cron)
│   ├── notifications.ts    # Connection health alerts
│   ├── encryption.ts       # AES-256-GCM for Plaid tokens
│   └── types.ts            # All TypeScript types
└── db/
    ├── schema.ts           # Drizzle schema (17 tables + relations)
    ├── seed.ts             # Seed script
    └── index.ts            # DB client (lazy Proxy)
```

## Implementation Status

- [x] Phase 1: Scaffolding, schema, seed data
- [x] Phase 2: Core engine (matching, anniversary, cycle utils)
- [x] Phase 3: Plaid integration (sandbox)
- [x] Phase 4: Auth + user management
- [x] Phase 5: Dashboard UI
- [x] Phase 6: Polish, webhooks, cron, deployment
- [x] Phase 7: Insights Engine v2 — 8 categories, DB persistence, 5-factor scoring, lifecycle, competitor map
- [x] Phase 8: Compare Page + Points Earn Model — category mapper, 4 card earn configs, simulator, perk matrix, tabbed UI
- [x] Phase 9: Amex Platinum — 21 benefits, quarterly cycle types, activeMonths gating, earn config, A2 swap templates, competitor map
- [x] Phase 10: Citi Strata Elite — time-window conditions (Citi Nights 6x), portal mode toggle, 5-card comparison, datetime from Plaid
- [x] Phase 11: Capital One Venture X — 3 benefits, 2x base rate, 10x/5x portal earn config, 6-card comparison, 18 competitor map entries
- [x] Phase 12: Robinhood Gold — 1 benefit (No FTF), 3x base rate, 5x portal with $3,500/yr cap, 7-card comparison, 10 competitor map entries

### Sync Architecture

Transaction syncing uses a shared `triggerSync()` function (`src/lib/plaid-sync.ts`) called from three entry points:
- **API route** (`/api/plaid/sync`) — user-triggered manual sync via dashboard button
- **Webhook** (`/api/plaid/webhook`) — Plaid pushes `SYNC_UPDATES_AVAILABLE` and `ITEM.ERROR` events
- **Cron** (`/api/cron/sync`) — Vercel cron every 6 hours, syncs connections stale >6h, protected by `CRON_SECRET` bearer token

Connection health alerts (`src/lib/notifications.ts`) surface stale/reauth/disconnected states as banners in the dashboard.

### Deployment (Vercel)

- `vercel.json` defines a cron schedule (`0 */6 * * *` for `/api/cron/sync`)
- Sandbox page gated behind `NEXT_PUBLIC_ENABLE_SANDBOX=true` env var
- DB migrations: `npm run db:generate && npm run db:migrate` in build pipeline

## Spec Documents

- `docs/architecture/zurp.md` — Full app spec (data model, matching engine, benefits)
- `docs/architecture/design-principles.md` — S-tier SaaS dashboard design checklist
- `docs/engines/insights-engine.md` — Insights Engine v2 spec (categories, scoring, templates, display rules)
- `docs/engines/points-engine.md` — Points earn model spec (category taxonomy, earn rates, caps)
- `docs/styling/style-guide.md` — Brand colors, typography, spacing, motion
- `docs/catalogs/` — Card benefit catalogs organized by tier (tier-1, tier-2, tier-3) covering 30 cards
- `docs/terms/` — Privacy policy, terms of service, security documentation
- `public/zurp-logo.svg` — Logo
