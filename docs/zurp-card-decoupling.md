# Zurp — Card & Transaction Decoupling

## What This Is

This spec separates the concept of a **Plaid connection** (a linked bank account with transaction data) from a **card profile** (a credit card type with a known benefit structure). Today these are married at link time — when a user connects their Chase Sapphire Reserve, the Plaid connection and the card type are stored as a single entity. This spec breaks them apart so that:

1. Transaction data flows from Plaid connections and lives independently.
2. Card profiles are a configuration layer the user can change.
3. The insight engine becomes a pure function: `transactions + card_profile → insights`.
4. A dedicated Compare page can run the user's transactions against every supported card simultaneously.

---

## Why This Matters

**For CSP users**: The CSP has ~$290 in hard credits vs. the CSR's ~$2,060. The Compare page lets CSP users see exactly what they'd gain (or lose) on other cards — using their own spending data, not generic marketing claims.

**For CSR users**: A CSR holder paying $795/yr who isn't capturing enough value can instantly see whether the CSP at $95/yr is a smarter fit for their actual habits.

**For the architecture**: Decoupling makes multi-card support trivial later. Adding a new card type is just adding a benefit config and competitor map entries — no changes to the transaction pipeline, insight engine, or Compare page.

---

## Part 1: Data Model

### Current Model (Coupled)

```
users
  └── cards (plaid_item_id + card_type + benefits are one record)
        └── transactions
        └── insights
```

The `card_type` and `plaid_item_id` live on the same row. Changing the card type means updating the card record, and there's no concept of evaluating other cards.

### New Model (Decoupled)

```
users
  ├── plaid_connections (owns the Plaid link and transaction data)
  │     └── transactions
  │
  ├── card_profiles (owns the card type — user's actual card)
  │
  ├── insights (generated for the user's active card profile)
  │
  └── comparison_results (ephemeral, generated for the Compare page)
```

### Schema

```sql
-- Plaid connection: owns the link and transaction data
-- One user can have multiple connections (e.g., personal + business card)
CREATE TABLE plaid_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plaid_item_id TEXT NOT NULL UNIQUE,
  plaid_access_token TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_mask TEXT,                    -- last 4 digits, for display
  institution_name TEXT,                -- 'Chase', 'Capital One', etc.
  sync_cursor TEXT,                     -- Plaid transactions/sync cursor
  last_synced_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'disconnected', 'error'
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Card profile: the user's actual card
-- Linked to a plaid_connection, drives the insight engine
CREATE TABLE card_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plaid_connection_id UUID NOT NULL REFERENCES plaid_connections(id),
  
  card_type TEXT NOT NULL,              -- 'csr', 'csp', 'venture_x', etc.
  card_label TEXT,                      -- user-facing name, e.g., 'My Sapphire Reserve'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  anniversary_date DATE,               -- card anniversary (for annual benefit resets)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce: one active card profile per plaid connection
CREATE UNIQUE INDEX idx_one_active_per_connection 
  ON card_profiles(plaid_connection_id) 
  WHERE is_active = TRUE;

-- Benefit state: tracks real usage per benefit for the user's actual card
CREATE TABLE benefit_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_profile_id UUID NOT NULL REFERENCES card_profiles(id),
  benefit_key TEXT NOT NULL,            -- e.g., 'csr_stubhub_credit'
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  max_value NUMERIC NOT NULL,           -- e.g., 150.00
  used_value NUMERIC NOT NULL DEFAULT 0,
  remaining_value NUMERIC GENERATED ALWAYS AS (max_value - used_value) STORED,
  
  UNIQUE(card_profile_id, benefit_key, period_start)
);

-- Insights: generated for the user's active card profile only
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  card_profile_id UUID NOT NULL REFERENCES card_profiles(id),
  
  category TEXT NOT NULL,
  benefit_id UUID REFERENCES benefits(id),
  
  template_key TEXT NOT NULL,
  template_vars JSONB NOT NULL,
  rendered_copy TEXT NOT NULL,
  
  dollar_impact_score INTEGER NOT NULL,
  urgency_score INTEGER NOT NULL,
  actionability_score INTEGER NOT NULL,
  novelty_score INTEGER NOT NULL,
  confidence_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  floor_override BOOLEAN NOT NULL DEFAULT FALSE,
  
  state TEXT NOT NULL DEFAULT 'pending',
  
  triggered_by_transaction_id UUID REFERENCES transactions(id),
  period_start DATE,
  period_end DATE,
  
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shown_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  dedup_key TEXT NOT NULL,
  UNIQUE(user_id, card_profile_id, dedup_key)
);

-- Comparison results: cached results for the Compare page
-- One row per supported card type per user
-- Regenerated when transactions change or user visits Compare with stale data
CREATE TABLE comparison_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plaid_connection_id UUID NOT NULL REFERENCES plaid_connections(id),
  card_type TEXT NOT NULL,              -- the card being evaluated
  
  -- Aggregate values
  total_estimated_value NUMERIC NOT NULL,    -- total benefits this user would capture
  credit_value NUMERIC NOT NULL,             -- value from hard credits/subscriptions
  points_value NUMERIC NOT NULL,             -- incremental points value at 1.25cpp
  annual_fee NUMERIC NOT NULL,
  net_value NUMERIC GENERATED ALWAYS AS (total_estimated_value - annual_fee) STORED,
  
  -- Benefit capture percentage
  capture_pct NUMERIC NOT NULL,              -- % of trackable benefits captured
  
  -- Per-benefit breakdown stored as JSON
  benefit_breakdown JSONB NOT NULL,
  -- e.g., [{"benefit": "StubHub Credit", "max": 150, "estimated_capture": 95, 
  --         "source": "transaction_match", "trackable": true},
  --        {"benefit": "Priority Pass", "estimated_capture": null, 
  --         "source": "non_trackable", "trackable": false}]
  
  -- Metadata
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  transaction_count INTEGER NOT NULL,         -- how many transactions were analyzed
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, plaid_connection_id, card_type)
);
```

