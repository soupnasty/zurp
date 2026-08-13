# Chase Sapphire Preferred — Benefit Catalog & Competitor Map

*Last verified: 2026-08-13*

Implementation-ready data for the Zurp insight engine. Format matches CSR and Amex Gold catalogs.

---

## Benefit Catalog

### Hard Credits & Partner Benefits

```
benefit_key:          csp_doordash_dashpass
card_type:            csp
benefit_name:         DoorDash DashPass Membership
benefit_partner:      DoorDash
benefit_type:         subscription
annual_value:         120
period_type:          annual
period_value:         120
max_per_period:       120
activation_required:  true
activation_method:    portal (add CSP as default payment in DoorDash, click activation button)
expiration_date:      2027-12-31
trackable_via_plaid:  false (DashPass is fee waiver, not a statement credit)
reset_basis:          activation_date (12 months from activation)
rollover:             n/a
notes:                Identical to CSR DashPass. Must use CSP for checkout on DashPass-eligible orders.
                      $0 delivery fees + lower service fees on orders over $12.
                      Benefit is per-account — one DashPass per DoorDash account per phone number.
                      Same login credentials must be used on DoorDash and Caviar.
```

```
benefit_key:          csp_doordash_nonrestaurant_promo
card_type:            csp
benefit_name:         DoorDash Monthly Non-Restaurant Promo
benefit_partner:      DoorDash
benefit_type:         in_app_discount (NOT a statement credit)
annual_value:         120
period_type:          monthly
period_value:         10
max_per_period:       10
activation_required:  true (must have DashPass activated first)
activation_method:    auto (appears in DoorDash checkout after DashPass activation)
expiration_date:      2027-12-31
trackable_via_plaid:  false (applied as in-app discount at checkout, NOT a Chase statement credit)
reset_basis:          calendar_month (resets 1st of each month)
rollover:             false
notes:                ONE $10 promo per month (CSR gets TWO).
                      Non-restaurant only: groceries, convenience, retail, DashMart.
                      If full $10 not used on single order, remaining is forfeited.
                      Cannot be combined with other promo codes (CAN combine with other order-level discounts).
                      Must toggle on at checkout. Must use CSP as payment method.
                      Detection: infer from DoorDash non-restaurant transaction presence. Cannot confirm promo was applied.
                      SAME detection challenge as Amex Gold's Uber Cash.
```

```
benefit_key:          csp_hotel_credit
card_type:            csp
benefit_name:         $100 Annual Chase Travel Hotel Credit
benefit_partner:      Chase Travel
benefit_type:         statement_credit
annual_value:         100
period_type:          annual
period_value:         100
max_per_period:       100
activation_required:  false
activation_method:    auto (applied automatically on qualifying hotel booking)
expiration_date:      null (permanent card benefit)
trackable_via_plaid:  true (appears as statement credit from Chase Travel)
reset_basis:          anniversary_year (account open date through next 12 billing cycles)
rollover:             false
notes:                Increased from $50 to $100 in the June 2026 card refresh
                      (existing cardholders convert October 1, 2026).
                      Must book hotel through Chase Travel portal (NOT direct with hotel or OTA).
                      Statement credit posts within 1-2 billing cycles (often within 2 days).
                      First $100 in qualifying hotel purchases do NOT earn rewards points.
                      No minimum spend — a $45 booking gets $45 credit.
                      Unused amount forfeited at anniversary reset.
                      Must be initiated from CSP-specific portal view.
                      Plaid signal: credit transaction up to ~$100 from CHASE TRAVEL or similar merchant name.
```

```
benefit_key:          csp_global_entry
card_type:            csp
benefit_name:         Global Entry / TSA PreCheck Credit
benefit_partner:      Chase
benefit_type:         statement_credit
annual_value:         30 (amortized: $120 every 4 years)
period_type:          quadrennial
period_value:         120
max_per_period:       120
activation_required:  false
activation_method:    auto (applied when application fee is charged to CSP)
expiration_date:      null (permanent card benefit)
trackable_via_plaid:  true (one-time charge from CBP/TSA + statement credit)
reset_basis:          4-year cycle from first use
rollover:             n/a
notes:                NEW in the June 2026 card refresh (existing cardholders convert October 1, 2026).
                      Covers Global Entry ($120), TSA PreCheck ($78-$98), or NEXUS ($50).
                      One program per 4-year cycle. Credit posts within 1-2 billing cycles.
                      No activation needed — just pay the application fee with the CSP.
                      Matches the CSR's Global Entry benefit ($120 every 4 years).
```

