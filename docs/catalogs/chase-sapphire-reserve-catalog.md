# Zurp Benefit Catalog — Chase Sapphire Reserve (CSR)

## Card Overview

| Field | Value |
|---|---|
| Card | Chase Sapphire Reserve® |
| Issuer | Chase (Visa Infinite) |
| Annual fee | $795 |
| Authorized user fee | $195 |
| card_type | `csr` |
| Points currency | Chase Ultimate Rewards |
| Points valuation | 1.25cpp (conservative; Points Boost can yield up to 2.0cpp on select hotels/flights) |
| Transfer partners | 14 airlines + hotels (1:1 ratio) |
| Fee anniversary | Account open date (NOT calendar year) |
| Benefit period | Varies — see individual benefits. Mix of calendar year, semi-annual, monthly, and anniversary year. |
| Research date | February 2026 |
| Benefit refresh | June 2025 (announced). Existing cardholders received new benefits October 26, 2025. |

---

## Part 1: Benefit Catalog

### Hard Credits — Statement Credits & In-App Credits

---

**1. csr_travel_credit**

| Field | Value |
|---|---|
| Name | $300 Annual Travel Credit |
| benefit_key | `csr_travel_credit` |
| Annual value | $300 |
| Type | Statement credit |
| Period | Anniversary year (NOT calendar year) |
| Reset | Anniversary of account opening |
| Activation | None — auto-applies |
| Expiration | Permanent benefit |
| Trackable | Yes — Plaid category TRAVEL. Credit appears as statement credit from Chase. |
| Confidence | High |
| Notes | Applies to a wide range of travel purchases: flights, hotels, car rentals, tolls, parking, transit, rideshare, etc. First $300 in travel purchases do NOT earn points. This credit likely applies first before other hotel credits. |

---

**2. csr_edit_hotel_credit**

| Field | Value |
|---|---|
| Name | $500 Annual The Edit Hotel Credit |
| benefit_key | `csr_edit_hotel_credit` |
| Annual value | $500 |
| Type | Statement credit |
| Period | Calendar year (as of 2026: two $250 credits usable anytime during year) |
| Reset | January 1 |
| Activation | None — auto-applies on qualifying Edit bookings |
| Expiration | Permanent benefit (terms updated for 2026) |
| Trackable | Partially — Plaid can detect Chase Travel credits, but cannot distinguish Edit from other Chase Travel bookings. |
| Confidence | Medium |
| Notes | 2-night minimum stay required. Includes complimentary breakfast for two, $100 property credit, room upgrade (if available), early check-in/late checkout. Purchases covered by credit do NOT earn points. Hotel loyalty points and elite night credits still earned on full amount. Over 1,100 curated properties. |

---

**3. csr_select_hotel_credit_2026**

| Field | Value |
|---|---|
| Name | $250 Select Chase Travel Hotels Credit (2026 only) |
| benefit_key | `csr_select_hotel_credit_2026` |
| Annual value | $250 |
| Type | Statement credit (one-time) |
| Period | Calendar year 2026 only |
| Reset | N/A — single use |
| Activation | None — auto-applies |
| Expiration | December 31, 2026 |
| Trackable | Partially — Chase Travel statement credit. |
| Confidence | Medium |
| Notes | Eligible chains: IHG Hotels & Resorts, Montage Hotels & Resorts, Pendry Hotels & Resorts, Omni Hotels & Resorts, Virgin Hotels, Minor Hotels, Pan Pacific Hotels and Resorts. 2-night minimum. Booked through Chase Travel (not direct). Purchases covered by credit do NOT earn points. Hotel loyalty points and elite night credits earned on full amount. LIMITED-TIME — not a permanent benefit. Consider flagging expiration to users. |

---

**4. csr_exclusive_tables_credit**

| Field | Value |
|---|---|
| Name | $300 Exclusive Tables Dining Credit |
| benefit_key | `csr_exclusive_tables_credit` |
| Annual value | $300 |
| Type | Statement credit |
| Period | Semi-annual ($150 Jan–Jun, $150 Jul–Dec) |
| Reset | January 1 and July 1 |
| Activation | Must verify card on OpenTable and add to account |
| Expiration | Terms through 06/30/2026 (may be renewed) |
| Trackable | Yes — statement credits from qualifying restaurants appear on Plaid. |
| Confidence | High |
| Notes | Includes access to primetime reservations at top restaurants. Available in major U.S. cities via Visa Dining Collection on OpenTable. Two separate $150 credits per half-year — unused balance does NOT roll over. Restaurants are curated in collaboration with The Infatuation. |

