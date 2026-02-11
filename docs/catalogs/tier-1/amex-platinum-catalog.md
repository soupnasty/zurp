# Amex Platinum Card — Benefit Catalog & Competitor Map

Implementation-ready data for the Zurp insight engine. Format matches CSR, CSP, and Amex Gold catalogs.

---

## Card Overview

| Field | Value |
|---|---|
| Card | The Platinum Card® from American Express |
| Issuer | American Express (charge card) |
| Annual fee | $895 (increased from $695; effective for new applicants Sept 18, 2025; existing cardholders at next renewal on or after Jan 2, 2026) |
| Authorized user fee | $195 (up to 3 additional cards at $195 each) |
| card_type | `amex_platinum` |
| Points currency | Membership Rewards |
| Points valuation | 2.0cpp (TPG/UP consensus; conservative: 1.6cpp) |
| Transfer partners | 21+ airlines & hotels (varies by partner; mostly 1:1 ratio) |
| Fee anniversary | Account open date |
| Benefit period | Varies — see individual benefits. Mix of calendar year, semi-annual, quarterly, monthly, and per-event. |
| Research date | February 2026 |
| Benefit refresh | September 18, 2025 (major overhaul). New benefits effective immediately for all cardholders; fee increase phased. |

---

## Part 1: Benefit Catalog

### Hard Credits — Statement Credits & In-App Credits

---

```
benefit_key:          plat_hotel_credit_h1
card_type:            amex_platinum
benefit_name:         Prepaid Hotel Credit (H1)
benefit_partner:      Fine Hotels + Resorts / The Hotel Collection (via AmexTravel.com)
benefit_type:         statement_credit
annual_value:         300 (H1 portion; $600 total annually)
period_type:          semi_annual
period_value:         300
max_per_period:       300
activation_required:  false
activation_method:    null (auto-applies on qualifying prepaid bookings)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  partially (Amex Travel statement credit visible; cannot distinguish FHR from THC)
reset_basis:          calendar_half (H1: Jan 1 – Jun 30)
rollover:             false (unused H1 does NOT carry to H2)
notes:                Must book prepaid stays through AmexTravel.com at Fine Hotels + Resorts (FHR)
                      or The Hotel Collection (THC) properties.
                      THC requires minimum 2-night stay; FHR has no night minimum.
                      FHR perks: daily breakfast for two, room upgrade when available,
                      $100 property credit, noon check-in when available, guaranteed 4PM late checkout.
                      THC perks: room upgrade when available, $100 property credit (2-night min).
                      Increased from $200/year to $600/year in Sept 2025 refresh.
                      Purchases covered by credit still earn 5x MR points on prepaid AmexTravel hotels.
                      Over 1,800 FHR properties and 1,300+ THC properties worldwide.
```

```
benefit_key:          plat_hotel_credit_h2
card_type:            amex_platinum
benefit_name:         Prepaid Hotel Credit (H2)
benefit_partner:      Fine Hotels + Resorts / The Hotel Collection (via AmexTravel.com)
benefit_type:         statement_credit
annual_value:         300 (H2 portion; $600 total annually)
period_type:          semi_annual
period_value:         300
max_per_period:       300
activation_required:  false
activation_method:    null
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  partially
reset_basis:          calendar_half (H2: Jul 1 – Dec 31)
rollover:             false
notes:                Same terms as H1. Two independent $300 credits per half-year.
                      Booking can be made in one half but stay in the next — charge date determines
                      which half the credit applies to.
```

---

```
benefit_key:          plat_resy_credit_q1
card_type:            amex_platinum
benefit_name:         Resy Dining Credit (Q1)
benefit_partner:      Resy
benefit_type:         statement_credit
annual_value:         100 (Q1 portion; $400 total annually)
period_type:          quarterly
period_value:         100
max_per_period:       100
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing; added in Sept 2025 refresh)
trackable_via_plaid:  true (statement credit from Resy-affiliated restaurants)
reset_basis:          calendar_quarter (Q1: Jan 1 – Mar 31)
rollover:             false (unused Q1 does NOT carry to Q2)
notes:                Credit triggers at U.S. restaurants participating in Resy network OR
                      purchases on Resy.com/app.
                      Reservation through Resy is NOT required — just dine at a Resy-affiliated
                      restaurant and pay with Platinum Card.
                      Over 10,000 U.S. Resy restaurants.
                      NEW in Sept 2025 refresh. Quarterly = 4 independent $100 credits.
                      Also includes access to Platinum Nights by Resy (currently LA, Miami, NYC).
                      Same Resy network as Amex Gold ($100/yr semi-annual) but Platinum gets 4x the value.
                      IMPORTANT: Gold gets $100/yr semi-annual; Platinum gets $400/yr quarterly.
```

```
benefit_key:          plat_resy_credit_q2
card_type:            amex_platinum
benefit_name:         Resy Dining Credit (Q2)
benefit_partner:      Resy
benefit_type:         statement_credit
annual_value:         100 (Q2 portion)
period_type:          quarterly
period_value:         100
max_per_period:       100
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          calendar_quarter (Q2: Apr 1 – Jun 30)
rollover:             false
notes:                Same terms as Q1.
```

```
benefit_key:          plat_resy_credit_q3
card_type:            amex_platinum
benefit_name:         Resy Dining Credit (Q3)
benefit_partner:      Resy
benefit_type:         statement_credit
annual_value:         100 (Q3 portion)
period_type:          quarterly
period_value:         100
max_per_period:       100
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          calendar_quarter (Q3: Jul 1 – Sep 30)
rollover:             false
notes:                Same terms as Q1.
```

```
benefit_key:          plat_resy_credit_q4
card_type:            amex_platinum
benefit_name:         Resy Dining Credit (Q4)
benefit_partner:      Resy
benefit_type:         statement_credit
annual_value:         100 (Q4 portion)
period_type:          quarterly
period_value:         100
max_per_period:       100
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          calendar_quarter (Q4: Oct 1 – Dec 31)
rollover:             false
notes:                Same terms as Q1.
```

---

```
benefit_key:          plat_lululemon_credit_q1
card_type:            amex_platinum
benefit_name:         Lululemon Credit (Q1)
benefit_partner:      lululemon
benefit_type:         statement_credit
annual_value:         75 (Q1 portion; $300 total annually)
period_type:          quarterly
period_value:         75
max_per_period:       75
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing; added in Sept 2025 refresh)
trackable_via_plaid:  true (Plaid merchant: "LULULEMON", "LULULEMON ATHLETICA")
reset_basis:          calendar_quarter (Q1: Jan 1 – Mar 31)
rollover:             false
notes:                Valid at U.S. lululemon retail stores and lululemon.com.
                      Outlet locations are EXCLUDED.
                      Purchases through third parties (e.g., Amazon) do NOT qualify.
                      NEW in Sept 2025 refresh.
                      Can stack with Rakuten shopping portal for additional cashback/MR points.
                      Quarterly = 4 independent $75 credits.
                      Statement credit posts within days to 8 weeks per terms.
```

```
benefit_key:          plat_lululemon_credit_q2
card_type:            amex_platinum
benefit_name:         Lululemon Credit (Q2)
benefit_partner:      lululemon
benefit_type:         statement_credit
annual_value:         75 (Q2 portion)
period_type:          quarterly
period_value:         75
max_per_period:       75
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          calendar_quarter (Q2: Apr 1 – Jun 30)
rollover:             false
notes:                Same terms as Q1.
```

