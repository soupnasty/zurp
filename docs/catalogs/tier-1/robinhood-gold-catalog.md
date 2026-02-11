# Robinhood Gold Card — Benefit Catalog & Competitor Map

Implementation-ready data for the Zurp insight engine.

## Card Overview

| Field | Value |
|---|---|
| Card | Robinhood Gold Card |
| Issuer | Coastal Community Bank (Visa Signature) |
| Annual fee | $0 card fee + $50 Robinhood Gold membership required |
| Authorized user fee | $0 (up to 7 minor users with spending controls) |
| card_type | `robinhood_gold` |
| Points currency | Robinhood Points (1 point = 1 cent) |
| Points valuation | 1.0cpp (to brokerage), 0.7cpp (statement credit redemption) |
| Transfer partners | NONE |
| Fee anniversary | Calendar year (Robinhood Gold membership renews annually) |
| Benefit period | Varies — see individual benefits. Calendar year for points earning, portal caps for travel earning, 90 days for purchase protection. |
| Research date | February 2026 |
| Network | Visa Signature |

---

## Part 1: Benefit Catalog

### Hard Credits & Statement Credits

---

**1. rh_gold_no_foreign_transaction_fee**

| Field | Value |
|---|---|
| Name | No Foreign Transaction Fees |
| benefit_key | `rh_gold_no_ftf` |
| Annual value | Variable (depends on international spend) |
| Type | Fee waiver |
| Trackable | Yes — Plaid international merchant detection |
| Confidence | High |
| Notes | Standard on Visa Signature. No FTF on international purchases. Shared across all Robinhood Gold card spending. |

---

**2. rh_gold_virtual_cards**

| Field | Value |
|---|---|
| Name | Virtual Card Suite |
| benefit_key | `rh_gold_virtual_cards` |
| Type | Account feature |
| Features | Free trial cards (merchant trials), single-use cards (subscriptions/one-time purchases), standard virtual card format |
| Trackable | No — visible in Robinhood account, not on statement |
| Confidence | High |
| Notes | Generate unlimited virtual card numbers linked to physical card. Each can have custom spending limits, merchant restrictions, expiration. Trial cards allow automatic subscription cancellation after free period ends. Security benefit — isolates high-risk merchants from primary card number. |

---

**3. rh_gold_minor_authorized_users**

| Field | Value |
|---|---|
| Name | Minor Authorized User Accounts (Up to 7) |
| benefit_key | `rh_gold_minor_au` |
| Type | Account feature |
| Limit | Up to 7 minor users |
| Controls | Per-user spending limits, merchant category restrictions, real-time mobile notifications |
| Trackable | No — visible in account management, not on statement |
| Confidence | High |
| Notes | Issue separate physical cards to minors with customizable controls. Each AU can have independent daily/monthly spend cap. Builds credit history for authorized minors (if reported to bureaus — verify with issuer). Combined parental dashboard for all AU cards. |

---

**4. rh_gold_solid_gold_card_option**

| Field | Value |
|---|---|
| Name | 10K Solid Gold Card Option |
| benefit_key | `rh_gold_premium_card_option` |
| Type | Premium card material (optional upgrade) |
| Cost | Additional fee (amount not specified — likely $200–500 one-time) |
| Material | 10-karat solid gold |
| Trackable | No |
| Confidence | Medium |
| Notes | Cosmetic/prestige benefit. Solid gold card is durable, hypoallergenic, and highly distinctive. Not a financial benefit but a differentiator. Premium feature likely tied to Robinhood's brand positioning. |

---

### Points Multipliers

---

**5. rh_gold_3x_all_purchases**

| Field | Value |
|---|---|
| Name | 3x Points on ALL Purchases |
| benefit_key | `rh_gold_3x_all` |
| Type | Points multiplier (flat rate) |
| Multiplier | 3x (3 Robinhood Points per $1 spent) |
| Earning cap | Uncapped — no category or annual limit |
| Trackable | Yes — all Plaid transactions |
| Confidence | High |
| Notes | Flat 3% earning on all spending, no category exceptions. Massive advantage over 2% cards (Citi Double Cash, Venture X on non-travel). Only 3.5x+ cards (Amex Gold on dining/groceries) beat this for targeted categories. But 3x on ALL is superior to 2x on everything. |

---

**6. rh_gold_5x_robinhood_travel_portal**

