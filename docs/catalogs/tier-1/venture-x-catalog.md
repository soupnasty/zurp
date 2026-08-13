# Zurp Benefit Catalog — Capital One Venture X

*Last verified: 2026-08-13*

## Card Overview

| Field | Value |
|---|---|
| Card | Capital One Venture X Rewards Credit Card |
| Issuer | Capital One (Visa Infinite) |
| Annual fee | $395 |
| Authorized user fee | $0 (up to 4); $125/user for lounge access add-on |
| card_type | `venture_x` |
| Points currency | Capital One Miles |
| Points valuation | 1.0cpp (floor; portal redemption or erase purchases); 1.85cpp (TPG transfer valuation) |
| Transfer partners | 22 airline + hotel programs (most 1:1 ratio) |
| Fee anniversary | Account open date (NOT calendar year) |
| Benefit period | Varies — see individual benefits. Mix of anniversary year, calendar year, 4-year cycle, per-booking, and ongoing. |
| Research date | February 2026 |
| Key recent changes | Feb 1, 2026: Lounge guest access removed (except $75K spend threshold). AU lounge access now $125/user. Priority Pass guest access removed entirely for personal card. |

---

## Part 1: Benefit Catalog

### Hard Credits — Statement Credits & Portal Credits

---

**1. vx_travel_credit**

| Field | Value |
|---|---|
| Name | $300 Annual Capital One Travel Credit |
| benefit_key | `vx_travel_credit` |
| Annual value | $300 |
| Type | Portal credit (applied at booking, NOT statement credit) |
| Period | Anniversary year (NOT calendar year) |
| Reset | Anniversary of account opening |
| Activation | None — auto-applies during Capital One Travel bookings |
| Expiration | Permanent benefit |
| Trackable | Partially — can infer usage if user reports booking through Capital One Travel. Not directly visible via Plaid since it's a portal credit, not a statement credit. |
| Confidence | Low-Medium |
| Notes | Only applies to bookings made through Capital One Travel (flights, hotels, rental cars, activities). Works like a $300 coupon — applied during checkout. Does NOT need to be used all at once; can be split across multiple bookings. **Critical warning**: If a booking is canceled after the credit period expires, the credit is lost. Stacks with Premier/Lifestyle Collection benefits. Unlike CSR's $300 travel credit, this is NOT auto-applied to any travel purchase — must book through portal. |

---

**2. vx_anniversary_miles**

| Field | Value |
|---|---|
| Name | 10,000 Anniversary Bonus Miles |
| benefit_key | `vx_anniversary_miles` |
| Annual value | $100 minimum (1.0cpp floor); up to $185 (1.85cpp transfer value) |
| Type | Points deposit |
| Period | Anniversary year |
| Reset | Anniversary of account opening |
| Activation | None — auto-deposited |
| Expiration | Permanent benefit; miles never expire while account is open |
| Trackable | No — points deposits not visible via Plaid |
| Confidence | N/A |
| Notes | Deposited automatically on each anniversary. No spending requirement. Combined with $300 travel credit, provides $400+ in annual value against $395 fee — making net cost effectively $0 or negative. |

---

**3. vx_global_entry**

| Field | Value |
|---|---|
| Name | Global Entry / TSA PreCheck Credit |
| benefit_key | `vx_global_entry` |
| Annual value | $30/yr (amortized: $120 / 4 years) |
| Type | Statement credit |
| Period | 4-year cycle |
| Reset | After credit used; next eligible after ~4 years |
| Activation | Charge Global Entry ($120) or TSA PreCheck ($78–$98) application fee to card |
| Expiration | Permanent benefit |
| Trackable | Yes — Plaid can detect CBP/TSA charges + corresponding statement credit |
| Confidence | High |
| Notes | One credit per 4-year cycle. Global Entry includes TSA PreCheck, so Global Entry is the better choice. Applies to primary cardholder only. Same benefit as CSR, CSP, Amex Platinum. |

---

### Hotel & Travel Perks — Portal-Locked Benefits

---

**4. vx_premier_collection**

| Field | Value |
|---|---|
| Name | Premier Collection Hotel Benefits |
| benefit_key | `vx_premier_collection` |
| Annual value | Variable — $100 experience credit per stay + daily breakfast for two + room upgrade/early check-in/late checkout when available |
| Type | Per-booking benefit (portal-locked) |
| Period | Per stay |
| Reset | N/A — applies every qualifying booking |
| Activation | Book through Capital One Travel Premier Collection |
| Expiration | Permanent benefit |
| Trackable | No — portal bookings not distinguishable via Plaid |
| Confidence | N/A |
| Notes | Must book through Capital One Travel. $100 experience credit usable for dining, spa, activities — every property guarantees F&B usage (unlike Amex FHR which may restrict to spa only). Also includes daily breakfast for two, complimentary Wi-Fi, room upgrades, early check-in, late checkout (when available). Earns 10x miles on hotel bookings. Fourth night free available at select properties (min 4 consecutive nights). Stacks with $300 annual travel credit. Competes directly with Chase Edit ($100 property credit + breakfast) and Amex FHR ($100 credit + breakfast). |

---

**5. vx_lifestyle_collection**