```
benefit_key:          csp_apple_tv
card_type:            csp
benefit_name:         Complimentary Apple TV+ Subscription (12 Months)
benefit_partner:      Apple
benefit_type:         subscription (fee waiver, NOT a statement credit)
annual_value:         156 (~$12.99/month x 12)
period_type:          subscription (one-time 12-month window)
period_value:         156
max_per_period:       156
activation_required:  true
activation_method:    portal (activate via Chase website/app; links your Apple ID)
expiration_date:      2026-12-31 (activation deadline — must activate by 12/31/2026)
trackable_via_plaid:  false (subscription waiver — infer from absence of Apple TV+ charge)
reset_basis:          n/a (one-time, 12 months from activation)
rollover:             n/a
notes:                NEW in the June 2026 card refresh. Activate by December 31, 2026
                      to receive the full 12 months. Direct subscription waiver — once
                      activated, Apple won't charge for 12 months. An existing paid
                      subscription is automatically suspended. Does not cover Apple One
                      bundles. Individual plan only.
```

```
benefit_key:          csp_anniversary_bonus
card_type:            csp
benefit_name:         10% Anniversary Points Bonus — DISCONTINUED
benefit_partner:      Chase
benefit_type:         points_bonus
annual_value:         0 (was: variable, 10% of total points earned as bonus)
period_type:          annual
period_value:         variable
max_per_period:       null (uncapped)
activation_required:  false
activation_method:    auto
expiration_date:      DISCONTINUED as of 2026-06-15 (June 2026 refresh; final bonus posts Jan 2027)
trackable_via_plaid:  false (points deposit, not a transaction)
reset_basis:          anniversary_year
rollover:             n/a
notes:                DISCONTINUED — eliminated in the June 2026 card refresh. The final
                      anniversary bonus posts in January 2027. Entry retained for history.
                      Was UNIQUE TO CSP — CSR never had this benefit.
                      Was calculated on ALL purchases for the previous anniversary year.
                      Example: $25,000 annual spend → 2,500 bonus points.
                      Points deposited to UR account on anniversary date.
                      Not visible as a Plaid transaction.
```

### Points Multipliers

```
benefit_key:          csp_5x_chase_travel
card_type:            csp
benefit_name:         5x on Chase Travel Purchases
benefit_partner:      Chase Travel
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  false (Plaid cannot distinguish Chase Travel portal bookings from direct bookings)
reset_basis:          n/a
rollover:             n/a
notes:                Excludes hotel purchases that qualify for the $100 hotel credit.
                      Only applies to purchases made through Chase Travel portal.
                      CANNOT be used for A1 insights because Plaid can't detect booking channel.
```

```
benefit_key:          csp_3x_dining
card_type:            csp
benefit_name:         3x on Dining
benefit_partner:      null (category-wide)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null (no spending cap)
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                Includes sit-down, fast food, fine dining, eligible delivery/takeout.
                      Does NOT include food/drink inside stadiums, hotels, casinos, theme parks,
                      or grocery/department stores UNLESS merchant is coded as restaurant.
                      Same rate as CSR (3x). Lower than Gold (4x).
                      Plaid signal: personal_finance_category FOOD_AND_DRINK > RESTAURANT.
```

```
benefit_key:          csp_3x_streaming
card_type:            csp
benefit_name:         3x on Select Streaming Services
benefit_partner:      null (category-wide, qualifying services only)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  true (merchant_name match against qualifying list)
reset_basis:          n/a
rollover:             n/a
notes:                UNIQUE TO CSP — CSR does not earn bonus points on streaming.
                      Qualifying services (confirmed from Chase FAQ, Dec 2025):
                        Apple Music, Apple TV+, Disney+, ESPN+, Fubo TV, Hulu, Max,
                        Netflix, Pandora, Paramount+, Peacock, Showtime, SiriusXM,
                        Sling, Spotify, Vudu, YouTube Premium, YouTube TV
                      NOT qualifying: Crunchyroll, FloSports, DirecTV Stream, Starz.
                      Only direct subscriptions qualify — purchases through app store bundles may not code correctly.
                      High-cost services (YouTube TV $73, Sling $40-55, Fubo $80-100) generate meaningful points value.
```

