# zurp — Brand Style Guide

---

## Logo

The zurp logo consists of three elements: the **card icon**, the **wordmark**, and the **tagline**. They should always appear together in the primary lockup, though the icon and wordmark can be used independently as a favicon or app icon.

- Wordmark is always **lowercase**
- Tagline is always **uppercase**, letter-spaced
- Minimum clear space around the logo: height of the "z" on all sides

---

## Color Palette

### Primary

| Name | Hex | Usage |
|------|-----|-------|
| **Void** | `#0D1117` | Primary background, dark surfaces |
| **Frost** | `#E6EDF3` | Primary text on dark backgrounds |
| **Signal** | `#58A6FF` | Accent, interactive elements, links, icon strokes |

### Secondary

| Name | Hex | Usage |
|------|-----|-------|
| **Muted** | `#484F58` | Secondary text, taglines, captions |
| **Surface** | `#161B22` | Cards, elevated surfaces on dark bg |
| **Border** | `#21262D` | Dividers, subtle borders |
| **Ghost** | `#58A6FF` @ 20% opacity | Disabled states, inactive elements |

### Semantic

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#3FB950` | Credits used, benefits claimed |
| **Warning** | `#D29922` | Expiring soon, partial usage |
| **Danger** | `#F85149` | Expired, missed credits |
| **Info** | `#58A6FF` | Informational, neutral highlights |

### Light Mode (Optional)

| Name | Hex | Usage |
|------|-----|-------|
| **Background** | `#F6F8FA` | Page background |
| **Surface** | `#FFFFFF` | Cards, elevated surfaces |
| **Text Primary** | `#1F2328` | Headings, body text |
| **Text Secondary** | `#656D76` | Captions, secondary info |
| **Signal** | `#0969DA` | Accent (darker for contrast on light) |

---

## Typography

### Font Stack

```css
--font-display: 'SF Pro Display', 'Helvetica Neue', Helvetica, sans-serif;
--font-body: 'SF Pro Text', 'Helvetica Neue', Helvetica, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
```

**Web fallback** (when SF Pro is unavailable):
```css
--font-display: 'Inter', 'Helvetica Neue', Helvetica, sans-serif;
--font-body: 'Inter', 'Helvetica Neue', Helvetica, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Role | Size | Weight | Letter Spacing | Usage |
|------|------|--------|----------------|-------|
| **Display** | 62px | 600 (Semi) | -1.5px | Logo wordmark only |
| **H1** | 36px | 600 (Semi) | -0.5px | Page titles |
| **H2** | 24px | 600 (Semi) | -0.3px | Section headers |
| **H3** | 18px | 600 (Semi) | 0 | Card titles, benefit names |
| **Body** | 15px | 400 (Regular) | 0 | Paragraphs, descriptions |
| **Caption** | 12px | 400 (Regular) | +2px, uppercase | Taglines, labels, metadata |
| **Mono** | 14px | 500 (Medium) | 0 | Dollar amounts, data values |

### Rules

- Headings: **semibold (600)**, tight letter-spacing
- Body: **regular (400)**, default spacing
- Dollar amounts and data: always use `--font-mono`
- Labels and metadata: uppercase, spaced out (`letter-spacing: 2px`)
- Never use bold (700+) in body copy

---

## Spacing

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight gaps, inline spacing |
| `--space-sm` | 8px | Between related elements |
| `--space-md` | 16px | Card padding, section gaps |
| `--space-lg` | 24px | Between sections |
| `--space-xl` | 32px | Major section breaks |
| `--space-2xl` | 48px | Page-level spacing |
| `--space-3xl` | 64px | Hero/header padding |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small chips, tags |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large containers |

---

## Icon System

The card icon uses the following properties:

- **Stroke-based**, not filled
- Stroke width: `2.5px` at standard size (50×34)
- Corner radius: `5px`
- Color: `Signal` (`#58A6FF`)
- Card outline at **40% opacity**
- Internal details (stripe) at **20% opacity**
- Progress dots: full → 55% → 20% opacity (left to right)

For UI icons throughout the app, use **Lucide Icons** to match the clean, stroke-based aesthetic:
- Size: 20px default, 16px compact
- Stroke width: 1.75px
- Color: inherit from text color

---

## Shadows & Elevation

Dark mode uses **subtle glows** rather than traditional shadows:

```css
--shadow-sm: 0 0 0 1px rgba(88, 166, 255, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(88, 166, 255, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(88, 166, 255, 0.06);
--shadow-glow: 0 0 16px rgba(88, 166, 255, 0.15);
```

---

## Component Patterns

### Benefit Card

- Background: `Surface` (`#161B22`)
- Border: 1px `Border` (`#21262D`)
- Border-radius: `--radius-lg`
- Padding: `--space-md`
- Benefit name: H3 in `Frost`
- Dollar amount: Mono in `Signal`
- Progress bar: `Signal` fill on `Border` track

### Progress Dots (from logo)

Used to indicate benefit usage status:
- **Full opacity** = used/claimed
- **55% opacity** = partially used
- **20% opacity** = unclaimed
- Dot size: 6px, gap: 4px

### Buttons

| Type | Background | Text | Border |
|------|-----------|------|--------|
| **Primary** | `Signal` | `Void` | none |
| **Secondary** | transparent | `Frost` | 1px `Border` |
| **Ghost** | transparent | `Signal` | none |
| **Danger** | `#F8514933` | `Danger` | 1px `Danger` @ 40% |

All buttons: `--radius-md`, padding `8px 16px`, font-weight 500.

---

## Motion

- **Duration**: 150ms for micro-interactions, 300ms for transitions, 500ms for page-level
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) for entrances
- **Hover states**: opacity or color shift, never scale
- **Progress bars**: animate width with 300ms ease-out
- **Page transitions**: fade in with 20px upward translate

---

## Voice & Tone

| Principle | Example |
|-----------|---------|
| **Direct** | "You have $15 in DoorDash credits expiring in 3 days." |
| **Casual** | "Nice — you zurped $45 this month." |
| **Urgent when needed** | "$150 StubHub credit expires Friday." |
| **Never preachy** | Not "You should use your credits!" → "Credits available now." |
| **Numbers forward** | Lead with the dollar amount, always. |

---

## CSS Variables (Complete)

```css
:root {
  /* Colors - Dark (default) */
  --color-void: #0D1117;
  --color-surface: #161B22;
  --color-border: #21262D;
  --color-frost: #E6EDF3;
  --color-muted: #484F58;
  --color-signal: #58A6FF;
  --color-success: #3FB950;
  --color-warning: #D29922;
  --color-danger: #F85149;

  /* Typography */
  --font-display: 'Inter', 'Helvetica Neue', Helvetica, sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', Helvetica, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```
