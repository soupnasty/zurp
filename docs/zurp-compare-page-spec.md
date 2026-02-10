# Zurp — Compare Page Spec

**Version**: 1.0
**Date**: February 2026
**Status**: Draft
**Dependencies**: zurp-points-earn-model.md, zurp-insights-engine-v2.md, card catalogs (CSR, CSP, Gold)

---

## 1. Purpose

The Compare page answers: **"Is your current card the best card for your actual spending?"**

It takes the user's real transaction history, simulates what every supported card would earn them (points + benefits), and shows a clear side-by-side comparison anchored on their current card.

This is the second core surface in Zurp (after the Benefits Dashboard) and the primary driver of the "Compare" value prop from the landing page.

### Surface Ownership

The Compare page is the **sole surface for all cross-card functionality**. The Benefits Dashboard shows only the user's linked card(s) and their actual benefit tracking data. Any feature that involves viewing, simulating, or comparing cards the user doesn't own belongs here. See zurp-dashboard-spec.md §4 for the full ownership matrix.

---

## 2. Page Structure

The Compare page has 4 sections, scrollable top to bottom:

```
┌─────────────────────────────────────────────┐
│  1. HEADLINE VERDICT                         │
│     "Your CSR earned you $1,830 net value    │
│      last year — $1,155 more than the next   │
│      best card for your spending."           │
├─────────────────────────────────────────────┤
│  2. TOTAL VALUE COMPARISON (3 cards)         │
│     Bar chart / visual: net value per card   │
│     Points value + Credits − Annual fee      │
├─────────────────────────────────────────────┤
│  3. CATEGORY BREAKDOWN                       │
│     Your spending by category, with each     │
│     card's earn rate + value side by side     │
│     Winner badge per category                │
├─────────────────────────────────────────────┤
│  4. BENEFIT & PERK COMPARISON                │
│     What each card offers beyond points:     │
│     benefits, lounge, insurance, status        │
└─────────────────────────────────────────────┘
```

---

## 3. Section 1: Headline Verdict

### Data Required
- User's current card net value (from simulation)
- Second-best card net value
- Gap between them

### Display Logic

**If current card wins:**
> "Your [Card Name] earned you **$[net_value]** in net value last year — **$[margin] more** than the next best card for your spending."

**If current card loses:**
> "Based on your spending, the **[Winner Card]** would earn you **$[margin] more** per year than your current [Card Name]."

**If close (margin < $50):**
> "Your [Card Name] and the [Runner-up] are nearly tied for your spending — within **$[margin]** per year. The right choice comes down to which perks matter to you."

### Rules
- Net value = Points value (conservative) + Total benefits − Annual fee
- For user's own card: Credits = what they've actually captured (from benefit tracker)
- For simulated cards: Credits = total available benefits (full catalog value)
- Always show the conservative points valuation as the primary number
- Margin threshold for "close": < $50/yr

---

## 4. Section 2: Total Value Comparison

### Visual: Stacked Bar Chart (3 cards)

Each bar is broken into components so the user sees *where* the value comes from:

```
Card Name          Annual Fee    Net Value
─────────────────────────────────────────
Chase Sapphire     $795/yr       $1,830
Reserve ████████████████████████████████  ← user's card (highlighted)
         [points: $565] [benefits: $2,060]

Amex Gold          $325/yr       $619
         ████████████████
         [points: $520] [benefits: $424]

Chase Sapphire     $95/yr        $675
Preferred ██████████████████
          [points: $480] [benefits: $290]
```

### Data Structure