```
benefit_key:          plat_lululemon_credit_q3
card_type:            amex_platinum
benefit_name:         Lululemon Credit (Q3)
benefit_partner:      lululemon
benefit_type:         statement_credit
annual_value:         75 (Q3 portion)
period_type:          quarterly
period_value:         75
max_per_period:       75
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          calendar_quarter (Q3: Jul 1 – Sep 30)
rollover:             false
notes:                Same terms as Q1.
```

```
benefit_key:          plat_lululemon_credit_q4
card_type:            amex_platinum
benefit_name:         Lululemon Credit (Q4)
benefit_partner:      lululemon
benefit_type:         statement_credit
annual_value:         75 (Q4 portion)
period_type:          quarterly
period_value:         75
max_per_period:       75
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          calendar_quarter (Q4: Oct 1 – Dec 31)
rollover:             false
notes:                Same terms as Q1.
```

---

```
benefit_key:          plat_digital_entertainment
card_type:            amex_platinum
benefit_name:         Digital Entertainment Credit
benefit_partner:      Disney+, Disney+ Bundle, ESPN+, Hulu, The New York Times, Paramount+,
                      Peacock, The Wall Street Journal, YouTube Premium, YouTube TV
benefit_type:         statement_credit
annual_value:         300
period_type:          monthly
period_value:         25
max_per_period:       25
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true (statement credits from eligible streaming/news providers)
reset_basis:          calendar_month
rollover:             false (unused monthly credit is forfeited)
notes:                Increased from $20/mo ($240/yr) to $25/mo ($300/yr) in Sept 2025 refresh.
                      Paramount+, YouTube Premium, and YouTube TV added in Sept 2025 refresh.
                      Must purchase subscriptions DIRECTLY from providers — bundles through cable
                      services or third-party purchases do NOT qualify.
                      Gift card purchases do NOT qualify.
                      Can split credit across multiple services in same month (up to $25 total).
                      Both primary and authorized users' purchases count toward same $25/mo limit.
                      Mobile app purchases may not qualify — use provider's website.
                      NOTE: Walmart+ membership (separate benefit) includes free Paramount+ Essential
                      or Peacock Premium (with ads). Don't double-pay for these.
                      Plaid merchant patterns: "DISNEY PLUS", "HULU", "ESPN", "PARAMOUNT",
                      "PEACOCK", "NY TIMES", "NYT", "WSJ", "YOUTUBE", "GOOGLE*YOUTUBE".
```

---

```
benefit_key:          plat_uber_cash
card_type:            amex_platinum
benefit_name:         Uber Cash
benefit_partner:      Uber
benefit_type:         uber_cash (in-app balance, NOT statement credit)
annual_value:         200
period_type:          monthly
period_value:         15 (standard months); 35 (December)
max_per_period:       15 (Jan-Nov), 35 (Dec)
activation_required:  true
activation_method:    enrollment (add Platinum Card to Uber account)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  false (Uber Cash is in-app balance reduction, not statement credit)
reset_basis:          calendar_month
rollover:             false (unused monthly Uber Cash is forfeited at month end)
notes:                $15/month Jan-Nov + $35 in December = $200/year.
                      ($15 × 11 = $165) + $35 = $200.
                      Applies to Uber rides AND Uber Eats in the U.S.
                      Must add Platinum Card to Uber account AND select an Amex card for transaction.
                      After Uber Cash depleted, remaining charge goes to payment method.
                      Only primary cardholder receives Uber Cash — authorized users do NOT get own deposit.
                      Uber Cash deposited on 1st of each month.
                      SAME detection challenge as Gold Card's Uber Cash — infer from transaction presence.
                      Amex Gold gets $10/mo ($120/yr) + $10 Dec bonus = $130/yr.
                      Amex Platinum gets $15/mo ($165/yr) + $20 Dec bonus = $200/yr.
                      Platinum gets $70/yr more in Uber Cash than Gold.
```

---

```
benefit_key:          plat_uber_one
card_type:            amex_platinum
benefit_name:         Uber One Membership Credit
benefit_partner:      Uber
benefit_type:         statement_credit
annual_value:         120
period_type:          annual
period_value:         120
max_per_period:       120
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab, then purchase Uber One with Platinum Card)
expiration_date:      null (ongoing; added in Sept 2025 refresh)
trackable_via_plaid:  true (Uber One subscription charge + corresponding statement credit)
reset_basis:          calendar_year
rollover:             false
notes:                Up to $120 in statement credits per calendar year for auto-renewing Uber One membership.
                      Uber One costs $9.99/month ($119.88/yr) or $96/year (annual plan).
                      Credit fully covers either payment option.
                      Uber One benefits: $0 delivery fee on Uber Eats orders $15+, up to 10% off
                      eligible Uber Eats orders, 5% off eligible Uber rides, priority airport pickups.
                      Subject to auto-renewal — Amex credits the subscription charge.
                      NEW in Sept 2025 refresh.
                      Stacks well with Uber Cash: use Uber Cash first, then Uber One discounts
                      apply to any remaining charges.
                      Plaid merchant pattern: "UBER ONE", "UBER *ONE".
```

---

```
benefit_key:          plat_airline_fee_credit
card_type:            amex_platinum
benefit_name:         Airline Incidental Fee Credit
benefit_partner:      One selected qualifying airline per calendar year
benefit_type:         statement_credit
annual_value:         200
period_type:          annual
period_value:         200
max_per_period:       200
activation_required:  true
activation_method:    enrollment (select airline in Amex online account, must select BEFORE purchase)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  partially (airline incidental charges visible, but credit is Amex statement credit)
reset_basis:          calendar_year (Jan 1 reset; airline selection can be changed each January)
rollover:             false
notes:                Covers incidental fees ONLY: checked bags, seat assignments, in-flight food/drinks,
                      lounge day passes, pet fees. Does NOT cover airfare, upgrades, mileage purchases,
                      gift cards, duty-free, or award tickets.
                      Must select ONE airline per calendar year before making purchases.
                      Cannot change airline mid-year (selection locks until January).
                      Qualifying airlines include: Alaska, American, Delta, Frontier, Hawaiian,
                      JetBlue, Southwest, Spirit, United.
                      Workaround: United TravelBank loading ($50 increments) and Delta eCredits
                      + partial card charge (<$250) have historically triggered credits.
                      Statement credit typically posts within 2-4 weeks.
                      Amex relies on airlines to submit correct transaction info.
                      If credit doesn't appear after 8 weeks, call number on back of card.
```

---

```
benefit_key:          plat_saks_h1
card_type:            amex_platinum
benefit_name:         Saks Fifth Avenue Credit (H1)
benefit_partner:      Saks Fifth Avenue / saks.com
benefit_type:         statement_credit
annual_value:         50 (H1 portion; $100 total annually)
period_type:          semi_annual
period_value:         50
max_per_period:       50
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true (Plaid merchant: "SAKS FIFTH AVENUE", "SAKS DIRECT", "SAKSFIFTHAVENUE.COM")
reset_basis:          calendar_half (H1: Jan 1 – Jun 30)
rollover:             false
notes:                Valid at Saks Fifth Avenue stores and saks.com.
                      Saks OFF 5th stores and saksoff5th.com do NOT qualify.
                      Gift card purchases do NOT qualify (changed ~2023).
                      No minimum purchase required.
                      Saks charges $9.95 shipping under $300 — effectively reduces credit to ~$40.
                      NOTE: Saks Global filed Chapter 11 bankruptcy Jan 13, 2026.
                      Amex confirmed benefit continues to work during restructuring.
                      Recommend users use credit sooner rather than later given uncertainty.
```

