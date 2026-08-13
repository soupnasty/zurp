# Citi Double Cash Credit Card Catalog

*Last verified: 2026-08-13*

## Card Overview

| Attribute | Value |
|-----------|-------|
| **Card Name** | Citi Double Cash Card |
| **Network** | Mastercard |
| **Annual Fee** | $0 (No annual fee) |
| **Rewards Currency** | ThankYou Points |
| **Earn Rate (Purchase)** | 1% point on all purchases |
| **Earn Rate (Payment)** | 1% point on all payments (dual earning) |
| **Total Effective Earn Rate** | 2% cash back equivalent on all purchases |
| **Citi Travel Portal Earn** | 5% total on hotels, car rentals, and attractions booked through the Citi Travel portal (2% base + 3% portal bonus) |
| **Welcome Bonus** | $200 cash back after $1,500 spend within 6 months |
| **Foreign Transaction Fee** | 3% (FTF applies) |
| **Lounge Access** | None |
| **Intro APR Offer** | 0% for 18 months on balance transfers |
| **Transfer Partners (Without Premium Card)** | JetBlue (1:0.8), Choice Hotels (1:1.5), Wyndham (5:4) only |
| **Card Type ID** | citi_double_cash |

---

## Benefit Catalog

### benefit_key: dual_earning_mechanic

```yaml
category: dual_earning_mechanic
benefit_name: "Dual Earning: 1% Purchase + 1% Payment = 2% Total"
description: "Unique dual earning structure that rewards both purchasing and payment"
details:
  - 1% point earned when purchase is posted (automatically)
  - Additional 1% point earned when payment is made to card (manually accrued)
  - Total effective rate: 2% on all purchases
  - Points pool: ThankYou Points shared across Citi card portfolio (if multiple Citi cards held)
  - No category restrictions or exclusions (except cash advances)
  - Uncapped earning—no annual limits
  - Dual earning is automatic; no special activation required
  - Most accessible 2% flat-rate card available
```

### benefit_key: purchase_earning

```yaml
category: purchase_earning
benefit_name: "1% Points on All Purchases"
description: "Base earning on every dollar spent"
details:
  - 1% ThankYou point earned when purchase posts to account
  - Applies to all spending categories without restrictions
  - No blackout merchants or exclusions (except cash advances)
  - Uncapped annual earning
  - Applies worldwide (subject to FTF)
  - Minimum transaction: $0.01
  - Points post immediately with transaction settlement
```

### benefit_key: payment_earning

```yaml
category: payment_earning
benefit_name: "1% Points on All Payments"
description: "Additional earning bonus on card payments"
details:
  - Earn 1% additional point for each payment made to card
  - Applies to any payment amount (minimum typically $25-100)
  - Earned upon payment posting, not submission
  - Includes online, phone, mail, and in-person payments
  - Can strategically time payments to maximize earning
  - Must pay full or partial balance to earn (minimum payment eligible)
  - Double-earning advantage: Purchase at merchant + earn at payment
```

### benefit_key: citi_travel_portal_earning

```yaml
category: citi_travel_portal_earning
benefit_name: "5% Total on Hotels, Car Rentals & Attractions via Citi Travel"
description: "Bonus earning on travel booked through the Citi Travel portal"
details:
  - 5% total cash back on hotels, car rentals, and attractions booked through the Citi Travel portal (2% base + 3% extra)
  - Flights booked through the portal earn the standard 2% (no portal bonus)
  - Must book through cititravel.com; direct and OTA bookings earn the flat 2%
  - Uncapped earning
  - Only bonus category on this otherwise flat-rate card
```

### benefit_key: welcome_bonus

```yaml
category: welcome_bonus
benefit_name: "$200 Bonus Cash Back"
description: "Introductory bonus for new cardholders"
details:
  - $200 cash bonus awarded upon meeting spending requirement
  - Spending threshold: $1,500 within 6 months of account opening
  - Bonus appears as statement credit once requirement met
  - Typically posts within 1-2 billing cycles after qualifier spent
  - Valued at approximately $200 in direct cash value
  - Can be applied to statement or redeemed for other ThankYou products
```

### benefit_key: thankyon_points_pool

