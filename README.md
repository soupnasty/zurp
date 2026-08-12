# zurp

A credit card benefits tracker that syncs transactions via Plaid, matches them against card-specific benefit rulesets, and shows users which credits they've used, which are expiring, and whether each card is paying for itself.

Supports 30 cards across Chase, Amex, Citi, Capital One, and more — see [Supported Cards](#supported-cards).

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `src/` dir) |
| Language | TypeScript 5 |
| Database | PostgreSQL on [Neon](https://neon.tech) |
| ORM | [Drizzle](https://orm.drizzle.team) (`drizzle-orm/neon-http`) |
| Auth | [NextAuth v5](https://authjs.dev) + [Resend](https://resend.com) (magic link) |
| Styling | Tailwind CSS v4 (CSS-based config) |
| Icons | Lucide React |
| Bank Link | [Plaid](https://plaid.com) (sandbox mode) |
| Testing | Vitest |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database (free tier works)
- A [Plaid](https://dashboard.plaid.com) developer account
- A [Resend](https://resend.com) account (for magic link emails)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description | How to get it |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | Neon dashboard > Connection Details |
| `AUTH_SECRET` | NextAuth session encryption key | Run `npx auth secret` or `openssl rand -base64 32` |
| `AUTH_RESEND_KEY` | Resend API key for magic link emails | Resend dashboard > API Keys |
| `PLAID_CLIENT_ID` | Plaid client identifier | Plaid dashboard > Team Settings > Keys |
| `PLAID_SECRET` | Plaid secret key (sandbox) | Plaid dashboard > Team Settings > Keys |
| `PLAID_ENV` | Plaid environment | `sandbox` for development |
| `ENCRYPTION_KEY` | 64-char hex string for AES-256-GCM | Run `openssl rand -hex 32` |
| `APP_URL` | App base URL (used for Plaid OAuth redirect) | `http://localhost:3000` for development |
| `NEXT_PUBLIC_ENABLE_SANDBOX` | Enables the `/sandbox` test page | Set to `true` for development |

### 3. Set up the database

```bash
# Push schema to Neon (creates all tables)
npm run db:push

# Seed all card definitions + benefits + competitor map
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI) |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema directly to database (dev) |
| `npm run db:seed` | Seed cards and benefits from the card registry |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |

## Data Model

All tables are defined in `src/db/schema.ts` using Drizzle ORM.

### Entity Relationship

```
users
 ├── accounts            (NextAuth OAuth accounts)
 ├── sessions            (NextAuth sessions)
 ├── card_profiles ──┐   (user's card memberships)
 │   └── plaid_connections ──┐  (linked bank accounts)
 │       └── transactions    │  (synced from Plaid)
 │           └── matched_tx ─┤  (transaction ↔ benefit match)
 ├── benefit_usage ──────────┘  (credit usage per period)
 ├── insights                   (generated insights)
 └── insight_impressions        (insight display tracking)

cards
 └── benefits            (card benefit definitions)

competitor_map           (merchant → benefit mapping for insights)
verification_tokens      (NextAuth magic link tokens)
```

### Core Tables

**`users`** — Extended NextAuth user table with `lastActive` and `createdAt` timestamps.

**`cards`** — Credit card definitions (issuer, network, annual fee, fee descriptor). Seeded from the card registry.

**`benefits`** — Individual card benefits with matching rules:
- `merchantPatterns` — array of substring patterns for merchant name matching
- `plaidCategories` — Plaid category codes for matching
- `cycle` — billing cycle type (`monthly`, `biannual_h1`, `biannual_h2`, `quarterly_q1`, `quarterly_q2`, `quarterly_q3`, `quarterly_q4`, `annual_calendar`, `annual_anniversary`, `quadrennial`, `subscription`)
- `priority` — matching priority (lower = matched first)
- `autoMatchable` — whether the engine can auto-match or requires manual confirmation
- `displayGroup` / `displayGroupName` / `displayGroupIcon` — for grouping sub-credits (e.g., DoorDash's 3 sub-credits appear as one $25/month card in the UI)

**`card_profiles`** — Links a user to a card with an optional `anniversaryDate` (auto-detected from fee transactions or user-provided).

**`plaid_connections`** — Encrypted Plaid access tokens, sync cursors, and connection health status (`active`, `needs_reauth`, `disconnected`).

**`transactions`** — Synced from Plaid via `transactionsSync`. Tracks `matchedStatus` (`unmatched`, `matched`, `ambiguous`, `skipped`). Indexed on `(userId, date)` and `matchedStatus`.

**`benefit_usage`** — Credit usage per benefit per billing period. Unique constraint on `(userId, benefitId, periodKey)`. Tracks `amountUsed`, `amountRemaining`, carryover amounts.

**`matched_tx`** — Join table between transactions and benefit usage. Records `creditApplied`, `matchMethod` (`auto`/`manual`), and `matchConfidence` (`high`/`medium`/`low`).

## Architecture

### Matching Engine

The core matching engine (`src/lib/engine/`) is a set of **pure functions with no database dependencies**, making it fully unit-testable:

| Module | Purpose |
|---|---|
| `cycle-utils.ts` | Date math for all 11 cycle types. Computes period bounds, days remaining, period keys. |
| `normalize.ts` | Merchant name normalization — lowercase, strip order numbers, trailing IDs (`"LYFT *RIDE 8472"` → `"lyft ride"`). |
| `matcher.ts` | Priority-based transaction matching. Handles DoorDash sub-credit depletion, negative matching for broad travel credits, and ambiguous flagging for non-auto-matchable benefits. |
| `anniversary-detector.ts` | Scans transactions for the annual fee charge (~$795 with 5% tolerance) to auto-detect the card anniversary date. |
| `orchestrator.ts` | DB integration layer. Reads from Drizzle, calls the pure matcher, writes results back. |

**Matching algorithm:**
1. Filter out pending and already-matched transactions
2. Normalize merchant names
3. For each transaction, find all eligible benefits (by merchant pattern + Plaid category)
4. Sort matches by priority (lowest first)
5. Assign the highest-priority auto-matchable match
6. Compute `creditApplied` (capped at remaining benefit balance)
7. Flag non-auto-matchable matches as `ambiguous` for manual review

### Transaction Sync

Transaction syncing uses a shared `triggerSync()` function (`src/lib/plaid-sync.ts`) called from two entry points:

- **API route** (`POST /api/plaid/sync`) — user-triggered via the dashboard Sync button, with a 24-hour per-connection cooldown between manual syncs
- **Webhook** (`POST /api/plaid/webhook`) — Plaid pushes `TRANSACTIONS` events (`INITIAL_UPDATE`, `HISTORICAL_UPDATE`, `SYNC_UPDATES_AVAILABLE`) and `ITEM` events (`NEW_ACCOUNTS_AVAILABLE`, `ERROR`, `PENDING_EXPIRATION`). Webhooks are signature-verified (see [Plaid Webhook](#plaid-webhook)) before any processing.

### Auth Flow

1. User enters email on `/login`
2. NextAuth sends a magic link via Resend
3. User clicks link, lands on `/login/verify`, gets redirected to `/dashboard`
4. Protected routes use `requireAuth()` helper to enforce authentication
5. First-time users are redirected to `/onboarding` (select card → link Plaid → set anniversary)

### Card Registry

Card definitions are code-side configuration in `src/lib/cards/`. Each file exports a `CardDefinition` with all benefits and matching rules. The seed script upserts these into the database.

To add a new card:
1. Create `src/lib/cards/your-card.ts` with a `CardDefinition`
2. Register it in `src/lib/cards/index.ts`
3. Run `npm run db:seed`

### Design System

Tailwind v4 with CSS-based config (no `tailwind.config.ts`). All tokens defined in `src/app/globals.css` via `@theme inline`:

- **Dark-first palette**: Void `#0D1117`, Surface `#161B22`, Frost `#E6EDF3`, Signal `#58A6FF`
- **Typography**: Inter (body), JetBrains Mono (data/numbers)
- **Spacing**: 4px base unit
- **Motion**: `ease-out-expo` easing, 150ms/300ms/500ms durations
- **Shadows**: Glow-based in dark mode, traditional in light mode

Custom utility classes:
- `.font-data` — JetBrains Mono for dollar amounts and numbers
- `.label-caps` — Uppercase, letter-spaced caption labels

Full reference: `docs/styling/style-guide.md`

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css               # Design tokens + theme (Tailwind v4)
│   ├── layout.tsx                # Root layout (fonts, ThemeProvider)
│   ├── page.tsx                  # Landing page
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   ├── _components/              # Landing page components (AnimatedMockup, MobileNav, ...)
│   ├── login/                    # Auth pages
│   │   ├── page.tsx              #   Email input form
│   │   ├── verify/page.tsx       #   "Check your email" confirmation
│   │   └── error/page.tsx        #   Auth error with retry
│   ├── onboarding/               # First-time user setup
│   │   ├── page.tsx              #   Entry point
│   │   ├── actions.ts            #   Server actions
│   │   ├── processing/           #   Post-link processing screen
│   │   └── _components/          #   Wizard steps (OnboardingWizard, CardSelection)
│   ├── dashboard/                # Main app (tabbed dashboard)
│   │   ├── page.tsx              #   Dashboard shell (tab routing)
│   │   ├── layout.tsx            #   Dashboard layout
│   │   ├── compare/              #   Card comparison (points earn simulation, perk matrix)
│   │   ├── track/                #   Current-cycle benefit usage + points tracking
│   │   ├── insights/             #   Generated insights feed
│   │   ├── _components/          #   CompareTab, TrackTab, InsightsTab, BenefitsSection,
│   │   │                         #   Leaderboard, HeadToHead, SummaryStrip, SyncBanner, ...
│   │   └── _lib/                 #   classify-benefits, resolve-card
│   ├── benefits/                 # Redirect stub → /dashboard
│   ├── spending/                 # Redirect stub → /dashboard?tab=track
│   ├── compare/                  # Redirect stub → /dashboard?tab=compare
│   ├── settings/                 # User settings
│   │   ├── page.tsx              #   Card types, anniversary, connections
│   │   ├── actions.ts            #   Server actions (anniversary, unlink)
│   │   └── _components/          #   CardTypeEditor, AnniversaryEditor,
│   │                             #   SignOutButton, UnlinkButton
│   ├── oauth-callback/           # Plaid OAuth redirect landing page
│   ├── privacy/, terms/, security/  # Legal + security pages
│   ├── sandbox/                  # Plaid test page (gated by env var)
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth route handler
│       ├── onboarding/           # Saves lifestyle selections during onboarding
│       ├── plaid/
│       │   ├── create-link-token/  # Plaid Link token creation
│       │   ├── exchange-token/     # Public → access token exchange
│       │   ├── sync/               # Manual transaction sync (24h cooldown)
│       │   ├── sync-status/        # Sync progress polling
│       │   ├── reauth-complete/    # Marks a reauthorized connection active
│       │   └── webhook/            # Plaid webhook receiver (signature-verified)
│       ├── benefits/
│       │   ├── confirm/            # Manual benefit match confirmation
│       │   ├── flag/               # Add/remove transaction ↔ benefit matches
│       │   ├── redeem/             # Mark/unmark benefit as redeemed
│       │   ├── activate/           # Activate/deactivate subscription benefits
│       │   └── usage/              # Benefit usage data
│       ├── transactions/           # Transaction list with pagination
│       └── insights/
│           ├── dismiss/            # Dismiss an insight
│           └── impression/         # Record insight impressions
├── components/
│   ├── ui/                       # Primitives (Button, Modal, ToastProvider)
│   ├── AppShell.tsx              # Persistent sidebar + top bar layout
│   ├── CardSelectorDropdown.tsx  # Card switcher
│   ├── RemoveCardButton.tsx      # Card removal with confirmation
│   ├── PlaidLink.tsx             # Plaid Link modal wrapper
│   ├── ReauthButton.tsx          # Plaid reauth (update mode) launcher
│   ├── issuer-logos.tsx          # Issuer logo components
│   └── useInsightImpression.ts   # Insight impression tracking hook
├── lib/
│   ├── engine/                   # Pure matching engine
│   │   ├── cycle-utils.ts        #   Date math for 11 cycle types
│   │   ├── normalize.ts          #   Merchant name normalization
│   │   ├── matcher.ts            #   Priority-based transaction matching
│   │   ├── anniversary-detector.ts  # Annual fee detection
│   │   ├── orchestrator.ts       #   DB integration layer
│   │   └── __tests__/            #   Unit tests
│   ├── insights/                 # Insights Engine v2
│   │   ├── generators/           #   8 insight generators (pure functions)
│   │   ├── scoring.ts            #   5-factor weighted scoring
│   │   ├── templates.ts          #   Copy templates + interpolation
│   │   ├── orchestrator.ts       #   DB bridge: persist, display, expire
│   │   ├── queries.ts            #   Server-only DB queries
│   │   └── __tests__/            #   Unit tests
│   ├── spending/                 # Spending analysis
│   │   ├── categories.ts         #   Transaction categorization
│   │   ├── queries.ts            #   Monthly transaction queries
│   │   └── __tests__/            #   Unit tests
│   ├── cards/                    # Card definitions registry (30 cards)
│   │   ├── index.ts              #   Registry exports
│   │   ├── detect.ts             #   Auto-detect card type from Plaid metadata
│   │   └── *.ts                  #   One CardDefinition file per card
│   ├── points/                   # Points earn model
│   │   ├── index.ts              #   Orchestrator (computeComparison)
│   │   ├── categories.ts         #   3-tier category mapper
│   │   ├── merchant-map.ts       #   ~200 merchant→category entries
│   │   ├── calculator.ts         #   Per-transaction points calculation
│   │   ├── simulator.ts          #   Full simulation pipeline
│   │   ├── perk-matrix.ts        #   Static benefit comparison data
│   │   ├── queries.ts            #   Server-only DB queries
│   │   └── earn-configs/         #   Per-card earn rate definitions (30 cards)
│   ├── auth.ts                   # NextAuth v5 config (lazy init)
│   ├── auth-helpers.ts           # getAuthUser(), requireAuth()
│   ├── actions.ts                # Server actions (updateCardType, removeCardProfile)
│   ├── queries.ts                # Server-only data fetching
│   ├── plaid.ts                  # Plaid API client
│   ├── plaid-sync.ts             # Shared triggerSync() for API route + webhook
│   ├── plaid-webhook-verify.ts   # Plaid-Verification JWT verification (ES256)
│   ├── notifications.ts          # Connection health alerts
│   ├── encryption.ts             # AES-256-GCM for Plaid access tokens
│   ├── testing/                  # Test fixtures (merchant registry, generators)
│   └── types.ts                  # All TypeScript types
└── db/
    ├── schema.ts                 # Drizzle schema (20 tables + relations)
    ├── seed.ts                   # Seed script (cards + benefits + competitor map)
    └── index.ts                  # DB client (lazy Proxy for build safety)
```

## Testing

Tests cover the matching engine, insights engine, points engine, spending module, and the test-data merchant registry/fixtures:

```bash
# Run once
npm run test:run

# Watch mode
npm test
```

## Deployment

### Vercel

1. Connect your repo to Vercel
2. Set all environment variables from `.env.example` in the Vercel dashboard
3. The build command is `npm run build` (default)

### Database Migrations

For development, use `db:push` to sync schema directly:

```bash
npm run db:push
```

For production, generate and run migrations:

```bash
npm run db:generate   # Creates migration SQL files
npm run db:migrate    # Applies pending migrations
```

### Plaid Webhook

Set the webhook URL in your Plaid dashboard to:

```
https://your-domain.com/api/plaid/webhook
```

The handler verifies every request before processing it: Plaid signs each webhook with an ES256 JWT in the `Plaid-Verification` header, and the handler (`src/lib/plaid-webhook-verify.ts`) fetches the signing key via `/webhook_verification_key/get`, verifies the JWT, and checks the `request_body_sha256` claim against the raw request body. Unsigned or invalid requests are rejected with `401`.

The handler processes `TRANSACTIONS` webhooks (`INITIAL_UPDATE`, `HISTORICAL_UPDATE`, `SYNC_UPDATES_AVAILABLE` — each triggers a sync) and `ITEM` webhooks (`NEW_ACCOUNTS_AVAILABLE` triggers a sync; `ERROR` and `PENDING_EXPIRATION` update connection status to `needs_reauth` or `disconnected`).

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `*` | `/api/auth/[...nextauth]` | Public | NextAuth handler (magic link flow) |
| `POST` | `/api/onboarding` | Required | Saves lifestyle selections during onboarding |
| `POST` | `/api/plaid/create-link-token` | Required | Creates a Plaid Link token |
| `POST` | `/api/plaid/exchange-token` | Required | Exchanges Plaid public token for access token |
| `POST` | `/api/plaid/sync` | Required | Triggers manual transaction sync (24h per-connection cooldown) |
| `GET` | `/api/plaid/sync-status` | Required | Sync progress for the active connection (polled after onboarding) |
| `POST` | `/api/plaid/reauth-complete` | Required | Marks a reauthorized connection as active |
| `POST` | `/api/plaid/webhook` | Plaid signature | Receives Plaid webhook events (`Plaid-Verification` JWT verified; unsigned requests get `401`) |
| `POST` | `/api/benefits/confirm` | Required | Manually confirms a benefit match |
| `POST/DELETE` | `/api/benefits/flag` | Required | Add/remove transaction ↔ benefit matches |
| `POST/DELETE` | `/api/benefits/redeem` | Required | Mark/unmark a benefit as redeemed |
| `POST/DELETE` | `/api/benefits/activate` | Required | Activate/deactivate a subscription benefit |
| `GET` | `/api/benefits/usage` | Required | Returns benefit usage data |
| `GET` | `/api/transactions` | Required | Paginated transaction list |
| `POST` | `/api/insights/dismiss` | Required | Dismiss an insight |
| `POST` | `/api/insights/impression` | Required | Records an insight impression |

## Supported Cards

30 cards:

- **Chase** — Sapphire Reserve, Sapphire Preferred, Freedom Flex, Freedom Unlimited, Ink Business Preferred
- **Amex** — Gold, Platinum, Business Platinum, Blue Cash Preferred, Blue Cash Everyday, Delta SkyMiles Platinum, Hilton Honors Aspire
- **Citi** — Strata Elite, Strata Premier, Custom Cash, Double Cash
- **Capital One** — Venture X, Venture, SavorOne
- **Wells Fargo** — Active Cash, Autograph Journey
- **Others** — Robinhood Gold, Bilt Palladium, Discover it Cash Back, US Bank Altitude Connect, Apple Card, IHG One Rewards Premier, Southwest Rapid Rewards Priority, United Explorer, World of Hyatt

Card definitions live in `src/lib/cards/`. See `docs/catalogs/` for full benefit catalogs.

## Spec Documents

- `docs/architecture/zurp.md` — Full app spec (data model, matching engine, benefits)
- `docs/architecture/design-principles.md` — Dashboard design checklist
- `docs/engines/insights-engine.md` — Insights Engine v2 spec (categories, scoring, templates, display rules)
- `docs/engines/points-engine.md` — Points earn model spec (category taxonomy, earn rates, caps)
- `docs/styling/style-guide.md` — Brand colors, typography, spacing, motion
- `docs/catalogs/` — Card benefit catalogs (CSR, CSP, Amex Gold, Amex Platinum)
- `docs/terms/` — Privacy policy, terms of service, security documentation