```
benefit_key:          plat_saks_h2
card_type:            amex_platinum
benefit_name:         Saks Fifth Avenue Credit (H2)
benefit_partner:      Saks Fifth Avenue / saks.com
benefit_type:         statement_credit
annual_value:         50 (H2 portion)
period_type:          semi_annual
period_value:         50
max_per_period:       50
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null
trackable_via_plaid:  true
reset_basis:          calendar_half (H2: Jul 1 – Dec 31)
rollover:             false
notes:                Same terms as H1. Saks charges card when items SHIP, not when ordered.
                      Order placed in June but shipped in July counts toward H2 credit.
```

---

```
benefit_key:          plat_equinox
card_type:            amex_platinum
benefit_name:         Equinox Credit
benefit_partner:      Equinox
benefit_type:         statement_credit
annual_value:         300
period_type:          annual
period_value:         300
max_per_period:       300
activation_required:  true
activation_method:    enrollment (visit platinum.equinox.com to enroll)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true (Plaid merchant: "EQUINOX")
reset_basis:          calendar_year
rollover:             false
notes:                Valid for Equinox gym club membership OR Equinox+ digital app subscription.
                      Subject to auto-renewal.
                      Equinox club memberships start ~$200-350/month depending on location
                      (credit covers partial cost).
                      Equinox+ app is $40/month ($480/yr) — credit covers ~7.5 months.
                      Niche benefit: only valuable if user is near an Equinox location or wants app.
                      Equinox has ~100 locations primarily in major U.S. cities + London.
```

---

```
benefit_key:          plat_walmart_plus
card_type:            amex_platinum
benefit_name:         Walmart+ Monthly Membership Credit
benefit_partner:      Walmart+
benefit_type:         statement_credit
annual_value:         155 (up to $12.95 + applicable sales tax per month)
period_type:          monthly
period_value:         12.95 (plus applicable local sales tax)
max_per_period:       ~13.50 (varies by state sales tax)
activation_required:  true
activation_method:    enrollment (sign up for Walmart+ with Platinum Card as payment)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true (Plaid merchant: "WALMART+", "WAL-MART")
reset_basis:          calendar_month
rollover:             n/a (monthly subscription)
notes:                Covers the monthly Walmart+ membership fee ($12.95/mo + local tax).
                      Subject to auto-renewal. Plus Ups excluded.
                      Walmart+ benefits: free delivery, free shipping (no minimum), Paramount+
                      Essential streaming (separate enrollment required), scan & go, member prices
                      on fuel.
                      NOTE: Walmart+ includes free Paramount+ Essential or Peacock Premium
                      (ad-supported). Do not also charge these to digital entertainment credit.
                      Annual Walmart+ plan ($98/yr) may NOT trigger monthly credits correctly —
                      monthly billing recommended.
```

---

```
benefit_key:          plat_clear
card_type:            amex_platinum
benefit_name:         CLEAR+ Membership Credit
benefit_partner:      CLEAR
benefit_type:         statement_credit
annual_value:         209
period_type:          annual
period_value:         209
max_per_period:       209
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab, then purchase CLEAR+ membership)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true (Plaid merchant: "CLEAR", "CLEARME")
reset_basis:          calendar_year (credit applies to annual CLEAR+ renewal)
rollover:             false
notes:                CLEAR+ membership costs $209/year (increased from $199 in July 2025).
                      Credit fully covers membership cost.
                      Subject to auto-renewal.
                      CLEAR+ provides expedited identity verification at 50+ airports and venues.
                      Works alongside TSA PreCheck/Global Entry (CLEAR skips ID line,
                      PreCheck skips screening line).
                      Updated from $199 to $209 credit in Sept 2025 refresh to match price increase.
```

---

```
benefit_key:          plat_oura
card_type:            amex_platinum
benefit_name:         Oura Ring Credit
benefit_partner:      Oura Ring (ouraring.com)
benefit_type:         statement_credit
annual_value:         200
period_type:          annual
period_value:         200
max_per_period:       200
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab)
expiration_date:      null (ongoing; added in Sept 2025 refresh)
trackable_via_plaid:  true (Plaid merchant: "OURA", "OURARING")
reset_basis:          calendar_year
rollover:             false
notes:                Valid ONLY for Oura Ring hardware purchases through ouraring.com.
                      Does NOT cover Oura Ring monthly/annual membership ($5.99/mo or $69.99/yr).
                      Oura Ring 4 starts at $349 — after credit, effective cost is $149.
                      Purchases through third parties (Amazon, Best Buy) do NOT qualify.
                      NEW in Sept 2025 refresh.
                      Niche benefit: only valuable if user wants a health-tracking smart ring.
                      One-time-ish use: most users buy one ring per year at most.
```

---

```
benefit_key:          plat_global_entry
card_type:            amex_platinum
benefit_name:         Global Entry / TSA PreCheck Credit
benefit_partner:      CBP / TSA
benefit_type:         statement_credit
annual_value:         ~30 (amortized: $120 every 4 years or $85 every 4.5 years)
period_type:          every_4_years
period_value:         120
max_per_period:       120
activation_required:  false
activation_method:    null (auto-applies when fee is charged to card)
expiration_date:      null (ongoing benefit)
trackable_via_plaid:  true (one-time charge from CBP or TSA)
reset_basis:          4_year_cycle
rollover:             n/a
notes:                Covers Global Entry ($120 every 4 years) OR TSA PreCheck
                      (up to $85 every 4.5 years, through TSA official enrollment provider).
                      One application per cycle.
                      Same benefit as CSR. Shared with Amex Gold (Gold does NOT have this benefit).
                      Global Entry includes TSA PreCheck.
                      NEXUS ($120) also qualifies.
```

### Points Multipliers

---

```
benefit_key:          plat_5x_flights
card_type:            amex_platinum
benefit_name:         5x on Flights
benefit_partner:      Direct airlines + AmexTravel.com
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       500000 (spending cap: $500,000/yr at 5x, then reverts to 1x)
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  true (Plaid category: TRAVEL > AIRLINES)
reset_basis:          calendar_year (for spending cap)
notes:                5x on flights booked directly with airlines OR through AmexTravel.com.
                      Up to $500,000 per calendar year, then 1x.
                      OTA bookings (Expedia, Kayak, etc.) earn only 1x.
                      Same rate as before Sept 2025 refresh (unchanged).
                      Key Zurp insight: redirect OTA flight bookings to direct airline bookings.
```

```
benefit_key:          plat_5x_prepaid_hotels
card_type:            amex_platinum
benefit_name:         5x on Prepaid Hotels via AmexTravel.com
benefit_partner:      AmexTravel.com
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
activation_method:    null
expiration_date:      null
trackable_via_plaid:  false (cannot distinguish AmexTravel portal bookings from direct hotel bookings via Plaid)
notes:                5x on prepaid hotels booked through AmexTravel.com only.
                      Direct hotel bookings (Marriott.com, Hilton.com, etc.) earn only 1x.
                      OTA bookings (Hotels.com, Booking.com) earn only 1x.
                      This is a KEY difference from CSR which earns 4x on direct hotel bookings.
                      Platinum users MUST book through AmexTravel.com for elevated earn rate on hotels.
                      FHR and THC bookings also earn 5x.
```

```
benefit_key:          plat_1x_other
card_type:            amex_platinum
benefit_name:         1x on All Other Purchases
benefit_partner:      null
benefit_type:         points_multiplier
annual_value:         variable
period_type:          ongoing
period_value:         null
max_per_period:       null
activation_required:  false
notes:                1x on everything else. No bonus categories for dining, groceries, gas, etc.
                      This is the Platinum Card's biggest weakness vs. Amex Gold (4x dining/groceries)
                      and CSR (3x dining).
                      Amex positions Platinum as a companion to Gold Card for everyday spending.
```

### Travel & Access Benefits

---