| Field | Value |
|---|---|
| Name | Lifestyle Collection Hotel Benefits |
| benefit_key | `vx_lifestyle_collection` |
| Annual value | Variable — $50 experience credit per stay + room upgrade/early check-in/late checkout when available |
| Type | Per-booking benefit (portal-locked) |
| Period | Per stay |
| Reset | N/A — applies every qualifying booking |
| Activation | Book through Capital One Travel Lifestyle Collection |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | More accessible/boutique properties than Premier Collection (Virgin Hotels, the Standard, Design Hotels, the Line, etc.). NO daily breakfast (Premier Collection only). $50 experience credit for dining, spa, activities. Earns 10x miles. Fourth night free at select properties. Available to Venture X, Venture X Business, Venture, and Spark Miles cardholders. |

---

**6. vx_fourth_night_free**

| Field | Value |
|---|---|
| Name | Fourth Night Free |
| benefit_key | `vx_fourth_night_free` |
| Annual value | Variable — ~25% savings on 4+ night stays |
| Type | Per-booking benefit (portal-locked) |
| Period | Per stay (min 4 consecutive nights) |
| Reset | N/A |
| Activation | Book 4+ consecutive nights at participating Premier or Lifestyle Collection property through Capital One Travel |
| Expiration | Subject to change; blackout dates may apply |
| Trackable | No |
| Confidence | N/A |
| Notes | Applies once per booking (8-night stay gets one free night, not two). Cannot be retroactively applied. Not combinable with other offers unless indicated. Consider splitting extended stays into separate 4-night bookings for maximum savings. Launched August 2025. |

---

### Lounge Access

---

**7. vx_lounge_access**

| Field | Value |
|---|---|
| Name | Airport Lounge Access |
| benefit_key | `vx_lounge_access` |
| Annual value | ~$500+ (estimated per frequent traveler) |
| Type | Access benefit |
| Period | Ongoing |
| Reset | N/A |
| Activation | Capital One Lounges: present physical card or digital lounge pass in Capital One app. Priority Pass: must enroll separately. |
| Expiration | Permanent benefit (subject to policy changes) |
| Trackable | No |
| Confidence | N/A |
| Notes | **As of February 1, 2026**: Primary cardholder gets unlimited complimentary access to Capital One Lounges (DFW, DEN, LAS, JFK, IAD; CLT opening soon), Capital One Landings (DCA; LGA coming), and 1,300+ Priority Pass lounges worldwide. **Guest access REMOVED** — guests cost $45/adult, $25/child 2-17, free under 2 at Capital One Lounges/Landings; $35/guest at Priority Pass. **Authorized user lounge access REMOVED** — $125/year per AU for lounge access. **$75K spend exception**: Spending $75K+ in a calendar year unlocks 2 guests at Capital One Lounges + 1 guest at Landings for that year and the next. Does NOT restore Priority Pass guest access. |

---

### Rental Car Benefits

---

**8. vx_rental_car_cdw**

| Field | Value |
|---|---|
| Name | Primary Auto Rental Collision Damage Waiver |
| benefit_key | `vx_rental_car_cdw` |
| Annual value | ~$100–500+ (CDW savings per rental) |
| Type | Insurance benefit |
| Period | Ongoing |
| Reset | N/A |
| Activation | Pay full rental with Venture X card; decline rental company's CDW/LDW |
| Expiration | Permanent benefit |
| Trackable | Plaid can detect rental car charges; insurance usage not trackable |
| Confidence | N/A |
| Notes | **PRIMARY coverage** — same as CSR, better than Amex Platinum (secondary). Up to $75,000 coverage for collision damage and theft. Covers up to 15 consecutive days domestically, 31 days internationally. Does NOT cover: liability, injury to persons, damage to other vehicles, exotic/antique cars (MSRP >$75K), trucks, motorcycles, RVs. NOT available in Israel, Jamaica, Republic of Ireland, Northern Ireland. Covers cardholder and all additional drivers listed on rental agreement. $50 deductible NOT mentioned — no deductible for this benefit (unlike cell phone protection). |

---

**9. vx_hertz_status**

| Field | Value |
|---|---|
| Name | Hertz President's Circle Elite Status |
| benefit_key | `vx_hertz_status` |
| Annual value | Variable |
| Type | Elite status |
| Period | Ongoing (made permanent Sept 2024; no current end date) |
| Reset | N/A |
| Activation | Must enroll through Capital One website/app (NOT Hertz.com directly) |
| Expiration | Duration of offer (currently no end date announced) |
| Trackable | No |
| Confidence | N/A |
| Notes | Top-tier Hertz status. Benefits: guaranteed one-class upgrade (max full-size), access to Ultimate Choice lot President's Circle section, skip counter, 1.5x Hertz points, dedicated call center. Available to primary cardholder AND authorized users. Can be used alongside 10x miles when booking Hertz through Capital One Travel. Status is stackable with rental car CDW. Can also status-match to other rental companies. |

---

**10. vx_visa_infinite_rental**

| Field | Value |
|---|---|
| Name | Visa Infinite Rental Car Perks |
| benefit_key | `vx_visa_infinite_rental` |
| Annual value | Variable |
| Type | Status/discount |
| Period | Ongoing |
| Reset | N/A |
| Activation | Enrollment required for each program |
| Expiration | Permanent (Visa Infinite benefit) |
| Trackable | No |
| Confidence | N/A |
| Notes | National Emerald Club Executive membership (top-tier; skip counter, choose any car in Executive section). Avis Preferred Plus enrollment with up to 30% off base rates. Silvercar savings up to 30% (min 10% guaranteed). These stack with primary CDW coverage. |

