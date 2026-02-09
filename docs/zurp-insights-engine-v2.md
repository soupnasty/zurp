# Zurp Insights Engine — Full Spec

## What This Is

The insights engine is the core intelligence layer of Zurp. It observes a user's transaction history, benefit usage, and temporal context to generate specific, actionable, dollar-denominated observations that help the user capture more value from their credit card.

This is not a notification system. It's not a budgeting tool. It's a benefit optimization engine that happens to speak in plain English.

## Part 1: Insight Categories

7 insight categories, grouped by what they're asking the user to do.

### Group A: Redirect Spending (Highest Value)

These insights tell the user: "You already spend money on this. Spend it differently and you save."

---

**A1. Competitor Redirect**
The flagship insight. User spent at a competitor of a benefit partner.

| Field | Detail |
|---|---|
| Trigger | Transaction at a merchant in the competitor map where the corresponding benefit has unused value |
| Data needed | Transaction merchant + amount, competitor map lookup, benefit balance |
| Example | "You spent $95 on Ticketmaster this month. Your $150 StubHub credit is unused — buy there next time." |
| Dollar signal | Amount spent at competitor (potential savings) |
| Urgency signal | Benefit expiration date, remaining balance |

**A2. Subscription Swap**
User pays for a subscription they could get free or discounted through their card.

| Field | Detail |
|---|---|
| Trigger | Recurring charge from a competitor of a complimentary subscription benefit (e.g., Spotify when Apple Music is free) |
| Data needed | Recurring transaction detection (see below), subscription benefit activation status |
| Example | "You're paying $14.99/mo for Spotify. Your card includes free Apple Music — that's $180/yr." |
| Dollar signal | Annual subscription cost (potential savings) |
| Urgency signal | Low (ongoing, not expiring) — but high cumulative value |

*Recurring transaction detection*: A transaction is classified as recurring when the same merchant name appears 3+ times with amounts within 20% of each other and intervals between 25–35 days apart. This is a simple heuristic that covers most subscription charges. Plaid's `/transactions/recurring/get` endpoint can supplement this as a secondary signal but should not be the sole source — coverage varies by institution and it misses some charges that our heuristic catches. The recurring flag is stored on the transaction record and recomputed on each sync.

**Copy principle for Group A**: Always lead with what the user spent, then connect to the benefit. Never lead with the benefit.

---

### Group B: Use What You Have (Medium-High Value)

These insights tell the user: "You have something you're not fully using."

---

**B1. Unused Credit (Time Pressure)**
A credit has $0 (or minimal) usage and the reset/expiration date is approaching.

| Field | Detail |
|---|---|
| Trigger | Benefit used < 25% AND period elapsed > 50% |
| Data needed | Benefit balance, benefit period dates |
| Example | "Your Exclusive Tables credit resets Jul 1. You have $150 unused with 2 months left." |
| Dollar signal | Remaining unused value |
| Urgency signal | Very high — this is use-it-or-lose-it money |

**B2. Nearly Maxed Credit**
User is close to maxing a benefit — a "finish it off" nudge.

| Field | Detail |
|---|---|
| Trigger | Benefit used ≥ 75% but < 100% AND period elapsed < 85% (enough time to act) |
| Data needed | Benefit balance, benefit period dates |
| Example | "You've used $200 of your $300 Edit hotel credit. One more booking and you've maxed it — $100 left this period." |
| Dollar signal | Remaining credit (small but completable) |
| Urgency signal | Low-medium — not expiring imminently, but the "so close" framing creates intrinsic motivation |

*Why this exists separately from B1*: The psychology is completely different. B1 is loss aversion ("you'll lose this"). B2 is completion motivation ("you're almost there"). Users who have already demonstrated engagement with a benefit are far more likely to act on a "finish it off" nudge than a "you haven't started" warning. The copy, framing, and even the display priority should differ.

**B3. Underused Credit**
User is using a benefit but not maximizing it.