```
benefit_key:          plat_lounge_access
card_type:            amex_platinum
benefit_name:         Global Lounge Collection
benefit_partner:      Multiple (Centurion, Delta Sky Club, Priority Pass, Plaza Premium, others)
benefit_type:         access_benefit
annual_value:         ~850+ (Amex claims "over $850 of annual value")
period_type:          ongoing
activation_required:  true (Priority Pass requires enrollment; others vary)
trackable_via_plaid:  false
notes:                Most extensive lounge network of any credit card — 1,550+ lounges worldwide (as of 07/2025).
                      Includes:
                      - Amex Centurion Lounges (30 locations, including upcoming Salt Lake City,
                        Newark, Amsterdam)
                      - 10 complimentary Delta Sky Club visits/year when flying eligible Delta flight
                        (subject to visit limitations)
                      - Priority Pass Select membership (enrollment required; 1,300+ lounges)
                      - Plaza Premium Lounges
                      - Select Escape Lounges
                      - Select Lufthansa Lounges
                      - Sidecar by The Centurion Lounge (new speakeasy-style; LAS opening early 2026)
                      Centurion Lounges allow cardholder + 2 guests free.
                      Priority Pass: restaurant credit benefit varies by location.
                      CSR has Priority Pass + Chase Sapphire Lounge (different network, fewer total lounges).
```

```
benefit_key:          plat_hilton_gold
card_type:            amex_platinum
benefit_name:         Complimentary Hilton Honors Gold Status
benefit_partner:      Hilton
benefit_type:         elite_status
annual_value:         variable (depends on Hilton stays)
period_type:          ongoing (maintained as long as card is open)
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab; link Hilton Honors number)
expiration_date:      null
trackable_via_plaid:  false
notes:                Hilton Gold benefits: 80% bonus points on stays, room upgrades to preferred
                      rooms (when available), daily food & beverage credit at U.S. Hilton properties
                      (breakfast at select brands outside U.S.), late checkout.
                      Fifth night free on award stays of 5+ nights.
                      Normally requires 40 nights, 20 stays, or 75,000 base points to earn.
                      Also available to authorized users.
                      Auto-renews annually as long as card is open.
```

```
benefit_key:          plat_marriott_gold
card_type:            amex_platinum
benefit_name:         Complimentary Marriott Bonvoy Gold Elite Status
benefit_partner:      Marriott
benefit_type:         elite_status
annual_value:         variable (depends on Marriott stays)
period_type:          ongoing (maintained as long as card is open)
activation_required:  true
activation_method:    enrollment (Amex app → Benefits tab; link Marriott Bonvoy number)
expiration_date:      null
trackable_via_plaid:  false
notes:                Marriott Gold benefits: 25% bonus points, room upgrade when available,
                      2PM late checkout (when available), enhanced internet.
                      Less valuable than Hilton Gold — no breakfast or food credit included.
                      CSR offers IHG Platinum (different chain; includes breakfast & upgrades).
```

```
benefit_key:          plat_leaders_club_sterling
card_type:            amex_platinum
benefit_name:         Leaders Club Sterling Status
benefit_partner:      The Leading Hotels of the World
benefit_type:         elite_status
annual_value:         variable (depends on LHW stays)
period_type:          ongoing (maintained as long as card is open)
activation_required:  true
activation_method:    enrollment (sign up for Leaders Club free, then enroll via Amex Benefits tab)
expiration_date:      null (NEW in Sept 2025 refresh)
trackable_via_plaid:  false
notes:                Sterling status benefits: 5 confirmed prearrival room upgrades per year
                      (room-to-room, no suites), 5% bonus points on qualified room rates,
                      complimentary Sixt Platinum car rental status.
                      Leaders Club is NOT an Amex transfer partner.
                      Over 400 luxury properties worldwide.
                      Niche benefit — most users won't stay at LHW properties frequently.
```

### Insurance & Protection Benefits

---

```
benefit_key:          plat_car_rental_insurance
card_type:            amex_platinum
benefit_name:         Car Rental Loss & Damage Insurance
benefit_partner:      AMEX Assurance Company
benefit_type:         insurance
annual_value:         variable
activation_required:  false (auto-applies when rental paid with card)
trackable_via_plaid:  false
notes:                SECONDARY coverage (not primary — must file with personal insurance first).
                      Covers up to $75,000 for damage or theft of rental vehicle, up to 30 consecutive days.
                      Up to $1,000/person ($2,000 max) for personal property.
                      Up to $5,000 for accidental injury.
                      Must decline rental company's LDW/CDW.
                      Excludes: Australia, Italy, New Zealand, certain vehicle types
                      (cargo vans, modified cars, antiques, limousines).
                      Optional Premium Car Rental Protection available for $19.95-$24.95/rental (upgrades to PRIMARY).
                      KEY DIFFERENCE: CSR has PRIMARY auto rental CDW included free.
                      Amex Platinum's SECONDARY coverage is less valuable than CSR's PRIMARY.
```

```
benefit_key:          plat_trip_cancellation
card_type:            amex_platinum
benefit_name:         Trip Cancellation & Interruption Insurance
benefit_partner:      New Hampshire Insurance Company (AIG)
benefit_type:         insurance
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                Up to $10,000 per trip, $20,000 per 12-month period.
                      Covers nonrefundable costs due to: illness, injury, severe weather, jury duty,
                      job loss, and other covered events.
                      Must charge full trip to Platinum Card (or combination with Amex points).
                      Secondary coverage.
                      Voluntary cancellations, known events, preexisting conditions NOT covered.
```

```
benefit_key:          plat_trip_delay
card_type:            amex_platinum
benefit_name:         Trip Delay Insurance
benefit_partner:      New Hampshire Insurance Company (AIG)
benefit_type:         insurance
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                Up to $500 per trip for delays over 6 hours.
                      Maximum 2 covered trips per 12-month period.
                      Covers meals, lodging, and necessary personal items during delay.
                      Must charge full common carrier ticket to Platinum Card.
```

```
benefit_key:          plat_baggage_insurance
card_type:            amex_platinum
benefit_name:         Baggage Insurance
benefit_partner:      New Hampshire Insurance Company (AIG)
benefit_type:         insurance
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                Lost, stolen, or damaged baggage coverage.
                      Up to $2,000 for checked bags, $3,000 combined (checked + carry-on) per person.
                      Maximum $10,000 total per trip for all travelers combined.
                      Must charge common carrier ticket to Platinum Card.
```

```
benefit_key:          plat_cell_phone_protection
card_type:            amex_platinum
benefit_name:         Cell Phone Protection
benefit_partner:      New Hampshire Insurance Company (AIG)
benefit_type:         insurance
annual_value:         up to 1600 (2 claims × $800 max)
activation_required:  false (auto-activates when cell phone bill is paid with card)
trackable_via_plaid:  false (activation inferred from wireless bill payment)
notes:                Up to $800 per claim, 2 claims per 12-month period ($1,600 max/yr).
                      $50 deductible per claim.
                      Covers theft and accidental damage (cracked screen, water damage, etc.).
                      Does NOT cover: lost phones, cosmetic damage, rented/borrowed phones, prepaid phones.
                      REQUIREMENT: Must pay monthly wireless bill with Platinum Card.
                      Coverage begins 1st of month AFTER first bill payment.
                      Covers all phones on your wireless plan (including family members).
                      Secondary coverage — exhaust other coverage first.
                      File claim within 90 days; submit documents within 120 days.
                      Call 1-833-784-1467 to file.
```

```
benefit_key:          plat_purchase_protection
card_type:            amex_platinum
benefit_name:         Purchase Protection
benefit_partner:      AMEX Assurance Company
benefit_type:         insurance
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                Covers eligible purchases against accidental damage or theft within 90 days
                      of purchase. Up to $10,000 per occurrence, $50,000 per calendar year.
```

