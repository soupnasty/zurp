# Capital One Venture Rewards Credit Card Catalog

## Card Overview

| Attribute | Value |
|-----------|-------|
| **Card Name** | Capital One Venture Rewards |
| **Network** | Visa Signature |
| **Annual Fee** | $95 |
| **Rewards Currency** | Miles |
| **Earn Rate (Standard)** | 2x miles on all purchases (uncapped) |
| **Earn Rate (Bonus)** | 5x miles on hotels/rental cars booked via Capital One Travel portal |
| **Welcome Bonus** | 75,000 miles after $4,000 spend within 3 months + $250 first-year travel credit |
| **Foreign Transaction Fee** | 0% (No FTF) |
| **Lounge Access** | $45 discounted visits (not complimentary) |
| **Global Entry Credit** | $120 reimbursement |
| **Card Type ID** | capital_one_venture |

---

## Benefit Catalog

### benefit_key: rewards_earning

```yaml
category: rewards_earning
benefit_name: "2x Miles on Everything"
description: "Earn 2x Capital One miles on every dollar spent, uncapped"
details:
  - All purchases earn 2x miles without category restrictions
  - No spending caps or annual limits
  - Miles accumulate in shared pool with Capital One Venture X and other Capital One products
  - Can be used for travel redemptions or transferred to partners
```

### benefit_key: bonus_category_travel

```yaml
category: bonus_category_travel
benefit_name: "5x Miles on Hotels and Rental Cars (via Capital One Travel)"
description: "Elevated earning rate for travel booked through designated portal"
details:
  - 5x miles rate applies only to hotels and rental cars booked via Capital One Travel
  - Direct bookings or third-party booking sites earn standard 2x rate
  - Includes major hotel chains and rental car companies accessible through portal
  - No caps on this bonus category
```

### benefit_key: welcome_bonus

```yaml
category: welcome_bonus
benefit_name: "75,000 Miles Welcome Bonus + $250 Travel Credit"
description: "Introductory offer for new cardholders"
details:
  - 75,000 bonus miles awarded after meeting $4,000 spend threshold within 3 months
  - $250 first-year travel credit for any eligible travel purchase
  - Credit posts annually if card remains open
  - Bonus miles are free (not earned through organic spend)
  - Equivalent to ~$750-900 in travel value depending on redemption partner
```

### benefit_key: travel_credits

```yaml
category: travel_credits
benefit_name: "$250 Annual Travel Credit"
description: "Annual statement credit for travel purchases"
details:
  - $250 credit applied annually to eligible travel expenses
  - Covers airline tickets, hotels, rental cars, vacation rentals, tour operators
  - Credit resets each calendar year
  - Must use or lose within 12-month period
  - First-year credit included with welcome offer
```

### benefit_key: trip_delay_reimbursement

```yaml
category: trip_delay_reimbursement
benefit_name: "Trip Delay Reimbursement ($500/person)"
description: "Coverage for essential expenses during covered travel delays"
details:
  - Reimburses up to $500 per person for eligible travel delays
  - Applies to delays exceeding 6 consecutive hours on covered trips
  - Covered expenses include meals, lodging, communication (phone calls, emails)
  - Purchased ticket must be charged to card
  - Maximum 2 claims per 12-month period
  - Not covered: trip delays caused by weather, strikes, or known conditions
```

### benefit_key: lost_luggage_reimbursement

```yaml
category: lost_luggage_reimbursement
benefit_name: "Lost Luggage Reimbursement ($3,000/passenger)"
description: "Coverage for lost, damaged, or delayed baggage on covered trips"
details:
  - Up to $3,000 reimbursement per passenger per trip
  - Covers airline baggage lost, damaged, or delayed 12+ hours
  - Reimburses reasonable replacement items and essential expenses
  - Ticket must be purchased with card
  - Coverage applies when airlines deny compensation
  - Excluded: valuables, jewelry, electronics (unless essential for trip)
```