```
benefit_key:          csp_3x_online_grocery
card_type:            csp
benefit_name:         3x on Online Grocery Purchases
benefit_partner:      null (category-wide with exclusions)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  partial (Plaid category match but exclusions hard to enforce)
reset_basis:          n/a
rollover:             n/a
notes:                EXCLUDES: Target, Walmart, and wholesale clubs (Costco, Sam's Club, BJ's).
                      Includes online pickup/delivery from grocery stores and meal kit services.
                      "Online" is key — in-store grocery purchases do NOT qualify for 3x.
                      Instacart: likely qualifies if merchant codes as grocery, NOT if coded as Instacart.
                      Amazon Fresh: unclear — may code as Amazon, not grocery.
                      Plaid signal: personal_finance_category FOOD_AND_DRINK > GROCERIES
                      with merchant_name exclusion list for Target, Walmart, Costco, Sam's Club, BJ's.
```

```
benefit_key:          csp_3x_gas_ev
card_type:            csp
benefit_name:         3x on Gas & EV Charging
benefit_partner:      null (category-wide)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                NEW in the June 2026 card refresh (existing cardholders convert October 1, 2026).
                      Covers gas stations and EV charging.
                      Plaid signal: personal_finance_category TRANSPORTATION > GAS.
```

```
benefit_key:          csp_3x_vacation_rentals
card_type:            csp
benefit_name:         3x on Vacation Home Rentals
benefit_partner:      null (merchant-matched: Airbnb, VRBO)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  true (merchant_name match)
reset_basis:          n/a
rollover:             n/a
notes:                NEW in the June 2026 card refresh — vacation home rentals earn 3x,
                      up from the 2x general travel rate.
                      Plaid signal: merchant_name "AIRBNB" or "VRBO".
```

```
benefit_key:          csp_2x_travel
card_type:            csp
benefit_name:         2x on Other Travel
benefit_partner:      null (category-wide)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                Covers: airfare, hotels, car rentals, trains, buses, tolls, parking, cruises.
                      Base travel rate — Chase Travel portal purchases earn 5x instead,
                      and vacation home rentals (Airbnb/VRBO) earn 3x as of June 2026.
                      Plaid signal: personal_finance_category TRAVEL.
```

```
benefit_key:          csp_1x_other
card_type:            csp
benefit_name:         1x on Everything Else
benefit_partner:      null
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                Base earn rate. All purchases not captured by 5x/3x/2x categories.
                      Used as baseline for competitor redirect dollar_impact calculations.
```

### Time-Limited Partner Benefits

```
benefit_key:          csp_5x_lyft
card_type:            csp
benefit_name:         5x on Lyft Rides
benefit_partner:      Lyft
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false (just use CSP in Lyft app)
activation_method:    null
expiration_date:      2027-09-30
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                5x TOTAL points (4 bonus on top of 1x base — non-Lyft rideshare earns 1x).
                      Qualifying: rideshare, bike/scooter rides, subscription/membership products.
                      NOT qualifying: gift cards, car rentals, vehicle service centers.
                      CSP does NOT get the $10 monthly Lyft credit (CSR only).
                      DashPass members (CSP qualifies) get 5% off on-demand Lyft rides and
                      10% off scheduled airport rides, up to 4 per month combined.
                      Plaid signal: merchant_name "LYFT".
```

```
benefit_key:          csp_5x_peloton
card_type:            csp
benefit_name:         5x on Peloton Equipment ($150+)
benefit_partner:      Peloton
benefit_type:         points_multiplier
annual_value:         variable (max 25,000 bonus points = ~$250 at 1.0cpp)
period_type:          per_purchase
period_value:         null
max_per_period:       25000 (bonus points cap across all qualifying purchases)
activation_required:  false
activation_method:    null
expiration_date:      2027-12-31
trackable_via_plaid:  true
reset_basis:          n/a (lifetime cap, not annual)
rollover:             n/a
notes:                5x TOTAL on equipment/accessories over $150 (CSR gets 10x).
                      Cap: 25,000 total bonus points across all qualifying purchases.
                      CSP does NOT get the $10/mo Peloton membership credit (CSR only).
                      Low frequency benefit — most users buy Peloton equipment once.
                      Not meaningful for recurring insight generation.
                      Plaid signal: merchant_name "PELOTON".
```

