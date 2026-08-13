# Card Config Audit — August 13, 2026

> **Status: FIXES APPLIED (2026-08-13).** All Severity 1–3 findings below were applied to the card definitions, earn configs, and perk matrix the same day. All 30 cards now carry `lastVerifiedAt: "2026-08-13"`. Discontinued benefits were sunset (past `sunsetDate` + DISCONTINUED copy), never deleted, to preserve `benefitUsage` history. The calculator gained overnight time-window support for the corrected Citi Nights window. Full suite green (1,399 tests) and production build passes. Remaining follow-up: run `npm run db:seed` to sync the new/changed benefit definitions into the database.

**Scope:** All 30 cards. Deep audit of high/medium-churn cards (card definitions, earn configs, perk matrix); fee + rate spot-checks on low-churn flat-rate cards.
**Method:** 7 parallel research agents (grouped by issuer) verified configs against current issuer pages, with blogs treated as leads only; 2 adversarial verification agents re-checked every consequential claim that lacked primary-source confirmation.
**Baseline:** Configs last materially updated ~Feb 2026. This audit found significant drift, concentrated in the June 2026 CSP refresh, the July 2025 Southwest refresh, the mid-2026 Amex coupon-book churn, and two earn configs that were wrong from the start (Bilt Palladium, WF Autograph Journey).

**Confidence key:** 🟢 primary source (issuer page/terms) · 🟡 multiple concurring secondary sources · 🔴 single source / unresolved

---

## Severity 1 — Phantom or missing benefits (simulations materially wrong)

These make the Compare page's net-value math wrong for the affected cards.