| Field | Value |
|---|---|
| Name | 5x Points on Robinhood Travel Portal Bookings |
| benefit_key | `rh_gold_5x_travel_portal` |
| Type | Points multiplier (bonus rate) |
| Multiplier | 5x (5 Robinhood Points per $1 spent via portal, vs 3x base) |
| Bonus multiplier | 2x bonus (on top of base 3x) |
| Annual cap | $3,500 spend = max 17,500 bonus points from portal |
| Annual cap reset | Calendar year (January 1) |
| Trackable | Partial — can identify Robinhood Travel portal merchant, but not cash-back value |
| Confidence | High |
| Notes | Portal bookings earn 5x total (3x base + 2x bonus). Cap = $3,500/calendar year. After cap is hit, subsequent travel portal bookings revert to 3x base. Portal likely includes flights, hotels, car rentals, packages. Value = $3,500 × 5 points × 1.0cpp = $175 incremental (vs 3x earning). |

---

**7. rh_gold_1x_base_all_other**

| Field | Value |
|---|---|
| Name | 1x Base Rate (for calculation) |
| benefit_key | `rh_gold_base_rate` |
| Type | Points multiplier (implicit base) |
| Multiplier | 1x |
| Notes | Added for dollar_impact calculations. Embedded in the 3x flat rate; this entry is for accounting only. |

---

### Travel & Insurance Benefits

---

**8. rh_gold_cell_phone_protection**

| Field | Value |
|---|---|
| Name | Cell Phone Protection Insurance |
| benefit_key | `rh_gold_cell_phone_protection` |
| Coverage | $600 per claim |
| Deductible | $25 per claim |
| Covered events | Theft, accidental damage (drop, liquid, hardware failure) |
| Period | 12 months from card charge date |
| Type | Insurance |
| Trackable | No |
| Confidence | High |
| Notes | Covers smartphones and tablets purchased with Robinhood Gold Card. Requires device to be reported lost/stolen or damaged within 90 days of incident. Max $600 payout per claim; up to 2 claims per calendar year (implied — standard). Must have active cell service or device on family plan. |

---

**9. rh_gold_trip_cancellation_interruption**

| Field | Value |
|---|---|
| Name | Trip Cancellation & Interruption Insurance |
| benefit_key | `rh_gold_trip_cancellation` |
| Coverage | $2,000 per insured person |
| Annual aggregate | Not specified — assume per-trip basis |
| Covered events | Sudden illness, injury, death of immediate family, natural disaster, airline bankruptcy |
| Period | Valid for trips charged to card, up to 120 days post-booking |
| Type | Insurance |
| Trackable | No |
| Confidence | High |
| Notes | Reimburses prepaid, non-refundable trip costs (flights, hotels, tours, deposits) if trip must be cancelled due to covered reason. Requires proof (medical records, death certificate, airline communication). Deductible not specified (likely $100–250). Does NOT cover pre-existing conditions or high-risk activities. Common exclusions: pandemics, government travel warnings, airline strikes (if disclosed before booking). |

---

**10. rh_gold_auto_rental_cdw**

| Field | Value |
|---|---|
| Name | Auto Rental Collision Damage Waiver (CDW) |
| benefit_key | `rh_gold_auto_rental_cdw` |
| Coverage | Full rental value, no stated maximum |
| Coverage type | PRIMARY (pays before personal auto insurance) |
| Domestic coverage | 15 consecutive days per rental |
| International coverage | 31 consecutive days per rental |
| Covered rentals | Cars rented from major U.S./international agencies (Hertz, Avis, Budget, Enterprise, National, Alamo, etc.) |
| Type | Insurance |
| Trackable | No |
| Confidence | High |
| Notes | PRIMARY — card holder does not need to file claim against personal auto insurance first. Covers collision, theft, vandalism, glass damage. Excludes off-road vehicles, exotic cars, commercial use. Rental must be charged entirely to Robinhood Gold Card. Some agencies offer optional CDW at checkout; using card benefit declines that extra fee (saves $20–50/day). |

---

**11. rh_gold_purchase_security**