---

**5. csr_stubhub_credit**

| Field | Value |
|---|---|
| Name | $300 StubHub/viagogo Credit |
| benefit_key | `csr_stubhub_credit` |
| Annual value | $300 |
| Type | Statement credit |
| Period | Semi-annual ($150 Jan–Jun, $150 Jul–Dec) |
| Reset | January 1 and July 1 |
| Activation | Required — one-time activation via Chase account |
| Expiration | Through 12/31/2027 |
| Trackable | Yes — Plaid merchant name "STUBHUB" or "VIAGOGO". Statement credit appears separately. |
| Confidence | High |
| Notes | Valid for StubHub and viagogo purchases (concerts, sporting events, theater). Two separate $150 credits per half-year — unused balance does NOT roll over. |

---

**6. csr_doordash_dashpass**

| Field | Value |
|---|---|
| Name | Complimentary DashPass Membership |
| benefit_key | `csr_doordash_dashpass` |
| Annual value | $120 (membership fee waiver) |
| Type | Fee waiver (NOT statement credit) |
| Period | Minimum 12 months from activation |
| Reset | Based on activation date |
| Activation | Required — add Chase card as default payment on DoorDash, click activation button |
| Expiration | Must activate by 12/31/2027 |
| Trackable | Not directly — infer from transaction presence with DashPass-consistent pricing ($0 delivery fees). |
| Confidence | Low |
| Notes | Works on both DoorDash and Caviar (same login credentials required). Shared with CSP. $0 delivery fees and lower service fees on eligible orders. Must use Chase card for payment at checkout. |

---

**7. csr_doordash_promos**

| Field | Value |
|---|---|
| Name | $300 Annual DoorDash Promos |
| benefit_key | `csr_doordash_promos` |
| Annual value | $300 ($25/month) |
| Type | In-app discount (NOT statement credit) |
| Period | Monthly ($25/month = $5 restaurant + 2×$10 non-restaurant) |
| Reset | 1st of each month |
| Activation | Requires DashPass enrollment first |
| Expiration | Through 12/31/2027 |
| Trackable | Presence-based only — infer from DoorDash transaction presence. Cannot confirm promo was applied. |
| Confidence | Low-Medium |
| Notes | CSR gets $25/month ($5 restaurant + two $10 non-restaurant). CSP gets only $10/month (one $10 non-restaurant). The $180 delta is a key differentiator. Non-restaurant promos apply to groceries, convenience, retail orders. ONE promo per category per month. Same detection challenge as Gold's Uber Cash — transaction presence but no promo verification. |

---

**8. csr_lyft_credit**

| Field | Value |
|---|---|
| Name | $120 Annual Lyft In-App Credits |
| benefit_key | `csr_lyft_credit` |
| Annual value | $120 |
| Type | In-app credit (NOT statement credit) |
| Period | Monthly ($10/month) |
| Reset | 1st of each month (unused credit forfeited) |
| Activation | Link card to Lyft account |
| Expiration | Through 9/30/2027 |
| Trackable | Partially — Plaid detects Lyft transactions, but can't confirm in-app credit was applied vs. out-of-pocket spend. |
| Confidence | Medium |
| Notes | Does NOT apply to Wait & Save, bike, or scooter rides. Credit is use-it-or-lose-it each month. CSP does NOT receive this credit (CSP only gets 5x points). |

---

**9. csr_peloton_credit**

| Field | Value |
|---|---|
| Name | $120 Annual Peloton Membership Credit |
| benefit_key | `csr_peloton_credit` |
| Annual value | $120 |
| Type | Statement credit |
| Period | Monthly ($10/month) |
| Reset | Monthly |
| Activation | Required — activate via Chase account |
| Expiration | Through 12/31/2027 |
| Trackable | Yes — Plaid merchant name "PELOTON" with recurring charge pattern. |
| Confidence | High |
| Notes | Covers Peloton All-Access Membership, Rental, App One, App+, Guide, Strength+. Memberships start at $9.99/month. CSP does NOT receive this credit (CSP only gets 5x on equipment). |

---