```
benefit_key:          plat_extended_warranty
card_type:            amex_platinum
benefit_name:         Extended Warranty
benefit_partner:      AMEX Assurance Company
benefit_type:         insurance
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                Extends manufacturer warranty by up to 2 years on eligible purchases.
                      Original warranty must be 5 years or less.
                      Maximum coverage: $10,000 per occurrence, $50,000 per calendar year.
```

```
benefit_key:          plat_return_protection
card_type:            amex_platinum
benefit_name:         Return Protection
benefit_partner:      American Express
benefit_type:         insurance
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                If a store won't accept a return, Amex may refund eligible purchases
                      within 90 days. Up to $300 per item, maximum $1,000 per calendar year.
```

### Other Benefits

---

```
benefit_key:          plat_fhr_perks
card_type:            amex_platinum
benefit_name:         Fine Hotels + Resorts Booking Perks
benefit_partner:      AmexTravel.com (FHR properties)
benefit_type:         booking_perk
annual_value:         ~550 avg per booking (Amex states "average total value of $550 in perks")
period_type:          per_event
activation_required:  false
trackable_via_plaid:  false (on-property credits reduce hotel bill before final charge)
notes:                When booking FHR properties through AmexTravel.com, receive:
                      - Daily breakfast for two
                      - Room upgrade upon arrival (when available)
                      - $100 property credit toward eligible charges (food, spa, etc.)
                      - Noon check-in (when available)
                      - Guaranteed 4PM late checkout
                      - 5x MR points on prepaid rate
                      Over 1,800 FHR properties worldwide.
                      Zurp can surface as awareness insight (C1) — cannot track on-property usage.
                      Separate from the $600 hotel statement credit (which applies ON TOP of FHR perks).
```

```
benefit_key:          plat_concierge
card_type:            amex_platinum
benefit_name:         Platinum Concierge
benefit_partner:      American Express
benefit_type:         service
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                24/7 personal concierge service for travel planning, dining reservations,
                      entertainment tickets, gift sourcing, etc.
                      Not directly monetizable for Zurp insights but adds to card value proposition.
```

```
benefit_key:          plat_global_assist
card_type:            amex_platinum
benefit_name:         Premium Global Assist Hotline
benefit_partner:      American Express
benefit_type:         service
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                Available when traveling 100+ miles from home.
                      Emergency medical referrals, legal assistance, emergency transport coordination,
                      translation, lost document assistance.
                      Hotline itself is free; services provided may have costs.
                      Call: 800-345-AMEX (2639) or +1-715-343-7979 (collect from abroad).
```

```
benefit_key:          plat_no_foreign_transaction_fee
card_type:            amex_platinum
benefit_name:         No Foreign Transaction Fees
benefit_partner:      null
benefit_type:         fee_waiver
annual_value:         variable
activation_required:  false
trackable_via_plaid:  false
notes:                No foreign transaction fees on purchases made outside the U.S.
                      Same as CSR and Amex Gold.
```

---

## Part 2: Competitor Map

### Category 1: Rideshare — Uber Cash Redirect (A1)

```
card_type:              amex_platinum
benefit_key:            plat_uber_cash
benefit_partner:        Uber
competitor_merchant:    Lyft
plaid_merchant_pattern: LYFT|LYFT \*RIDE
category:               rideshare
insight_type:           A1
dollar_signal:          $15/mo Uber Cash ($200/yr) + Uber One discounts
notes:                  Copy: "You spent $24 on Lyft. Your Platinum Card includes $15/mo in Uber Cash
                        and Uber One discounts. Switch to Uber to capture this value."
                        Uber Cash + Uber One stacking makes Uber significantly cheaper.
                        Throttle: 1x/week for rideshare redirects.
                        NOTE: CSR users get Lyft credit + 5x Lyft points — opposite redirect direction.
```

### Category 2: Food Delivery — Uber Eats Redirect (A1)

```
card_type:              amex_platinum
benefit_key:            plat_uber_cash
benefit_partner:        Uber Eats
competitor_merchant:    DoorDash
plaid_merchant_pattern: DOORDASH|DOOR DASH
category:               food_delivery
insight_type:           A1
dollar_signal:          $15/mo Uber Cash + Uber One $0 delivery
notes:                  Copy: "You ordered $35 from DoorDash. Your Platinum Card includes $15/mo
                        in Uber Cash and Uber One's $0 delivery fee. Use Uber Eats to save."
                        NOTE: If user also has CSR or CSP, they get DoorDash benefits on those cards.
                        Cross-card awareness is Phase 2.
```

```
card_type:              amex_platinum
benefit_key:            plat_uber_cash
benefit_partner:        Uber Eats
competitor_merchant:    Grubhub
plaid_merchant_pattern: GRUBHUB|GH \*
category:               food_delivery
insight_type:           A1
dollar_signal:          $15/mo Uber Cash + Uber One $0 delivery
notes:                  Copy: "You ordered $28 from Grubhub. Your Platinum Card includes Uber Cash
                        and Uber One benefits. Switch to Uber Eats to capture this value."
                        NOTE: If user also has Amex Gold, they get Grubhub dining credit on Gold.
```

```
card_type:              amex_platinum
benefit_key:            plat_uber_cash
benefit_partner:        Uber Eats
competitor_merchant:    Postmates
plaid_merchant_pattern: POSTMATES
category:               food_delivery
insight_type:           A1
dollar_signal:          $15/mo Uber Cash + Uber One $0 delivery
notes:                  Postmates is now part of Uber Eats — some merchants still show as POSTMATES in Plaid.
```

### Category 3: Streaming — Digital Entertainment Redirect (A1 / A3)

```
card_type:              amex_platinum
benefit_key:            plat_digital_entertainment
benefit_partner:        Eligible streaming services
competitor_merchant:    Netflix
plaid_merchant_pattern: NETFLIX
category:               streaming
insight_type:           A3 (subscription swap awareness)
dollar_signal:          Up to $25/mo credit on eligible alternatives
notes:                  Copy: "You're paying $15.49/mo for Netflix on your Platinum Card. Netflix isn't
                        covered by your $25/mo Digital Entertainment Credit, but Disney+, Hulu,
                        Peacock, Paramount+, YouTube TV, and others are. Consider switching or adding
                        covered services to offset your streaming costs."
                        Netflix is NOT an eligible provider — this is an awareness insight.
                        Low confidence: user may specifically want Netflix. Throttle: 1x/quarter.
```

```
card_type:              amex_platinum
benefit_key:            plat_digital_entertainment
benefit_partner:        Eligible streaming services
competitor_merchant:    Spotify
plaid_merchant_pattern: SPOTIFY
category:               streaming
insight_type:           A3 (subscription swap awareness)
dollar_signal:          Up to $25/mo credit on eligible alternatives
notes:                  Copy: "You're paying $11.99/mo for Spotify. Spotify isn't covered by your
                        $25/mo Digital Entertainment Credit. YouTube Premium ($13.99/mo) IS covered
                        and includes ad-free YouTube + YouTube Music."
                        Direct swap suggestion: Spotify → YouTube Premium.
                        Low confidence: user may prefer Spotify. Throttle: 1x/quarter.
```

