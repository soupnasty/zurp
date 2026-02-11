# Wells Fargo Autograph Journey Credit Card Catalog

## Card Overview

| Attribute | Value |
|-----------|-------|
| **Card Name** | Wells Fargo Autograph Journey Visa Signature |
| **Network** | Visa Signature |
| **Annual Fee** | $95 |
| **Rewards Currency** | Points |
| **Earn Rate (Standard)** | 1x point on all other purchases (uncapped) |
| **Earn Rate (Travel/Dining)** | 5x hotels, 4x airlines/rental cars/dining, 3x travel/transit/streaming/phone |
| **Welcome Bonus** | 60,000 points after $4,000 spend within 3 months |
| **Annual Airline Credit** | $50 (minimum $50 airline purchase required) |
| **Foreign Transaction Fee** | 0% (No FTF) |
| **Lounge Access** | None included |
| **Preferred Partner Benefits** | Choice Hotels (1:2), Aer Lingus, Flying Blue, Avianca, BA, Iberia, Virgin Atlantic (1:1) |
| **Card Type ID** | wf_autograph_journey |

---

## Benefit Catalog

### benefit_key: rewards_earning_structure

```yaml
category: rewards_earning_structure
benefit_name: "Tiered Points Earning (1x-5x uncapped)"
description: "Category-based earning structure with no caps or restrictions"
details:
  - Hotels: 5x points per $1
  - Airlines: 4x points per $1
  - Rental cars: 4x points per $1
  - Dining: 4x points per $1
  - Travel/transit/streaming/phone: 3x points per $1
  - All other purchases: 1x point per $1
  - No annual spending caps
  - No category rotation
  - Points pool separate from other Wells Fargo cards (non-pooled)
```

### benefit_key: hotel_category_earning

```yaml
category: hotel_category_earning
benefit_name: "5x Points on Hotels"
description: "Highest earning category for lodging purchases"
details:
  - 5x points per dollar on all hotel purchases
  - Applies to major chains and independent hotels
  - Includes vacation rentals (VRBO, Airbnb if charged as hotels)
  - No blackout dates or restrictions
  - Can be booked directly or through third-party platforms
  - No cap on total hotels earning
```

### benefit_key: airline_category_earning

```yaml
category: airline_category_earning
benefit_name: "4x Points on Airlines"
description: "Elevated earning on airline tickets"
details:
  - 4x points per dollar on all airline purchases
  - Applies to tickets purchased directly from airlines
  - Also applies to tickets purchased through OTAs (Kayak, Expedia, etc.)
  - Includes baggage fees, seat upgrades, change fees paid with card
  - No annual cap
```

### benefit_key: rental_car_earning

```yaml
category: rental_car_earning
benefit_name: "4x Points on Rental Cars"
description: "Enhanced earning on vehicle rentals"
details:
  - 4x points per dollar for all car rental companies
  - Covers Economy through Premium/Luxury rentals
  - Includes insurance add-ons and equipment rentals (GPS, etc.)
  - Applies to direct bookings and third-party platforms
  - No spending caps
```

### benefit_key: dining_category_earning

```yaml
category: dining_category_earning
benefit_name: "4x Points on Dining"
description: "Premium earning on restaurant and food service"
details:
  - 4x points per dollar at restaurants, cafes, bars
  - Includes meal delivery services (DoorDash, Uber Eats, etc.)
  - Fast casual and fine dining both eligible
  - Worldwide applicability
  - No annual dining bonus cap
```

### benefit_key: travel_transit_streaming

```yaml
category: travel_transit_streaming
benefit_name: "3x Points on Travel/Transit/Streaming/Phone"
description: "Bonus points on diverse service categories"
details:
  - 3x points per dollar on:
    * Gas stations
    * Parking and tolls
    * Public transportation (buses, trains, ferries)
    * Taxis and rideshare (Uber, Lyft)
    * Streaming services (Netflix, Spotify, Disney+, etc.)
    * Phone services (cell phone, internet, landline)
  - No caps or limits
  - Includes international equivalents
```

### benefit_key: welcome_bonus

```yaml
category: welcome_bonus
benefit_name: "60,000 Points Welcome Bonus"
description: "Introductory bonus for new cardholders"
details:
  - 60,000 bonus points awarded upon meeting $4,000 spend requirement
  - Spend threshold: $4,000 within 3 months of account opening
  - Equivalent to approximately $600-750 in travel value (typical 1-1.25 cpp)
  - Points appear in account upon requirement fulfillment
  - Eligible for transfer to partner programs
```

### benefit_key: annual_airline_credit

