# Spending Analysis — Feature Spec

## Overview

A secondary dashboard view that transforms existing Plaid transaction data into a clear, glanceable spending summary. Every element ties back to Zurp's core purpose: helping users capture more value from their card benefits.

This is not a budgeting tool, a net worth tracker, or a bank app replacement. It is a spending visibility layer with benefit-aware insights.

## Navigation

- **Location:** "Spending" item in the sidebar nav, below Dashboard and Cards
- **Default view:** Current calendar month
- **Time navigation:** Left/right arrows to move between months; current month is default
- **No date range picker, custom calendar, or year view for v1**

## Layout

Three stacked sections, designed to be scannable top-to-bottom in under 10 seconds. Mobile-first, single-column layout.

```
┌─────────────────────────────────────┐
│         Month Selector  ← Feb →     │
├─────────────────────────────────────┤
│                                     │
│     Total Spending This Month       │
│          $3,842.50                  │
│        ▲ 12% vs last month         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     Category Breakdown              │
│                                     │
│  Dining        ████████░░  $890     │
│  Travel        ███████░░░  $740     │
│  Groceries     ██████░░░░  $620     │
│  Shopping      █████░░░░░  $510     │
│  Transport     ████░░░░░░  $430     │
│  Entertainment ███░░░░░░░  $380     │
│  Subscriptions ██░░░░░░░░  $172     │
│  Other         █░░░░░░░░░  $100     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     Benefit Insights                │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 💡 You spent $95 on           │  │
│  │ Ticketmaster this month.      │  │
│  │ Your $150 StubHub credit is   │  │
│  │ unused — buy there next time. │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 💡 $340 on DoorDash but only  │  │
│  │ $25 in credits used. You may  │  │
│  │ be missing your non-restaurant│  │
│  │ promos.                       │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Section 1: Monthly Headline

### Content

| Element | Description |
|---------|-------------|
| **Total spent** | Sum of all transactions for the selected month. Large, prominent number. |
| **Comparison chip** | Percentage change vs. previous month. Green with down arrow if spending decreased, red with up arrow if increased. Muted gray if first month of data. |

### Design Notes

- Total is the largest text on the page — this is the anchor
- Comparison chip is a small pill badge next to or below the total
- No breakdown of income, savings, or balance — spending only
- Pending transactions are excluded from the total

## Section 2: Category Breakdown

### Categories

Roll up Plaid's granular categories into 8 buckets:

| Display Category | Plaid Categories Included |
|-----------------|--------------------------|
| Dining | Restaurants, Fast Food, Coffee Shops, Bars |
| Travel | Airlines, Hotels, Car Rental, Travel Agencies, Lodging |
| Groceries | Groceries, Supermarkets, Wholesale Clubs |
| Shopping | General Merchandise, Clothing, Electronics, Online Marketplaces |
| Transportation | Rideshare, Gas, Parking, Tolls, Public Transit, Auto |
| Entertainment | Music, Movies, Events, Tickets, Gaming, Sports |
| Subscriptions | Streaming, Software, Memberships, Recurring |
| Other | Everything not captured above |

### Visualization

- **Horizontal bar chart**, one bar per category
- Sorted by highest spend first (descending)
- Dollar amount on the right side of each bar
- Bar fill is proportional to the highest-spending category (top bar is always full width, others are relative)
- All bars use a single consistent color (Zurp blue) — no rainbow palette
- Small sparkline (last 3–6 months) to the right of the dollar amount showing trend for that category; visible on desktop, hidden on mobile to save space

### Interaction

- **Tap/click a category** to expand inline and show individual transactions for that category
- Expanded view shows: date, merchant name, amount — one row per transaction
- Sorted by most recent first
- Collapse on second tap or when another category is expanded
- No separate transaction detail page — everything is inline

### Empty/Low Data States

- Categories with $0 are hidden, not shown with empty bars
- If fewer than 3 categories have spending, show a message: "We need a few more weeks of data to show a useful breakdown"
- First month after connecting: "Spending data is building. Check back soon for your full breakdown."

## Section 3: Benefit Insights

### Purpose

Surface specific, actionable observations that connect spending behavior to unused or underused card benefits. This section is what differentiates Zurp's spending view from any generic finance app.

### Insight Types

| Insight Type | Trigger | Example |
|-------------|---------|---------|
| **Missed platform** | User spent money at a competitor of a benefit partner | "You spent $95 on Ticketmaster. Your $150 StubHub credit is unused — buy there next time." |
| **Underused credit** | User has transactions in a benefit category but hasn't fully used the credit | "$340 on DoorDash but only $25 in credits used. You may be missing your non-restaurant promos." |
| **Unused credit** | A credit has $0 used with the period more than 50% elapsed | "Your Exclusive Tables dining credit resets Jul 1. You have $150 unused with 2 months left." |
| **Spending without benefit** | User has qualifying spend but hasn't activated the benefit | "You've taken 4 Lyft rides this month. Activate your $10/mo Lyft credit to save on rides." |
| **Positive reinforcement** | User fully utilized a benefit | "Nice — you've maxed out your $10 Lyft credit this month." |

### Prioritization

Show a maximum of 2 insight cards at a time. Prioritize by:

1. **Dollar impact** — highest potential savings first
2. **Time urgency** — expiring credits before ongoing ones
3. **Actionability** — insights the user can act on immediately (activate a benefit, switch platforms) over informational ones

### Design Notes

- Each insight is a compact card with a light background tint (subtle, not loud)
- Leading icon: 💡 or a small lightbulb icon
- Text is 2–3 lines max — concise and specific with real dollar amounts
- No "dismiss" action for v1 — insights rotate automatically based on priority
- If no insights are relevant for the current month, hide the section entirely (don't show "No insights" empty state)

### Insight Generation Logic

Insights are generated on each sync/page load by comparing:

- Current month's transactions (by merchant and category)
- Benefit usage status (from the benefit tracker)
- Benefit activation status
- Time remaining in current benefit period

```
// Pseudocode for missed platform insight
for each transaction in current_month:
  if transaction.merchant in COMPETITOR_MAP:
    partner = COMPETITOR_MAP[transaction.merchant]
    benefit = get_benefit(partner)
    if benefit.used < benefit.max:
      generate_insight(
        type: "missed_platform",
        spent: transaction.amount,
        merchant: transaction.merchant,
        partner: partner.name,
        remaining: benefit.max - benefit.used
      )