---

### Cell Phone Protection

---

**11. vx_cell_phone**

| Field | Value |
|---|---|
| Name | Cell Phone Protection |
| benefit_key | `vx_cell_phone` |
| Annual value | Up to $1,600/yr (max 2 claims × $800) |
| Type | Insurance benefit |
| Period | Rolling 12-month (max 2 claims per 12-month period) |
| Reset | Rolling |
| Activation | Pay monthly wireless bill with Venture X card |
| Expiration | Permanent benefit |
| Trackable | Plaid can detect wireless bill payments (T-Mobile, AT&T, Verizon pattern) |
| Confidence | Medium (can verify wireless payment; cannot verify claim status) |
| Notes | Up to $800 per claim, $1,600 per 12-month period. $50 deductible per claim. Covers theft and accidental damage (including drops, cracked screens). Covers ALL lines on the account — not just primary cardholder's phone. Does NOT cover cosmetic damage, accessories, prepaid phones. Must have paid wireless bill with card in the month BEFORE the incident. Same structure as Amex Platinum cell phone protection. |

---

### Travel Insurance

---

**12. vx_trip_cancel**

| Field | Value |
|---|---|
| Name | Trip Cancellation & Interruption Insurance |
| benefit_key | `vx_trip_cancel` |
| Annual value | Up to $2,000 per person |
| Type | Insurance benefit |
| Period | Per trip |
| Reset | N/A |
| Activation | Pay for common carrier fare with Venture X card |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | Up to $2,000 per person for nonrefundable common carrier tickets (airlines, bus, train, ferry). Covers cardholder, spouse, dependent children. Only two qualifying scenarios: (1) death/injury/illness of cardholder or immediate family member, (2) financial insolvency of common carrier. Does NOT cover hotel reservations or prepaid tours. Does NOT cover weather, fear of travel, or "cancel for any reason." Narrower than CSR coverage. File claim within 20 days by mail to CBSI. |

---

**13. vx_trip_delay**

| Field | Value |
|---|---|
| Name | Trip Delay Reimbursement |
| benefit_key | `vx_trip_delay` |
| Annual value | Up to $500 per ticket |
| Type | Insurance benefit |
| Period | Per trip (1 claim per trip) |
| Reset | N/A |
| Activation | Pay for travel with Venture X card |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | Up to $500 per ticket for reasonable expenses (meals, lodging, toiletries, clothing) when delayed 6+ hours or requiring overnight stay. Covers cardholder, spouse, children under 22. Must purchase at least a portion of common carrier fare with card. |

---

**14. vx_baggage**

| Field | Value |
|---|---|
| Name | Lost Luggage Reimbursement |
| benefit_key | `vx_baggage` |
| Annual value | Up to $3,000 per trip |
| Type | Insurance benefit |
| Period | Per trip |
| Reset | N/A |
| Activation | Pay for airfare with Venture X card |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | Up to $3,000 per covered trip ($2,000 per bag for NY residents) for lost, damaged, or stolen bags. Supplemental to airline reimbursement. Covers cardholder and immediate family members. Certain items excluded (cash, event tickets, etc.). |

---

**15. vx_travel_accident**

| Field | Value |
|---|---|
| Name | Travel Accident Insurance |
| benefit_key | `vx_travel_accident` |
| Annual value | Up to $1,000,000 |
| Type | Insurance benefit |
| Period | Per trip |
| Reset | N/A |
| Activation | Pay for travel with Venture X card |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | Up to $1,000,000 coverage for accidental loss of life, limb, sight, speech, or hearing during transit. Must book and pay with card. |

---

### Purchase Protections

---

**16. vx_purchase_security**

| Field | Value |
|---|---|
| Name | Purchase Security |
| benefit_key | `vx_purchase_security` |
| Annual value | Up to $10,000 per claim / $50,000 per account |
| Type | Insurance benefit |
| Period | Ongoing |
| Reset | N/A |
| Activation | Purchase with Venture X card |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | Covers eligible purchases against damage or theft within 120 days of purchase. |

---

**17. vx_extended_warranty**

| Field | Value |
|---|---|
| Name | Extended Warranty Protection |
| benefit_key | `vx_extended_warranty` |
| Annual value | Variable |
| Type | Insurance benefit |
| Period | Ongoing |
| Reset | N/A |
| Activation | Purchase with Venture X card |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | Extends manufacturer's warranty by up to 1 additional year on eligible items purchased with card. |

---

**18. vx_return_protection**

| Field | Value |
|---|---|
| Name | Return Protection |
| benefit_key | `vx_return_protection` |
| Annual value | Up to $300 per item / $1,000 per account annually |
| Type | Insurance benefit |
| Period | Calendar year |
| Reset | January 1 |
| Activation | Purchase with Venture X card |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | If retailer won't accept return within 90 days of purchase, reimburses up to $300 per item. Annual max $1,000. |

---

### Points Earning

---

**19. vx_10x_hotels_rentals**

| Field | Value |
|---|---|
| Name | 10x Miles on Hotels & Rental Cars via Capital One Travel |
| benefit_key | `vx_10x_hotels_rentals` |
| Annual value | Highly variable |
| Type | Points multiplier (portal-locked) |
| Period | Ongoing |
| Reset | N/A |
| Activation | Book through Capital One Travel |
| Expiration | Permanent benefit |
| Trackable | No — portal bookings not distinguishable via Plaid |
| Confidence | N/A |
| Notes | 10x miles per $1 on hotels and rental cars booked through Capital One Travel. At 1.0cpp floor, this is 10% back. At 1.85cpp transfer value, this is 18.5% back. Portal lock-in: direct hotel/car bookings earn only 2x. Delta vs CSR: CSR earns 8x on Chase Travel hotels vs 4x direct. Venture X earns 10x portal vs 2x direct — a wider gap that makes portal booking significantly more rewarding. |

