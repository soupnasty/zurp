# Zurp Benefit Catalog — Citi Strata Elite

## Card Overview

| Field | Value |
|---|---|
| Card | Citi Strata Elite℠ Card |
| Issuer | Citi (Mastercard World Legend — first card ever issued on this tier) |
| Annual fee | $595 |
| Authorized user fee | $75/user |
| card_type | `citi_strata_elite` |
| Points currency | Citi ThankYou Points |
| Points valuation | 1.0cpp (portal); 1.9cpp (TPG transfer valuation) |
| Transfer partners | 15 airlines + 5 hotels + 1 retail + 1 rewards club = 22 partners (most 1:1 ratio for Strata Elite/Premier) |
| Benefit period | Calendar year for all major credits (NOT anniversary) — enables first-year double-dip |
| Research date | February 2026 |
| Key differentiators | Only transferable currency with AA AAdvantage 1:1 transfers; first World Legend Mastercard; Admirals Club passes; Citi Nights 6x dining; Choice Hotels 1:2 transfer ratio; NO cell phone protection; NO return protection; NO issuer lounge network |

---

## Part 1: Benefit Catalog

### Hard Credits — Statement Credits & Portal Credits

---

**1. cse_hotel_credit**

| Field | Value |
|---|---|
| Name | $300 Annual Hotel Benefit |
| benefit_key | `cse_hotel_credit` |
| Annual value | $300 |
| Type | Portal credit (applied at booking through cititravel.com) |
| Period | Calendar year |
| Reset | January 1 |
| Activation | Book a hotel stay of 2+ nights through cititravel.com; credit applied at time of booking |
| Expiration | Permanent benefit |
| Trackable | Partially — can infer from Citi Travel bookings. The $300 is applied at checkout (like a coupon), not as a statement credit. |
| Confidence | Low-Medium |
| Notes | Must be a single hotel stay of 2 or more nights. Excludes taxes and fees. Applied instantly at time of booking through cititravel.com or by calling 1-833-737-1288. Unlike the Venture X credit, this is calendar year (not anniversary), enabling first-year double-dip. Can be used at ANY hotel on cititravel.com — not restricted to The Reserve collection. This is the card's most valuable hard credit. |

---

**2. cse_splurge_credit**

| Field | Value |
|---|---|
| Name | $200 Annual Splurge Credit℠ |
| benefit_key | `cse_splurge_credit` |
| Annual value | $200 |
| Type | Statement credit |
| Period | Calendar year |
| Reset | January 1 |
| Activation | Must select up to 2 brands in Citi account BEFORE making purchases. Then spend with card at selected brands. |
| Expiration | Permanent benefit |
| Trackable | Yes — statement credits for specific merchant purchases trackable via Plaid |
| Confidence | High |
| Eligible brands | 1stDibs, American Airlines (exclusions apply), Best Buy, Future Personal Training, Live Nation (exclusions apply) |
| Notes | Choose up to 2 of the 5 available brands. Must enroll/select in Citi account before purchases trigger credits. **Hack**: Buy $200 AA gift card (never expires) or buy Amazon gift cards at Best Buy to effectively convert to cash-like value. Calendar year resets enable first-year double-dip. This is the easiest credit to use — Best Buy gift cards are near-cash. |

---

**3. cse_blacklane_credit**

| Field | Value |
|---|---|
| Name | $200 Annual Blacklane Credit |
| benefit_key | `cse_blacklane_credit` |
| Annual value | $200 |
| Type | Statement credit |
| Period | Semi-annual (two $100 windows per calendar year) |
| Reset | January 1 (H1) and July 1 (H2) |
| Activation | Book rides through Blacklane with card |
| Expiration | Permanent benefit |
| Trackable | Yes — statement credits for Blacklane purchases trackable via Plaid |
| Confidence | High |
| Notes | Split into two $100 windows: up to $100 on Blacklane purchases January–June, up to $100 July–December. Blacklane is a premium global chauffeur service — airport transfers are the most common use case. More niche than other credits; if you don't use car services, this is dead value. Not everyone will find this useful. First-year double-dip possible (get H2 credit immediately, then H1+H2 next year = $300 in first year). |

---

**4. cse_global_entry**

| Field | Value |
|---|---|
| Name | Global Entry / TSA PreCheck Credit |
| benefit_key | `cse_global_entry` |
| Annual value | $30/yr (amortized: $120 / 4 years) |
| Type | Statement credit |
| Period | 4-year cycle |
| Reset | After credit used; next eligible after ~4 years |
| Activation | Charge Global Entry ($120) or TSA PreCheck ($85) application fee to card |
| Expiration | Permanent benefit |
| Trackable | Yes — Plaid can detect CBP/TSA charges + corresponding statement credit |
| Confidence | High |
| Notes | One credit per 4-year cycle. Global Entry includes TSA PreCheck, so Global Entry is the better value. Standard benefit across premium cards. |

