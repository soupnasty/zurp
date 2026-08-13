# Discover it Cash Back Catalog

*Last verified: 2026-08-13*

## Card Overview

| Attribute | Value |
|-----------|-------|
| Card Name | Discover it Cash Back |
| Network | Discover |
| Annual Fee | $0 |
| Card Type | `discover_it_cash_back` |
| Issue Date | Ongoing |
| Status | Active |

## Benefit Catalog

### Cash Back Rewards - Rotating Categories

```benefit_key
benefit_id: discover_it_cb_rotating
benefit_name: Rotating Quarterly Categories Cash Back
earn_rate: 5%
quarterly_cap: $1,500
quarterly_cap_earnings: $75
annual_max_earnings_rotating: $300
category: rotating_quarterly
activation_required: true
terms: "5% cash back on up to $1,500 in combined purchases each quarter in qualifying categories, then 1% thereafter. Categories rotate quarterly and must be activated through app or online"
```

### Q1 2026 Rotating Categories

```benefit_key
benefit_id: discover_it_q1_2026_grocery
benefit_name: Q1 2026 - Grocery Stores
earn_rate: 5%
quarterly_cap: $1,500
category: grocery_stores
activation_required: true
start_date: 2026-01-01
end_date: 2026-03-31
terms: "5% cash back on up to $1,500 in combined purchases at grocery stores, then 1%"
```

```benefit_key
benefit_id: discover_it_q1_2026_wholesale
benefit_name: Q1 2026 - Wholesale Clubs
earn_rate: 5%
quarterly_cap: $1,500
category: wholesale_clubs
activation_required: true
start_date: 2026-01-01
end_date: 2026-03-31
terms: "5% cash back on up to $1,500 in combined purchases at wholesale clubs (includes Costco, Sam's Club, etc.), then 1%"
```

```benefit_key
benefit_id: discover_it_q1_2026_streaming
benefit_name: Q1 2026 - Streaming Services
earn_rate: 5%
quarterly_cap: $1,500
category: streaming_services
activation_required: true
start_date: 2026-01-01
end_date: 2026-03-31
terms: "5% cash back on up to $1,500 in combined purchases at streaming services, then 1%"
```

### Cash Back - All Other Purchases

```benefit_key
benefit_id: discover_it_cb_other
benefit_name: All Other Purchases Cash Back
earn_rate: 1%
annual_cap: null
cap_type: unlimited
category: all_other
terms: "1% cash back on all other eligible purchases not in rotating categories or after category limits are reached"
```

### Welcome Offer

```benefit_key
benefit_id: discover_it_cashback_match
benefit_name: Cashback Match (First Year)
bonus_type: cashback_match
match_percentage: 100%
duration_months: 12
terms: "Discover will automatically double all the cash back you earn in your first year as a cardmember, up to the cash back you can earn. No limit on the match"
start_date: account_opening
end_date: first_anniversary
automatic: true
```

### No Traditional Welcome Bonus

```benefit_key
benefit_id: discover_it_no_welcome_bonus
benefit_name: No Traditional Welcome Bonus
bonus_amount: 0
terms: "No traditional welcome bonus offer. All benefits come through the Cashback Match feature in year 1"
```

## Points Multipliers

| Category | Multiplier | Quarterly Cap | Annual Potential | Notes |
|----------|-----------|---------------|------------------|-------|
| Rotating Categories (Q1 2026) | 5x | $1,500 spending | $300 earnings | Must activate each quarter; includes 3 categories |
| Wholesale Clubs | 5x | $1,500/quarter | $75 per quarter | Costco, Sam's Club, and similar |
| Grocery Stores | 5x | $1,500/quarter | $75 per quarter | Supermarkets, grocery stores |
| Streaming Services | 5x | $1,500/quarter | $75 per quarter | Netflix, Hulu, Disney+, etc. |
| All Other Purchases | 1x | Unlimited | Variable | Uncapped earning rate |
| First Year Match | 2x | N/A | 100% of earnings matched | Automatic doubling in year 1 |

## Insurance and Protections

### Not Included - All Protections Discontinued February 2018

```benefit_key
benefit_id: discover_it_no_protections
benefit_name: Insurance and Protections Status
status: discontinued_feb_2018
coverage_items: [
  "Extended Warranty",
  "Purchase Protection",
  "Return Protection",
  "Car Rental Damage Waiver",
  "Trip Cancellation Insurance",
  "Trip Interruption Insurance",
  "Trip Delay Reimbursement",
  "Lost Baggage Reimbursement",
  "Emergency Medical and Dental"
]
terms: "Discover it Cash Back does not include any insurance or protection benefits. All such protections were discontinued in February 2018"
impact: "Cardholders must rely on personal insurance or issuer-specific protections"
```

### Additional Benefits Limitations

- **No Transfer Partners**: Cannot transfer cash back or earn through transfer partners
- **No Travel Protections**: No trip insurance of any kind
- **No Purchase Protection**: No coverage for theft or damage
- **No Extended Warranty**: No extended warranty coverage beyond manufacturer's warranty
- **No Rental Car Coverage**: No car rental damage waiver

## Competitor Map

