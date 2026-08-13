# Amex Gold Card — Benefit Catalog & Competitor Map

*Last verified: 2026-08-13*

Implementation-ready data for the Zurp insight engine. Format matches CSR and CSP catalogs.

---

## Benefit Catalog

### Hard Credits

```
benefit_key:          gold_dining_credit
card_type:            amex_gold
benefit_name:         Monthly Dining Credit
benefit_partner:      Grubhub, Seamless, The Cheesecake Factory, Five Guys, Buffalo Wild Wings, Wonder
benefit_type:         statement_credit
annual_value:         120
period_type:          monthly
period_value:         10
max_per_period:       10
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing benefit, no announced end date)
trackable_via_plaid:  true
reset_basis:          calendar_month
rollover:             false
notes:                Credit applies to purchases at ANY of the 6 eligible merchants.
                      Partner lineup changed 6/30/2026: Goldbelly and Wine.com ended; Seamless, Buffalo Wild Wings, and Wonder added.
                      Shared across primary + authorized users ($10 total, not $10 each).
                      Credit posts within days, up to 8 weeks per terms.
                      Gift card and merchandise purchases at these merchants do NOT qualify.
                      Must enroll BEFORE first purchase — purchases before enrollment do not trigger retroactive credits.
```

```
benefit_key:          gold_uber_cash
card_type:            amex_gold
benefit_name:         Monthly Uber Cash
benefit_partner:      Uber
benefit_type:         uber_cash (in-app balance, NOT statement credit)
annual_value:         120
period_type:          monthly
period_value:         10
max_per_period:       10
activation_required:  true
activation_method:    enrollment (add Gold Card to Uber account)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  false (Uber Cash is in-app balance reduction, not statement credit)
reset_basis:          calendar_month
rollover:             false
notes:                $10 deposited into Uber Wallet on 1st of each month.
                      Applies to Uber rides AND Uber Eats in the U.S.
                      Must select Gold Card (or any Amex) as payment method in Uber.
                      After Uber Cash is depleted, remaining charges on Gold Card earn 4x (Uber Eats) or 1x (rides).
                      Only primary cardholder receives Uber Cash — authorized users do NOT get their own.
                      Detection: infer from Uber/Uber Eats transaction presence. Cannot confirm Uber Cash was used.
                      SAME detection challenge as CSR/CSP DoorDash in-app promo.
```

```
benefit_key:          gold_resy_credit
card_type:            amex_gold
benefit_name:         Semi-Annual Resy Dining Credit
benefit_partner:      Resy
benefit_type:         statement_credit
annual_value:         100
period_type:          semi_annual
period_value:         50
max_per_period:       50
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true
reset_basis:          calendar_half (H1: Jan 1 – Jun 30, H2: Jul 1 – Dec 31)
rollover:             false (unused H1 does NOT carry to H2)
notes:                Credit triggers at U.S. restaurants partnered with Resy, OR purchases on Resy.com/app.
                      Reservation through Resy is NOT required — just dine at a Resy-affiliated restaurant and pay with Gold.
                      Statement credit posts to account; visible in Plaid.
                      Challenge: identifying Resy-affiliated restaurants requires a Resy restaurant database or detecting Amex credit postings.
                      Semi-annual tracking uses same biannual_h1/biannual_h2 period type as CSR (Exclusive Tables, StubHub).
```

```
benefit_key:          gold_dunkin_credit
card_type:            amex_gold
benefit_name:         Monthly Dunkin' Credit
benefit_partner:      Dunkin'
benefit_type:         statement_credit
annual_value:         84
period_type:          monthly
period_value:         7
max_per_period:       7
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true
reset_basis:          calendar_month
rollover:             false
notes:                U.S. Dunkin' locations only (in-store or via Dunkin' app with Gold Card as payment).
                      Statement credit posts to account.
                      Tip for users: load $7 onto Dunkin' app balance to bank the credit even without a store visit.
                      Dunkin' merchant names in Plaid: "DUNKIN", "DUNKIN DONUTS", "DUNKIN'".
```

```
benefit_key:          gold_hotel_collection
card_type:            amex_gold
benefit_name:         The Hotel Collection Credit
benefit_partner:      AmexTravel.com (Hotel Collection properties)
benefit_type:         property_credit (on-site, not statement credit)
annual_value:         100 (per qualifying stay, can be used multiple times)
period_type:          per_event
period_value:         100
max_per_period:       null (no annual cap on number of stays)
activation_required:  false
activation_method:    null (auto-applied at qualifying Hotel Collection properties)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  false (on-property credit reduces hotel bill before final charge)
reset_basis:          per_stay
rollover:             n/a
notes:                Must book through AmexTravel.com at a Hotel Collection property.
                      Minimum 2-night prepaid stay required.
                      $100 applied toward eligible on-property charges (food, beverage, spa).
                      Room upgrade when available (not guaranteed).
                      Zurp can only surface as awareness insight (C1), not track usage.
                      Potentially detect AmexTravel.com hotel charges as a signal that user is engaging with this benefit.
```