```yaml
category: thankyon_points_pool
benefit_name: "Shared ThankYou Points Pool (with Strata Cards)"
description: "Points pooling with premium Citi card ecosystem"
details:
  - Points earned on Citi Double Cash pool with:
    * Citi ThankYou Premier
    * Citi ThankYou Elite
    * Other ThankYou-earning Citi cards
  - Single ThankYou account across all cards held
  - Pool balances for consolidated redemption
  - Transfer partners available only if holding premium card (Premier/Elite)
  - Without premium card: limited to fixed transfer partners only
  - Upgrade pathway: Can upgrade to Premier/Elite for access to full transfer network
```

### benefit_key: limited_transfer_partners

```yaml
category: limited_transfer_partners
benefit_name: "Limited Transfer Partners (Without Premium Card)"
description: "Redemption options for ThankYou points"
details:
  - As standalone Citi Double Cash (no Premier/Elite):
    * JetBlue (1 point = 0.8 JetBlue points, unfavorable rate)
    * Choice Hotels (1 point = 1.5 Choice points, favorable rate)
    * Wyndham (5 points = 4 Wyndham points, slightly unfavorable)
  - All transfers at stated ratios, no 1:1 transfers available
  - Minimum transfer typically 5,000 points
  - Processing time: 24-48 hours
  - Upgrades to Premier/Elite unlock 35+ partners at better rates
  - Note: These are limited redemption paths; most users prefer direct cash usage
```

### benefit_key: extended_warranty

```yaml
category: extended_warranty
benefit_name: "Extended Warranty (24 months added, $10K/item)"
description: "Extends manufacturer warranties on eligible purchases"
details:
  - Extends original manufacturer warranty by up to 24 additional months
  - Covers mechanical and electrical failures
  - Maximum coverage: $10,000 per item
  - Applies to most electronics, appliances purchased with card
  - Excludes: vehicles, jewelry, antiques, software
  - Must provide proof of original warranty
  - Filing deadline: Within 30 days of warranty expiration
  - One of few remaining benefits on this no-fee card
```

### benefit_key: intro_apr_balance_transfer

```yaml
category: intro_apr_balance_transfer
benefit_name: "0% Introductory APR (18 months on balance transfers)"
description: "Low-rate financing for balance transfers"
details:
  - 0% APR for 18 months on balance transfer transactions
  - Applies to transfers from other credit cards
  - Standard balance transfer fee applies: typically 3-5% of amount transferred
  - After introductory period: Variable APR (currently 15.99%-25.99%)
  - Maximum transfer amount: Typically up to available credit line
  - Popular for debt consolidation or payoff strategies
  - No transfer fees during intro period (fee paid upfront only)
```

### benefit_key: foreign_transaction_fee

```yaml
category: foreign_transaction_fee
benefit_name: "3% Foreign Transaction Fee (on international purchases)"
description: "Fee applied to purchases outside the United States"
details:
  - 3% FTF on all international transactions
  - Charged in addition to foreign exchange conversion spread
  - Applies to:
    * Purchases from foreign merchants
    * Online purchases from foreign-based websites
    * Currency conversions (even at US merchants)
  - Reduces effective earning rate on international purchases to 1x (after FTF reduction)
  - Disadvantage vs. premium cards (typically 0% FTF)
  - Consideration: Use for domestic spending primarily
```

### benefit_key: mastercard_benefits

```yaml
category: mastercard_benefits
benefit_name: "Mastercard Standard Benefits"
description: "Mastercard network-included protections"
details:
  - Fraud liability protection (Zero Liability)
  - Purchase dispute/chargeback rights
  - Emergency roadside assistance
  - Emergency card replacement services
  - Card lock/unlock mobile controls
  - Identity theft protection services
  - No lounge access or premium Mastercard perks
```

---

## Points Multipliers

| Category | Multiplier | Details |
|----------|-----------|---------|
| **All Purchases (Earning)** | 1x point | Every dollar spent earns 1 point |
| **All Payments (Earning)** | 1x point | Every dollar paid earns 1 additional point |
| **Effective Total Rate** | 2% | Combined purchase + payment earning |
| **Citi Travel Portal (hotels/cars/attractions)** | 5% total | 2% base + 3% portal bonus; portal flights earn 2% |
| **No Category Rotation** | Flat | No rotating categories; only exception is the Citi Travel portal bonus above |
| **No Annual Caps** | Unlimited | Uncapped earning across all categories |
| **Cash Advances** | 0x | No earning on cash advances (not eligible) |
| **Balance Transfers** | 0x | No earning on balance transfers themselves |

