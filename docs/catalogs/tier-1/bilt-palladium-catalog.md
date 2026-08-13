# Bilt Palladium Card — Benefit Catalog & Competitor Map

*Last verified: 2026-08-13*

Implementation-ready data for the Zurp insight engine. New card launched February 7, 2026. Format matches Chase Sapphire Preferred, Reserve, and Amex Platinum catalogs.

---

## Benefit Catalog

### Hard Credits & Annual Benefits

```
benefit_key:          bilt_palladium_hotel_credit
card_type:            bilt_palladium
benefit_name:         $400 Annual Bilt Travel Hotel Credit
benefit_partner:      Bilt Travel
benefit_type:         statement_credit
annual_value:         400
period_type:          annual
period_value:         200 (semi-annual installments)
max_per_period:       200
activation_required:  false
activation_method:    auto (2 × $200 credits, Jan 1 and Jul 1)
expiration_date:      null (permanent card benefit)
trackable_via_plaid:  true (appears as statement credit from Bilt Travel)
reset_basis:          calendar_year (Jan 1 and Jul 1)
rollover:             false (unused credits expire each semi-annual period)
notes:                Semi-annual delivery: $200 on Jan 1 and $200 on Jul 1.
                      Minimum 2-night stay required to use each credit.
                      Must book through Bilt Travel portal (NOT direct with hotel or OTA).
                      Statement credit posts within 1-2 billing cycles.
                      No minimum booking amount — lower spend amounts can use partial credits.
                      Highly trackable signal: credit transaction from BILT TRAVEL on Plaid.
                      Total annual hard credit value: $400 (before $200 annual Bilt Cash credit).
```

```
benefit_key:          bilt_palladium_bilt_cash_annual_credit
card_type:            bilt_palladium
benefit_name:         $200 Annual Bilt Cash Credit
benefit_partner:      Bilt (internal currency)
benefit_type:         statement_credit (cash equivalent)
annual_value:         200
period_type:          annual
period_value:         200
max_per_period:       200
activation_required:  false
activation_method:    auto (credited Jan 1)
expiration_date:      null (permanent card benefit)
trackable_via_plaid:  true (appears as credit to Bilt Cash balance)
reset_basis:          calendar_year (Jan 1)
rollover:             false (expired Dec 31 each year; $100 rollover to next year allowed)
notes:                Automatic $200 Bilt Cash deposit on Jan 1 each year.
                      Bilt Cash used to unlock rent/mortgage points, pay for hotel credits,
                      fitness subscriptions, dining credits, Lyft rides, Priority Pass guests, or Point Accelerator.
                      Only $100 of unused Bilt Cash rolls over to next year (60-day grace period in Jan).
                      Incentivizes use throughout the year.
                      Highly trackable: monitor Bilt Cash balance and redemption patterns.
```

```
benefit_key:          bilt_palladium_priority_pass
card_type:            bilt_palladium
benefit_name:         Priority Pass Lounge Access (Unlimited Visits, 2 Free Guests Per Visit)
benefit_partner:      Priority Pass
benefit_type:         lounge_access
annual_value:         0 (lounge access valued separately; extra guests beyond 2 cost $32/each)
period_type:          annual
period_value:         2 free guests per visit
max_per_period:       unlimited visits (2 free guests per visit)
activation_required:  true
activation_method:    portal (download Priority Pass app, register card)
expiration_date:      null (permanent card benefit)
trackable_via_plaid:  false (lounge visits not on statement)
reset_basis:          calendar_year
rollover:             n/a (guest allowance is per visit, not an annual pass count)
notes:                Cardholder gets unlimited Priority Pass lounge visits globally.
                      2 complimentary guests per visit (NOT "2 guest passes/yr" — per-visit allowance).
                      Additional guests beyond 2 cost $32/guest via Bilt Cash redemption (redeem 1,000 Bilt Points = $32 guest pass).
                      Authorized users receive full Priority Pass membership.
                      Requires Priority Pass membership enrollment (free with card).
                      Not directly trackable but high cardholder engagement signal.
                      Differentiator: most new rental cards do NOT include Priority Pass.
```

### Bilt Cash System & Redemption

```
benefit_key:          bilt_palladium_bilt_cash_earn
card_type:            bilt_palladium
benefit_name:         4% Bilt Cash on Everyday Purchases
benefit_partner:      Bilt (internal currency)
benefit_type:         cash_back
annual_value:         variable (4% of spend excl. rent/mortgage)
period_type:          ongoing
period_value:         null
max_per_period:       null (uncapped)
activation_required:  false
activation_method:    null (automatic)
expiration_date:      null (permanent)
trackable_via_plaid:  true (Bilt Cash balance increases with purchases)
reset_basis:          n/a
rollover:             false (expires Dec 31; $100 max rollover to Jan 1)
notes:                4% Bilt Cash earned on all everyday purchases EXCEPT rent/mortgage payments.
                      Earned SIMULTANEOUSLY with 2x Bilt Points.
                      Bilt Cash is separate currency from points — dual-currency design.
                      Expires Dec 31 each year; only first $100 of unused cash rolls to next year.
                      Incentivizes monthly Bilt Cash redemptions to avoid expiration.
                      Highly trackable: monitor Bilt Cash balance via Plaid/Zurp.
                      Moderate spender ($24K/yr excl. rent) earns $960 annual Bilt Cash.
```