---

### Lounge Access

---

**5. cse_priority_pass**

| Field | Value |
|---|---|
| Name | Priority Pass Select Membership |
| benefit_key | `cse_priority_pass` |
| Annual value | $469 (membership value) + lounge visits |
| Type | Lounge access |
| Period | Ongoing |
| Reset | N/A |
| Activation | Enrollment required — can present Citi Strata Elite card directly at Priority Pass lounges OR request digital Priority Pass account |
| Expiration | While card is active |
| Trackable | No |
| Confidence | N/A |
| Guest policy | Primary cardholder + up to 2 guests. Does NOT include Priority Pass restaurants or experiences (lounges only). |
| AU access | Authorized users ($75/yr each) receive their own Priority Pass membership and can also bring 2 guests. |
| Notes | Access to 1,500+ lounges worldwide. Unlike CSR, does NOT include Priority Pass restaurant credits or experiences — lounges only. You can enter by presenting the Strata Elite card itself at Priority Pass lounges (no separate PP card needed). |

---

**6. cse_admirals_club**

| Field | Value |
|---|---|
| Name | 4 American Airlines Admirals Club Passes |
| benefit_key | `cse_admirals_club` |
| Annual value | $316+ (each pass worth $79 individually) |
| Type | Lounge passes |
| Period | Calendar year |
| Reset | January 1 |
| Activation | Passes linked to AAdvantage Wallet (via AA app) or boarding pass with AAdvantage number |
| Expiration | Passes expire at end of calendar year |
| Trackable | No |
| Confidence | N/A |
| Requirements | Must have same-day boarding pass arriving or departing on a oneworld airline |
| Guest policy | Each pass admits 1 adult + up to 3 children under 18 (children do NOT require additional passes) |
| AU access | Authorized users do NOT receive Admirals Club passes (only primary cardholder) |
| Notes | 4 passes per calendar year for access to ~50 Admirals Club lounges worldwide. Each pass is valid for 24 hours, so it can cover multiple lounge visits in one day. This is NOT a full Admirals Club membership — it's limited to 4 uses per year. Excellent for occasional AA flyers. Calendar year reset means first-year double-dip possible (4 passes immediately + 4 after Jan 1). Citi estimates this perk alone is worth over $300 annually. **Key limitation**: AUs don't get Admirals Club access, only Priority Pass. |

---

### Hotel & Travel Perks — Portal-Locked Benefits

---

**7. cse_the_reserve**

| Field | Value |
|---|---|
| Name | The Reserve by Citi Travel |
| benefit_key | `cse_the_reserve` |
| Annual value | Variable — $100 experience credit per stay + daily breakfast for two + room upgrade/early check-in/late checkout when available |
| Type | Per-booking benefit (portal-locked) |
| Period | Per stay |
| Reset | N/A — applies every qualifying booking |
| Activation | Book through The Reserve collection on cititravel.com |
| Expiration | Permanent benefit |
| Trackable | No — portal bookings not distinguishable via Plaid |
| Confidence | N/A |
| Benefits per stay | $100 experience credit (varies by property), daily complimentary breakfast for 2, free Wi-Fi, early check-in, late checkout, room upgrades (all subject to availability) |
| Notes | Collection of participating 4.5–5 star hotels on cititravel.com. Competes directly with Amex FHR, Chase Edit (The Edit by Chase Travel), and Capital One Premier Collection. The $100 experience credit and daily breakfast are the core value. Stacks with the $300 annual hotel credit. Available to both Strata Elite and Strata Premier cardholders. |

---

### Earning Structure

---

**8. cse_earn_portal_hotel**

| Field | Value |
|---|---|
| Name | 12x on Hotels/Car Rentals/Attractions via Citi Travel |
| benefit_key | `cse_earn_portal_hotel` |
| Type | Earning rate (portal-locked) |
| Period | Ongoing |
| Notes | 12x points per dollar on hotels, car rentals, and attractions booked through cititravel.com. Highest portal multiplier of any major premium card. Must book through Citi Travel — direct bookings earn only 1.5x. |

---

**9. cse_earn_portal_air**

| Field | Value |
|---|---|
| Name | 6x on Air Travel via Citi Travel |
| benefit_key | `cse_earn_portal_air` |
| Type | Earning rate (portal-locked) |
| Period | Ongoing |
| Notes | 6x points per dollar on flights booked through cititravel.com. Strong rate, but portal-locked. Direct airline purchases earn only 1.5x. |

---

**10. cse_earn_citi_nights**

| Field | Value |
|---|---|
| Name | 6x on Restaurants — Citi Nights (Fri/Sat 6PM–6AM ET) |
| benefit_key | `cse_earn_citi_nights` |
| Type | Earning rate |
| Period | Ongoing |
| Notes | 6x points per dollar at restaurants (including delivery services) every Friday and Saturday from 6:00 PM to 6:00 AM Eastern Time. This is a unique time-based bonus category — NOT portal-locked. **Important**: Time window is based on Eastern Time regardless of cardholder's time zone. A dinner in Los Angeles at 7 PM PT (10 PM ET) qualifies. A lunch at 1 PM ET on Saturday does NOT qualify. |