```

### Competitor Map (v1)

| User Spent At | Benefit Partner | Insight |
|--------------|----------------|---------|
| Ticketmaster, SeatGeek, Vivid Seats, AXS | StubHub | Redirect to StubHub credit |
| Uber, taxi charges | Lyft | Redirect to Lyft credit |
| Uber Eats, Grubhub, Postmates | DoorDash | Redirect to DoorDash promos |
| Spotify, YouTube Music, Tidal, Amazon Music | Apple Music | Suggest activating Apple Music |
| Netflix, Hulu, Disney+, Max, Paramount+ | Apple TV+ | Suggest activating Apple TV+ |
| Hotels.com, Expedia, Booking.com | The Edit (Chase Travel) | Redirect to Edit hotel credit |
| Marriott, Hilton, Hyatt (direct) | The Edit (Chase Travel) | Suggest booking via Edit for credit |
| SoulCycle, Equinox, ClassPass, gym memberships | Peloton | Suggest activating Peloton credit |

## Responsive Behavior

### Mobile (< 640px)

- Single column, full width
- Headline number takes ~20% of viewport height
- Category bars are full width with amount right-aligned
- Sparklines hidden
- Insight cards stack vertically
- Transaction expand takes full width
- Month selector is edge-to-edge with large tap targets on arrows

### Tablet (640px – 1024px)

- Same layout as mobile but with more breathing room
- Sparklines visible
- Insight cards may sit side by side if space allows

### Desktop (> 1024px)

- Category breakdown and insights can sit in a two-column layout
- Categories take ~60% width, insights take ~40% as a sidebar
- Sparklines visible
- Transaction expand stays inline within the category column

## Data Requirements

### From Plaid (already available)

- Transaction list with: date, amount, merchant name, category, subcategory
- Account ID (to filter to the connected card)

### Computed by Zurp

- Category rollup mapping (Plaid subcategory → Zurp display category)
- Monthly aggregations (total, per category)
- Month-over-month percentage change
- Insight generation (comparing transactions against benefit state)

### New Storage

| Table/Field | Purpose |
|------------|---------|
| `monthly_spending_cache` | Pre-computed monthly totals per category per user. Refreshed on sync. Avoids re-aggregating on every page load. |
| `competitor_map` | Merchant name → benefit partner mapping for insight generation. Seeded manually, expanded over time. |

No new Plaid API calls are needed. All data comes from the existing transaction sync.

## Plaid Compliance Note

This feature uses transaction data for spending analysis in the context of card benefit optimization. All insights tie back to helping the user maximize their card's value. This aligns with Zurp's stated Plaid use case of benefit tracking and should be framed accordingly in any Plaid review:

- "Spending analysis helps users identify opportunities to use their card benefits more effectively"
- "Category breakdowns show users where they spend in relation to benefit categories like dining, travel, and entertainment"
- "Insights alert users when they spend at a competitor of a benefit partner, encouraging them to redirect spending to capture unused credits"

## Out of Scope for V1

- Budget setting or savings goals
- Income tracking or net worth
- Multi-card or multi-account aggregation
- Custom category creation or re-categorization
- CSV/PDF export
- Year-over-year comparisons
- Spending alerts or push notifications
- Shared/household spending views
- Search or filtering within the spending view
- Recurring transaction detection

## Success Metrics

| Metric | Target | Why |
|--------|--------|-----|
| **Page visits per user per month** | 4+ | Indicates the feature drives return visits |
| **Insight click-through rate** | 15%+ | Users are acting on benefit recommendations |
| **Benefit activation rate post-insight** | Measurable lift | Insights about unactivated benefits lead to activations |
| **Spending redirect rate** | Measurable | Users shift from competitors to benefit partners (e.g., Ticketmaster → StubHub) over time |
| **Time on page** | 30–60 seconds | Glanceable but engaging — too long suggests confusion, too short suggests low value |
