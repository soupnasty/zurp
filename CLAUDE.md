# zurp — Credit Card Benefits Tracker

## Project Overview

A credit card benefits tracker that syncs transactions via Plaid, matches them against card-specific benefit rulesets, and shows users which credits they've used, which are expiring, and whether each card is paying for itself. Chase Sapphire Reserve is the first (and currently only) supported card.

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
npm run test:run     # Run all tests (57 tests across 4 files)
npm run db:push      # Push schema to Neon
npm run db:seed      # Seed cards + benefits from registry
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

See `docs/zurp-style-guide.md` for full brand reference.

### Lazy Initialization Patterns

**Critical**: Both the DB client and NextAuth config use lazy initialization to allow Next.js builds without environment variables:

- **DB** (`src/db/index.ts`): Returns a Proxy stub when `DATABASE_URL` is missing. Real client created on first use.
- **Auth** (`src/lib/auth.ts`): Uses a `getAuth()` memoized factory. `DrizzleAdapter` gets its own `createAuthDb()` to avoid Proxy type issues. Exported `handlers`, `auth`, `signIn`, `signOut` are wrapper functions.
- Pages that need DB at render time use `export const dynamic = "force-dynamic"` to prevent static prerendering.

### Core Engine (`src/lib/engine/`)

Pure-function matching engine with no DB dependencies:
- `cycle-utils.ts` — Date math for 7 cycle types (monthly, biannual_h1/h2, annual_calendar, annual_anniversary, quadrennial, subscription)
- `normalize.ts` — Merchant name normalization (lowercase, strip order numbers/trailing IDs)
- `matcher.ts` — Priority-based transaction matching, DoorDash sub-credit depletion, negative matching for travel credit
- `anniversary-detector.ts` — Detects annual fee charge to determine card anniversary date
- `orchestrator.ts` — DB integration layer connecting engine to Drizzle

### DoorDash Grouping

DoorDash has 3 separate sub-credits ($5/$10/$10) tracked internally but displayed as a single $25/month card in the UI. Grouping uses `displayGroup`, `displayGroupName`, and `displayGroupIcon` fields on benefits. The `groupBenefits()` function in the dashboard page handles this.

### Card Registry

Card definitions live in `src/lib/cards/`. Each card file exports a `CardDefinition` with all benefits. The registry at `src/lib/cards/index.ts` aggregates them. CSR has 16 benefits. To add a new card, create a new file in `src/lib/cards/` and register it in `index.ts`.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Design tokens + theme (Tailwind v4)
│   ├── layout.tsx          # Root layout (fonts, ThemeProvider)
│   ├── page.tsx            # Landing page
│   ├── login/              # Auth pages (login, verify, error)
│   ├── onboarding/         # Multi-step wizard (card select, Plaid, anniversary)
│   ├── dashboard/          # Main dashboard with 7 sub-components
│   ├── cards/[cardId]/     # Card detail view
│   ├── settings/           # User settings
│   ├── sandbox/            # Plaid test page (gated by NEXT_PUBLIC_ENABLE_SANDBOX)
│   ├── error.tsx           # Global error boundary
│   ├── not-found.tsx       # 404 page
│   └── api/                # API routes (auth, plaid, benefits, cron)
├── components/
│   ├── ui/                 # 8 primitives (Button, Card, Badge, ProgressBar, etc.)
│   ├── AppShell.tsx        # Sidebar layout
│   ├── PlaidLink.tsx       # Plaid Link wrapper
│   └── ThemeProvider.tsx   # Dark mode provider
├── lib/
│   ├── engine/             # Pure matching engine + tests
│   ├── cards/              # Card definitions registry
│   ├── auth.ts             # NextAuth config (lazy)
│   ├── auth-helpers.ts     # getAuthUser(), requireAuth()
│   ├── queries.ts          # Server-only data fetching
│   ├── plaid.ts            # Plaid API client
│   ├── plaid-sync.ts       # Shared sync logic (API, webhook, cron)
│   ├── notifications.ts    # Connection health alerts
│   ├── encryption.ts       # AES-256-GCM for Plaid tokens
│   └── types.ts            # All TypeScript types
└── db/
    ├── schema.ts           # Drizzle schema (all tables + relations)
    ├── seed.ts             # Seed script
    └── index.ts            # DB client (lazy Proxy)
```

## Implementation Status

- [x] Phase 1: Scaffolding, schema, seed data
- [x] Phase 2: Core engine (matching, anniversary, cycle utils) — 57 tests
- [x] Phase 3: Plaid integration (sandbox)
- [x] Phase 4: Auth + user management
- [x] Phase 5: Dashboard UI
- [x] Phase 6: Polish, webhooks, cron, deployment

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

- `docs/zurp.md` — Full app spec (data model, matching engine, benefits)
- `docs/design-principles.md` — S-tier SaaS dashboard design checklist
- `docs/zurp-style-guide.md` — Brand colors, typography, spacing, motion
- `docs/zurp-logo-5c.svg` — Logo source (also at `public/zurp-logo.svg`)
