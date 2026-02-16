# zurp — Credit Card Benefits Tracker

## Project Overview

A credit card benefits tracker that syncs transactions via Plaid, matches them against card-specific benefit rulesets, and shows users which credits they've used, which are expiring, and whether each card is paying for itself. Supports Chase Sapphire Reserve, Chase Sapphire Preferred, Chase Freedom Flex, Chase Freedom Unlimited, Amex Gold, Amex Blue Cash Preferred, Amex Platinum, Citi Strata Elite, Citi Strata Premier, Capital One Venture X, Capital One Venture, Robinhood Gold, Bilt Palladium, Amex Blue Cash Everyday, Citi Custom Cash, Citi Double Cash, Discover it Cash Back, US Bank Altitude Connect, Wells Fargo Active Cash, Wells Fargo Autograph Journey, Amex Business Platinum, Apple Card, Capital One SavorOne, Delta SkyMiles Platinum, Hilton Honors Aspire, IHG One Rewards Premier, Chase Ink Business Preferred, Southwest Rapid Rewards Priority, United Explorer, and World of Hyatt.

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

### Page Philosophy — Time Windows & Intent

Each main page has a distinct purpose and time window. This separation is fundamental to how data is queried, computed, and displayed.

| Page | Time Window | Intent |
|------|------------|--------|
| **Compare** (`/dashboard/compare`) | Rolling 365 days (or all available if < 1 year) | "Which card would have performed best for your actual spending?" Simulates points, benefits, and fees across all 30 cards using the full trailing year of transaction data. |
| **Track** (`/dashboard/track`) | Current cycle per benefit | "Are you maximizing your current card this period?" Shows current-cycle benefit usage (monthly, quarterly, annual anniversary, etc.) and current-period points earning. Helps users hit caps before credits expire. |
| **Insights** (`/dashboard/insights`) | Both current + prior cycles | "What should you do differently?" Generators have access to current cycle benefit usage (what's been redeemed, what's expiring) AND prior cycle spending patterns (to identify trends, missed credits, competitor redirects). |

**Key implications:**
- Compare page simulations use rolling 365-day window — no anniversary date dependency
- Track page benefit usage queries `benefitUsage` for the **current cycle period only** (via `getCurrentCycleBounds`)
- Track page points summary uses the current anniversary year (or rolling 365 days if no anniversary date)
- When a benefit cycle just rolled over, Track correctly shows $0 — this is expected behavior
- Insight generators receive both current and prior cycle context to produce actionable recommendations

### Design System (Tailwind v4)

Tailwind v4 uses CSS-based config via `@theme inline` in `src/app/globals.css` — there is NO `tailwind.config.ts`. All design tokens (colors, typography, spacing, shadows, motion) are CSS custom properties defined in `globals.css`.

See `docs/styling/style-guide.md` for full brand reference and `docs/styling/logo-guide.md` for logomark specs.

#### Color Palette

Dark-first. Never pure black or pure white.

**Backgrounds**: Deep `#0a0e17` (page bg), Card `#111827` (surfaces), Card Hover `#1a2236`, Elevated `#1e293b` (modals/dropdowns)

**Text**: Primary `#f0f2f5` (headlines, key values), Secondary `#7a8ba8` (body, descriptions), Dim `#4a5568` (captions, fees)

