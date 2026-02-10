# Zurp — Points Earn Model Spec

**Version**: 1.0
**Date**: February 2026
**Status**: Draft
**Dependencies**: zurp-insights-engine-v2.md, zurp-card-decoupling.md, card catalogs (CSR, CSP, Gold)

---

## 1. Purpose

The Points Earn Model calculates how many points a user's actual spending would earn on any supported card, converts those points to dollar values, and enables cross-card comparison. This powers the Compare page and provides the foundation for future points-based insights.

**Core question answered**: "Given your last 12 months of spending, here's what each card would earn you — and what that's worth in dollars."

---

## 2. Design Principles

1. **Accuracy over optimism** — When category mapping is ambiguous, fall back to base earn rate. Never overstate projected earnings.
2. **Conservative valuations** — Use floor cpp values (CSR/CSP: 1.25cpp, Gold: 1.0cpp). Show upside potential separately.
3. **Transparency** — Every points calculation should be traceable: transaction → category → earn rate → points → dollar value. Users should be able to see *why* a card earns more on their spending.
4. **Card-agnostic engine** — The simulation engine accepts any card's earn config as input. Adding a new card = adding a config file.
5. **Same data source** — All calculations use the same Plaid transaction data already powering the insights engine. No new data collection.

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                  Plaid Transactions                    │
│    (merchant_name, category, amount, date)            │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│             Category Mapper                           │
│  Plaid category/merchant → Zurp spending category     │
│  (dining, groceries, travel, streaming, rideshare…)   │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          Points Earn Calculator                       │
│  For each card config:                                │
│    spending category → earn rate (with caps/tiers)    │
│    amount × earn rate = points earned                 │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          Valuation Layer                              │
│  points × cpp rate = dollar value                     │
│  (conservative + upside)                              │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│          Compare Output                               │
│  Side-by-side: Card A vs B vs C                       │
│  By category breakdown + totals                       │
└──────────────────────────────────────────────────────┘
```

---

## 4. Zurp Spending Categories

The category mapper normalizes Plaid's raw merchant/category data into Zurp's internal spending categories. These categories are designed to align with how cards define their bonus categories.

### 4.1 Category Taxonomy

| Zurp Category | Description | Examples |
|---|---|---|
| `dining` | Restaurants, bars, cafes, food trucks | Chipotle, local restaurants, bars |
| `grocery` | Supermarkets, grocery stores | Whole Foods, Trader Joe's, Kroger |
| `grocery_online` | Online grocery delivery/pickup | Instacart, Amazon Fresh, Walmart Grocery |
| `food_delivery` | Food delivery platforms | DoorDash, Uber Eats, Grubhub, Postmates |
| `coffee` | Coffee shops/chains | Starbucks, Dunkin', local coffee shops |
| `streaming` | Video/music/news streaming services | Netflix, Spotify, Hulu, NYT, Disney+ |
| `rideshare` | Ride-hailing services | Uber, Lyft |
| `travel_flights` | Airline tickets | United, Delta, AA, Southwest, JetBlue |
| `travel_hotels` | Hotel bookings (direct) | Marriott, Hilton, IHG, Hyatt direct |
| `travel_portal` | OTA/portal bookings (when detectable) | Chase Travel, Amex Travel, Expedia |
| `travel_other` | Car rentals, cruises, trains, tolls, parking | Hertz, Amtrak, parking meters |
| `transit` | Public transit, taxis | Metro, subway, taxi |
| `gas` | Gas stations | Shell, BP, Exxon |
| `fitness` | Gyms, fitness apps, equipment | Peloton, Equinox, ClassPass |
| `events` | Tickets for concerts, sports, theater | Ticketmaster, StubHub, AXS, SeatGeek |
| `shopping_online` | General online retail | Amazon, Target.com, Walmart.com |
| `shopping_instore` | General in-store retail | Target, Walmart, Best Buy |
| `bills_utilities` | Utilities, phone, internet | Verizon, electric company, Comcast |
| `insurance` | Insurance premiums | Auto, home, health insurance |
| `other` | Everything else | Catch-all at base rate |

### 4.2 Mapping Strategy

The mapper uses a **three-tier resolution** approach:

**Tier 1: Merchant name match (highest confidence)**
A static lookup table of known merchants → Zurp category. This handles the ~200 merchants that cover the majority of consumer spending and where Plaid's category may be ambiguous.

```
Examples:
  "DOORDASH"           → food_delivery
  "UBER EATS"          → food_delivery
  "UBER"               → rideshare      (NOT food_delivery)
  "UBER* TRIP"         → rideshare
  "UBER* EATS"         → food_delivery
  "INSTACART"          → grocery_online
  "NETFLIX"            → streaming
  "PELOTON"            → fitness
  "STARBUCKS"          → coffee
  "DUNKIN"             → coffee
  "TICKETMASTER"       → events
  "STUBHUB"            → events
  "CHASE TRAVEL"       → travel_portal
  "AMEX TRAVEL"        → travel_portal