---

**11. cse_earn_dining**

| Field | Value |
|---|---|
| Name | 3x on Restaurants (all other times) |
| benefit_key | `cse_earn_dining` |
| Type | Earning rate |
| Period | Ongoing |
| Notes | 3x points per dollar at restaurants including restaurant delivery services, at all times not covered by Citi Nights (i.e., Sunday–Thursday all day, plus Friday/Saturday 6 AM–6 PM ET). NOT portal-locked. Competitive with CSR's 3x dining. |

---

**12. cse_earn_base**

| Field | Value |
|---|---|
| Name | 1.5x on All Other Purchases |
| benefit_key | `cse_earn_base` |
| Type | Earning rate |
| Period | Ongoing |
| Notes | 1.5x points per dollar on all other eligible purchases. Higher than the typical 1x base rate on most premium cards (CSR 1x, Amex Plat 1x). Lower than Venture X 2x. This elevated base rate is a meaningful advantage for non-category spending. |

---

### Rental Car Benefits

---

**13. cse_masterrental**

| Field | Value |
|---|---|
| Name | MasterRental Coverage (Car Rental Insurance) |
| benefit_key | `cse_masterrental` |
| Annual value | Variable |
| Type | Insurance |
| Period | Ongoing |
| Coverage type | **SECONDARY within home country (US); PRIMARY outside home country** |
| Coverage limit | Actual cash value of rental vehicle (no fixed dollar cap stated) |
| Rental period | Up to 31 consecutive days (both domestic and international) |
| Activation | Pay entire rental with card; decline rental company's CDW |
| Trackable | No |
| Confidence | N/A |
| Additional coverage | Reasonable towing (2 tows), rental charges during repair, up to $500 loss-of-use charges |
| Excluded vehicles | Exotic/luxury cars (Porsche, Ferrari, Lamborghini, etc.), trucks/pickups, motorcycles, antique cars (20+ years), vehicles for 9+ passengers, open-bed vehicles |
| Notes | **CRITICAL DIFFERENCE vs competitors**: Secondary coverage in the US means your personal auto insurance pays first, then Citi covers remainder. This is WORSE than Chase Sapphire Reserve (primary) and Capital One Venture X (primary). Primary coverage only when renting outside your home country. Must decline the rental company's full CDW. Covers collision, overturn, vandalism, theft, and physical damage. Does NOT cover personal liability, personal belongings in the vehicle, or off-road use. |

---

### Travel Insurance

---

**14. cse_trip_cancel**

| Field | Value |
|---|---|
| Name | Enhanced Trip Cancellation & Trip Interruption Insurance |
| benefit_key | `cse_trip_cancel` |
| Coverage | Up to $5,000 per covered trip; $10,000 per account per 12-month period |
| Type | Insurance (secondary) |
| Period | Ongoing |
| Activation | Charge full round-trip travel cost to card |
| Trackable | No |
| Confidence | N/A |
| Covered reasons | (1) Accidental injury/loss of life/sickness of traveler or immediate family; (2) inclement weather preventing travel; (3) military orders change; (4) terrorist action/hijacking; (5) jury duty/subpoena; (6) dwelling made uninhabitable; (7) physician-imposed quarantine; (8) financial insolvency of travel agency/tour operator/supplier |
| Coverage scope | Nonrefundable amounts paid to travel suppliers with card. For interruption: forfeited pre-paid arrangements + additional economy transport to rejoin trip or return home. |
| Key limitations | Financial insolvency sub-limit: only $100 per claim. Pre-existing condition exclusion (60-day lookback). Must charge FULL amount of round-trip common carrier travel to card. ONE-WAY TICKETS NOT COVERED. Coverage is secondary. |
| Notes | "Enhanced" designation means broader covered reasons than basic trip cancellation (adds weather, terrorism, quarantine, etc.). However, **one-way tickets are not eligible** — this is a major limitation not found on all competing cards. The $5,000/trip limit is competitive with Citi's other cards but lower than some competitors. Financial insolvency sub-limit of $100 is essentially useless. Must pay for FULL round-trip with card. Travel Freely notes: "too restrictive" compared to other premium cards. |

---

**15. cse_trip_delay**

| Field | Value |
|---|---|
| Name | Trip Delay Protection |
| benefit_key | `cse_trip_delay` |
| Coverage | Up to $500 per trip; 2 claims per 12-month period |
| Type | Insurance |
| Period | Ongoing |
| Trigger | Delay of 6+ hours OR overnight stay required |
| Activation | Charge full round-trip common carrier travel cost to card |
| Trackable | No |
| Confidence | N/A |
| Covered expenses | Meals, lodging, and other necessities incurred during the delay |
| Notes | $500 max per trip with max 2 claims per rolling 12-month period. Must have paid full round-trip with card. Standard trigger threshold (6 hours) — same as CSR and most competitors. One-way tickets likely not covered (same round-trip requirement as trip cancellation). |