### benefit_key: collision_damage_waiver

```yaml
category: collision_damage_waiver
benefit_name: "Primary Collision Damage Waiver (CDW)"
description: "Car rental damage coverage as primary payer"
details:
  - Primary CDW coverage on rental cars booked with card
  - Covers collision, theft, vandalism damage to rental vehicle
  - Capital One pays first, then personal insurance (if applicable)
  - Applies to most major rental companies worldwide
  - Restrictions: excludes high-value vehicles, exotic cars, certain countries
  - Must decline rental company's damage waiver to activate benefit
  - Coverage limit: up to car's actual cash value
```

### benefit_key: purchase_protection

```yaml
category: purchase_protection
benefit_name: "Purchase Protection ($1,000/item, $25,000/year, 90 days)"
description: "Coverage for eligible purchases against theft or accidental damage"
details:
  - Covers accidental damage or theft of items purchased with card
  - Up to $1,000 per item, $25,000 per calendar year aggregate
  - Coverage period: 90 days from purchase date
  - Requires filing claim with original receipt and proof of loss
  - Excludes: jewelry, collectibles, electronics (unless under $300)
  - Deductible: $50 per claim (typical)
```

### benefit_key: extended_warranty

```yaml
category: extended_warranty
benefit_name: "Extended Warranty (up to $10,000/claim, $50,000/year)"
description: "Extends manufacturer warranties on eligible purchases"
details:
  - Extends original manufacturer warranty by additional period (typically 1 year)
  - Covers mechanical and electrical failures after manufacturer warranty ends
  - Maximum coverage: $10,000 per claim, $50,000 annual aggregate
  - Applies to most products purchased with card (appliances, electronics, etc.)
  - Excludes: vehicles, software, jewelry, antiques
  - Requires proof of original warranty and purchase documentation
```

### benefit_key: cell_phone_protection

```yaml
category: cell_phone_protection
benefit_name: "Cell Phone Protection ($800/claim with deductible)"
description: "Coverage for eligible cell phones purchased with card"
details:
  - Up to $800 per claim for accidental damage, theft, or malfunction
  - Applies to phones purchased with card or monthly service charged to card
  - Standard deductible per claim (typically $50-100)
  - Coverage limit: up to 2 claims per 12-month period
  - Excludes: water damage (in many cases), intentional damage, wear and tear
  - Requires police report for theft claims
```

### benefit_key: transfer_partners

```yaml
category: transfer_partners
benefit_name: "Transfer Partners (22+ programs at 1:1 ratio)"
description: "Ability to transfer miles to airline and hotel partners"
details:
  - Transfer miles to 22+ loyalty programs at fixed 1:1 ratio
  - Participating programs include:
    * Airlines: Air Canada Aeroplan, Avianca LifeMiles, British Airways Avios, Emirates, Turkish Airlines Miles, Singapore Airlines KrisFlyer
    * Airlines: United MileagePlus, Delta SkyMiles, American Airlines AAdvantage, Southwest Rapid Rewards, Alaska Mileage Plan
    * Airlines: Qantas Frequent Flyer, Virgin Atlantic Flying Club, Lufthansa Miles & More
    * Hotels: Marriott Bonvoy, Hyatt World of Hyatt, IHG One Rewards
  - Instant transfer processing to most partners
  - Transfers are non-refundable once posted
  - No blackout dates on most partner awards
```

### benefit_key: no_foreign_transaction_fee

```yaml
category: no_foreign_transaction_fee
benefit_name: "No Foreign Transaction Fees"
description: "No fees on international purchases"
details:
  - 0% foreign transaction fee on all purchases made outside US
  - Applies to all card transactions regardless of merchant location
  - Particularly valuable for international travel and online purchases from foreign merchants
  - Fee savings compound on high-volume international spending
```

### benefit_key: discounted_lounge_access