### Points Multipliers

```
benefit_key:          gold_4x_restaurants
card_type:            amex_gold
benefit_name:         4x Membership Rewards at Restaurants Worldwide
benefit_partner:      null (category-wide)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       50000 (spending cap: $50,000/yr at 4x, then reverts to 1x)
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  true (Plaid category: FOOD_AND_DRINK > RESTAURANT, plus delivery apps)
reset_basis:          calendar_year (cap resets Jan 1)
rollover:             n/a
notes:                "Restaurants worldwide" — includes sit-down, fast food, delivery apps (Uber Eats, Grubhub, DoorDash, etc.).
                      Cap is $50,000 in spend, NOT $50,000 in points.
                      After cap: 1x on all restaurant spend for remainder of calendar year.
                      Zurp should fire B3 warning at 80% ($40,000) and 100% ($50,000).
                      This is the Gold Card's PRIMARY value driver for most users.
                      Plaid signals: personal_finance_category FOOD_AND_DRINK, merchant category codes 5812/5813/5814.
```

```
benefit_key:          gold_4x_supermarkets
card_type:            amex_gold
benefit_name:         4x Membership Rewards at U.S. Supermarkets
benefit_partner:      null (category-wide)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       25000 (spending cap: $25,000/yr at 4x, then reverts to 1x)
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  true (Plaid category: GENERAL_MERCHANDISE > SUPERSTORES_AND_WAREHOUSES excluded)
reset_basis:          calendar_year (cap resets Jan 1)
rollover:             n/a
notes:                "U.S. supermarkets" — includes grocery chains (Kroger, Safeway, Whole Foods, Publix, etc.).
                      EXCLUDES: Walmart, Target, Costco, Sam's Club, BJ's, and other warehouse clubs.
                      EXCLUDES: Meal kit delivery (HelloFresh, Blue Apron) — these code as subscription, not supermarket.
                      EXCLUDES: Amazon Fresh, Instacart — depends on how the charge codes. Instacart from a supermarket MAY qualify.
                      Cap is $25,000 in spend. After cap: 1x.
                      Zurp should fire B3 warning at 80% ($20,000) and 100% ($25,000).
                      This is the Gold Card's SECOND most valuable multiplier.
                      Plaid merchant exclusion list needed: WALMART, TARGET, COSTCO, SAMS CLUB, BJS WHOLESALE.
```

```
benefit_key:          gold_3x_flights
card_type:            amex_gold
benefit_name:         3x Membership Rewards on Flights
benefit_partner:      null (airlines + AmexTravel.com)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null (no spending cap)
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  true (Plaid category: TRAVEL > AIRLINES_AND_AVIATION)
reset_basis:          n/a (no cap)
rollover:             n/a
notes:                Flights booked directly with airlines OR through AmexTravel.com.
                      Does NOT include flights booked through third-party OTAs (Expedia, Kayak, Google Flights purchase).
                      Plaid signals: TRAVEL > AIRLINES_AND_AVIATION, merchant category codes 3000-3350 (airlines), 4511.
```

```
benefit_key:          gold_5x_amex_hotels
card_type:            amex_gold
benefit_name:         5x Membership Rewards on Prepaid Hotels via AmexTravel.com
benefit_partner:      AmexTravel.com
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false (AmexTravel.com charges may code as AMERICAN EXPRESS TRAVEL or the underlying hotel/car brand)
reset_basis:          n/a
rollover:             n/a
notes:                Prepaid hotels booked through AmexTravel.com earn 5x (2026 refresh — previously 2x on non-flight AmexTravel bookings).
                      Flights booked via AmexTravel.com earn 3x (see gold_3x_flights).
                      Difficult to track in Plaid — merchant name varies. Lower priority for insight engine.
```

```
benefit_key:          gold_1x_other
card_type:            amex_gold
benefit_name:         1x Membership Rewards on Everything Else
benefit_partner:      null
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                Base earn rate. All purchases not captured by 4x/3x/5x categories.
                      Used as baseline for competitor redirect dollar_impact calculations.
```

### Insurance & Protection