```json
{
  "cards": [
    {
      "card_id": "csr",
      "card_name": "Chase Sapphire Reserve",
      "is_users_card": true,
      "annual_fee": 795,
      "points_value": 565.00,
      "benefits_value": 2060.00,
      "benefits_label": "if fully used",
      "benefits_captured": 1450.00,
      "gross_value": 2625.00,
      "net_value": 1830.00,
      "rank": 1
    },
    {
      "card_id": "csp",
      "card_name": "Chase Sapphire Preferred",
      "is_users_card": false,
      "annual_fee": 95,
      "points_value": 480.00,
      "benefits_value": 290.00,
      "benefits_label": "available benefits",
      "benefits_captured": null,
      "gross_value": 770.00,
      "net_value": 675.00,
      "rank": 2
    },
    {
      "card_id": "gold",
      "card_name": "Amex Gold",
      "is_users_card": false,
      "annual_fee": 325,
      "points_value": 520.00,
      "benefits_value": 424.00,
      "benefits_label": "available benefits",
      "benefits_captured": null,
      "gross_value": 944.00,
      "net_value": 619.00,
      "rank": 3
    }
  ]
}
```

### Display Rules
- User's card always appears first (top), regardless of rank
- Other cards sorted by net value descending
- User's card visually distinguished (highlighted border, "Your card" badge)
- For user's card: show both "captured" and "available" benefit values
- For simulated cards: show "available" benefits with note "if fully used"
- Annual fee shown as a deduction in the bar (negative segment or separate label)

---

## 5. Section 3: Category Breakdown

This is the most data-rich section. It shows the user's actual spending per category and what each card would earn.

### Layout: Category Rows

Each row = one spending category where the user has meaningful spend.

```
┌─────────────────────────────────────────────────────────────┐
│ 🍽 Dining                                    You spent: $8,400 │
│                                                               │
│  CSR     3x    25,200 pts    $315     ░░░░░░░░░░░░░░░░       │
│  Gold    4x    33,600 pts    $336     ░░░░░░░░░░░░░░░░░░ 👑  │
│  CSP     3x    25,200 pts    $315     ░░░░░░░░░░░░░░░░       │
├─────────────────────────────────────────────────────────────┤
│ 🛒 Groceries                                 You spent: $6,200 │
│                                                               │
│  CSR     1x    6,200 pts     $77.50   ░░░░░                   │
│  Gold    4x    24,800 pts    $248     ░░░░░░░░░░░░░░░░░░ 👑  │
│  CSP     1x    6,200 pts     $77.50   ░░░░░                   │
├─────────────────────────────────────────────────────────────┤
│ ✈️ Flights                                   You spent: $3,200 │
│                                                               │
│  CSR     4x    12,800 pts    $160     ░░░░░░░░░░░░░░░░░░ 👑  │
│  Gold    3x    9,600 pts     $96      ░░░░░░░░░░░░░░         │
│  CSP     2x    6,400 pts     $80      ░░░░░░░░░░             │
└─────────────────────────────────────────────────────────────┘
```

### Data Structure

```json
{
  "analysis_period": "2025-02-01 to 2026-01-31",
  "total_spend": 62400,
  "categories": [
    {
      "zurp_category": "dining",
      "label": "Dining",
      "icon": "utensils",
      "total_spend": 8400,
      "transaction_count": 156,
      "cards": [
        {
          "card_id": "csr",
          "earn_rate": 3,
          "points": 25200,
          "value": 315.00,
          "is_winner": false
        },
        {
          "card_id": "gold",
          "earn_rate": 4,
          "points": 33600,
          "value": 336.00,
          "is_winner": true,
          "margin_over_second": 21.00
        },
        {
          "card_id": "csp",
          "earn_rate": 3,
          "points": 25200,
          "value": 315.00,
          "is_winner": false
        }
      ]
    },
    {
      "zurp_category": "grocery",
      "label": "Groceries",
      "icon": "shopping-cart",
      "total_spend": 6200,
      "transaction_count": 104,
      "note": "Gold 4x capped at $25K/yr — you're within the cap",
      "cards": [
        {
          "card_id": "csr",
          "earn_rate": 1,
          "points": 6200,
          "value": 77.50,
          "is_winner": false
        },
        {
          "card_id": "gold",
          "earn_rate": 4,
          "points": 24800,
          "value": 248.00,
          "is_winner": true,
          "margin_over_second": 170.50
        },
        {
          "card_id": "csp",
          "earn_rate": 1,
          "points": 6200,
          "value": 77.50,
          "is_winner": false
        }
      ]
    }
  ]
}
```