| Field | Detail |
|---|---|
| Trigger | Benefit used > 0 but < 75% AND user has spending in the category that exceeds the benefit value |
| Data needed | Benefit balance, category spending totals |
| Example | "$340 on DoorDash this month but only $15 of your $25 credit used. You may be missing the non-restaurant promos." |
| Dollar signal | Remaining credit for this period |
| Urgency signal | Medium (monthly reset benefits are more urgent than semi-annual) |

**Copy principle for Group B**: Lead with urgency or the unused dollar amount. Create FOMO without being annoying. For B2, lead with progress — the user should feel encouraged, not pressured.

---

### Group C: Celebrate & Reinforce (Lower Direct Value, High Retention Value)

These insights tell the user: "You're doing great. Here's proof."

---

**C0. Current Value Snapshot**
On first card connect, Zurp scans Plaid historical transactions and calculates benefits the user has already captured this benefit year. This is the user's first insight and the app's first proof of value.

| Field | Detail |
|---|---|
| Trigger | Card connected for the first time. Runs immediately after initial Plaid historical transaction sync completes. |
| Data needed | Historical transactions (Plaid provides 6–24 months depending on institution), benefit structure for current card, benefit period boundaries |
| Example | "Based on your transaction history, you've already captured $430 in benefits this year. That's 54% of your annual fee — let's get the rest." |
| Dollar signal | Total value already captured |
| Urgency signal | None — this is a welcome moment |

*Why this matters*: Without C0, a new user's first experience is all Group A and B insights — redirect nudges and activation warnings. That makes the app feel like a guilt trip from minute one. C0 flips the first impression: "you're already doing well, and we're going to help you do better." It also establishes the baseline for the north star metric (% of benefits captured) with real data, not a placeholder.

*Implementation notes*:
- Run benefit matching against historical transactions the same way the ongoing engine does, but scoped to the current benefit year
- For benefits with activation requirements, infer activation from the presence of qualifying transactions (if the user received a DoorDash credit, they activated DoorDash)
- If historical data is sparse (new card, <3 months of history), adjust the framing: "In the last 2 months, you've captured $85 in benefits" rather than making annual projections
- C0 is generated exactly once per card. It is never regenerated or updated.

*Sync timing*: Plaid's initial transaction sync can take seconds to minutes depending on the institution, and may return partial data. C0 generation follows this approach:
1. After Plaid link completes, subscribe to the `INITIAL_UPDATE` webhook (covers ~30 days) and the `HISTORICAL_UPDATE` webhook (covers full history).
2. Generate C0 after `INITIAL_UPDATE` fires or after a 30-second timeout, whichever comes first. Even 30 days of data is enough for a meaningful snapshot.
3. If `HISTORICAL_UPDATE` arrives later with significantly more data (captured value changes by >20%), update the C0 insight's `template_vars` and `rendered_copy` in place. Do not regenerate a new insight — the dedup key prevents it.
4. If Plaid returns zero transactions (rare but possible with brand-new cards), skip C0 entirely. The user will see Group A and B insights as they start using the card.

**C1. Benefit Maxed**
User fully utilized a benefit.

| Field | Detail |
|---|---|
| Trigger | Benefit used = benefit max for current period |
| Example | "Nice — you've maxed your $10 Lyft credit this month." |
| Dollar signal | Value captured |
| Urgency signal | None |

**C2. ROI Milestone**
User's total captured benefits crossed a meaningful threshold relative to the annual fee.

| Field | Detail |
|---|---|
| Trigger | Total benefits used crosses 50%, 75%, 100%, 150% of annual fee |
| Example | "You've now captured $795 in benefits — your card has paid for itself. Everything from here is profit." |
| Dollar signal | Total benefits vs. annual fee |
| Urgency signal | None — this is a celebration moment |

