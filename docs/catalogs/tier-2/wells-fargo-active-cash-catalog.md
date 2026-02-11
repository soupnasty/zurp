# Wells Fargo Active Cash Credit Card Catalog

## Card Overview

| Attribute | Value |
|-----------|-------|
| **Card Name** | Wells Fargo Active Cash Rewards Card |
| **Network** | Visa Signature |
| **Annual Fee** | $0 (No annual fee) |
| **Rewards Currency** | Cash Back |
| **Earn Rate (Standard)** | 2% cash back on all purchases (uncapped) |
| **Welcome Bonus** | $200 cash back after $500 spend within 3 months |
| **Foreign Transaction Fee** | 3% (FTF applies) |
| **Lounge Access** | None |
| **Intro APR Offer** | 0% for 12 months on both purchases and balance transfers |
| **Cell Phone Protection** | $600/claim, $25 deductible, 2 claims/year ($1,200/yr max) |
| **Collision Damage Waiver** | $50,000 limit, secondary coverage, 15 days domestic / 31 days international |
| **Card Type ID** | wf_active_cash |

---

## Benefit Catalog

### benefit_key: flat_cash_back_earning

```yaml
category: flat_cash_back_earning
benefit_name: "2% Cash Back on Everything"
description: "Flat 2% cash back earning on all purchases worldwide"
details:
  - 2% cash back on every dollar spent
  - No categories, no bonus categories, no rotating rates
  - Uncapped annual earning—no limits
  - Applies to all merchants globally (subject to FTF)
  - Automatic earning—no activation required
  - Cash back appears as statement credit or can be withdrawn
  - Direct cash rewards (not points requiring redemption)
  - Simplest earning structure of any card category
```

### benefit_key: welcome_bonus_cash

```yaml
category: welcome_bonus_cash
benefit_name: "$200 Cash Back Welcome Bonus"
description: "Introductory bonus for new cardholders"
details:
  - $200 cash back bonus awarded upon meeting spending requirement
  - Spending threshold: $500 within 3 months of account opening
  - Lowest minimum spending requirement for $200 bonus in market
  - Cash bonus posts as statement credit once requirement met
  - Appears within 1-2 billing cycles after spending threshold met
  - Direct cash value (not points or miles)
  - Equivalent to earning $25,000 at 0.8% rate (or $10,000 at 2%)
```

### benefit_key: cell_phone_protection

```yaml
category: cell_phone_protection
benefit_name: "Cell Phone Protection ($600/claim with $25 deductible)"
description: "Coverage for eligible cell phones purchased or serviced with card"
details:
  - Up to $600 per claim for covered damages
  - Standard deductible: $25 per incident
  - Maximum coverage: 2 claims per 12-month period
  - Annual aggregate maximum: $1,200 per year
  - Covers accidental damage, theft, mechanical failure
  - Applies to phones purchased with card or monthly service charged to card
  - Documentation required:
    * Proof of purchase or service provider letter
    * Police report (for theft claims)
    * Damage photos or evidence
    * Repair estimate or invoice
  - Filing deadline: Typically 90 days from incident
  - One of the better protection benefits available on no-fee card
```

### benefit_key: collision_damage_waiver

```yaml
category: collision_damage_waiver
benefit_name: "Collision Damage Waiver ($50K, secondary coverage)"
description: "Car rental damage protection with tiered coverage periods"
details:
  - Secondary coverage on rental car damage
  - Coverage limit: $50,000 per rental event
  - Domestic coverage: 15 consecutive days maximum
  - International coverage: 31 consecutive days maximum
  - Coverage applies to:
    * Collision and impact damage
    * Theft of vehicle
    * Vandalism
  - Coverage does NOT apply to:
    * High-value or exotic vehicles
    * Commercial rentals
    * Certain countries/regions
    * Damage from racing or illegal activity
  - Restrictions:
    * Must decline rental company's waiver to claim benefit
    * Coverage applies after personal auto insurance (secondary)
    * Deductible applies if primary insurance has one
  - Ticket must be charged to Wells Fargo card
```