---

## Insurance & Protection Coverage

| Coverage Type | Limit | Deductible | Terms |
|---------------|-------|-----------|-------|
| **Purchase Protection** | None | N/A | Not offered; discontinued by Citi |
| **Extended Warranty** | $10K/item | $0 | 24 months added to original warranty |
| **CDW/Rental Car** | None | N/A | Not offered; not included |
| **Trip Cancellation** | None | N/A | Not offered |
| **Trip Delay** | None | N/A | Not offered |
| **Lost Luggage** | None | N/A | Not offered |
| **Cell Phone Protection** | None | N/A | Not offered |
| **Emergency Medical** | None | N/A | Not offered |
| **Fraud Liability** | $0 | N/A | Standard Mastercard Zero Liability |

---

## Competitor Map

### Direct Competitors (2% Flat-Rate Cards)

| Card | Annual Fee | Earn Rate | Welcome Bonus | FTF | Transfer Partners | Category-Specific Earning |
|------|-----------|-----------|---------------|-----|------------------|--------------------------|
| **Citi Double Cash** | $0 | 2% (1+1) | $200 | 3% | Limited (3 only) | None; flat 2% |
| **Chase Ink Cash** | $0 | 5x/2x/1x | $300-500 | 0% | 35+ partners | Categories (cash, internet, etc.) |
| **Capital One Quicksilver** | $0 | 1.5% flat | $200 | 0% | None (cash only) | None; 1.5% flat |
| **Amex Blue Business Cash** | $0 | Up to 3% | $100-500 | 0% | 1:1 Amex partners | Quarterly categories (4x rotating) |
| **Wells Fargo Active Cash** | $0 | 2% flat | $200 | 3% | None (cash only) | None; 2% flat |

### Value Positioning

- **Sweet Spot:** No-fee flat-rate card for cardholders who want simplicity and don't prioritize transfer partners
- **Key Advantages:**
  - Zero annual fee
  - 2% flat effective rate (tied best among no-fee cards)
  - 5% total on hotels, car rentals, and attractions booked through the Citi Travel portal
  - Unique dual-earning structure rewards payment behavior
  - Extended warranty benefit (valuable for no-fee card)
  - 18-month 0% APR on balance transfers
  - Shared points pool with premium Citi cards (if applicable)
  - Simple—no categories to track
  - Mastercard acceptance worldwide

- **Key Disadvantages:**
  - 3% foreign transaction fee (vs. 0% on competitors)
  - Limited transfer partners without premium card (3 vs. 35+)
  - Lower welcome bonus than some competitors ($200 vs. $500)
  - No purchase protection or CDW (discontinued)
  - No trip insurance of any kind
  - No lounge access
  - Cannot utilize full Citi transfer network unless upgrade to Premier/Elite

---

## Tracking Rules

### Earning Tracking

```yaml
earning_rules:
  purchase_earning:
    - rate: "1%"
      description: "Automatic earning when purchase posts"
      timing: "Upon transaction settlement (typically 1-3 days)"
      applies_to: "All merchants, all spending globally"
      exclusions:
        - "Cash advances and ATM withdrawals"
        - "Balance transfers and refinancing"
        - "Fees and interest charges"
        - "Money transfers"

  payment_earning:
    - rate: "1%"
      description: "Additional earning when payment applied to balance"
      timing: "When payment posts to account (1-3 days)"
      applies_to: "All payments; both minimum and full balance"
      minimum_payment_threshold: "Typically $25 or account minimum"
      payment_methods_eligible:
        - "Online payments"
        - "Phone payments"
        - "Mail payments"
        - "In-person payments at branch"
      notes:
        - "Can strategically time payments to maximize earning"
        - "Partial payments earn the 1% point"
        - "Multiple payments per month each earn points"

  dual_earning_example: "Spend $1,000 on purchase = earn 10 points; pay $1,000 payment = earn additional 10 points; total = 20 points = 2% effective rate"

  earning_exclusions:
    - "Cash advances (0% earning)"
    - "Balance transfer fees"
    - "Annual fees (this card has none)"
    - "Late fees or penalty fees"

  no_caps: "True"
  category_rotation: "False"
  annual_maximum_earn: "Unlimited"
```

