# Zurp — Points Tracking Integration: Dashboard & Insights Engine

**Version**: 1.1
**Date**: February 2026
**Status**: Proposal
**Dependencies**: zurp-insights-engine.md, zurp-points-engine.md, card catalogs (CSR, CSP, Gold, Platinum, Citi Strata Elite, Venture X)

---

## 1. Problem Statement

The Benefits dashboard currently tracks only hard credits and perks (DoorDash credits, StubHub credits, Global Entry, etc.). This creates three problems:

1. **Cards with few credits look like pure losses.** The Citi Strata Elite shows $0 used, $595 net cost, 0% ROI — even though the user may be earning hundreds in points value. The CSP is similarly disadvantaged: ~$170 in credits vs $95 fee gives a thin margin, but the card's real value proposition is 3x/5x earn rates.

2. **The north star metric is incomplete.** "What percentage of total card value are you capturing?" can't be answered without points. For most cards, points are the majority of annual return.

3. **The ROI calculation is wrong.** C2 (ROI Milestone) currently fires based on credits captured vs annual fee. A CSR user earning $800/yr in points value but only $300 in credits would show as underwater when they're actually well ahead.

### What This Doc Covers

How to integrate the existing Points Earn Model (points-engine.md) into the Benefits dashboard and the Insights Engine. This is not a new system — it's wiring two existing systems together and adding a small number of new insight categories.

### What This Doc Does NOT Cover

- Changes to the Compare page (already powered by points-engine.md)
- Transfer partner valuations or dynamic cpp
- Points redemption tracking

---

## 2. Design Principles