### benefit_key: intro_apr_purchases

```yaml
category: intro_apr_purchases
benefit_name: "0% Introductory APR (12 months on purchases)"
description: "Interest-free financing on new purchases"
details:
  - 0% APR for 12 months from account opening
  - Applies to purchase transactions charged to card
  - After intro period: Variable APR (currently 18.99%-27.99%)
  - Minimum payment still applies during intro period
  - Full payment of intro balance recommended before APR expires
  - Useful for:
    * Large planned purchases (appliances, electronics)
    * Temporary financing without interest
    * Cash flow management
```

### benefit_key: intro_apr_balance_transfer

```yaml
category: intro_apr_balance_transfer
benefit_name: "0% Introductory APR (12 months on balance transfers)"
description: "Interest-free period on transferred balances"
details:
  - 0% APR for 12 months on balance transfer transactions
  - Applies to transfers from other credit cards
  - Balance transfer fee: Typically 3% of transferred amount
  - After intro period: Variable APR (18.99%-27.99%)
  - Useful for debt consolidation strategies
  - Popular for paying off high-APR card balances
  - 12-month window allows ~$83/month payoff per $1,000 transferred (to avoid interest)
```

### benefit_key: visa_signature_benefits

```yaml
category: visa_signature_benefits
benefit_name: "Visa Signature Cardholder Benefits"
description: "Network-level benefits included with Visa Signature"
details:
  - Concierge services (24/7 travel/lifestyle assistance)
  - Travel booking and reservation assistance
  - Event ticket procurement
  - Roadside assistance coordination
  - Emergency services (medical, legal referrals)
  - No lounge access on this card tier
  - No complimentary service perks
```

### benefit_key: no_foreign_transaction_fee_caveat

```yaml
category: no_foreign_transaction_fee_caveat
benefit_name: "3% Foreign Transaction Fee (international purchases)"
description: "Fee on purchases outside the United States"
details:
  - 3% FTF applied to all non-US purchases
  - Charged on top of card issuer's currency conversion spread
  - Reduces effective earning rate on international purchases
  - Effective rate on international spending: 2% cash back - 3% FTF = -1% (net negative)
  - Makes this card unsuitable for international travel
  - Best used exclusively for domestic spending
  - Consideration: Use premium 0% FTF card for international purchases
```

### benefit_key: straightforward_redemption

```yaml
category: straightforward_redemption
benefit_name: "Direct Cash Back Redemption"
description: "Flexible cash back payout options"
details:
  - Cash back can be applied as statement credit
  - Can be transferred to linked checking/savings account
  - Can be used at checkout for statement balance reduction
  - No transfer partners or point conversions required
  - Flexibility: Redeem any amount, any time
  - No minimum redemption threshold
  - Cash back earning automatically credited (no manual claims)
  - Transparent 1:1 cash back ratio
```

---

## Points Multipliers

| Category | Rate | Details |
|----------|------|---------|
| **All Purchases (Flat Rate)** | 2% | Every dollar spent earns 2% cash back |
| **No Category Rotation** | Fixed | No special bonus categories |
| **No Category Restrictions** | Unlimited | All merchants eligible at 2% |
| **Annual Cap** | None | Unlimited earning throughout year |
| **International Purchases** | 2% (before FTF) | Before 3% FTF reduction |
| **Effective International Rate** | -1% | 2% cash back minus 3% FTF = net loss |
| **Minimum Earning Per Purchase** | $0.01 | Smallest transactions earn 2% |

---

## Insurance & Protection Coverage

| Coverage Type | Limit | Deductible | Terms |
|---------------|-------|-----------|-------|
| **Cell Phone Protection** | $600/claim | $25 | 2 claims/year max; covers damage/theft |
| **CDW (Secondary)** | $50,000 | Varies | 15 days domestic, 31 intl; secondary only |
| **Purchase Protection** | None | N/A | Not offered; discontinued |
| **Extended Warranty** | None | N/A | Not offered |
| **Trip Cancellation** | None | N/A | Not offered |
| **Trip Delay** | None | N/A | Not offered |
| **Lost Luggage** | None | N/A | Not offered |
| **Emergency Medical** | None | N/A | Not offered |