```
card_type:              amex_platinum
benefit_key:            plat_digital_entertainment
benefit_partner:        Eligible streaming services
competitor_merchant:    Apple TV+
plaid_merchant_pattern: APPLE\.COM/BILL|APPLE TV
category:               streaming
insight_type:           A3 (subscription swap awareness)
dollar_signal:          Up to $25/mo credit
notes:                  Copy: "You're paying for Apple TV+. While Apple TV+ isn't directly covered,
                        Disney+, Hulu, or Peacock are covered by your $25/mo entertainment credit."
                        Harder to detect: Apple billing often bundles multiple services.
                        NOTE: CSR gets complimentary Apple TV+ (opposite value prop).
                        Lower confidence. Throttle: 1x/quarter.
```

```
card_type:              amex_platinum
benefit_key:            plat_digital_entertainment
benefit_partner:        Eligible streaming services
competitor_merchant:    Max (HBO)
plaid_merchant_pattern: MAX\.COM|HBO MAX|WARNER BROS
category:               streaming
insight_type:           A3 (subscription swap awareness)
dollar_signal:          Up to $25/mo credit on eligible alternatives
notes:                  HBO Max / Max is NOT an eligible provider.
                        Same awareness pattern as Netflix.
                        Throttle: 1x/quarter.
```

### Category 4: Dining — Resy Redirect (A1)

```
card_type:              amex_platinum
benefit_key:            plat_resy_credit_q1
benefit_partner:        Resy
competitor_merchant:    OpenTable
plaid_merchant_pattern: OPENTABLE
category:               dining_reservation
insight_type:           A1
dollar_signal:          Up to $100/quarter ($400/yr)
notes:                  Copy: "You made a reservation through OpenTable. Your Platinum Card includes
                        $100/quarter in Resy dining credit. Book through Resy next time."
                        Same insight pattern as Amex Gold Resy redirect, but 4x the value.
                        Nuance: OpenTable charges rarely appear in Plaid (restaurant charges instead).
                        More practically a C1 awareness insight at quarter start.
```

### Category 5: Fitness — Equinox Redirect (A3)

```
card_type:              amex_platinum
benefit_key:            plat_equinox
benefit_partner:        Equinox
competitor_merchant:    Other gym memberships
plaid_merchant_pattern: PLANET FITNESS|24 HOUR FITNESS|LA FITNESS|YMCA|CRUNCH|ORANGETHEORY|BARRY|LIFETIME|SOULCYCLE|CLASSPASS
category:               fitness
insight_type:           A3 (subscription swap)
dollar_signal:          $300/yr Equinox credit
notes:                  Copy: "You're paying $40/mo for Planet Fitness. Your Platinum Card includes
                        $300/yr toward Equinox. If you'd consider upgrading, you'd get $300 back."
                        LOW confidence: gym choice is highly personal (location, equipment, community).
                        Only fire if user is paying for a gym that's near an Equinox location.
                        DEFERRED v1 — requires gym location matching, which is complex.
                        Include in v2 when location data is available.
```

### Category 6: Coffee — Lululemon Awareness (C1, not A1)

> No direct competitor redirects for lululemon — it's a specific brand preference. Instead, generate B2 (unused credit) and C1 (celebration) insights around quarterly usage.

### Category 7: Flights — Direct Booking Redirect (A1)

```
card_type:              amex_platinum
benefit_key:            plat_5x_flights
benefit_partner:        null (direct airline booking)
competitor_merchant:    Expedia / Kayak / Orbitz / Priceline / CheapTickets / Hotwire / Travelocity
plaid_merchant_pattern: EXPEDIA|KAYAK|ORBITZ|PRICELINE|TRAVELOCITY|CHEAPTICKETS|HOTWIRE
category:               flights
insight_type:           A1 (earning rate)
dollar_signal:          4 incremental pts/$ (5x vs 1x) × 2.0cpp = 8.0cpp per dollar
notes:                  Copy: "You booked a $400 flight through Expedia. Book directly with the airline
                        to earn 5x instead of 1x — that's 1,600 extra points ($32)."
                        Same pattern as Amex Gold (3x) but higher value (5x on Platinum).
                        Caveat: not all OTA charges are flights. Only fire if Plaid categorization
                        suggests air travel.
                        Lower confidence — fire max 1x per OTA transaction.
```

### Category 8: Hotels — AmexTravel Portal Redirect (A1)

```
card_type:              amex_platinum
benefit_key:            plat_hotel_credit_h1
benefit_partner:        AmexTravel.com (FHR / THC)
competitor_merchant:    Hotels.com / Booking.com / Expedia Hotels / other OTAs
plaid_merchant_pattern: HOTELS\.COM|BOOKING\.COM|BOOKING COM|HOTELS COM|TRIVAGO|PRICELINE
category:               hotels
insight_type:           A1 + C1 (awareness)
dollar_signal:          $300/half hotel credit + 5x points + FHR/THC perks ($100 property credit, breakfast, etc.)
notes:                  Copy: "You booked $500 at Booking.com. Book through AmexTravel.com at an FHR
                        or Hotel Collection property to get up to $300 back, 5x points, free breakfast,
                        and a $100 property credit."
                        MULTI-BENEFIT redirect: hotel credit + 5x points + on-property perks.
                        Lower confidence: user's specific hotel may not be in FHR/THC network.
                        Consider this a C1 awareness insight unless we can match the hotel.
                        Throttle: 1x per hotel OTA transaction.
```

```
card_type:              amex_platinum
benefit_key:            plat_hotel_credit_h1
benefit_partner:        AmexTravel.com (FHR / THC)
competitor_merchant:    Direct hotel chains (Marriott, Hilton, Hyatt, IHG, etc.)
plaid_merchant_pattern: MARRIOTT|HILTON|HYATT|IHG|INTERCONTINENTAL|HOLIDAY INN|BEST WESTERN|WYNDHAM
category:               hotels
insight_type:           A1 + C1 (awareness)
dollar_signal:          $300/half hotel credit + 5x points + FHR/THC perks
notes:                  Copy: "You booked $400 directly with Marriott. If this property is available
                        on AmexTravel.com (FHR or Hotel Collection), you could get up to $300 back
                        + 5x points + additional perks."
                        KEY difference from CSR: CSR earns 4x on direct hotel bookings.
                        Platinum earns only 1x on direct hotel bookings.
                        The portal lock-in is more impactful for Platinum users.
                        Lower confidence: user may value loyalty program benefits of direct booking.
                        Throttle: 1x per hotel transaction.
```

### Category 9: Shopping — Saks Awareness (C1)

> No direct competitor redirects for Saks — it's a specific retailer credit. Generate B2 (unused credit with time pressure) insights, especially given Saks bankruptcy uncertainty.

### Category 10: Uber (No Setup) → Uber (With Uber Cash) (Activation Reminder)

> **Implementation note**: Same pattern as Amex Gold's Uber setup reminder. This is reference data for the C0 (enrollment/activation) insight generator, NOT a competitor_map DB row.

```
card_type:              amex_platinum
benefit_key:            plat_uber_cash
benefit_partner:        Uber
competitor_merchant:    Uber (self — user hasn't set up Uber Cash)
plaid_merchant_pattern: UBER \*TRIP|UBER BV|UBER \*RIDES
category:               rideshare
insight_type:           C0 (enrollment/activation)
dollar_signal:          $15/mo ($200/yr) + $120 Uber One
notes:                  NOT a traditional competitor redirect — detects Uber ride transactions
                        WITHOUT evidence of Uber Cash usage.
                        Copy: "You took an Uber ride but may not have your Platinum Card linked
                        in Uber. Add it to get $15/mo in Uber Cash plus $120/yr toward Uber One."
                        Fire once, then suppress unless user continues to have Uber charges without
                        apparent Uber Cash usage.
```

### Competitor Map Summary