### Insurance & Protection

```
benefit_key:          csp_trip_cancellation
card_type:            csp
benefit_name:         Trip Cancellation/Interruption Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0 (no annual value; per-event)
period_type:          per_event
period_value:         10000 (per person)
max_per_period:       40000 (per year)
activation_required:  false
activation_method:    null (automatic when trip is charged to CSP)
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Up to $10,000/person, $20,000/trip, $40,000/year.
                      Covers: sickness, severe weather, other covered situations.
                      SIGNIFICANT benefit — Amex Gold does NOT have trip cancellation insurance.
                      Key Compare page differentiator vs Gold.
```

```
benefit_key:          csp_auto_rental_cdw
card_type:            csp
benefit_name:         Auto Rental Collision Damage Waiver
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         60000
max_per_period:       null
activation_required:  false
activation_method:    null (decline rental agency insurance, charge to CSP)
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                PRIMARY coverage (not secondary). Up to $60,000 for collision/theft.
                      Must decline rental agency insurance.
                      CRITICAL ADVANTAGE over Gold Card: CSP is PRIMARY, Gold is SECONDARY ($50K).
                      Primary means it pays first, before your personal auto insurance.
                      Key Compare page differentiator.
```

```
benefit_key:          csp_trip_delay
card_type:            csp
benefit_name:         Trip Delay Reimbursement
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         500
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Up to $500/person for delays over 12 hours or requiring overnight stay.
                      Covers meals, lodging, toiletries.
                      Higher than Gold ($300/trip, max 2 claims per 12 months).
```

```
benefit_key:          csp_baggage_delay
card_type:            csp
benefit_name:         Baggage Delay Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         500 ($100/day for 5 days)
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Up to $100/day for 5 days for essentials when baggage delayed 6+ hours.
                      Gold has different structure: $1,250 carry-on / $500 checked (excess of carrier).
```

```
benefit_key:          csp_lost_luggage
card_type:            csp
benefit_name:         Lost Luggage Reimbursement
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         3000
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Up to $3,000/person for lost or damaged luggage.
```

```
benefit_key:          csp_purchase_protection
card_type:            csp
benefit_name:         Purchase Protection
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         500
max_per_period:       50000 (per account)
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Up to $500/item, $50,000/account. Covers damage/theft within 120 days.
                      Gold is slightly better per-occurrence ($1,000) but shorter window (90 days).
```

```
benefit_key:          csp_extended_warranty
card_type:            csp
benefit_name:         Extended Warranty Protection
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Extends manufacturer warranty by 1 year on warranties ≤ 3 years.
                      Gold covers warranties ≤ 5 years with $10K/item cap — slightly more generous.
```

### Other Benefits

```
benefit_key:          csp_no_ftf
card_type:            csp
benefit_name:         No Foreign Transaction Fees
benefit_partner:      null
benefit_type:         fee_waiver
annual_value:         variable (saves ~3% on international purchases)
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  true (can detect international transactions)
reset_basis:          n/a
rollover:             n/a
notes:                Saves ~3% foreign transaction fee on purchases abroad or in foreign currencies.
                      Standard across premium cards (CSR, Gold also have this).
                      Not a differentiator on Compare page.
```

```
benefit_key:          csp_transfer_partners
card_type:            csp
benefit_name:         Ultimate Rewards Transfer Partners
benefit_partner:      14 airlines + hotel programs
benefit_type:         access
annual_value:         variable (enables up to ~1.8cpp upside redemption value)
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Airlines: United, Southwest, British Airways, Air France/KLM, Singapore Airlines,
                      Virgin Atlantic, Air Canada Aeroplan, Emirates, JetBlue, Iberia, and others.
                      Hotels: Hyatt (4:3 for CSP), Marriott (1:1), IHG (1:1).
                      Airline transfers are 1:1. HYATT DEVALUED for CSP: 4:3 ratio
                      (new applications 6/15/2026; existing cardholders October 1, 2026).
                      CSR keeps Hyatt at 1:1 — this is now a CSR-vs-CSP differentiator.
                      KEY DIFFERENTIATOR vs Gold: Chase has United and Southwest (Amex does not).
                      Amex has Delta (Chase does not).
                      Transfer partner overlap matters for the Compare page recommendation.
```

### Benefit Catalog Summary