---

## Competitor Map

### Direct Competitors (2% Flat-Rate, No-Fee Cards)

| Card | Annual Fee | Earn Rate | Welcome Bonus | FTF | Insurance | Best For |
|------|-----------|-----------|---------------|-----|-----------|----------|
| **Wells Fargo Active Cash** | $0 | 2% flat | $200 | 3% | Cell phone + CDW | Domestic cash back |
| **Citi Double Cash** | $0 | 2% (1+1) | $200 | 3% | Extended warranty | Simpler earning mechanism |
| **Capital One Quicksilver** | $0 | 1.5% flat | $200 | 0% | None | International travel |
| **Chase Freedom Unlimited** | $0 | 1.5% flat | $200 | 0% | None | International + 0% FTF |
| **American Express Blue Preferred** | $0 | 2% (1.5x MR) | $250 | 0% | Extended warranty | Premium no-fee option |

### Value Positioning

- **Sweet Spot:** No-fee flat 2% cash back card with basic insurance for domestic-focused spenders
- **Key Advantages:**
  - Tied for best 2% flat rate among no-fee cards
  - Lowest welcome bonus spend threshold ($500 vs. typical $1,500-5,000)
  - Cell phone protection ($600/claim)—valuable for accident-prone users
  - Secondary CDW (better than nothing; limits to 15/31 days)
  - 12-month 0% APR on both purchases and transfers
  - Simple flat 2% earning—no categories to optimize
  - Visa Signature network status

- **Key Disadvantages:**
  - 3% foreign transaction fee (vs. 0% on premium competitors)
  - Limited insurance compared to premium cards
  - Lower welcome bonus ($200) than some competitors ($250-500)
  - No extended warranty or purchase protection
  - No trip insurance
  - No lounge access
  - CDW is secondary, not primary

---

## Tracking Rules

### Earning Tracking

```yaml
earning_rules:
  cash_back_earning:
    - rate: "2%"
      description: "Flat 2% cash back on all purchases"
      timing: "Posted with transaction (typically 1-3 days)"
      applies_to: "All merchants worldwide"
      exclusions:
        - "Cash advances (0% earning)"
        - "Balance transfers (separately handled)"
        - "Fees and interest"
        - "Money transfers"
        - "Annuities and insurance purchases"

  cash_back_mechanics:
    - automatic_posting: "Cash back accrues automatically with spending"
    - minimum_transaction: "$0.01 (earns $0.0002 cash back)"
    - rounding: "Rounded to nearest cent"
    - timing_to_statement: "Posted monthly with statement"
    - no_caps: "True"
    - category_rotation: "False (fixed 2% rate)"
    - category_optimization: "Not applicable; all purchases earn same rate"

  cash_back_redemption:
    - minimum_redemption: "Any amount"
    - redemption_methods:
        - "Statement credit (applies to balance)"
        - "Direct deposit to checking/savings"
        - "Check payment"
        - "Pay at checkout"
    - timing: "Typically 5-7 business days for transfers"
    - no_fees: "No redemption fees"
```

### Protection Claim Tracking

