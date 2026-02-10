# Zurp — Benefits Dashboard Spec

**Version**: 2.0
**Date**: February 2026
**Status**: Implemented
**Dependencies**: insights-engine.md, card catalogs

---

## 1. Purpose

The Benefits Dashboard is the primary surface for tracking a user's actual card benefits. It answers: **"How much of my card's value am I capturing?"**

The dashboard shows real data from the user's connected card — benefits used, benefits remaining, insights to act on, and overall ROI. It is **not** a browsing or comparison tool.

**Route**: `/benefits` (server component, `force-dynamic`)

---

## 2. Page Architecture

The dashboard is a single server-rendered page with client-interactive islands. Data flows top-down from server queries; mutations use API routes + `router.refresh()`.

### Data Loading

All data is fetched server-side in two parallel batches:

```
Batch 1: getCardSummary, getBenefitUsageSummaries, getRecentTransactions,
          getUserAnniversaryStatus, getConnectionAlerts

Batch 2: getBenefitTransactions, getInsightsForDisplay, getCreditsDebugBreakdown (dev only)
```

### Section Order (top to bottom)

1. **Header** — title + CardSwitcher + SyncButton
2. **Connection Alerts** — Plaid health banners (conditional)
3. **Anniversary Prompt** — nudge to set card open date (conditional)
4. **Summary Bar** — 4 KPI flip-cards
5. **Countdown Timer** — expiring credit alert (conditional)
6. **Insights Section** — up to 3 scored insight cards
7. **Active Benefits** — grid of benefit cards (sorted by urgency)
8. **Upcoming Benefits** — future-cycle benefits (conditional)
9. **Debug Table** — credits breakdown (dev only)

---

## 3. Card Selection

### One Dashboard Per Linked Card

The dashboard is automatically configured for the user's linked card. The card type is detected during onboarding via annual fee detection + user confirmation.

### Card Switcher

A dropdown selector (`CardSwitcher`) allows switching between card types from the card registry. Located beneath the page title. Implemented as a native `<select>` that calls a server action (`updateCardType`) via `useTransition()`.

### Multi-Card Users

If a user has multiple linked cards, each gets its own card profile. The active profile determines which dashboard data is shown. Switching card type updates the active profile's `cardType` field.

---

## 4. Summary Bar

Four KPI cards rendered in a 2×2 grid (mobile) or 4-column row (desktop). Each card is a **FlipCard** — hover (desktop) or tap (mobile) reveals a tooltip explanation on the back.

| Metric | Front | Back (tooltip) | Color Logic |
|---|---|---|---|
| **Credits Used** | `$X` total redeemed | "Total value captured from card benefits this year" | Green if > $0, muted otherwise |
| **Net Cost** | `$X` effective fee | "Annual fee minus benefits used" | Green if ≤ $0 (fee paid off), danger otherwise |
| **ROI** | `X%` return | "Benefits captured ÷ annual fee" | Green if on pace, warning if 50%+ behind, danger if 25%+ behind relative to year progress |
| **Expiring Soon** | `$X` at risk | "Unused credits expiring in the next 14 days" | Green if $0, danger if ≥ $50, warning otherwise |

### ROI Pacing Logic

ROI color is determined by comparing `roiPercent` against expected pace through the card year:
- **On track**: ROI% ≥ (yearProgress% - 25%) → green
- **Behind**: ROI% ≥ (yearProgress% - 50%) → warning
- **Off track**: below that → danger

---

## 5. Connection Alerts

Renders when Plaid connection health issues exist. Three alert types:

| Type | Icon | Color | Meaning |
|---|---|---|---|
| `stale` | RefreshCw | Warning (orange) | Data hasn't synced recently |
| `needs_reauth` | AlertTriangle | Danger (red) | Bank credentials expired |
| `disconnected` | WifiOff | Danger (red) | Connection broken |

Alerts are fetched via `getConnectionAlerts()` and rendered as colored banner cards.

---

## 6. Anniversary Prompt

Shown when `anniversarySource === "pending"` — the system hasn't detected or been told the card's anniversary date. Knowing the anniversary determines card year boundaries for accurate ROI and cycle calculations.

**Two visual states**:
- **No activity yet** (`hasActivity=false`): Informational blue, "When did you open your card?"
- **Has activity** (`hasActivity=true`): Warning orange, more urgent tone — tracking is inaccurate without this date

**Interaction**: Date input → Save button → calls `setAnniversaryDate` server action → `router.refresh()`.

Anniversary can also be edited later from the Settings page via `AnniversaryEditor`.

---

## 7. Countdown Timer

Conditional alert shown when any credit-type benefit has ≤14 days remaining and unused value.

Selects the **nearest expiring** benefit with remaining balance. Renders a colored alert card:
- **≤7 days**: Danger (red) styling
- **8–14 days**: Warning (orange) styling

Shows benefit name, dollar amount at risk, and days remaining.

---

## 8. Insights Section

Renders up to 3 scored insights from the Insights Engine. See `insights-engine.md` for generation, scoring, and display rules.