```yaml
category: annual_airline_credit
benefit_name: "$50 Annual Airline Credit"
description: "Annual statement credit for airline purchases"
details:
  - $50 statement credit per calendar year
  - Applies to base airline ticket purchases only
  - Must meet minimum threshold: credit only posts for airline charges $50+
  - Eligible airlines: All major carriers (United, Delta, American, Southwest, etc.)
  - Includes international carriers
  - Non-transferable; credit forfeits if unused
  - Automatically renewed each calendar year
```

### benefit_key: transfer_partners_premium

```yaml
category: transfer_partners_premium
benefit_name: "Transfer Partners (6 programs at variable rates)"
description: "Ability to transfer points to airline and hotel loyalty programs"
details:
  - Points can be transferred to:
    * Aer Lingus AerClub (1:1)
    * Flying Blue (Air France/KLM) (1:1)
    * Avianca LifeMiles (1:1)
    * British Airways Avios (1:1)
    * Iberia Plus (1:1)
    * Virgin Atlantic Flying Club (1:1)
    * Choice Hotels (1:2 - unfavorable for redemption)
  - Transfer minimums: typically 1,000 points
  - Processing: Usually instantaneous to 24 hours
  - No transfer fees
  - Key advantage: Direct 1:1 transfers to valuable European carriers
```

### benefit_key: cell_phone_protection

```yaml
category: cell_phone_protection
benefit_name: "Cell Phone Protection ($1,000/claim with $25 deductible)"
description: "Coverage for eligible cell phones damaged, lost, or stolen"
details:
  - Up to $1,000 per claim for covered phones
  - Standard $25 deductible per incident
  - Maximum 2 claims per 12-month period ($2,000 annual protection)
  - Covers accidental damage, theft, and mechanical failure
  - Applies to phones purchased with card or monthly service charged to card
  - Documentation required: police report (theft), proof of purchase, damage photos
```

### benefit_key: trip_cancellation_insurance

```yaml
category: trip_cancellation_insurance
benefit_name: "Trip Cancellation Insurance ($15,000/person, $20K/year)"
description: "Reimbursement for prepaid trip costs due to covered cancellations"
details:
  - Up to $15,000 per person per trip
  - Maximum $20,000 annual aggregate across all trips
  - Covers prepaid trip costs if trip cancelled due to:
    * Sudden illness or injury
    * Unexpected death in family
    * Inclement weather preventing travel
    * Documented business emergency
  - Does NOT cover:
    * Pre-existing conditions
    * Travel warnings/government advisories
    * Voluntary cancellations
    * Known hazardous weather at time of booking
  - Ticket or travel arrangement must be charged to card
  - Filing deadline: 90 days from cancellation date
  - Documentation: medical records, death certificate, airline cancellation notice, etc.
```

### benefit_key: collision_damage_waiver

```yaml
category: collision_damage_waiver
benefit_name: "Collision Damage Waiver (CDW) - $50K Primary/Secondary"
description: "Car rental damage coverage with dual coverage depending on location"
details:
  - Primary coverage (applies when traveling internationally): $50,000 limit
  - Secondary coverage (applies domestically): $50,000 limit
  - Domestic coverage availability: First 15 days of rental
  - International coverage availability: Full rental period (up to 31 days)
  - Covers collision, theft, vandalism of rental vehicle
  - Coverage applies to most major rental companies
  - Restrictions: Does not cover high-value or exotic vehicles, or certain countries
  - Must decline rental company's waiver to activate this benefit
  - No deductible
```

### benefit_key: lost_baggage_reimbursement

```yaml
category: lost_baggage_reimbursement
benefit_name: "Lost Baggage Reimbursement ($3,000/trip)"
description: "Coverage for airline-lost or delayed baggage"
details:
  - Up to $3,000 reimbursement per trip
  - Covers baggage lost, damaged, or delayed by airline 12+ hours
  - Only applies when ticket purchased with card
  - Reimburses reasonable replacement items and essentials
  - Does not cover:
    * Valuables or jewelry
    * Electronics (unless essential)
    * Items subject to airline liability limits already exceeded
  - Filing deadline: 90 days
  - Documentation: airline claim number, airline response, itemized replacements
```

### benefit_key: no_foreign_transaction_fee

```yaml
category: no_foreign_transaction_fee
benefit_name: "No Foreign Transaction Fees"
description: "Zero fees on international purchases and cash advances"
details:
  - 0% foreign transaction fee on all non-US purchases
  - Applies to all merchant transactions globally
  - Removes markup on currency conversion
  - Particularly valuable for international travel and online foreign merchants
  - Compounds savings on frequent international spending
```

