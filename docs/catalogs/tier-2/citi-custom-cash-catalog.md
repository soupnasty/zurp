# Citi Custom Cash Catalog

*Last verified: 2026-08-13*

## Card Overview

| Attribute | Value |
|-----------|-------|
| Card Name | Citi Custom Cash |
| Network | Mastercard |
| Annual Fee | $0 |
| Card Type | `citi_custom_cash` |
| Issue Date | Discontinued for new applications May 28, 2026 |
| Status | DISCONTINUED for new applications (May 28, 2026) — existing cardholders keep the card and its earn structure |

> **Note:** Citi closed the Custom Cash to new applications on May 28, 2026. Existing cardholders retain the card, its 5% auto-select category, and ThankYou Points pooling. Everything below still applies to existing cardholders; new-applicant items (welcome bonus, intro APR) are no longer obtainable.

## Benefit Catalog

### Cash Back Rewards - Auto-Selecting Top Category

```benefit_key
benefit_id: citi_custom_cash_auto_category
benefit_name: 5% Cash Back on Top Spending Category
earn_rate: 5%
billing_cycle_cap: $500
billing_cycle_max_earning: $25
category: auto_selected_highest
selection_method: automatic
terms: "5% cash back on your top eligible spending category each billing cycle, up to $500 per cycle. Category automatically selected based on your highest spending"
auto_selection: true
```

### Eligible Auto-Select Categories

```benefit_key
benefit_id: citi_custom_cash_restaurants
benefit_name: Restaurants (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: restaurants
selection_frequency: per_billing_cycle
terms: "If restaurants is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible restaurant purchases"
```

```benefit_key
benefit_id: citi_custom_cash_gas
benefit_name: Gas Stations (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: gas_stations
selection_frequency: per_billing_cycle
terms: "If gas stations is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible gas station purchases"
```

```benefit_key
benefit_id: citi_custom_cash_groceries
benefit_name: Groceries (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: groceries
selection_frequency: per_billing_cycle
terms: "If groceries is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible grocery purchases"
```

```benefit_key
benefit_id: citi_custom_cash_travel
benefit_name: Travel (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: travel
selection_frequency: per_billing_cycle
terms: "If travel is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible travel purchases (airfare, hotels, car rentals)"
```

```benefit_key
benefit_id: citi_custom_cash_transit
benefit_name: Transit (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: transit
selection_frequency: per_billing_cycle
terms: "If transit is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible transit purchases (buses, trains, subways, taxis)"
```

```benefit_key
benefit_id: citi_custom_cash_streaming
benefit_name: Streaming Services (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: streaming_services
selection_frequency: per_billing_cycle
terms: "If streaming is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible streaming service purchases"
```

```benefit_key
benefit_id: citi_custom_cash_drugstores
benefit_name: Drugstores (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: drugstores
selection_frequency: per_billing_cycle
terms: "If drugstores is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible drugstore purchases"
```

```benefit_key
benefit_id: citi_custom_cash_home_improvement
benefit_name: Home Improvement (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: home_improvement
selection_frequency: per_billing_cycle
terms: "If home improvement is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible home improvement store purchases"
```

```benefit_key
benefit_id: citi_custom_cash_fitness
benefit_name: Fitness (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: fitness
selection_frequency: per_billing_cycle
terms: "If fitness is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible fitness club and gym purchases"
```

```benefit_key
benefit_id: citi_custom_cash_entertainment
benefit_name: Entertainment (Auto-Select Category)
earn_rate: 5%
billing_cycle_cap: $500
category: entertainment
selection_frequency: per_billing_cycle
terms: "If entertainment is your highest spending category in the billing cycle, earn 5% on up to $500 in eligible entertainment purchases (movies, theater, etc.)"
```

### Cash Back - All Other Purchases

```benefit_key
benefit_id: citi_custom_cash_other
benefit_name: All Other Purchases Cash Back
earn_rate: 1%
annual_cap: null
cap_type: unlimited
category: all_other
terms: "1% cash back on all other eligible purchases not in the automatically selected top category or after category limit is reached"
```

### Welcome Offer (DISCONTINUED — card closed to new applications May 28, 2026)

```benefit_key
benefit_id: citi_custom_cash_welcome
benefit_name: Welcome Bonus
bonus_amount: $200
minimum_spend: $1,500
time_window_days: 180
status: discontinued_2026-05-28
terms: "$200 cash back after you spend $1,500 in purchases in the first 6 months of account opening. No longer obtainable — card discontinued for new applications May 28, 2026"
```

### Introductory Offer (DISCONTINUED — card closed to new applications May 28, 2026)

```benefit_key
benefit_id: citi_custom_cash_intro_apr
benefit_name: 0% Intro APR
intro_rate: 0%
duration_months: 15
applies_to: purchases_and_balance_transfers
status: discontinued_2026-05-28
terms: "0% intro APR for 15 months on purchases and balance transfers from account opening. No longer obtainable — card discontinued for new applications May 28, 2026"
```