**10. csr_apple_music**

| Field | Value |
|---|---|
| Name | Complimentary Apple Music Subscription |
| benefit_key | `csr_apple_music` |
| Annual value | ~$120 (Individual plan $10.99/month) |
| Type | Complimentary subscription (NOT statement credit) |
| Period | Continuous through expiration |
| Reset | N/A |
| Activation | Required — activate via Chase website/app |
| Expiration | Through 6/22/2027 |
| Trackable | Not directly — absence of Apple Music charge on statement indicates benefit is active. |
| Confidence | Low |
| Notes | If user already subscribes, they should cancel paid plan and switch to complimentary one. CSP does NOT receive this. Combined with Apple TV+, valued at ~$250/year. |

---

**11. csr_apple_tv**

| Field | Value |
|---|---|
| Name | Complimentary Apple TV+ Subscription |
| benefit_key | `csr_apple_tv` |
| Annual value | ~$100 (Individual plan $9.99/month) |
| Type | Complimentary subscription (NOT statement credit) |
| Period | Continuous through expiration |
| Reset | N/A |
| Activation | Required — activate via Chase website/app (separate from Apple Music) |
| Expiration | Through 6/22/2027 |
| Trackable | Not directly — absence of Apple TV+ charge on statement indicates benefit is active. |
| Confidence | Low |
| Notes | CSP does NOT receive this. Each service (Apple Music, Apple TV+) requires separate activation. |

---

**12. csr_global_entry_credit**

| Field | Value |
|---|---|
| Name | Global Entry / TSA PreCheck / NEXUS Credit |
| benefit_key | `csr_global_entry_credit` |
| Annual value | ~$30/yr (amortized: $120 every 4 years) |
| Type | Statement credit |
| Period | Every 4 years |
| Reset | 4-year cycle from first use |
| Activation | None — auto-applies when fee is charged |
| Expiration | Permanent benefit |
| Trackable | Yes — one-time charge from CBP or TSA. |
| Confidence | High |
| Notes | Covers Global Entry ($120), NEXUS ($120), or TSA PreCheck ($78). One application per 4-year period. |

### Points Multipliers

---

**13. csr_8x_chase_travel**

| Field | Value |
|---|---|
| Name | 8x on Chase Travel Purchases |
| benefit_key | `csr_8x_chase_travel` |
| Type | Points multiplier |
| Multiplier | 8x |
| Trackable | No — Plaid cannot distinguish Chase Travel portal purchases from direct bookings. |
| Notes | Replaced 5x flights / 10x hotels. Applies after $300 travel credit is earned. Includes The Edit properties. |

---

**14. csr_4x_flights_hotels_direct**

| Field | Value |
|---|---|
| Name | 4x on Direct Flights & Hotels |
| benefit_key | `csr_4x_flights_hotels_direct` |
| Type | Points multiplier |
| Multiplier | 4x |
| Trackable | Yes — Plaid categories TRAVEL > AIRLINES, TRAVEL > LODGING. |
| Confidence | High |
| Notes | Replaced 3x on all travel. Only for flights and hotels booked directly (not through Chase Travel). After $300 travel credit is earned. |

---

**15. csr_3x_dining**

| Field | Value |
|---|---|
| Name | 3x on Dining |
| benefit_key | `csr_3x_dining` |
| Type | Points multiplier |
| Multiplier | 3x |
| Trackable | Yes — Plaid category FOOD_AND_DRINK > RESTAURANT. |
| Confidence | High |
| Notes | Includes eligible delivery services, takeout, and dining out. Same rate as CSP. Lower than Amex Gold (4x). |

---

**16. csr_5x_lyft**

| Field | Value |
|---|---|
| Name | 5x on Lyft Rides |
| benefit_key | `csr_5x_lyft` |
| Type | Points multiplier |
| Multiplier | 5x (4 bonus + 1 base) |
| Expiration | Through 9/30/2027 |
| Trackable | Yes — Plaid merchant name "LYFT". |
| Confidence | High |
| Notes | Shared with CSP (same rate). Applies to rideshare only — excludes gift cards, car rentals, misc fees. |

---

**17. csr_10x_peloton**