| # | Benefit Key | Type | Annual Value | Period | Trackable | Enrollment |
|---|---|---|---|---|---|---|
| 1 | csp_doordash_dashpass | subscription | $120 | Annual | No (fee waiver) | Yes |
| 2 | csp_doordash_nonrestaurant_promo | in_app_discount | $120 | Monthly | No (in-app) | Yes (DashPass first) |
| 3 | csp_hotel_credit | statement_credit | $100 | Annual (anniversary) | Yes | No |
| 4 | csp_global_entry | statement_credit | $120 every 4 yrs | Quadrennial | Yes | No |
| 5 | csp_apple_tv | subscription | ~$156 (12 mo, one-time) | One-time (activate by 12/31/2026) | No (fee waiver) | Yes |
| 6 | csp_anniversary_bonus | points_bonus | DISCONTINUED (June 2026) | — | No (points) | No |
| 7 | csp_5x_chase_travel | points_multiplier | Variable | Ongoing | No (portal) | No |
| 8 | csp_3x_dining | points_multiplier | Variable | Ongoing | Yes | No |
| 9 | csp_3x_streaming | points_multiplier | Variable | Ongoing | Yes | No |
| 10 | csp_3x_online_grocery | points_multiplier | Variable | Ongoing | Partial | No |
| 11 | csp_3x_gas_ev | points_multiplier | Variable | Ongoing | Yes | No |
| 12 | csp_3x_vacation_rentals | points_multiplier | Variable | Ongoing | Yes | No |
| 13 | csp_2x_travel | points_multiplier | Variable | Ongoing | Yes | No |
| 14 | csp_1x_other | points_multiplier | Variable | Ongoing | Yes | No |
| 15 | csp_5x_lyft | points_multiplier | Variable | Ongoing (ends 9/2027) | Yes | No |
| 16 | csp_5x_peloton | points_multiplier | Variable | Per purchase (ends 12/2027) | Yes | No |
| 17 | csp_trip_cancellation | insurance | $10K/person | Per event | No | No |
| 18 | csp_auto_rental_cdw | insurance | $60K/event | Per event | No | No |
| 19 | csp_trip_delay | insurance | $500/event | Per event | No | No |
| 20 | csp_baggage_delay | insurance | $500 ($100/day) | Per event | No | No |
| 21 | csp_lost_luggage | insurance | $3K/person | Per event | No | No |
| 22 | csp_purchase_protection | insurance | $500/item | Per event | No | No |
| 23 | csp_extended_warranty | insurance | +1 year | Per event | No | No |
| 24 | csp_no_ftf | fee_waiver | Variable | Ongoing | Yes | No |
| 25 | csp_transfer_partners | access | Variable | Ongoing | No | No |

**Total: 25 benefits** (24 active — 10% anniversary bonus DISCONTINUED in the June 2026 refresh)

**Hard credits total: $340/yr** (DashPass $120 + DoorDash promo $120 + Hotel $100) plus $120/4yr Global Entry and a one-time ~$156 Apple TV+ 12-month subscription

**Points-based value (moderate spender, 1.0cpp): ~$288/yr**

**Total estimated value: ~$628/yr — Net value after $95 fee: ~$533/yr**

**Benefits requiring activation: 3** (DashPass enrollment + DoorDash promo auto-activates after DashPass + Apple TV+ activation by 12/31/2026)

---

## Competitor Map

### Entry 1: Uber Eats → DoorDash (Credit Redirect)

```
card_type:              csp
benefit_key:            csp_doordash_nonrestaurant_promo
benefit_partner:        DoorDash
competitor_merchant:    Uber Eats
plaid_merchant_pattern: UBER EATS|UBEREATS
category:               food_delivery
insight_type:           A1
dollar_signal:          $10/mo promo
notes:                  Copy: "You spent $32 on Uber Eats. DoorDash has a $10 non-restaurant promo this month — order groceries or convenience items through DoorDash to claim it."
                        Only fires if DoorDash promo appears unused this month (no DoorDash non-restaurant transactions detected).
                        Carried from CSR with identical mechanics.
```

### Entry 2: Grubhub → DoorDash (Credit Redirect)

