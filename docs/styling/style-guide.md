# zurp — Style Guide

Design system and style guide for the Zurp brand. Colors, typography, components, and patterns for building consistent interfaces.

`v1.1 · Feb 2026`

---

## 01 · Color Palette

Dark-first palette. Deep navy backgrounds with high-contrast accents. Never pure black or pure white.

### Backgrounds

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Deep | `#0a0e17` | `--bg-deep` | Page background |
| Card | `#111827` | `--bg-card` | Card surfaces, containers |
| Card Hover | `#1a2236` | `--bg-card-hover` | Interactive card states |
| Elevated | `#1e293b` | `--bg-elevated` | Modals, dropdowns, popovers |

### Text

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Primary | `#f0f2f5` | `--text-primary` | Headlines, card names, key values |
| Secondary | `#7a8ba8` | `--text-secondary` | Body text, descriptions, non-#1 net values |
| Dim | `#4a5568` | `--text-dim` | Captions, sub-labels, helper text, fees |

### Accents

| Name | Hex | CSS Variable | Semantic Meaning |
|------|-----|-------------|-----------------|
| Cyan | `#22d3ee` | `--accent-cyan` | CTAs, links, interactive elements, brand |
| Blue | `#60a5fa` | `--accent-blue` | Points earned, data values, earning rates |
| Green | `#34d399` | `--accent-green` | Net positive (#1 only), best fit, success, savings |
| Purple | `#a78bfa` | `--accent-purple` | Benefits value, perks, credits |
| Red | `#f87171` | `--accent-red` | Fees, costs, negative values |

### Borders & Surfaces

| Name | Value | CSS Variable |
|------|-------|-------------|
| Subtle border | `rgba(255,255,255,0.06)` | `--border-subtle` |
| Medium border | `rgba(255,255,255,0.10)` | `--border-medium` |
| Blue glow | `rgba(96,165,250,0.15)` | `--glow-blue` |
| Cyan glow | `rgba(34,211,238,0.10)` | `--glow-cyan` |

---

## 02 · Semantic Color Usage

Each accent color has a specific meaning. Follow these consistently.

| Color | Role | Example | When to use |
|-------|------|---------|-------------|
| **Cyan** | Interactive / Brand | `zurp your card →` | CTAs, links, navigation, brand logo, section labels, "Your card" tag |
| **Blue** | Points / Data | `$1,273` | Point values, earning rates, stacked bar segments, data viz |
| **Purple** | Benefits value | `$475` | Credits, lounge access, insurance, perks, benefit bar segments |
| **Red** | Fees & costs | `−$795` | Annual fees, negative values, fee bar segments |
| **Green** | Net positive / Best | `+$1,273` | #1 card net value ONLY, "Best fit" tag, savings callout in headlines |

### Formula Color Mapping

The simulation stacked bar uses this exact color sequence:

```
Points (blue) + Benefits (purple) − Fees (red) = Net value (green on #1 only)
```

### Color Rules

1. **Green net value → #1 card only.** All other card rows use `--text-secondary` for their net value. Green means "this is your best option" — it loses meaning if every row is green.

2. **Card names in headlines → white.** In personalized headlines like "The Sapphire Preferred could save you $755/yr", the card name uses `--text-primary` (white). Only the savings dollar amount gets green. The card name is a noun, not a value — it doesn't need color emphasis.

3. **Cyan for interactive, blue for data.** If it's clickable or draws attention to an action, use cyan. If it's displaying a number or data point, use blue.

---

## 03 · Gradients

Core gradients. Use sparingly — reserved for high-emphasis moments.

### Primary

```css
linear-gradient(135deg, #22d3ee, #60a5fa)
```
**Use:** CTAs, brand logo, interactive highlights. Cyan leads (interactive) into blue (data).

### Hero

```css
linear-gradient(135deg, #60a5fa 0%, #22d3ee 50%, #34d399 100%)
```
**Use:** Headline gradient text (the word "actually"), hero section accents.

### Success

```css
linear-gradient(135deg, #34d399, #22d3ee)
```
**Use:** Primary button hover state, positive confirmations.

### Top Bar

```css
linear-gradient(90deg, transparent, rgba(52,211,153,0.3), rgba(96,165,250,0.3), transparent)
```
**Use:** 1px line on card top edge, section dividers — creates subtle light source effect.

---

## 04 · Typography

Two fonts. DM Sans for all UI and display text. Space Mono for data, labels, and the logo.

### Font Stack

| Role | Font | Source | Weights |
|------|------|--------|---------|
| Display + Body | **DM Sans** | Google Fonts | 300, 400, 500, 600, 700 (variable) |
| Data + Labels | **Space Mono** | Google Fonts | 400, 700 |

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Size | Weight | Tracking | Line Height | Font |
|---------|------|--------|----------|-------------|------|
| Hero headline | `clamp(42px, 5.5vw, 76px)` | 700 | -2.5px | 1.05 | DM Sans |
| Headline line 2 | 0.65em of hero | 500 | -1px | — | DM Sans |
| Section title | `clamp(32px, 4vw, 52px)` | 700 | -2px | 1.1 | DM Sans |
| Personalized headline | 22px | 700 | -0.5px | — | DM Sans |
| Body large / subheader | 19px | 400 | — | 1.65 | DM Sans |
| Card name | 15px | 600 | — | — | DM Sans |
| Nav / button label | 14px | 500 | — | — | DM Sans |
| Caption / helper | 12–13px | 400–500 | — | — | DM Sans |
| Data values (net) | 17px | 700 | — | — | Space Mono |
| Data values (cells) | 11–13px | 700 | — | — | Space Mono |
| Mono label | 10–11px | 700 | 1.2–2.5px | — | Space Mono |

### DM Sans Weights

- **300 Light** — not commonly used, available for special cases
- **400 Regular** — body text, descriptions, subheader
- **500 Medium** — nav links, button labels, emphasis in body text
- **600 Semibold** — card names, section labels, card detail text
- **700 Bold** — headlines, hero text, key UI elements

### Space Mono Usage Rules

- All dollar values and numeric data: `$1,273`, `3%`, `$47,411`
- Section labels: `COMPARE` (11px, 700, uppercase, 2.5px tracking)
- Brand logo: `zurp` (20px, 700, gradient fill)
- Sub-labels under data: `net / year`, `$95/yr fee`
- Footnotes and methodology text
- Bar segment labels: `Points $798`, `-$95`

---

## 05 · Components

### Buttons

**Primary CTA**
- Background: `--gradient-primary` (cyan → blue)
- Text: `--bg-deep` (dark on gradient)
- Padding: `16px 36px`
- Radius: `14px`
- Font: DM Sans, 16px, 600
- Hover: gradient shifts to `--gradient-success` (green → cyan) via opacity transition
- Arrow `→` translates 3px right on hover

**Secondary**
- Background: `rgba(34,211,238,0.1)`
- Border: `1px solid rgba(34,211,238,0.2)`
- Text: `--accent-cyan`
- Padding: `12px 24px`
- Radius: `10px`
- Font: DM Sans, 14px, 500
- Hover: background opacity increases, border brightens

**Ghost**
- Background: transparent
- Border: `1px solid --border-medium`
- Text: `--text-secondary`
- Padding: `12px 24px`
- Radius: `10px`
- Font: DM Sans, 14px, 500
- Hover: border brightens, text shifts to `--text-primary`

### Badges

Pill-shaped indicators. `border-radius: 100px`. Used for status, categories, and counts.

| Variant | Background | Border | Text Color | Example |
|---------|-----------|--------|------------|---------|
| Cyan | `rgba(34,211,238,0.1)` | `rgba(34,211,238,0.15)` | `--accent-cyan` | "25 cards supported" |
| Green | `rgba(52,211,153,0.08)` | `rgba(52,211,153,0.12)` | `--accent-green` | "Connected" |
| Purple | `rgba(167,139,250,0.08)` | `rgba(167,139,250,0.12)` | `--accent-purple` | "Premium" |
| Red | `rgba(248,113,113,0.08)` | `rgba(248,113,113,0.12)` | `--accent-red` | "Fee increase" |

Badge padding: `5px 14px`. Font: DM Sans, 12px, 500. Optional leading dot (6px circle).

### Tags

Compact inline labels. Used inside simulation rows.

| Variant | Background | Text Color | Example |
|---------|-----------|------------|---------|
| Green | `rgba(52,211,153,0.1)` | `--accent-green` | "BEST FIT" |
| Cyan | `rgba(34,211,238,0.1)` | `--accent-cyan` | "YOUR CARD" |

Tag padding: `2px 8px`. Radius: `5px`. Font: 9–10px, 700, uppercase, 0.8px tracking.

### Cards

- Background: `--bg-card`
- Border: `1px solid --border-subtle`
- Radius: `16px` (containers: `20px`)
- Top edge: 1px `--gradient-top-bar` pseudo-element
- Padding: `24–32px`

### Stacked Bars

Horizontal bars showing the formula breakdown for each card.

- Track: `height: 30px`, `border-radius: 7px`, flex layout
- Segments use `flex` values proportional to dollar amounts
- Segment font: Space Mono, 11px, 700, dark text on colored bg
- Fee segment uses `rgba(255,255,255,0.9)` text (light on red)
- Legend: 6px dots + 11px dim text below each bar

### Simulation Row

3-column grid: Rank | Body (name + bar + legend) | Net value

```css
grid-template-columns: 32px 1fr 90px;
```

- Row padding: `20px 16px`
- Row radius: `14px`
- Top card (#1): green tinted bg `rgba(52,211,153,0.035)` with green border
- Non-top cards: row divider `1px solid --border-subtle`
- Locked cards: `opacity: 0.3`, bar segments become `rgba(255,255,255,0.06)`, text blurred `filter: blur(5px)`

---

## 06 · Spacing & Radius

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| Tight | 4px | Gap between sub-label and value, internal micro-spacing |
| Compact | 8px | Grid gaps, badge dot spacing |
| Snug | 12px | Badge padding, list item padding |
| Base | 16px | Card padding, section sub-gaps, button side padding |
| Medium | 24px | Card inner padding, component group spacing, personalized header margin |
| Large | 32px | Container padding, hero badge margin-bottom |
| XL | 48px | Section divider padding, guide header padding-bottom |
| Section | 72px | Between major sections |

### Border Radius

| Value | Usage |
|-------|-------|
| `5px` | Tags (Best fit, Your card) |
| `7px` | Stacked bar tracks |
| `8px` | Nav CTA button |
| `10px` | Secondary / ghost buttons |
| `14px` | Primary CTA button, simulation rows |
| `16px` | Cards, type specimens |
| `20px` | Main containers (sim-container) |
| `100px` | Badges (pill shape) |

---

## 07 · Effects & Texture

### Noise Overlay

SVG fractalNoise texture applied as a fixed pseudo-element covering the entire viewport. Adds tactile grain.

```css
background-image: url("data:image/svg+xml,...feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'...");
opacity: 0.03;
position: fixed;
pointer-events: none;
z-index: 1000;
```

### Ambient Glow

Two large radial gradients positioned off-screen to create soft environmental lighting.

- **Top-left:** Blue, `rgba(96,165,250,0.08)`, 800px diameter, blur(120px)
- **Bottom-right:** Cyan, `rgba(34,211,238,0.06)`, 800px diameter, blur(120px)

### Nav Blur

Fixed navigation bar with glassmorphism effect.

```css
background: rgba(10,14,23,0.8);
backdrop-filter: blur(20px);
border-bottom: 1px solid var(--border-subtle);
```

### Top Edge Glow

1px gradient pseudo-element on card top edge. Creates subtle overhead light source.

```css
content: '';
position: absolute;
top: 0; left: 0; right: 0;
height: 1px;
background: var(--gradient-top-bar);
```

### Locked / Gated Content

Premium content teaser effect. Shows content shape but obscures details.

```css
opacity: 0.3;            /* row-level dimming */
filter: blur(5px);        /* text-level blur */
user-select: none;        /* prevent copy */
/* bar segments: */
background: rgba(255,255,255,0.06);
color: transparent;
```

### Entry Animation

Staggered fade-up on page load. Each element delays 0.1–0.15s after the previous.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
animation: fadeUp 0.7s ease forwards;
animation-delay: 0.25s; /* increment per element */
```

### Pulse Dot

Breathing animation for status indicators (badge dots).

```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
/* Duration: 2s, infinite loop */
```

---

## 08 · Voice & Copy Guidelines

### Tone

- **Confident, not salesy.** State facts. Let the math speak.
- **Technical but accessible.** Use real credit card terminology (cpp, multiplier, transfer partners) but make it scannable.
- **Provocative when appropriate.** The headline challenges. The subheader explains.

### Headline Pattern

```
Know what your card is actually worth — and which card beats it.
```

Structure: **Establish value** (what it's worth) → **Create tension** (which card beats it).

### Section Header Pattern

```
See what you'd gain — or lose — on another card.
```

Structure: **Promise insight** → **acknowledge risk** → **anchor to action**.

### Personalized Headline Pattern

```
The Robinhood Gold Card could save you $755/yr
```

Structure: **Card name in white** (text-primary) → **savings in green** (accent-green). Card name is a noun, doesn't need color. Dollar amount is the emotional hook and sole colored element.

### Subheader Pattern

```
Zurp simulates your real spending across 25 top cards
— factoring in points, perks, and fees — to find your best fit.
```

Structure: **What it does** (simulates) → **How** (points, perks, fees) → **Outcome** (best fit).

### CTA Copy

- Primary: `zurp your card →` (lowercase brand name, action verb)
- Supporting: `Free to use. Secure, read-only connection via Plaid.`
- Unlock: `See all 25 cards →`

### Data Labels

Use Space Mono. Keep terse. Abbreviate where clear.

- `net / year` not "Annual Net Value"
- `3% flat cashback` not "3 percent flat cashback rate"
- `$95/yr fee` not "Annual Fee: $95"
- `~$170 simulated` not "Approximately $170 in simulated benefits"
- `$475 captured of $2,628` not "You have captured $475 of $2,628 in available benefits"
- `Based on your $47,411 in spending over the last 12 months`

### Footnote Pattern

```
Points valued conservatively (Chase UR: 1.25¢, Amex MR: 1.0¢). Transfer partner
redemptions can yield higher value. Your card shows benefits actually captured;
other cards show benefits simulated from your spending history.
```

Methodology transparency builds trust. Keep it small (12px, dim), but present.