| Field | Value |
|---|---|
| Name | 10x on Peloton Equipment |
| benefit_key | `csr_10x_peloton` |
| Type | Points multiplier |
| Multiplier | 10x |
| Expiration | Through 12/31/2027 |
| Trackable | Yes — Plaid merchant name "PELOTON", transactions >$150. |
| Confidence | High |
| Notes | Equipment and accessories over $150, up to $5,000 in total purchases (cap = 50,000 bonus points). CSP gets only 5x (half the rate). |

---

**18. csr_1x_other**

| Field | Value |
|---|---|
| Name | 1x on All Other Purchases |
| benefit_key | `csr_1x_other` |
| Type | Points multiplier (base rate) |
| Multiplier | 1x |
| Notes | Added for dollar_impact calculations across all spending. |

### Travel & Insurance Benefits

---

**19. csr_lounge_access**

| Field | Value |
|---|---|
| Name | Airport Lounge Access |
| benefit_key | `csr_lounge_access` |
| Annual value | ~$429+ (Priority Pass membership value) |
| Type | Access benefit |
| Trackable | No |
| Notes | Chase Sapphire Lounge by The Club (+ 2 guests). Priority Pass Select (1,300+ lounges). Select Air Canada Maple Leaf Lounges and Cafés (with eligible boarding pass on Star Alliance airline). CSP does NOT have lounge access. |

---

**20. csr_trip_cancellation**

| Field | Value |
|---|---|
| Name | Trip Cancellation/Interruption Insurance |
| benefit_key | `csr_trip_cancellation` |
| Coverage | $10,000 per person, $40,000 per year |
| Type | Insurance |
| Trackable | No |
| Notes | Shared with CSP (same limits). Must charge travel to CSR. |

---

**21. csr_auto_rental_cdw**

| Field | Value |
|---|---|
| Name | Auto Rental Collision Damage Waiver |
| benefit_key | `csr_auto_rental_cdw` |
| Coverage | PRIMARY — up to $60,000 |
| Type | Insurance |
| Trackable | No |
| Notes | PRIMARY coverage (pays before personal auto insurance). Shared with CSP. Key advantage over Amex Gold (SECONDARY). |

---

**22. csr_trip_delay**

| Field | Value |
|---|---|
| Name | Trip Delay Reimbursement |
| benefit_key | `csr_trip_delay` |
| Coverage | $500 per person (after 6+ hour delay) |
| Type | Insurance |
| Trackable | No |
| Notes | CSP matches ($500). Better than Gold ($300). Covers meals, lodging, toiletries during delay. |

---

**23. csr_baggage_delay**

| Field | Value |
|---|---|
| Name | Baggage Delay Insurance |
| benefit_key | `csr_baggage_delay` |
| Coverage | $100/day for 5 days |
| Type | Insurance |
| Trackable | No |
| Notes | Covers essential purchases while waiting for delayed luggage. |

---

**24. csr_lost_luggage**

| Field | Value |
|---|---|
| Name | Lost Luggage Reimbursement |
| benefit_key | `csr_lost_luggage` |
| Coverage | $3,000 per person |
| Type | Insurance |
| Trackable | No |
| Notes | Covers replacement of lost/damaged luggage and contents. |

---

**25. csr_purchase_protection**

| Field | Value |
|---|---|
| Name | Purchase Protection |
| benefit_key | `csr_purchase_protection` |
| Coverage | $500 per item, $50,000 per account |
| Type | Insurance |
| Trackable | No |
| Notes | Covers theft/damage within 120 days of purchase. Shared with CSP (same limits). |

---

**26. csr_extended_warranty**

| Field | Value |
|---|---|
| Name | Extended Warranty |
| benefit_key | `csr_extended_warranty` |
| Coverage | +1 year on existing warranties ≤3 years |
| Type | Insurance |
| Trackable | No |
| Notes | Shared with CSP (same terms). |

---

**27. csr_no_ftf**

| Field | Value |
|---|---|
| Name | No Foreign Transaction Fees |
| benefit_key | `csr_no_ftf` |
| Type | Fee waiver |
| Trackable | No |
| Notes | Standard across premium cards. Shared with CSP and Gold. |

---

**28. csr_transfer_partners**

| Field | Value |
|---|---|
| Name | 1:1 Transfer Partners |
| benefit_key | `csr_transfer_partners` |
| Type | Redemption benefit |
| Trackable | No |
| Notes | 14 airlines + hotels at 1:1 ratio. Shared with CSP. Key partners: World of Hyatt, United, Southwest, British Airways, Air France/KLM. Key differentiator vs Amex: Chase has United and Southwest (Amex does not). Amex has Delta (Chase does not). |