```
card_type:              csp
benefit_key:            csp_doordash_nonrestaurant_promo
benefit_partner:        DoorDash
competitor_merchant:    Grubhub
plaid_merchant_pattern: GRUBHUB|GH\*|SEAMLESS
category:               food_delivery
insight_type:           A1
dollar_signal:          $10/mo promo
notes:                  Copy: "You spent $28 on Grubhub. Your DoorDash $10 non-restaurant promo is unused this month — switch your next order to DoorDash."
                        Same logic as Entry 1. Includes Seamless (Grubhub brand).
                        Carried from CSR.
```

### Entry 3: Postmates → DoorDash (Credit Redirect)

```
card_type:              csp
benefit_key:            csp_doordash_nonrestaurant_promo
benefit_partner:        DoorDash
competitor_merchant:    Postmates
plaid_merchant_pattern: POSTMATES
category:               food_delivery
insight_type:           A1
dollar_signal:          $10/mo promo
notes:                  Same logic as Entry 1.
                        Postmates is now fully merged into Uber Eats in most markets — this mapping may fire less often.
                        Carried from CSR.
```

### Entry 4: Uber → Lyft (Earning Rate Redirect)

```
card_type:              csp
benefit_key:            csp_5x_lyft
benefit_partner:        Lyft
competitor_merchant:    Uber (rides only, not Uber Eats)
plaid_merchant_pattern: UBER \*TRIP|UBER BV|UBER \*RIDES
category:               rideshare
insight_type:           A1 (earning rate)
dollar_signal:          4 incremental pts/$ (5x − 1x other rideshare) × 1.0cpp = 4.0¢ per dollar
notes:                  Copy: "You spent $45 on Uber this month. Lyft earns 5x points — that's 180 bonus points ($1.80) you missed."
                        Annualized example: 6 rides/mo × $45 × 12 = $3,240/yr × 4 bonus pts × $0.01 = $129.60/yr.
                        Must distinguish Uber rides from Uber Eats — only redirect rides (Uber Eats earns 3x dining, which is fine).
                        Plaid patterns: "UBER *TRIP" and "UBER BV" are ride-specific. "UBER EATS" is food-specific.
                        Time-limited: expires 9/30/2027. Urgency_score should increase as expiration approaches.
                        DashPass synergy: CSP DashPass members get 5% off Lyft rides + 10% off airport rides (mention in copy).
```

### Deferred Mappings (v2 — Require Multi-Card Visibility)

These insights fire only when Zurp can see spending on a non-CSP card. Not actionable in v1 single-card mode.

| Benefit | Competitor Context | Dollar Signal | Why Deferred |
|---|---|---|---|
| 3x streaming | Qualifying streaming service charged to non-CSP card | 2 incremental pts/$ × 1.0cpp | Requires visibility into a second card |
| 3x dining | Dining charged to non-CSP card | 2 incremental pts/$ × 1.0cpp | Requires visibility into a second card |
| 3x online grocery | Online grocery charged to non-CSP card | 2 incremental pts/$ × 1.0cpp | Requires visibility into a second card |
| 3x gas & EV charging | Gas/EV charging charged to non-CSP card | 2 incremental pts/$ × 1.0cpp | Requires visibility into a second card |

### CSR Mappings That Do NOT Apply to CSP