### Points Pool Tracking

```yaml
points_pool_mechanics:
  pool_structure: "Shared across Citi ThankYou-earning cards"
  accounts_eligible_for_pooling:
    - "Citi Double Cash"
    - "Citi ThankYou Premier"
    - "Citi ThankYou Elite"
    - "Other Citi ThankYou products"
  pool_management:
    - "Single ThankYou points balance across all cards"
    - "Points earned on any card accessible on any card"
    - "Transfer partners available per card type (not all cards have transfer access)"
    - "Best practice: Hold at least one premium card (Premier/Elite) for full partner access"

  without_premium_card_limitations:
    - "Only 3 transfer partners available (JetBlue, Choice, Wyndham)"
    - "No airline transfers at favorable 1:1 ratios"
    - "Most redemptions done as cash/statement credit"
    - "Upgrade pathway available to unlock full network"

  transfer_partner_access:
    - "Premier/Elite cardholders: Full access to 35+ partners at 1:1 ratios"
    - "Double Cash alone: Limited to 3 partners at mixed ratios"
```

### Credit Tracking

```yaml
credit_tracking:
  balance_transfer_offer:
    - description: "0% APR for 18 months on balance transfers"
    - fee: "3-5% balance transfer fee (paid upfront)"
    - effective_cost: "3-5% of transferred amount"
    - expires: "18 months from first transfer posting date"
    - after_intro: "Variable APR (15.99%-25.99%)"
    - popular_use_cases:
        - "Consolidating high-APR card balances"
        - "Financing payoff strategy over 18 months"
        - "Temporary low-cost borrowing"
```

### Warranty Claim Tracking

```yaml
claim_rules:
  extended_warranty:
    - coverage_period: "Extends original warranty by up to 24 months"
    - max_per_claim: "$10,000"
    - annual_maximum: "Not clearly specified (review with Citi)"
    - filing_deadline: "Must file within 30 days of original warranty expiration"
    - documentation_required:
        - "Proof of original warranty"
        - "Original invoice/receipt"
        - "Proof of defect"
        - "Repair estimate"
    - notes: "One of few remaining benefits on no-fee card; valuable for electronics purchases"
```

---

## Valuation Analysis

### Value per Point

```yaml
valuation_methodology:
  base_valuation: "$0.01 per point (1 cpp)"

  redemption_scenarios:
    direct_cash_equivalent:
      - value: "$0.01 per point"
      - method: "Statement credit (most common redemption)"
      - notes: "Simplest redemption; 1% effective cash back"

    transfer_to_jblue:
      - value: "$0.008 per point"
      - method: "Transfer at 1:0.8 ratio (unfavorable)"
      - calculation: "1 point = 0.8 JetBlue points; JetBlue valued at ~$0.01; effective value $0.008"
      - notes: "Avoid this transfer; poor conversion rate"

    transfer_to_choice:
      - value: "$0.0067 per point"
      - method: "Transfer at 1:1.5 ratio"
      - calculation: "1 point = 1.5 Choice points; Choice valued at ~$0.0045; effective value $0.0067"
      - notes: "Slightly favorable if using Choice Hotels frequently"

    transfer_to_wyndham:
      - value: "$0.008 per point"
      - method: "Transfer at 5:4 ratio"
      - calculation: "5 points = 4 Wyndham; Wyndham valued at $0.01; effective value $0.008"
      - notes: "Comparable to JetBlue; both are unfavorable"

  best_redemption: "Direct cash/statement credit at 1 cpp; avoid transfer partners"

  breakeven_analysis:
    annual_fee: 0
    welcome_bonus_points: 200
    welcome_bonus_value: 200
    cost_to_breakeven: "Zero (no annual fee)"
    breakeven_annual_spending: "$0 (immediately profitable)"
    advantage: "Card pays for itself through welcome bonus alone"
```

### Annual Value Scenarios