### Layout

Heading ("Insights") + 3-column responsive grid (1 col mobile, 2 col sm, 3 col lg).

### Insight Cards

Each card shows:
- **Icon** — varies by group/category (ArrowRightLeft for Group A, AlertTriangle for B1, Lightbulb for B2/B3, CheckCircle2 for Group C, Sparkles for C0)
- **Title** — rendered from template
- **Body** — rendered from template
- **Dismiss button** — X icon in top-right corner

### Dismiss Behavior

- Clicking X calls `POST /api/insights/dismiss` with `{ insightId }`
- Sets insight state to `"dismissed"` with `resolvedAt` timestamp
- Records a dismissal impression (surface: `"dismissed"`)
- Optimistic fade (opacity transition via `useTransition`)
- `router.refresh()` removes the card from the page
- **Dismissed insights are not revived** by the generator — the "dismissed" state is respected across syncs (generator only revives "superseded" and "expired")

### Display Rules (from Insights Engine)

1. Score floor ≥ 30 (unless floor override)
2. Max 1 insight per benefit
3. At least 1 Group C if available
4. Group A outranks Group B within 10 points
5. C0 always ranks first when pending
6. Max 3 per page

---

## 9. Benefit Cards

The core of the dashboard. Each card represents a single benefit or a group of related sub-benefits.

### Benefit Grouping

Benefits with a `displayGroup` field are merged into a single card. Currently used for DoorDash (3 sub-credits: $5 restaurant + $10 grocery + $10 convenience = $25/month displayed as one card).

Grouping aggregates: totalCredit, totalUsed, totalRemaining, isFullyUsed, daysRemaining (min), ytdUsed (sum).

### Urgency Sort

Active benefits are sorted by urgency tier, then by days remaining:

| Tier | Priority | Condition |
|---|---|---|
| 1 (highest) | Partially used | `totalUsed > 0 && !isFullyUsed` — finish what you started |
| 2 | Untouched | `totalUsed === 0 && !isFullyUsed` — start using it |
| 3 (lowest) | Fully used | `isFullyUsed` — nothing to do |

Fully-used benefits render at 50% opacity.

### Credit-Type Benefits

The primary benefit type. Shows:
- **Header**: Icon + name + cycle label (Monthly, Jan–Jun, Annual, etc.) + "view" button
- **Progress**: Dollar amount used / total credit with ProgressBar
- **Sub-credit breakdown**: For grouped benefits, shows each sub-benefit's usage below a divider
- **Footer**: Remaining amount + days-left urgency indicator (≤7d red, ≤14d orange, ≤30d muted)
- **YTD captured**: If available, shows `$X captured this cycle` (or "this year" if no anniversary date)

### Subscription-Type Benefits

For benefits like Apple TV+, Apple Music, and DashPass that are activation-based (not transaction-matched).

**Activated state**:
- Green "Activated" badge
- Monthly value (`$X.XX/mo`)
- YTD captured value (computed server-side: `creditAmount × months elapsed` within card year)

**Not activated state**:
- Muted "Not activated" badge
- Monthly value available

### Cycle Labels

| Cycle | Label |
|---|---|
| `monthly` | Monthly |
| `biannual_h1` | Jan – Jun |
| `biannual_h2` | Jul – Dec |
| `annual_calendar` | Annual |
| `annual_anniversary` | Anniversary year |
| `quadrennial` | Every 4 years |
| `subscription` | Subscription |

### Expiry Display

- Credits with cycles: "Resets [date]" (monthly) or "Expires [date]" (other)
- Benefits with sunset dates: "Expires [date]"

---

## 10. Benefit Detail Modal

Clicking a benefit card opens a modal with full details.

### Modal Sections

1. **Status badges** — Used, Activated/Not Activated, Activation Required, Subscription, Monthly, reset/expiry date
2. **Usage stats** (credit type) — Progress bar with used/total, remaining, days left, sub-credit breakdown for grouped benefits
3. **Subscription panel** (subscription type) — Monthly value, activation status with date, or activation form
4. **Description** — Full benefit description from card definition
5. **How to Use** — Numbered step-by-step instructions
6. **Links** — External links to activation portals, merchants, terms
7. **Matched Transactions** — List of transactions matched to this benefit with dates, amounts, and credits applied, plus total

### Subscription Activation Flow

For unactivated subscriptions, the modal shows:
- Month picker (`<select>` with last 12 months, no future months)
- "Mark as Activated" button
- Calls `POST /api/benefits/activate` with `{ benefitId, activatedMonth: "MM-YYYY" }`
- Stores in `benefitOverrides` table with `overrideType: "activated"`
- Refreshes insights after activation

For activated subscriptions:
- Shows activation date ("Activated since [Month Year]")
- "Deactivate" link (calls `DELETE /api/benefits/activate`)

---

## 11. Upcoming Benefits

Benefits whose cycle hasn't started yet (e.g., H2 benefits viewed during H1) appear in a separate "Upcoming Benefits" section below active benefits. Same card layout, same urgency sort. Hidden if empty.