---

**29. csr_ihg_platinum_status**

| Field | Value |
|---|---|
| Name | IHG One Rewards Platinum Elite Status |
| benefit_key | `csr_ihg_platinum_status` |
| Type | Elite status |
| Expiration | Through 12/31/2027 |
| Trackable | No |
| Notes | Includes 60% bonus points on stays, exclusive member rates, promotions. Activation required. CSP does NOT receive this. |

---

**30. csr_reserve_travel_designer**

| Field | Value |
|---|---|
| Name | Reserve Travel Designer |
| benefit_key | `csr_reserve_travel_designer` |
| Value | Up to $300 per trip (service value) |
| Type | Concierge service |
| Trackable | No |
| Notes | Personalized travel planning: destination expert, custom itinerary, trip support before/during/after. CSP does NOT receive this. |

---

**31. csr_points_boost**

| Field | Value |
|---|---|
| Name | Points Boost Redemption |
| benefit_key | `csr_points_boost` |
| Type | Redemption enhancement |
| Trackable | No |
| Notes | Up to 2x value (2cpp) when booking select flights and hotels through Chase Travel. Variable — depends on offers available. Replaces the legacy fixed 1.5x portal redemption. Non-Points Boost redemptions are 1:1 (1cpp). |

### High-Spend Tier ($75K+ Annual Spend)

---

**32. csr_high_spend_shops_credit**

| Field | Value |
|---|---|
| Name | $250 Shops at Chase Credit |
| benefit_key | `csr_high_spend_shops_credit` |
| Annual value | $250 |
| Trigger | $75,000+ spend in calendar year |
| Type | Statement credit |
| Notes | Online shopping portal with brands like Apple, Sony, Dyson, Tumi. Auto-applies after threshold reached. Available through end of following calendar year. |

---

**33. csr_high_spend_southwest**

| Field | Value |
|---|---|
| Name | $500 Southwest Airlines Credit + A-List Status |
| benefit_key | `csr_high_spend_southwest` |
| Annual value | $500+ |
| Trigger | $75,000+ spend in calendar year |
| Type | Statement credit + elite status |
| Notes | $500 for Southwest flights booked through Chase Travel. A-List status benefits. Available through end of following calendar year. |

---

**34. csr_high_spend_ihg_diamond**

| Field | Value |
|---|---|
| Name | IHG One Rewards Diamond Elite Status |
| benefit_key | `csr_high_spend_ihg_diamond` |
| Trigger | $75,000+ spend in calendar year |
| Type | Elite status upgrade |
| Notes | Highest IHG status level. Replaces Platinum Elite. Available through end of following program year. |

---

**Total benefit count: 34**

### Value Summary

| Category | Annual Value | Notes |
|---|---|---|
| Hard credits (trackable) | ~$2,060 | Travel $300 + Edit $500 + Select Hotels $250 + Exclusive Tables $300 + StubHub $300 + DoorDash promos $300 + DashPass $120 + Lyft $120 + Peloton $120 + Apple subs ~$250 |
| Points multipliers | ~$500–1,000+ | Highly variable based on spend. 8x Chase Travel, 4x direct flights/hotels, 3x dining. |
| Insurance/access | ~$700+ | Lounge access, travel protections, elite status. |
| High-spend tier | ~$750+ | Only for $75K+ spenders. |
| **Total estimated value** | **~$2,700+** | Per Chase marketing. Net value after $795 fee: ~$1,905+ if all credits used. |

### Benefits Requiring Activation

| Benefit | Activation Method |
|---|---|
| csr_doordash_dashpass | Add card on DoorDash, click activation button |
| csr_stubhub_credit | One-time activation via Chase account |
| csr_apple_music | Activate via Chase website/app |
| csr_apple_tv | Activate via Chase website/app (separate from Music) |
| csr_peloton_credit | Activate via Chase account |
| csr_exclusive_tables_credit | Verify card on OpenTable |
| csr_ihg_platinum_status | Activate via Chase account |

**7 benefits requiring activation** (vs CSP 2, vs Gold 6).

---

## Part 2: Competitor Map