```

**Tier 2: Plaid category mapping (medium confidence)**
Map Plaid's `personal_finance_category.detailed` to Zurp categories.

```
Examples:
  "FOOD_AND_DRINK_RESTAURANTS"      → dining
  "FOOD_AND_DRINK_GROCERIES"        → grocery
  "FOOD_AND_DRINK_COFFEE"           → coffee
  "TRANSPORTATION_AIRLINES"         → travel_flights
  "TRANSPORTATION_RIDE_SHARE"       → rideshare
  "ENTERTAINMENT_MUSIC"             → streaming
  "ENTERTAINMENT_SPORTING_EVENTS"   → events
  "SHOPS_SUPERMARKETS_GROCERIES"    → grocery
```

**Tier 3: Fallback → `other` (base rate)**
Any transaction that doesn't match Tier 1 or Tier 2 gets `other` and earns the card's base rate. This is the safe default — we never want to award bonus points on an incorrect category.

### 4.3 Ambiguity Handling

Some merchants span multiple categories. Rules:

| Ambiguity | Resolution | Rationale |
|---|---|---|
| Uber (ride vs food) | Parse merchant descriptor suffix (`TRIP` vs `EATS`) | Plaid usually includes this |
| Amazon (grocery vs retail) | If Plaid category = grocery → `grocery_online`, else `shopping_online` | Amazon Fresh codes differently |
| Walmart (grocery vs retail) | If Plaid category = grocery → `grocery`, else `shopping_instore` | In-store Walmart is tricky; lean on Plaid |
| Hotel via OTA vs direct | Default to `travel_hotels` (direct) | Can't reliably distinguish — conservative approach, same as A2 deferral rationale |
| Coffee shop food purchase | `coffee` (not `dining`) | Follows card issuer treatment — most cards count Starbucks as dining anyway, but we map to the more specific category since some cards (Gold) have coffee-specific benefits |

### 4.4 Confidence Scoring

Each category assignment gets a confidence level:

| Level | Source | Usage |
|---|---|---|
| `high` | Tier 1 merchant match | Use freely in comparisons |
| `medium` | Tier 2 Plaid category match | Use in comparisons, note may vary |
| `low` | Tier 3 fallback | Count at base rate, don't highlight in breakdowns |

In the Compare UI, only `high` and `medium` confidence transactions contribute to the category-level breakdowns. `low` confidence transactions are grouped into "Other spending" at base rate.

---

## 5. Card Earn Rate Configs

Each card's earn structure is defined as a config object following the decoupling architecture. The engine reads these configs — no card-specific logic in the calculator.

### 5.1 Config Schema

```json
{
  "card_id": "csr",
  "card_name": "Chase Sapphire Reserve",
  "points_currency": "chase_ur",
  "base_rate": 1,
  "bonus_categories": [
    {
      "zurp_category": ["dining"],
      "earn_rate": 3,
      "label": "Dining",
      "conditions": null
    },
    {
      "zurp_category": ["travel_flights", "travel_hotels", "travel_other", "transit"],
      "earn_rate": 4,
      "label": "Direct travel",
      "conditions": null
    },
    {
      "zurp_category": ["travel_portal"],
      "earn_rate": 8,
      "label": "Chase Travel portal",
      "conditions": null
    },
    {
      "zurp_category": ["rideshare"],
      "earn_rate": 5,
      "label": "Lyft",
      "conditions": { "merchant_match": ["LYFT"] }
    },
    {
      "zurp_category": ["rideshare"],
      "earn_rate": 1,
      "label": "Other rideshare",
      "conditions": { "merchant_exclude": ["LYFT"] }
    },
    {
      "zurp_category": ["fitness"],
      "earn_rate": 10,
      "label": "Peloton equipment",
      "conditions": { "merchant_match": ["PELOTON"], "amount_gte": 200 }
    },
    {
      "zurp_category": ["fitness"],
      "earn_rate": 1,
      "label": "Peloton subscription/accessories",
      "conditions": { "merchant_match": ["PELOTON"], "amount_lt": 200 }
    }
  ],
  "caps": [],
  "high_spend_tiers": [
    {
      "threshold": 75000,
      "period": "anniversary_year",
      "benefits": ["$250 Shops at Chase credit", "$500 Southwest credit + A-List status", "IHG Diamond status"],
      "note": "Display as potential upside, don't factor into base comparison"
    }
  ],
  "annual_fee": 795,
  "valuation": {
    "conservative_cpp": 1.25,
    "upside_cpp": 2.0,
    "upside_label": "With Points Boost transfer partners"
  }
}
```

### 5.2 CSR Earn Config

| Zurp Category | Earn Rate | Conditions | Notes |
|---|---|---|---|
| `dining`, `coffee`, `food_delivery` | 3x | — | Chase codes coffee shops and delivery as dining |
| `travel_flights`, `travel_hotels`, `travel_other`, `transit` | 4x | — | Direct bookings |
| `travel_portal` | 8x | — | Rarely detectable via Plaid; noted as upside |
| `rideshare` | 5x | Lyft only | Uber earns 1x |
| `fitness` | 10x | Peloton, amount ≥ $200 | Equipment purchases (Bike, Tread, Row, Guide) |
| `fitness` | 1x | Peloton, amount < $200 | Subscription / accessories → base rate |
| Everything else | 1x | — | Base rate |

**Caps**: None on earn rates.
**High-spend**: $75K threshold unlocks bonus benefits (display only, not in points calc).

### 5.3 CSP Earn Config

| Zurp Category | Earn Rate | Conditions | Notes |
|---|---|---|---|
| `dining`, `coffee`, `food_delivery` | 3x | — | Same dining treatment as CSR |
| `streaming` | 3x | — | CSP-specific bonus |
| `grocery_online` | 3x | — | "Select online grocery" — CSP-specific |
| `travel_flights`, `travel_hotels`, `travel_other`, `transit` | 2x | — | Lower than CSR |
| `travel_portal` | 5x | — | Chase Travel portal |
| `rideshare` | 5x | Lyft only | Same as CSR |
| `fitness` | 5x | Peloton, amount ≥ $200 | Equipment purchases |
| `fitness` | 1x | Peloton, amount < $200 | Subscription / accessories → base rate |
| Everything else | 1x | — | Base rate |

**Caps**: None.
**Bonus**: 10% anniversary points bonus on all points earned that year. Applied as a multiplier on the annual total.

### 5.4 Amex Gold Earn Config

| Zurp Category | Earn Rate | Conditions | Notes |
|---|---|---|---|
| `dining`, `coffee`, `food_delivery` | 4x | — | Best dining rate of the three |
| `grocery`, `grocery_online` | 4x | Cap: $25,000/yr | US supermarkets; after cap → 1x |
| `travel_flights` | 3x | amextravel.com or direct | |
| Everything else | 1x | — | Base rate |

**Caps**:
- Grocery 4x capped at $25,000/calendar year in spend. After cap, grocery earns 1x.
- Cap tracking: sum grocery + grocery_online spend per calendar year, switch to 1x when $25,000 reached.

**No high-spend tiers** in v1 scope.

### 5.5 Peloton Earn Rate Decision

The 10x Peloton (CSR) and 5x Peloton (CSP) rates apply to *equipment purchases only*, not the monthly subscription.

**Decision**: Use an **amount-based threshold** to distinguish equipment from subscription. Peloton subscriptions run ~$13–44/mo. Equipment starts at $1,000+.

```
If Peloton transaction amount >= $200 → equipment → 10x (CSR) / 5x (CSP)
If Peloton transaction amount < $200  → subscription → base rate (1x)
```

The $200 threshold provides a wide buffer between the highest subscription tier (~$44) and the cheapest equipment. Accessories (shoes, weights) in the $50–150 range would fall under base rate, which is correct — the 10x/5x applies to Bike, Tread, Row, and Guide hardware only.

### 5.6 Chase Travel Portal Earn Rate Decision

CSR earns 8x and CSP earns 5x on Chase Travel portal bookings. Plaid *sometimes* shows "CHASE TRAVEL" as the merchant, but often shows the underlying hotel/airline.

**Decision**: Default all travel to direct booking rates (4x CSR / 2x CSP). If merchant descriptor matches "CHASE TRAVEL", apply portal rate. Display a note: "If you book through Chase Travel, your travel earnings could be X% higher."

---

## 6. Points Calculation Engine

### 6.1 Per-Transaction Calculation

```
For each transaction:
  1. Map to zurp_category (§4 mapper)
  2. For each card being simulated:
     a. Find matching bonus_category entry (check conditions)
     b. If match found AND within any applicable cap → use bonus earn_rate
     c. If match found AND cap exceeded → use base_rate for overage
     d. If no match → use base_rate
     e. points = transaction_amount × earn_rate
  3. Store: { transaction_id, zurp_category, confidence, card_id, earn_rate, points }