```yaml
annual_value_scenarios:
  low_usage:
    annual_spend: "$5,000"
    purchase_points: 5000
    estimated_payments: 5000
    total_points: 10000
    value_at_1cpp: 100
    net_value_with_no_fee: 100
    roi_percent: "Infinite (no fee)"
    suitable_for: "Light spenders; even minimal use profitable"

  medium_usage:
    annual_spend: "$25,000"
    purchase_points: 25000
    estimated_payments: 25000
    total_points: 50000
    value_at_1cpp: 500
    net_value: 500
    roi_percent: "Infinite"
    suitable_for: "Typical spender; solid rewards on flat 2%"

  high_usage:
    annual_spend: "$100,000"
    purchase_points: 100000
    estimated_payments: 100000
    total_points: 200000
    value_at_1cpp: 2000
    net_value: 2000
    roi_percent: "Infinite"
    suitable_for: "High-spend households; maximum benefit from no-fee structure"

  international_usage_impact:
    annual_international_spend: "$10,000"
    base_points_earned: 10000
    foreign_transaction_fee_cost: 300
    effective_rate_after_fee: "1.7% (2% - 0.3% FTF)"
    comparison: "vs 2% with no-fee premium cards"
    recommendation: "Use premium 0% FTF card for international; Double Cash for domestic"
```

### Comparison to Category

```yaml
competitive_analysis:
  vs_wells_fargo_active_cash:
    annual_fee: "Equal ($0)"
    base_earn: "Equal (2% flat)"
    welcome_bonus: "Equal ($200)"
    foreign_transaction_fee: "Equal (3%)"
    insurance_benefits: "WF Active Cash has cell phone and CDW; Double Cash only has warranty"
    transfer_partners: "Double Cash 3 limited; WF Active Cash none (cash only)"
    verdict: "Very similar; WF has slight edge with insurance; Double Cash if transfer partners matter"

  vs_chase_ink_cash:
    annual_fee: "Equal ($0)"
    earn_rate: "Chase 5x/2x/1x vs. Double Cash 2% flat"
    complexity: "Chase requires category tracking; Double Cash simple"
    welcome_bonus: "Chase $300-500 vs. Double Cash $200"
    category_earning: "Chase wins on rotating 5x categories"
    foreign_transaction_fee: "Chase 0% vs. Double Cash 3%"
    transfer_partners: "Chase 35+ vs. Double Cash 3 (Chase wins significantly)"
    verdict: "Chase better for bonus categories; Double Cash better for simplicity and consistent rate"

  vs_capital_one_quicksilver:
    annual_fee: "Equal ($0)"
    earn_rate: "Double Cash 2% vs. Quicksilver 1.5%"
    welcome_bonus: "Equal ($200)"
    transfer_partners: "Double Cash 3 vs. Quicksilver none"
    simplicity: "Both simple flat-rate cards"
    foreign_transaction_fee: "Double Cash 3% vs. Quicksilver 0%"
    verdict: "Double Cash better for domestic spending (2% vs. 1.5%); Quicksilver better for international (0% FTF)"
```

### Expected Return on Investment (ROI)

| Spending Pattern | Annual Spend | Points Earned | Value Generated | Annual Fee | Net Value | ROI % |
|------------------|--------------|---------------|-----------------|-----------|-----------|-------|
| Minimal | $5,000 | 10,000 | $100 | $0 | $100 | Infinite |
| Moderate | $25,000 | 50,000 | $500 | $0 | $500 | Infinite |
| Heavy | $100,000 | 200,000 | $2,000 | $0 | $2,000 | Infinite |
| International Mix | $50,000 (with $10K intl) | 100,000 | $1,700 | $0 | $1,700 | 1,700% |

**Key Insights:**

1. **No-Fee Advantage:** Every dollar spent generates positive return (unlike fee-based cards)
2. **Simplicity Value:** 2% flat rate eliminates need to track categories or optimize spending
3. **International Consideration:** 3% FTF reduces effective rate to 1.7% on international; offset by avoiding annual fees
4. **Welcome Bonus:** $200 bonus arrives immediately; equivalent to $10,000 spending at 2% rate
5. **Transfer Partner Limitation:** Transfer ratios are unfavorable; cash redemption strongly preferred

**Recommendation Strategy:**
- **Best Use:** Domestic spending where 2% flat rate maximizes rewards
- **Avoid:** International travel (use premium 0% FTF card instead)
- **Optimization:** Combine with premium card for transfer partner access if points pool desired
- **Upgrade Path:** Consider Citi Premier/Elite upgrade for full transfer network access if needed