---

**16. cse_lost_luggage**

| Field | Value |
|---|---|
| Name | Lost or Damaged Luggage Protection |
| benefit_key | `cse_lost_luggage` |
| Coverage | Up to $5,000 per trip ($2,000 for New York residents) |
| Type | Insurance |
| Period | Ongoing |
| Activation | Pay full trip cost with card and/or ThankYou Points |
| Trackable | No |
| Confidence | N/A |
| Definition of "lost" | Luggage missing for 10 consecutive days after departing common carrier |
| Notes | Covers checked and carry-on luggage that is lost or damaged by a common carrier during a covered trip. Coverage pays difference between value of loss and amount reimbursed by common carrier. Must file with common carrier first within 24 hours. Claim must be reported within 60 days. NY residents get reduced $2,000 cap. Higher than Venture X ($3,000) but with the NY restriction. |

---

### Purchase Protections

---

**17. cse_purchase_protection**

| Field | Value |
|---|---|
| Name | Purchase Assurance Plus (Damage & Theft Protection) |
| benefit_key | `cse_purchase_protection` |
| Coverage | Up to $10,000 per item, $1,000 per incident, $50,000 per calendar year |
| Type | Insurance |
| Period | 120 days from purchase |
| Trackable | No |
| Confidence | N/A |
| Notes | Covers eligible items purchased entirely with card against damage, loss, or theft for 120 days from purchase date. Must file claim within 90 days. Excludes: motorized vehicles, cash, traveler's checks, tickets, food/perishables, living plants/animals, items purchased for resale. **NO RETURN PROTECTION** — this is a notable omission compared to CSR and Amex Platinum which include return protection. |

---

**18. cse_extended_warranty**

| Field | Value |
|---|---|
| Name | Extended Warranty |
| benefit_key | `cse_extended_warranty` |
| Coverage | Extends manufacturer's warranty by up to 24 months; up to $10,000 per item |
| Type | Insurance |
| Period | Ongoing |
| Activation | Pay for item at least in part with card and/or ThankYou Points |
| Trackable | No |
| Confidence | N/A |
| Notes | Adds up to 24 months to original U.S. manufacturer's warranty of 24 months or less. **This is the best extended warranty of any major card issuer** — most competitors (Chase, Amex, Capital One) only extend by 12 months. Up to $10,000 per item. Must have original manufacturer's warranty of 2 years or less. Does not extend store warranties or purchased extended warranties. |

---

### Lifestyle & Entertainment Benefits

---

**19. cse_citi_entertainment**

| Field | Value |
|---|---|
| Name | Citi Entertainment Access |
| benefit_key | `cse_citi_entertainment` |
| Annual value | Variable |
| Type | Access benefit |
| Period | Ongoing |
| Trackable | No |
| Notes | Access to presale tickets and exclusive experiences for music, sports, arts, and cultural events. Available to all Citi cardholders, but premium card may get priority access. Similar to Chase experiences or Amex entertainment access. |

---

**20. cse_fashioned**

| Field | Value |
|---|---|
| Name | Fashioned by Death & Co. |
| benefit_key | `cse_fashioned` |
| Annual value | Variable |
| Type | Access benefit |
| Period | Ongoing |
| Activation | Must be 21+ |
| Trackable | No |
| Notes | Access to Death & Co.'s "Fashioned" lifestyle platform featuring cocktail tutorials, videos, and mixology courses. Niche benefit — only valuable for cocktail enthusiasts. |

---

**21. cse_mastercard_world_legend**

| Field | Value |
|---|---|
| Name | Mastercard World Legend Benefits |
| benefit_key | `cse_mastercard_world_legend` |
| Annual value | Variable |
| Type | Access benefits |
| Period | Ongoing |
| Trackable | No |
| Benefits include | Priority reservations at thousands of restaurants worldwide (including via TheFork partnership in Europe); ticketing access to music, theater, sporting events globally; Mastercard Concierge (24/7); Mastercard Golf (PGA Tour experiences); Mastercard ID Theft Protection; Mastercard Zero Liability; Priceless Experiences (exclusive in-person and digital experiences) |
| Notes | First card on this new premium Mastercard tier (above World Elite). The dining reservations and Priceless experiences are the standout perks. Presale/preferred ticket access is valid through March 31, 2027. Competes with Visa Infinite concierge services. |

---

### Banking Relationship Credits

---

**22. cse_citigold_credit**