```
benefit_key:          bilt_palladium_bilt_cash_redemptions
card_type:            bilt_palladium
benefit_name:         Bilt Cash Flexible Redemption Options
benefit_partner:      Bilt (multi-vendor redemption platform)
benefit_type:         flexible_redemption
annual_value:         variable (depends on redemption choices)
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    auto (redeem via Bilt dashboard)
expiration_date:      2026-12-31 (annually)
trackable_via_plaid:  false (internal Bilt redemptions, not on statement unless routed to statement credit)
reset_basis:          calendar_year
rollover:             false
notes:                Bilt Cash redemption options:
                      1. Unlock rent/mortgage points: $30 Bilt Cash → 1,000 Bilt Points
                         (Generates 1,000 pts × 2.2cpp = $22 value, but $30 cost = poor value unless points valued >3.0cpp)
                      2. Bilt Travel hotel credits: Apply to Bilt Travel bookings (no fixed rate given)
                      3. Fitness subscriptions: Up to $40/mo cap
                      4. Dining credits: $10-$50/mo (varies by partner — OpenTable, Resy, others)
                      5. Lyft credits: $10/mo cap on Lyft rides
                      6. Priority Pass guest passes: $32 per guest pass (1 guest = 1 redemption)
                      7. Point Accelerator unlock: $200 Bilt Cash → activate 3x multiplier for next $5,000 spend
                      Redemption choices indicate cardholder usage patterns — trackable via Bilt API.
                      Critical for A1/A2 insight generation: pair redemption pattern with upcoming spend.
```

### Earning Mechanics

```
benefit_key:          bilt_palladium_2x_points_everyday
card_type:            bilt_palladium
benefit_name:         2x Bilt Points on Everyday Purchases
benefit_partner:      null (category-wide)
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null (uncapped)
activation_required:  false
activation_method:    null
expiration_date:      null (permanent)
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                2x Bilt Points earned on all purchases EXCEPT rent/mortgage.
                      Earned SIMULTANEOUSLY with 4% Bilt Cash.
                      Includes: dining, travel, groceries, retail, utilities, gas, subscriptions, etc.
                      EXCLUDES: rent and mortgage payments (unless unlocked via tiered bonus).
                      Baseline earn rate — bonus categories (Bilt Dining, Bilt Travel, Lyft) earn more.
                      All purchases earn at least 2x. NOT a flat-2x card: 2x is the floor, not the ceiling.
                      Plaid signal: all transactions except RENT/MORTGAGE category.
```

```
benefit_key:          bilt_palladium_bonus_category_multipliers
card_type:            bilt_palladium
benefit_name:         Bonus Category Multipliers (up to 5x Dining, 4x Hotels, 3x Flights, 4x Lyft)
benefit_partner:      Bilt Dining / Bilt Travel / Lyft
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null (uncapped)
activation_required:  partial (Lyft bonus requires linked Lyft account)
activation_method:    auto (Lyft: link account in Bilt app)
expiration_date:      null (permanent)
trackable_via_plaid:  true
reset_basis:          n/a
rollover:             n/a
notes:                Bonus rates on top of the 2x baseline:
                      - Up to 5x at Bilt Dining network restaurants
                      - 4x on hotels booked through Bilt Travel
                      - 3x on flights booked through Bilt Travel
                      - 4x on Lyft rides (requires linked Lyft account)
                      Plaid signals: dining merchants, Bilt Travel bookings, Lyft transactions.
```

```
benefit_key:          bilt_palladium_tiered_rent_multiplier
card_type:            bilt_palladium
benefit_name:         Tiered Rent/Mortgage/HOA Points Multiplier (up to 1.25x unlock)
benefit_partner:      null
benefit_type:         points_multiplier_conditional
annual_value:         variable (depends on housing spend and unlock achievement)
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    auto (triggers when cumulative non-rent/mortgage spend reaches 100%+ of monthly housing amount)
expiration_date:      null (permanent)
trackable_via_plaid:  true (Plaid can detect spending threshold + rent/mortgage transactions)
reset_basis:          monthly
rollover:             n/a
notes:                Tiered structure (details inferred from research data):
                      - Baseline: 0x on rent/mortgage (no points on housing)
                      - Unlock: Spend ≥100% of housing amount in a calendar month on other purchases
                      - Unlocked rate: up to 1.25x on all rent/mortgage/HOA in that month
                      Example: $2,000/mo rent + $2,000 other spend = unlocked 1.25x on housing
                      Example: $2,000/mo rent + $3,000 other spend = still unlocked 1.25x (threshold met)
                      Example: $2,000/mo rent + $1,500 other spend = 0x on housing (threshold NOT met)
                      Incentivizes monthly spend velocity to unlock housing rewards.
                      Highly trackable: compare monthly non-rent spend to known/reported rent amount.
                      Critical insight angle: "You're $X away from unlocking 1.25x on your $Y rent payment."
```