### ThankYou Points Program

```benefit_key
benefit_id: citi_custom_cash_thanksmall_points
benefit_name: ThankYou Points Redemption
reward_type: cash_back_equivalent
redemption: "Cash back redeemable as ThankYou Points"
transfer_partners: "Available when combined with Citi Strata Premier or Elite cards"
flexibility: "Convert points to travel, merchandise, or other redemption options"
terms: "Cash back earned can be viewed as ThankYou Points. Point transfer options available with Citi Strata Premier/Elite"
```

## Points Multipliers

| Category | Multiplier | Billing Cycle Cap | Per-Cycle Max Earn | Annual Max Earn* | Notes |
|----------|-----------|------------------|-------------------|-----------------|-------|
| Top Auto-Selected Category | 5x | $500 spending | $25 | $300 | Automatically selected based on spending; changes each cycle |
| Restaurants | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Gas Stations | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Groceries | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Travel | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Transit | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Streaming | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Drugstores | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Home Improvement | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Fitness | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| Entertainment | 5x | $500 | $25 | $300 | Auto-selected if highest spending |
| All Other Purchases | 1x | Unlimited | Variable | Variable | Uncapped earning rate |

*Annual max represents maximum per-category; total can vary based on actual billing cycle distributions

## Insurance and Protections

### Extended Warranty

```benefit_key
benefit_id: citi_custom_cash_extended_warranty
benefit_name: Extended Warranty Coverage
coverage_duration: 24
duration_unit: months
coverage_limit: $10,000
limit_per_item: $10,000
extension_type: "Extends manufacturer warranty up to 24 additional months"
terms: "Provides extended warranty protection up to 24 months on eligible items purchased with the card, covering defects in materials and workmanship"
status: included
```

### Not Included

```benefit_key
benefit_id: citi_custom_cash_no_purchase_protection
benefit_name: No Purchase Protection
status: not_included
terms: "Purchase protection (theft/damage) not included with this card"
```

```benefit_key
benefit_id: citi_custom_cash_no_cdw
benefit_name: No Car Rental Damage Waiver
status: not_included
terms: "Car rental damage waiver not included with this card"
```

```benefit_key
benefit_id: citi_custom_cash_no_trip_insurance
benefit_name: No Trip Insurance
status: not_included
coverage_types: [
  "Trip Cancellation Insurance",
  "Trip Interruption Insurance",
  "Trip Delay Reimbursement",
  "Lost Baggage Reimbursement",
  "Emergency Medical and Dental"
]
terms: "No trip-related insurance protections included with this card"
```

## Competitor Map

| Competitor Card | Network | Fee | Top Categories | Key Difference |
|-----------------|---------|-----|-----------------|-----------------|
| Chase Freedom Flex | Visa | $0 | 5% rotating, 1% other | Predefined rotating categories; requires quarterly activation |
| Chase Freedom Unlimited | Visa | $0 | 1.5% all purchases | Flat 1.5% on everything; no category optimization |
| American Express Blue Cash Everyday | Amex | $0 | 3% supermarkets/gas/online, 1% other | Fixed 3% categories; caps on earning |
| Discover it Cash Back | Discover | $0 | 5% rotating quarterly, 1% other | Quarterly rotation; Cashback Match in year 1 |
| Capital One SavorOne | Mastercard | $0 | 3% dining/entertainment, 1% other | Fixed 3% on dining/entertainment only |
| Amazon Prime Visa | Visa | $0 | 5% Amazon, 2% Whole Foods, 1% other | Higher earn at Amazon; requires Prime membership |

## Tracking Rules

### Auto-Category Selection and Earning Rules

| Rule | Details |
|------|---------|
| Selection Timing | System automatically selects top spending category at end of each billing cycle |
| Selection Basis | Highest dollar amount spent among the 10 eligible categories during the cycle |
| Billing Cycle | Follows standard monthly billing cycle (typically Statement Date to Statement Date) |
| Per-Cycle Cap | $500 spending cap applies per billing cycle on 5% category |
| Cap Reset | Resets on first day of each new billing cycle |
| Excess Earning Rate | Spending beyond $500 cap in selected category earns 1% |
| Multiple Cards Strategy | Can hold multiple Citi Custom Cash cards through product conversion to maximize multiple 5% categories per cycle |
| Tie-Breaking | If two categories have equal spending, Citi's system determines which receives 5% (typically priority order listed) |

### Spending Category Matching

| Rule | Details |
|------|---------|
| Merchant Codes | Earnings determined by Citi merchant category codes (MCC) |
| Category Flexibility | Wide range of merchant types within each category |
| Disputed Transactions | Disputed purchases may impact category calculation if removed mid-cycle |
| Manual Categorization | Limited user control; system relies on merchant classification |
| Edge Cases | Some merchants may not code as expected (e.g., grocery store also selling gas) |