| CSR Benefit Partner | Why It Doesn't Apply |
|---|---|
| StubHub → Ticketmaster, AXS, SeatGeek, Vivid Seats | CSP has no StubHub credit |
| Apple Music → Spotify | CSP has no free Apple Music |
| Apple TV+ → Netflix, Hulu | Now partially applies — June 2026 refresh gave CSP a 12-month Apple TV+ subscription (activate by 12/31/2026); mapping is relevant only during that window (CSR's runs through 6/22/2027) |
| Apple Arcade → Xbox Game Pass | CSP has no free Apple Arcade |
| Peloton membership → ClassPass, Equinox | CSP has no Peloton membership credit (only equipment points) |
| Lyft credit → Uber | CSP has no $10/mo Lyft credit (only 5x points — which IS mapped above) |
| Exclusive Tables → OpenTable | CSP has no Exclusive Tables credit |
| Edit hotel → third-party hotel | CSP has no Edit hotel credit |
| Instacart → grocery delivery | CSP has no Instacart credit |

### Competitor Map Summary

| # | Competitor | → Redirect To | Category | Type | Dollar Signal (per event) | Dual-Benefit? |
|---|---|---|---|---|---|---|
| 1 | Uber Eats | DoorDash | food_delivery | A1 | $10/mo promo | No |
| 2 | Grubhub | DoorDash | food_delivery | A1 | $10/mo promo | No |
| 3 | Postmates | DoorDash | food_delivery | A1 | $10/mo promo | No |
| 4 | Uber (rides) | Lyft | rideshare | A1 | 4.0¢/$ (5x vs 1x) | No |
| **Total actionable in v1** | | | | | **4** | |

This is the smallest competitor map of the three cards. CSP's value is predominantly points-based, which limits redirect opportunities until multi-card visibility is available in v2.

### Throttling Rules

| Category | Max Frequency | Notes |
|---|---|---|
| Food delivery (Entries 1-3) | 1x/week | Avoid spamming frequent delivery users |
| Rideshare (Entry 4) | 1x/week | Same rationale |

---

## Cross-Card Comparison: Competitor Map Size

| Card | A1 Entries | A2 Entries | C0 Entries | Total | Notes |
|---|---|---|---|---|---|
| CSR | 14+ | 4+ | 0 | ~18+ | Broadest — StubHub, DoorDash, Apple subs, Lyft, Peloton |
| CSP | 4 | 0 | 0 | 4 | Smallest — DoorDash redirects + Lyft only |
| Gold | 14 | 0 | 1 | 15 | Multi-category — food delivery, coffee, grocery, flights, hotels |

---

## Tracking Rules

| Benefit | Period Reset | How Zurp Tracks | Plaid Signal | Confidence |
|---|---|---|---|---|
| DoorDash DashPass | Annual from activation | DoorDash transactions with DashPass pricing | DoorDash charges with $0 delivery (inferred) | Low |
| DoorDash $10/mo promo | Monthly (1st of month) | Presence/absence of DoorDash non-restaurant orders | DoorDash charges to non-restaurant merchants | Medium |
| $100 hotel credit | Anniversary year | Chase Travel statement credit | Credit transaction up to ~$100 from CHASE TRAVEL | High |
| $120 Global Entry credit | 4-year cycle | One-time CBP/TSA charge + statement credit | Charge from CBP/TSA/NEXUS | High |
| Apple TV+ (12 months) | One-time (activate by 12/31/2026) | Absence of Apple TV+ charge on statement | None — subscription waiver | Low |
| 10% anniversary bonus | DISCONTINUED (June 2026) | No longer generated — final bonus posts Jan 2027 | None — points deposit only | N/A |
| 5x Chase Travel | Ongoing | Cannot track — portal bookings not distinguishable | None | N/A |
| 3x dining | Ongoing | Match FOOD_AND_DRINK > RESTAURANT category | Plaid category + merchant_name | High |
| 3x streaming | Ongoing | Match known streaming merchant names | merchant_name match (18 services) | High |
| 3x online grocery | Ongoing | Match GROCERIES category − exclusion list | Category + merchant exclusion | Medium |
| 3x gas & EV | Ongoing | Match gas station / EV charging category | Plaid category | High |
| 3x vacation rentals | Ongoing | Match Airbnb/VRBO merchants | merchant_name: "AIRBNB", "VRBO" | High |
| 2x travel | Ongoing | Match TRAVEL category | Plaid category | High |
| 5x Lyft | Ongoing (ends 9/2027) | Match Lyft transactions | merchant_name: "LYFT" | High |
| 5x Peloton | Per purchase (ends 12/2027) | Match Peloton transactions >$150 | merchant_name: "PELOTON" | High |

### Anniversary Date Detection

**Approach:** Ask user during onboarding ("When did you open your card?") + validate by scanning transaction history for the ~$95 annual fee charge from Chase. The annual fee posts on the anniversary month and is a reliable signal.

**Fallback:** If no annual fee charge detected (new account, first year), use self-reported date. If user skips the question, default to calendar year and prompt again when we detect the annual fee charge.

---

## Valuation

| Component | Annual Value | Calculation Basis |
|---|---|---|
| **Hard credits** | | |
| DoorDash DashPass | $120 | If activated |
| DoorDash $10/mo promo | $120 | If used monthly |
| $100 hotel credit | $100 | If used |
| **Subtotal hard credits** | **$340** | Excludes $120/4yr Global Entry and one-time ~$156 Apple TV+ (12 mo) |
| **Points value (1.0cpp, moderate spender)** | | |
| 10% anniversary bonus | $0 | DISCONTINUED June 2026 (final bonus posts Jan 2027) |
| 3x dining incremental ($500/mo) | $120 | 12,000 pts × $0.01 |
| 3x streaming incremental ($50/mo) | $12 | 1,200 pts × $0.01 |
| 3x online grocery incremental ($200/mo) | $48 | 4,800 pts × $0.01 |
| 3x gas & EV incremental ($150/mo) | $36 | 3,600 pts × $0.01 |
| 5x Lyft incremental ($100/mo) | $48 | 4,800 pts × $0.01 (5x vs 1x rideshare) |
| 2x other travel incremental ($200/mo) | $24 | 2,400 pts × $0.01 |
| **Subtotal points value** | **~$288** | |
| **Total estimated value** | **~$628** | |
| **Annual fee** | **($95)** | |
| **Net value** | **~$533** | |

**Points valuation: 1.0cpp** (Chase Travel base rate — the flat 1.25cpp portal era ended with the Points Boost repricing; Points Boost offers up to 1.5cpp on select bookings). Transfer partners can yield up to ~1.8cpp upside (United; Hyatt now 4:3 for CSP) but require knowledge and effort.

---

## Streaming Services — Validated Plaid Merchant Patterns

| Service | Plaid merchant_name Pattern | Monthly Cost (typical) | Qualifies for 3x? |
|---|---|---|---|
| Netflix | `NETFLIX` | $6.99-$22.99 | Yes |
| Hulu | `HULU` | $9.99-$17.99 | Yes |
| Disney+ | `DISNEY PLUS\|DISNEY+` | $9.99-$15.99 | Yes |
| ESPN+ | `ESPN\+\|ESPN PLUS` | $11.99 | Yes |
| Max | `MAX\|HBO MAX` | $9.99-$20.99 | Yes |
| Paramount+ | `PARAMOUNT\+\|PARAMOUNT PLUS` | $7.99-$13.99 | Yes |
| Peacock | `PEACOCK` | $7.99-$13.99 | Yes |
| Showtime | `SHOWTIME\|SHO ` | $3.99-$11.99 | Yes |
| Apple Music | `APPLE\.COM/BILL\|APPLE MUSIC` | $10.99-$16.99 | Yes |
| Apple TV+ | `APPLE\.COM/BILL\|APPLE TV` | $12.99 | Yes |
| Spotify | `SPOTIFY` | $11.99-$17.99 | Yes |
| YouTube Premium | `GOOGLE\*YOUTUBE\|YOUTUBE PREMIUM` | $13.99 | Yes |
| YouTube TV | `GOOGLE\*YOUTUBETV\|YOUTUBE TV` | $72.99 | Yes |
| Sling | `SLING TV\|SLING` | $40-$55 | Yes |
| Fubo TV | `FUBO\|FUBOTV` | $79.99-$99.99 | Yes |
| SiriusXM | `SIRIUSXM\|SIRIUS` | $11.99-$24.99 | Yes |
| Pandora | `PANDORA` | $5.99-$10.99 | Yes |
| Vudu | `VUDU` | Per-purchase | Yes |
| Crunchyroll | `CRUNCHYROLL` | $7.99-$14.99 | **No** |
| FloSports | `FLOSPORTS` | $29.99 | **No** |
| DirecTV Stream | `DIRECTV` | $79.99-$164.99 | **No** |
| Starz | `STARZ` | $9.99 | **No** |

---

## Engine Requirements (CSP-Specific)

| Requirement | Status | Notes |
|---|---|---|
| Anniversary year reset | REQUIRED | Hotel credit uses account open date, not calendar year. Different from Gold (calendar year). |
| Points multiplier A1 template | REQUIRED | `a1_points_redirect` template for Lyft/Uber insight. Shared with future earning-rate redirects. |
| Annualized scoring for points insights | REQUIRED | dollar_impact_score uses annualized incremental value, copy shows per-transaction value. |
| DoorDash presence-based tracking | REQUIRED | Infer promo usage from transaction presence, not credit detection. Shared with CSR. |
| Streaming merchant pattern list | REQUIRED | 18 qualifying services. Must be configurable — Chase may change the list. |
| Grocery exclusion list | REQUIRED | Target, Walmart, Costco, Sam's Club, BJ's. Shared with Gold (which has a similar but not identical exclusion set). |
| Anniversary date detection | REQUIRED | Onboarding question + annual fee charge scan. CSR also needs this. Gold does NOT (calendar year). |