### benefit_key: visa_signature_concierge

```yaml
category: visa_signature_concierge
benefit_name: "Visa Signature Concierge Services"
description: "24/7 travel and lifestyle assistance"
details:
  - Travel booking and recommendations
  - Restaurant and event reservations
  - Ticket procurement assistance
  - Emergency services coordination
  - Medical and legal referrals
  - No direct cost (third-party services may have fees)
```

---

## Points Multipliers

| Category | Multiplier | Details |
|----------|-----------|---------|
| **Hotels** | 5x points | Highest earning category; applies to all hotel bookings |
| **Airlines** | 4x points | All airline ticket purchases, directly or via OTA |
| **Rental Cars** | 4x points | All car rental companies and platforms |
| **Dining** | 4x points | Restaurants, cafes, meal delivery services worldwide |
| **Travel/Transit** | 3x points | Gas, parking, tolls, public transit, rideshare |
| **Streaming/Phone** | 3x points | Streaming services, cell phone, internet bills |
| **All Other Purchases** | 1x point | Default rate for non-bonus categories |
| **No Category Caps** | Unlimited | No annual limits on any category |

---

## Insurance & Protection Coverage

| Coverage Type | Limit | Deductible | Terms |
|---------------|-------|-----------|-------|
| **Trip Cancellation** | $15K/person, $20K/yr | $0 | Covered conditions only (illness, death, weather) |
| **Trip Delay** | None | N/A | Not offered on this card |
| **Lost Baggage** | $3,000/trip | $0 | Airline-lost or 12+ hr delayed luggage |
| **CDW (Primary Intl)** | $50,000 | $0 | International rentals, full period (31 days max) |
| **CDW (Secondary Domestic)** | $50,000 | $0 | Domestic rentals, 15 days max |
| **Cell Phone Protection** | $1,000/claim | $25 | 2 claims/year max ($2,000/yr total) |
| **Purchase Protection** | None | N/A | Not offered on this card |
| **Extended Warranty** | None | N/A | Not offered on this card |
| **Emergency Medical** | None | N/A | Not offered on this card |

---

## Competitor Map

### Direct Competitors

| Card | Annual Fee | Top Earn Rate | Welcome Bonus | Transfer Partners | Airline Credit |
|------|-----------|---------------|---------------|------------------|----------------|
| **Wells Fargo Autograph Journey** | $95 | 5x hotels, 4x flights/dining | 60K points | 6 at 1:1 | $50 annual |
| **Chase Sapphire Preferred** | $95 | 3x travel/dining, 2x other | 60K UR | 35+ partners | None |
| **American Express Gold** | $250 | 4x flights/dining, 1x other | 75K MR | 15+ partners | $300 annual |
| **Capital One Venture** | $95 | 2x all (5x via portal) | 75K miles + $250 | 22+ at 1:1 | None |
| **Citi Premier** | $95 | 3x travel/dining, 1x other | 60K TY Points | 15+ partners | $100 annual |

### Value Positioning

- **Sweet Spot:** Mid-tier travel rewards card with strong earning on hotels and dining
- **Key Advantages:**
  - Excellent hotel earning rate (5x, highest in mid-tier)
  - Strong dining earning (4x, tied for highest)
  - Trip Cancellation insurance (valuable for advance bookings)
  - $50 annual airline credit (offsets ~52% of annual fee)
  - No foreign transaction fees
  - Clear category structure (no rotating categories)

- **Key Disadvantages:**
  - Smaller transfer partner network (6 vs. 35+ for competitors)
  - No lounge access (vs. Sapphire Reserve or Amex Platinum)
  - Trip Cancellation limited compared to premium cards
  - No purchase protection or extended warranty
  - Lower welcome bonus than Capital One ($60K vs. $75K)

---

## Tracking Rules

### Earning Tracking

```yaml
earning_rules:
  category_structure:
    - category: "Hotels"
      rate: 5x
      applies_to: "All hotel accommodations, vacation rentals"
      notes: "Highest earning category"

    - category: "Airlines"
      rate: 4x
      applies_to: "All airline tickets"
      notes: "Direct bookings and OTA purchases both eligible"

    - category: "Rental Cars"
      rate: 4x
      applies_to: "All car rental companies"
      notes: "Includes fees and insurance add-ons"

    - category: "Dining"
      rate: 4x
      applies_to: "Restaurants, cafes, meal delivery"
      notes: "Worldwide; includes DoorDash, Uber Eats"

    - category: "Travel/Transit/Streaming/Phone"
      rate: 3x
      applies_to: "Gas, parking, tolls, transit, rideshare, streaming, phone"
      notes: "Broad convenience category"

    - category: "All Other Purchases"
      rate: 1x
      applies_to: "Everything not listed above"
      notes: "Default rate"

  earning_exclusions:
    - "Cash advances"
    - "Balance transfers"
    - "Fees and interest"
    - "Annuities and insurance"

  no_caps: "True"
  category_rotation: "False (fixed structure)"
```