| Field | Value |
|---|---|
| Name | Citigold Banking Relationship Credit |
| benefit_key | `cse_citigold_credit` |
| Annual value | $145/year |
| Type | Statement credit |
| Period | Calendar year |
| Activation | Must be a qualifying Citigold client with open Strata Elite account |
| Trackable | Yes — statement credit |
| Notes | Annual $145 credit for qualifying Citigold banking customers. Reduces effective annual fee to $450. Requires maintaining Citigold relationship (typically $200K+ in eligible linked accounts). |

---

**23. cse_citigold_pc_credit**

| Field | Value |
|---|---|
| Name | Citigold Private Client Relationship Credit |
| benefit_key | `cse_citigold_pc_credit` |
| Annual value | $595 first year; $145 each year thereafter |
| Type | Statement credit |
| Period | Calendar year |
| Activation | Must be a qualifying Citigold Private Client with open Strata Elite account |
| Trackable | Yes — statement credit |
| Notes | First year: $595 credit (effectively makes the card FREE). Subsequent years: $145 credit. Citigold Private Client typically requires $1M+ in eligible linked accounts. Reduces effective annual fee to $0 in year 1, $450 in subsequent years. |

---

### Other Benefits

---

**24. cse_no_ftf**

| Field | Value |
|---|---|
| Name | No Foreign Transaction Fees |
| benefit_key | `cse_no_ftf` |
| Type | Fee waiver |
| Period | Ongoing |
| Notes | No foreign transaction fees on purchases. Standard on all premium travel cards. |

---

**25. cse_citi_flex_pay**

| Field | Value |
|---|---|
| Name | Citi Flex Pay |
| benefit_key | `cse_flex_pay` |
| Type | Payment feature |
| Period | Ongoing |
| Notes | Pay over time in fixed monthly payments on eligible purchases of $75+. Continue to earn points on purchases. APR-based or fee-based options. Not a benefit per se — more of a financing feature. |

---

**26. cse_48_month_rule**

| Field | Value |
|---|---|
| Name | Welcome Bonus (with 48-month restriction) |
| benefit_key | `cse_welcome_bonus` |
| Current offer | 75,000 ThankYou Points after $6,000 in 3 months (standard as of Feb 2026; 100,000 point limited offer expired Feb 2026) |
| Restriction | Cannot earn bonus if received a new account bonus for a Strata Elite in past 48 months, or if converted another Citi card that earned a bonus in last 48 months into a Strata Elite |
| Notes | The 48-month rule is PRODUCT-SPECIFIC, not family-wide. You CAN earn the Strata Elite bonus while holding a Strata Premier (or having recently earned its bonus). This is different from Amex's lifetime rule. Calendar is from bonus receipt date, not approval date. |

---

### NOT Included (Notable Omissions)

---

**27. cse_no_cell_phone** *(OMISSION)*

| Field | Value |
|---|---|
| Name | NO Cell Phone Protection |
| benefit_key | `cse_no_cell_phone` |
| Notes | **CRITICAL OMISSION**: Unlike CSR, Venture X, and Amex Platinum, the Strata Elite does NOT include cell phone protection. This is one of the most-cited weaknesses of the card. If cell phone insurance is important, another card is needed. |

---

**28. cse_no_return_protection** *(OMISSION)*

| Field | Value |
|---|---|
| Name | NO Return Protection |
| benefit_key | `cse_no_return_protection` |
| Notes | Unlike CSR and Amex Platinum, the Strata Elite does NOT include return protection. Purchase Assurance Plus covers damage/theft but NOT buyer's remorse or unwanted items. |

---

## Part 2: Transfer Partners (Citi ThankYou Points)

### Point Valuation
- Portal redemption: 1.0cpp (via cititravel.com)
- Cash back redemption: 0.75cpp (10,000 points = $75)
- Transfer partners: 1.9cpp (TPG valuation)
- Gift cards/Shop with Points: variable, generally poor value

### Airline Transfer Partners (15)