**Accents** — each color has a strict semantic role:
- Cyan `#22d3ee` — CTAs, links, interactive elements, brand. If it's clickable, use cyan.
- Blue `#60a5fa` — Points earned, data values, earning rates. If it's a number, use blue.
- Green `#34d399` — Net positive (#1 card ONLY), "Best fit" tag, success. Green means "this is your best option" — loses meaning if every row is green.
- Purple `#a78bfa` — Benefits value, perks, credits, benefit bar segments.
- Red `#f87171` — Fees, costs, negative values, fee bar segments.

**Borders**: Subtle `rgba(255,255,255,0.06)`, Medium `rgba(255,255,255,0.10)`. Glows: Blue `rgba(96,165,250,0.15)`, Cyan `rgba(34,211,238,0.10)`.

**Formula color mapping** (stacked bars): Points (blue) + Benefits (purple) − Fees (red) = Net (green on #1 only)

**Color rules**:
1. Green net value → #1 card only. All other rows use `--text-secondary`.
2. Card names in headlines → white (`--text-primary`). Only the savings amount gets green.
3. Cyan for interactive, blue for data. Never swap them.

#### Gradients

- **Primary**: `linear-gradient(135deg, #22d3ee, #60a5fa)` — CTAs, brand highlights
- **Hero**: `linear-gradient(135deg, #60a5fa 0%, #22d3ee 50%, #34d399 100%)` — headline gradient text
- **Success**: `linear-gradient(135deg, #34d399, #22d3ee)` — button hover, positive confirmations
- **Top Bar**: `linear-gradient(90deg, transparent, rgba(52,211,153,0.3), rgba(96,165,250,0.3), transparent)` — 1px card top edge glow

#### Typography

Two fonts: **DM Sans** (display + body) and **Space Mono** (data + labels + logo).

| Role | Font | Weights |
|------|------|---------|
| Display + Body | DM Sans | 300, 400, 500, 600, 700 |
| Data + Labels | Space Mono | 400, 700 |

**DM Sans weights**: 400 body, 500 nav/buttons, 600 card names/labels, 700 headlines

**Space Mono usage**: All dollar values (`$1,273`), percentages (`3%`), section labels (`COMPARE` — 11px, 700, uppercase, 2.5px tracking), brand logo (`zurp`), sub-labels (`net / year`, `$95/yr fee`), bar segment labels, footnotes.

**Type scale**: Hero headline `clamp(42px, 5.5vw, 76px)` 700, Section title `clamp(32px, 4vw, 52px)` 700, Personalized headline 22px 700, Body 19px 400, Card name 15px 600, Nav/button 14px 500, Caption 12-13px, Data values 17px Space Mono 700, Data cells 11-13px Space Mono 700, Mono label 10-11px Space Mono 700

#### Components

**Buttons**: Primary = gradient bg (cyan→blue), dark text, 16px 36px padding, 14px radius, 600 weight. Secondary = `rgba(34,211,238,0.1)` bg, cyan border, cyan text, 10px radius. Ghost = transparent, medium border, secondary text, 10px radius.

**Badges**: Pill (`border-radius: 100px`), `5px 14px` padding, 12px DM Sans 500. Variants: cyan/green/purple/red with 0.08-0.1 bg opacity, 0.12-0.15 border opacity.

**Tags**: Compact inline labels. `2px 8px` padding, 5px radius, 9-10px 700 uppercase 0.8px tracking. Green = "BEST FIT", Cyan = "YOUR CARD".

**Cards**: `--bg-card` bg, subtle border, 16px radius (containers 20px), 1px top edge gradient, 24-32px padding.

**Stacked Bars**: 30px height, 7px radius, flex segments proportional to amounts. Space Mono 11px 700. Fee segment uses white text on red.

**Simulation Row**: 3-col grid `32px 1fr 90px`. 20px 16px padding, 14px radius. #1 card: green tinted bg `rgba(52,211,153,0.035)` + green border. Others: subtle row dividers. Locked: `opacity: 0.3`, blur(5px) text.

#### Effects

- **Noise overlay**: SVG fractalNoise `opacity: 0.03`, fixed, `z-index: 1000`, `pointer-events: none`
- **Ambient glow**: Two radial gradients — top-left blue `rgba(96,165,250,0.08)`, bottom-right cyan `rgba(34,211,238,0.06)`, 800px, blur(120px)
- **Nav blur**: `rgba(10,14,23,0.8)` bg, `backdrop-filter: blur(20px)`, subtle bottom border
- **Top edge glow**: 1px `--gradient-top-bar` pseudo-element on card top
- **Entry animation**: `fadeUp` 0.7s ease, stagger 0.1-0.15s per element
- **Pulse dot**: Status indicator breathing, 2s infinite

#### Voice & Copy

- Terse data labels (Space Mono): `net / year`, `$95/yr fee`, `~$170 simulated`
- Confident, not salesy. Let math speak. Technical but scannable.
- Personalized headline: card name in white, savings amount in green only
- CTA: `zurp your card →` (lowercase brand, action verb)
- Methodology footnotes: 12px dim, always present for trust

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
- **Earn configs** (`earn-configs/`): Per-card earn rate definitions (bonus categories, caps, conditions, point valuations). 30 card earn configs across tier-1 (CSR, CSP, Amex Platinum), tier-2 (CFF, CFU, CBC Everyday, Citi Custom Cash, Citi Double Cash, Discover it, USBAC, WF Active Cash, WF Autograph Journey), tier-0 (CBC Preferred, Amex Gold, Citi Strata Elite, Citi Strata Premier, Venture X, Venture, Robinhood Gold, Bilt Palladium), and tier-3 (Amex Business Platinum, Apple Card, Capital One SavorOne, Delta SkyMiles Platinum, Hilton Honors Aspire, IHG One Rewards Premier, Chase Ink Business Preferred, Southwest Rapid Rewards Priority, United Explorer, World of Hyatt).
- **Calculator** (`calculator.ts`): Per-transaction points calculation with cap tracking. Supports `time_window` conditions for time-based earn rates (e.g., Citi Nights).
- **Simulator** (`simulator.ts`): Full pipeline — classify → calculate per card → aggregate → compute net value (points + benefits - fee). Supports `portalMode` to reclassify travel as `travel_portal`.
- **Perk matrix** (`perk-matrix.ts`): Static benefit comparison data for the Benefits & Perks tab (30 cards).
- **Queries** (`queries.ts`): Server-only DB queries for transaction data (includes `datetime` for time-window matching).
- **Orchestrator** (`index.ts`): `computeComparison(userId, options?)` — main entry point called from the compare page. Accepts `{ portalMode?: boolean }`.

No new DB tables — computed on-demand from existing transaction data.

### Card Registry

Card definitions live in `src/lib/cards/`. Each card file exports a `CardDefinition` with all benefits. The registry at `src/lib/cards/index.ts` aggregates them. `detect.ts` auto-detects card type from Plaid account metadata. To add a new card, create a new file in `src/lib/cards/` and register it in `index.ts`.

30 cards: CSR, CSP, CFF, CFU, Amex Gold, Amex Blue Cash Preferred, Amex Platinum, Citi Strata Elite, Citi Strata Premier, Capital One Venture X, Capital One Venture, Robinhood Gold, Bilt Palladium, Amex Blue Cash Everyday, Citi Custom Cash, Citi Double Cash, Discover it Cash Back, US Bank Altitude Connect, Wells Fargo Active Cash, Wells Fargo Autograph Journey, Amex Business Platinum, Apple Card, Capital One SavorOne, Delta SkyMiles Platinum, Hilton Honors Aspire, IHG One Rewards Premier, Chase Ink Business Preferred, Southwest Rapid Rewards Priority, United Explorer, World of Hyatt.

The Chase Freedom Flex (`chase-freedom-flex.ts`) has 1 benefit (DashPass subscription). $0 annual fee, Mastercard network. 1x base rate with 5% rotating quarterly categories (not modeled — changes each quarter), 3x dining/drugstores, 5x Chase Travel portal. Earns Chase UR points poolable with CSR/CSP. Points valued at 1.0-2.0cpp (via CSR/CSP transfer partners). Cell phone protection ($800/claim, 2 claims/yr).

The Chase Freedom Unlimited (`chase-freedom-unlimited.ts`) has 1 benefit (DashPass subscription). $0 annual fee, Visa network. 1.5x flat base rate (highest non-rotating Chase rate), 3x dining/drugstores, 5x Chase Travel portal. Earns Chase UR points poolable with CSR/CSP. Points valued at 1.0-2.0cpp (via CSR/CSP transfer partners).

The Amex Blue Cash Preferred (`amex-blue-cash-preferred.ts`) has 0 benefits (no trackable statement credits). First pure cash-back card in the system — `pointsCurrency: "cash_back"` with fixed 1.0cpp valuation. 6% US supermarkets (capped $6K/yr), 6% streaming (uncapped), 3% transit/gas, 1% base. $95/yr fee. Amex network. No transfer partners. 2.7% FTF.

The Amex Platinum (`amex-platinum.ts`) has 21 benefits across 5 period types including quarterly (a new cycle type). It uses `activeMonths` gating for Uber Cash month-specific credits ($15 Jan-Nov, $35 Dec).

The Citi Strata Elite (`citi-strata-elite.ts`) has 2 benefits (hotel collection credit, Global Entry/TSA PreCheck). Its primary value is in earning rates via the points engine, not statement credits.

The Citi Strata Premier (`citi-strata-premier.ts`) has 2 benefits ($100 annual hotel credit via Citi Travel portal, No FTF). Mid-tier sibling to Strata Elite — 1x base rate, 3x flights/dining/groceries/gas, 10x portal hotels/cars. $95/yr fee. Same ThankYou Points pool (`citi_tp`). Mastercard network. Issuer is "citi" (same as Strata Elite).

The Capital One Venture X (`capital-one-venture-x.ts`) has 3 benefits ($300 travel credit, 10K anniversary miles, Global Entry). Simplest premium card — 2x base rate on everything, 10x/5x portal hotels/flights, no monthly/quarterly credits.

The Capital One Venture (`capital-one-venture.ts`) has 3 benefits ($250 annual travel credit, $120 Global Entry/TSA PreCheck every 4 years, No FTF). Mid-tier sibling to Venture X — flat 2x base rate, 5x portal hotels/rentals (NOT flights — those stay 2x). $95/yr fee. Same Capital One miles pool. Points valued at 1.0-1.5cpp. Issuer is "capital_one" (same as Venture X).

The Robinhood Gold (`robinhood-gold.ts`) has 1 benefit (No FTF). Its value is entirely in its 3x flat earning rate (highest base rate of any card). 5x on Robinhood Travel portal with $3,500/yr cap. $50/yr fee (Robinhood Gold membership). Points valued at 1.0cpp fixed (1:1 brokerage transfer, no transfer partners). No transfer partners, no lounges, no statement credits.

The Bilt Palladium (`bilt-palladium.ts`) has 4 benefit records from 3 logical benefits: $400/yr hotel credit via Bilt Travel portal ($200 semi-annual via expandCycles), $200/yr Bilt Cash annual credit, and No FTF. Flat 2x earning on everything (no bonus categories). 23 transfer partners with Rent Day 75% bonus. Points valued at 1.5-2.2cpp. $495/yr fee. Issuer is "bilt" for Plaid detection.

The Amex Blue Cash Everyday (`amex-blue-cash-everyday.ts`) has 1 benefit (Disney Bundle monthly credit $7/mo). $0 annual fee, Amex network. 3% US supermarkets (capped $6K/yr), 3% gas (capped $6K/yr), 3% online retail (capped $6K/yr), 1% base. Cash back currency at fixed 1.0cpp valuation. 2.7% FTF.

The Citi Custom Cash (`citi-custom-cash.ts`) has 0 benefits (no trackable statement credits). $0 annual fee, Mastercard network. Auto-selects 5% on top spending category per billing cycle ($500 cap, not modeled in static config). 1% base. ThankYou Points poolable with Strata cards. 3% FTF.

The Citi Double Cash (`citi-double-cash.ts`) has 0 benefits (no trackable statement credits). $0 annual fee, Mastercard network. Effective 2% flat rate (1% on purchase + 1% on payment). ThankYou Points poolable with Strata cards. 3% FTF.

The Discover it Cash Back (`discover-it-cash-back.ts`) has 0 benefits (no trackable statement credits). $0 annual fee, Discover network. 5% rotating quarterly categories ($1,500/qtr cap, not modeled), 1% base. Year 1 Cashback Match doubles all earnings (not modeled). No FTF.

The US Bank Altitude Connect (`us-bank-altitude-connect.ts`) has 1 benefit (Global Entry/TSA PreCheck $100/4yr). $0 annual fee, Visa network. 5x US Bank Rewards Center, 4x travel/gas ($4K/yr gas cap), 2x dining/groceries/streaming, 1x base. Priority Pass (4 visits/yr) tracked in perk matrix only.

The Wells Fargo Active Cash (`wells-fargo-active-cash.ts`) has 0 benefits (no trackable statement credits). $0 annual fee, Visa network. Flat 2% cash back on all purchases (uncapped). Cell phone protection ($600/claim) and CDW ($50K secondary) tracked in perk matrix only. 3% FTF.

The Wells Fargo Autograph Journey (`wells-fargo-autograph-journey.ts`) has 1 benefit (Annual Airline Credit $50/yr, minimum $50 charge). $95 annual fee, Visa network. 5x hotels, 4x flights/dining, 3x gas/transit/streaming, 1x base. 6 transfer partners at 1:1 (Flying Blue, Avianca, BA, Iberia, Virgin Atlantic, Aer Lingus). No FTF.

The Amex Business Platinum (`amex-business-platinum.ts`) has 4 benefits (hotel credit x2 semi-annual, Dell credit, Global Entry, CLEAR Plus). $895 annual fee, Amex network. 5x Amex Travel portal, 1x base. Earns Amex MR points. Points valued at 1.0-2.0cpp (via transfer partners).

The Apple Card (`apple-card.ts`) has 0 benefits (Daily Cash is earning structure, not a trackable credit). $0 annual fee, Mastercard network. Issuer is "goldman_sachs". 3% at select merchants (Apple, Uber, Nike, Exxon/Mobil, Walgreens, Ace Hardware, Booking.com) via merchant_match conditions, 1% base (2% Apple Pay). Cash back currency at fixed 1.0cpp. No FTF.

The Capital One SavorOne (`capital-one-savor.ts`) has 1 benefit ($100 first-year Capital One Travel credit, one-time only). $0 annual fee, Mastercard network. 8x Capital One Entertainment portal, 5x travel portal, 3x dining/entertainment/streaming/groceries, 1% base. Cash back currency at fixed 1.0cpp. No FTF.

The Delta SkyMiles Platinum (`delta-platinum.ts`) has 2 benefits ($200/yr Delta flight credit requiring $10K spend, $9.99/mo Uber One credit with activeMonths gating). Companion Certificate tracked in perk matrix only. $350 annual fee, Amex network. 3x Delta flights (merchant_match), 3x hotels, 2x dining/groceries, 1x base. Delta SkyMiles valued at 1.0-1.4cpp.

The Hilton Honors Aspire (`hilton-aspire.ts`) has 7 benefits ($200 resort credit x2 semi-annual, $50 airline fee credit x4 quarterly, $209 CLEAR Plus). Free Night Certificate tracked in perk matrix only. $550 annual fee, Amex network. 14x Hilton (merchant_match, 13 brands), 7x flights/dining/cars, 3x base. Hilton points valued at 0.5-0.8cpp.

The IHG One Rewards Premier (`ihg-premier.ts`) has 1 benefit (Global Entry $120/quadrennial). Free Night Certificate tracked in perk matrix only. $99 annual fee, Visa network. 10x IHG (merchant_match, 13 brands), 5x flights/cars/dining, 3x base. IHG points valued at 0.5-0.8cpp.

The Chase Ink Business Preferred (`ink-business-preferred.ts`) has 0 benefits (business earning card). $95 annual fee, Visa network. 5x Lyft (merchant_match), 3x travel/phone_services ($150K/yr combined cap), 1x base. Chase UR points valued at 1.0-2.0cpp (via transfer partners).

The Southwest Rapid Rewards Priority (`southwest-priority.ts`) has 1 benefit ($75/yr Southwest travel credit). Upgraded Boardings tracked in perk matrix only. $229 annual fee, Visa network. 2x Southwest flights (merchant_match), 2x dining, 1x base. Rapid Rewards points valued at 1.3-1.5cpp.

The United Explorer (`united-explorer.ts`) has 3 benefits ($100/yr United travel credit, $60/yr airport rideshare credit, $120/yr Instacart credit). United Club passes tracked in perk matrix only. $150 annual fee, Visa network. 5x United flights (merchant_match), 2x dining/hotels, 1x base. MileagePlus miles valued at 1.0-1.5cpp.

The World of Hyatt (`world-of-hyatt.ts`) has 0 benefits (both Free Night Certificates tracked in perk matrix only). $95 annual fee, Visa network. 4x Hyatt (merchant_match, 9 brands), 2x dining/flights/cars/transit/fitness, 1x base. Hyatt points valued at 1.5-2.2cpp.

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
│   ├── cards/              # Card definitions registry + auto-detection (30 cards)
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
- [x] Phase 13: Bilt Palladium — 4 benefits (hotel credit x2, Bilt Cash annual, No FTF), 2x base rate, 23 transfer partners, 8-card comparison, 10 competitor map entries
- [x] Phase 14: Capital One Venture — 3 benefits (travel credit, Global Entry, No FTF), 2x base rate, 5x portal hotels/rentals, 9-card comparison, 10 competitor map entries
- [x] Phase 15: Citi Strata Premier — 2 benefits (hotel credit, No FTF), 1x base rate, 3x flights/dining/groceries/gas, 10x portal hotels, 10-card comparison, 10 competitor map entries
- [x] Phase 16: Chase Freedom Flex — 1 benefit (DashPass), 1x base rate, 3x dining/drugstores, 5x portal, $0 fee, Mastercard, cell phone protection, 12-card comparison
- [x] Phase 17: Chase Freedom Unlimited — 1 benefit (DashPass), 1.5x base rate, 3x dining/drugstores, 5x portal, $0 fee, Visa, 12-card comparison
- [x] Phase 18: Amex Blue Cash Preferred — 0 benefits, first cash-back card (`cash_back` currency), 6%/6%/3%/3%/1% earn rates, $6K grocery cap, 13-card comparison
- [x] Phase 19: Tier-2 Cards — 7 new cards (Amex BCE, Citi Custom Cash, Citi Double Cash, Discover it, US Bank Altitude Connect, WF Active Cash, WF Autograph Journey), 3 statement credits, 7 earn configs, 20-card comparison, perk matrix expansion, issuer detection aliases
- [x] Phase 20: Tier-3 Cards — 10 new cards (Amex Business Platinum, Apple Card, Capital One SavorOne, Delta SkyMiles Platinum, Hilton Honors Aspire, IHG One Rewards Premier, Chase Ink Business Preferred, Southwest Rapid Rewards Priority, United Explorer, World of Hyatt), certificate benefits to perk matrix only, goldman_sachs issuer detection, 19 competitor map entries, 30-card comparison

### Sync Architecture

Transaction syncing uses a shared `triggerSync()` function (`src/lib/plaid-sync.ts`) called from:
- **API route** (`/api/plaid/sync`) — user-triggered manual sync via dashboard button

Connection health alerts (`src/lib/notifications.ts`) surface stale/reauth/disconnected states as banners in the dashboard.

### Deployment (Vercel)

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