| Competitor Card | Network | Fee | Top Categories | Key Difference |
|-----------------|---------|-----|-----------------|-----------------|
| Chase Freedom Unlimited | Visa | $0 | 1.5% all purchases | Flat 1.5% on all; no rotation complexity |
| Chase Freedom Flex | Visa | $0 | 5% rotating, 1% other | 5% rotating categories similar structure |
| American Express Blue Cash Everyday | Amex | $0 | 3% supermarkets/gas/online, 1% other | 3% fixed categories; higher than Discover's 1% base |
| Citi Custom Cash | Mastercard | $0 | 5% top category ($500 cap), 1% other | 5% on single auto-selected category; no activation |
| Capital One SavorOne | Mastercard | $0 | 3% dining/entertainment, 1% other | 3% on dining/entertainment; no rotation |
| Amazon Prime Visa | Visa | $0 | 5% Amazon, 2% Whole Foods, 1% other | Higher earn at Amazon; requires Prime membership |

## Tracking Rules

### Activation and Category Management

| Rule | Details |
|------|---------|
| Quarterly Activation | Must activate rotating categories each quarter to earn 5% (via app or online) |
| Activation Window | Categories active for full calendar quarter (Q1: Jan-Mar, Q2: Apr-Jun, etc.) |
| Non-Activation Default | If category not activated, earn 1% on all purchases in that quarter |
| Quarterly Cap Application | $1,500 quarterly cap applies to all 5% categories combined (total, not per-category) |
| Cap Reset | Quarterly caps reset at start of each new quarter (Jan 1, Apr 1, Jul 1, Oct 1) |
| Excess Earning Rate | Once $1,500 quarterly cap reached, earn 1% on additional purchases in those categories |
| Category Identification | System auto-categorizes merchant purchases to appropriate rotating category |
| Merchant Code Matching | Earnings based on merchant category codes; some merchants may not categorize as expected |

### Cashback Match Rules (Year 1)

| Rule | Details |
|------|---------|
| Automatic Application | Cashback Match applied automatically; no enrollment required |
| Match Period | First 12 months from account opening date |
| Match Coverage | Matches 100% of all cash back earned (rotating 5% and 1% base) |
| No Limit | Cashback Match has no maximum; all earnings are matched up to first anniversary |
| Match Timing | Matched cash back credited within one statement cycle after original earning |
| Year 2 Impact | Cashback Match expires after first year; earn only base rates in year 2+ |

### Foreign Transaction Fees

| Rule | Details |
|------|---------|
| FTF Rate | 0% - No foreign transaction fees |
| Geographic Scope | Applies to all international purchases |
| Benefit Impact | Discover can be used internationally without FTF penalty |

## Valuation

### Earning Value Assessment

**Best Case Scenario Year 1** (maximized rotating category spending with Cashback Match):
- Rotating Categories: $1,500 × 5% = $75 per quarter × 4 = $300 base
- Cashback Match (Year 1): $300 × 100% = $300 matched
- Other Purchases: $10,000 × 1% = $100 base
- Cashback Match on Other: $100 × 100% = $100 matched
- **Total Year 1 Value: $800**

**Best Case Scenario Year 2+** (after Cashback Match expires):
- Rotating Categories: $1,500 × 5% × 4 quarters = $300
- Other Purchases: $10,000 × 1% = $100
- **Total Year 2+ Value: $400**

**Realistic Scenario Year 1** (average activation/spending):
- Rotating Categories: $1,200 × 5% × 4 = $240 base (some quarters not maximized)
- Cashback Match: $240 × 100% = $240 matched
- Other Purchases: $8,000 × 1% = $80 base
- Cashback Match: $80 × 100% = $80 matched
- **Total Year 1 Value: $640**

**Realistic Scenario Year 2+**:
- Rotating Categories: $240 (as above)
- Other Purchases: $80 (as above)
- **Total Year 2+ Value: $320**

### Fee Impact

- Annual Fee: $0
- Foreign Transaction Fee: 0%
- Net Impact: **No annual fee; no FTF makes international use cost-free**

### Insurance and Protection Impact

**Loss of Coverage:**
- No extended warranty ($0 value)
- No purchase protection ($0 value)
- No car rental coverage ($0 value)
- No trip insurance ($0 value)
- **Total Protection Value: $0** (not applicable to this card)

### Competitive Positioning

**Strengths:**
- No annual fee with 5% rotating category options
- Cashback Match doubles earnings in year 1 (unique feature)
- No foreign transaction fees (excellent for travel)
- Simple 1% earn on non-rotating purchases
- Lowest activation barrier (easy quarterly activation)

**Weaknesses:**
- All insurance and protections discontinued (major disadvantage vs. premium cards)
- Quarterly activation required (more complex than flat-rate cards)
- Limited to 5% on first $1,500/quarter across all categories combined
- No transfer partners or point flexibility
- Year 2+ earnings drop significantly after Cashback Match expires

### Target User Profile

- Domestic and international spenders seeking no-fee cash back
- Users with category flexibility (rotating quarterly categories)
- First-year heavy earners maximizing Cashback Match benefit
- Those comfortable with quarterly activation/management
- Annual spend: $15,000-$25,000
- Frequent travelers (0% FTF value)
- Users NOT requiring insurance protections
- Budget-conscious cardholders

### Rating: 7.5/10

**Justification:** Excellent no-fee option with unique Cashback Match feature that provides substantial first-year value. 5% rotating categories and 0% FTF are strong benefits. However, complete lack of any insurance protections and significant drop in value after year 1 prevent higher rating. Best value in first year; consider complementing with protection-inclusive card.