```
benefit_key:          bilt_palladium_point_accelerator
card_type:            bilt_palladium
benefit_name:         Point Accelerator: 3x Multiplier on Next Spend (5x/year)
benefit_partner:      Bilt (internal)
benefit_type:         points_multiplier_conditional
annual_value:         variable (depends on accelerator usage)
period_type:          per_activation
period_value:         null
max_per_period:       5 activations per year
activation_required:  true
activation_method:    redeem $200 Bilt Cash → unlock for next $5,000 spend
expiration_date:      null (resets annually)
trackable_via_plaid:  true (Bilt Cash redemption + subsequent spend spike)
reset_basis:          calendar_year
rollover:             false
notes:                Premium spend accelerator feature:
                      Step 1: Redeem $200 Bilt Cash via Bilt dashboard
                      Step 2: Unlock 3x multiplier on Bilt Points for next $5,000 spend
                      Step 3: Any purchases made count toward the $5,000 cap at 3x rate
                      Effective value: $5,000 × (3x − 2x baseline) × 1 point = 5,000 bonus points
                      At 2.2cpp: 5,000 pts = $110 value, but costs $200 Bilt Cash to unlock = poor ROI unless accelerating high-value purchases
                      Up to 5 activations/year: max $1,000 Bilt Cash spend, max 25,000 bonus points
                      Intended for large planned purchases (furniture, electronics, home improvements).
                      Trackable: monitor Bilt Cash redemption events paired with spending spikes.
```

### Points Valuation

```
benefit_key:          bilt_palladium_points_valuation
card_type:            bilt_palladium
benefit_name:         Bilt Points Valuation & Transfer Partners
benefit_partner:      24-25 airline + hotel transfer partners
benefit_type:         transfer_partners
annual_value:         variable (1.5-2.2cpp via transfers)
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null (points transfer to partner accounts)
expiration_date:      null (permanent)
trackable_via_plaid:  false (partner transfers not on statement)
reset_basis:          n/a
rollover:             n/a
notes:                Bilt Points transfer to 24-25 partners (17-19 airlines + 7 hotels), mostly 1:1
                      (Wyndham 1:1; I Prefer 1:2; Accor 3:2, NOT 1:1).
                      Transfer partner list (verified Aug 2026):
                        Airlines (17-19): United, American (via Amtrak), Southwest (via Amtrak), Alaska (via Amtrak),
                                  Air Canada Aeroplan, Emirates, Singapore Airlines, JAL, Lufthansa, Air France-KLM, Iberia, TAP, others
                        Hotels (7): World of Hyatt, Marriott Bonvoy, Hilton Honors, IHG Club, Accor (3:2 ratio, all brands),
                                  Wyndham (1:1, added Mar 2026), Preferred Hotels "I Prefer" (1:2, added Jun 2026)
                      Estimated transfer value: up to 2.2cpp via transfer partners.
                      Actual value ranges 1.5cpp-2.2cpp depending on transfer strategy and airline policies.
                      Rent Day (1st of month): 75% transfer bonus to all partners (Palladium grants Gold status).
                      Example: Transfer 10,000 pts on rent day = 10,000 + 7,500 bonus = 17,500 airline miles.
                      Key advantage: Hyatt transfers are widely considered best value (40+ hours at premium properties).
                      Significantly broader than most new rental cards — differentiator on Compare page.
```

```
benefit_key:          bilt_palladium_rent_day_bonus
card_type:            bilt_palladium
benefit_name:         Rent Day (1st of Month) Transfer Bonus: 75%
benefit_partner:      24-25 transfer partners
benefit_type:         points_bonus_conditional
annual_value:         variable (depends on transfer volume and timing)
period_type:          monthly
period_value:         75% bonus on transfers
max_per_period:       null (uncapped transfers on rent day)
activation_required:  false
activation_method:    auto (all transfers on 1st of month receive bonus)
expiration_date:      null (permanent)
trackable_via_plaid:  false (Bilt partner transfers not visible on statement)
reset_basis:          monthly (1st of each month)
rollover:             n/a
notes:                Unique bonus: Bilt grants Gold status to all Palladium cardholders.
                      Gold status includes 75% transfer bonus on all airline + hotel partners.
                      Example 1: Transfer 10,000 pts to United on Feb 1 = 17,500 United miles
                      Example 2: Transfer 10,000 pts to Hyatt on Feb 1 = 17,500 Hyatt points
                      Incentivizes monthly point transfers on rent day — thematic connection to housing spend.
                      Highly valuable for strategic planners: time large transfers for 1st of month.
                      Not trackable via Plaid, but Bilt can report via API (transfer history).
                      Generate A1 insight: "Your next rent day (March 1) is a good time to transfer points."
```