---

## 12. Transaction Feed

Located on the Spending page (`/spending`) but closely related to the benefits dashboard. Shows all card transactions with benefit matching status.

### Layout

- **Filter pills**: Scrollable row — All, [each matched benefit], Unmatched (with counts)
- **Sort controls**: Date or Amount, ascending/descending
- **Mobile**: Card-based list with merchant, date, amount, credit applied, match info
- **Desktop**: Table with columns: Date, Merchant, Amount, Matched Benefit, Credit, Confidence

### Manual Match Actions

Always-visible action buttons on each transaction row:

**Matched transactions** — Red X button to remove match:
- Opens dropdown with reason options: "Doesn't qualify", "Duplicate", "Other"
- Calls `POST /api/benefits/flag` with `flagType: "removed"`
- Optimistic opacity fade
- Undo toast with callback to `DELETE /api/benefits/flag`

**Unmatched transactions** — Blue + button to add match:
- Opens dropdown listing eligible benefits (credit-type, remaining balance, cycle covers transaction date)
- Calls `POST /api/benefits/flag` with `flagType: "added"`
- Same optimistic + undo pattern

### Confidence Badges

For auto-matched transactions: green (high), warning (medium), danger (low). For manual matches: blue "manual" badge.

### Pagination

Initial load: 50 transactions. "View More" button loads additional batches of 50 via `GET /api/transactions?offset=X&limit=50`.

---

## 13. Sync Flow

### Manual Sync

SyncButton in the page header. Three states:
1. **Default**: "Sync" with refresh icon
2. **Syncing**: "Syncing" with spinning icon
3. **Done**: "Synced" with green checkmark (reverts after 3 seconds)

Calls `POST /api/plaid/sync` → triggers `triggerSync()` → processes transactions → generates insights → `router.refresh()`.

### Automatic Sync

- **Webhook**: Plaid pushes `SYNC_UPDATES_AVAILABLE` events
- **Cron**: Every 6 hours, syncs connections stale >6h

---

## 14. ROI Calculation

### Credit-Type Benefits

`creditsUsed` = sum of `amountUsed` across all benefit usage rows within the card year.

### Subscription Benefits

For activated subscriptions, value is computed as:
```
creditAmount × (countFullMonths(rangeStart, rangeEnd) + 1)
```

Where `rangeStart = max(activationDate, cardYearStart)` and `rangeEnd = min(now, sunsetDate, cardYearEnd)`.

The `+1` ensures the current month is included (e.g., activated in February and it's February = 1 month of value).

### ROI Formula

```
creditsAvailable = sum of all benefit credit amounts across cycles within card year
                   + subscription value for total possible months
creditsUsed = matched transaction credits + activated subscription value
effectiveFee = annualFee - creditsUsed
roiPercent = round((creditsUsed / annualFee) × 100)
```

### YTD Labels

- **Anniversary date set**: "captured this cycle" (card year = anniversary to anniversary)
- **No anniversary date**: "captured this year" (calendar year)

---

## 15. Component Reference

| Component | Type | File | Purpose |
|---|---|---|---|
| `SummaryBar` | Client | `_components/SummaryBar.tsx` | 4 KPI flip-cards |
| `CountdownTimer` | Server | `_components/CountdownTimer.tsx` | Expiring credit alert |
| `AnniversaryPrompt` | Client | `_components/AnniversaryPrompt.tsx` | Set card anniversary date |
| `SyncButton` | Client | `_components/SyncButton.tsx` | Manual transaction sync |
| `ConnectionAlerts` | Server | `_components/ConnectionAlerts.tsx` | Plaid health banners |
| `CardSwitcher` | Client | `_components/CardSwitcher.tsx` | Card type dropdown |
| `InsightsSection` | Server | `_components/InsightsSection.tsx` | Insight card grid |
| `InsightCard` | Client | `_components/InsightCard.tsx` | Single insight with dismiss |
| `BenefitCard` | Client | `_components/BenefitCard.tsx` | Benefit usage card |
| `BenefitDetailModal` | Client | `_components/BenefitDetailModal.tsx` | Full benefit details + activation |
| `UpcomingBenefits` | Server | `_components/UpcomingBenefits.tsx` | Future-cycle benefits grid |
| `TransactionFeed` | Client | `_components/TransactionFeed.tsx` | Transaction table with manual matching |
| `DebugCreditsTable` | Client | `_components/DebugCreditsTable.tsx` | Dev-only credits breakdown |

---

## 16. API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/plaid/sync` | POST | Trigger manual transaction sync |
| `/api/benefits/activate` | POST | Mark subscription as activated |
| `/api/benefits/activate` | DELETE | Deactivate subscription |
| `/api/benefits/flag` | POST | Add/remove manual transaction match |
| `/api/benefits/flag` | DELETE | Undo a manual match flag |
| `/api/insights/dismiss` | POST | Dismiss an insight |
| `/api/transactions` | GET | Paginated transaction fetch |