```

### 6.2 Cap Tracking

Caps are tracked per card, per cap period. The engine processes transactions chronologically within each period to correctly apply the cap.

```
Cap state per (card_id, cap_id, period):
  {
    "cap_id": "gold_grocery_25k",
    "period_type": "calendar_year",
    "period_start": "2025-01-01",
    "period_end": "2025-12-31",
    "cap_amount": 25000,
    "spend_to_date": 18750,
    "remaining": 6250
  }

For each grocery transaction on Gold:
  if spend_to_date + amount <= cap_amount:
    earn at 4x on full amount
    spend_to_date += amount
  else if spend_to_date < cap_amount:
    bonus_portion = cap_amount - spend_to_date
    base_portion = amount - bonus_portion
    points = (bonus_portion × 4) + (base_portion × 1)
    spend_to_date = cap_amount
  else:
    earn at 1x (cap already hit)
```

### 6.3 CSP Anniversary Bonus

CSP awards a 10% bonus on all Ultimate Rewards points earned during the cardmember year.

```
After calculating all per-transaction points for CSP:
  annual_points = sum of all points in anniversary year
  bonus_points = annual_points × 0.10
  total_points = annual_points + bonus_points
```

For cross-card simulation (user doesn't have CSP), assume anniversary year aligns with the analysis period. Note this assumption in the output.

### 6.4 Aggregation

```
Per card simulation output:
{
  "card_id": "csr",
  "period": "2025-02-01 to 2026-01-31",
  "total_points": 45200,
  "total_value_conservative": 565.00,    // 45200 × 0.0125
  "total_value_upside": 904.00,          // 45200 × 0.02
  "annual_fee": 795,
  "net_value_conservative": -230.00,     // total_value - annual_fee (points only, no credits)
  "net_value_with_credits": 1035.00,     // add credit value from benefit tracking
  "category_breakdown": [
    {
      "zurp_category": "dining",
      "spend": 8400,
      "earn_rate": 3,
      "points": 25200,
      "value_conservative": 315.00,
      "transaction_count": 156,
      "confidence_distribution": { "high": 140, "medium": 16, "low": 0 }
    },
    {
      "zurp_category": "travel_flights",
      "spend": 3200,
      "earn_rate": 4,
      "points": 12800,
      "value_conservative": 160.00,
      "transaction_count": 6,
      "confidence_distribution": { "high": 6, "medium": 0, "low": 0 }
    }
    // ...
  ],
  "notes": [
    "Travel bookings assumed to be direct (not via Chase Travel portal). Portal bookings earn 8x instead of 4x.",
    "Peloton transactions earn 1x. Equipment purchases earn 10x — actual earnings may be higher."
  ],
  "bonuses_applied": [],
  "high_spend_eligible": false
}
```

---

## 7. Cross-Card Comparison

### 7.1 How It Works

The user connects their actual card. The engine:

1. Pulls their Plaid transactions for the analysis period (default: trailing 12 months, or all available data if < 12 months)
2. Maps every transaction to a Zurp category (done once, shared across all simulations)
3. Runs the Points Earn Calculator once per card being compared
4. Produces a side-by-side output

### 7.2 Comparison Output Structure

```
{
  "analysis_period": "2025-02-01 to 2026-01-31",
  "total_transactions": 1247,
  "total_spend": 62400,
  "cards": [
    { /* CSR simulation output (§6.4) */ },
    { /* CSP simulation output */ },
    { /* Gold simulation output */ }
  ],
  "winner_by_category": {
    "dining": { "card_id": "gold", "margin_points": 8400, "margin_value": 3.00 },
    "grocery": { "card_id": "gold", "margin_points": 12000, "margin_value": 45.00 },
    "travel_flights": { "card_id": "csr", "margin_points": 3200, "margin_value": 40.00 },
    "streaming": { "card_id": "csp", "margin_points": 1200, "margin_value": 15.00 }
  },
  "total_value_comparison": {
    "points_only": {
      "csr": 565.00,
      "csp": 480.00,
      "gold": 520.00
    },
    "points_plus_credits": {
      "csr": 2625.00,
      "csp": 770.00,
      "gold": 944.00
    },
    "net_after_fee": {
      "csr": 1830.00,
      "csp": 675.00,
      "gold": 619.00
    }
  }
}
```

### 7.3 What Gets Compared

| Component | Included | Source |
|---|---|---|
| Points earned (by category) | ✅ | This spec — earn model |
| Points dollar value | ✅ | This spec — valuation layer |
| Hard credit value | ✅ | Existing benefit catalogs |
| Annual fee | ✅ | Card configs |
| Net value (points + credits - fee) | ✅ | Derived |
| Transfer partner value | ⚠️ Display only | Too variable to simulate |
| High-spend tier benefits | ⚠️ Display only | Conditional, not guaranteed |
| Perks (lounge, insurance, status) | ❌ v2 | No dollar value assignable |

### 7.4 Credit Integration

The points comparison alone isn't the full picture. The Compare page should show:

```
Total Card Value = Points Value + Credits Captured + Credits Available − Annual Fee
```

Where:
- **Points Value**: From this spec's earn model
- **Credits Captured**: From the existing benefit tracking engine (what they've already used)
- **Credits Available**: Total hard credits the card offers (from catalog)
- **Annual Fee**: From card config

For cards the user *doesn't have*, Credits Available = full catalog value (they'd capture all of it in theory, but Zurp can note the average capture rate).

---

## 8. Database Schema Additions

### 8.1 Spending Category Assignments

```sql
CREATE TABLE transaction_categories (
  id                UUID PRIMARY KEY,
  transaction_id    TEXT NOT NULL,        -- Plaid transaction ID
  user_id           UUID NOT NULL,
  zurp_category     TEXT NOT NULL,        -- from §4.1 taxonomy
  confidence        TEXT NOT NULL,        -- 'high', 'medium', 'low'
  match_source      TEXT NOT NULL,        -- 'merchant_name', 'plaid_category', 'fallback'
  matched_value     TEXT,                 -- what was matched (e.g., "DOORDASH" or "FOOD_AND_DRINK_RESTAURANTS")
  transaction_date  DATE NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_txn_cat_user_date ON transaction_categories(user_id, transaction_date);
CREATE INDEX idx_txn_cat_category ON transaction_categories(zurp_category);
```

### 8.2 Points Simulations

```sql
CREATE TABLE points_simulations (
  id                UUID PRIMARY KEY,
  user_id           UUID NOT NULL,
  card_id           TEXT NOT NULL,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  total_spend       DECIMAL(12,2) NOT NULL,
  total_points      INTEGER NOT NULL,
  value_conservative DECIMAL(10,2) NOT NULL,
  value_upside      DECIMAL(10,2) NOT NULL,
  category_breakdown JSONB NOT NULL,      -- array of per-category results
  notes             JSONB,                -- array of caveats/assumptions
  bonuses_applied   JSONB,                -- e.g., CSP 10% anniversary
  created_at        TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id, period_start, period_end)
);