| Field | Value |
|---|---|
| Name | Purchase Security / Item Protection |
| benefit_key | `rh_gold_purchase_security` |
| Coverage | $1,000 per claim, $10,000 annual maximum |
| Covered events | Theft or accidental damage within 90 days of purchase |
| Period | 90 days from purchase date |
| Type | Insurance |
| Trackable | No |
| Confidence | High |
| Notes | Covers items purchased with Robinhood Gold Card that are lost, stolen, or damaged through accident (e.g., laptop stolen from car, phone dropped in water). Excludes intentional damage, wear-and-tear, mysterious disappearance, collectibles. Deductible likely $10–50 per claim (not specified). Requires purchase receipt and proof of damage. Same item cannot claim twice; applies once per item per year. |

---

**12. rh_gold_return_protection**

| Field | Value |
|---|---|
| Name | Return Protection / Refund Guarantee |
| benefit_key | `rh_gold_return_protection` |
| Coverage | $250 per item, $1,000 annual maximum |
| Period | 90 days from purchase date |
| Eligible items | Items purchased with Robinhood Gold Card (new condition) |
| Use case | Merchant won't accept return; no return window; final sale |
| Type | Insurance |
| Trackable | No |
| Confidence | High |
| Notes | If merchant refuses return for any reason (no return window expired, final sale, no defect), card issuer will refund purchase price (up to $250/item). Exclusions: used items, items used/worn, custom orders, perishables, services, digital goods, gift cards. Requires proof of denial (email from merchant, attempted return receipt). Very valuable for final-sale purchases and out-of-window returns. |

---

**13. rh_gold_extended_warranty**

| Field | Value |
|---|---|
| Name | Extended Warranty Protection |
| benefit_key | `rh_gold_extended_warranty` |
| Coverage | Doubles manufacturer warranty up to 1 additional year; max 4 years total |
| Eligible items | Electronics, appliances, and mechanical goods with manufacturer warranty ≤3 years |
| Period | Coverage extends past manufacturer warranty expiration |
| Type | Insurance |
| Trackable | No |
| Confidence | High |
| Notes | If manufacturer warranty = 1 year, this extends to 2 years total. If manufacturer warranty = 2 years, this extends to 3 years total. If manufacturer warranty = 3 years, this extends to 4 years total. Cannot exceed 4 years total even if manufacturer warranty >2 years. Requires proof of warranty (receipt, warranty card). Does NOT cover accidental damage, misuse, or normal wear. Claim process: contact card issuer with proof of defect and warranty details. |

---

## Part 2: Competitor Map

### Category 1: Flat-Rate Earning — Redirect Non-Robinhood Spenders (A1)

These entries flag when users spend on cards earning less than 3%, redirecting them to Robinhood's flat 3x rate.

| # | Signal | Competitor Card | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 1 | All non-category spend | Citi Double Cash (2x = 2%) | Any non-Robinhood merchant | earn_category | A1 | 1% delta per $1 spent | Robinhood 3x beats 2x on everything |
| 2 | All non-category spend | Capital One Venture X (2x = 2% on non-travel) | Any non-Robinhood merchant | earn_category | A1 | 1% delta per $1 spent | CSR pays 2x base rate; Robinhood 3x wins |
| 3 | All non-category spend | Chase Sapphire Preferred (2x = 2% base) | Any non-Robinhood merchant | earn_category | A1 | 1% delta per $1 spent | CSP pays 2x on travel/dining only; Robinhood 3x wins on non-category |
| 4 | All non-category spend | American Express Gold (1x = 1% base) | Any non-Robinhood merchant | earn_category | A1 | 2% delta per $1 spent | Amex Gold pays 4x dining/grocery (4%) but 1x other; Robinhood 3x beats 1x |
| 5 | All non-category spend | American Express Platinum (1x = 1% base) | Any non-Robinhood merchant | earn_category | A1 | 2% delta per $1 spent | Amex Plat pays 5x flights booked direct (5%), but 1x non-travel; Robinhood 3x beats 1x |

---

### Category 2: Travel Portal — Robinhood vs OTA Redirect (A1)