| Partner | Program | Ratio (Elite/Premier) | Ratio (No-fee cards) | Alliance | Notes |
|---|---|---|---|---|---|
| **American Airlines** | AAdvantage | 1:1 | 1:0.7 | oneworld | **EXCLUSIVE** — only transferable currency with AA. Best domestic partner. 60K OW biz to Japan on JAL, 80K OW first on JAL. Added July 2025. |
| Aeromexico | Club Premier | 1:1 | 1:0.7 | SkyTeam | |
| Air France-KLM | Flying Blue | 1:1 | 1:0.7 | SkyTeam | Promo Rewards for discounted awards. Free stopovers on awards. |
| Avianca | LifeMiles | 1:1 | 1:0.7 | Star Alliance | Low surcharges. Good for Star Alliance partner awards. |
| Cathay Pacific | Asia Miles | 1:1 | 1:0.7 | oneworld | |
| Emirates | Skywards | 1:0.8 | 1:0.56 | None | **WORST ratio** — 5:4 transfer. Avoid unless specifically booking Emirates premium cabins. |
| Etihad | Guest | 1:1 | 1:0.7 | None | Limited sweet spots. Consider using AA miles for Etihad instead. |
| EVA Air | Infinity MileageLands | 1:1 | 1:0.7 | Star Alliance | |
| JetBlue | TrueBlue | 1:1 | 1:0.7 | None | |
| Qantas | Frequent Flyer | 1:1 | 1:0.7 | oneworld | Devalued August 2025. Good for Australia/NZ routes. |
| Qatar Airways | Privilege Club | 1:1 | 1:0.7 | oneworld | |
| Singapore Airlines | KrisFlyer | 1:1 | 1:0.7 | Star Alliance | Transfers may take 24–48 hours (not instant). |
| Thai Airways | Royal Orchid Plus | 1:1 | 1:0.7 | Star Alliance | Unique to Citi (not available via Chase or Capital One). |
| Virgin Atlantic | Flying Club | 1:1 | 1:0.7 | SkyTeam | Good for ANA first class awards (not via AA). |
| Virgin Red | — | 1:1 | 1:0.7 | — | Rewards club (not strictly airline). |

### Hotel Transfer Partners (5)

| Partner | Program | Ratio (Elite/Premier) | Ratio (No-fee cards) | Notes |
|---|---|---|---|---|
| **Choice Privileges** | Choice Hotels | **1:2** | ~1:1.5 (2:3) | **BEST hotel transfer** — points DOUBLE. Unique to Citi at this ratio. Cambria, Ascend Collection, Preferred Hotels partnership. |
| **I Prefer Hotels** | Preferred Hotels & Resorts | **1:4** | ~1:2.8 | Points QUADRUPLE. Can yield 0.8cpp per Citi point. Boutique/independent properties. |
| Accor Live Limitless | ALL | 2:1 (POOR) | 2:1 | Points HALVE. Generally poor value. |
| Leading Hotels of the World | Leaders Club | 5:1 (POOR) | N/A | Points divide by 5. Very poor ratio. |
| Wyndham Rewards | Wyndham | 1:1 | reduced | Standard ratio. Wyndham points not worth much individually. |

### Retail Partner

| Partner | Ratio | Notes |
|---|---|---|
| Shop Your Way | 1:10 | Poor value. Avoid. |

### Best Transfer Values
1. **American Airlines AAdvantage** — Unique to Citi. Best for: domestic travel, JAL first/biz to Japan, oneworld partner awards
2. **Choice Privileges (1:2)** — Points double. Best for: Cambria Hotels, Ascend Collection, Preferred Hotels partnership properties
3. **I Prefer Hotels (1:4)** — Points quadruple. Best for: boutique/independent luxury properties
4. **Air France-KLM Flying Blue** — Promo Rewards, free stopovers, good Europe awards
5. **Avianca LifeMiles** — Low surcharges for Star Alliance partner awards

### Transfer Partners: Citi ThankYou Ecosystem
- Points pool across Citi ThankYou cards: Strata Elite, Strata Premier, Strata, Double Cash, Custom Cash, Rewards+
- No-fee cards earn at reduced transfer ratios (typically 0.7:1)
- **Key strategy**: Pool points from no-fee cards into a Strata Elite or Strata Premier account to unlock full 1:1 transfer ratios
- Can share points with other Citi ThankYou members (up to 100,000/year each way; shared points expire after 90 days)
- Transfers are instant for some partners (JetBlue, Flying Blue), 24–48 hours for others (Singapore)
- All transfers are irreversible

---

## Part 3: Competitor Map

### C1. Hotel Bookings
| Scenario | Competitor | Redirect |
|---|---|---|
| Booking hotels directly | Any hotel loyalty program, OTA | A1 redirect → cititravel.com for 12x points + $300 credit + The Reserve perks |
| Using other OTAs (Expedia, Booking.com, etc.) | Expedia, Hotels.com, Booking.com | A1 redirect → cititravel.com for 12x vs 1.5x (8x gap) |

### C2. Flights
| Scenario | Competitor | Redirect |
|---|---|---|
| Booking flights directly with airlines | Airline websites | A1 redirect → cititravel.com for 6x vs 1.5x (4x gap) |

### C3. Dining
| Scenario | Competitor | Redirect |
|---|---|---|
| Weekend dining (Fri/Sat evening) | Other dining cards | Already earning 6x — best category rate. No redirect needed. |
| Weekday dining | Amex Gold (4x), Venture X (2x) | A2 → may earn more on Amex Gold for weekday dining |

### C4. Rental Car Insurance
| Scenario | Competitor | Redirect |
|---|---|---|
| Renting cars domestically | CSR (primary), Venture X (primary) | A2 redirect → Use CSR or Venture X for PRIMARY CDW in US. Strata Elite is secondary domestically. |
| Renting cars internationally | Personal auto insurance | No redirect — Strata Elite provides PRIMARY CDW outside home country |