CREATE INDEX idx_pts_sim_user ON points_simulations(user_id);
```

### 8.3 Cap Tracking

```sql
CREATE TABLE earn_cap_tracking (
  id                UUID PRIMARY KEY,
  user_id           UUID NOT NULL,
  card_id           TEXT NOT NULL,
  cap_id            TEXT NOT NULL,         -- e.g., "gold_grocery_25k"
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  cap_amount        DECIMAL(12,2) NOT NULL,
  spend_to_date     DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining         DECIMAL(12,2) GENERATED ALWAYS AS (cap_amount - spend_to_date) STORED,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id, cap_id, period_start)
);
```

---

## 9. Merchant Lookup Table

The Tier 1 merchant lookup is a manually maintained static table. Initial scope covers ~200 merchants that represent the majority of consumer spending in bonus categories.

### 9.1 Schema

```sql
CREATE TABLE merchant_category_map (
  id                SERIAL PRIMARY KEY,
  merchant_pattern  TEXT NOT NULL,        -- regex or prefix match against Plaid merchant_name
  match_type        TEXT NOT NULL,        -- 'exact', 'prefix', 'contains'
  zurp_category     TEXT NOT NULL,
  priority          INTEGER DEFAULT 0,    -- higher = checked first (for overlapping matches)
  notes             TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

### 9.2 Initial Entries (representative sample)

| Pattern | Match Type | Zurp Category | Priority | Notes |
|---|---|---|---|---|
| `DOORDASH` | prefix | food_delivery | 10 | |
| `UBER* EATS` | prefix | food_delivery | 20 | Must match before UBER |
| `UBER* TRIP` | prefix | rideshare | 20 | Must match before UBER |
| `UBER ` | prefix | rideshare | 10 | Fallback for plain Uber |
| `GRUBHUB` | prefix | food_delivery | 10 | |
| `POSTMATES` | prefix | food_delivery | 10 | |
| `INSTACART` | prefix | grocery_online | 10 | |
| `AMAZON FRESH` | prefix | grocery_online | 20 | Must match before AMAZON |
| `AMAZON PRIME` | contains | streaming | 15 | Prime membership |
| `NETFLIX` | prefix | streaming | 10 | |
| `SPOTIFY` | prefix | streaming | 10 | |
| `HULU` | prefix | streaming | 10 | |
| `DISNEY PLUS` | prefix | streaming | 10 | |
| `MAX ` | prefix | streaming | 5 | Low priority — "MAX" could match other merchants |
| `PARAMOUNT` | prefix | streaming | 10 | |
| `PEACOCK` | prefix | streaming | 10 | |
| `APPLE.COM/BILL` | prefix | streaming | 10 | Apple Music/TV+ |
| `LYFT` | prefix | rideshare | 10 | |
| `STARBUCKS` | prefix | coffee | 10 | |
| `DUNKIN` | prefix | coffee | 10 | |
| `PELOTON` | prefix | fitness | 10 | |
| `EQUINOX` | prefix | fitness | 10 | |
| `CLASSPASS` | prefix | fitness | 10 | |
| `TICKETMASTER` | prefix | events | 10 | |
| `STUBHUB` | prefix | events | 10 | |
| `AXS` | prefix | events | 10 | |
| `SEATGEEK` | prefix | events | 10 | |
| `VIVID SEATS` | prefix | events | 10 | |
| `CHASE TRAVEL` | prefix | travel_portal | 10 | |
| `AMEX TRAVEL` | prefix | travel_portal | 10 | |
| `UNITED AIR` | prefix | travel_flights | 10 | |
| `DELTA AIR` | prefix | travel_flights | 10 | |
| `AMERICAN AIR` | prefix | travel_flights | 10 | |
| `SOUTHWEST AIR` | prefix | travel_flights | 10 | |
| `JETBLUE` | prefix | travel_flights | 10 | |
| `MARRIOTT` | prefix | travel_hotels | 10 | |
| `HILTON` | prefix | travel_hotels | 10 | |
| `HYATT` | prefix | travel_hotels | 10 | |
| `IHG` | prefix | travel_hotels | 10 | |

Full list maintained in `merchant_category_map` table. Target: 200 entries at launch covering top merchants per category.

---

## 10. Points Valuation Model

### 10.1 Base Valuations

| Points Currency | Conservative (cpp) | Upside (cpp) | Upside Context |
|---|---|---|---|
| Chase Ultimate Rewards (CSR) | 1.25 | 2.0 | Transfer to Hyatt, United; Points Boost |
| Chase Ultimate Rewards (CSP) | 1.25 | 2.0 | Same transfer partners as CSR |
| Amex Membership Rewards (Gold) | 1.0 | 1.5–2.0 | Transfer to Delta, Hilton, ANA |

### 10.2 Why Conservative as Default

The conservative value is what a user gets by redeeming through the card issuer's travel portal (Chase Travel at 1.25cpp) or as statement credits. This requires zero expertise. The upside value requires knowledge of transfer partners and sweet spots — it's real but not guaranteed.

**Display approach**: Show conservative value as the primary number. Show upside as a secondary "up to" value with a brief explanation.

### 10.3 Future: Dynamic Valuation

Phase 2 could allow users to set their own cpp preference, or calculate based on their actual redemption history (if we ever get that data). For now, static values per card.

---

## 11. Edge Cases & Assumptions

### 11.1 Documented Assumptions

| Assumption | Impact | Note to User |
|---|---|---|
| All travel booked direct (not portal) | Understates CSR/CSP travel earn | "Book via Chase Travel for Nx instead of Nx" |
| Peloton ≥ $200 = equipment | May include non-equipment large purchases | Rare edge case; $200 threshold is conservative |
| Uber = rideshare (not Eats) when ambiguous | May misclassify some food delivery | Only when Plaid descriptor is unclear |
| CSP anniversary year = analysis period | May over/under-count 10% bonus | "Actual bonus depends on your card anniversary date" |
| All grocery = US supermarket for Gold | May overstate Gold grocery earn | International groceries don't qualify for 4x |
| Hotel OTAs counted as direct hotel | Correctly earns travel rate | OTAs code as travel anyway |

### 11.2 Insufficient Data Handling

| Scenario | Behavior |
|---|---|
| < 3 months of transaction data | Show comparison but warn: "Based on X months of data. Full-year projection may differ." |
| < 1 month of data | Don't show comparison. "Connect for at least a month to see meaningful results." |
| Category with 0 spend | Show 0 for all cards. Don't highlight as a "winner." |
| No transactions in a bonus category | Still show the category in breakdown with $0 — helps user see potential. |

### 11.3 Refunds & Negative Transactions

Plaid flags refunds with negative amounts. Points engine should:
- Subtract refund from category spend
- Subtract points accordingly (same earn rate that was applied to original purchase)
- If refund can't be matched to original, apply at base rate

---

## 12. V1 Scope vs Future

### In Scope (V1)
- Category mapper (3-tier: merchant → Plaid category → fallback)
- Earn rate configs for CSR, CSP, Amex Gold
- Cap tracking (Gold grocery $25K)
- CSP 10% anniversary bonus
- Cross-card simulation with side-by-side output
- Conservative + upside valuations
- Category-level breakdowns
- Integration point for Compare page data
- Merchant lookup table (~200 entries)

### Deferred (Phase 2+)
- Portal vs direct booking detection (same as A2 deferral)
- User-configurable cpp values
- Historical trend (how your points earning has changed month over month)
- Points-based insight categories in the insights engine (e.g., "You'd earn 2x more on dining with Gold")
- Transfer partner specific valuations
- High-spend tier modeling ($75K CSR threshold)
- New card earn configs beyond CSR/CSP/Gold
- Amex 4x grocery cap tracking across card types (Amex counts across all MR cards)
- Sign-up bonus modeling ("Card X is offering 80K points — worth $1,000 on your spending pattern")

---

## 13. Resolved Decisions

1. **Coffee ⊂ Dining for earn purposes** — `coffee` stays as a separate Zurp category (needed for Gold's Dunkin benefit tracking), but inherits the dining earn rate in the points model unless a card has a coffee-specific rate.

2. **Grocery online included in Gold 4x** — `grocery_online` (e.g., Instacart) is included in Gold's 4x grocery category with a note about potential MCC variation.

3. **Food delivery ⊂ Dining for earn purposes** — `food_delivery` is listed alongside `dining` in bonus category configs. It stays separate in the taxonomy for benefit tracking (DoorDash credits are benefit-specific).

4. **Compare page: user's card + 2 best alternatives** — Anchor on the user's connected card, then show the 2 cards that would earn the most on their spending pattern. Not a fixed set.

5. **Annualized projection: yes** — If user has 3–11 months of data, project to 12 months with clear labeling: "Projected annual value based on X months of spending."