```yaml
category: discounted_lounge_access
benefit_name: "$45 Discounted Lounge Visit Passes"
description: "Discounted pricing for airport lounge access via LoungeKey"
details:
  - Access to 1,000+ airport lounges globally via LoungeKey program
  - $45 per visit (compared to typical $27-35 for Venture X at no cost)
  - Not complimentary—fees apply for each visit
  - Includes food, beverages, Wi-Fi, business services
  - Can purchase passes on-demand or through standing arrangement
  - Family members can accompany cardholder
```

### benefit_key: global_entry_credit

```yaml
category: global_entry_credit
benefit_name: "$120 Global Entry Credit"
description: "Reimbursement for TSA Global Entry enrollment or NEXUS/SENTRI"
details:
  - $120 statement credit per authorization period
  - Covers TSA Global Entry ($100 fee), NEXUS ($120), or SENTRI ($99)
  - Reimburses credential renewal costs (valid for 5-year period)
  - Automatic credit posts upon approval of application
  - Family members not covered under this benefit
```

### benefit_key: concierge_services

```yaml
category: concierge_services
benefit_name: "Visa Signature Concierge Services"
description: "24/7 travel and lifestyle concierge assistance"
details:
  - Travel booking and planning assistance
  - Restaurant, event, and entertainment reservations
  - Event ticket procurement
  - Emergency translation services
  - Roadside assistance coordination
  - Medical and legal referral services
  - No direct cost, but services may have third-party fees
```

---

## Points Multipliers

| Category | Multiplier | Details |
|----------|-----------|---------|
| **All Purchases (Standard)** | 2x miles | Flat rate, no caps, includes all non-bonus categories |
| **Hotels** | 5x miles | Only when booked via Capital One Travel portal |
| **Rental Cars** | 5x miles | Only when booked via Capital One Travel portal |
| **Airlines** | 2x miles | Standard rate unless booked via Capital One Travel (still 2x) |
| **Dining** | 2x miles | Standard rate, no bonus category |
| **Gas/EV Charging** | 2x miles | Standard rate |
| **Groceries** | 2x miles | Standard rate |
| **Streaming/Subscriptions** | 2x miles | Standard rate |

---

## Insurance & Protection Coverage

| Coverage Type | Limit | Deductible | Terms |
|---------------|-------|-----------|-------|
| **Trip Delay Reimbursement** | $500/person | $0 | 6+ hour delay; max 2 claims/yr |
| **Lost Luggage** | $3,000/passenger | $0 | Airline-delayed or lost baggage |
| **CDW (Primary)** | Vehicle value | $0 | Rental cars booked with card; primary coverage |
| **Purchase Protection** | $1,000 item / $25K annual | $50 | 90-day coverage window |
| **Extended Warranty** | $10K claim / $50K annual | Varies | Extends manufacturer warranty |
| **Cell Phone Protection** | $800/claim | $50-100 | 2 claims/year max |
| **Trip Cancellation** | None | N/A | Not offered on this card |
| **Trip Interruption** | None | N/A | Not offered on this card |
| **Emergency Medical** | None | N/A | Not offered on this card |

---

## Competitor Map

### Direct Competitors

| Card | Annual Fee | Base Earn | Welcome Bonus | Transfer Partners | Key Differentiator |
|------|-----------|-----------|---------------|------------------|-------------------|
| **Capital One Venture** | $95 | 2x all | 75K miles + $250 credit | 22+ at 1:1 | Lowest barrier; simple rate structure |
| **Chase Sapphire Preferred** | $95 | 2x travel + 3x dining/cat | 60K UR + $50 credit | 35+ at varying rates | Higher earning potential; better partners |
| **American Express Gold** | $250 | 4x flights/dining, 1x other | 75K MR | 15+ airline partners | Higher annual fee; higher earning rates |
| **Ink Business Preferred** | $95 | 3x in 3 categories | 100K UR | 35+ partners via UR | Business focus; higher signup bonus |

### Value Positioning

