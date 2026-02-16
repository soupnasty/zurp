# Point Valuation Modes

## The Problem

Credit card points don't have a single fixed dollar value. A Chase Ultimate Rewards point is worth 1¢ if you cash out, ~1.5¢ if you redeem through the Chase Travel portal, and up to 2¢ if you transfer to an airline partner and book a premium cabin. Zurp previously used only the conservative (cash-out) valuation, which undersold transfer-partner cards and made flat cash-back cards look disproportionately strong.

## The Solution

Zurp now computes three valuations for every card simulation and lets users toggle between them on the Compare page. Each mode re-ranks all 30 cards and updates every dollar figure in the leaderboard, stacked bars, and head-to-head view — all client-side, no server round-trip.

### Valuation Modes

| Mode | UI Label | What it models | CPP source |
|------|----------|----------------|------------|
| `conservative` | Cash Out | Portal redemption or statement credit — the guaranteed floor | `conservativeCpp` from earn config |
| `realistic` | Smart Redeemer | A well-informed user who sometimes transfers, sometimes doesn't | Midpoint: `(conservativeCpp + upsideCpp) / 2` |
| `upside` | Transfer Pro | Strategic transfer-partner maximizer hitting sweet spots | `upsideCpp` from earn config |

For pure cash-back cards (Amex Blue Cash Preferred, Wells Fargo Active Cash, etc.), `conservativeCpp` and `upsideCpp` are both `1.0`, so all three modes produce identical values. The toggle only creates meaningful differences for transferable-point currencies.

### Example CPP Values

| Card | Currency | Conservative | Realistic | Upside |
|------|----------|-------------|-----------|--------|
| Chase Sapphire Reserve | Chase UR | 1.50 | 1.75 | 2.00 |
| Amex Gold | Amex MR | 1.00 | 1.50 | 2.00 |
| Capital One Venture X | Capital One Miles | 1.00 | 1.38 | 1.75 |
| World of Hyatt | Hyatt Points | 1.70 | 1.95 | 2.20 |
| Wells Fargo Active Cash | Cash Back | 1.00 | 1.00 | 1.00 |

## How Point Calculation Works

### Pipeline Overview

The points engine runs a full simulation of the user's trailing 365 days of transactions across all 30 cards. The pipeline:

```
Transactions → Classify → Calculate → Valuate → Simulate Benefits → Rank
```

### Step 1: Category Classification

Each transaction is assigned one of 26 spend categories via a three-tier system:

1. **Merchant name match** (highest priority) — ~200 static entries mapping merchant names to categories. "Chipotle" → `dining`, "Uber" → `rideshare`, "Hilton" → `travel_hotels`.
2. **Plaid category fallback** — If no merchant name match, the Plaid-provided category string is mapped. "Food and Drink > Restaurants" → `dining`.
3. **Fallback** — Everything else lands in `other`.

Each assignment carries a confidence level (`high`, `medium`, `low`) and the match source for transparency.

When portal mode is enabled, the travel categories (`travel_flights`, `travel_hotels`, `travel_other`, `car_rentals`) are reclassified as `travel_portal` to model booking through a card's travel portal instead of directly.

### Step 2: Per-Transaction Points Calculation

For each transaction × card combination, the calculator walks the card's earn config:

1. Check each **bonus category** in priority order. A bonus matches if the transaction's category is in the bonus's category list and all conditions pass (merchant match, amount threshold, time window, date range).
2. If no bonus matches, apply the **base rate**.
3. Check **caps** — if the cumulative spend in capped categories exceeds the cap's `maxSpend`, the earn rate drops to the base rate for the overflow.

The output is an earn rate and a point count for that transaction.

**Conditions** can include merchant-name matching (`merchant_match`), minimum purchase amounts (`amount_gte`), and time-window restrictions. Time windows support overnight wrapping — for example, the Citi Strata Elite "Citi Nights" bonus applies 6x on dining charged Friday–Saturday 6 PM to 6 AM ET. The calculator checks the transaction's `datetime` against the window's timezone, day-of-week, and hour range.

### Step 3: Points Valuation

After summing all points for a card, the `valuatePoints` function converts to dollars at three CPP rates:

```
conservative = points × conservativeCpp / 100
realistic    = points × ((conservativeCpp + upsideCpp) / 2) / 100
upside       = points × upsideCpp / 100
```

