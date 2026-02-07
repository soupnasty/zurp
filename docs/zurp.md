# Reserve Tracker — Architecture & Data Model (v3)

## Overview

A Next.js web app that tracks credit card benefits usage by pulling transaction data via Plaid and matching it against a card-specific benefits ruleset. Designed for the Chase Sapphire Reserve® first, but architected to support any card.

The goal: show the user exactly which credits they've used, which are expiring, and whether each card is paying for itself.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            NEXT.JS APP                                   │
│                                                                          │
│  ┌──────────────┐    ┌───────────────────┐    ┌───────────────────────┐  │
│  │              │    │                   │    │                       │  │
│  │   React UI   │◄───│  Server Actions   │◄───│   Plaid Webhooks     │  │
│  │  (Dashboard) │    │  / API Routes     │    │   (/api/plaid/*)     │  │
│  │              │    │                   │    │                       │  │
│  └──────────────┘    └────────┬──────────┘    └──────────┬────────────┘  │
│                               │                          │               │
│                      ┌────────▼──────────────────────────▼───────────┐   │
│                      │                                               │   │
│                      │              MATCHING ENGINE                   │   │
│                      │   tx + card benefits → usage records          │   │
│                      │                                               │   │
│                      └───────────────────┬───────────────────────────┘   │
│                                          │                               │
│                      ┌───────────────────▼───────────────────────────┐   │
│                      │                                               │   │
│                      │          ANNIVERSARY DETECTOR                  │   │
│                      │   1. Scan txns for annual fee charge          │   │
│                      │   2. If not found → prompt user               │   │
│                      │                                               │   │
│                      └───────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
         ┌─────────────────────────▼─────────────────────────────┐
         │                                                       │
         │                     POSTGRESQL                        │
         │                                                       │
         │  ┌───────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
         │  │ cards │ │ benefits │ │  users   │ │ plaid_     │ │
         │  └───────┘ └──────────┘ │ user_    │ │ connections│ │
         │                         │ cards    │ └────────────┘ │
         │                         └──────────┘                 │
         │  ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ │
         │  │ benefit_usage│ │ matched_tx  │ │ transactions │ │
         │  └──────────────┘ └─────────────┘ └──────────────┘ │
         │                                                       │
         └───────────────────────────────────────────────────────┘
```

---

## Next.js Project Structure

```
reserve-tracker/
├── app/
│   ├── layout.tsx                  # Root layout, fonts, global styles
│   ├── page.tsx                    # Landing / marketing page
│   │
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard (server component)
│   │   ├── loading.tsx             # Skeleton while data loads
│   │   └── _components/
│   │       ├── BenefitCard.tsx
│   │       ├── SummaryBar.tsx
│   │       ├── CountdownTimer.tsx
│   │       ├── CardSelector.tsx
│   │       ├── TransactionFeed.tsx
│   │       └── AnniversaryPrompt.tsx  # Asks user if we can't auto-detect
│   │
│   ├── cards/
│   │   └── [cardId]/
│   │       └── page.tsx            # Per-card detail view
│   │
│   ├── onboarding/
│   │   └── page.tsx                # Link account + select card + confirm anniversary
│   │
│   ├── settings/
│   │   └── page.tsx                # Manage linked accounts, cards
│   │
│   └── api/
│       ├── plaid/
│       │   ├── create-link-token/route.ts
│       │   ├── exchange-token/route.ts
│       │   ├── sync/route.ts
│       │   └── webhook/route.ts
│       │
│       ├── benefits/
│       │   ├── usage/route.ts
│       │   └── confirm/route.ts     # Manual confirm for ambiguous matches
│       │
│       └── cards/
│           └── route.ts
│
├── lib/
│   ├── plaid.ts                     # Plaid client config
│   ├── db.ts                        # Prisma/Drizzle client
│   │
│   ├── engine/
│   │   ├── matcher.ts               # Core matching logic
│   │   ├── anniversary-detector.ts  # Finds fee charge in transactions
│   │   └── cycle-utils.ts           # Cycle date math
│   │
│   ├── cards/                       # Card + benefit definitions (in code)
│   │   ├── index.ts                 # Registry: exports all cards
│   │   ├── chase-sapphire-reserve.ts
│   │   ├── amex-gold.ts             # Future
│   │   └── capital-one-venture-x.ts # Future
│   │
│   └── types.ts                     # Shared TypeScript types
│
├── prisma/
│   └── schema.prisma
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Data Model

### Entity Relationship Diagram

```
┌──────────┐       ┌────────────┐       ┌────────────────┐
│   User   │──1:N──│  UserCard  │──N:1──│     Card       │
└──────────┘       └─────┬──────┘       └───────┬────────┘
     │                   │                      │
     │                   │                   1:N│
     │                   │              ┌───────▼────────┐
     │                   │              │    Benefit     │
     │                   │              └───────┬────────┘
     │                   │                      │
     │              ┌────▼──────────┐        1:N│
     │              │    Plaid      │   ┌───────▼────────┐
     │              │  Connection   │   │ BenefitUsage   │
     │              └────┬──────────┘   └───────┬────────┘
     │                   │                      │
     │              ┌────▼──────────┐   ┌───────▼────────┐
     │              │  Transaction  │───│  MatchedTx     │
     │              └───────────────┘   └────────────────┘
```

---

### `Card`

Defined in code (`lib/cards/*.ts`), seeded to DB on deploy.

```ts
type Card = {
  id:            string       // "chase_sapphire_reserve"
  name:          string       // "Chase Sapphire Reserve®"
  issuer:        string       // "chase"
  network:       "visa" | "amex" | "mastercard"
  annual_fee:    number       // 795
  fee_descriptor: string      // Plaid merchant pattern for the annual fee charge
                              // e.g. "annual membership fee" or "chase sapphire"
  image_url:     string | null
  is_active:     boolean
}
```

---

### `Benefit`

Defined in code alongside each Card. This is the rules engine.

```ts
type BenefitCycle =
  | "monthly"
  | "biannual_h1"       // Jan 1 – Jun 30
  | "biannual_h2"       // Jul 1 – Dec 31
  | "annual_calendar"   // Jan 1 – Dec 31
  | "annual_anniversary"// Resets on card anniversary
  | "quadrennial"       // Every 4 years

type Benefit = {
  id:                  string         // "csr_doordash_restaurant"
  card_id:             string         // "chase_sapphire_reserve"
  name:                string         // "DoorDash Restaurant Promo"
  icon:                string         // "🛵"
  category:            "travel" | "dining" | "entertainment" | "transport"
                       | "fitness" | "shopping" | "subscription"
  type:                "credit" | "subscription"

  // ── Credit rules ──
  credit_amount:       number         // 5
  cycle:               BenefitCycle   // "monthly"
  carries_over:        boolean        // false (most don't)
  max_carryover_periods: number | null // 2 (for DoorDash $5 restaurant)
  max_accrued:         number | null  // 15 (for DoorDash $5 restaurant)

  // ── Matching rules ──
  merchant_patterns:   string[]       // ["doordash"]
  plaid_categories:    string[]       // optional Plaid PFC codes
  auto_matchable:      boolean        // false for Edit, Exclusive Tables
  requires_activation: boolean        // true for StubHub, Peloton, Apple
  priority:            number         // lower = matched first

  // ── Metadata ──
  description:         string
  notes:               string | null
  sunset_date:         string | null  // "2027-09-30" — when perk expires
  source_url:          string | null  // link to official T&C
}
```

---

### `User`

```ts
type User = {
  id:            string    // UUID
  email:         string    // unique
  name:          string | null
  created_at:    Date
  last_active:   Date
}
```

---

### `UserCard`

Links a user to a card they're tracking, with anniversary detection state.

```ts
type UserCard = {
  id:                   string
  user_id:              string    // → User
  card_id:              string    // → Card
  anniversary_date:     Date | null   // detected or user-provided
  anniversary_source:   "auto_detected" | "user_provided" | "pending"
  is_primary:           boolean
  added_at:             Date
}
```

---

### `PlaidConnection`

```ts
type PlaidConnection = {
  id:                  string
  user_id:             string    // → User
  user_card_id:        string    // → UserCard (ties Plaid account to specific card)
  plaid_item_id:       string
  plaid_access_token:  string    // encrypted at rest
  institution_name:    string
  account_id:          string    // specific CC account within the item
  status:              "active" | "needs_reauth" | "disconnected"
  last_sync_cursor:    string | null
  last_synced_at:      Date | null
  created_at:          Date
}
```

---

### `Transaction`

```ts
type Transaction = {
  id:                        string    // Plaid's transaction_id
  plaid_connection_id:       string    // → PlaidConnection
  user_id:                   string    // → User
  date:                      Date
  merchant_name:             string | null    // cleaned
  merchant_name_raw:         string | null    // original from Plaid
  amount:                    number           // positive = charge
  plaid_category_primary:    string | null    // "FOOD_AND_DRINK"
  plaid_category_detailed:   string | null    // "FOOD_AND_DRINK_RESTAURANTS"
  is_annual_fee:             boolean          // flagged by anniversary detector
  pending:                   boolean
  created_at:                Date
}
```

---

### `BenefitUsage`

One record per benefit per active cycle period.

```ts
type BenefitUsage = {
  id:                string
  user_id:           string    // → User
  benefit_id:        string    // → Benefit
  card_id:           string    // → Card (denormalized)

  period_key:        string    // "2026-01" | "2026-H1" | "2026" | "2026-ANN"
  cycle_start:       Date
  cycle_end:         Date

  amount_used:       number
  amount_remaining:  number
  is_fully_used:     boolean

  // Carryover tracking (for DoorDash restaurant credit)
  carried_from:      string | null    // previous period_key
  carried_amount:    number           // 0 if no carryover

  // Manual override
  manual_override:   boolean
  override_note:     string | null

  updated_at:        Date
  // UNIQUE(user_id, benefit_id, period_key)
}
```

---

### `MatchedTx`

```ts
type MatchedTx = {
  id:                string
  transaction_id:    string    // → Transaction
  benefit_usage_id:  string    // → BenefitUsage
  credit_applied:    number
  match_method:      "auto" | "manual"
  match_confidence:  "high" | "medium" | "low"
  matched_at:        Date
  // UNIQUE(transaction_id, benefit_usage_id)
}
```

---

## Benefits Registry: Chase Sapphire Reserve (Verified)

### Cycle Reset Rules (Verified from Chase.com + TPG + CreditKarma)

| Credit | Cycle | Resets On | Carries Over? |
|---|---|---|---|
| Travel Credit ($300) | **Anniversary** | Card anniversary + next statement close | N/A — accumulates until $300 hit |
| The Edit Hotel ($250 × 2) | Biannual (calendar) | Jan 1 / Jul 1 (2026+: anytime) | ❌ No |
| Exclusive Tables ($150 × 2) | Biannual (calendar) | Jan 1 / Jul 1 | ❌ No |
| StubHub ($150 × 2) | Biannual (calendar) | Jan 1 / Jul 1 | ❌ No |
| DoorDash Restaurant ($5) | Monthly | 1st of month | ✅ Up to 2 months (max $15 accrued) |
| DoorDash Non-Restaurant ($10 × 2) | Monthly | 1st of month | ❌ No |
| Lyft ($10) | Monthly | 1st of month | ❌ No |
| Peloton ($10) | Monthly | 1st of month | ❌ No |
| Apple TV+ | Subscription | N/A | N/A |
| Apple Music | Subscription | N/A | N/A |
| DashPass | Subscription | N/A | N/A |
| Global Entry/TSA ($120) | Every 4 years | N/A | N/A |

**Important**: The travel credit is the ONLY benefit on an anniversary cycle. Everything else is calendar-based.

### DoorDash — Three Separate Sub-Credits

DoorDash is NOT a single $25/month credit. It's three distinct promos with different rules:

```ts
// 1. Restaurant promo
{
  id: "csr_doordash_restaurant",
  name: "DoorDash Restaurant Promo",
  credit_amount: 5,
  cycle: "monthly",
  carries_over: true,
  max_carryover_periods: 2,
  max_accrued: 15,
  merchant_patterns: ["doordash"],
  notes: "Applied at checkout on restaurant orders. Can accrue up to $15.",
}

// 2. Non-restaurant promo #1
{
  id: "csr_doordash_nonrestaurant_1",
  name: "DoorDash Non-Restaurant Promo 1",
  credit_amount: 10,
  cycle: "monthly",
  carries_over: false,
  merchant_patterns: ["doordash"],
  notes: "Grocery, convenience, retail orders. Use-it-or-lose-it.",
}

// 3. Non-restaurant promo #2
{
  id: "csr_doordash_nonrestaurant_2",
  name: "DoorDash Non-Restaurant Promo 2",
  credit_amount: 10,
  cycle: "monthly",
  carries_over: false,
  merchant_patterns: ["doordash"],
  notes: "Second $10 promo. Same rules as #1.",
}
```

**Matching challenge**: All three show up as "DOORDASH" in Plaid. We cannot distinguish restaurant vs. non-restaurant orders from transaction data alone. Options:
1. **Treat as a single $25/month bucket** in the UI with a note that it's technically 3 promos (recommended for v1)
2. Ask user to manually tag which DoorDash orders were restaurant vs. non-restaurant
3. Use Plaid's detailed category if it distinguishes (unlikely — DoorDash is the merchant, not the restaurant)

**Recommendation for v1**: Display as one combined "DoorDash Credits" card showing $25/month, with a tooltip explaining the 3-promo structure. Track total DoorDash spend against $25. This is slightly imprecise but avoids user friction.

### Full Benefit Definitions

| ID | Name | $ | Cycle | Auto? | Carries Over? | Activation? | Sunset | Priority |
|---|---|---|---|---|---|---|---|---|
| `csr_travel` | Travel Credit | 300 | anniversary | ✅ | Accumulates | No | — | 30 |
| `csr_edit_h1` | The Edit Hotel (H1) | 250 | biannual_h1 | ❌ | No | No | — | 5 |
| `csr_edit_h2` | The Edit Hotel (H2) | 250 | biannual_h2 | ❌ | No | No | — | 5 |
| `csr_dining_h1` | Exclusive Tables (H1) | 150 | biannual_h1 | ❌ | No | No | — | 10 |
| `csr_dining_h2` | Exclusive Tables (H2) | 150 | biannual_h2 | ❌ | No | No | — | 10 |
| `csr_stubhub_h1` | StubHub (H1) | 150 | biannual_h1 | ✅ | No | Yes | 2027-12-31 | 15 |
| `csr_stubhub_h2` | StubHub (H2) | 150 | biannual_h2 | ✅ | No | Yes | 2027-12-31 | 15 |
| `csr_doordash` | DoorDash Credits | 25 | monthly | ✅ | Partial* | Yes | 2027-12-31 | 20 |
| `csr_lyft` | Lyft Credit | 10 | monthly | ✅ | No | No | 2027-09-30 | 20 |
| `csr_peloton` | Peloton Credit | 10 | monthly | ✅ | No | Yes | 2027-12-31 | 20 |
| `csr_global_entry` | Global Entry / TSA | 120 | quadrennial | ✅ | N/A | No | — | 40 |
| `csr_apple_tv` | Apple TV+ | — | subscription | N/A | N/A | Yes | 2027-06-22 | — |
| `csr_apple_music` | Apple Music | — | subscription | N/A | N/A | Yes | 2027-06-22 | — |
| `csr_dashpass` | DashPass | — | subscription | N/A | N/A | Yes | 2027-12-31 | — |

*DoorDash: $5 restaurant portion carries over up to 2 months. $10 non-restaurant promos do not. Simplified to $25 combined in v1.

**Annual credit value if fully used: ~$2,710**

---

## Anniversary Detection Logic

The card anniversary determines when the $300 travel credit resets and when the $795 fee is charged. We detect this automatically when possible.

```
On initial Plaid sync (pulls up to 24 months of history):
  │
  ├─ STEP 1: Scan for annual fee transaction
  │   Look for transactions where:
  │     - amount ≈ $795 (or $550 for legacy)
  │     - merchant_name matches card.fee_descriptor
  │       (e.g., "ANNUAL MEMBERSHIP FEE", "CHASE SAPPHIRE")
  │     - plaid_category = "BANK_FEES_AND_CHARGES"
  │   If found:
  │     - Flag transaction: is_annual_fee = true
  │     - Set UserCard.anniversary_date = transaction.date
  │     - Set UserCard.anniversary_source = "auto_detected"
  │     - Compute travel credit cycle boundaries
  │
  ├─ STEP 2: If no fee transaction found
  │   Show AnniversaryPrompt component:
  │     "We couldn't detect your card anniversary date.
  │      When did you open your Sapphire Reserve?"
  │     → Date picker input
  │     - Set UserCard.anniversary_source = "user_provided"
  │
  └─ STEP 3: Ongoing monitoring
      On each Plaid sync, continue scanning for fee charges
      to auto-correct if user-provided date was wrong.
```

---

## Matching Engine

### Flow

```
Plaid sync delivers new transactions
         │
         ▼
┌─────────────────────────────────────┐
│  1. FILTER                          │
│  - Non-pending only                 │
│  - Card-scoped (via PlaidConnection │
│    → UserCard → Card)               │
│  - Skip already-matched tx IDs      │
│  - Run anniversary detector on fees │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  2. NORMALIZE                       │
│  - Lowercase merchant_name          │
│  - Strip suffixes (*ORDER, #123)    │
│  - Map Plaid PFC v2 codes           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  3. MATCH (per card)                │
│  For each Benefit on this card:     │
│    - Is auto_matchable = true?      │
│    - Is cycle currently active?     │
│    - Is benefit not fully used?     │
│    - Does merchant_name contain any │
│      pattern in merchant_patterns?  │
│    - (Optional) Does plaid_category │
│      match plaid_categories?        │
│  Collect all matches, sort by       │
│  priority (ascending)               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  4. APPLY                           │
│  - Assign credit to highest-        │
│    priority match                   │
│  - credit = min(tx.amount,          │
│               benefit.remaining)    │
│  - Create MatchedTx record          │
│  - Update BenefitUsage              │
│  - If carries_over: check accrual   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  5. FLAG AMBIGUOUS                  │
│  - If tx could match a non-auto     │
│    benefit (Edit, Exclusive Tables) │
│    create a pending match for user  │
│    review in the UI                 │
└─────────────────────────────────────┘
```

### Match Confidence

| Confidence | Criteria | Example |
|---|---|---|
| **High** | merchant_patterns + plaid_category both match | "DOORDASH" + FOOD_AND_DRINK → csr_doordash |
| **Medium** | merchant_patterns match only | "LYFT *RIDE 8472" → csr_lyft |
| **Low** | plaid_category only, no merchant match | Travel-category tx → csr_travel (could be Edit?) |

### Multi-Card Scoping

A Plaid account is linked to exactly one `UserCard` via `PlaidConnection.user_card_id`. The matching engine only evaluates benefits for that card. If a user tracks two cards on two different Plaid accounts, transactions never cross-match.

---

## Key Computed Values

### Per Card

```
Credits Available     = Σ active benefit.credit_amount (where cycle is in-range)
Credits Used          = Σ benefit_usage.amount_used
Credits Expired       = Σ unused amounts where cycle_end < today
Effective Annual Fee  = card.annual_fee - Credits Used (within anniversary year)
ROI %                 = (Credits Used / card.annual_fee) × 100
Days Until Next Expiry= min(days_remaining) across all unused benefits
Value at Risk         = Σ amount_remaining for benefits expiring within 14 days
```

### Across All Cards

```
Total Annual Fees     = Σ card.annual_fee for all user's cards
Total Credits Used    = Σ all benefit_usage.amount_used
Net Cost              = Total Annual Fees - Total Credits Used
Overall ROI %         = (Total Credits Used / Total Annual Fees) × 100
```

---

## Plaid Integration

### Connection Flow

```
User clicks "Link Card"
        │
        ▼
POST /api/plaid/create-link-token
  → products: ["transactions"]
  → Returns link_token
        │
        ▼
Frontend: Plaid Link modal
  → Chase OAuth (app-to-app on mobile)
  → Returns public_token + account metadata
        │
        ▼
POST /api/plaid/exchange-token
  → /item/public_token/exchange → access_token
  → Store in PlaidConnection (encrypted)
  → Trigger initial /transactions/sync (up to 24 months)
        │
        ▼
Anniversary detector scans for fee charge
Matching engine processes all transactions
Dashboard renders
```

### Ongoing Sync

| Method | Trigger | Purpose |
|---|---|---|
| **Plaid webhook** | `SYNC_UPDATES_AVAILABLE` → `/api/plaid/webhook` | Real-time new transaction processing |
| **Vercel cron** | Every 6 hours | Backup catch for missed webhooks |
| **Manual refresh** | User clicks "Sync" in UI | On-demand |

---

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | API routes + RSC + one deploy |
| Frontend | **React + Tailwind** | Fast iteration |
| Database | **PostgreSQL** | Relational model, good JSON support |
| ORM | **Drizzle** | Lightweight, type-safe, good DX |
| Auth | **NextAuth.js** | Easy email/OAuth setup |
| Bank Link | **Plaid Link + SDK** | Handles Chase OAuth |
| Hosting | **Vercel** | Native Next.js, cron, edge |
| DB Hosting | **Neon** | Serverless Postgres, free tier |
| Encryption | **AES-256-GCM** | For Plaid access tokens at rest |
| Card defs | **In code** (`lib/cards/`) | Version-controlled, deploys are quick |

---

## Open Questions (Remaining)

1. **DoorDash granularity**: v1 treats it as $25/month combined. If users complain about accuracy, v2 could add a DoorDash order-type tagger. Good enough for now?

2. **Edit hotels in 2026+**: Chase changed from biannual to "anytime during the year" for Edit credits starting 2026. Need to update the cycle type to `annual_calendar` for this benefit from 2026 onward.

3. **$75K spend tier**: The Reserve unlocks additional benefits (IHG Diamond, Southwest A-List, $250 Shops at Chase) after $75K annual spend. Should we track spend velocity toward this threshold? Not for v1, but the transaction data is there.

4. **Statement credit verification**: We decided to trust matching logic. But as a future enhancement, we could scan for negative (credit) transactions from Chase that correspond to our matched benefits as a secondary confirmation.

5. **Subscription activation tracking**: Apple TV+, Apple Music, DashPass, and StubHub all require one-time activation. The app should remind users to activate, but can't detect it via Plaid. Manual toggle in the UI.