### Credit Tracking

```yaml
credit_tracking:
  airline_credit:
    - description: "$50 annual airline credit"
    - reset_period: "Calendar year (Jan 1 - Dec 31)"
    - minimum_purchase: "$50 (credit only posts if single charge is $50+)"
    - eligible_charges:
        - "Base airline tickets"
        - "Seat upgrades"
        - "Baggage fees"
        - "Airline change fees"
    - airline_restrictions: "All major US and international carriers eligible"
    - use_it_or_lose_it: "True"
```

### Insurance Claim Tracking

```yaml
claim_rules:
  trip_cancellation:
    - max_claims_per_year: "Unlimited (subject to annual aggregate)"
    - annual_aggregate_limit: "$20,000"
    - per_person_limit: "$15,000"
    - filing_deadline: "90 days after cancellation"
    - covered_events:
        - "Sudden illness/injury of cardholder or family"
        - "Death in immediate family"
        - "Severe weather preventing travel"
        - "Documented business emergency"
    - not_covered:
        - "Pre-existing conditions"
        - "Known weather at booking time"
        - "Travel warnings"
        - "Voluntary cancellation"
    - documentation_required:
        - "Medical records (illness/injury)"
        - "Death certificate (family death)"
        - "Weather documentation (for weather-related)"
        - "Original booking confirmation"
        - "Written cancellation notice from provider"

  lost_baggage:
    - max_claims_per_year: "Unlimited (subject to annual aggregate)"
    - per_trip_limit: "$3,000"
    - filing_deadline: "90 days"
    - coverage_trigger: "Airline loses baggage or delays 12+ hours"
    - documentation_required:
        - "Airline claim number"
        - "Airline written response"
        - "Itemized list of lost items with receipts"
        - "Proof ticket purchased with card"
        - "Baggage tags (if available)"

  cell_phone:
    - max_claims_per_year: 2
    - per_claim_limit: "$1,000"
    - annual_aggregate: "$2,000"
    - deductible: "$25 per claim"
    - coverage_events:
        - "Accidental damage"
        - "Theft"
        - "Mechanical failure"
    - filing_deadline: "90 days"
    - documentation_required:
        - "Proof of purchase"
        - "Police report (for theft)"
        - "Repair estimate or evidence of loss"
        - "Proof phone service charged to card"
```

### Partner Transfer Tracking

```yaml
transfer_tracking:
  transfer_mechanics:
    - partners:
        - name: "Aer Lingus AerClub"
          ratio: "1:1"
        - name: "Flying Blue (Air France/KLM)"
          ratio: "1:1"
        - name: "Avianca LifeMiles"
          ratio: "1:1"
        - name: "British Airways Avios"
          ratio: "1:1"
        - name: "Iberia Plus"
          ratio: "1:1"
        - name: "Virgin Atlantic Flying Club"
          ratio: "1:1"
        - name: "Choice Hotels"
          ratio: "1:2"
    - minimum_transfer: "1,000 points typical"
    - processing_time: "Instantaneous to 24 hours"
    - reversibility: "No—transfers permanent once posted"
    - fee: "None"
```

---

## Valuation Analysis

### Value per Point

```yaml
valuation_methodology:
  base_valuation: "$0.01 per point (1 cpp)"

  redemption_scenarios:
    cash_out:
      - value: "$0.005 per point"
      - method: "Direct statement credit (if available)"
      - notes: "Typically not offered by Wells Fargo; use transfer partners instead"

    airline_transfer:
      - value: "$0.012-0.018 per point"
      - method: "Transfer to partner airlines at 1:1 ratio"
      - partners: "Aer Lingus, Flying Blue, Avianca, BA, Iberia, Virgin Atlantic"
      - sweet_spot: "International economy or domestic business awards"

    hotel_transfer:
      - value: "$0.008-0.012 per point"
      - method: "Choice Hotels at 1:2 ratio (less favorable)"
      - notes: "Choice conversion is unfavorable; use airline transfers instead"

    portal_redemption:
      - value: "$0.007-0.009 per point"
      - method: "Redeem through Wells Fargo travel portal (not recommended)"

  breakeven_analysis:
    annual_fee: 95
    airline_credit: 50
    net_annual_fee: 45
    welcome_bonus_points: 60000
    welcome_bonus_value_at_1cpp: 600
    first_year_total_value: 700
    net_gain_first_year: 655
    breakeven_annual_spending: "$4,500"
    calculation: "Net annual fee ($45) ÷ bonus point earning ($45 fee ÷ average category earn rate) = approximately $4,500"
```