### C5. Cell Phone Protection
| Scenario | Competitor | Redirect |
|---|---|---|
| Cell phone insurance needs | Venture X, CSR, Wells Fargo Autograph Journey | B1 redirect → Use a card with cell phone protection. Strata Elite does NOT include this. |

### C6. General Non-Category Spending
| Scenario | Competitor | Redirect |
|---|---|---|
| Non-category spend | Venture X (2x), Citi Double Cash (2% back) | A1 note → Strata Elite earns 1.5x (better than 1x but worse than Venture X 2x or Double Cash 2%) |

### C7. Return Protection
| Scenario | Competitor | Redirect |
|---|---|---|
| Returning unwanted purchases | CSR, Amex Platinum | B1 redirect → Use a card with return protection. Strata Elite does NOT include this. |

### C8. Trip Cancellation
| Scenario | Competitor | Redirect |
|---|---|---|
| One-way ticket protection | CSR, Venture X | A2 → Strata Elite requires round-trip travel for coverage. Use another card for one-way tickets. |

---

## Part 4: Tracking Rules & Period Reset Logic

### Trackable Benefits (via Plaid / Statement Credits)

| Benefit | Tracking Method | Confidence |
|---|---|---|
| Splurge Credit ($200) | Statement credits for specific merchants | High |
| Blacklane Credit ($200) | Statement credits for Blacklane purchases | High |
| Global Entry ($120/4yr) | CBP/TSA charge + statement credit | High |
| Citigold Credit ($145) | Statement credit | High (if applicable) |

### NOT Trackable via Plaid

| Benefit | Reason |
|---|---|
| Hotel Credit ($300) | Portal credit applied at booking, not statement credit |
| Admirals Club Passes | Lounge access — no transaction |
| Priority Pass | Lounge access — no transaction |
| The Reserve perks | Portal booking — no distinguishable transaction |
| All insurance benefits | Usage-based, no regular transactions |
| Earning rates | Points accrual not visible via Plaid |
| All lifestyle benefits | Access-based, no transactions |

### Period Reset Schedule

| Period Type | Benefits | Reset Date |
|---|---|---|
| **Calendar year** | Hotel credit, Splurge credit, Admirals Club passes | January 1 |
| **Semi-annual (within calendar year)** | Blacklane credit ($100 H1 + $100 H2) | January 1 + July 1 |
| **4-year cycle** | Global Entry/TSA PreCheck | After credit used |
| **Per stay/booking** | The Reserve hotel benefits | N/A (every qualifying stay) |
| **Ongoing** | Priority Pass, earning rates, insurance, no FTF, World Legend benefits, Citi Entertainment, Fashioned | N/A |
| **Rolling 12-month** | Trip delay claims (2 per 12 months), trip cancellation ($10K per 12 months) | Rolling |

### CRITICAL: Calendar Year = First-Year Double-Dip

Because all major credits reset on **calendar year** (not anniversary), a cardholder who opens mid-year gets:
- **Year 1** (partial): $300 hotel + $200 Splurge + $200 Blacklane (H2 only = $100) + 4 Admirals Club passes = **$800+ in first partial year**
- **Year 2** (full): Same credits reset January 1 = another **$900**
- Combined first-year value before anniversary fee hits: up to **$1,700** in credits across two calendar years

This is a significant advantage over anniversary-based cards like Venture X.

---

## Part 5: Cross-Card Comparisons

### vs Chase Sapphire Reserve ($795)

| Dimension | Strata Elite | CSR |
|---|---|---|
| Annual fee | $595 | $795 |
| AU fee | $75 | $195 |
| Base earn | 1.5x everywhere | 1x everywhere |
| Portal hotel earn | 12x | 8x (Chase Travel) |
| Dining earn | 3x–6x (time-dependent) | 3x (always) |
| Hotel credit | $300 (portal, calendar year) | $500 (The Edit, calendar year, curated hotels only) |
| Other credits | $200 Splurge + $200 Blacklane | $300 dining + $300 StubHub + $120 Lyft |
| Rental car insurance | **SECONDARY** domestic / Primary international | **PRIMARY** everywhere |
| Cell phone protection | **NO** | Yes ($800/claim) |
| Return protection | **NO** | Yes |
| Lounge access | Priority Pass + 4 Admirals Club passes | Chase Sapphire Lounges + Priority Pass (w/ restaurants) + Air Canada Maple Leaf |
| Extended warranty | **+24 months** (best in class) | +12 months |
| Transfer partners | 22 (including **AA exclusive**) | 14 (no AA) |
| Trip cancel | $5,000/trip (round-trip only) | Higher limits, one-way eligible |
| Key advantage | AA transfers, 12x portal, 1.5x base, lower fee | Better insurance, lounge network, higher credit total |

### vs Capital One Venture X ($395)