---

**20. vx_5x_flights_vacations**

| Field | Value |
|---|---|
| Name | 5x Miles on Flights & Vacation Rentals via Capital One Travel |
| benefit_key | `vx_5x_flights_vacations` |
| Annual value | Highly variable |
| Type | Points multiplier (portal-locked) |
| Period | Ongoing |
| Reset | N/A |
| Activation | Book through Capital One Travel |
| Expiration | Permanent benefit |
| Trackable | No |
| Confidence | N/A |
| Notes | 5x miles per $1 on flights and vacation rentals booked through Capital One Travel (verified 2026-08-13: vacation rentals earn 5x with flights, NOT the 10x hotels/rental-cars rate). Direct flight purchases earn only 2x. |

---

**21. vx_2x_everything**

| Field | Value |
|---|---|
| Name | 2x Miles on All Other Purchases |
| benefit_key | `vx_2x_everything` |
| Annual value | Highly variable |
| Type | Points multiplier |
| Period | Ongoing |
| Reset | N/A |
| Activation | None |
| Expiration | Permanent benefit |
| Trackable | N/A |
| Confidence | N/A |
| Notes | Unlimited 2x miles on every purchase not earning a higher multiplier. At 1.0cpp, this is 2% back on everything. This is the card's "killer feature" — no category tracking needed. Competes with CSR (1x on non-bonus), Amex Platinum (1x on non-bonus), Amex Gold (1x on non-bonus). This flat-rate earn is the primary reason Venture X is an excellent "default card" for non-category spend. |

---

### Lifestyle & Experience Benefits

---

**22. vx_prior_subscription**

| Field | Value |
|---|---|
| Name | Complimentary PRIOR Subscription |
| benefit_key | `vx_prior_subscription` |
| Annual value | $149 (retail value) |
| Type | Subscription benefit |
| Period | Ongoing |
| Reset | N/A |
| Activation | Enroll through Capital One website/app |
| Expiration | Duration of cardmembership |
| Trackable | No |
| Confidence | N/A |
| Notes | PRIOR is a modern travel brand with exclusive experiences, destination guides, weekly newsletters, and early access to curated trips. Complimentary for Venture X cardholders upon enrollment. |

---

**23. vx_cultivist**

| Field | Value |
|---|---|
| Name | 50% Off The Cultivist Enthusiast Membership |
| benefit_key | `vx_cultivist` |
| Annual value | Up to $220/yr (50% of $440 for up to 2 years) |
| Type | Discount benefit |
| Period | Up to 2 years |
| Reset | N/A |
| Activation | Enroll online with The Cultivist |
| Expiration | 2 years from enrollment |
| Trackable | No |
| Confidence | N/A |
| Notes | Free entry for member + guest to 60+ leading museums worldwide (The Met, MoMA, etc.). Half-price membership at $220/yr vs $440 retail. Niche benefit — high value for art/culture enthusiasts. |

---

**24. vx_vinous**

| Field | Value |
|---|---|
| Name | Complimentary Vinous Premium Subscription |
| benefit_key | `vx_vinous` |
| Annual value | Variable (6-month subscription) |
| Type | Subscription benefit |
| Period | 6 months |
| Reset | N/A |
| Activation | Sign up through Capital One |
| Expiration | After 6-month trial |
| Trackable | No |
| Confidence | N/A |
| Notes | Vinous is a leading wine publication with ratings, reviews, and wine tools. Complimentary 6-month premium subscription for eligible cardholders. Niche benefit. |

---

**25. vx_entertainment**

| Field | Value |
|---|---|
| Name | Capital One Entertainment Access |
| benefit_key | `vx_entertainment` |
| Annual value | Variable |
| Type | Access benefit |
| Period | Ongoing |
| Reset | N/A |
| Activation | Access through Capital One Entertainment platform |
| Expiration | Permanent benefit |
| Trackable | Plaid can detect Capital One Entertainment purchases |
| Confidence | N/A |
| Notes | Exclusive access to pre-sales, VIP packages, events across music, sports, dining. Not a statement credit — but provides access to otherwise unavailable tickets/experiences. (Earn config models these purchases at the 2x base rate; no Entertainment earn bonus is configured.) |

---

**26. vx_visa_infinite_concierge**

| Field | Value |
|---|---|
| Name | Visa Infinite Concierge |
| benefit_key | `vx_visa_infinite_concierge` |
| Annual value | Variable |
| Type | Service benefit |
| Period | Ongoing |
| Reset | N/A |
| Activation | Call concierge line |
| Expiration | Permanent benefit (Visa Infinite) |
| Trackable | No |
| Confidence | N/A |
| Notes | 24/7 concierge for dinner reservations, event tickets, gift ideas, travel planning. Standard Visa Infinite benefit. |

---

### Miscellaneous

---

**27. vx_no_ftf**