### Display Rules
- Sort categories by total spend descending (biggest impact first)
- Only show categories where user has ≥ $50 spend (skip noise)
- Winner gets a crown/badge icon
- If all cards tie on a category (all 1x), de-emphasize the row (gray, collapsed)
- Cap notes shown inline (e.g., "Gold 4x capped at $25K/yr")
- "Other spending" row at bottom aggregates all base-rate categories
- Mobile: collapse to show only winner per category, expandable for full comparison

### Category Display Order
1. Categories where cards *differ* in earn rate (most interesting) — sorted by spend
2. Categories where all cards earn the same — collapsed into "Other" unless spend > $2,000

---

## 6. Section 4: Benefit & Perk Comparison

A feature matrix showing what each card offers beyond points. This is the qualitative layer that points alone can't capture.

### Layout: Feature Matrix

The Benefits & Perks section shows **everything** a card offers — not just what Zurp tracks via Plaid. This gives users a complete picture when evaluating cards. Tracked benefits show a 📊 indicator; untracked benefits are listed without one.

```
                           CSR          Gold         CSP
                           $795/yr      $325/yr      $95/yr
───────────────────────────────────────────────────────────
BENEFITS 📊 (tracked by Zurp)
  Travel benefit           $300         —            $50
  Dining benefit           $300         $220*        —
  DoorDash                 $300         —            $120
  Rideshare                $120         $120†        —
  Events                   $300         —            —
  Streaming                ~$250        —            —
  Fitness                  $120         —            —
  Hotel                    $750         —            —
  Coffee                   —            $84          —
  Total tracked            $2,060       $424         $290

POINTS EARNING 📊 (tracked by Zurp)
  Dining                   3x           4x ★         3x
  Groceries                1x           4x ★         1x
  Travel (direct)          4x ★         3x           2x
  Travel (portal)          8x ★         —            5x
  Streaming                1x           1x           3x ★
  Rideshare (Lyft)         5x ★         —            5x ★
  Base rate                1x           1x           1x
  Point value              1.25¢        1.0¢         1.25¢

TRAVEL PERKS
  Airport lounge           Priority     —            —
                           Pass +
                           Sapphire
  Hotel status             IHG Plat     —            —
  Global Entry/TSA         $30/yr       —            —
  DashPass                 ✓            —            ✓
  Travel concierge         Reserve      —            —
                           Designer
  Amex Travel access       —            ✓            —

PROTECTIONS & INSURANCE
  Auto rental CDW          Primary      Secondary    Primary
  Trip cancellation        ✓            —            ✓
  Trip delay reimburse     ✓            —            ✓
  Lost luggage reimburse   ✓            —            ✓
  Purchase protection      ✓            ✓            ✓
  Extended warranty        ✓            ✓            ✓
  Return protection        —            ✓            —
  Cell phone protection    —            —            —
  Roadside assistance      ✓            ✓            ✓

TRANSFER PARTNERS
  Hotel partners           Hyatt, IHG,  Hilton,      Hyatt, IHG,
                           Marriott     Choice       Marriott
  Airline partners         United, SW,  Delta, JB,   United, SW,
                           BA, Air Fr   ANA, Sing    BA, Air Fr

★ = best among compared cards
📊 = Zurp actively tracks usage via your transactions
* Gold dining: $10/mo at select merchants + $50/semi Resy
† Gold rideshare: $10/mo Uber Cash (includes Uber Eats)
```

### Data Structure

Each row has a `tracked` boolean indicating whether Zurp monitors this benefit via Plaid.