These entries flag when users book flights/hotels through OTA instead of Robinhood Travel portal, surfacing the 2x bonus multiplier ($60–175/booking).

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 6 | Robinhood Travel Portal | Expedia | `EXPEDIA` | travel | A1 | 2% delta (2x bonus points × $booking × 1cpp) | $500 booking = $10 missed bonus |
| 7 | Robinhood Travel Portal | Hotels.com | `HOTELS\.COM\|HOTELS COM` | travel | A1 | 2% delta (2x bonus points) | $500 booking = $10 missed bonus |
| 8 | Robinhood Travel Portal | Booking.com | `BOOKING\.COM\|BOOKING COM` | travel | A1 | 2% delta (2x bonus points) | $500 booking = $10 missed bonus |
| 9 | Robinhood Travel Portal | Priceline | `PRICELINE` | travel | A1 | 2% delta (2x bonus points) | $500 booking = $10 missed bonus |
| 10 | Robinhood Travel Portal | Kayak | `KAYAK` | travel | A1 | 2% delta (2x bonus points) | Meta OTA for flight search; Robinhood portal competitive |
| 11 | Robinhood Travel Portal | Skyscanner | `SKYSCANNER` | travel | A1 | 2% delta (2x bonus points) | Flight meta-search; requires transition to portal for booking |
| 12 | Robinhood Travel Portal | Airline direct (United, American, Southwest) | `UNITED\|AMERICANAIR\|SOUTHWEST` | travel | A1 | 2% delta (2x bonus points) | Direct bookings miss portal bonus |

---

### Category 3: Investment Account Integration — Unique to Robinhood (Informational)

| # | Feature | Use case | Plaid Pattern | Category | Type | Notes |
|---|---|---|---|---|---|---|
| 13 | Point-to-brokerage transfer | Invest earned points | N/A | investment | Meta | Robinhood Points convert at 1:1 to brokerage account. High-value conversion path (1.0cpp to brokerage vs 0.7cpp to statement credit). Unique to Robinhood — no other card offers direct brokerage integration. |
| 14 | Fractional share purchase | Invest in stocks/ETFs | N/A | investment | Meta | Points can fund fractional share purchases. No minimum investment. Unique wealth-building feature for reward optimization. |

---

**Catalog competitor map entries: 14 (12 active A1 redirects, 2 informational)**

---

## Part 3: Tracking Rules

| Benefit | Detection Method | Reset Logic | Confidence |
|---|---|---|---|
| rh_gold_3x_all | ALL Plaid transactions | Continuous (no reset) | High |
| rh_gold_5x_travel_portal | Plaid: "ROBINHOOD TRAVEL" merchant OR Robinhood portal spend logged | Calendar year; Jan 1 reset, $3,500 cap | Medium |
| rh_gold_cell_phone_protection | Card member manual claim submission (not statement-visible) | 12 months from purchase date | Low |
| rh_gold_trip_cancellation | Card member manual claim submission | Per-trip basis (up to 120 days from booking) | Low |
| rh_gold_auto_rental_cdw | Plaid: car rental merchants (Hertz, Avis, Enterprise, etc.) + card documentation | Per-rental basis (15 or 31 days) | Medium |
| rh_gold_purchase_security | Card member manual claim submission | 90 days from purchase date | Low |
| rh_gold_return_protection | Card member manual claim submission | 90 days from purchase date | Low |
| rh_gold_extended_warranty | Card member manual claim submission | Duration of extended warranty (up to 4 years) | Low |
| rh_gold_no_ftf | Plaid: international merchant detection (non-USD currency) | Continuous | High |
| rh_gold_virtual_cards | Infer from Robinhood account features dashboard | Continuous | Medium |
| rh_gold_minor_au | Infer from Robinhood account authorized users list | Continuous | Medium |

---

## Part 4: Period Reset Logic

| Reset Type | Benefits | Detection |
|---|---|---|
| **Calendar year** | 5x travel portal earn cap ($3,500 spend) | January 1 reset. Track cumulative Robinhood Travel portal spend YTD. |
| **Per-transaction** | 3x base earning on all spend | Continuous — no reset. Every charge earns 3 Robinhood Points per $1. |
| **Per-item** | Purchase protection, return protection, extended warranty | Triggered by purchase date + 90 days or warranty duration. Multi-claim limits apply. |
| **Per-event** | Trip cancellation, auto rental CDW, cell phone protection | Triggered by trip date, rental date, or incident date. Manual claim required. |

---

## Part 5: Robinhood Gold Card vs. Competitors — Cross-Reference

### Robinhood Gold vs Citi Double Cash