### Category 1: Events — StubHub Redirect (A1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 1 | StubHub | Ticketmaster | `TICKETMASTER\|TM\*` | events | A1 | Amount spent at competitor | Primary competitor — majority of U.S. event tickets |
| 2 | StubHub | AXS | `AXS\|AXS\.COM` | events | A1 | Amount spent | Regional venue ticketing |
| 3 | StubHub | SeatGeek | `SEATGEEK` | events | A1 | Amount spent | Secondary marketplace |
| 4 | StubHub | Vivid Seats | `VIVID SEATS\|VIVIDSEATS` | events | A1 | Amount spent | Secondary marketplace |

### Category 2: Food Delivery — DoorDash Redirect (A1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 5 | DoorDash | Uber Eats | `UBER EATS\|UBEREATS` | food_delivery | A1 | Amount spent | Must distinguish from Uber rides (different Plaid pattern) |
| 6 | DoorDash | Grubhub | `GRUBHUB\|GH\*` | food_delivery | A1 | Amount spent | |
| 7 | DoorDash | Postmates | `POSTMATES` | food_delivery | A1 | Amount spent | Now part of Uber Eats but may still appear separately in Plaid |

### Category 3: Streaming — Apple Music/TV+ Subscription Swap (A3)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 8 | Apple Music | Spotify | `SPOTIFY` | streaming | A3 | Annual subscription cost ($131.88–$203.88/yr) | "You're paying $X/mo for Spotify. Your card includes free Apple Music." |
| 9 | Apple TV+ | Netflix | `NETFLIX` | streaming | A3 | Annual subscription cost ($82.68–$275.88/yr) | Different content library — softer "consider using both or switching" copy |
| 10 | Apple TV+ | Hulu | `HULU` | streaming | A3 | Annual subscription cost ($95.88–$215.88/yr) | |
| 11 | Apple TV+ | Disney+ | `DISNEY PLUS\|DISNEYPLUS` | streaming | A3 | Annual subscription cost | |
| 12 | Apple TV+ | Max (HBO) | `MAX\|HBO MAX\|HBO` | streaming | A3 | Annual subscription cost | |
| 13 | Apple TV+ | Paramount+ | `PARAMOUNT\+\|PARAMOUNTPLUS` | streaming | A3 | Annual subscription cost | |
| 14 | Apple TV+ | Peacock | `PEACOCK\|NBCUNIVERSAL` | streaming | A3 | Annual subscription cost | |

### Category 4: Rideshare — Lyft Redirect (A1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 15 | Lyft | Uber (rides) | `UBER \*TRIP\|UBER BV` | rideshare | A1 | $10/month credit + 5x points value | Must distinguish rides from Uber Eats. Dollar signal = credit amount + incremental points (4 bonus pts × amount × 1.25cpp). |

### Category 5: Fitness — Peloton Redirect (A1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 16 | Peloton | ClassPass | `CLASSPASS` | fitness | A1 | $10/month credit value | If user pays for ClassPass, surface Peloton membership credit |
| 17 | Peloton | Equinox+ | `EQUINOX` | fitness | A1 | $10/month credit value | Digital membership competitor |
| 18 | Peloton | Tonal | `TONAL` | fitness | A1 | $10/month credit value | Home fitness competitor |

### Category 6: Hotels — Channel Redirect (A2, deferred to v2)

These require detecting that the user booked a hotel through an OTA instead of Chase Travel. As noted in the engine spec, A2 is deferred from v1 due to unreliable Plaid transaction descriptors for OTA bookings.

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 19 | Chase Travel (Edit) | Expedia | `EXPEDIA` | hotels | A2 | Edit credit + points delta | DEFERRED v2 |
| 20 | Chase Travel (Edit) | Hotels.com | `HOTELS\.COM\|HOTELS COM` | hotels | A2 | Edit credit + points delta | DEFERRED v2 |
| 21 | Chase Travel (Edit) | Booking.com | `BOOKING\.COM\|BOOKING COM` | hotels | A2 | Edit credit + points delta | DEFERRED v2 |
| 22 | Chase Travel (Edit) | Priceline | `PRICELINE` | hotels | A2 | Edit credit + points delta | DEFERRED v2 |
| 23 | Chase Travel (Edit) | Marriott.com | `MARRIOTT` | hotels | A2 | Edit credit | DEFERRED v2 — hard to distinguish direct booking from portal |
| 24 | Chase Travel (Edit) | Hilton.com | `HILTON` | hotels | A2 | Edit credit | DEFERRED v2 |