| # | Competitor | → Redirect To | Category | Type | Dollar Signal (per event) | Active v1? |
|---|---|---|---|---|---|---|
| 1 | Lyft | Uber (Uber Cash) | rideshare | A1 | $15/mo + Uber One discounts | Yes |
| 2 | DoorDash | Uber Eats (Uber Cash) | food_delivery | A1 | $15/mo + Uber One $0 delivery | Yes |
| 3 | Grubhub | Uber Eats (Uber Cash) | food_delivery | A1 | $15/mo + Uber One $0 delivery | Yes |
| 4 | Postmates | Uber Eats (Uber Cash) | food_delivery | A1 | $15/mo + Uber One $0 delivery | Yes |
| 5 | Netflix | Disney+/Hulu/etc. | streaming | A3 | Up to $25/mo credit | Yes |
| 6 | Spotify | YouTube Premium | streaming | A3 | Up to $25/mo credit | Yes |
| 7 | Apple TV+ | Disney+/Hulu/etc. | streaming | A3 | Up to $25/mo credit | Yes |
| 8 | Max (HBO) | Disney+/Hulu/etc. | streaming | A3 | Up to $25/mo credit | Yes |
| 9 | OpenTable | Resy | dining_reservation | A1/C1 | Up to $100/quarter | Yes |
| 10 | Gym memberships | Equinox | fitness | A3 | $300/yr credit | DEFERRED v2 |
| 11 | Expedia/Kayak/OTAs | Direct airline | flights | A1 | 8.0cpp/$ (5x vs 1x) | Yes |
| 12 | Hotels.com/Booking.com | AmexTravel.com | hotels | A1+C1 | $300/half + 5x + perks | Yes |
| 13 | Direct hotel chains | AmexTravel.com | hotels | A1+C1 | $300/half + 5x + perks | Yes |
| 14 | Uber (no setup) | Uber (with Uber Cash) | rideshare | C0 | $15/mo ($200/yr) + $120 Uber One | Yes (C0 ref) |

**Total: 14 entries in catalog, 12 competitor_map DB rows** (Entry 10 deferred to v2; Entry 14 is C0 reference data for enrollment insight generator, not an A1 competitor redirect)

### Tie-Breaking Rules

When multiple entries match a single transaction:

1. **DoorDash/Grubhub → Uber Eats**: Both redirect to same destination (Uber Eats via Uber Cash). Pick whichever the user actually ordered from as the trigger; insight is the same.

2. **Multiple streaming redirects**: Show highest-dollar active subscription as primary insight. Suppress subsequent streaming redirects for 14 days.

3. **Hotel OTA vs direct hotel**: Prefer OTA redirect (more certain the user is missing portal value). Direct hotel redirect is more speculative (user may value loyalty benefits).

4. **Throttling**: Rideshare redirects max 1x/week. Streaming redirects max 1x/quarter (low confidence). Food delivery redirects max 1x/week. Hotel redirects max 1x/transaction. Flight redirects max 1x/transaction. Dining reservation redirects max 1x/quarter.

---

## Part 3: Tracking Rules

| Benefit | Detection Method | Reset Logic | Confidence |
|---|---|---|---|
| plat_hotel_credit_h1 / h2 | Amex Travel statement credits (hotel) | Semi-annual (Jan-Jun, Jul-Dec) | Medium |
| plat_resy_credit_q1-q4 | Statement credits from Resy-affiliated restaurants | Quarterly (Q1-Q4) | Medium |
| plat_lululemon_credit_q1-q4 | Plaid: "LULULEMON" + statement credit | Quarterly (Q1-Q4) | High |
| plat_digital_entertainment | Plaid: eligible streaming merchants + statement credit | Monthly (1st of month) | Medium |
| plat_uber_cash | Infer from Uber/Uber Eats transaction presence | Monthly ($15 Jan-Nov, $35 Dec) | Low |
| plat_uber_one | Plaid: "UBER ONE" subscription charge + statement credit | Calendar year | High |
| plat_airline_fee_credit | Airline incidental charges + Amex statement credit | Calendar year | Medium |
| plat_saks_h1 / h2 | Plaid: "SAKS" + statement credit | Semi-annual (Jan-Jun, Jul-Dec) | High |
| plat_equinox | Plaid: "EQUINOX" recurring charge + statement credit | Calendar year | High |
| plat_walmart_plus | Plaid: "WALMART+" recurring charge + statement credit | Monthly | High |
| plat_clear | Plaid: "CLEAR" annual charge + statement credit | Calendar year | High |
| plat_oura | Plaid: "OURA" purchase + statement credit | Calendar year | High |
| plat_global_entry | One-time charge from CBP/TSA + statement credit | 4-year cycle | High |
| plat_5x_flights | Plaid category: TRAVEL > AIRLINES | N/A | High |
| plat_5x_prepaid_hotels | NOT trackable via Plaid (portal vs direct indistinguishable) | N/A | N/A |

---

## Part 4: Period Reset Logic

The Amex Platinum has the most complex reset schedule of any supported card — even more than CSR:

| Reset Type | Benefits | Detection |
|---|---|---|
| **Quarterly** | Resy credit ($100×4), Lululemon credit ($75×4) | Jan 1, Apr 1, Jul 1, Oct 1 reset |
| **Semi-annual** | Hotel credit ($300×2), Saks credit ($50×2) | Jan 1 / Jul 1 reset |
| **Monthly** | Digital entertainment ($25), Uber Cash ($15/$35), Walmart+ (~$13) | 1st of each month |
| **Calendar year** | Uber One ($120), Airline fee credit ($200), Equinox ($300), CLEAR ($209), Oura ($200) | Jan 1 reset |
| **4-year cycle** | Global Entry/TSA PreCheck ($120) | Track from first use |
| **Ongoing** | Lounge access, hotel status, insurance benefits | No reset — active while card is open |

**Engine capabilities required for Amex Platinum (NEW beyond existing):**
- **Quarterly period tracking (NEW)**: 4 independent quarters per calendar year. Resy and lululemon each have 4 separate quarterly credits. This is a new period type not used by CSR, CSP, or Gold.
- Semi-annual period tracking (EXISTING — shared with CSR and Gold)
- Monthly credit tracking with use-it-or-lose-it (EXISTING — shared with CSR and Gold)
- Calendar year reset (EXISTING)
- 4-year cycle tracking (EXISTING — shared with CSR)

---

## Part 5: Amex Platinum vs. Other Cards — Cross-Reference

### Amex Platinum vs CSR

| Dimension | Amex Platinum | CSR |
|---|---|---|
| Annual fee | $895 | $795 |
| Hard credits (total) | ~$3,284 | ~$2,060 |
| Points on flights | 5x (direct + AmexTravel) | 4x direct / 8x Chase Travel |
| Points on hotels | 5x (AmexTravel only); 1x direct | 4x direct / 8x Chase Travel |
| Points on dining | 1x | 3x |
| Points on everything else | 1x | 1x |
| Hotel credit | $600/yr (semi-annual) | $500/yr Edit + $250 Select (2026) |
| Dining credit | $400/yr Resy (quarterly) | $300/yr Exclusive Tables (semi-annual) |
| Rideshare credit | $200/yr Uber Cash + $120 Uber One | $120/yr Lyft credit |
| Streaming credit | $300/yr (10 services) | ~$250/yr Apple Music + TV+ (free subs) |
| Entertainment credit | — | $300/yr StubHub |
| Fitness credit | $300/yr Equinox | $120/yr Peloton |
| Lifestyle credit | $300/yr lululemon + $200 Oura | — |
| Shopping credit | $100/yr Saks | — |
| Membership credit | $155/yr Walmart+ + $209 CLEAR | $120/yr DashPass |
| Airline fee credit | $200/yr (incidentals only) | $300/yr (all travel) |
| Lounge access | Centurion + Delta Sky Club + Priority Pass (1,550+) | Chase Sapphire Lounge + Priority Pass (1,300+) |
| Hotel status | Hilton Gold + Marriott Gold + Leaders Club Sterling | IHG Platinum |
| Car rental CDW | SECONDARY | PRIMARY |
| Transfer partners | 21+ (Amex MR) | 14 (Chase UR) |
| Key unique partners | Delta, Hilton, ANA, Singapore, Virgin Atlantic | United, Southwest, Hyatt |
| Benefits requiring enrollment | 13+ | 7 |
| Estimated insights/user | 30-50 per month | 25-40 per month |