### Annual Value Scenarios

```yaml
annual_value_scenarios:
  low_usage:
    annual_spend: "$10,000"
    points_earned: 10000
    notes: "Mix of categories; estimate 1.5x average rate across all purchases"
    value_at_1cpp: 150
    annual_airline_credit: 50
    total_value: 200
    net_gain: 105
    roi_percent: 111
    suitable_for: "Minimal travel; limited benefit realization"

  medium_usage:
    annual_spend: "$30,000"
    breakdown:
      - "Hotels: $5,000 (5x) = 25,000 points"
      - "Airlines: $5,000 (4x) = 20,000 points"
      - "Dining: $5,000 (4x) = 20,000 points"
      - "Other: $15,000 (1x) = 15,000 points"
    total_points: 80000
    value_at_1.2cpp: 960
    annual_airline_credit: 50
    total_value: 1010
    net_gain: 915
    roi_percent: 963
    suitable_for: "Regular business travelers and frequent diners"

  high_usage:
    annual_spend: "$75,000"
    breakdown:
      - "Hotels: $12,000 (5x) = 60,000 points"
      - "Airlines: $15,000 (4x) = 60,000 points"
      - "Dining: $12,000 (4x) = 48,000 points"
      - "Other: $36,000 (1x) = 36,000 points"
    total_points: 204000
    value_at_1.3cpp: 2652
    annual_airline_credit: 50
    lounge_costs_saved: 0
    total_value: 2702
    net_gain: 2607
    roi_percent: 2744
    suitable_for: "Heavy business travelers; frequent international trips"
```

### Comparison to Category

```yaml
competitive_analysis:
  vs_sapphire_preferred:
    annual_fee: "Equal ($95)"
    hotel_earning: "Wells Fargo 5x vs. Chase 3x (WF wins)"
    dining_earning: "Wells Fargo 4x vs. Chase 3x (WF wins)"
    transfer_partners: "Chase 35+ vs. Wells Fargo 6 (Chase wins significantly)"
    travel_credit: "Wells Fargo $50 airline vs. Chase $50 (equal)"
    trip_cancellation: "Both offered ($15K)"
    verdict: "WF better for hotel/dining focus; Chase better for flexibility and transfer options"

  vs_capital_one_venture:
    annual_fee: "Equal ($95)"
    base_earning: "Wells Fargo tiered (1-5x) vs. Capital One 2x flat"
    hotel_earning: "Wells Fargo 5x vs. Capital One 2x (WF wins)"
    complexity: "Wells Fargo more complex; Capital One simpler"
    transfer_partners: "Capital One 22 vs. Wells Fargo 6 (Capital One wins)"
    airline_credit: "Wells Fargo $50 vs. Capital One $0 (WF wins)"
    verdict: "WF better for hotel/dining travelers; Capital One better for simplicity and transfer options"

  vs_amex_gold:
    annual_fee_delta: "-$155 (WF $95 vs. Amex $250)"
    earning: "Comparable; Amex 4x flights/dining, WF 4x flights/dining"
    airline_credit: "Amex $300 vs. WF $50 (Amex wins)"
    transfer_partners: "Amex 15 vs. WF 6 (Amex wins)"
    verdict: "WF better for budget-conscious; Amex better for frequent travelers with higher spend"
```

### Expected Return on Investment (ROI)

| Spending Pattern | Annual Spend | Points Earned | Value Generated | Net After Fee | ROI % |
|------------------|--------------|---------------|-----------------|---------------|-------|
| Minimal | $10,000 | 10,000+ | $200 | $105 | 111% |
| Moderate | $30,000 | 80,000+ | $1,010 | $915 | 963% |
| Heavy | $75,000+ | 204,000+ | $2,702+ | $2,607+ | 2,744%+ |

**Note:** ROI calculations assume:
- Base valuation of 1.0 cpp with variations to 1.3 cpp depending on redemption method
- Hotel earning at 5x drives up average point value
- Airline credit ($50) nets $55 value after fee
- Transfer to partner airlines yields 1.2-1.3 cpp
- Actual returns depend on:
  - Distribution of spending across categories
  - Ability to use airline credit
  - Transfer partner award availability
  - Redemption timing and strategy