### Key Design Decisions

**No "comparison profiles."** The previous spec created card_profile records with `mode: 'comparison'` to represent hypothetical cards. This version eliminates that concept entirely. Card profiles are always real cards. Comparison data lives in its own denormalized table (`comparison_results`) that acts as a cache. This is simpler and avoids polluting the insight pipeline with hypothetical data.

**Gain/lose is computed at read time.** The `comparison_results` table stores absolute values per card type. The "You'd gain / You'd lose" framing is calculated when rendering the Compare page by diffing the comparison card's benefits against the user's current card profile. This means the gain/lose section updates instantly when the user changes their card type in the selector — no recomputation needed.

---

## Part 2: Card Selector

### Location & Role

The card selector lives in the **side panel**, at the top directly under the Zurp logo. It shows the user's active card and provides access to change the card type. It sets the global context for all pages — Spending, Benefits, and Compare all operate relative to the selected card.

```
┌─────────────────────────┐
│      [Zurp Logo]        │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │ Sapphire Reserve  │  │  ← Card selector (always visible)
│  │ Chase •••• 4821   │  │
│  └───────────────────┘  │
├─────────────────────────┤
│                         │
│  📊  Spending           │
│  🎁  Benefits           │
│  🔄  Compare            │  ← New page
│  ⚙️  Settings           │
│                         │
├─────────────────────────┤
│  Last synced: 2h ago    │
└─────────────────────────┘
```

### Card Selector Behavior

Tapping the card selector opens a dropdown:

```
┌──────────────────────────────┐
│  YOUR CARD                   │
│                              │
│  ● Sapphire Reserve  ✓      │
│  ○ Sapphire Preferred        │
│                              │
│  ── Connected account ──     │
│  Chase •••• 4821             │
│  Last synced: 2h ago         │
└──────────────────────────────┘
```

The card type list shows all supported card types. Selecting a different type triggers the change flow.

### How Card Selection Affects Each Page