```yaml
claim_rules:
  cell_phone_protection:
    - max_claims_per_year: 2
    - per_claim_limit: "$600"
    - annual_aggregate_limit: "$1,200"
    - deductible: "$25 per claim"
    - coverage_events:
        - "Accidental damage"
        - "Theft"
        - "Mechanical failure"
    - excluded_events:
        - "Water damage (sometimes covered)"
        - "Intentional damage"
        - "Wear and tear"
        - "Loss (without theft)"
    - filing_deadline: "90 days from incident"
    - documentation_required:
        - "Proof of purchase or carrier letter"
        - "Police report (for theft)"
        - "Photos of damage"
        - "Repair estimate or invoice"

  collision_damage_waiver:
    - coverage_limit: "$50,000 per rental event"
    - coverage_type: "Secondary (applies after primary auto insurance)"
    - domestic_coverage_period: "Up to 15 consecutive days"
    - international_coverage_period: "Up to 31 consecutive days"
    - filing_deadline: "30-60 days typical"
    - deductible: "Applies per primary insurance deductible"
    - documentation_required:
        - "Original rental agreement"
        - "Rental agency damage report"
        - "Police report (if applicable)"
        - "Primary insurance denial (if primary exhausted)"
    - exclusions:
        - "High-value/exotic vehicles"
        - "Commercial rentals"
        - "Certain countries"
        - "Racing or illegal use"
```

### Credit Tracking

```yaml
credit_tracking:
  intro_apr_purchases:
    - duration: "12 months from account opening"
    - apr_rate: "0%"
    - after_intro_apr: "Variable 18.99%-27.99%"
    - applies_to: "All purchase transactions during intro period"
    - minimum_payment: "Still required even at 0% APR"
    - best_practice: "Pay off intro balance before APR expires"

  intro_apr_balance_transfer:
    - duration: "12 months from account opening"
    - apr_rate: "0%"
    - transfer_fee: "3% of transferred amount"
    - applies_to: "Balances transferred from other cards"
    - after_intro_apr: "Variable 18.99%-27.99%"
    - payoff_calculation: "To avoid interest, pay ~$83/month per $1,000 transferred"
```

---

## Valuation Analysis

### Value per Dollar of Cash Back

```yaml
valuation_methodology:
  base_valuation: "$1.00 per $1.00 cash back (1:1 direct)"

  earning_scenarios:
    domestic_purchases:
      - rate: "2% cash back"
      - value: "$0.02 per $1 spent"
      - example: "$100 purchase = $2 cash back"
      - redemption_value: "$2.00"

    international_purchases:
      - rate: "2% cash back minus 3% FTF"
      - effective_rate: "-1% (net loss)"
      - value: "-$0.01 per $1 spent"
      - example: "$100 international purchase = $2 cash back - $3 FTF = net -$1"
      - recommendation: "Use 0% FTF card instead for international"

    breakeven_analysis:
      - annual_fee: "$0"
      - welcome_bonus: "$200"
      - welcome_bonus_spending: "$500"
      - first_purchase_earning: "2% × $500 = $10"
      - total_first_purchase_value: "$200 + $10 - $0 fee = $210"
      - breakeven_annual_spending: "$0 (card pays for itself with bonus)"
      - immediate_profitability: "Yes, from first day"
```

### Annual Value Scenarios

```yaml
annual_value_scenarios:
  minimal_usage:
    annual_spend: "$5,000"
    cash_back_earned: "$100"
    welcome_bonus: "$200"
    total_value: "$300"
    annual_fee: "$0"
    net_value: "$300"
    roi_percent: "Infinite (no fee)"
    suitable_for: "Light spenders; still profitable"

  moderate_usage:
    annual_spend: "$30,000"
    cash_back_earned: "$600"
    welcome_bonus: "$200 (first year only)"
    year_1_total: "$800"
    year_2_plus_total: "$600"
    annual_fee: "$0"
    year_1_net: "$800"
    year_2_net: "$600"
    roi_percent: "Infinite"
    suitable_for: "Typical household; solid 2% return"

  high_usage:
    annual_spend: "$100,000"
    cash_back_earned: "$2,000"
    welcome_bonus: "$200 (first year only)"
    year_1_total: "$2,200"
    year_2_plus_total: "$2,000"
    annual_fee: "$0"
    year_1_net: "$2,200"
    year_2_net: "$2,000"
    roi_percent: "Infinite"
    suitable_for: "High spenders; maximizes flat 2% benefit"

  international_mix_impact:
    annual_domestic_spend: "$50,000"
    annual_international_spend: "$10,000"
    domestic_earnings: "$1,000 (2% on $50K)"
    international_earnings: "-$100 (2% on $10K minus 3% FTF = -$100)"
    net_earnings: "$900"
    effective_rate: "1.5% overall"
    recommendation: "Use premium card (0% FTF) for $10K international portion"
    adjusted_value: "$1,100 (if using 0% FTF card for international)"
```