- **Sweet Spot:** Mid-tier rewards card with simple 2x earning and good travel credits
- **Advantages vs. Competitors:**
  - Lower annual fee ($95 vs. $250 for Amex Gold)
  - No foreign transaction fees (vs. many competitors)
  - Strong welcome bonus (75K miles + $250 credit)
  - Good transfer partner list (22+ programs)
  - Accessible to broader range of credit profiles

- **Disadvantages vs. Competitors:**
  - Lower earn rates than Sapphire Preferred (2x vs. 3x on dining)
  - Smaller transfer partner network than Chase (22 vs. 35+)
  - No complimentary lounge access (vs. Sapphire Reserve or Amex Platinum)
  - Limited premium insurance compared to higher-tier cards

---

## Tracking Rules

### Earning Tracking

```yaml
earning_rules:
  base_rate:
    - rate: 2x
      description: "All purchases earn 2x miles flat"
      applies_to: "Every transaction globally"
      exclusions:
        - "Cash advances"
        - "Fees and interest"
        - "Transfers of balance"
  bonus_categories:
    - rate: 5x
      category: "Hotels via Capital One Travel"
      description: "Must be booked through Capital One Travel portal"
      notes: "Direct hotel website bookings earn 2x only"
    - rate: 5x
      category: "Rental Cars via Capital One Travel"
      description: "Must be booked through Capital One Travel portal"
      notes: "Direct rental company bookings earn 2x only"
  no_caps: "True"
  annual_maximum_earn: "Unlimited"
  minimum_transaction: "$0.01"
```

### Miles Pooling

```yaml
miles_pooling:
  pooled_accounts:
    - "Capital One Venture Rewards"
    - "Capital One Venture X"
    - "Capital One Spark Miles"
    - "Other Capital One miles-based cards"
  pool_management:
    - "All miles accrue to single Capital One miles account"
    - "Transfers and redemptions draw from combined pool"
    - "No separate tracking per card"
```

### Credit Tracking

```yaml
credit_tracking:
  travel_credit:
    - description: "$250 annual travel credit"
    - reset_period: "Calendar year (Jan-Dec)"
    - eligible_categories:
        - "Airlines"
        - "Hotels"
        - "Rental cars"
        - "Vacation rentals"
        - "Tour operators"
        - "Travel agents"
    - not_eligible:
        - "Rideshare (Uber, Lyft)"
        - "Gas and parking"
        - "Meals during travel"
    - use_it_or_lose_it: "True"
```

### Insurance Claim Tracking

```yaml
claim_rules:
  trip_delay:
    - max_claims_per_year: 2
    - minimum_delay_hours: 6
    - filing_deadline: "30 days after incident"
    - documentation_required:
        - "Original ticket"
        - "Boarding pass"
        - "Receipts for expenses"
        - "Airline delay confirmation"

  lost_luggage:
    - max_claims_per_year: "Unlimited"
    - filing_deadline: "90 days"
    - documentation_required:
        - "Original airline ticket"
        - "Baggage tags"
        - "Airlines initial refusal letter"
        - "Itemized loss statement with receipts"

  purchase_protection:
    - max_claims_per_year: "Unlimited (subject to annual cap)"
    - annual_aggregate_limit: "$25,000"
    - per_item_limit: "$1,000"
    - coverage_window_days: 90
    - filing_deadline: "90 days from incident"
    - documentation_required:
        - "Original receipt/invoice"
        - "Police report (for theft)"
        - "Damage photos"
        - "Repair estimate"
```

### Partner Transfer Tracking

```yaml
transfer_tracking:
  transfer_mechanics:
    - ratio: "1:1 (1 Capital One mile = 1 partner point)"
    - minimum_transfer: "1,000 miles typical"
    - processing_time: "Instant to 24 hours"
    - reversibility: "No—transfers are permanent"

  partner_list_updates:
    - frequency: "Quarterly review"
    - additions_removals: "Check Capital One website for current list"
    - no_devaluation: "Most partners maintain standard 1:1 ratio"
```

---

## Valuation Analysis