### Insurance & Protection

```
benefit_key:          bilt_palladium_cell_phone_insurance
card_type:            bilt_palladium
benefit_name:         Cell Phone Protection Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0 (per-claim basis)
period_type:          per_event
period_value:         800 (per claim)
max_per_period:       1600 (2 claims per 12-month period)
activation_required:  false
activation_method:    null (automatic when phone is purchased with card)
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          rolling 12-month
rollover:             n/a
notes:                Covers accidental damage, theft, and loss of cell phones purchased with Bilt card.
                      Claim limit: $800/claim, max 2 claims per 12-month rolling period.
                      Deductible: $25/claim.
                      Maximum annual benefit: $1,600 (2 × $800).
                      Covers: iPhone, Samsung, Google Pixel, and other smartphones.
                      Does NOT cover: phone plans, data, or service interruption.
                      Solid secondary benefit for frequent device upgraders.
```

```
benefit_key:          bilt_palladium_rental_car_cdw
card_type:            bilt_palladium
benefit_name:         Rental Car Collision Damage Waiver (CDW)
benefit_partner:      null
benefit_type:         insurance
annual_value:         0 (per-event basis)
period_type:          per_event
period_value:         full rental value (no cap stated)
max_per_period:       null
activation_required:  false
activation_method:    null (decline rental agency insurance, charge to Bilt card)
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          n/a
rollover:             n/a
notes:                PRIMARY coverage for US rentals, SECONDARY coverage for international.
                      Covers collision, theft, and vandalism.
                      Must decline rental agency insurance and charge rental to Bilt card.
                      US rentals: Bilt CDW pays first (primary).
                      International rentals: Bilt CDW covers excess over personal auto insurance (secondary).
                      CRITICAL: PRIMARY US coverage is highly valuable — most premium cards offer secondary only.
                      Differentiator on Compare page vs. competing rental cards.
```

```
benefit_key:          bilt_palladium_trip_delay
card_type:            bilt_palladium
benefit_name:         Trip Delay Reimbursement Insurance
benefit_partner:      null
benefit_type:         insurance
annual_value:         0 (per-event basis)
period_type:          per_event
period_value:         300
max_per_period:       300 per trip
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false
reset_basis:          per_event
rollover:             n/a
notes:                Reimburses up to $300 per trip for covered reasonable expenses
                      when trip is delayed 6+ hours (or requires overnight stay).
                      Covers meals, lodging, toiletries, phone calls, and other necessities.
                      Limit: 1 claim per 12-month rolling period.
                      Competitive vs. CSP ($500, no rolling limit stated) and Gold ($300, max 2 claims/12 months).
                      Solid travel protection for new rental card.
```

```
benefit_key:          bilt_palladium_no_ftf
card_type:            bilt_palladium
benefit_name:         No Foreign Transaction Fees
benefit_partner:      null
benefit_type:         fee_waiver
annual_value:         variable (saves ~3% on international spend)
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  true (can detect international transactions)
reset_basis:          n/a
rollover:             n/a
notes:                No 3% foreign transaction fee on purchases abroad or in foreign currencies.
                      Standard on premium cards (CSR, Gold, Platinum all have this).
                      Not a differentiator on Compare page but essential for international travelers.
                      Trackable: monitor foreign currency transactions and merchant codes.
```

### Benefit Catalog Summary

| # | Benefit Key | Type | Annual Value | Period | Trackable | Enrollment |
|---|---|---|---|---|---|---|
| 1 | bilt_palladium_hotel_credit | statement_credit | $400 | Semi-annual (Jan/Jul) | Yes | No |
| 2 | bilt_palladium_bilt_cash_annual_credit | statement_credit | $200 | Annual (Jan 1) | Yes | No |
| 3 | bilt_palladium_priority_pass | lounge_access | ~$300+ | Annual | No | Yes |
| 4 | bilt_palladium_bilt_cash_earn | cash_back | Variable | Ongoing | Yes | No |
| 5 | bilt_palladium_bilt_cash_redemptions | flexible_redemption | Variable | Ongoing | Partial | No |
| 6 | bilt_palladium_2x_points_everyday | points_multiplier | Variable | Ongoing | Yes | No |
| 7 | bilt_palladium_bonus_category_multipliers | points_multiplier | Variable | Ongoing | Yes | Partial (Lyft link) |
| 8 | bilt_palladium_tiered_rent_multiplier | points_multiplier_conditional | Variable | Monthly (unlock) | Yes | No |
| 9 | bilt_palladium_point_accelerator | points_multiplier_conditional | Variable | Per-activation (5x/yr) | Yes | No |
| 10 | bilt_palladium_points_valuation | transfer_partners | Variable | Ongoing | No | No |
| 11 | bilt_palladium_rent_day_bonus | points_bonus_conditional | Variable | Monthly (1st) | No | No |
| 12 | bilt_palladium_cell_phone_insurance | insurance | $0 (per-claim) | Per event | No | No |
| 13 | bilt_palladium_rental_car_cdw | insurance | $0 (per-event) | Per event | No | No |
| 14 | bilt_palladium_trip_delay | insurance | $0 (per-event) | Per event | No | No |
| 15 | bilt_palladium_no_ftf | fee_waiver | Variable | Ongoing | Yes | No |