```
benefit_key:          gold_trip_delay
card_type:            amex_gold
benefit_name:         Trip Delay Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0 (no annual value; per-event)
period_type:          per_event
period_value:         300
max_per_period:       2 (max 2 claims per 12-month period)
activation_required:  false
activation_method:    null (automatic when trip is charged to Gold Card)
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          rolling_12_months
rollover:             n/a
notes:                Covers reasonable expenses (meals, lodging, toiletries) when trip is delayed 12+ hours.
                      Up to $300 per trip, max 2 claims per 12-month rolling period.
                      Must have purchased the trip fare on the Gold Card.
                      Lower than CSR ($500/trip) but still valuable.
```

```
benefit_key:          gold_baggage_insurance
card_type:            amex_gold
benefit_name:         Baggage Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         1250 (carry-on) / 500 (checked)
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Carry-on: up to $1,250. Checked: up to $500.
                      Coverage is EXCESS — pays after airline's own reimbursement is exhausted.
                      Must have purchased the fare on Gold Card.
```

```
benefit_key:          gold_car_rental
card_type:            amex_gold
benefit_name:         Car Rental Loss and Damage Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         50000
max_per_period:       null
activation_required:  false
activation_method:    null (decline rental company's CDW, charge to Gold Card)
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Up to $50,000 coverage for theft or damage.
                      SECONDARY coverage — pays AFTER your personal auto insurance.
                      CRITICAL DIFFERENCE from CSR/CSP: CSR provides PRIMARY coverage ($60K), CSP provides SECONDARY ($60K).
                      Gold's secondary coverage is a significant downside for frequent renters.
                      Covers rentals up to 30 consecutive days in the U.S. and most foreign countries.
```

```
benefit_key:          gold_travel_accident
card_type:            amex_gold
benefit_name:         Travel Accident Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         100000
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Accidental death or dismemberment coverage up to $100,000 when common carrier fare is charged to Gold Card.
                      Covers planes, trains, ships, buses.
```

```
benefit_key:          gold_purchase_protection
card_type:            amex_gold
benefit_name:         Purchase Protection
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         1000
max_per_period:       50000 (per calendar year)
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          calendar_year
rollover:             n/a
notes:                Covers eligible purchases against accidental damage or theft within 90 days of purchase.
                      Up to $1,000 per occurrence, $50,000 per calendar year.
                      LOWER than CSR ($10,000/occurrence) — significant gap for expensive purchases.
                      Comparable to CSP ($500/occurrence within 120 days) — Gold is slightly better per-occurrence but shorter window.
```

```
benefit_key:          gold_extended_warranty
card_type:            amex_gold
benefit_name:         Extended Warranty
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         10000
max_per_period:       50000 (per calendar year)
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          calendar_year
rollover:             n/a
notes:                Extends manufacturer's warranty by 1 additional year on warranties of 5 years or less.
                      Up to $10,000 per item, $50,000 per calendar year.
                      Identical structure to CSR/CSP extended warranty.
```

```
benefit_key:          gold_return_protection
card_type:            amex_gold
benefit_name:         Return Protection (REMOVED Jan 2020)
benefit_partner:      null
benefit_type:         insurance
annual_value:         0
period_type:          per_event
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      2020-01 (benefit removed)
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                REMOVED — Amex discontinued Return Protection on the Gold Card in January 2020.
                      Earlier versions of this catalog listed it as active in error; retained here only as a correction marker.
                      Do NOT surface as a live benefit or Compare page differentiator.
```

### Other Benefits

```
benefit_key:          gold_no_ftf
card_type:            amex_gold
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
                      Standard across premium cards (CSR, CSP also have this).
                      Not a differentiator on Compare page.
```

```
benefit_key:          gold_global_assist
card_type:            amex_gold
benefit_name:         Global Assist Hotline
benefit_partner:      null
benefit_type:         access
annual_value:         0
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                24/7 emergency assistance hotline when traveling 100+ miles from home.
                      Coordinates medical referrals, legal referrals, emergency translation, lost document assistance.
                      Coordination is free; services themselves may have costs.
                      Awareness-only benefit for Zurp (C1).
```

```
benefit_key:          gold_transfer_partners
card_type:            amex_gold
benefit_name:         Membership Rewards Transfer Partners
benefit_partner:      17 airlines + 3 hotels
benefit_type:         access
annual_value:         variable (enables 1.6cpp+ redemption value)
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Airlines (17): Delta, ANA, Air Canada Aeroplan, Air France/KLM Flying Blue, Avianca LifeMiles,
                      British Airways Avios, Cathay Pacific Asia Miles, Emirates Skywards, Etihad Guest,
                      Hawaiian Airlines, Iberia Plus, JetBlue TrueBlue, Qantas, Singapore Airlines KrisFlyer,
                      Thai Royal Orchid Plus, Virgin Atlantic Flying Club, El Al Matmid.
                      Hotels (3): Hilton Honors (1:2 ratio), Marriott Bonvoy (1:1.2 at 1000+ pt transfers), Choice Privileges (1:1).
                      Most airline transfers are 1:1 ratio. Delta and JetBlue have a $0.0006/pt fee (max $99).
                      KEY DIFFERENTIATOR: Amex has Delta (Chase does not). Chase has United and Southwest (Amex does not).
                      This matters for the Compare page — a Delta loyalist gets more value from Gold than from CSR.
```