| Field | Value |
|---|---|
| Name | No Foreign Transaction Fees |
| benefit_key | `vx_no_ftf` |
| Annual value | Variable (typically 3% savings on international purchases) |
| Type | Fee waiver |
| Period | Ongoing |
| Reset | N/A |
| Activation | None |
| Expiration | Permanent benefit |
| Trackable | N/A |
| Confidence | N/A |
| Notes | Standard for premium travel cards. Saves 3% vs cards that charge FTF. |

---

### High-Spend Tier ($75K+ Annual Spend)

---

**28. vx_high_spend_lounge_guests**

| Field | Value |
|---|---|
| Name | Complimentary Lounge Guest Access (High Spenders) |
| benefit_key | `vx_high_spend_lounge_guests` |
| Annual value | ~$500+ (estimated per travel frequency) |
| Trigger | $75,000+ spend in calendar year (across primary + AU cards) |
| Type | Access benefit |
| Period | Calendar year of qualification + following calendar year |
| Reset | January 1 |
| Activation | Automatic once spending threshold reached |
| Expiration | End of following calendar year |
| Trackable | Plaid can track total annual spend toward threshold |
| Confidence | Medium |
| Notes | Unlocks: 2 complimentary guests at Capital One Lounges, 1 complimentary guest at Capital One Landings. Guest access applies to primary cardholder and any AU who paid $125 lounge fee. Does NOT restore Priority Pass guest access (that's permanently removed for personal Venture X). Spending tracked since 2025 calendar year. |

---

**Total benefit count: 28**

### Value Summary

| Category | Annual Value | Notes |
|---|---|---|
| Hard credits (trackable) | ~$400 | Travel credit $300 + anniversary miles $100 (floor) |
| Portal-locked hotel perks | Variable | $100 or $50 experience credit per stay + breakfast (Premier only) + 4th night free |
| Insurance/access | ~$800+ | Lounge access, primary CDW, cell phone protection, travel insurance |
| Elite status | Variable | Hertz President's Circle, National Executive, Avis Preferred Plus |
| Points earning | Strong | 2x everything (best flat-rate among premium cards) |
| **Total estimated value** | **~$1,400+ minimum** | Conservative. Net value after $395 fee: **~$1,000+** if travel credit and anniversary miles alone used. Much higher for frequent travelers using portal and lounges. |

### Benefits Requiring Activation

| Benefit | Activation Method |
|---|---|
| vx_lounge_access (Priority Pass) | Enroll in Priority Pass through Capital One |
| vx_hertz_status | Enroll through Capital One website/app (NOT Hertz.com) |
| vx_visa_infinite_rental | Enroll separately with National, Avis, Silvercar |
| vx_cell_phone | Pay wireless bill with card monthly |
| vx_prior_subscription | Enroll through Capital One |
| vx_cultivist | Enroll online with The Cultivist |
| vx_vinous | Sign up through Capital One |

**7 benefits requiring activation** (vs CSR 7, Gold 6, CSP 2).

---

## Part 2: Competitor Map

### Category 1: Hotels — Capital One Travel Portal Redirect (A1)

These fire when a user books a hotel through an OTA or directly instead of Capital One Travel, surfacing the travel credit + 10x earn rate + Premier/Lifestyle Collection perks as the dollar signal.

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Capital One Travel | Expedia | `EXPEDIA` | hotels | A1 | $300 travel credit + 10x points delta + Premier/Lifestyle Collection perks ($100/$50 credit + breakfast) | Portal booking yields 10x vs 2x direct = 8x delta (8.0cpp/$ at floor; 14.8cpp/$ at 1.85cpp) |
| 2 | Capital One Travel | Hotels.com | `HOTELS\.COM\|HOTELS COM` | hotels | A1 | Same as above | Active |
| 3 | Capital One Travel | Booking.com | `BOOKING\.COM\|BOOKING COM` | hotels | A1 | Same as above | Active |
| 4 | Capital One Travel | Priceline | `PRICELINE` | hotels | A1 | Same as above | Active |
| 5 | Capital One Travel | Marriott.com | `MARRIOTT` | hotels | A1 | Travel credit + 10x delta; user loses Marriott loyalty points/status credits | Active — but note tradeoff: booking direct earns hotel loyalty points + elite night credits. Surface both sides. |
| 6 | Capital One Travel | Hilton.com | `HILTON` | hotels | A1 | Same tradeoff as Marriott | Active |

### Category 2: Flights — Capital One Travel Portal Redirect (A1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 7 | Capital One Travel | Airline direct purchases | `UNITED\|DELTA\|AMERICAN\|SOUTHWEST\|JETBLUE\|ALASKA\|SPIRIT\|FRONTIER` | flights | A1 | $300 travel credit + 5x vs 2x delta (3x = 3.0cpp/$ floor; 5.55cpp/$ at 1.85cpp) | Portal booking yields 5x vs 2x direct. Note: airline loyalty status/mileage earning is preserved when booking through C1 Travel for most airlines. Price match guarantee within 24 hours. |

### Category 3: Rental Cars — Capital One Travel Redirect (A1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 8 | Capital One Travel (Hertz) | Enterprise/National/Avis/Budget direct | `ENTERPRISE\|NATIONAL CAR\|AVIS\|BUDGET RENT` | rental_cars | A1 | 10x vs 2x delta + Hertz PC status perks | Booking through C1 Travel earns 10x miles on rental cars. Can add Hertz number to get President's Circle perks even when booking through portal. |

### Category 4: Rental Car Insurance — CDW Redirect (A2)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 9 | Venture X CDW | Rental company CDW purchases | `CDW\|LDW\|COLLISION DAMAGE\|DAMAGE WAIVER` or rental car charge with unusually high amount | rental_insurance | A2 | $15-30/day CDW savings | If user appears to be paying for CDW at rental counter, surface primary CDW benefit. Hard to detect via Plaid — DEFERRED v2. |

### Category 5: Wireless Carrier — Cell Phone Protection Redirect (B1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 10 | Venture X Cell Protection | Carrier insurance add-ons | `ASURION\|DEVICE PROTECTION\|PHONE INSURANCE` | cell_phone | B1 | $800/claim value; potential to cancel $10-17/mo carrier insurance | If user is paying wireless bill with Venture X AND paying for separate device insurance, surface that card provides $800/claim coverage and they may be able to cancel carrier insurance. Detection: wireless bill on card + separate insurance charge. |

### Category 6: Hotel Loyalty — Direct Booking Tradeoff (C0, Reference)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 11 | N/A (Reference) | N/A | N/A | hotels | C0 | N/A | **Reference note for engine**: Unlike CSR (which earns 4x on direct hotel bookings), Venture X earns only 2x on direct bookings. Users prioritizing hotel elite status/loyalty may prefer to book direct and sacrifice the 10x portal earn. Engine should NOT aggressively redirect loyal hotel program members away from direct bookings without surfacing the tradeoff. |

### Category 7: General Spend — 2x Everywhere Redirect (A1)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 12 | Venture X 2x | Non-category cards (1x or 1.5x) | General transaction detection | general_spend | A1 | 2x vs 1x = 1.0cpp/$ minimum incremental value | If user has linked a non-bonus card being used for everyday purchases and also has Venture X, surface that Venture X earns 2x on everything. Only relevant in multi-card setups. |

### Category 8: Travel Credit Activation — Setup Reminder (C0, Reference)

| # | Benefit Partner | Competitor | Plaid Pattern | Category | Type | Dollar Signal | Notes |
|---|---|---|---|---|---|---|---|
| 13 | N/A (Reference) | N/A | N/A | activation | C0 | $300 annual travel credit | **Reference for B1 onboarding insight**: Remind user that $300 travel credit expires on anniversary date and is only usable through Capital One Travel. If approaching anniversary with unused credit, escalate urgency. Monitor for any Capital One Travel charges to infer usage. |

**Catalog competitor map entries: 13 (9 active v1, 2 deferred, 2 C0 reference)**

---

## Part 3: Tracking Rules

| Benefit | Detection Method | Reset Logic | Confidence |
|---|---|---|---|
| vx_travel_credit | Infer from Capital One Travel charges (difficult via Plaid) | Anniversary year | Low-Medium |
| vx_anniversary_miles | Not trackable via Plaid | Anniversary year | N/A |
| vx_global_entry | Plaid: CBP/TSA charges + statement credit | 4-year cycle | High |
| vx_premier_collection | Not trackable via Plaid (portal bookings) | Per stay | N/A |
| vx_lifestyle_collection | Not trackable via Plaid | Per stay | N/A |
| vx_fourth_night_free | Not trackable | Per stay | N/A |
| vx_lounge_access | Not trackable | Ongoing | N/A |
| vx_rental_car_cdw | Plaid: rental car charges | Per rental | Medium |
| vx_hertz_status | Not trackable | Ongoing | N/A |
| vx_cell_phone | Plaid: wireless bill payments (T-MOBILE, AT&T, VERIZON) | Rolling 12-month | Medium |
| vx_trip_cancel | Not trackable | Per trip | N/A |
| vx_trip_delay | Not trackable | Per trip | N/A |
| vx_baggage | Not trackable | Per trip | N/A |
| vx_travel_accident | Not trackable | Per trip | N/A |
| vx_purchase_security | Not trackable | Ongoing | N/A |
| vx_extended_warranty | Not trackable | Ongoing | N/A |
| vx_return_protection | Not trackable | Calendar year | N/A |
| vx_10x_hotels_rentals | Not trackable (portal distinction) | Ongoing | N/A |
| vx_5x_flights_vacations | Not trackable (portal distinction) | Ongoing | N/A |
| vx_2x_everything | All non-travel transactions on card | Ongoing | High |
| vx_high_spend_lounge_guests | Plaid: total annual spend on card | Calendar year | Medium |

---

## Part 4: Period Reset Logic

The Venture X has a simpler reset schedule than CSR or Amex Platinum:

| Reset Type | Benefits | Detection |
|---|---|---|
| **Anniversary year** | Travel credit ($300), anniversary miles (10K) | Ask at onboarding: "When did you open your card?" Validate by scanning for ~$395 annual fee charge. |
| **Calendar year** | Return protection ($1,000 max), high-spend lounge guests ($75K threshold) | January 1 reset |
| **4-year cycle** | Global Entry/TSA PreCheck ($120) | Track from first use |
| **Per stay/booking** | Premier Collection ($100 credit + breakfast), Lifestyle Collection ($50 credit), Fourth night free | No reset — applies each qualifying booking |
| **Ongoing/continuous** | Lounge access, CDW, Hertz status, cell phone protection, all insurance, 2x/5x/10x earning | No reset |
| **Rolling 12-month** | Cell phone claims (max 2 per 12 months) | Track from claim dates |

**Engine capabilities required for Venture X:**
- Anniversary year reset (shared with CSR for travel credit)
- Calendar year reset (shared with CSR, Gold)
- 4-year cycle tracking (shared with CSR, CSP, Gold, Amex Platinum)
- Per-booking benefits (NEW concept — no reset, applies every qualifying stay; not currently used by other cards in engine)
- Rolling 12-month claim limit tracking (if tracking cell phone claims)
- Annual spend threshold tracking ($75K for lounge guests — similar to CSR $75K)

**No quarterly or semi-annual tracking needed** (unlike CSR's semi-annual or Amex Platinum's quarterly credits). This makes Venture X significantly simpler to track than CSR or Amex Platinum.

---

## Part 5: Venture X vs. Other Cards — Cross-Reference

### Venture X vs CSR

| Dimension | Venture X | CSR |
|---|---|---|
| Annual fee | $395 | $795 |
| Hard credits (easily trackable) | ~$400 (travel + anniversary miles) | ~$2,060 |
| Competitor map entries | 9 active v1 | 25 active v1 |
| Benefits requiring activation | 7 | 7 |
| Points on portal hotels | 10x | 8x |
| Points on direct flights/hotels | 2x | 4x |
| Points on dining | 2x | 3x |
| Points on everything else | **2x** | 1x |
| Lounge access | Capital One Lounges + Priority Pass | Sapphire Lounges + Priority Pass |
| Lounge guest access | **None** (removed Feb 2026; $75K spend exception) | 2 guests included |
| Auto rental CDW | Primary | Primary |
| Hotel portal perks | Premier Collection ($100 credit + breakfast) | Edit ($100 credit + breakfast) |
| Transfer partners | **22** | 14 |
| Transfer valuation (TPG) | **1.85cpp** | 2.0cpp (UR) |
| Cell phone protection | Yes ($800/claim) | Yes ($800/claim) |
| Simplicity | **Much simpler** (2 period types) | Complex (6 period types) |
| Net cost after easy credits | **~$0** ($395 - $300 - $100) | ~$195 ($795 - $300 - $300 DoorDash) |
| Best for | Simple premium card, flat-rate earners, portal bookers | Maximizers willing to track monthly credits |
| Estimated insights/user/month | **8–15** | 25–40 |

### Venture X vs Amex Platinum

| Dimension | Venture X | Amex Platinum |
|---|---|---|
| Annual fee | **$395** | $895 |
| Hard credits (trackable) | ~$400 | ~$3,114 |
| Points on everything else | **2x** | 1x |
| Points on flights (portal) | 5x (Capital One Travel) | 5x (AmexTravel or direct) |
| Points on flights (direct) | 2x | 5x |
| Points on hotels (portal) | **10x** | 5x (AmexTravel) |
| Points on dining | 2x | 1x |
| Lounge network | Capital One + Priority Pass (~1,300) | Centurion + Delta Sky Club + Priority Pass (~1,550+) |
| Lounge quality | Capital One Lounges excellent (5 locations) | Centurion Lounges excellent (~15 locations) |
| Auto rental CDW | **Primary** | Secondary |
| Hotel elite status | None (but Hertz PC for cars) | Hilton Gold + Marriott Gold |
| Transfer partners | 22 | 21+ |
| Quarterly/monthly credit tracking | **None** | 8 quarterly credits + monthly Uber |
| Complexity | **Very simple** | Most complex card in system |
| Net cost after easy credits | **~$0** | ~$495+ (requires credit tracking) |
| Best for | Simple premium travelers, 2x-everything earners | Maximizers, heavy credit users, lounge enthusiasts |

### Venture X vs Amex Gold

| Dimension | Venture X | Amex Gold |
|---|---|---|
| Annual fee | $395 | $325 |
| Points on dining | 2x | **4x** |
| Points on groceries | 2x | **4x (up to $25K)** |
| Points on flights | 5x portal / 2x direct | **3x direct** |
| Points on everything else | **2x** | 1x |
| Lounge access | **Yes** | No |
| Auto rental CDW | **Primary** | Secondary |
| Travel protections | **Comprehensive** | Basic |
| Hard credits | ~$400 | ~$424 |
| Best for | Travel-focused, lounge users, flat-rate earners | Dining/grocery heavy spenders |

---

## Part 6: Implementation Notes

### Insight Volume Estimate

The Venture X generates the **fewest insights** of any premium card in the system:
- **8–15 insights per user per month** (vs CSR 25–40, Amex Platinum 30–50, Gold 12–20, CSP 10–18)
- This is driven by having only 2 hard credits that need tracking (travel credit + Global Entry), no monthly or quarterly credits, and 9 active competitor map entries
- **This is a feature, not a bug** — Venture X's simplicity is its selling point. Insight strategy should emphasize quality over quantity.

### Key Differences from CSR/Gold/Platinum Engine Logic

1. **No monthly or quarterly credits**: Unlike CSR (Lyft, DoorDash, Peloton monthly), Amex Platinum (8 quarterly credits), and Gold (Resy semi-annual), Venture X has zero time-pressured credits beyond the annual travel credit. This dramatically reduces B2 insight frequency.

2. **Anniversary year is the primary period**: The $300 travel credit resets on the card anniversary, not calendar year. This is the single most important date to track. Engine should generate escalating urgency B2 insights as anniversary approaches with unused credit: 90 days out (low), 30 days out (medium), 7 days out (high).

3. **Portal lock-in is the dominant A2 opportunity**: Venture X's value proposition is heavily portal-locked (10x hotels, 5x flights, $300 credit, Premier/Lifestyle Collection). Any hotel or flight purchase detected on the card that ISN'T from Capital One Travel represents a missed portal opportunity. However, Plaid cannot reliably distinguish portal vs direct bookings. In v2, if Capital One Travel charges have a unique merchant descriptor, this becomes the highest-value A2 channel redirect.

4. **2x everything changes multi-card strategy**: For Zurp users with Venture X + another card, the engine should ensure non-category purchases default to Venture X (2x) rather than a 1x card. This is an ongoing, low-priority A1 insight.

5. **Lounge changes create time-sensitive messaging (Feb 2026)**: For any user with Venture X who previously traveled with guests, the Feb 2026 lounge changes warrant a one-time informational insight explaining the new policy. This is a C0 reference insight, not recurring.

6. **Per-booking benefits (NEW concept)**: Premier Collection and Lifestyle Collection benefits apply per stay, not per period. There's no "use it or lose it" pressure. Instead, the insight strategy is: whenever a hotel booking is detected that could have been a Premier/Lifestyle Collection property, surface the per-stay benefits they're missing.

### Activation Checklist Priority (Onboarding)

For new Venture X users, the B1 onboarding checklist should surface these in order of dollar impact:

1. **Priority Pass enrollment** (1,300+ lounges — high experiential value)
2. **$300 travel credit** (remind of anniversary year deadline; explain portal requirement)
3. **Hertz President's Circle** (enroll through Capital One, NOT Hertz.com)
4. **Cell phone protection** (switch wireless bill to card; potentially cancel carrier insurance)
5. **National/Avis/Silvercar enrollment** (Visa Infinite perks)
6. **PRIOR subscription** (free; experiential value for travelers)
7. **The Cultivist** (niche — 50% off museum membership; only for art enthusiasts)

### Transfer Partners (Complete List — 22 partners)

**Airlines (18):**

| Partner | Ratio | Alliance | Notes |
|---|---|---|---|
| Aeromexico | 1:1 | SkyTeam | |
| Air Canada Aeroplan | 1:1 | Star Alliance | No surcharges; stopovers 5K pts |
| Air France-KLM Flying Blue | 1:1 | SkyTeam | Monthly Promo Rewards; dynamic pricing |
| Avianca LifeMiles | 1:1 | Star Alliance | Zero fuel surcharges; sweet spot |
| British Airways Avios | 1:1 | Oneworld | High fees on transatlantic; good for short-haul |
| Cathay Pacific Asia Miles | 1:1 | Oneworld | |
| Emirates Skywards | 2:1.5 | — | Poor ratio; avoid |
| Etihad Guest | 1:1 | — | Miles expire 18 months without activity |
| EVA Air | 2:1.5 | Star Alliance | Poor ratio; use other Star Alliance partners |
| Finnair Avios | 1:1 | Oneworld | Shared Avios with BA/Qatar |
| Japan Airlines | 2:1.5 | Oneworld | Added Sept 2025; good for Japan travel |
| JetBlue TrueBlue | 5:3 | — | Poor ratio |
| Qantas | 1:1 | Oneworld | Good for Emirates F bookings |
| Qatar Airways Avios | 1:1 | Oneworld | Added Sept 2025; Qsuites access |
| Singapore Airlines KrisFlyer | 1:1 | Star Alliance | |
| TAP Air Portugal | 1:1 | Star Alliance | |
| Turkish Airlines Miles&Smiles | 1:1 | Star Alliance | 2024 devaluation; still decent |
| Virgin Red | 1:1 | — | Link to Flying Club for flights |

**Hotels (4):**

| Partner | Ratio | Notes |
|---|---|---|
| Accor Live Limitless | 2:1 | Poor ratio; Europe-focused |
| Choice Privileges | 1:1 | 0.6cpp value; poor use of miles |
| I Prefer Hotels | 1:1 | Added Sept 2025; Preferred Hotels |
| Wyndham Rewards | 1:1 | Budget hotels; decent for domestic |

**Best transfer values**: Avianca LifeMiles (no surcharges), Air Canada Aeroplan (flexibility + stopovers), Air France-KLM (Promo Rewards), British Airways (short-haul), Qantas (Emirates F).

**Avoid**: Emirates (bad ratio), EVA Air (bad ratio), JetBlue (bad ratio), Choice (low cpp), Accor (bad ratio).

### Capital One Miles Ecosystem Note

Capital One miles can be pooled across multiple Capital One cards (Venture X, Venture, Savor → miles conversion, Quicksilver → miles conversion, Spark Miles). Cash back cards can convert to miles at 1 cent = 1 mile. This means pairing Venture X with a Savor (3x dining/groceries/streaming as cash back → convert to miles) effectively gives the ecosystem 3x on dining/groceries without needing Amex Gold. This cross-card synergy is unique to Capital One and could inform multi-card Zurp insights in v2.

### Erased Purchases (Purchase Eraser)

Venture X miles can be redeemed at 1cpp to "erase" travel purchases from the past 90 days. This works on ANY travel purchase (flights, hotels, Airbnbs, campgrounds, cruises) regardless of whether it was booked through Capital One Travel. At 1cpp this is not optimal (vs 1.85cpp transfers), but it provides maximum flexibility for users who don't want to deal with transfer partners. Zurp should note this as a "floor value" redemption option.