| Dimension | Robinhood Gold | Citi Double Cash |
|---|---|---|
| Annual fee | $0 card + $50 Robinhood Gold membership | $0 |
| Earning on all purchases | 3% (3x) | 2% (2x) |
| Earning on travel | 5% via portal (capped at $3,500/yr) | 2% (uncapped) |
| Earning on categories | Flat 3x, no category bonus | Flat 2x, no category bonus |
| Redemption | 1.0cpp to brokerage, 0.7cpp statement credit | Cash (100% value) |
| Travel insurance | Yes (trip cancel, auto rental CDW) | Limited |
| Unique features | Virtual cards, minor AU, extended warranty | Straightforward cash back |
| Best for | Robinhood investors, portfolio builders | Cash-back absolutists, simplicity seekers |
| Dollar impact ($30K/yr) | $900 earning - $50 fee = $850 net | $600 earning |
| Delta | +$250/yr for Robinhood users | Citi wins for non-investors |

---

### Robinhood Gold vs Chase Sapphire Preferred

| Dimension | Robinhood Gold | Chase Sapphire Preferred |
|---|---|---|
| Annual fee | $50 (Robinhood Gold membership) | $95 |
| Earning on all purchases | 3% (3x base) | 2% (2x base on travel/dining only; 1x other) |
| Earning on travel | 5% via portal (capped) | 3x (5x via portal) |
| Earning on dining | 3% (3x) | 3x (same rate) |
| Travel insurance | Trip cancel $2K; auto rental CDW (PRIMARY) | Trip cancel $10K; auto rental CDW (SECONDARY) |
| Lounge access | No | No (Sapphire Reserve only) |
| Points flexibility | Robinhood-locked (no transfers) | 14 transfer partners (1:1) |
| Bonus welcome | None | None mentioned |
| Virtual cards | Yes | No |
| Minor AU | Yes (up to 7) | No |
| Best for | Flat-rate earners, brokerage users | Travel optimizers, point-transfer enthusiasts |
| Dollar impact ($30K/yr) | $900 earning - $50 fee = $850 net | $600 earning - $95 fee = $505 net |
| Delta | +$345/yr for broad spenders | CSP wins for 3x earning + transfer partners |

---

### Robinhood Gold vs American Express Gold

| Dimension | Robinhood Gold | Amex Gold |
|---|---|---|
| Annual fee | $50 (Robinhood Gold membership) | $325 |
| Earning on all purchases | 3% (3x) | 1% (1x) |
| Earning on dining | 3% (3x) | 4% (4x) |
| Earning on groceries | 3% (3x) | 4% (up to $25K/yr, then 1x) |
| Earning on flights (direct) | 5% via portal (capped) or 3% | 3% (3x) |
| Travel insurance | Trip cancel $2K; auto rental CDW (PRIMARY) | Trip cancel $10K; auto rental CDW (SECONDARY) |
| Lounge access | No | No |
| Transfer partners | None | 21+ partners (variable ratios) |
| Bonus welcome | None | None mentioned |
| Best for | Flat-rate earning, brokerage users | Dining/grocery optimizers, MR transfer enthusiasts |
| Dollar impact ($30K/yr: $10K dining, $8K groceries, $12K other) | ($10K × 3%) + ($8K × 3%) + ($12K × 3%) - $50 = $850 | ($10K × 4%) + ($8K × 4%) + ($12K × 1%) - $325 = $415 |
| Delta | +$435/yr for mixed spenders | Amex wins only for heavy dining/grocery users ($15K+ annually) |

---

## Part 6: Implementation Notes

### Earning Strategy

**For flat-rate spenders ($20K–50K/yr):**
- Robinhood Gold beats Citi Double Cash (3% vs 2%), Venture X non-travel (3% vs 2%), and CSP non-category (3% vs 1%)
- Enables a unified Robinhood rewards ecosystem (no category hunting)
- Brokerage conversion (1.0cpp) is 10% more valuable than statement credit (0.7cpp)

**For travel-focused spenders:**
- 5% on Robinhood Travel portal (capped $3,500/yr = $175 max incremental) is secondary to base 3% earning
- Portal should be positioned as "bonus rate" for OTA alternatives, not primary differentiation
- CSR and CSP offer higher absolute earning ($300+ travel credits + higher multipliers), making them superior for travel-first profiles

**For investment-focused users:**
- Unique edge: Points convert to brokerage account at 1.0cpp (vs 0.7cpp statement credit)
- Fractional share purchase capability (invest points in real-time) is unavailable on any competitor card
- This drives "wealth builder" positioning

### Insight Volume Estimate