1. **Credits and points are visually distinct.** Credits are concrete (you used $10 at DoorDash or you didn't). Points are estimated (they depend on category mapping confidence and cpp valuation). Never collapse them into a single undifferentiated number without showing the breakdown.

2. **Points tracking requires zero new data.** Everything is derived from Plaid transactions + card earn configs. The category mapper and points calculator from points-engine.md are the source of truth. No new integrations.

3. **Conservative by default, upside available.** All points dollar values use the conservative cpp rate (CSR/CSP: 1.25cpp, Gold: 1.0cpp, Platinum: 1.0cpp, Citi: 1.0cpp, Venture X: 1.0cpp). Upside values are shown secondarily with context.

4. **No false precision.** Points values are estimates. The UI should communicate this through language ("~$614 in points value") and design (lighter visual weight than credit tracking, which is exact).

---

## 3. Dashboard Changes

### 3.1 Summary Stats (Top Bar)

**Current state:**
```
CREDITS USED    NET COST     ROI        EXPIRING SOON
$0              $595         0%         $0
```

**New state:**
```
CREDITS USED    POINTS EARNED    NET VALUE      EXPIRING SOON
$300 of $2,628  ~$614            +$119          $45
```

**All stats are scoped to the currently selected card** (via the existing CardSwitcher). Users with multiple cards (e.g., CSR + Amex Gold) see stats for whichever card is active in the switcher.

Changes:
- **CREDITS USED**: No change in calculation. Now shows "of {total_available}" to contextualize.
- **POINTS EARNED**: New stat. Dollar value of points earned in the current analysis period, calculated by the points engine for the selected card's earn config. Prefixed with "~" to signal estimation. Tooltip: "Based on {conservative_cpp}¢ per point. Transfer partners may yield more."
- **NET VALUE**: Replaces NET COST. Formula: `credits_captured + points_value_conservative - annual_fee`. Scoped to the selected card. Color: green if positive, red if negative. This is the unified ROI number.
- **ROI** removed as a separate stat — it's redundant with NET VALUE and the percentage was confusing when credits were the only input.
- **EXPIRING SOON**: No change.

### 3.2 Benefit Sections

The dashboard currently shows a single "ACTIVE BENEFITS" section with credit/perk cards. Add a second section for points earning.

**Section 1: Credits & Perks** (existing, no changes)
- Benefit cards with progress bars, remaining amounts, expiration dates
- Same layout and behavior as current implementation

**Section 2: Points Earning** (new)
- Shows the selected card's actual points earning broken down by spending category
- Only includes transactions from the selected card's connection — not aggregated across all cards
- Sources data from the points engine's per-transaction calculations (points-engine.md §6)
- Period: current benefit year (aligned to card anniversary or calendar year)

**Points section layout:**

```
POINTS EARNED  ·  Current Year

Total: ~47,200 pts  ·  ~$590 value

┌──────────────────────────────────────────────────┐
│  Dining           $8,400 spent    25,200 pts  3x │
│  ████████████████████░░░░░░░░░░░   ~$315        │
├──────────────────────────────────────────────────┤
│  Travel           $3,200 spent    12,800 pts  4x │
│  ██████████░░░░░░░░░░░░░░░░░░░░░   ~$160        │
├──────────────────────────────────────────────────┤
│  Rideshare (Lyft) $1,200 spent     6,000 pts  5x │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░    ~$75        │
├──────────────────────────────────────────────────┤
│  Everything else  $22,600 spent   22,600 pts  1x │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░   ~$283        │
└──────────────────────────────────────────────────┘

Points valued at 1.25¢ each (conservative). Transfer partners may yield 2.0¢+.
```

The progress bars here represent the category's share of total points earned, not progress toward a cap (most cards have no earn caps). For Gold's grocery category, which has a $25K annual cap, show the cap progress: "$18,750 of $25,000 cap used."

**What the bars are NOT:** They aren't "how much you could earn" — there's no theoretical max on points the way there is for credits. They show relative contribution to total earning. This distinction matters for design: don't use the same green-fill-to-100% treatment as the credits section, since there's no "maxed" state. Use a different visual idiom — proportional bars, spend distribution, or a simple category table.

### 3.3 Data Flow

```
[Plaid Transactions]
        │
        ▼
[Category Mapper] ──────────────── (from points-engine.md §4)
        │
        ├──► [Benefit Matching]     (existing: credits/perks tracking)
        │
        └──► [Points Calculator]    (from points-engine.md §6)
                    │
                    ▼
            [Dashboard API]
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
[Credits Section]        [Points Section]
```

The category mapper becomes a shared dependency. Currently it's scoped to the Compare page flow. This integration promotes it to a core piece of infrastructure that runs on every transaction sync, not just on-demand for comparisons.

### 3.4 Performance Consideration

Points calculation currently runs on-demand for the Compare page. For the dashboard, it needs to be incremental:

- **On transaction sync**: New transactions are categorized and points calculated immediately. Results are stored in `transaction_categories` and aggregated.
- **Dashboard load**: Read pre-computed aggregates, don't recalculate. The dashboard shows cached results from the last sync.
- **Full recalculation**: Only on card config changes or manual refresh. This is the same calculation the Compare page runs, just scoped to the user's own card.

Add an aggregate table to avoid recalculating on every page load:

```sql
CREATE TABLE points_earning_summary (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_profile_id   UUID NOT NULL REFERENCES card_profiles(id) ON DELETE CASCADE,
  card_id           TEXT NOT NULL,          -- denormalized from card_profiles.card_type for query convenience
  period_type       TEXT NOT NULL,          -- 'anniversary_year', 'calendar_year', 'month'
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  total_spend       DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_points      INTEGER NOT NULL DEFAULT 0,
  value_conservative DECIMAL(10,2) NOT NULL DEFAULT 0,
  value_upside      DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_breakdown JSONB NOT NULL DEFAULT '[]',
  last_transaction_date DATE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(card_profile_id, period_type, period_start)
);

CREATE INDEX idx_pts_summary_user ON points_earning_summary(user_id);
CREATE INDEX idx_pts_summary_card ON points_earning_summary(card_profile_id);
```

The unique constraint is on `(card_profile_id, period_type, period_start)` — each card profile gets its own summary rows. A user with CSR + Gold has separate rows for each.

`category_breakdown` JSONB shape: `[{ category: string, spend: number, points: number, earnRate: number, valueConservative: number }]`.

This table is updated incrementally on each transaction sync and read directly by the dashboard API.

**Card type change invalidation**: When a user changes their card type via settings (`updateCardType()`), all `points_earning_summary` rows for that `card_profile_id` must be deleted and recalculated. The earn rates change, so cached aggregates are invalid.

---

## 4. Insights Engine Changes

### 4.1 Modified Insight: C2 (ROI Milestone)

**Current trigger**: Total credits captured crosses 50%, 75%, 100%, 150% of annual fee.

**New trigger**: Total value captured (credits + points) crosses 50%, 75%, 100%, 150%, 200% of annual fee.

This is the most important change. Without points in the C2 calculation, most cards will never trigger the 100% milestone on credits alone. A CSP with $170 in credits and a $95 fee can hit 100% on credits, but a CSR with $2,060 in credits and $795 fee needs to capture 39% of credits just to break even — and that ignores the $500-800+ in points value they're likely earning.

**Updated formula (per-card):**
```
total_value = credits_captured + points_value_conservative   -- for the specific card profile
roi_percentage = total_value / annual_fee * 100
```

C2 is evaluated independently per card. A user's CSR hitting 100% ROI has no effect on their Gold's C2 threshold. The existing `cardProfileId` scoping on the insights table already supports this.

**Updated templates:**

```
Break-even (credits + points):
  "Your card just paid for itself. ${credits} in credits and ~${points_value} in
   points earned — ${total} total against your ${fee} annual fee."

Profitable:
  "You've captured ${total} in value this year — that's ${surplus} beyond your
   annual fee. (${credits} credits + ~${points_value} points)"

Milestone (150%+):
  "${total} in total value this year. That's {multiplier}x your annual fee."
```

**Updated dedup key**: `c2:{cardId}:{threshold}` — must include card ID so that a user's CSR and Gold can independently hit milestones. The existing `cardProfileId` column on the insights table provides the card scoping, but the dedup key itself must also be card-specific to avoid cross-card collision within the `(userId, dedupKey)` unique constraint.

**Scoring impact**: Dollar impact scores will be higher since points + credits > credits alone. This means C2 insights will score higher and appear more frequently, which is correct — ROI milestones are more meaningful when they reflect real total value.

### 4.2 Modified Insight: C0 (Current Value Snapshot)

**Current behavior**: On first connect, scans historical transactions and reports total credits captured for that card.

**New behavior**: Also runs the points calculator against the card's historical transactions and includes points value in the snapshot. Each card connection generates its own C0 — a user connecting CSR and Gold gets two separate C0 insights.

**Updated templates:**

```
Standard:
  "Based on your transaction history, you've captured ${credits} in credits
   and earned ~${points_value} in points this year — ${total} in total value.
   That's {pct_of_fee}% of your annual fee."

Strong:
  "You've already generated ${total} in value from your card — ${credits}
   in credits plus ~${points_value} in points. Your card is {pct_of_fee}%
   paid off. Let's get the rest."

Low history:
  "In the last {months} months, you've captured ${credits} in credits and
   earned ~${points_value} in points. ${total} in total value so far."

Points-dominant (new — for cards where points >> credits):
  "Your spending has earned ~${points_value} in points value this year,
   plus ${credits} in credits. ${total} total — {pct_of_fee}% of your
   annual fee covered."
```

The "points-dominant" template addresses cards like CSP and Strata Elite where credits are a small portion of total value. Without it, "you've captured $50 in credits" would be the lead, burying the $400 in points value.

**Template selection logic:**
```
if credits_captured > points_value_conservative:
  use standard or strong template
elif points_value_conservative > credits_captured * 2:
  use points-dominant template
else:
  use standard template (credits and points are balanced)
```

### 4.3 New Insight Category: P1 (Points Earning Highlight)

A new insight that highlights significant points earning from bonus categories. This fills the gap where a user is earning well on points but has no visibility because the insights engine only talks about credits.

| Field | Detail |
|---|---|
| Category | P1 — Points Earning Highlight |
| Group | C (Celebrate & Reinforce) |
| Trigger | User's spending in a bonus category earned significantly more than base rate would have |
| Data needed | Category spend, earn rate, base rate comparison |
| Example | "Your dining spending earned 25,200 points this year (3x). At base rate, that's only 8,400 — your card earned you an extra ~$210." |
| Dollar signal | Bonus points value minus base rate value |
| Urgency signal | None — celebration |

**Why this exists**: Without P1, a user earning $300/yr extra from their card's 3x dining rate has no visibility into that value. The credits section shows their DoorDash and StubHub usage, but the biggest source of card value — bonus points on everyday spending — is invisible.

**Trigger logic:**
```
For each bonus category on the user's card:
  bonus_points = category_spend * bonus_earn_rate
  base_points = category_spend * base_rate
  extra_points = bonus_points - base_points
  extra_value = extra_points * conservative_cpp

  if extra_value >= $50/year (annualized):
    generate P1 insight for this category
```

The $50 threshold prevents low-value insights ("your 3x on $15 of streaming earned you an extra $0.25").

**Templates:**
```
Standard:
  "Your {category} spending earned {points} points at {rate}x. That's
   ~${extra_value} more than a basic 1x card would earn."

High value:
  "{category} is your card's sweet spot. ${spend} in {category} spending
   earned ~${value} in points this year — {rate}x your card's base rate."
```

**Scoring:**
- Dollar impact: Based on extra_value (bonus minus base)
- Urgency: 20 (no expiration, ongoing)
- Actionability: 20 (no specific action needed — user is already doing the right thing)
- Novelty: Standard decay
- Confidence: Inherits from category mapper confidence for the underlying transactions

**Lifecycle:** Same as other C-group insights. Generated monthly or on milestone thresholds. Won't surface frequently because actionability and urgency are low, but will appear when no higher-scoring A/B insights are available — exactly the right behavior.

**Dedup key:** `p1:{cardId}:{category}:{month}` (e.g., `p1:chase_sapphire_reserve:dining:2026-02`). Must include card ID — a user's Gold and CSR both earn bonus dining, and each should get its own P1.

### 4.4 New Insight Category: P2 (Missed Bonus Opportunity)

A redirect-style insight for points earning. The user is spending in a category where another action would earn more points.

| Field | Detail |
|---|---|
| Category | P2 — Missed Bonus Opportunity |
| Group | A (Redirect Spending) |
| Trigger | User has spending that earns base rate (1x) but could earn bonus rate with a behavior change |
| Data needed | Transaction categorization, card earn config, merchant matching |

**Scoped v1 triggers** (only the high-confidence, high-value cases):

| Scenario | Cards | Example | Action |
|---|---|---|---|
| Uber instead of Lyft | CSR, CSP | "$120/mo on Uber earning 1x. Lyft earns 5x — that's ~$6/mo in extra points." | Switch rideshare provider |
| Non-portal travel (hotels) | CSR | "$2,400 on hotels earning 4x. Chase Travel portal earns 8x — potentially ~$30 more." | Book via Chase Travel |
| Non-portal travel (hotels) | Venture X | "$2,400 on hotels earning 2x. Capital One Travel earns 10x — potentially ~$192 more." | Book via Capital One Travel |
| Non-portal travel (hotels) | Citi Strata Elite | "$2,400 on hotels earning 1.5x. Citi Travel earns 12x — potentially ~$252 more." | Book via Citi Travel |
| Non-portal flights | Gold | "$800 on United.com earning 1x. Amex Travel earns 3x — ~$16 in extra points." | Book via Amex Travel |

**Why this is narrow in v1**: Most points optimization advice ("use your Gold for groceries, CSR for travel") requires multi-card context. P2 is scoped to within-card redirects where the user can change behavior to earn more on their existing card.

**Portal detection**: P2 portal scenarios should only trigger when the user's transactions are categorized as direct travel (e.g., `travel_hotels`, `travel_flights`), not `travel_portal`. If the user is already booking through a portal, the redirect is unnecessary. The category mapper distinguishes portal vs. direct based on merchant name matching (e.g., "CHASE TRAVEL" → `travel_portal`).

**Templates:**
```
Rideshare:
  "You spent ${amount} on {current} last month at 1x. Switch to {partner}
   for {rate}x — that's ~${extra}/mo in extra points."

Portal:
  "${amount} on {category} at {current_rate}x. Book through {portal} for
   {portal_rate}x — ~${extra} more in points value."
```

**Scoring:**
- Dollar impact: Based on annualized extra points value
- Urgency: 20 (ongoing, no expiration)
- Actionability: 80 (switch platform next purchase — same as A1)
- Novelty: Standard decay
- Confidence: High for rideshare (merchant match is definitive), medium for portal (assumption-based)

**Dedup key:** `p2:{cardId}:{scenario}:{month}` (e.g., `p2:chase_sapphire_reserve:uber_to_lyft:2026-02`). Must include card ID — portal redirects are card-specific (CSR → Chase Travel, Venture X → Capital One Travel).

**Relationship to A1**: P2 is about earning more points. A1 is about using credits. They can coexist for the same merchant. Example: A user spending on Uber could see A1 ("use your $10 Lyft credit") AND P2 ("Lyft also earns 5x instead of 1x"). Display rules prevent both from showing in the same session — A1 takes priority because credits are concrete and higher-confidence.

### 4.5 Updated Insight Category Summary

| Category | Group | Type | V1 Status |
|---|---|---|---|
| A1 | A – Redirect | Competitor Redirect (credits) | Existing — no change |
| A2 | A – Redirect | Subscription Swap (credits) | Existing — no change |
| **P2** | **A – Redirect** | **Missed Bonus Opportunity (points)** | **New** |
| B1 | B – Use | Unused Credit (Time Pressure) | Existing — no change |
| B2 | B – Use | Nearly Maxed Credit | Existing — no change |
| B3 | B – Use | Underused Credit | Existing — no change |
| C0 | C – Celebrate | Current Value Snapshot | **Modified** — includes points |
| C1 | C – Celebrate | Benefit Maxed | Existing — no change |
| C2 | C – Celebrate | ROI Milestone | **Modified** — includes points |
| **P1** | **C – Celebrate** | **Points Earning Highlight** | **New** |

Total: 10 categories (8 existing, 2 new). Modified: 2 (C0, C2).

### 4.6 Display Rules Update

Add one rule to the existing display rules (Part 2 of insights-engine.md):

- **Never show P2 and A1 for the same merchant in the same session.** If both exist (e.g., Uber → Lyft redirect for both credit and points), show A1. Credits are concrete; points are estimated. Lead with certainty.

All other display rules remain unchanged. P1 and P2 participate in the standard scoring and ranking system — they don't need special priority rules because their score components (low urgency for P1, moderate actionability for P2) will naturally place them below high-urgency credit insights.

---

## 5. Schema Changes Summary

### New Tables

```sql
-- Pre-computed points earning aggregates for dashboard (see §3.4 for full definition)
CREATE TABLE points_earning_summary (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_profile_id   UUID NOT NULL REFERENCES card_profiles(id) ON DELETE CASCADE,
  card_id           TEXT NOT NULL,
  period_type       TEXT NOT NULL,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  total_spend       DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_points      INTEGER NOT NULL DEFAULT 0,
  value_conservative DECIMAL(10,2) NOT NULL DEFAULT 0,
  value_upside      DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_breakdown JSONB NOT NULL DEFAULT '[]',
  last_transaction_date DATE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(card_profile_id, period_type, period_start)
);

CREATE INDEX idx_pts_summary_user ON points_earning_summary(user_id);
CREATE INDEX idx_pts_summary_card ON points_earning_summary(card_profile_id);
```

### Modified Tables

**insights table** — no schema changes needed. The existing `category` TEXT field accommodates 'P1' and 'P2'. The `template_vars` JSONB field accommodates new variables (points_value, extra_value, earn_rate, etc.).

**No changes to**: transaction_categories, points_simulations, earn_cap_tracking (all defined in points-engine.md and already sufficient).

### New Dedup Keys

| Category | Dedup Key Format | Example |
|---|---|---|
| P1 (Points highlight) | `p1:{cardId}:{category}:{month}` | `p1:chase_sapphire_reserve:dining:2026-02` |
| P2 (Missed bonus) | `p2:{cardId}:{scenario}:{month}` | `p2:chase_sapphire_reserve:uber_to_lyft:2026-02` |

### Updated Dedup Keys (existing categories)

| Category | Old Format | New Format | Reason |
|---|---|---|---|
| C2 (ROI Milestone) | `c2:{threshold}` | `c2:{cardId}:{threshold}` | Per-card ROI milestones |

---

## 6. Implementation Sequence

### Phase 1: Foundation (prerequisite)

**Promote category mapper to shared infrastructure.**

The category mapper (points-engine.md §4) currently runs on-demand for Compare page calculations. It needs to run on every transaction sync so that categorized transactions are available for both the dashboard and insights engine.

Tasks:
1. Move category mapping into the transaction sync pipeline — every new transaction gets a `transaction_categories` record immediately
2. Backfill existing transactions with category assignments
3. Create the `points_earning_summary` table (schema defined in §3.4) and the persistence layer to populate it — the points-engine tables (`transaction_categories`, `earn_cap_tracking`) referenced in points-engine.md were never built; the current implementation is fully on-demand with no DB persistence
4. Update incremental sync: after `processTransactionsForConnection()`, run points calculation for the connection's active card and upsert into `points_earning_summary`
5. Handle card type change invalidation: when `updateCardType()` is called, delete all `points_earning_summary` rows for that `card_profile_id` and trigger full recalculation

**Estimated scope**: The mapper and calculator logic already exist, but the persistence layer (DB tables, incremental update logic, invalidation) is new.

### Phase 2: Dashboard Integration

1. Update summary stats bar: replace NET COST/ROI with POINTS EARNED/NET VALUE
2. Add Points Earning section below Credits & Perks
3. Wire dashboard API to read from `points_earning_summary`
4. Add "~" prefix and tooltip to all points dollar values
5. Add conservative/upside toggle or footnote

**Dependency**: Phase 1 (needs pre-computed aggregates)

### Phase 3: Insights Engine Updates

1. Modify C2 trigger to include points value in total
2. Modify C0 to run points calculator on historical transactions
3. Add C0 points-dominant template and selection logic
4. Implement P1 (Points Earning Highlight) — trigger, scoring, templates, dedup
5. Implement P2 (Missed Bonus Opportunity) — trigger, scoring, templates, dedup (scoped to 3 scenarios)
6. Add A1/P2 mutual exclusion display rule

**Dependency**: Phase 1 (needs category mapper in sync pipeline), Phase 2 (dashboard should show points before insights reference them)

### Phase 4: Validation

1. Verify net value calculation matches Compare page output for the user's own card (these should be identical — same data, same engine)
2. Verify C2 milestones fire at correct thresholds with points included
3. Verify P1 doesn't flood the insights feed (should be low-frequency due to low urgency/actionability scores)
4. Verify P2 and A1 mutual exclusion works correctly
5. Spot-check points values against manual calculations for all 6 card types (CSR, CSP, Gold, Platinum, Citi Strata Elite, Venture X)
6. Verify multi-card users see correct per-card stats when switching between cards in the dashboard
7. Verify card type change triggers recalculation and updates `points_earning_summary`

---

## 7. Edge Cases

### Multi-card users
A user with multiple cards (e.g., CSR + Amex Gold) sees the dashboard scoped to the currently selected card via the existing CardSwitcher. Stats, credits, points earning, and insights are all per-card. Switching cards reloads all sections with that card's data. There is no "aggregated across all cards" view — each card has its own annual fee to justify and its own ROI story.

### Card with no bonus categories
If a card has only 1x earning across all categories (unlikely for premium cards, but possible for a basic card), the Points Earning section shows total points at base rate. P1 never triggers (no bonus to highlight). P2 never triggers (no within-card optimization possible). The section still has value: it shows the user what their spending is earning, even at base rate.

### Points value exceeds credits value significantly
For cards like CSP where points are ~80% of total value, the dashboard should lead with the points section, not the credits section. Section ordering logic:

```
if points_value_conservative > credits_captured * 2:
  show Points Earning first, then Credits & Perks
else:
  show Credits & Perks first, then Points Earning
```

This ensures the dashboard leads with whatever is most relevant to the user's card.

### New card connection with sparse data
Same handling as C0's existing sparse data logic: if < 3 months of transactions, show actual data with a note ("Based on {n} months of data"). Points values will be small but still more useful than showing $0 everywhere.

### Refunds
Handled by points-engine.md §11.3. Refunds subtract from category spend and points accordingly. The dashboard aggregates reflect net spend after refunds.

### Cap approaching (Gold grocery)
When Gold grocery spend approaches the $25K cap, this is a useful signal. However, it doesn't fit cleanly into existing categories — it's not a credit expiring (B1), not a redirect (A1), and not a celebration (C1). This is deferred to Phase 2 as a potential B-group insight: "You've spent $23,500 on groceries this year. After $25,000, your 4x rate drops to 1x — $1,500 of 4x earning left."

---

## 8. What This Does NOT Change

- **Compare page**: Already powered by points-engine.md. No changes needed. The dashboard and Compare page now use the same underlying data, which is a consistency win.
- **Multi-card aggregation**: No cross-card aggregated view. Each card's value stands on its own against its own annual fee.
- **A1, A2, B1, B2, B3, C1**: These are credit-specific insights. Points don't affect their triggers, scoring, or templates. Credits remain the domain of these categories.
- **Scoring weights**: The 5-factor scoring model is unchanged. P1 and P2 use the same weights as all other insights.
- **Display rules**: Only one addition (A1/P2 mutual exclusion). All other rules carry forward.
- **Competitor map**: Unchanged. P2 doesn't use the competitor map — it uses the card earn config directly.
- **Design constraints**: "No LLM-generated insights" still holds. P1 and P2 use templates with variable interpolation, same as everything else.

---

## 9. Success Metrics

| Metric | Current (credits only) | Expected (credits + points) |
|---|---|---|
| C2 break-even trigger rate | Low — many users never hit 100% on credits | High — most active users should hit 100% within 6 months |
| Dashboard net value (avg CSR user) | Often negative (credits captured < $795 fee) | Positive for most users ($500-800 in points + $300-500 in credits) |
| Dashboard net value (avg CSP user) | Thin margin ($170 credits - $95 fee = $75) | Healthy ($400-600 points + $170 credits - $95 = $475-675) |
| C0 first-impression value | Moderate (credits-only snapshot) | Strong (full value picture from day one) |
| Strata Elite / Venture X (low-credit cards) | Broken (shows ~$0 credits, red net cost) | Functional (shows points earning, accurate net value) |
| P1/P2 insight generation rate | N/A | P1: 1-2/month per user; P2: 0-1/month per user |

The single most important metric: **the percentage of users who see a positive NET VALUE on their dashboard should increase significantly.** Users who see positive ROI retain. Users who see red numbers on a tool that's supposed to help them feel good about their card will churn.

---

## 10. Resolved Decisions

1. **Points Earning section defaults to annual (current benefit year).** Matches credit tracking period and fee comparison. Monthly toggle available but not the default. Larger annual numbers are more meaningful and more motivating.

2. **P1 insights do not compare to other cards.** P1 celebrates the user's current earning — it does not suggest they'd do better elsewhere. "Your 3x dining earned ~$315 more than base rate" is the frame. Cross-card comparisons live on the Compare page, not in insights.

3. **"~" prefix used sparingly.** Applied to summary-level numbers (top bar, insight copy) to signal estimation. Not applied in the per-category breakdown rows where the user can see the exact calculation (spend × rate × cpp = value). Avoids making the entire dashboard feel uncertain.

4. **NET VALUE reflects captured value only.** Formula: `credits_captured + points_value_conservative - annual_fee`. Does not include available-but-unused credits. Net value shows reality, not potential. The gap between captured and available is what drives the user toward insights and credit tracking.