```json
{
  "sections": [
    {
      "section_id": "benefits",
      "label": "Benefits",
      "tracked": true,
      "rows": [
        {
          "label": "Travel benefit",
          "tracked": true,
          "cards": {
            "csr": { "value": "$300", "detail": "per anniversary year" },
            "gold": { "value": null },
            "csp": { "value": "$50", "detail": "hotel credit per anniversary year" }
          }
        },
        {
          "label": "Dining benefit",
          "tracked": true,
          "cards": {
            "csr": { "value": "$300", "detail": "Exclusive Tables, semi-annual" },
            "gold": { "value": "$220", "detail": "$10/mo at select merchants + $50/semi Resy", "footnote": true },
            "csp": { "value": null }
          }
        },
        {
          "label": "Total tracked benefits",
          "is_total_row": true,
          "cards": {
            "csr": { "value": "$2,060" },
            "gold": { "value": "$424" },
            "csp": { "value": "$290" }
          }
        }
      ]
    },
    {
      "section_id": "points",
      "label": "Points Earning",
      "tracked": true,
      "rows": [
        {
          "label": "Dining",
          "tracked": true,
          "cards": {
            "csr": { "value": "3x", "is_best": false },
            "gold": { "value": "4x", "is_best": true },
            "csp": { "value": "3x", "is_best": false }
          }
        }
      ]
    },
    {
      "section_id": "travel_perks",
      "label": "Travel Perks",
      "tracked": false,
      "rows": [
        {
          "label": "Airport lounge",
          "tracked": false,
          "cards": {
            "csr": { "value": "Priority Pass + Sapphire Lounge", "available": true },
            "gold": { "value": null, "available": false },
            "csp": { "value": null, "available": false }
          }
        }
      ]
    },
    {
      "section_id": "protections",
      "label": "Protections & Insurance",
      "tracked": false,
      "rows": [
        {
          "label": "Auto rental CDW",
          "tracked": false,
          "cards": {
            "csr": { "value": "Primary", "available": true },
            "gold": { "value": "Secondary", "available": true },
            "csp": { "value": "Primary", "available": true }
          }
        },
        {
          "label": "Trip cancellation",
          "tracked": false,
          "cards": {
            "csr": { "value": true, "available": true },
            "gold": { "value": null, "available": false },
            "csp": { "value": true, "available": true }
          }
        }
      ]
    },
    {
      "section_id": "transfer_partners",
      "label": "Transfer Partners",
      "tracked": false,
      "rows": [
        {
          "label": "Hotel partners",
          "tracked": false,
          "cards": {
            "csr": { "value": "Hyatt, IHG, Marriott" },
            "gold": { "value": "Hilton, Choice" },
            "csp": { "value": "Hyatt, IHG, Marriott" }
          }
        }
      ]
    }
  ]
}
```

### Source URL Strategy

Rather than linking every individual benefit row (which creates visual clutter since most benefits on the same card link to the same 2-3 issuer pages), the Compare page includes a **card-level links section** at the bottom of every tab (Total Value, By Category, and Benefits & Perks). This ensures users can verify the underlying data from any tab without switching.

Each card gets a small set of reference links to the issuer's official pages:

```json
{
  "card_links": {
    "csr": {
      "card_name": "Chase Sapphire Reserve",
      "links": [
        { "label": "Card benefits overview", "url": "https://www.chase.com/personal/credit-cards/sapphire/reserve" },
        { "label": "Rewards & earn rates", "url": "https://www.chase.com/personal/credit-cards/sapphire/reserve/earn-rewards" },
        { "label": "Transfer partners", "url": "https://ultimaterewardspoints.chase.com/transfer-partners" },
        { "label": "Insurance & protections", "url": "https://www.chase.com/personal/credit-cards/sapphire/reserve/card-benefits" }
      ]
    },
    "gold": {
      "card_name": "Amex Gold",
      "links": [
        { "label": "Card benefits overview", "url": "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card" },
        { "label": "Rewards & earn rates", "url": "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card/rewards" },
        { "label": "Transfer partners", "url": "https://global.americanexpress.com/rewards/transfer" },
        { "label": "Insurance & protections", "url": "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card/benefits" }
      ]
    },
    "csp": {
      "card_name": "Chase Sapphire Preferred",
      "links": [
        { "label": "Card benefits overview", "url": "https://www.chase.com/personal/credit-cards/sapphire/preferred" },
        { "label": "Rewards & earn rates", "url": "https://www.chase.com/personal/credit-cards/sapphire/preferred/earn-rewards" },
        { "label": "Transfer partners", "url": "https://ultimaterewardspoints.chase.com/transfer-partners" },
        { "label": "Insurance & protections", "url": "https://www.chase.com/personal/credit-cards/sapphire/preferred/card-benefits" }
      ]
    }
  }
}
```