**Total: 15 benefits**

**Hard credits total: $600/yr** ($400 hotel + $200 Bilt Cash)

**Bilt Cash annual earning (moderate non-rent spender, $24K/yr): $960/yr**

**Points value (2.2cpp, $24K non-rent spend at 2x): $1,056/yr** (24,000 pts × $0.022)

**Total estimated value (before rent multiplier & accelerator): ~$2,616/yr**

**Annual fee: ($495)**

**Net value: ~$2,121/yr** (Note: Does not include rent points or Priority Pass lounge value)

**Benefits requiring activation: 1** (Priority Pass enrollment — others auto-activate)

---

## Competitor Map

### Entry 1: Generic Spending Redirect to Bilt (Everyday Earn Advantage)

```
card_type:              bilt_palladium
benefit_key:            bilt_palladium_2x_points_everyday
benefit_partner:        Bilt Palladium
competitor_merchant:    Any non-Bilt card
plaid_merchant_pattern: (all transactions except RENT/MORTGAGE)
category:               everyday_spending
insight_type:           A1
dollar_signal:          2x points + 4% Bilt Cash (simultaneous dual earning)
notes:                  Copy: "You spent $5,200 last month on everyday purchases. Bilt Palladium earns 2x points + 4% cash simultaneously — you'd have earned $208 more in value vs. your current card."
                        This mapping fires when Zurp detects spending on a competing card (Citi Strata Elite, CSR, Gold, etc).
                        Dual currency advantage is strongest selling point vs. single-currency competitors.
                        Requires multi-card visibility (v2 feature).
                        Deferred to v2.
```

### Entry 2: Rent/Mortgage Unlock — Tiered Bonus Approach

```
card_type:              bilt_palladium
benefit_key:            bilt_palladium_tiered_rent_multiplier
benefit_partner:        Bilt Palladium
competitor_merchant:    Alternative housing payment cards (or no card payment)
plaid_merchant_pattern: RENT|MORTGAGE
category:               housing_spend
insight_type:           A1
dollar_signal:          1.25x on housing (after threshold unlock)
notes:                  Copy: "Your rent is $2,000. You're $600 away from unlocking 1.25x points on your next payment — spend $1,400 more this month to unlock."
                        Fires when Zurp detects rent/mortgage transactions + calculates remaining spend to unlock threshold.
                        Most powerful insight: links rent payment (cardholder pain point) to spending opportunity.
                        Requires housing amount discovery (self-reported or inferred from rent/mortgage transaction patterns).
                        Single-card ready (v1) once housing amount is known.
```

### Entry 3: Bilt Cash Expiration Warning (Redemption Prompt)

```
card_type:              bilt_palladium
benefit_key:            bilt_palladium_bilt_cash_earn
benefit_partner:        Bilt (redemption partners)
competitor_merchant:    (N/A — internal Bilt system)
plaid_merchant_pattern: (N/A)
category:               account_management
insight_type:           C0 (retention/engagement, not a redirect)
dollar_signal:          $X Bilt Cash expiring Dec 31
notes:                  Copy: "You have $184 Bilt Cash expiring in 14 days. Redeem now for hotel credits, fitness, dining, or Lyft to avoid losing it."
                        Fires Nov 15 - Dec 31 when unused Bilt Cash > $100 (since $100 rolls over).
                        Link to specific redemption options with cardholder's preferred spend patterns.
                        Retention signal: users who redeem Bilt Cash are more engaged.
                        Single-card ready (v1) — tracks Bilt Cash balance directly.
```

### Entry 4: Point Accelerator Strategic Timing (Large Purchase Signal)

```
card_type:              bilt_palladium
benefit_key:            bilt_palladium_point_accelerator
benefit_partner:        Bilt Palladium
competitor_merchant:    (N/A)
plaid_merchant_pattern: (category: electronics, furniture, home_improvement, retail >$500)
category:               planned_spending
insight_type:           A1 (earning rate boost)
dollar_signal:          $200 Bilt Cash → unlock 3x for $5,000 spend = 5,000 bonus points (~$110 value)
notes:                  Copy: "You spent $3,200 on furniture. For your next big purchase, consider using Bilt's Point Accelerator: spend $200 Bilt Cash to unlock 3x points on the next $5,000 of spending."
                        Fires when Zurp detects large purchases or seasonal spending spikes (holidays, home improvement season).
                        Only valuable if cardholder plans to spend $5,000+ within the accelerator window.
                        Requires spending pattern prediction (v2 with ML forecasting).
                        Deferred to v2 or rolled into engagement campaigns.
```

### Entry 5: Rent Day Transfer Bonus (Monthly Optimization)