### Value per Mile

```yaml
valuation_methodology:
  base_valuation: "$0.01 per mile (1 cpp)"

  redemption_scenarios:
    cash_out:
      - value: "$0.005 per mile"
      - method: "Direct cash redemption (if available)"

    airline_transfer:
      - value: "$0.012-0.015 per mile"
      - method: "Transfer to partner airlines; use on award flights"
      - sweet_spot: "Business class awards to international destinations"

    hotel_transfer:
      - value: "$0.008-0.012 per mile"
      - method: "Transfer to partner hotels (Marriott, Hyatt, IHG)"
      - sweet_spot: "Luxury properties in high-cost markets"

    portal_redemption:
      - value: "$0.008-0.010 per mile"
      - method: "Book through Capital One Travel portal"

  breakeven_analysis:
    annual_fee: 95
    welcome_bonus_miles: 75000
    welcome_bonus_value_at_1cpp: 750
    first_year_travel_credit: 250
    total_first_year_value: 1000
    net_gain_first_year: 905
    breakeven_annual_spending: "$4,750"
    calculation: "Annual fee ($95) ÷ base earn rate (2x miles, $0.02 per $1) = $4,750 annual spend at 1cpp valuation"
```

### Annual Value Scenarios

```yaml
annual_value_scenarios:
  low_usage:
    annual_spend: "$10,000"
    miles_earned_base: 20000
    miles_earned_bonus: 0
    total_miles: 20000
    value_at_1cpp: 200
    travel_credit: 250
    total_value: 450
    net_gain: 355
    roi_percent: 374
    suitable_for: "Light spenders, benefit from travel credit"

  medium_usage:
    annual_spend: "$25,000"
    miles_earned_base: 50000
    miles_earned_bonus: 5000
    total_miles: 55000
    value_at_1.2cpp: 660
    travel_credit: 250
    total_value: 910
    net_gain: 815
    roi_percent: 858
    suitable_for: "Regular travelers, utilizes transfer partners effectively"

  high_usage:
    annual_spend: "$60,000"
    miles_earned_base: 120000
    miles_earned_bonus_via_portal: 10000
    total_miles: 130000
    value_at_1.3cpp: 1690
    travel_credit: 250
    lounge_savings: 180
    global_entry_credit: 120
    total_value: 2240
    net_gain: 2145
    roi_percent: 2258
    suitable_for: "Heavy travelers, maximizes all benefits"
```

### Comparison to Category

```yaml
competitive_analysis:
  vs_sapphire_preferred:
    annual_fee_delta: "$0 (Capital One = $95, Chase = $95)"
    earn_rate_delta: "-1x on dining (Capital One 2x vs. Chase 3x)"
    value_proposition: "Simpler earning, lower earning potential"
    best_for: "Those preferring simplicity; non-dining heavy spenders"

  vs_sapphire_reserve:
    annual_fee_delta: "-$155 (Capital One $95 vs. Chase $550)"
    earn_rate_delta: "-1x on travel (Capital One 2x vs. Chase 3x)"
    lounge_access: "Capital One paid ($45/visit) vs. Chase unlimited"
    value_proposition: "Much lower fee; significantly fewer benefits"
    crossover_point: "Would need to value miles at 1.5+ cpp to justify Reserve's fee"
```

### Expected Return on Investment (ROI)

| Spending Pattern | Annual Spend | Value Generated | Net After Fee | ROI % |
|------------------|--------------|-----------------|---------------|-------|
| Minimal | $5,000 | $465 | $370 | 389% |
| Moderate | $25,000 | $910 | $815 | 858% |
| Heavy | $60,000+ | $2,240+ | $2,145+ | 2,258%+ |

**Note:** ROI calculations assume 1.0-1.3 cpp valuation depending on redemption methods. Actual returns vary based on:
- Transfer partner timing and availability
- Award pricing at desired airlines
- Ability to leverage $250 travel credit
- Whether Global Entry credit is used