**Display**: Rendered as a compact "Learn more from the source" links section at the bottom of all three tabs, grouped by card. Each card shows its name and 3-4 links as simple text links. Implemented as a single reusable component.

**Maintenance**: URLs stored in the card catalog config. Adding a new card = adding its reference links to the config.

---

## 7. Card Selection Logic

From the resolved decisions (Points Earn Model §13.4): the Compare page shows the user's card + 2 best alternatives.

### Selection Algorithm

```
1. Run points simulation on ALL supported cards
2. Calculate net_value for each:
   net_value = points_value_conservative + total_benefits - annual_fee
3. Rank all cards by net_value descending
4. Select:
   a. User's card (always shown, always first)
   b. Top 2 cards that are NOT user's card
5. If user's card IS #1 overall: show #2 and #3
6. If user's card is NOT #1: show #1 (winner) and whichever of #2/#3 isn't user's card
```

### Future: User Override

V2 could let the user manually select which cards to compare. For v1, automatic selection ensures the comparison is always relevant.

---

## 8. Comparison Matrices (Static Reference Data)

These matrices define the feature-level comparison data for Section 4. They're derived from the card catalogs and maintained as static config.

### 8.1 CSR vs Gold

| Feature | CSR ($795/yr) | Gold ($325/yr) | Winner |
|---|---|---|---|
| **Dining earn** | 3x (1.25cpp) = 3.75¢/$ | 4x (1.0cpp) = 4.0¢/$ | Gold |
| **Grocery earn** | 1x = 1.25¢/$ | 4x (cap $25K) = 4.0¢/$ | Gold |
| **Travel earn (direct)** | 4x = 5.0¢/$ | 3x = 3.0¢/$ | CSR |
| **Travel earn (portal)** | 8x = 10.0¢/$ | N/A | CSR |
| **Streaming earn** | 1x = 1.25¢/$ | 1x = 1.0¢/$ | CSR |
| **Rideshare earn** | 5x Lyft = 6.25¢/$ | 1x = 1.0¢/$ (but $120 Uber Cash) | Depends |
| **Base earn** | 1x = 1.25¢/$ | 1x = 1.0¢/$ | CSR |
| **Total benefits** | $2,060 | $424 | CSR |
| **Dining benefits** | $300 Exclusive Tables | $120 dining + $100 Resy | CSR |
| **Travel benefits** | $300 travel + $750 hotel | — | CSR |
| **Events** | $300 StubHub | — | CSR |
| **Food delivery** | $300 DoorDash | — (Uber Cash partially) | CSR |
| **Rideshare benefits** | $120 Lyft | $120 Uber Cash | Tie |
| **Coffee** | — | $84 Dunkin | Gold |
| **Streaming benefits** | ~$250 Apple Music/TV+ | — | CSR |
| **Fitness** | $120 Peloton | — | CSR |
| **Airport lounge** | Priority Pass + Sapphire Lounge | Centurion (Platinum only) | CSR |
| **Hotel status** | IHG Platinum Elite | — | CSR |
| **Auto rental CDW** | Primary | Secondary | CSR |
| **Global Entry/TSA** | $30/yr amortized | — | CSR |
| **Transfer partners** | Hyatt, United, Southwest, IHG | Delta, Hilton, ANA, Singapore | Different ecosystems |
| **Best for** | Heavy travelers, premium perks | Heavy diners, grocery shoppers | — |
| **Break-even spending** | ~$8,000/yr to beat CSP | ~$3,500/yr to beat no card | — |