### Amex Platinum vs Amex Gold

| Dimension | Amex Platinum | Amex Gold |
|---|---|---|
| Annual fee | $895 | $325 |
| Hard credits (total) | ~$3,284 | ~$424 |
| Points on dining | 1x | 4x (up to $50K/yr) |
| Points on groceries | 1x | 4x (up to $25K/yr) |
| Points on flights | 5x | 3x |
| Points on AmexTravel hotels | 5x | 2x |
| Hotel credit | $600/yr | $100/stay Hotel Collection |
| Dining credit | $400/yr Resy (quarterly) | $100/yr Resy (semi-annual) + $120/yr dining merchants |
| Uber benefit | $200/yr Uber Cash + $120 Uber One | $120/yr Uber Cash |
| Streaming | $300/yr | — |
| Lounge access | Yes (1,550+ lounges) | No |
| Hotel status | Hilton Gold + Marriott Gold + Leaders Club | — |
| Global Entry | $120/4yr | — |
| Car rental CDW | Secondary | Secondary |
| Best for | Travel, lounges, premium lifestyle | Dining, groceries, everyday spend |

---

## Part 6: Implementation Notes

### Insight Volume Estimate

The Amex Platinum generates the most insights of any supported card:
- **30-50 insights per user per month** (vs CSR 25-40, Gold 12-20, CSP 10-18)
- This is driven by: 13+ activation-required benefits (B1 insights), 8 quarterly credits (B2 time-pressure insights every quarter), 3 monthly credits (B2 monthly), and 12 active competitor map entries (A1/A3 redirect insights)
- **Display rule priority is critical** — with this many candidates, scoring engine must surface highest-value and suppress noise aggressively

### Key Differences from Existing Engine Logic

1. **Quarterly tracking (8 benefits, NEW period type)**: Resy ($100×4) and lululemon ($75×4) each have 4 independent quarterly credits. Quarters are Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec). Reset on 1st of each quarter. Unused credit does NOT carry over. This creates high-frequency B2 insights — at least one per quarter per credit if underused. Consider combining into a single "quarterly check-in" insight at start of each quarter.

2. **Massive enrollment checklist**: 13+ benefits requiring manual enrollment. B1 (unactivated benefit) insights will dominate the first session. Priority order by dollar impact:
   1. Hotel credit ($600/yr — no enrollment, but must book through AmexTravel)
   2. Resy credit ($400/yr — enrollment required)
   3. Lululemon credit ($300/yr — enrollment required)
   4. Digital entertainment ($300/yr — enrollment required)
   5. Equinox ($300/yr — enrollment required, niche)
   6. Uber Cash ($200/yr — add card to Uber)
   7. Uber One ($120/yr — enrollment + purchase)
   8. CLEAR ($209/yr — enrollment + purchase)
   9. Airline fee credit ($200/yr — select airline)
   10. Walmart+ ($155/yr — enrollment + subscribe)
   11. Saks ($100/yr — enrollment required)
   12. Oura Ring ($200/yr — enrollment required, niche)
   13. Global Entry ($120/4yr — enrollment required)
   14. Hotel status: Hilton Gold, Marriott Gold, Leaders Club Sterling (enrollment required each)

3. **Uber Cash + Uber One stacking**: These are separate benefits that compound. Uber Cash ($200/yr) + Uber One credit ($120/yr) + Uber One membership savings = significant Uber value. Insights should reference combined Uber value, not individual benefits, when redirecting from Lyft/DoorDash/Grubhub.

4. **Streaming credit complexity**: 10 eligible providers, $25/mo cap shared across all. Users need to optimize their subscription mix to get close to $25/mo without going over. This is more complex than any other card's credit. Consider a specialized "streaming optimization" insight that analyzes which subscriptions the user is paying for and suggests the optimal allocation.

5. **Portal lock-in for hotels**: Unlike CSR (4x on direct hotel bookings), Platinum earns only 1x on direct hotel bookings. The 5x rate requires booking through AmexTravel.com. This makes the A1 hotel redirect insight much more impactful for Platinum users — the delta between 5x and 1x is 4 points per dollar.

6. **Saks bankruptcy risk**: Saks Global filed Chapter 11 on Jan 13, 2026. Amex confirmed benefit continues, but Zurp should flag time sensitivity: "Your $50 Saks credit is available now. Given Saks' restructuring, consider using it sooner rather than later."

7. **Low everyday earn rates**: Platinum earns only 1x on dining, groceries, and most purchases. Amex explicitly positions it as a companion to the Gold Card. For users who have BOTH cards, cross-card optimization is Phase 2 but would be extremely valuable.

### Activation Checklist Priority (Onboarding)

For new Platinum users, the B1 onboarding checklist should surface in order of dollar impact and ease of use:

1. **Uber Cash + Uber One** ($320/yr combined — add card to Uber + enroll in Uber One)
2. **Resy dining credit** ($400/yr — enroll, then dine at any Resy restaurant)
3. **Digital entertainment** ($300/yr — enroll, then set up streaming subscriptions)
4. **Lululemon** ($300/yr — enroll, then shop)
5. **Airline fee credit** ($200/yr — select airline in Amex account)
6. **CLEAR** ($209/yr — enroll + subscribe, only if airport frequent)
7. **Walmart+** ($155/yr — enroll + subscribe)
8. **Saks** ($100/yr — enroll, then shop)
9. **Equinox** ($300/yr — only if user has/wants Equinox, otherwise skip)
10. **Oura Ring** ($200/yr — only if user wants smart ring, otherwise skip)
11. **Hilton Gold status** (variable — enroll, link Hilton number)
12. **Marriott Gold status** (variable — enroll, link Marriott number)
13. **Leaders Club Sterling** (variable — sign up for Leaders Club, then enroll)
14. **Global Entry/TSA PreCheck** ($120/4yr — one-time, when renewal is due)

### Hard Credit Summary

| Benefit | Annual Value | Period | Enrollment Required |
|---|---|---|---|
| Hotel credit (FHR/THC) | $600 | Semi-annual ($300×2) | No |
| Resy dining credit | $400 | Quarterly ($100×4) | Yes |
| Lululemon credit | $300 | Quarterly ($75×4) | Yes |
| Digital entertainment | $300 | Monthly ($25×12) | Yes |
| Equinox | $300 | Calendar year | Yes |
| CLEAR+ | $209 | Calendar year | Yes |
| Uber Cash | $200 | Monthly ($15/$35) | Yes |
| Airline fee credit | $200 | Calendar year | Yes |
| Oura Ring | $200 | Calendar year | Yes |
| Walmart+ | $155 | Monthly (~$13) | Yes |
| Uber One | $120 | Calendar year | Yes |
| Global Entry/TSA | ~$30/yr amortized | 4-year | No |
| Saks Fifth Avenue | $100 | Semi-annual ($50×2) | Yes |
| **Total hard credits** | **~$3,114** | | |

Note: Total hard credit value is theoretical maximum. Actual realized value depends on user's spending patterns and willingness to use all enrolled benefits. Amex's "breakage" model assumes most users won't maximize all credits.