| Page | Effect of card selector |
|---|---|
| **Spending** | Shows insights generated for the selected card type. |
| **Benefits** | Shows real benefit tracking (used/remaining) for the selected card type. |
| **Compare** | Shows the selected card as the ★ baseline "Your Card" at the top. All other supported cards ranked below it. Gain/lose calculated relative to this card. |

### Card Type Change Flow

```
User taps a different card type in the selector
  → Confirmation:
    "Change your card to Sapphire Preferred?
     This will update your benefit tracking and insights.
     Your transaction history is not affected."
  → User confirms
    → card_profile.card_type updated
    → benefit_state records regenerated for new card type
    → C0 regenerated with new benefit structure
    → Insight engine re-runs
    → Compare page gain/lose recalculated (no recomputation — 
      just a different baseline for the diff)
```

---

## Part 3: The Compare Page

### What It Is

A dedicated page in the main navigation. When the user opens it, Zurp shows pre-computed results of their transaction history run against every supported card type, ranked by estimated net value. The user's current card (from the side panel selector) is the baseline at the top.

### Page Layout

```
┌─────────────────────────────────────────────────┐
│  COMPARE CARDS                                   │
│  Based on your last 12 months of spending        │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  ★ YOUR CARD                                │ │
│  │  Sapphire Reserve · $795/yr fee             │ │
│  │                                             │ │
│  │  $1,140 estimated value                     │ │
│  │  ████████████████████░░░░  55% of benefits  │ │
│  │                                             │ │
│  │  Net: +$345/yr                              │ │
│  │  ──────────────────────                     │ │
│  │  Credits:  $840   Points: $300              │ │
│  │                                             │ │
│  │  [See details ↓]                            │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  Sapphire Preferred · $95/yr fee            │ │
│  │                                             │ │
│  │  $310 estimated value                       │ │
│  │  ██████████████████████████  78% of benefits│ │
│  │                                             │ │
│  │  Net: +$215/yr                              │ │
│  │  ──────────────────────                     │ │
│  │  Credits:  $170   Points: $140              │ │
│  │                                             │ │
│  │  You'd gain: Lower fee ($700/yr savings)    │ │
│  │  You'd lose: StubHub credit, Apple Music,   │ │
│  │    travel credit (~$870/yr value)           │ │
│  │                                             │ │
│  │  [See details ↓]                            │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  🔒 More cards coming soon                  │ │
│  │  Amex Gold · Capital One Venture X          │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  Based on posted transactions from                │
│  Feb 2025 – Feb 2026. Values are estimates.      │
│  Points at 1.25¢/pt via Chase Travel.            │
└─────────────────────────────────────────────────┘
```

### Summary Card Anatomy

Each card shows:

| Element | Description |
|---|---|
| **Card name + annual fee** | User's current card is badged with ★ YOUR CARD |
| **Estimated value** | Total dollar value from credits + points this user would capture |
| **Benefit capture %** | % of the card's trackable benefits this user's spending would hit. Shows "fit" — 80% = great fit, 25% = poor fit. |
| **Net value** | Estimated value minus annual fee |
| **Credits / Points split** | Breaks value into guaranteed (credits) vs. variable (points) |
| **You'd gain / You'd lose** | Non-current cards only. Benefits this card has vs. doesn't have compared to user's current card. Gain/lose includes dollar values where calculable. |
| **See details** | Expands per-benefit breakdown |

### Expanded Detail View

Tapping "See details" expands a per-benefit breakdown with three sections:

**1. Credits & Subscriptions** — Hard dollar benefits with calculated capture amounts. Each line shows the benefit name, estimated capture, a fill bar, and a one-line explanation of how the estimate was derived (e.g., "Based on $340 at Ticketmaster").

**2. Incremental Points Value** — Points multiplier differences vs. a 1x base rate, with dollar values at 1.25cpp. Each line shows the multiplier, the user's relevant spend, and the incremental value. Annotated with the valuation rate.

**3. Also Includes** — Non-trackable benefits listed qualitatively (lounge access, insurance, no FTF). No dollar values. No fill bars.