### 8.2 CSR vs CSP

| Feature | CSR ($795/yr) | CSP ($95/yr) | Winner |
|---|---|---|---|
| **Dining earn** | 3x = 3.75¢/$ | 3x = 3.75¢/$ | Tie |
| **Grocery earn** | 1x = 1.25¢/$ | 1x = 1.25¢/$ | Tie |
| **Online grocery earn** | 1x = 1.25¢/$ | 3x = 3.75¢/$ | CSP |
| **Streaming earn** | 1x = 1.25¢/$ | 3x = 3.75¢/$ | CSP |
| **Travel earn (direct)** | 4x = 5.0¢/$ | 2x = 2.5¢/$ | CSR |
| **Travel earn (portal)** | 8x = 10.0¢/$ | 5x = 6.25¢/$ | CSR |
| **Rideshare earn** | 5x Lyft = 6.25¢/$ | 5x Lyft = 6.25¢/$ | Tie |
| **Base earn** | 1x = 1.25¢/$ | 1x = 1.25¢/$ | Tie |
| **Points bonus** | — | 10% anniversary bonus | CSP |
| **Total benefits** | $2,060 | $290 | CSR |
| **DoorDash** | $300 ($5 restaurant + 2×$10 non-restaurant/mo) | $120 ($10/mo non-restaurant) | CSR |
| **DashPass** | ✅ | ✅ | Tie |
| **Travel credit** | $300 | $50 hotel | CSR |
| **Hotel benefits** | $750 (Edit + Select) | — | CSR |
| **Events** | $300 StubHub | — | CSR |
| **Streaming benefits** | ~$250 Apple | — | CSR |
| **Rideshare benefits** | $120 Lyft | — | CSR |
| **Fitness benefits** | $120 Peloton | — | CSR |
| **Airport lounge** | Priority Pass + Sapphire | — | CSR |
| **Hotel status** | IHG Platinum | — | CSR |
| **Auto rental CDW** | Primary | Primary | Tie |
| **Global Entry/TSA** | $30/yr | — | CSR |
| **Best for** | High spenders, travelers who use benefits | Budget-conscious, dining/streaming focused | — |
| **Fee difference** | $700/yr more | — | — |
| **Benefits needed to justify upgrade** | Must capture >$700 in CSR-exclusive benefits | — | — |

### 8.3 Gold vs CSP

| Feature | Gold ($325/yr) | CSP ($95/yr) | Winner |
|---|---|---|---|
| **Dining earn** | 4x (1.0cpp) = 4.0¢/$ | 3x (1.25cpp) = 3.75¢/$ | Gold |
| **Grocery earn** | 4x (cap $25K) = 4.0¢/$ | 1x = 1.25¢/$ | Gold |
| **Online grocery earn** | 4x = 4.0¢/$ | 3x = 3.75¢/$ | Gold |
| **Streaming earn** | 1x = 1.0¢/$ | 3x = 3.75¢/$ | CSP |
| **Travel earn (direct)** | 3x flights = 3.0¢/$ | 2x = 2.5¢/$ | Gold |
| **Travel earn (portal)** | N/A | 5x = 6.25¢/$ | CSP |
| **Rideshare earn** | 1x = 1.0¢/$ | 5x Lyft = 6.25¢/$ | CSP |
| **Base earn** | 1x = 1.0¢/$ | 1x = 1.25¢/$ | CSP |
| **Points bonus** | — | 10% anniversary | CSP |
| **Total benefits** | $424 | $290 | Gold |
| **Dining benefits** | $120 dining + $100 Resy | — | Gold |
| **Food delivery** | — (Uber Cash partially) | $120 DoorDash | CSP |
| **DashPass** | — | ✅ | CSP |
| **Coffee** | $84 Dunkin | — | Gold |
| **Rideshare benefits** | $120 Uber Cash | — | Gold |
| **Travel credit** | — | $50 hotel | CSP |
| **Airport lounge** | — | — | Tie |
| **Auto rental CDW** | Secondary | Primary | CSP |
| **Transfer partners** | Delta, Hilton, ANA, Singapore | Hyatt, United, Southwest, IHG | Different ecosystems |
| **Best for** | Diners, grocery shoppers, Amex ecosystem | Budget travelers, Chase ecosystem | — |
| **Fee difference** | $230/yr more | — | — |