### Category 7: Dining — Exclusive Tables Redirect (A1)

These fire when a user dines at a high-end restaurant that is NOT part of Exclusive Tables. This is tricky because the list of participating restaurants changes and is location-specific. Consider a curated merchant list approach.

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 25 | Exclusive Tables | High-end dining (non-participating) | Category match: FOOD_AND_DRINK > RESTAURANT with amount > $100 | dining | A1 | Unused Exclusive Tables credit | DEFERRED v2 — requires Exclusive Tables restaurant list integration. Cannot reliably distinguish "dining at a non-participating restaurant" from "dining at a participating one" via Plaid alone. |

**Total competitor map entries: 25 (18 active in v1, 7 deferred to v2)**

---

## Part 3: Tracking Rules

| Benefit | Detection Method | Reset Logic | Confidence |
|---|---|---|---|
| csr_travel_credit | Chase statement credit in TRAVEL category | Anniversary year | High |
| csr_edit_hotel_credit | Chase Travel statement credits (hotel) | Calendar year (two $250 credits) | Medium |
| csr_select_hotel_credit_2026 | Chase Travel statement credit | Calendar year 2026 (one-time) | Medium |
| csr_exclusive_tables_credit | Statement credits from qualifying restaurants | Semi-annual (Jan–Jun, Jul–Dec) | High |
| csr_stubhub_credit | Plaid: "STUBHUB" or "VIAGOGO" + statement credit | Semi-annual (Jan–Jun, Jul–Dec) | High |
| csr_doordash_dashpass | Infer from DoorDash transactions with DashPass pricing | Based on activation date | Low |
| csr_doordash_promos | Presence of DoorDash non-restaurant orders | Monthly (1st of month) | Low-Medium |
| csr_lyft_credit | Plaid: "LYFT" transactions | Monthly (1st of month, forfeited if unused) | Medium |
| csr_peloton_credit | Plaid: "PELOTON" recurring charge + statement credit | Monthly | High |
| csr_apple_music | Absence of Apple Music charge | Continuous | Low |
| csr_apple_tv | Absence of Apple TV+ charge | Continuous | Low |
| csr_global_entry_credit | One-time charge from CBP/TSA + statement credit | 4-year cycle | High |
| csr_8x_chase_travel | NOT trackable via Plaid | N/A | N/A |
| csr_4x_flights_hotels_direct | Plaid category TRAVEL > AIRLINES, TRAVEL > LODGING | N/A | High |
| csr_3x_dining | Plaid category FOOD_AND_DRINK > RESTAURANT | N/A | High |
| csr_5x_lyft | Plaid: "LYFT" | N/A | High |
| csr_10x_peloton | Plaid: "PELOTON" transactions >$150 | N/A | High |

---

## Part 4: Period Reset Logic

The CSR has the most complex reset schedule of any supported card:

| Reset Type | Benefits | Detection |
|---|---|---|
| **Anniversary year** | Travel credit ($300) | Ask at onboarding: "When did you open your card?" Validate by scanning for ~$795 annual fee charge. |
| **Calendar year** | Edit hotel credit ($500), Select hotel credit ($250, 2026 only) | January 1 reset |
| **Semi-annual** | Exclusive Tables ($150×2), StubHub ($150×2) | January 1 / July 1 reset |
| **Monthly** | DoorDash promos ($25), Lyft credit ($10), Peloton credit ($10) | 1st of each month |
| **Continuous** | Apple Music, Apple TV+, DashPass | No reset — active until expiration date |
| **4-year cycle** | Global Entry/TSA PreCheck | Track from first use |