### Comparison to Category

```yaml
competitive_analysis:
  vs_citi_double_cash:
    annual_fee: "Equal ($0)"
    base_earn: "Equal (2% flat)"
    earning_mechanic: "Wells Fargo 2% vs. Citi 1% + 1% (both same result)"
    welcome_bonus: "Equal ($200)"
    foreign_transaction_fee: "Equal (3%)"
    insurance_benefits: "Wells Fargo has cell phone + CDW; Citi has warranty only"
    simplicity: "Wells Fargo simpler (no payment earning requirement)"
    verdict: "Roughly equivalent; Wells Fargo slightly better with dual insurance"

  vs_capital_one_quicksilver:
    annual_fee: "Equal ($0)"
    domestic_earn_rate: "Wells Fargo 2% vs. Quicksilver 1.5% (WF wins)"
    international_earn_rate: "Wells Fargo -1% vs. Quicksilver 1.5% (Quicksilver wins)"
    welcome_bonus: "Equal ($200)"
    foreign_transaction_fee: "Wells Fargo 3% vs. Quicksilver 0%"
    insurance: "Wells Fargo better (has cell phone + CDW)"
    intro_apr: "Both offer 0% intro APR"
    verdict: "Wells Fargo for domestic; Quicksilver for international"

  vs_chase_freedom_unlimited:
    annual_fee: "Equal ($0)"
    domestic_earn_rate: "Wells Fargo 2% vs. Chase 1.5% (WF wins)"
    foreign_transaction_fee: "Wells Fargo 3% vs. Chase 0% (Chase wins)"
    welcome_bonus: "Wells Fargo $200 vs. Chase $200"
    cash_back_flexibility: "Both offer direct cash back"
    insurance: "Wells Fargo has cell phone + CDW; Chase minimal"
    verdict: "Wells Fargo better for domestic; Chase better for international"
```

### Expected Return on Investment (ROI)

| Spending Pattern | Annual Spend | Cash Back Earned | Annual Fee | Net Value | ROI % |
|------------------|--------------|-----------------|-----------|-----------|-------|
| Minimal | $5,000 | $100 | $0 | $300* | Infinite |
| Moderate | $30,000 | $600 | $0 | $600 | Infinite |
| High | $100,000 | $2,000 | $0 | $2,000 | Infinite |
| International Mix (60/40) | $100K (60 domestic) | $1,200 | $0 | $1,200 | Infinite |

**Note:** *$300 includes $200 welcome bonus in minimal usage scenario.

**Key Insights:**

1. **No-Fee Advantage:** Card generates immediate positive return; no breakeven point required
2. **Flat Rate Simplicity:** 2% applies to all spending; no need to optimize categories
3. **Cash Back Value:** Direct cash (not points) means immediate financial benefit
4. **International Penalty:** 3% FTF makes card suboptimal for international travel
5. **Welcome Bonus:** $200 bonus on just $500 spending is among best in market

**Optimization Strategies:**

- **Use for domestic spending exclusively** (2% is competitive)
- **Keep for low-earning categories** (gas, groceries, utilities where cash back varies)
- **Pair with 0% FTF card** for international travel (negates FTF disadvantage)
- **Leverage intro 0% APR** for planned large purchases or balance transfers
- **Cell phone protection valuable** for younger cardholders or accident-prone users

**Recommendation Positioning:**
- **Best for:** Domestic spenders who want simplicity and no annual fee
- **Avoid for:** International travelers (use 0% FTF card instead)
- **Ideal use case:** Primary domestic card for straightforward 2% cash back