### Data Freshness & Generation

Comparison results are pre-computed and cached, not generated live on page load.

| Trigger | What happens |
|---|---|
| **First visit to Compare page** | Full computation against all supported card types. Results cached in `comparison_results`. |
| **Transaction sync completes** | Cached results marked stale (by comparing `generated_at` to `last_synced_at`). Background recomputation. |
| **User changes card type** | Gain/lose sections re-render immediately (it's just a diff against the new baseline). No value recomputation. |
| **Visit with stale cache** | Show cached results immediately with "Updated X ago" note. Background refresh; UI updates when ready. |

**Analysis window**: Most recent 12 months of transaction data (or whatever is available). Annualized to normalize for users with less history.

### Minimum Data State

The Compare page is always accessible in the nav. With fewer than 30 days of data:

```
┌─────────────────────────────────────────────────┐
│  COMPARE CARDS                                   │
│                                                  │
│  We need a bit more spending data to show         │
│  accurate comparisons.                           │
│                                                  │
│  📊  14 days of data so far                      │
│  ██████░░░░░░░░░░░░░░  14/30 days               │
│                                                  │
│  Check back around Feb 23 for your first          │
│  comparison.                                     │
└─────────────────────────────────────────────────┘
```

After 30 days, results appear with a "preliminary" note. After 90+ days, no qualifier.

---

## Part 4: Comparison Value Calculation

### The Core Calculation

For each supported card type, scan the user's transactions and calculate captured value.

```
for each card_type in supported_cards:
  credit_value = 0
  points_value = 0
  breakdown = []
  trackable_max = 0
  trackable_captured = 0
  
  for each benefit in card_type.benefits:
    if benefit.trackable:
      matching_txns = find_transactions(
        transactions, benefit.criteria, analysis_window
      )
      captured = min(sum(matching_txns), benefit.max_per_period)
      trackable_max += benefit.max_per_period
      trackable_captured += captured
      
      if benefit.type in ('statement_credit', 'subscription'):
        credit_value += captured
      elif benefit.type == 'points_multiplier':
        incremental = calc_incremental_points(matching_txns, benefit.multiplier)
        points_value += incremental * 0.0125
      
      breakdown.append({benefit, captured, source: 'transaction_match'})
    else:
      breakdown.append({benefit, captured: null, source: 'non_trackable'})
  
  store comparison_result:
    total = credit_value + points_value
    capture_pct = trackable_captured / trackable_max * 100
    net = total - card_type.annual_fee
```

### Non-Trackable Benefits

Benefits that can't be calculated from Plaid data are shown qualitatively:

| Benefit Type | How it appears |
|---|---|
| Portal-only credits (Chase Travel hotel/travel credit) | Listed as "POTENTIAL" with max value noted, NOT included in total |
| Insurance (trip cancellation, CDW, lost luggage) | Listed in "Also includes" section |
| Lounge access (Priority Pass) | Listed in "Also includes" section |
| Global Entry/TSA PreCheck credit | Listed in "Also includes" section |

Non-trackable benefits with known dollar values are shown separately so the user can mentally factor them in, but they're excluded from the calculated total to keep comparisons honest.

### Points Valuation

**1.25 cents per point** for Chase Ultimate Rewards. Conservative, matches portal redemption rate. Always displayed separately from credit value and annotated:

```
Points value calculated at 1.25¢/point via Chase Travel.
Transfer partners may offer higher value.
```

---

## Part 5: Insight Engine Changes

### What Changes

The insight engine accepts `card_profile_id` instead of reading card_type from a coupled record. Core logic is unchanged.

```
-- Before:
generate_insights(user_id) →
  card = get_card(user_id)
  benefits = get_benefits(card.card_type)
  transactions = get_transactions(card.plaid_item_id)

-- After:
generate_insights(user_id, card_profile_id) →
  profile = get_card_profile(card_profile_id)
  connection = get_plaid_connection(profile.plaid_connection_id)
  benefits = get_benefits(profile.card_type)
  transactions = get_transactions(connection.id)
```

### The Insight Engine Does NOT Power the Compare Page

The Compare page has its own calculation pipeline. The insight engine generates scored, lifecycle-tracked insights for the user's current card. The comparison engine produces aggregate value estimates across all supported cards.

Keeping these separate avoids polluting insight metrics with hypothetical data, managing lifecycle states for cards the user doesn't have, and scoring model distortion.

### Data Flow

```
                    [Plaid Sync] → [Transaction Store]
                                         │
                    ┌────────────────────┤────────────────────┐
                    ↓                    │                    ↓
            [Card Profile]               │          [Compare Engine]
                    ↓                    │                    ↓
         [Insight Generator]             │     [Run against all card types]
                    ↓                    │                    ↓
          [Scoring & Ranking]            │      [comparison_results cache]
                    ↓                    │                    ↓
          [Spending Page]                │         [Compare Page]
```

Two separate read paths from the same transaction store. No interaction between them.

---

## Part 6: Metrics

### Compare Page Metrics

| Metric | Definition | Why it matters |
|---|---|---|
| **Compare page visits** | Times per user per month | Core engagement signal |
| **Detail expansion rate** | % of summary cards where user taps "See details" | Measures depth of interest |
| **Most-viewed card types** | Which comparison cards get the most detail views | Informs card support priority |
| **Compare-to-change rate** | % of Compare visits followed by card type change within 7 days | Measures real-world impact |
| **Time on Compare page** | Average session duration | Engagement depth |

### Existing Metrics — No Change

All insight-level and user-level metrics remain scoped to the user's active card profile. The Compare page has its own metric set.

---

## Part 7: Constraints & Guardrails

**Zurp shows data, not recommendations.** The Compare page shows what the user's spending would look like on each card. Cards are ranked by net value, but the page never says "you should switch." The user decides.

**No affiliate links or referral revenue.** No "Apply now" buttons, no issuer referral links. The moment comparison generates revenue from issuers, user trust is gone.

**Honest about uncertainty.** Non-trackable benefits are labeled as "POTENTIAL" or excluded. Points values annotated with the valuation rate. Analysis period stated. The user always understands what's estimated vs. confirmed.

**No comparison for incomplete catalogs.** If Zurp doesn't have a fully validated benefit catalog for a card, it doesn't appear on the Compare page.

**The Compare page never generates push notifications or insights.** It's a passive reference tool, not an outreach channel.

**Comparisons are always relative to the user's current card.** The gain/lose framing keeps it grounded — always "compared to what you have now."

---

## Part 8: Implementation Phases

### Phase 1: Data model migration
- Split `cards` table into `plaid_connections` and `card_profiles`
- Migrate existing records
- Update insight engine to accept `card_profile_id`
- Update all queries
- No user-facing changes

### Phase 2: Card selector
- Add card selector to side panel (top, under logo)
- Implement card type change flow with confirmation
- Support CSR and CSP card types
- Re-run C0 and insight engine on card type change

### Phase 3: Compare page
- Add Compare to side panel navigation
- Build comparison calculation engine
- Build `comparison_results` caching and staleness logic
- Build summary card UI (ranked cards, capture %, net value, credits/points split)
- Build expanded detail view (per-benefit breakdown, three sections)
- Build gain/lose diff relative to user's current card
- Build minimum data state (<30 days)
- Build "More cards coming soon" placeholder
- Add Compare page metrics

### Phase 4: Additional card types
- Add benefit catalogs for new cards
- Add competitor map entries
- Compare page picks up new cards automatically

---

## Appendix: Supported Card Types at Launch

| Card Type Key | Card Name | Annual Fee | Benefit Catalog Status |
|---|---|---|---|
| `csr` | Chase Sapphire Reserve | $795 | Complete |
| `csp` | Chase Sapphire Preferred | $95 | In progress (see CSP research plan) |

Additional card types require a benefit catalog, competitor map entries, and points valuation rate. The transaction pipeline, insight engine, and Compare page require no structural changes.