```
card_type:              bilt_palladium
benefit_key:            bilt_palladium_rent_day_bonus
benefit_partner:        24-25 transfer partners
competitor_merchant:    (N/A — internal Bilt)
plaid_merchant_pattern: (N/A)
category:               points_strategy
insight_type:           C0 (pure engagement, no redirect)
dollar_signal:          75% bonus on all transfers (1st of month only)
notes:                  Copy: "March 1 is coming — your next Rent Day. If you plan to transfer Bilt Points to Hyatt, United, or another partner, today is the best time (75% transfer bonus)."
                        Fires 1-3 days before 1st of month if cardholder has undeployed points.
                        Non-urgent for most users (informational) but adds engagement touchpoint.
                        Calendar-based trigger: single-card ready (v1).
                        Pairs with housing spend insight for thematic consistency.
```

### Entry 6: Hotel Credit Activation Prompt (Seasonal Travel)

```
card_type:              bilt_palladium
benefit_key:            bilt_palladium_hotel_credit
benefit_partner:        Bilt Travel
competitor_merchant:    Booking.com, Expedia, Hotels.com, direct hotel bookings
plaid_merchant_pattern: HOTEL|AIRBNB|BOOKING|EXPEDIA|TRIVAGO
category:               travel
insight_type:           A1 (redirect to Bilt Travel portal)
dollar_signal:          $200 hotel credit (semi-annual)
notes:                  Copy: "You booked a hotel on Booking.com for $280. Your $200 Bilt Travel credit for Jan-Jun hasn't been used yet — book your next trip through Bilt Travel to save $200."
                        Fires when competitor hotel bookings detected + Bilt credit is available.
                        High-value redirect: $200 offset = 71% of typical mid-range hotel night.
                        Trackable: monitor Bilt Travel statement credits + hotel booking transactions.
                        Multi-card ready (v2) or single-card with competitor detection.
```

### Entry 7: Dining/Fitness Partner Redemption Suggestions (Spend Category Matching)

```
card_type:              bilt_palladium
benefit_key:            bilt_palladium_bilt_cash_redemptions
benefit_partner:        Dining partners (OpenTable, Resy, etc), fitness partners (ClassPass, Peloton, etc)
competitor_merchant:    OpenTable bookings, ClassPass, Equinox, SoulCycle, etc.
plaid_merchant_pattern: RESTAURANT|GYM|FITNESS
category:               lifestyle_spending
insight_type:           A1 (spending category match)
dollar_signal:          $10-$50/mo dining credit or $40/mo fitness credit
notes:                  Copy: "You spent $380 on dining last month. Redeem $30-50 Bilt Cash each month for dining credits instead — you'll earn 2x points on top of the credit."
                        Fires when recurring dining/fitness transactions detected.
                        Requires Bilt partnership list detail (OpenTable, Resy, etc.) — TBD by Bilt.
                        Dual benefit: points + partner credit creates good ROI story.
                        Single-card ready (v1) once partnership details are available.
```

### Competitor Map Summary

| # | Insight Type | Benefit Key | Category | Dollar Signal (per event) | Trackable | Deferred? |
|---|---|---|---|---|---|---|
| 1 | A1 | 2x_points_everyday | everyday_spending | 4% cash + 2x pts vs competitor | Yes | Yes (v2) |
| 2 | A1 | tiered_rent_multiplier | housing_spend | 1.25x unlock incentive | Yes | No |
| 3 | C0 | bilt_cash_earn | expiration_warning | $X Bilt Cash at risk | Yes | No |
| 4 | A1 | point_accelerator | planned_spending | $200 → 5,000 bonus pts | Yes | Yes (v2) |
| 5 | C0 | rent_day_bonus | transfer_optimization | 75% monthly bonus signal | No | No |
| 6 | A1 | hotel_credit | travel_redirect | $200 credit offset | Yes | No |
| 7 | A1 | bilt_cash_redemptions | lifestyle_matching | $10-50 credits/mo | Yes | No |
| **Total actionable in v1** | | | | **5** | | |

**Competitor map is mid-sized.** Bilt's dual-currency model and rent-optimized benefits create 5-7 immediate insights without multi-card visibility. Comparable to CSP in terms of actionability.

### Throttling Rules

| Category | Max Frequency | Notes |
|---|---|---|
| Housing unlock reminder | 1x/week | Avoid fatigue; weekly check sufficient for monthly threshold |
| Rent Day transfer bonus | 1x/month (1-3 days before 1st) | Calendar event — once per month |
| Bilt Cash expiration warning | 1x/week (Nov 15 - Dec 31) | Critical engagement — prevent value loss |
| Hotel credit redirect | 1x/week | Minimize spam on travel planners |
| Dining/fitness category match | 2x/month | Lifestyle insights; moderate cadence |
| Point Accelerator suggestion | 1x/quarter | Low-frequency benefit; only during projected spend spikes |

---

## Tracking Rules