**Engine capabilities required for CSR:**
- Anniversary year reset (shared with CSP for hotel credit)
- Semi-annual period tracking (shared with Gold for Resy/Dunkin — but CSR has 4 semi-annual benefits vs Gold's 1)
- Monthly credit tracking with use-it-or-lose-it forfeiture (Lyft credit forfeits; DoorDash promos expire)
- Calendar year reset
- 4-year cycle tracking (Global Entry)
- Continuous benefit tracking (Apple subscriptions)

---

## Part 5: CSR vs. Other Cards — Cross-Reference

### CSR vs CSP

| Dimension | CSR | CSP |
|---|---|---|
| Annual fee | $795 | $95 |
| Hard credits | ~$2,060 | ~$290 |
| Competitor map entries | 18 active + 7 deferred | 4 active |
| Benefits requiring activation | 7 | 2 |
| Points on Chase Travel | 8x | 5x |
| Points on direct flights/hotels | 4x | 2x |
| Points on dining | 3x | 3x |
| Lounge access | Yes (Priority Pass + Sapphire Lounge) | No |
| StubHub credit | $300/yr | $0 |
| DoorDash promos | $300/yr ($25/mo) | $120/yr ($10/mo) |
| Lyft credit | $120/yr ($10/mo) | $0 |
| Peloton credit | $120/yr ($10/mo) | $0 |
| Apple subs | ~$250/yr | $0 |
| 10% anniversary bonus | No | Yes |
| 3x streaming | No | Yes |
| Estimated insights/user | 25–40 | 10–18 |

### CSR vs Amex Gold

| Dimension | CSR | Amex Gold |
|---|---|---|
| Annual fee | $795 | $325 |
| Hard credits | ~$2,060 | ~$424 |
| Transfer partners | 14 (Chase) | 21+ (Amex) |
| Points on dining | 3x UR | 4x MR |
| Points on groceries | 1x | 4x (up to $25K) |
| Lounge access | Yes | No |
| Auto rental CDW | Primary | Secondary |
| Key unique partners | United, Southwest, Hyatt | Delta, Hilton |

---

## Part 6: Implementation Notes

### Insight Volume Estimate

The CSR generates significantly more insights than any other supported card:
- **25–40 insights per user per month** (vs CSP 10–18, Gold 12–20)
- This is driven by 7 activation-required benefits (each generating B1 insights), 4 semi-annual credits (each generating B2 time-pressure insights), and 18 active competitor map entries (each generating A1 redirect insights)
- **Display rule priority becomes critical** — with this many candidates, the scoring engine must surface the highest-value insights and suppress noise

### Key Differences from CSP/Gold Engine Logic

1. **Semi-annual tracking (4 benefits)**: CSR has StubHub and Exclusive Tables each with $150 Jan–Jun and $150 Jul–Dec. Must track each half independently. Reset dates are January 1 and July 1, NOT anniversary-based.

2. **Monthly use-it-or-lose-it credits**: Lyft credit ($10/mo) and DoorDash promos ($25/mo) forfeit if unused. This creates high-frequency B2 insights — potentially one per month per credit. Consider insight fatigue: if user consistently ignores Lyft credit insights, reduce urgency_score after 3 consecutive months.

3. **DoorDash promo structure (3 separate promos/month)**: CSR gets $5 restaurant + $10 non-restaurant + $10 non-restaurant = $25/month. Each promo is separate and may need individual tracking, though for MVP, tracking total DoorDash activity per month is sufficient.

4. **Apple subscription inference**: These are NOT statement credits — they're free subscriptions. Detection is inverse: the absence of an Apple Music or Apple TV+ charge suggests the benefit is active. If a user IS paying for Apple Music/TV+ on their CSR, it likely means they haven't activated the free subscription → high-priority B1 insight.

5. **Channel redirect potential (A2, deferred)**: The CSR has the highest A2 upside of any card because Edit hotel credits ($500/yr) and Select Hotels credit ($250/yr) are all portal-locked. Any hotel booking that appears on the CSR statement that ISN'T from Chase Travel represents a massive missed opportunity. But detection reliability is too low for v1.

6. **High-spend tier**: The $75K threshold unlocks $750+ in additional value. In v1, we don't track toward thresholds, but in v2, a "spending pace" insight could be powerful: "You've spent $62,000 with 2 months left — $13,000 more unlocks $750+ in additional benefits."

### Activation Checklist Priority (Onboarding)

For new CSR users, the B1 onboarding checklist should surface these in order of dollar impact:

1. **DashPass** ($420/yr combined value — $120 membership + $300 promos)
2. **StubHub** ($300/yr — requires activation to earn credits)
3. **Exclusive Tables** ($300/yr — requires OpenTable verification)
4. **Apple Music** (~$120/yr)
5. **Apple TV+** (~$100/yr)
6. **Peloton** ($120/yr — only if user has/wants Peloton)
7. **IHG Platinum Status** (variable value — only if user stays at IHG)