```
benefit_key:          gold_hertz_five_star
card_type:            amex_gold
benefit_name:         Hertz Gold Plus Rewards Five Star Status
benefit_partner:      Hertz
benefit_type:         access
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  true
activation_method:    enrollment (link Gold Card to Hertz Gold Plus Rewards)
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                Complimentary Hertz Five Star elite status, added in the 2026 refresh. Enrollment required.
                      Awareness-only benefit for Zurp (C1).
```

### Benefit Catalog Summary

| # | Benefit Key | Type | Annual Value | Period | Trackable | Enrollment |
|---|---|---|---|---|---|---|
| 1 | gold_dining_credit | statement_credit | $120 | Monthly | Yes | Yes |
| 2 | gold_uber_cash | uber_cash | $120 | Monthly | No (infer) | Yes |
| 3 | gold_resy_credit | statement_credit | $100 | Semi-annual | Yes | Yes |
| 4 | gold_dunkin_credit | statement_credit | $84 | Monthly | Yes | Yes |
| 5 | gold_hotel_collection | property_credit | $100/stay | Per event | No | No |
| 6 | gold_4x_restaurants | points_multiplier | Variable | Ongoing | Yes | No |
| 7 | gold_4x_supermarkets | points_multiplier | Variable | Ongoing | Yes | No |
| 8 | gold_3x_flights | points_multiplier | Variable | Ongoing | Yes | No |
| 9 | gold_5x_amex_hotels | points_multiplier | Variable | Ongoing | No | No |
| 10 | gold_1x_other | points_multiplier | Variable | Ongoing | Yes | No |
| 11 | gold_trip_delay | insurance | $300/event | Per event | No | No |
| 12 | gold_baggage_insurance | insurance | $1,250/$500 | Per event | No | No |
| 13 | gold_car_rental | insurance | $50K/event | Per event | No | No |
| 14 | gold_travel_accident | insurance | $100K/event | Per event | No | No |
| 15 | gold_purchase_protection | insurance | $1K/event | Per event | No | No |
| 16 | gold_extended_warranty | insurance | $10K/item | Per event | No | No |
| 17 | gold_return_protection | insurance | REMOVED Jan 2020 | — | No | No |
| 18 | gold_no_ftf | fee_waiver | Variable | Ongoing | Yes | No |
| 19 | gold_global_assist | access | $0 | Ongoing | No | No |
| 20 | gold_transfer_partners | access | Variable | Ongoing | No | No |
| 21 | gold_hertz_five_star | access | Variable | Ongoing | No | Yes |

**Total: 21 benefits** (18 from research doc + 2 additional: global_assist and transfer_partners broken out as distinct entries for completeness + gold_hertz_five_star added in the 2026 refresh; gold_return_protection is retained only as a REMOVED marker — the benefit was discontinued Jan 2020)