| Benefit | Period Reset | How Zurp Tracks | Plaid Signal | Confidence |
|---|---|---|---|---|
| Hotel credit ($400, $200 semi-annual) | Semi-annual (Jan 1, Jul 1) | Bilt Travel statement credits on 1st of Jan and Jul | Credit transaction $200 from BILT TRAVEL | High |
| Bilt Cash annual credit ($200) | Annual (Jan 1) | Bilt Cash balance increase Jan 1 | Credit to Bilt Cash account (internal) | High |
| Bilt Cash earnings (4%) | Ongoing, resets Dec 31 | Monitor Bilt Cash balance growth; track redemptions | Bilt Cash balance + statement transactions | High |
| Priority Pass | Annual | Lounge visit history (via Bilt API) + app enrollment | Priority Pass enrollment confirmation | Medium |
| 2x everyday points | Ongoing | All non-rent/mortgage Plaid transactions | Plaid category exclusion (RENT/MORTGAGE) | High |
| 1.25x rent unlock | Monthly (threshold-based) | Compare monthly non-rent spend vs. known/reported housing amount | Rent/mortgage transaction + cumulative monthly spend | High |
| Point Accelerator | Per-activation (5x/yr cap) | Track Bilt Cash redemption events + subsequent spend spike to $5,000 | Bilt Cash debit ($200) + 30-day spending window monitoring | Medium |
| Rent Day bonus (75%) | Monthly (1st of month only) | Partner transfer history via Bilt API | Point transfer transactions (Bilt to partner accounts) | Medium |
| Cell phone insurance | Per claim (max 2/yr) | Claims history (via Bilt or user report) | Not on statement | Low |
| Rental car CDW | Per rental | Car rental transactions + claims history | Merchant: car rental company; claims = insurance activity | Low |
| Trip delay insurance | Per event (max 1/yr) | Trip transaction + claim filing (via Bilt) | Not on statement; requires user report | Low |
| No FTF | Ongoing | International transaction detection | Plaid merchant_country ≠ US | High |

### Housing Amount Discovery

**Approach:** Ask user during onboarding ("What is your monthly rent/mortgage?") + validate by scanning transaction history for recurring RENT or MORTGAGE category payments. If user skips, infer from transaction patterns (most common monthly charge to rent/mortgage merchant).

**Fallback:** If no housing payment detected (owns outright, pays elsewhere), prompt user to input amount or note "N/A". If discovered later, recalculate unlock thresholds retroactively.

**Benefit:** Once housing amount is known, tiered rent multiplier becomes highly trackable and actionable. Single most important data point for Bilt insight generation.

---

## Valuation

### Hard Credits Annual Breakdown

| Component | Annual Value | Calculation Basis |
|---|---|---|
| **Hard credits** | | |
| Hotel credit (semi-annual) | $400 | $200 × 2 (Jan 1 + Jul 1) |
| Bilt Cash annual credit | $200 | Automatic Jan 1 |
| **Subtotal hard credits** | **$600** | |

### Bilt Cash Annual Earning (Moderate Spender)

| Component | Annual Value | Calculation Basis |
|---|---|---|
| **Bilt Cash earning** | | |
| Everyday spend (excl. rent) | $24,000 | Assumed moderate non-housing spender |
| 4% Bilt Cash earned | $960 | $24,000 × 0.04 |
| Bilt Cash redemption value (estimated) | Variable | Depends on redemption choices (est. 50-100% of face value) |
| Conservative redemption value | $480 | Assume 50% effective value (mix of hotel credits, fitness, dining) |

### Bilt Points Annual Value (Moderate Spender, 2.2cpp)

| Component | Annual Value | Calculation Basis |
|---|---|---|
| **Points earning** | | |
| Everyday spend at 2x | $24,000 | Non-housing purchases |
| Points earned (2x) | 48,000 | $24,000 × 2 |
| Rent unlock bonus (if achieved) | $1,100 | $2,000/mo rent × 12 × 1.25x × 0.022cpp (estimated) |
| Point Accelerator (if used 2x/yr) | $440 | $200 Bilt Cash × 2 × (5,000 pts value per activation) |
| Rent Day transfer bonus (est. annual benefit) | $396 | 10,000 avg monthly transfers × 12 × 75% bonus × 0.022cpp |
| **Subtotal points value (2.2cpp)** | **~$1,455** | |

### Total Valuation

| Component | Annual Value | Notes |
|---|---|---|
| Hard credits | $600 | $400 hotel + $200 Bilt Cash (guaranteed) |
| Bilt Cash earning value | $480 | Conservative 50% redemption rate |
| Bilt Points value (2.2cpp) | $1,455 | Includes rent unlock + accelerator + rent day bonus |
| Priority Pass (estimated) | $300 | Unlimited lounge visits + 2 free guests per visit (not trackable, estimated) |
| **Total estimated value** | **~$2,835** | |
| **Annual fee** | **($495)** | |
| **Net value** | **~$2,340** | |

### Points Valuation Detail

**Points valuation: 1.5-2.2cpp** (verified Aug 2026). Value depends on transfer strategy:

- **Conservative (1.5cpp):** Cash-back redemption or low-value airline transfers
- **Upside (2.2cpp):** Transfer partners (Hyatt, United) + Rent Day 75% bonus

Zurp models 1.5cpp conservative / 2.2cpp upside, with messaging that users can achieve higher value through strategic transfers.

### Housing Payment Spend Impact

If cardholder pays rent/mortgage with Bilt card AND unlocks 1.25x multiplier:

| Component | Annual Value | Calculation Basis |
|---|---|---|
| Monthly rent/mortgage | $2,000 | Assumed baseline |
| Annual housing spend | $24,000 | $2,000 × 12 |
| 1.25x multiplier unlock (monthly) | $2,500 | Unlocked 10 months/12 (assuming spend threshold met 83% of months) |
| Points earned on housing | $550 | 2,500 pts × 10 months × 0.022cpp |
| **Housing benefit (incremental vs. competitor)** | **~$550** | Added value if rent/mortgage routing to Bilt card |

**Critical note:** Housing payments must be routed to Bilt card to capture points. Many users pay rent via ACH/check or on non-card platforms (Venmo, payment apps). This is Bilt's core customer acquisition strategy: "Put your rent on this card and earn points."

---

## Annual Fee Analysis

**Annual fee: $495**

**Breakeven calculation (moderate spender):**
- Hard credits: $600
- Net after fee: $600 − $495 = **$105 ahead on hard credits alone**
- Bilt Cash earning + redemption: $480 additional value
- Points value (2.2cpp): $1,455 additional value
- **Total net value: ~$2,340 after fee**

**For rent-routing users (aggressive scenario):**
- Housing points unlock: +$550
- **Revised net value: ~$2,890 after fee**

**Fee is reasonable vs. competitors:**
- CSP: $95 fee, ~$526 net value
- CSR: $550 fee, ~$2,600 net value
- Platinum: $695 fee, ~$5,000+ net value
- Bilt Palladium: $495 fee, ~$2,340 net value

**Positioning:** Bilt Palladium slots between CSP and CSR in terms of fee/value ratio. Premium positioning justified by: dual-currency earning (points + cash), rent optimization, 24-25 transfer partners, $600 hard credits.

---

## Engine Requirements (Bilt-Specific)

| Requirement | Status | Notes |
|---|---|---|
| Housing amount discovery | REQUIRED | Core to tiered rent multiplier unlock. Onboarding question + transaction pattern inference. |
| Bilt Cash balance tracking | REQUIRED | Monthly balance monitoring, expiration warning (Nov 15 - Dec 31), redemption pattern analysis. |
| Monthly spend threshold calculation | REQUIRED | Compare non-rent spend vs. housing amount to determine 1.25x unlock status. Resets monthly. |
| Rent Day calendar trigger | REQUIRED | 1st of month automation for transfer bonus messaging. Pair with points balance check. |
| Bilt Cash expiration warning | REQUIRED | Fire warning if balance > $100 on Nov 15. High-engagement retention signal. |
| Point Accelerator tracking | REQUIRED | Monitor Bilt Cash redemption events ($200 debit). Pair with 30-day spend window (must reach $5,000 for full benefit). |
| Partner transfer history API | REQUIRED | Integrate Bilt Transfer API to track Point Accelerator usage, Rent Day bonuses, partner-specific redemption patterns. |
| Priority Pass integration | REQUIRED | Link Priority Pass account to Bilt card via enrollment flow. Track lounge visits for engagement signal. |
| Semi-annual credit reset | REQUIRED | Jan 1 and Jul 1 hotel credit deposits. Different from calendar-year cards (CSP, Gold). |
| Rent/mortgage category filtering | REQUIRED | Plaid category: RENT or MORTGAGE. Exclude from everyday 2x earn, apply 1.25x conditional multiplier. |
| Multi-redemption recommendation engine | REQUIRED | Based on cardholder's historical spending patterns, suggest optimal Bilt Cash redemptions (dining vs. fitness vs. hotel credits). |

---

## Card Type Constants (Config Reference)

```
card_type:                bilt_palladium
card_name:                Bilt Palladium Card
issuer:                   Column N.A. (Cardless)
network:                  Mastercard World Legend
annual_fee:               495
launch_date:              2026-02-07
research_date:            2026-02-11
last_verified:            2026-08-13

points_currency:          bilt_points (primary) + bilt_cash (secondary)
points_valuation:         1.5-2.2 (cpp; conservative 1.5, upside 2.2 via transfer partners)
transfer_partners:        24-25 (17-19 airlines + 7 hotels; Wyndham 1:1, I Prefer 1:2, Accor 3:2)
transfer_bonus:           75% on Rent Day (1st of month, Gold status)

hard_credits_annual:      600 (hotel 400 + cash 200)
bilt_cash_expiration:     2026-12-31 (annual, $100 rollover allowed)
reset_basis_primary:      calendar_year (Bilt Cash, points)
reset_basis_secondary:    semi-annual (hotel credit: Jan 1, Jul 1)
```