The division by 100 converts from cents-per-point to dollars-per-point. The realistic value is always the arithmetic mean of conservative and upside.

### Step 4: Benefit Simulation

For non-points value (statement credits, travel credits, etc.), the engine runs Zurp's core benefit matcher against the transaction set for each card. This determines how much of each card's credit catalog the user's spending would actually trigger. For example, a user who never uses DoorDash wouldn't capture a DoorDash credit.

### Step 5: Net Value and Ranking

The final net value per mode:

```
net = pointsValue(mode) + benefitsSimulated − annualFee
```

Cards are ranked by their net value in the currently selected mode. Switching modes re-sorts the leaderboard client-side.

## UI Components

### ValuationToggle

A three-button pill selector rendered above the leaderboard. Each button shows a label and a sub-label in mono font:

- **Cash Out** — "portal / cash back"
- **Smart Redeemer** — "avg redemption"
- **Transfer Pro** — "best transfers"

The active button gets a cyan tinted background and border. Defaults to "Smart Redeemer" (realistic) as a sensible middle ground.

### Range Visualization (Ghost Bar)

The stacked bar chart includes a "ghost" extension segment — a faint blue bar extending from the points segment to show the upside potential. When viewing in conservative mode, the ghost shows how much more the card could earn with strategic transfers. The ghost disappears in upside mode since you're already seeing the maximum.

### Mode-Aware Leaderboard

Below each card's net value, cards with transferable points show a range like "$820 – $1,140 / yr" (conservative to upside). Cash-back cards show no range since all modes produce the same value.

The leaderboard re-sorts on every mode change. A card that's #5 in Cash Out mode might be #1 in Transfer Pro mode if it has a high base rate with valuable transfer partners.

### Head-to-Head

The head-to-head comparison (user's card vs. best alternative) updates all rows when the mode changes: Points, Benefits, Fees, and Total all reflect the selected valuation.

## Data Flow

```
Server (compare/page.tsx)
  └─ computeComparison() → ComparisonOutput
       └─ simulator.ts: runSimulation()
            ├─ simulateCard() per config → CardSimulation with netByMode
            └─ simulateBenefitsForCard() → override netByMode
       └─ serialize dates → SerializedComparison

Client (CompareTab.tsx)
  ├─ useState<ValuationMode>("realistic")
  ├─ Re-sort cards by getNetForMode(card, mode) on each render
  ├─ Pass mode to Leaderboard, HeadToHead
  └─ ValuationToggle controls mode state

Leaderboard.tsx
  ├─ Receives pre-sorted cards + mode
  ├─ Shows getPointsForMode / getNetForMode values
  ├─ Passes pointsUpside to StackedBar for ghost

StackedBar.tsx
  ├─ Renders points + benefits − fees segments
  └─ Ghost extension when pointsUpside > points

HeadToHead.tsx
  ├─ Sorts by getNetForMode for current mode
  └─ Points row and Total row use mode-aware values
```

## Type Definitions

```typescript
type ValuationMode = "conservative" | "realistic" | "upside";

interface CardSimulation {
  // ...existing fields...
  pointsValueConservative: number;
  pointsValueRealistic: number;    // new
  pointsValueUpside: number;
  netByMode: {                     // new
    conservative: number;
    realistic: number;
    upside: number;
  };
}
```

## Files Modified

| File | Change |
|------|--------|
| `src/lib/points/types.ts` | Added `ValuationMode`, `pointsValueRealistic`, `netByMode` |
| `src/lib/points/valuation.ts` | Returns 3-tier object instead of 2-tier |
| `src/lib/points/simulator.ts` | Computes all 3 net modes after benefit simulation |
| `src/lib/points/comparison-reader.ts` | Derives realistic + netByMode from stored DB values |
| `src/app/dashboard/_components/ValuationToggle.tsx` | New component — 3-mode pill toggle |
| `src/app/dashboard/_components/CompareTab.tsx` | Toggle state, mode-aware sorting, helper exports |
| `src/app/dashboard/_components/Leaderboard.tsx` | Mode-aware values, range text, ghost bar prop |
| `src/app/dashboard/_components/StackedBar.tsx` | Ghost extension segment for upside visualization |
| `src/app/dashboard/_components/HeadToHead.tsx` | Mode-aware points and total rows |