**Hard credits total: $424/yr** (Dining $120 + Uber $120 + Resy $100 + Dunkin' $84) + $100/stay Hotel Collection

**Benefits requiring enrollment: 3** (Dining, Dunkin', Resy) + 1 setup (Uber — add card to Uber account)

**Card definition entries: 4** — gold_dining_credit, gold_resy_credit (H1/H2), gold_uber_cash, and gold_dunkin_credit are tracked in the CardDefinition. gold_uber_cash is modeled as an auto-matchable monthly credit (matched via Uber charges, though Uber Cash usage itself cannot be confirmed). gold_hotel_collection is a property credit (not statement credit) and stays out of the card definition.

**Network: amex** — First non-Visa card in Zurp. CardDefinition.network already supports `"amex"` in the type union.

---

## Competitor Map

### Map Structure

Each entry follows the `competitor_map` table schema from the insight engine spec:

```
card_type | benefit_key | benefit_partner | competitor_merchant | plaid_merchant_pattern | category | insight_type | notes
```

> **Implementation note — pipe-delimited patterns**: Several entries below use `|` syntax for multiple merchant name variants (e.g., `DOORDASH|DOOR DASH`). The current `plaidMerchantPattern` field in the competitor_map schema is a single string matched via ILIKE. To implement multiple patterns, create **separate rows per pattern** (one for `DOORDASH`, one for `DOOR DASH`), following the same approach CSR uses for `UBER EATS` / `UBEREATS`. The pipe syntax in this catalog is shorthand for "these all need rows."

### Entry 1: DoorDash → Grubhub (Dual-Benefit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_dining_credit
benefit_partner:        Grubhub
competitor_merchant:    DoorDash
plaid_merchant_pattern: DOORDASH|DOOR DASH
category:               food_delivery
insight_type:           A1 (dual-benefit)
dollar_signal:          $10 credit + 4x points on order total
notes:                  DUAL-BENEFIT template. User gets dining credit ($10) AND 4x restaurant points.
                        Copy: "You ordered $35 from DoorDash. On Grubhub, you'd get $10 off (dining credit) AND earn 4x points on $35 — that's $10 + $2.24 = $12.24 in missed value."
                        Grubhub is one of the 6 Dining Credit merchants AND codes as restaurant for 4x.
                        This is the highest-value single redirect in the Gold Card catalog.
```

### Entry 2: DoorDash → Uber Eats (Dual-Benefit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_uber_cash
benefit_partner:        Uber Eats
competitor_merchant:    DoorDash
plaid_merchant_pattern: DOORDASH|DOOR DASH
category:               food_delivery
insight_type:           A1 (dual-benefit)
dollar_signal:          $10 Uber Cash + 4x points on order total
notes:                  DUAL-BENEFIT template. User gets Uber Cash ($10) AND 4x restaurant points (Uber Eats codes as restaurant).
                        Copy: "You ordered $35 from DoorDash. On Uber Eats, you'd get $10 in Uber Cash AND earn 4x points — that's $10 + $2.24 = $12.24 in missed value."
                        Only fires if user has Uber Cash remaining this month.
                        Mutually exclusive with Entry 1 — engine should pick ONE redirect per DoorDash transaction.
                        Tie-breaking: prefer Grubhub (Entry 1) because Dining Credit is a statement credit (more certain) vs Uber Cash (in-app balance).
```

### Entry 3: Postmates → Grubhub (Dual-Benefit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_dining_credit
benefit_partner:        Grubhub
competitor_merchant:    Postmates
plaid_merchant_pattern: POSTMATES
category:               food_delivery
insight_type:           A1 (dual-benefit)
dollar_signal:          $10 credit + 4x points
notes:                  Same logic as Entry 1 but triggered by Postmates instead of DoorDash.
                        Postmates is now fully merged into Uber Eats in most markets — this mapping may fire less often.
                        Copy: Same template as Entry 1 with Postmates as the competitor.
```

### Entry 4: Postmates → Uber Eats (Dual-Benefit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_uber_cash
benefit_partner:        Uber Eats
competitor_merchant:    Postmates
plaid_merchant_pattern: POSTMATES
category:               food_delivery
insight_type:           A1 (dual-benefit)
dollar_signal:          $10 Uber Cash + 4x points
notes:                  Same logic as Entry 2 but triggered by Postmates.
                        Same tie-breaking rule: prefer Grubhub redirect over Uber Eats.
```

### Entry 5: Starbucks → Dunkin' (Credit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_dunkin_credit
benefit_partner:        Dunkin'
competitor_merchant:    Starbucks
plaid_merchant_pattern: STARBUCKS|STARBUCKS STORE
category:               coffee
insight_type:           A1
dollar_signal:          $7/mo credit
notes:                  Copy: "You spent $5.75 at Starbucks. At Dunkin', you'd get up to $7/mo back as a statement credit. Switch your morning coffee and save $84/yr."
                        High frequency insight — coffee purchases are near-daily for many users.
                        Should throttle to max 1x/week to avoid annoyance.
                        Only fires if Dunkin' credit has remaining balance this month.
```

### Entry 6: Peet's Coffee → Dunkin' (Credit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_dunkin_credit
benefit_partner:        Dunkin'
competitor_merchant:    Peet's Coffee
plaid_merchant_pattern: PEET|PEETS|PEET'S
category:               coffee
insight_type:           A1
dollar_signal:          $7/mo credit
notes:                  Same logic as Entry 5 with Peet's as competitor.
                        Lower volume than Starbucks but same insight structure.
```

### Entry 7: Walmart → Local Supermarket (Earning Rate Redirect)

```
card_type:              amex_gold
benefit_key:            gold_4x_supermarkets
benefit_partner:        null (any qualifying U.S. supermarket)
competitor_merchant:    Walmart
plaid_merchant_pattern: WALMART|WAL-MART|WM SUPERCENTER
category:               grocery
insight_type:           A1 (earning rate)
dollar_signal:          3 incremental pts/$ (4x vs 1x) × 1.6cpp = 4.8cpp per dollar
notes:                  Copy: "You spent $125 at Walmart this month. Walmart earns 1x on your Gold Card. Switch to a supermarket like [Kroger/Safeway/etc.] for 4x — that's 375 extra points ($6.00) on this trip alone."
                        Walmart is explicitly excluded from 4x supermarket category.
                        High-impact: grocery spend is typically $400-600/mo, Walmart is the #1 grocery retailer.
                        Should personalize supermarket suggestion based on user's transaction history (suggest a supermarket they already shop at).
```

### Entry 8: Target → Local Supermarket (Earning Rate Redirect)

```
card_type:              amex_gold
benefit_key:            gold_4x_supermarkets
benefit_partner:        null (any qualifying U.S. supermarket)
competitor_merchant:    Target
plaid_merchant_pattern: TARGET|TARGET\s
category:               grocery
insight_type:           A1 (earning rate)
dollar_signal:          3 incremental pts/$ × 1.6cpp = 4.8cpp per dollar
notes:                  Same logic as Entry 7. Target is excluded from 4x.
                        Nuance: Target sells much more than groceries. Only fire this insight if the Plaid category suggests grocery purchases.
                        Plaid personal_finance_category may show GENERAL_MERCHANDISE for Target.
                        Consider only firing if amount is consistent with grocery shopping ($30+).
```

### Entry 9: Costco → Local Supermarket (Earning Rate Redirect)

```
card_type:              amex_gold
benefit_key:            gold_4x_supermarkets
benefit_partner:        null (any qualifying U.S. supermarket)
competitor_merchant:    Costco
plaid_merchant_pattern: COSTCO|COSTCO WHSE|COSTCO WHOLESALE
category:               grocery
insight_type:           A1 (earning rate)
dollar_signal:          3 incremental pts/$ × 1.6cpp = 4.8cpp per dollar
notes:                  Same logic as Entry 7. Costco/warehouse clubs excluded from 4x.
                        ADDITIONAL ISSUE: Costco does not accept American Express (Visa only since 2016).
                        This means the Gold Card user is ALREADY using a different card at Costco.
                        Insight reframe: "You spent $180 at Costco (which doesn't accept Amex). For grocery items, a supermarket that accepts Amex earns 4x on your Gold Card — 720 extra points ($11.52)."
                        Lower confidence insight — user may shop Costco for non-grocery items or for Costco-specific deals.
```

### Entry 10: Sam's Club → Local Supermarket (Earning Rate Redirect)

```
card_type:              amex_gold
benefit_key:            gold_4x_supermarkets
benefit_partner:        null (any qualifying U.S. supermarket)
competitor_merchant:    Sam's Club
plaid_merchant_pattern: SAMS CLUB|SAM'S CLUB|SAMSCLUB
category:               grocery
insight_type:           A1 (earning rate)
dollar_signal:          3 incremental pts/$ × 1.6cpp = 4.8cpp per dollar
notes:                  Same logic as Entry 9. Sam's Club accepts Amex but is excluded from 4x supermarket category.
                        Unlike Costco, Sam's Club DOES accept Amex — so the user might be charging to Gold Card at 1x.
                        Copy: "You spent $150 at Sam's Club — earning 1x. Move your grocery run to a supermarket for 4x. That's 450 extra points ($7.20)."
```

### Entry 11: HelloFresh/Blue Apron → Supermarket (Earning Rate Redirect)

```
card_type:              amex_gold
benefit_key:            gold_4x_supermarkets
benefit_partner:        null (any qualifying U.S. supermarket)
competitor_merchant:    HelloFresh / Blue Apron / meal kit services
plaid_merchant_pattern: HELLOFRESH|HELLO FRESH|BLUE APRON|BLUEAPRON|HOME CHEF|HOMECHEF|SUNBASKET|GREEN CHEF
category:               grocery
insight_type:           A1 (earning rate)
dollar_signal:          3 incremental pts/$ × 1.6cpp = 4.8cpp per dollar
notes:                  Meal kit services code as subscription/merchandise, NOT as supermarket — so they earn 1x on Gold Card.
                        Copy: "You spent $80 on HelloFresh. Meal kits earn 1x on your Gold Card. Buying the same ingredients at a supermarket earns 4x — that's 240 extra points ($3.84)."
                        Lower-confidence insight: user may value the convenience of meal kits over the points difference.
                        Throttle: max 1x/month per meal kit service.
```

### Entry 12: Uber (No Uber Cash) → Uber (With Uber Cash) (Activation Reminder)

> **Implementation note**: This entry is reference data for the C0 (enrollment/activation) insight generator, NOT a competitor_map DB row. It should be implemented as a B1 unactivated-benefit insight or a C0 enrollment insight, not an A1 competitor redirect. The A1 generator should skip this entry.

```
card_type:              amex_gold
benefit_key:            gold_uber_cash
benefit_partner:        Uber
competitor_merchant:    Uber (self — user hasn't set up Uber Cash)
plaid_merchant_pattern: UBER \*TRIP|UBER BV|UBER \*RIDES
category:               rideshare
insight_type:           C0 (enrollment/activation)
dollar_signal:          $10/mo ($120/yr)
notes:                  NOT a traditional competitor redirect — this detects Uber ride transactions WITHOUT any sign of Uber Cash usage.
                        If user has Uber ride charges but no evidence of Uber Eats charges or reduced-amount Uber charges, they may not have added their Gold Card to Uber.
                        Copy: "You took an Uber ride but may not have your Gold Card linked in Uber. Add it to get $10/mo in Uber Cash — that's $120/yr."
                        Fire once, then suppress unless user continues to have Uber charges without apparent Uber Cash usage.
```

### Entry 13: Expedia/Kayak → Direct Airline (Earning Rate Redirect)

```
card_type:              amex_gold
benefit_key:            gold_3x_flights
benefit_partner:        null (direct airline booking)
competitor_merchant:    Expedia / Kayak / Orbitz / Priceline / Google Flights (purchase)
plaid_merchant_pattern: EXPEDIA|KAYAK|ORBITZ|PRICELINE|TRAVELOCITY|CHEAPTICKETS|HOTWIRE
category:               flights
insight_type:           A1 (earning rate)
dollar_signal:          2 incremental pts/$ (3x vs 1x) × 1.6cpp = 3.2cpp per dollar
notes:                  OTA flight purchases may code as travel agency (1x) rather than airline (3x).
                        Copy: "You booked a $350 flight through Expedia. Book directly with the airline to earn 3x instead of 1x — that's 700 extra points ($11.20)."
                        Caveat: not all OTA charges are flights (could be hotels or packages). Only fire if Plaid categorization suggests air travel.
                        Lower confidence — fire max 1x per OTA transaction.
```

### Entry 14: Third-Party Hotel → AmexTravel.com (Multi-Benefit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_hotel_collection
benefit_partner:        AmexTravel.com
competitor_merchant:    Hotels.com / Booking.com / third-party hotel OTAs
plaid_merchant_pattern: HOTELS\.COM|BOOKING\.COM|BOOKING COM|HOTELS COM|TRIVAGO
category:               hotels
insight_type:           A1 + C1 (awareness)
dollar_signal:          $100 property credit + 5x points on prepaid hotels (vs 1x at OTA)
notes:                  MULTI-BENEFIT redirect: user gets Hotel Collection $100 property credit AND 5x points on prepaid hotels booked through AmexTravel.com (2026 refresh; was 2x).
                        Copy: "You booked $400 at Hotels.com. If you book a 2+ night prepaid stay at a Hotel Collection property through AmexTravel.com, you get a $100 on-property credit AND 5x points. That's $100 + $25.60 = $125.60 in potential value."
                        Lower confidence: Hotel Collection properties are a subset of all hotels. User's specific hotel may not be in the collection.
                        Consider this a C1 (awareness) insight unless we can match the hotel to the Hotel Collection.
                        Throttle: 1x per hotel OTA transaction.
```

### Entry 15: OpenTable → Resy (Credit Redirect)

```
card_type:              amex_gold
benefit_key:            gold_resy_credit
benefit_partner:        Resy
competitor_merchant:    OpenTable
plaid_merchant_pattern: OPENTABLE
category:               dining_reservation
insight_type:           A1
dollar_signal:          Up to $50 per half-year ($100/yr)
notes:                  Copy: "You made a reservation through OpenTable. Your Gold Card includes $50 in semi-annual Resy dining credit. Book through Resy next time to earn up to $50 back."
                        Nuance: OpenTable charges don't always appear in Plaid (the restaurant charges, not OpenTable itself).
                        More accurately: if we detect the user uses OpenTable (via a rare OpenTable-specific charge or user self-report), suggest Resy.
                        In practice, this may be more of a C1 awareness insight than a true A1 redirect.
                        Alternative trigger: at the start of each half-year, proactively suggest Resy dining as a way to use the $50 credit.
```

### Competitor Map Summary

| # | Competitor | → Redirect To | Category | Type | Dollar Signal (per event) | Dual-Benefit? |
|---|---|---|---|---|---|---|
| 1 | DoorDash | Grubhub | food_delivery | A1 | $10 credit + 4x pts | Yes |
| 2 | DoorDash | Uber Eats | food_delivery | A1 | $10 Uber Cash + 4x pts | Yes |
| 3 | Postmates | Grubhub | food_delivery | A1 | $10 credit + 4x pts | Yes |
| 4 | Postmates | Uber Eats | food_delivery | A1 | $10 Uber Cash + 4x pts | Yes |
| 5 | Starbucks | Dunkin' | coffee | A1 | $7/mo credit | No |
| 6 | Peet's Coffee | Dunkin' | coffee | A1 | $7/mo credit | No |
| 7 | Walmart | Supermarket | grocery | A1 | 4.8cpp/$ (4x vs 1x) | No |
| 8 | Target | Supermarket | grocery | A1 | 4.8cpp/$ (4x vs 1x) | No |
| 9 | Costco | Supermarket | grocery | A1 | 4.8cpp/$ (4x vs 1x) | No |
| 10 | Sam's Club | Supermarket | grocery | A1 | 4.8cpp/$ (4x vs 1x) | No |
| 11 | HelloFresh etc. | Supermarket | grocery | A1 | 4.8cpp/$ (4x vs 1x) | No |
| 12 | Uber (no setup) | Uber (with Uber Cash) | rideshare | C0 | $10/mo ($120/yr) | No | ← Not a competitor_map row; C0 reference data |
| 13 | Expedia/Kayak etc. | Direct airline | flights | A1 | 3.2cpp/$ (3x vs 1x) | No |
| 14 | Hotels.com etc. | AmexTravel.com | hotels | A1+C1 | $100 credit + 5x pts | Yes |
| 15 | OpenTable | Resy | dining_reservation | A1/C1 | Up to $50/half | No |

**Total: 15 entries in catalog, 14 competitor_map DB rows** (Entry 12 is C0 reference data for the enrollment insight generator, not an A1 competitor redirect)

### Tie-Breaking Rules

When multiple entries match a single transaction:

1. **DoorDash → Grubhub vs DoorDash → Uber Eats**: Prefer Grubhub. Dining Credit is a statement credit (certain) vs Uber Cash (in-app balance, less certain). If Dining Credit is maxed this month but Uber Cash isn't, switch to Uber Eats redirect.

2. **Multiple grocery redirects in same month**: Show the highest-dollar Walmart/Target/Costco transaction as the primary insight. Suppress subsequent grocery redirects for 7 days to avoid spam.

3. **Dual-benefit vs single-benefit**: Always prefer dual-benefit insights (credit + points) over single-benefit (credit only or points only) when both apply.

4. **Throttling**: Coffee redirects max 1x/week. Grocery redirects max 1x/week. Hotel redirects max 1x/transaction. Flight redirects max 1x/transaction.

### Engine Requirements

New capabilities needed to support the Gold Card competitor map:

| Requirement | Status | Notes |
|---|---|---|
| Dual-benefit redirect template | NEW | Copy formula: "[credit value] + [points value] = [total missed value]" |
| C0 enrollment/activation insight | NEW | One-time or rare-fire insights for setup actions (add card to Uber, enroll in Dining/Dunkin'/Resy) |
| Spending cap tracking | NEW | Accumulate restaurant ($50K) and supermarket ($25K) spend per calendar year. Fire B3 at 80% and 100%. |
| Semi-annual period tracking | EXISTING | H1 (Jan-Jun) and H2 (Jul-Dec) for Resy credit. Already implemented for CSR (Exclusive Tables, StubHub). Resy maps directly to biannual_h1/biannual_h2. |
| Calendar year reset toggle | NEW | Gold uses calendar year for all resets. CSR/CSP use anniversary year. Engine needs per-card reset_basis. |
| Tie-breaking logic | NEW | When multiple competitor map entries match a single transaction, select one based on priority rules. |
| Throttle/suppression rules | ENHANCED | Per-category throttle settings (coffee: 1x/week, grocery: 1x/week, etc.) |

---

## Cross-Card Comparison: Competitor Map Size

| Card | A1 Entries | A2 Entries | C0 (ref) | DB Rows | Notes |
|---|---|---|---|---|---|
| CSR | 24 (catalog) / 51 (code seed) | 7 | 0 | 24–51 | Broadest map — StubHub, DoorDash, Apple subs, Lyft, Peloton, hotels |
| CSP | 3 | 0 | 0 | 4 | Smallest — DoorDash redirects + Lyft only |
| Gold | 14 | 0 | 1 | 14 | Multi-category — food delivery, coffee, grocery, flights, hotels, dining reservations. C0 entry is reference data, not a DB row. |

The Gold Card's competitor map is comparable in size to CSR but built differently — CSR's map is concentrated in entertainment and travel, while Gold's spans dining, grocery, and everyday spending categories. This means Gold users should receive a diverse, frequent stream of insights.