The Robinhood Gold Card generates **moderate-to-low insight volume** compared to CSR or Gold:
- **8–12 insights per user per month** (vs CSR 25–40, CSP 10–18, Gold 12–20)
- This is driven by: 5 A1 spend redirects (3% earning edge), 7 A1 travel portal redirects (2x bonus cap), and 8 trackable insurance benefits (low-frequency claims)
- Insurance benefits are **infrequently triggered** (unlike DoorDash credits on CSR)
- No semi-annual, monthly, or time-decay credits means lower urgency_score insights

### Key Differences from CSR/CSP/Gold Engine Logic

1. **Flat-rate earning dominance**: Robinhood Gold uses a single 3x multiplier across all categories. No need for complex category detection or bonus-rate bundling. This simplifies SQL queries vs CSP (which must distinguish travel/dining) or Gold (which must distinguish dining/grocery).

2. **Portal earn cap tracking**: The $3,500 annual cap on 5x travel portal earning requires cumulative YTD tracking. Once reached, subsequent portal bookings revert to 3x. Implementation: track `robinhood_travel` merchant sum and lock 5x multiplier after $3,500 threshold.

3. **Points-to-brokerage redemption**: Unlike traditional cash-back cards, Robinhood Points have dual valuation (1.0cpp brokerage vs 0.7cpp statement credit). Insight engine should surface the higher-value conversion path in recommendations: "Convert $300 in Points to fractional shares (+10% value vs statement credit)."

4. **Insurance claim detection**: Most insurance benefits (trip cancel, auto rental CDW, purchase protection, extended warranty) are manually claimed by card members and do NOT appear on statements. Unlike CSR benefits which auto-credit and appear as statement credits, these require B1 "activation" insights at onboarding: "You have $2K trip cancellation insurance — file a claim if your trip is cancelled."

5. **Robinhood ecosystem integration**: Tracking Robinhood account features (virtual cards, minor AU, brokerage conversion) requires API integration with Robinhood Dashboard, not Plaid alone. This is unique vs all other cards. Implementation: Robinhood OAuth + custom API field in card schema.

6. **Travel portal comparison**: Unlike CSR (Edit hotel credit) or Amex (Hilton status), Robinhood's portal incentive is purely earning-based (2x bonus on specific OTA merchants). This is a lower-friction redirect than credit-based messaging but also lower-impact ($60–175/yr vs $300–500/yr).

### Activation Checklist Priority (Onboarding)

For new Robinhood Gold users, the B1 onboarding checklist should surface these in order of dollar impact:

1. **Robinhood Travel Portal Setup** ($175/yr max @ $3,500 cap = 2% bonus earning) — quick win
2. **Virtual Card Creation** (security benefit for subscriptions) — one-time setup
3. **Insurance Benefit Awareness** (trip cancellation, auto rental CDW, purchase protection) — informational, low-friction
4. **Minor AU Enrollment** (if user has children/family spending) — family feature
5. **Robinhood Brokerage Integration** (convert points at 1.0cpp vs 0.7cpp) — long-term wealth builder
6. **Solid Gold Card Option** (optional prestige upgrade) — low priority

### Value Summary

| Dimension | Annual Value | Notes |
|---|---|---|
| Base earning (3% on $30K/yr) | $900 | Flat 3x on all purchases. No category complexity. Uncapped. |
| Travel portal bonus (5x on capped $3,500) | $0–$175 | Up to $175 incremental (vs 3x base) if user maxes $3,500 portal spend. Most users will earn $40–100. |
| Insurance benefits (trip cancel, CDW, purchase, return, warranty) | $200–1,000 | Highly variable and infrequently triggered. Conservative estimate $200/yr (0.5% claim rate). Premium estimate $1,000/yr (power users with frequent claims). |
| Virtual cards & minor AU | Qualitative | Cost avoidance (fraud from shared card) + family spend control. No direct dollar value. |
| Robinhood membership value | Variable | Paid separately ($50/yr). Includes stock/crypto trading, cash/securities accounts, premium research. Cards benefit from membership tier. |
| **Total estimated value** | **$1,100–2,075/yr** | Net value after $50 Robinhood Gold fee: ~$1,050–2,025/yr. High-end estimate assumes frequent travel portal usage + claim activity. Low-end assumes flat 3% + minimal add-ons. |

---

## Part 7: Strengths & Weaknesses vs Competitive Set