| # | Card | Finding | Fix direction | Conf |
|---|------|---------|--------------|------|
| 1.1 | **Southwest Priority** | `$75 Southwest travel credit` was **discontinued** in the July 2025 refresh (dead 12/31/2025) but is still an active benefit in config | Deactivate benefit (has potential usage history — sunset, don't delete) | 🟢 |
| 1.2 | **Capital One Venture** | `cov_annual_travel_credit` ($250/calendar year) **does not exist** — it was a one-time first-year welcome-offer component, expired ~Apr 2026. Also in perk matrix line 42 | Remove/deactivate benefit + fix perk matrix | 🟢🟡 |
| 1.3 | **Delta Platinum** | `$200 flight credit after $10K spend` is a **Delta Gold benefit, not Platinum**. Actual Platinum credits: **$150/yr Delta Stays + $120/yr Resy ($10/mo) + $120/yr rideshare ($10/mo)** — all three missing | Replace benefit; add 3 new ones; fix perk matrix rows 55/163/416 | 🟢 |
| 1.4 | **Amex Platinum** | Saks credit ($50 × 2 semiannual) **killed July 1, 2026** | Deactivate both `plat_saks_h1/h2`; fix perk matrix shopping row + total | 🟢 |
| 1.5 | **WF Autograph Journey** | Earn config is wrong across the board. Actual: 5x hotels, 4x airlines, **3x restaurants + other travel, 1x everything else**. Config has 4x dining, 4x rental cars, 3x gas/streaming/phone — appears copied from the no-fee Autograph | Rewrite earn config | 🟢 |
| 1.6 | **Bilt Palladium** | **Not a flat-2x card.** `bonusCategories: []` is wrong. Actual: 2x base **plus** up to 5x Bilt Dining, 4x Bilt Travel hotels, 3x Bilt Travel flights, 4x Lyft (linked account), up to 1.25x rent/mortgage/HOA | Add bonus categories to earn config | 🟢 |
| 1.7 | **United Explorer** | $100 travel credit modeled as auto-matching statement credit; actually **$100 United TravelBank cash awarded after $10K calendar-year spend** (spend-gated, once/yr). Also: earn is **3x** United purchases, not 5x | Remodel benefit; fix earn config + perk matrix | 🟢 |
| 1.8 | **Chase Sapphire Preferred** | June 2026 refresh missing entirely: hotel credit **$50 → $100**/anniversary yr; **10% anniversary points bonus eliminated**; **new $120 Global Entry/TSA quadrennial credit**; new Apple TV 12-month subscription (activate by 12/31/2026); 3x gas/EV; 3x vacation home rentals. Existing cardholders convert **Oct 1, 2026** | Add/update benefits + earn config (see Decisions below re timing) | 🟢 |
| 1.9 | **CSR earn config** | 4x "direct travel" bucket too broad: 4x is **only direct flights + hotels**; car rentals/transit/travel_other earn **1x** | Narrow the 4x bucket | 🟢 |
| 1.10 | **Chase Ink Preferred** | Missing benefits: complimentary DashPass + **$10/month DoorDash grocery/retail credit** (config has zero benefits; perk matrix DashPass row null) | Add benefits | 🟢 |

## Severity 2 — Wrong amounts, structures, or dates

| # | Card | Finding | Conf |
|---|------|---------|------|
| 2.1 | Amex Platinum / Biz Platinum / Hilton Aspire | CLEAR credit **$209 → $219** (CLEAR price rise 7/1/2026; Amex raised credit). Fix 3 configs + perk matrix cells | 🟡 (explicit for Platinum) |
| 2.2 | Amex Gold | Dining credit partners changed 6/30/2026: Goldbelly + Wine.com out; now Grubhub, Seamless, Cheesecake Factory, Five Guys, **Buffalo Wild Wings, Wonder**. Update merchantPatterns + copy | 🟢 |
| 2.3 | Amex Gold | Earn: portal hotels **2x → 5x** prepaid AmexTravel hotels (2026 refresh); 4x dining now **capped $50K/cal yr** | 🟢 |
| 2.4 | Amex Platinum | 5x flights now **capped $500K/cal yr** (config uncapped) | 🟢 |
| 2.5 | CSP | **Hyatt transfers devalued to 4:3** (CSR stays 1:1) — new apps 6/15/2026, existing cardholders Oct 1, 2026. Lower CSP `upsideCpp` (2.0 assumes 1:1 Hyatt) + perk matrix | 🟡 |
| 2.6 | CSR + CSP | Points Boost repricing: perk matrix "1.25¢" portal value obsolete. Now **1.0¢ base**; boosted up to 2.0¢ (CSR) / 1.5¢ (CSP) on select bookings | 🟢 |
| 2.7 | Citi Strata Elite | **Citi Nights window wrong**: config Thu–Sun 5:00–11:59 PM; actual **Fri–Sat 6 PM–6 AM ET** (spans overnight) | 🟢 |
| 2.8 | CFF + CFU | DashPass benefit restructured: **6-month complimentary trial** (activate by 12/31/2027, auto-enrolls paid after) + **$10/quarter non-restaurant DoorDash credit** — not an ongoing complimentary membership; 2027-12-31 is the activation deadline, not a membership sunset | 🟢 |
| 2.9 | Chase Freedom Flex | Cell phone protection **ends 9/20/2026** (~5 weeks out); simultaneously card **drops its 3% FTF** | 🟡 (5+ outlets, no public primary) |
| 2.10 | Hilton Aspire | Airline credit is now a **flight credit** ($50/qtr on airfare, direct airlines/AmexTravel) — config still says incidentals-only, "NOT airfare". Resort credit: **participating resorts only**, not "any Hilton property" | 🟢 |
| 2.11 | United Explorer | Rideshare credit: **$5/month cap + annual enrollment** (config: flat $60, no activation). Instacart: $10/month, **ends 12/31/2027** (no sunsetDate in config) | 🟢 |
| 2.12 | Southwest Priority | Earn missing **2x gas**; "Upgraded Boardings" killed Jan 27, 2026 → unlimited Extra Legroom upgrades (48h) + Group 5 boarding | 🟢 |
| 2.13 | IHG Premier | Earn missing **5x gas stations** | 🟢 |
| 2.14 | Ink Preferred | Perk matrix cell phone protection **$600 → $1,000/claim** (3 claims, $100 deductible) | 🟢 |
| 2.15 | Robinhood Gold | **FTF split by open date**: accounts opened on/after 7/1/2026 pay 3%; earlier grandfathered no-FTF. Config models unconditional No FTF | 🟢 |
| 2.16 | Robinhood Gold | **No cell phone protection exists** — perk matrix $600 figure is spurious; card-file comment says $800. Remove both. (Note: researcher claimed the $3,500 5x portal cap doesn't exist; verification found Robinhood's own terms confirm it — **config is correct, keep the cap**) | 🟢 |
| 2.17 | Citi Custom Cash | **Discontinued for new applications** May 28, 2026 (existing cardholders keep). Decide how Compare should treat non-applicable cards | 🟢 |
| 2.18 | Capital One Savor | "SavorOne" renamed **"Savor Cash Rewards"** (Oct 2024); Capital One later reused "SavorOne" for a *different* fair-credit card **with a fee** — rename + `detect.ts` collision risk. Perk matrix $100 first-year credit gone | 🟢 |
| 2.19 | Venture X | Portal **vacation rentals earn 5x**, not the 10x catch-all (10x = hotels + rental cars only) | 🟡 |
| 2.20 | Citi Double Cash | Missing **5% total on hotels/cars/attractions via Citi Travel portal** | 🟢 |
| 2.21 | Citi Strata Premier | Earn missing: 3x includes **EV charging**; **3x direct hotel purchases** (config: 1x) | 🟢 |
| 2.22 | WF Autograph Journey | $50 airline credit is **anniversary-cycle** (period starts first of month after AF assessed), not calendar; scope is any airline-MCC charge $50+, not "base tickets only" | 🟢 |
| 2.23 | Apple Card | 3% merchant list: add **ChargePoint + Hertz** (Mar 2026) | 🟡 |
| 2.24 | BCP earn config | 3% transit bucket wrongly includes `travel_flights`/`travel_other` — Amex transit **excludes airfare, cruises, car rentals** (those earn 1%). Perk matrix "3% flights" also wrong | 🟢 |
| 2.25 | BCP + BCE | Disney credit now "Disney streaming credit": **individual services qualify** (not bundle-only). Amounts ($10/$7 per month) unchanged | 🟡 |
| 2.26 | Delta Platinum | Uber One credit: enrollment window **closed 6/25/2026** (trailing credits into 2027); benefit closed to new activation | 🟢 |

## Severity 3 — Perk matrix corrections

| Card | Row | Correction | Conf |
|------|-----|-----------|------|
| Strata Elite | Hotel credit (~291) | "$100" → **$300** (card file is already right) | 🟢 |
| Strata Elite | Annual credits (~400) | "$100" → up to **$700** ($300 hotel + $200 Splurge + $200 Blacklane) | 🟢 |
| Strata Elite | Lounge (~738) | "Priority Pass + Centurion (via AA)" → **Priority Pass Select + 4 Admirals Club passes/yr** (Centurion is Amex's network) | 🟢 |
| Venture | Lounge (~741) | "$45/visit LoungeKey" → none | 🟡 |
| CSR | Cell phone protection (~1242) | "Yes" → **No** (CSR never had it) | 🟢 |
| CSR | Return protection (~1350) | null → **Yes, $500/item, $1,000/yr** | 🟢 |
| Delta Platinum | Sky Club (~754) | "reduced rate" → **no Sky Club access** (eliminated Jan 2024) | 🟢 |
| Delta Platinum | Trip cancellation (~1157) | "Yes" → **No** (trip delay only) | 🟢 |
| Hilton Aspire | Cell phone protection (~1265) | null → **Yes** ($800/claim, 2 claims, $50 deductible) | 🟡 |
| Amex Gold | Trip delay / lost luggage (null) | Has both: $300/12hr/2 claims; $1,250 carry-on/$500 checked | 🟡 |
| Amex Gold | Return protection | "Yes" → **No** (removed Jan 2020) | 🟢 |
| Plat/Gold/BizPlat/Delta/Aspire | Roadside assistance | "Yes" → **discontinued on all Amex cards Jan 2020** (Global Assist hotline only) | 🟡 |
| Amex Gold | Rental car status | null → **Hertz Five Star** (2026 refresh, enrollment) | 🟡 |
| Amex Gold | Transfer partners | Should match Platinum — MR partners identical across MR cards (add Marriott, Virgin Atlantic, …) | 🟡 |
| Both Platinums | Lounge detail | Delta Sky Club now **capped 10 visits/yr** (unlimited only at $75K spend) | 🟡 |
| United Explorer | CDW (~row) | "Secondary via Visa" → **Primary**, up to $60K | 🟢 |
| United Explorer | Global Entry (~831) | null → **$120/4yr credit exists** (also missing from card file) | 🟢 |
| Hyatt | Groceries | 2x → **1x** | 🟢 |
| IHG | Line ~418 detail | "$100/4yr" → $120 (row 828 already right) | 🟢 |
| Bilt | Lounge (~743) | "2 guest passes/yr" → **unlimited PP visits, 2 free guests per visit**, AU full membership | 🟢 |
| Bilt | Transfer partners (~1441/1477) | **24–25 partners** (17–19 airlines + 7 hotels incl. Wyndham 1:1, I Prefer 1:2); **Accor is 3:2, not 1:1** | 🟡 |
| WFAJ | Transfer partners (~1484) | Now **8 airlines** (added JetBlue Nov 2025, Cathay Apr 2026) + Choice 1:2 **and Wyndham** | 🟡 |
| CSP | Points value (~692) / hotel & GE rows | Points Boost repricing; $100 hotel; GE credit | 🟢 |
| Streaming row | IHG/United/Hyatt | None has a streaming bonus (3x base / 1x / 1x) | 🟢 |
| Stale URLs | Bilt, USBAC, WFAJ | bilt.com/**card**/palladium; usbank …-visa-signature-**credit**-card.html; WF page moved to creditcards.wellsfargo.com | 🟢 |

## Sunset-date statuses (all checked)

| Benefit | Config sunset | Status |
|---------|--------------|--------|
| CSR Select Hotels Credit | 2026-12-31 | **Unchanged — still 2026-only.** Expires in 4.5 months; plan removal/rollover |
| CSR StubHub / DoorDash ×3 / DashPass / Peloton | 2027-12-31 | Unchanged 🟢 |
| CSR Lyft | 2027-09-30 | Unchanged 🟢 |
| CSR/CSP Apple TV+ & Music | 2027-06-22 | Unchanged 🟢 |
| CSP DoorDash + DashPass | 2027-12-31 | Unchanged 🟢 |
| Delta Uber One | 2026-06-25 | **Window closed** — no new activations; trailing credits into 2027 |
| CFF cell phone protection | (none) | **Needs sunset: 2026-09-20** |
| United Instacart | (none) | **Needs sunset: 2027-12-31** |
| Ink Lyft 5x | note only | Confirmed through 9/30/2027 🟢 |

## Missing benefits worth adding (trackable credits only)

- **CSP:** Global Entry/TSA $120 quadrennial; Apple TV 12-month (needs 2026-12-31 activation sunset)
- **Delta Platinum:** $150 Delta Stays, $120 Resy, $120 rideshare (see 1.3)
- **United Explorer:** Global Entry/TSA $120 quadrennial; Avis/Budget $50/yr; JSX $100/yr
- **IHG Premier:** $50 United TravelBank cash/yr
- **Ink Preferred:** $10/mo DoorDash credit + DashPass
- **US Bank Altitude Connect:** GigSky eSIM data (through 11/30/2026)
- **Amex Platinum:** SoulCycle $300/bike (niche; needs Equinox+ membership)
- **Hilton Aspire:** $100 Waldorf/Conrad on-property credit (2-night package bookings)

## Internal consistency bugs (no web research needed)

- BCE perk matrix "total tracked $84" vs config tracking Disney $84 + Home Chef $180 = **$264**
- BCP perk matrix streaming row null / "total $0" but card file has a live $10/mo Disney credit
- Delta Platinum & Hilton Aspire & IHG & Hyatt card-file comments say certificates are "tracked in perk matrix only," but the perk matrix has **no companion-certificate or free-night rows at all**
- Venture: config says Mastercard; perk matrix says "Visa Signature Concierge" (it's Visa Signature)
- CLAUDE.md says Savor has 1 benefit; card file has `benefits: []`
- Hyatt card-file comment claims "Cat 1-7 free night" — actual is Cat 1-4 (+ Cat 1-4 after $15K)

## Confirmed correct (spot-check tier + majors)

Annual fees all verified: CSR $795, CSP $95, Platinum $895, Biz Plat $895, Gold $325, Aspire $550, Delta Plat $350, Strata Elite $595, Strata Premier $95, Venture X $395, Venture $95, Bilt $495, United $150, SW $229, IHG $99, Hyatt $95, Ink $95, WFAJ $95, and all $0-fee cards. Flat-rate structures unchanged: Active Cash 2%, Double Cash 2%, Discover it 5% rotating ($1,500/qtr), Apple Card 1/2/3%, Robinhood 3x (note: 1.0cpp valuation only holds for brokerage redemption; statement credits are 0.7cpp). CSR's credit suite (travel $300, Edit $250×2, Exclusive Tables $150×2, StubHub $150×2, DoorDash $5+$10+$10, Lyft, Peloton, GE) all structurally correct. Amex Platinum's full coupon book verified except Saks/CLEAR. Biz Plat credits (hotel $300×2, Dell, wireless, Adobe, Indeed, Hilton Business, airline $200, GE) all verified.

## Decisions needed before fixing

1. **CSP refresh timing** — new benefits went live 6/15/2026 for new cardholders, but existing cardholders convert **Oct 1, 2026**. The app has no per-user "product version" concept. Simplest: adopt the new config now (it's 7 weeks out and most viewing users are prospective); alternatively gate by date.
2. **Benefit removal vs. deactivation** — removed benefits (Saks, SW travel credit, Venture credit, Delta flight credit, Uber One) may have `benefitUsage` history keyed to their IDs. Recommend `isActive: false` / sunsetDate over deletion.
3. **Non-applicable products** — Custom Cash (discontinued for new apps) and the Savor/SavorOne rename affect Compare-page framing and `detect.ts`.
4. **Restructured DashPass (CFF/CFU)** — 6-month trial doesn't fit the current `subscription` cycle model cleanly; needs a modeling decision.

## Process recommendations

- Add `lastVerifiedAt` + `sourceUrls` to `CardDefinition`, stamped when fixes land; script a >180-day staleness report (competitor map already does this).
- CI check flagging any `sunsetDate` within 90 days.
- Re-audit high-churn cards (CSR, CSP, Platinum, Biz Plat, Aspire, Bilt) ~quarterly; full deck twice a year.
- Amex.com blocks scraping — future audits should lean on `global.americanexpress.com/card-benefits/...` benefit-detail URLs, which worked.

---
*Full per-agent findings with all source URLs preserved in session scratchpad; primary sources: chase.com, creditcards.chase.com, cardmembers.united.com, citi.com, capitalone.com, bilt.com/card/palladium, robinhood.com support articles, creditcards.wellsfargo.com, usbank.com, global.americanexpress.com benefit pages, delta.com, help.uber.com.*