---

## 9. Display Modes

### 9.1 Data Density by Context

| Context | Cards Shown | Sections | Category Rows |
|---|---|---|---|
| Mobile (default) | 2 (user's + best alt) | Verdict + Total + collapsed Categories | Top 5 categories |
| Mobile (expanded) | 3 | All 4 sections | All categories |
| Desktop | 3 | All 4 sections | All categories |
| Share/export | 3 | Verdict + Total + Category summary | Top 5 categories |

### 9.2 Mobile Layout

On mobile, the 3-card comparison is too wide. Default to showing user's card vs the single best alternative:

```
┌────────────────────────┐
│ YOUR CARD    vs   BEST │
│ CSR               Gold │
│ $1,830           $619  │
│                        │
│ Dining   3x  vs  4x 👑│
│ Grocery  1x  vs  4x 👑│
│ Travel   4x👑 vs  3x  │
│ ...                    │
│                        │
│ [See all 3 cards →]    │
└────────────────────────┘
```

Tapping "See all 3 cards" enters the full expanded view.

### 9.3 Data Freshness

- Simulations recalculated when: new Plaid sync completes, user changes card, or manually refreshes
- Stale threshold: 7 days. Show "Last updated X days ago" if stale
- Category mapper runs on every Plaid sync (new transactions get categorized immediately)
- Cached simulation results served instantly; recalculation happens in background

---

## 10. Empty & Edge States

| State | Display |
|---|---|
| < 1 month of data | "Connect your card for at least a month to see how it compares." Hide Compare tab. |
| 1–3 months of data | Show comparison with banner: "Based on [X] months of spending. Results will be more accurate over time." |
| 3–11 months of data | Show comparison with projected annual values. Label: "Projected annual value based on [X] months." |
| 12+ months of data | Full comparison, no caveats needed. |
| Only 1 supported card in system | "More cards coming soon. We're adding new cards every month." |
| User has 2 cards connected | Show both as "your cards" + 1 alternative |
| All cards tie (within $25) | "Your spending is well-suited to multiple cards. The best choice depends on which perks you value most." |

---

## 11. What We Don't Do

1. **No card recommendations** — We show the math, the user decides. No "you should switch to X" language.
2. **No affiliate links** — Zurp doesn't earn from card applications. This preserves trust.
3. **No speculative benefits** — We don't say "if you changed your spending to more dining, Gold would be better." We compare on *actual* spending only.
4. **No transfer partner optimization** — We show the conservative cpp. We note upside exists. We don't try to model specific transfer sweet spots.
5. **No multi-card strategy** — V1 compares single cards. "Use Card A for dining and Card B for travel" is a Phase 2 feature.

---

## 12. V1 Scope vs Future

### In Scope (V1)
- Headline verdict (win/lose/close)
- Total value stacked bar comparison (3 cards)
- Category breakdown with earn rates and winner badges
- Static benefit/perk comparison matrix (CSR vs CSP vs Gold)
- Card selection algorithm (user's card + 2 best)
- Mobile 2-card default with expand option
- Empty/edge states
- Data freshness and caching

### Deferred (Phase 2+)
- User-selectable card comparison (pick any cards)
- Multi-card strategy ("use Card A for dining, Card B for travel")
- Historical comparison trend (how has relative value changed over time)
- "What if" simulator (adjust spending categories, see impact)
- Share comparison as image/link
- Sign-up bonus modeling overlay
- More than 3 cards in comparison
- Side-by-side perk detail modals