### Strengths

1. **Flat 3% earning beats 2% cards on all spend** — No category hunting. Out-earns Citi Double Cash, Venture X base rate, CSP non-category.

2. **No annual fee (card only)** — Membership fee is separate and optional. Pure 0% card fee is rare among premium cards (CSR $795, CSP $95, Amex Gold $325).

3. **Virtual cards & minor AU** — Fraud protection + family spend control unavailable on competitor cards.

4. **Primary auto rental CDW (15–31 days)** — Better than Amex Gold (secondary coverage) for car rental protection.

5. **Brokerage integration** — Points convert at 1.0cpp to investments (vs 0.7cpp statement credit, 0.1cpp cash). Unique to Robinhood ecosystem.

---

### Weaknesses

1. **No welcome bonus** — CSR, CSP, Amex Gold all offer 50K–100K point bonuses. Missing ~$500–1,000 onboarding value.

2. **No transfer partners** — Robinhood Points are locked to brokerage/statement credit. CSR has 14 airline/hotel partners (enable 1.5x–2.0cpp premium redemptions). Amex Gold has 21+ partners.

3. **No lounge access** — CSR includes Priority Pass + Sapphire Lounge. Robinhood has none (though Robinhood Lounge is in development, not yet live as of Feb 2026).

4. **Travel portal earning cap ($3,500/yr)** — Limits upside for frequent travelers. CSR 8x on Chase Travel (uncapped). Portal 5x earning is only 2% bonus incremental gain (vs 3% base).

5. **Trip cancellation limited ($2,000/person)** — CSR $10K, CSP $10K. Robinhood is 1/5th the coverage for high-value trips.

6. **No bonus category multipliers** — Flat 3% everywhere. Amex Gold 4x dining + 4x groceries (up to $25K) beats Robinhood 3x for high-spenders in those categories. CSR 8x Chase Travel, 4x flights/hotels direct.

---

### Recommended Positioning

| User Profile | Recommended Card | Reason |
|---|---|---|
| Flat-rate spender ($20K–50K/yr, no categories) | **Robinhood Gold** | 3% beats Citi Double Cash 2%, no fee complexity |
| Frequent traveler ($50K+ annual travel) | **CSR or CSP** | Higher earning on travel ($300 credit, 8x/5x multiplier), lounge access, transfer partners |
| Dining/grocery optimizer ($15K+ annually) | **Amex Gold** | 4x dining/grocery (4%) beats Robinhood 3%, $250+ annual credits |
| Wealth builder / Robinhood user | **Robinhood Gold** | Points → brokerage at 1.0cpp, fractional share purchases, ecosystem lock-in |
| Simplicity seeker, no category optimization | **Robinhood Gold or Citi Double Cash** | Robinhood 3% edges Citi 2%, but Citi has $0 membership req. Depends on cashback parity thresholds. |

---

## Part 8: Code Implementation Priorities

### Phase 1 (MVP)

- [ ] `rh_gold_3x_all` — Track all Plaid transactions, apply 3x multiplier universally
- [ ] `rh_gold_no_ftf` — Detect international merchants (Plaid currency != USD), flag $0 FTF benefit active
- [ ] `rh_gold_virtual_cards` — Binary flag (Robinhood account API check)
- [ ] A1 redirects (entries 1–5) — Spend on Citi Double Cash, Venture X, CSP, Amex Gold competitors; surface 1% earning delta

### Phase 2 (Post-MVP)

- [ ] `rh_gold_5x_travel_portal` — Track Robinhood Travel merchant + cumulative YTD spend; cap at $3,500
- [ ] A1 redirects (entries 6–12) — OTA competitor detection (Expedia, Hotels.com, etc.); surface 2% bonus earning for portal alternative
- [ ] `rh_gold_minor_au` — Robinhood account API for authorized user list
- [ ] Insight messaging framework for insurance benefits (trip cancel, CDW, purchase protection, return, warranty) — low-frequency B1 activation reminders

### Phase 3 (Future)

- [ ] Robinhood brokerage conversion optimizer — Track point balance + recommend 1.0cpp brokerage vs 0.7cpp statement credit
- [ ] Fractional share purchase UI — Allow direct points → stock/ETF in insights
- [ ] High-spend tier unlocks (if applicable in future card evolution)
- [ ] Robinhood Lounge integration (when live)

---