### Welcome Bonus and Intro APR Rules

| Rule | Details |
|------|---------|
| Welcome Spend Requirement | Must charge $1,500 in purchases within first 6 months |
| Bonus Timing | $200 bonus credited after requirement is met within same cycle |
| Balance Transfers | May count toward welcome spend requirement (verify with issuer) |
| Intro APR Period | 0% APR applies to both purchases and balance transfers for 15 months |
| APR Reset | After intro period, standard APR applies |
| Balance Transfer Fees | Typically 0% for balance transfers during intro period |

### ThankYou Points Program Integration

| Rule | Details |
|------|---------|
| Cash Back Type | Earnings can be viewed as ThankYou Points |
| Transfer Partners | Transfer partners available when you hold Citi Strata Premier or Elite card |
| Redemption Flexibility | Points can be redeemed as cash back, travel, merchandise, or transferred |
| Pooling | Multiple Citi cards can contribute to same ThankYou Points account |
| No Conversion Fee | Converting to travel or other options has no direct fee |

### Foreign Transaction Fees

| Rule | Details |
|------|---------|
| FTF Rate | 3% on all international purchases |
| Scope | Applies to all non-USD transactions |
| Impact | Reduces net earning on international spending |
| Alternative | May use no-FTF card for international travel to preserve earnings |

## Valuation

### Earning Value Assessment

**Best Case Scenario** (maximized single category per cycle):
- 5% Category: $500 × 5% × 12 cycles = $300
- Other Purchases: $12,000 × 1% = $120
- Welcome Bonus (Year 1): $200
- **Total Year 1 Value: $620**
- **Total Year 2+ Value: $420**

**Realistic Scenario** (average spending distribution):
- 5% Category: $450 × 5% × 12 cycles = $270
- Other Purchases: $10,000 × 1% = $100
- Welcome Bonus (Year 1): $200
- **Total Year 1 Value: $570**
- **Total Year 2+ Value: $370**

**Multiple Card Strategy** (holding 2 Citi Custom Cash cards):
- Card 1: Top Category $500 × 5% = $25/cycle
- Card 2: Second Category $500 × 5% = $25/cycle
- Combined: $50/cycle × 12 = $600 from 5% categories
- Other Purchases: $8,000 × 1% = $80
- Welcome Bonuses (Year 1, both cards): $400
- **Total Year 1 Value: $1,080**
- **Total Year 2+ Value: $680**

### Fee Impact

- Annual Fee: $0
- Foreign Transaction Fee: 3% (reduces net earning on international)
- Net Impact: **No annual fee; 3% FTF moderately reduces value on international purchases**

### Insurance and Protection Impact

**Included Protection:**
- Extended Warranty: 24 months, $10K/item (moderate value)
- **Total Protection Value: ~$100-150/year** (depending on purchase patterns)

**Not Included:**
- Purchase Protection ($0)
- Car Rental Coverage ($0)
- Trip Insurance ($0)

### Competitive Positioning

**Strengths:**
- No annual fee with intelligent auto-selecting 5% category
- Automatic category selection (no manual activation required)
- Very flexible category list (10 different options)
- 0% intro APR on purchases and balance transfers
- Extended warranty included (24 months)
- Multiple card strategy allows up to 2 cards for $10 per cycle max
- ThankYou Points integration for future flexibility

**Weaknesses:**
- Capped at $25/cycle per category ($300/year max on 5% categories)
- Single active 5% category per cycle (not cumulative like Chase Freedom)
- 3% FTF penalizes international use
- No purchase protection or car rental coverage
- Lower earning ceiling compared to rotating cards with higher caps
- Requires understanding of auto-selection logic

### Target User Profile

- Domestic U.S. spenders with clear category preferences
- Users wanting intelligent category optimization without activation
- Those comfortable with $500/cycle per-category cap
- Cardholders seeking extended warranty protection
- Annual spend: $15,000-$25,000
- Limited international travel (due to 3% FTF)
- Preference for automatic benefits (no quarterly activation)
- Those interested in ThankYou Points ecosystem

### Multiple Card Strategy Target

- Power users willing to hold 2 Citi Custom Cash cards
- Those who want to optimize multiple high-spend categories simultaneously
- Spenders with 2 clear top categories (e.g., $500+ in restaurants AND gas each cycle)
- Seeking maximum flexibility while maintaining simplicity

### Rating: 7.5/10

**Justification:** Excellent no-fee option with smart auto-selecting 5% category and strong extended warranty. Auto-selection eliminates activation complexity versus Discover/Chase rotating cards. However, $25/cycle cap limits upside, and 3% FTF and missing purchase protections prevent higher rating. Best value for organized spenders with clear category preferences. Rating improves to 8.5/10 with multiple card strategy.