| Dimension | Strata Elite | Venture X |
|---|---|---|
| Annual fee | $595 | $395 |
| Net cost after easy credits | ~$95 ($595 – $300 hotel – $200 Splurge) | ~$0 ($395 – $300 credit – $100 miles) |
| Base earn | 1.5x | **2x** |
| Portal hotel earn | **12x** | 10x |
| Dining earn | 3x–6x | 2x |
| Rental car insurance | SECONDARY (US) | **PRIMARY** |
| Cell phone protection | **NO** | **Yes** ($800/claim) |
| Lounge network | Priority Pass + 4 Admirals Club | Capital One Lounges (5) + Priority Pass |
| Guest lounge policy | PP: +2 guests; AC: per pass | **None** (removed Feb 2026) |
| Transfer partners | 22 (AA exclusive, Choice 1:2) | 22 (British Airways, Japan Airlines, Finnair) |
| Extended warranty | **+24 months** | +12 months |
| Simplicity | Medium (semi-annual Blacklane, time-based dining) | **Very simple** (2 credits, 2 rates) |
| Key advantage | AA transfers, 12x portal, better dining, Admirals Club | Lower fee, 2x base, primary CDW, cell phone, simpler |

### vs Amex Platinum ($895)

| Dimension | Strata Elite | Amex Platinum |
|---|---|---|
| Annual fee | $595 | $895 |
| Credit complexity | Medium (3 annual/semi-annual credits) | **Very high** (8+ credits, monthly/quarterly tracking) |
| Lounge network | Priority Pass + 4 Admirals Club passes | Centurion Lounges + Delta Sky Clubs + Priority Pass + Plaza Premium + Escape + more |
| Rental car insurance | SECONDARY (US) | SECONDARY |
| Cell phone protection | **NO** | Yes |
| Hotel program | The Reserve (good, limited properties) | FHR + THC (massive network) |
| Transfer partners | 22 (AA exclusive) | 21 (Delta exclusive) |
| Base earn | **1.5x** | 1x |
| Key advantage | Lower fee, simpler credits, AA access, better base earn | Vastly superior lounge network, more hotel options, more credits |

---

## Part 6: Implementation Notes for Zurp Engine

### Insight Volume Estimate
- **10–15 insights per month** — moderate complexity
- Semi-annual Blacklane tracking adds 1 period type vs pure calendar-year cards
- Citi Nights time-based earning adds a unique optimization angle (dinner timing insights)

### New Concepts for Engine
1. **Semi-annual credit windows**: Blacklane $100 H1 / $100 H2 — new period sub-type within calendar year
2. **Time-based earning rates**: Citi Nights 6x only applies Fri/Sat 6PM–6AM ET. Engine could send "dinner tonight earns 6x" reminder on Friday evenings
3. **Brand selection required**: Splurge Credit requires pre-selecting brands in Citi account — engine should prompt setup
4. **24-hour lounge passes**: Admirals Club passes are 24-hour windows, not single-use — tracking is pass-based, not visit-based
5. **Round-trip requirement**: Trip insurance requires full round-trip payment. Engine should warn when booking one-way tickets
6. **Double-dip strategy**: Calendar year credits make mid-year sign-up highly valuable — engine could highlight remaining calendar year credits for new cardholders

### Activation Checklist
1. ☐ Select 2 Splurge Credit brands in Citi account (Best Buy + AA recommended)
2. ☐ Enroll in Priority Pass (or note: can present Strata Elite card directly)
3. ☐ Link AAdvantage number for Admirals Club passes
4. ☐ Book Global Entry if not already enrolled
5. ☐ Set up Blacklane account for chauffeur credit
6. ☐ Explore The Reserve hotels on cititravel.com
7. ☐ Enroll in Fashioned by Death & Co. (21+)
8. ☐ Register for Mastercard ID Theft Protection
9. ☐ Explore Priceless experiences at priceless.com

### Key Architectural Notes
- **Calendar year alignment**: ALL major credits reset Jan 1 — simpler than CSR's mix of period types
- **Semi-annual sub-period**: Only Blacklane needs H1/H2 tracking within calendar year
- **Portal lock-in is extreme**: 12x vs 1.5x = 8x gap for hotels (widest of any card). Engine MUST redirect hotel bookings
- **AA exclusivity is the headline feature**: Only transferable currency → AA AAdvantage. This drives card selection for AA-focused travelers
- **Choice Hotels 1:2 is unique**: Points double on transfer. Engine should flag this for budget hotel stays
- **No cell phone, no return protection**: Engine should recommend alternative cards for these use cases
- **Secondary CDW domestically**: Engine should recommend CSR or Venture X for US rental car bookings
- **1.5x base is middle ground**: Better than 1x (CSR, Amex) but worse than 2x (Venture X). Multi-card optimization still relevant
- **Citi ThankYou pooling**: Points from Double Cash, Custom Cash, etc. can be pooled into Strata Elite for 1:1 transfers — cross-card optimization opportunity