**Copy principle for Group C**: Short, warm, no calls to action. The user should feel smart, not lectured. C0 is the one exception — it can include a soft forward-looking hook ("let's get the rest") to bridge into the benefit dashboard.

---

## Part 2: Scoring & Prioritization

### The Insight Score

Every generated insight receives a score from 0–100 that determines whether it's shown and in what order. The score is a weighted composite:

```
insight_score = (
  dollar_impact_score    * 0.35 +
  urgency_score          * 0.25 +
  actionability_score    * 0.20 +
  novelty_score          * 0.10 +
  confidence_score       * 0.10
)
```

#### Dollar Impact Score (0–100)

How much money is at stake?

| Annual Value at Stake | Score |
|---|---|
| $300+ | 100 |
| $150–$299 | 80 |
| $50–$149 | 60 |
| $20–$49 | 40 |
| $10–$19 | 20 |
| < $10 | 10 |

For recurring insights (subscriptions, monthly credits), annualize the value.

#### Urgency Score (0–100)

How soon does the user need to act?

| Time Remaining | Score |
|---|---|
| Expires within 7 days | 100 |
| Expires within 30 days | 80 |
| Expires within 90 days | 60 |
| Resets monthly (any time remaining) | 50 |
| No expiration (ongoing) | 20 |
| Already expired (postmortem) | 0 (don't show) |

#### Actionability Score (0–100)

Can the user do something right now?

| Action Required | Score |
|---|---|
| One-click activation link | 100 |
| Switch platform next purchase | 80 |
| Book through different portal | 60 |
| Change a recurring subscription | 40 |
| Plan a future purchase | 20 |

#### Novelty Score (0–100)

Has the user seen this insight before?

| Freshness | Score |
|---|---|
| First time this insight has been generated | 100 |
| Shown once before, 30+ days ago | 60 |
| Shown 2+ times in last 60 days | 20 |
| Shown last session | 0 |

This prevents the same insight from nagging the user. The novelty score decays rapidly with repetition but recovers over time.

#### Confidence Score (0–100)

How certain are we that this insight is correct?

| Signal Quality | Score |
|---|---|
| Exact merchant match + confirmed benefit status | 100 |
| Exact merchant match + inferred benefit status | 80 |
| Category match (no exact merchant) | 50 |
| Amount heuristic only | 30 |

Low-confidence insights should either be suppressed or softened in copy ("This might qualify for your credit...").

### Floor Override Rule

The weighted composite score is the primary ranking mechanism, but high-stakes insights must never be suppressed by low novelty or confidence scores.

**If `dollar_impact_score` ≥ 80 AND `urgency_score` ≥ 80, the insight is always shown regardless of total composite score.**

This prevents a scenario where a $300 unused credit expiring in 5 days gets buried because the user has seen the insight before (novelty = 20) or because it's a category match rather than an exact merchant match (confidence = 50). The composite score still determines sort order among floor-override insights, but they bypass the minimum threshold check.

*Scope*: This rule applies to Group A and Group B insights only. Group C (celebration) insights don't have the same use-it-or-lose-it urgency and should not force their way onto the screen.

### Display Rules

1. **Show at most 3 insights per page load** (2 on mobile, 3 on desktop)
2. **Never show more than 1 insight from the same benefit** (avoid "DoorDash DoorDash DoorDash")
3. **Always include at least 1 positive insight (Group C) if available** — don't make the page feel like a guilt trip. If no Group C insights exist (common in early weeks before any benefit is maxed or any milestone is hit, and after C0 has already been shown), this rule is skipped and all slots go to Group A/B insights. Do not backfill with synthetic positivity.
4. **If total score < 30, don't show the insight** — below this threshold, the insight isn't worth the screen space (exception: floor override insights)
5. **Group A insights always rank above Group B** when scores are within 10 points — redirect insights are more actionable than reminders
6. **C0 takes priority over all other insights on the user's first session** — it's the app's first impression

---

## Part 3: Timing & Delivery

### When Insights Are Generated

| Trigger | What Runs |
|---|---|
| **Card connected (first time)** | Scan historical transactions against benefit structure. Generate C0 (Current Value Snapshot). Generate A1/A2 for any competitor spending or swappable subscriptions found in history. |
| **Transaction sync** (daily/on-demand) | Scan new transactions against competitor map. Generate A1, A2 insights. Check if any benefits crossed the 75% threshold for B2. |
| **Benefit status change** | When a credit is used or a benefit is activated, re-score all B-group insights. Generate C1 if maxed. |
| **Page load (Spending Analysis)** | Score and rank all pending insights. Select top 2–3 to display. |
| **Mid-period checkpoint** | At 50% and 75% of benefit period elapsed, generate B1 for any unused credits. |

### Insight Lifecycle

Each insight has a state:

```
PENDING → SHOWN → EXPIRED | SUPERSEDED
```

- **PENDING**: Generated but not yet displayed to user
- **SHOWN**: Displayed on screen at least once
- **EXPIRED**: The underlying benefit period ended
- **SUPERSEDED**: A newer or higher-scoring insight about the same benefit replaced it

Track state transitions with timestamps for analytics.

*How SHOWN is tracked*: An insight transitions to SHOWN when it is included in the ranked insight set returned to the client on page load. This happens server-side at query time, not based on client scroll behavior. If an insight is selected for display, it is marked SHOWN and an `insight_impressions` record is created, regardless of whether the user scrolls to it. This is simpler and more reliable than client-side Intersection Observer tracking. The tradeoff is that impression_rate (% the user actually sees) is not measurable in v1 — we assume all returned insights are seen. Scroll-based tracking can be added later if impression_rate becomes a tuning lever.

---

## Part 4: Insight Copy Framework

### Voice & Tone

| Principle | Do | Don't |
|---|---|---|
| **Specific** | "You spent $95 on Ticketmaster" | "You may have spent money on events" |
| **Dollar-first** | "$150 unused" | "You have an unused credit" |
| **Neutral, not judgmental** | "Your StubHub credit is unused" | "You wasted your StubHub credit" |
| **Concise** | 2 lines max | A paragraph of explanation |
| **Actionable** | "Buy through StubHub next time" | "Consider evaluating your purchasing patterns" |
| **Warm on wins** | "Nice — you maxed your Lyft credit" | "Credit fully utilized" |

### Copy Templates by Category

Every template follows a consistent structure:

**Group A (Redirect)**: `[What you spent] + [What you have] + [What to do]`
**Group B (Activate/Use)**: `[What's at stake] + [Time context] + [How to fix]`
**Group C (Celebrate)**: `[What you did] + [How it helped]`

#### Full Template Library

**A1 — Competitor Redirect**
```
Standard:    "You spent ${amount} on {merchant}. Your {benefit} has ${remaining} left — {action}."
With count:  "{count} purchases at {merchant} totaling ${amount}. Your ${remaining} {benefit} credit could cover that."
Activated:   "You spent ${amount} on {merchant} this month. Switch to {partner} to use your ${remaining} credit."
Unactivated: "You spent ${amount} on {merchant}. Activate your {benefit} to start saving — you have ${value}/yr available."
```

**A2 — Subscription Swap**
```
Free:       "You're paying ${amount}/mo for {service}. Your card includes free {partner} — that's ${annual}/yr."
Existing:   "{service} charge of ${amount}. You have complimentary {partner} — consider using both or switching."
Unactivated: "You pay ${amount}/mo for {service}. Activate your free {partner} subscription — it's included with your card."
```

**B1 — Unused Credit (Time Pressure)**
```
Standard:  "Your {benefit} resets {date}. You have ${remaining} unused with {time_left} left."
Urgent:    "${remaining} in {benefit} credit expires in {days} days. Book now to use it."
Very late: "Last chance: ${remaining} in {benefit} credit expires {date}."
```

**B2 — Nearly Maxed Credit**
```
Standard:  "You've used ${used} of your ${max} {benefit} credit. ${remaining} left — one more {action_type} and you've maxed it."
Close:     "So close — ${remaining} left on your {benefit} credit this {period}. You've already captured ${used}."
```

**B3 — Underused Credit**
```
Standard:  "${spent} on {category} this month but only ${used} of your ${max} {benefit} credit used."
Specific:  "You're using your {benefit} but have ${remaining} left this {period}. {hint}."
```

**C0 — Current Value Snapshot**
```
Standard:    "Based on your transaction history, you've already captured ${total} in benefits this year. That's {pct_of_fee}% of your annual fee."
Strong:      "You've captured ${total} in benefits so far — your card is already {pct_of_fee}% paid off. Let's get the rest."
Low history: "In the last {months} months, you've captured ${total} in benefits. Let's make sure you're getting everything."
```

**C1 — Benefit Maxed**
```
Standard:  "Nice — you've maxed your {benefit} this {period}. ${value} captured."
First time: "First time maxing your {benefit}! ${value} saved."
```

**C2 — ROI Milestone**
```
Break-even: "Your card just paid for itself. ${total} in benefits captured against your ${fee} annual fee."
Profitable: "You've now captured ${total} — that's ${surplus} beyond your annual fee."
Milestone:  "${total} in benefits used this year. That's {multiplier}X your annual fee."
```

---

## Part 5: Surfaces & Placement

### Spending Analysis Page (Primary)
- 2–3 insight cards below the category breakdown
- Full insight card with icon, copy, and optional CTA
- Scrollable if more than 3

### Onboarding / First Week
- During the first 7 days after connecting a card, surface C0 prominently as the first insight the user sees
- Follow with any A1/A2 insights generated from historical transaction scan
- This is the highest-value moment — user just connected and is most engaged

---

## Part 6: Engine Architecture

### Data Flow

```
[Plaid Sync] → [Transaction Store]
                      ↓
     [Historical Scan (first connect)]
                      ↓
              [Insight Generator]  ←  [Benefit State Store]
                      ↓                       ↑
              [Insight Candidates]    [Competitor Map]
                      ↓
              [Scoring Engine]  ←  [Insight History]
                      ↓
              [Floor Override Check]
                      ↓
              [Ranked Insights]
                      ↓
              [Spending Page]
```

### Database Schema

```sql
-- Core insight record
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Classification
  category TEXT NOT NULL,  -- 'A1', 'A2', 'B1', 'B2', 'B3', 'C0', 'C1', 'C2'
  benefit_id UUID REFERENCES benefits(id),
  
  -- Content
  template_key TEXT NOT NULL,       -- e.g., 'a1_standard', 'b2_urgent', 'c0_standard'
  template_vars JSONB NOT NULL,     -- e.g., {"amount": 95, "merchant": "Ticketmaster", "remaining": 150}
  rendered_copy TEXT NOT NULL,       -- Pre-rendered insight text
  
  -- Scoring
  dollar_impact_score INTEGER NOT NULL,
  urgency_score INTEGER NOT NULL,
  actionability_score INTEGER NOT NULL,
  novelty_score INTEGER NOT NULL,
  confidence_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  floor_override BOOLEAN NOT NULL DEFAULT FALSE,  -- True if dollar_impact >= 80 AND urgency >= 80
  
  -- Lifecycle
  state TEXT NOT NULL DEFAULT 'pending',  -- pending, shown, expired, superseded
  
  -- Context
  triggered_by_transaction_id UUID REFERENCES transactions(id),
  period_start DATE,
  period_end DATE,
  
  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shown_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Prevent duplicate insights
  dedup_key TEXT NOT NULL,  -- e.g., "a1:stubhub:2026-02" (category:benefit:period)
  UNIQUE(user_id, dedup_key)
);

CREATE INDEX idx_insights_user_state ON insights(user_id, state);
CREATE INDEX idx_insights_user_score ON insights(user_id, total_score DESC);

-- Track which insights have been shown to prevent repetition
CREATE TABLE insight_impressions (
  id SERIAL PRIMARY KEY,
  insight_id UUID REFERENCES insights(id),
  surface TEXT NOT NULL,     -- 'spending_page'
  shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Deduplication Strategy

The `dedup_key` prevents the same logical insight from being generated repeatedly:

| Category | Dedup Key Format | Example |
|---|---|---|
| A1 (Competitor redirect) | `a1:{benefit}:{month}` | `a1:stubhub:2026-02` |
| A2 (Subscription swap) | `a2:{subscription}:{month}` | `a2:spotify:2026-02` |
| B1 (Unused time pressure) | `b1:{benefit}:{period}` | `b1:exclusive_tables:2026-h1` |
| B2 (Nearly maxed) | `b2:{benefit}:{period}` | `b2:edit_hotels:2026-h1` |
| B3 (Underused) | `b3:{benefit}:{month}` | `b3:doordash:2026-02` |
| C0 (Value snapshot) | `c0:{card_id}` | `c0:csr_abc123` |
| C1 (Maxed) | `c1:{benefit}:{period}` | `c1:lyft:2026-02` |
| C2 (ROI milestone) | `c2:{threshold}` | `c2:100pct` |

Within a dedup window, if the underlying data changes (e.g., user spent MORE at Ticketmaster), the existing insight is updated in place rather than creating a new one. Specifically:

- `template_vars`, `rendered_copy`, and `total_score` are recalculated with the new data
- `dollar_impact_score` is recalculated (the amount at stake may have increased)
- `novelty_score` is NOT reset — it still reflects the original `generated_at` date
- `shown_at` is NOT reset — the system remembers that the user has seen a version of this insight
- `state` is NOT reset — if the insight was already SHOWN, it stays SHOWN
- `generated_at` is NOT updated — this is the original creation timestamp

The user sees the updated copy the next time the insight is rendered, but the scoring system still treats it as a previously-seen insight. This prevents a situation where spending $40 more at Ticketmaster causes the same insight to resurface as if it were brand new.

C0 is unique: it uses `c0:{card_id}` as its dedup key because it is generated exactly once per card connection and never regenerated.

---

## Part 7: Design Constraints

- **No LLM-generated insights.** The copy should feel human-written and consistent, not AI-generated. Templates with variable interpolation are the right approach.
- **No card recommendations.** Zurp optimizes the cards you have, it doesn't sell you new ones.
- **No general budgeting insights.** "You spent 20% more on dining this month" is Mint's job. Zurp only cares about spending patterns that intersect with card benefits.
- **Competitor map is manually maintained.** A static lookup table, not a dynamic discovery system.
- **Scoring weights are fixed.** No per-user tuning, no A/B testing of weights at launch.

---

## Part 8: Measuring Success

### Insight-Level Metrics

| Metric | Definition | Target |
|---|---|---|
| **Show rate** | % of generated insights that score high enough to display | 60–80% (too high = not generating enough, too low = too noisy) |
| **Floor override frequency** | % of shown insights that were floor overrides | Monitor — if >25%, the scoring model needs recalibration |

### User-Level Metrics

| Metric | Definition | Target |
|---|---|---|
| **Benefits captured ($/mo)** | Total dollar value of benefits the user actually used | Increasing month over month |
| **Effective fee reduction** | Annual fee minus total benefits captured | Trending toward $0 or negative |
| **Return visits** | Monthly active sessions on spending analysis page | 4+ per month |
| **C0 baseline** | Benefits already captured at time of card connection (from historical scan) | Establishes per-user starting point for north star metric |

### The North Star

The single metric that matters most:

> **What percentage of each user's total available card benefits are they actually capturing?**

If the average CSR holder is capturing 40% of their ~$2,060 in benefits when they sign up, and Zurp moves that to 70%, that's $618 more per user per year. THAT is the product's value proposition, and the insights engine is the primary mechanism for driving it.

C0 gives us the "40%" starting number from day one. Every subsequent insight is trying to push that number higher.

---

## Appendix: V1 Scope Summary

**Insight categories**: A1, A2, B1, B2, B3, C0, C1, C2
**Scoring**: Full scoring model with fixed weights + floor override rule
**Surfaces**: Spending analysis page only (2–3 insight cards)
**Templates**: 2 templates per category (standard + one variant); 3 for C0 (standard, strong, low history)
**Deduplication**: Full dedup_key system
**Lifecycle**: PENDING → SHOWN → EXPIRED | SUPERSEDED
**Onboarding flow**: C0 generated on card connect, shown as first insight

---

## Appendix B: Competitor Map (Stub)

The competitor map is the lookup table that powers A1 (Competitor Redirect) and A2 (Subscription Swap). It maps merchants where users actually spend to the benefit partner they should be spending at instead. The full competitor map is maintained in a separate spec; this appendix documents the schema and a representative sample for implementation reference.

### Schema

```sql
CREATE TABLE competitor_map (
  id SERIAL PRIMARY KEY,
  card_type TEXT NOT NULL,              -- 'csr', 'venture_x', etc.
  benefit_key TEXT NOT NULL,            -- e.g., 'stubhub_credit', 'doordash_credit'
  benefit_partner TEXT NOT NULL,        -- The benefit merchant (e.g., 'StubHub', 'DoorDash')
  competitor_merchant TEXT NOT NULL,    -- The merchant the user is spending at instead
  plaid_merchant_pattern TEXT NOT NULL, -- Regex or exact match for Plaid transaction merchant_name
  category TEXT NOT NULL,               -- 'events', 'food_delivery', 'streaming', 'travel', etc.
  insight_type TEXT NOT NULL,           -- 'A1' or 'A2'
  notes TEXT                            -- Any matching caveats
);

CREATE INDEX idx_competitor_map_card ON competitor_map(card_type);
CREATE INDEX idx_competitor_map_pattern ON competitor_map(plaid_merchant_pattern);
```

### Sample Mappings (CSR)

| Benefit Partner | Competitor | Plaid Pattern | Category | Type |
|---|---|---|---|---|
| StubHub | Ticketmaster | `TICKETMASTER\|TM\*` | events | A1 |
| StubHub | AXS | `AXS\|AXS\.COM` | events | A1 |
| StubHub | SeatGeek | `SEATGEEK` | events | A1 |
| StubHub | Vivid Seats | `VIVID SEATS\|VIVIDSEATS` | events | A1 |
| DoorDash | Uber Eats | `UBER EATS\|UBEREATS` | food_delivery | A1 |
| DoorDash | Grubhub | `GRUBHUB\|GH\*` | food_delivery | A1 |
| DoorDash | Postmates | `POSTMATES` | food_delivery | A1 |
| Apple Music | Spotify | `SPOTIFY` | streaming | A2 |
| Apple TV+ | Netflix | `NETFLIX` | streaming | A2 |
| Apple TV+ | Hulu | `HULU` | streaming | A2 |
| Apple Arcade | Xbox Game Pass | `XBOX\|MICROSOFT GAME` | streaming | A2 |
| Lyft | Uber | `UBER \*TRIP\|UBER BV` | rideshare | A1 |
| Peloton | ClassPass | `CLASSPASS` | fitness | A1 |
| Peloton | Equinox+ | `EQUINOX` | fitness | A1 |

The full CSR competitor map requires approximately 80–100 mappings across 9 benefit categories. The Plaid pattern column uses regex matching against the `merchant_name` field returned by Plaid's `/transactions/get` endpoint. Patterns should be tested against real Plaid sandbox data before launch, as merchant name formatting varies by institution.
