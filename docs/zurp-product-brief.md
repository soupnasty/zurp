# zurp — Product Brief

Context document for UI design reviews. Covers brand, intention, value, and product — no technical details.

`v1.0 · Feb 2026`

---

## Brand

**zurp** is a personal finance tool that answers a simple question most cardholders can't: *is my credit card actually worth it?*

The name is lowercase, always. It's a verb — "zurp your card" means to run the numbers and find out. The tone is confident and terse. Let the math speak. No exclamation marks, no sales copy, no "maximize your rewards!!!" energy.

### Voice

- **Direct.** Short labels, dense data, no fluff. "$475 in points" not "You've earned an estimated four hundred and seventy-five dollars."
- **Honest.** Show fees alongside benefits. Never hide the cost. The whole point is transparency.
- **Technical but scannable.** Users who care about credit card optimization are detail-oriented. Respect that with precision, but use visual hierarchy so casual users can skim.
- **Methodology footnotes.** Always present, always small. Trust is built by showing your work.

### Visual Identity

Dark-first interface. Deep navy backgrounds, high-contrast accents. The palette is semantic — each color means one thing:

- **Cyan** — interactive. Buttons, links, "your card" tags. If you can tap it, it's cyan.
- **Blue** — points and data. Dollar values, earning rates, data visualizations.
- **Purple** — benefits. Credits, perks, lounge access, subscriptions.
- **Red** — fees and costs. Annual fees, negative values.
- **Green** — the winner. Reserved exclusively for the #1 best-fit card. Green means "this is your best option." It loses all meaning if every row is green.

Two typefaces: **DM Sans** for display and body, **Space Mono** for all numbers, labels, and the logo. Every dollar value, percentage, and data label uses the monospace font — this creates an analytical, dashboard-grade feel.

The logo is a credit card icon with two stacked bars inside (blue/purple/red segments), forming a subtle diagonal Z through the dominant blue anchors.

---

## Intention

Most premium credit cards cost $95–$795/year and come with 5–20 statement credits, subscriptions, and perks. The problem: nobody tracks whether they're actually using them. People pay $795 for a Sapphire Reserve and leave $500 in credits on the table because the benefits reset on different cycles, require activation, or have obscure merchant restrictions.

zurp exists to make the invisible visible:

1. **Are you getting your money's worth from your current card?**
2. **Would a different card be better for how you actually spend?**

That's it. Two questions, answered with real transaction data.

---

## Value Proposition

### For the user

- **Stop leaving money on the table.** See exactly which credits you've used, which are expiring, and how much value you're capturing vs. what's available.
- **Know if you have the right card.** Your actual spending is simulated across 30 cards to show which one would deliver the most value — points, benefits, minus fees.
- **No manual entry.** Bank-linked via Plaid. Transactions flow in automatically and get matched against your card's benefit rules.

### The formula

Every card comparison boils down to one equation:

```
Points earned + Benefits captured − Annual fee = Net value
```

The card with the highest net value for *your* spending wins. Not theoretical spending. Not average American spending. Yours.

---

## Product

### Three pages, three questions

The dashboard has three tabs, each with a distinct purpose and time horizon.

#### Compare

*"Which card is best for your spending?"*

Takes the user's trailing 365 days of transactions and simulates them across all 30 supported cards. For each card, it calculates points earned (using that card's earn rates and category bonuses), benefits that would have been captured (by running the transaction-matching engine against each card's benefit catalog), and subtracts the annual fee.

The output is a leaderboard ranking every card by net value, a head-to-head comparison between the user's current card and the best alternative, and a category breakdown showing which card wins in each spending category (dining, travel, groceries, etc.).

Key design principle: every card is evaluated the same way. The user's card doesn't get special treatment — it's simulated just like the alternatives, so the comparison is fair.

#### Track

*"Are you maximizing your current card this period?"*

Shows the user's actual benefit usage for their current card in the current billing cycle. Each benefit has its own cycle (monthly, quarterly, semi-annual, annual) and its own progress bar. When a cycle just rolled over, $0 used is expected and normal — not an error state.

This is the "use it or lose it" view. It answers: how much of your card's value have you captured this period, and what's about to expire?

#### Insights

*"What should you do differently?"*

Actionable recommendations generated from both current and prior cycle data. Categories include:

- **Competitor redirects** — "You spent $47 at Uber Eats. Your Amex Gold earns 4x on dining vs. 1x on your Reserve."
- **Unused credits** — "Your $150 StubHub credit resets Jul 1. You've used $0."
- **Nearly maxed** — "You've used $280 of your $300 travel credit. $20 left."
- **Positive reinforcement** — "You maxed your DoorDash credit this month."

Insights are scored by dollar impact, urgency, and actionability. High-value, time-sensitive items surface first.

### Supported cards

30 cards across Chase, Amex, Citi, Capital One, Wells Fargo, US Bank, Discover, Robinhood, Bilt, Goldman Sachs (Apple), Delta, Hilton, IHG, Southwest, United, and World of Hyatt. Range from $0 fee cash-back cards to $895 premium travel cards.

### How data flows in

Users connect their bank via Plaid during onboarding. Transactions sync automatically. The card type is auto-detected from account metadata, and benefit matching begins immediately. No manual categorization, no receipt scanning, no spreadsheets.

---

## Design Principles

1. **Data density over decoration.** Every pixel should convey information or create breathing room. No ornamental illustrations, no stock photos, no empty hero sections inside the app.

2. **The number is the hero.** Dollar values are the most important elements on every screen. They get the largest type, the monospace font, and the semantic color. Everything else supports them.

3. **Hierarchy through restraint.** Green means #1. Cyan means interactive. If everything is colorful, nothing stands out. Use accent colors surgically.

4. **Mobile is not an afterthought.** The leaderboard, benefit tracker, and insights all work on a phone. Stacked bars compress, tables become cards, the sidebar becomes a bottom nav.

5. **Trust through transparency.** Show the formula. Show the methodology. Show the "~" prefix when a number is simulated vs. actual. Users making financial decisions need to trust the data.

6. **Speed is a feature.** The dashboard should feel instant. Precompute what you can, lazy-load what you must, never show a spinner for more than a moment.
