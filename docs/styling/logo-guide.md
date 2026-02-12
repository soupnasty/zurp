# zurp — Logo & Animation Guide

Specifications for the Zurp logomark, wordmark, and loading animation. This document covers construction, color, sizing, clear space, animation timing, and usage rules.

`v1.0 · Feb 2026`

---

## 01 · The Logomark

### Concept

The Zurp logo is a credit card icon containing two stacked horizontal bars. The bars represent the core product: a simulation that compares cards by breaking down points, benefits, and fees.

The color segments in each bar are mirrored — top bar reads blue → purple → red (left to right), bottom bar reads red → purple → blue. This creates a **diagonal Z shape** traced by the blue segments anchoring top-left and bottom-right.

The Z is subtle and emergent — it's not drawn literally but formed by the eye following the dominant color (blue) across both bars.

### What the mark communicates

- **Credit card** — the rounded rectangle outline
- **Comparison** — two bars, one wins (brighter), one loses (dimmer)
- **The formula** — blue (points) + purple (benefits) − red (fees)
- **The brand initial** — Z traced through the color layout

---

## 02 · Construction

### Variant: F3 (Primary)

Dark-filled card with seamless (gapless) bars. This is the primary logomark.

```
┌──────────────────────────────────────────┐
│  ■■■■■■■■■■■■■■■■■■▓▓▓▓▓▓▓░░░░░░░░░░░  │  ← top bar (full opacity)
│                                          │
│  ░░░░░░░░░░░▓▓▓▓▓▓▓■■■■■■■■■■■■■■■■■■  │  ← bottom bar (50% opacity)
└──────────────────────────────────────────┘

■ = blue (#60a5fa)    ▓ = purple (#a78bfa)    ░ = red (#f87171)
```

### SVG Structure

```
Card:     rect, rx=5, fill=#0a0e17, stroke=#22d3ee, stroke-width=1.5
Top bar:  clipPath (rect rx=3), 3 rects inside (blue, purple, red)
Bot bar:  clipPath (rect rx=3), 3 rects inside (red, purple, blue) at 50% opacity
```

### Proportions (46×36 viewBox)

| Element | x | y | width | height | rx |
|---------|---|---|-------|--------|----|
| Card outline | 2 | 2 | 42 | 30 | 5 |
| Top bar clip | 8 | 9 | 30 | 6 | 3 |
| Bottom bar clip | 8 | 19 | 30 | 6 | 3 |

### Top bar segments (left to right)

| Segment | x | width | color | opacity |
|---------|---|-------|-------|---------|
| Blue (points) | 8 | 18 | `#60a5fa` | 1.0 |
| Purple (benefits) | 26 | 6.5 | `#a78bfa` | 1.0 |
| Red (fees) | 32.5 | 5.5 | `#f87171` | 1.0 |

### Bottom bar segments (left to right — FLIPPED order)

| Segment | x | width | color | opacity |
|---------|---|-------|-------|---------|
| Red (fees) | 8 | 5.5 | `#f87171` | 0.5 |
| Purple (benefits) | 13.5 | 6.5 | `#a78bfa` | 0.5 |
| Blue (points) | 20 | 18 | `#60a5fa` | 0.5 |

### Key construction rules

1. **Bars are seamless** — no gaps between color segments. Each bar is clipped to a single rounded rect, segments butt against each other inside.
2. **Bottom bar is 50% opacity** — represents the "losing" card. The dimming creates visual hierarchy (winner on top, loser below).
3. **Blue segments are equal width** (18px) on both bars — this symmetry is what makes the Z readable.
4. **Bar vertical gap** = 4px (top bar ends at y=15, bottom starts at y=19).
5. **Card fill is `#0a0e17`** (bg-deep) — not transparent. Bars float on the dark interior.

---

## 03 · Colors

### Logomark colors

| Element | Hex | CSS Variable | Role |
|---------|-----|-------------|------|
| Card stroke | `#22d3ee` | `--accent-cyan` | Brand / interactive |
| Card fill | `#0a0e17` | `--bg-deep` | Dark interior |
| Blue segments | `#60a5fa` | `--accent-blue` | Points / data |
| Purple segments | `#a78bfa` | `--accent-purple` | Benefits |
| Red segments | `#f87171` | `--accent-red` | Fees / costs |

### Light mode variants

For light backgrounds, use darker versions of each color:

| Element | Dark mode | Light mode |
|---------|-----------|------------|
| Card stroke | `#22d3ee` | `#0891b2` |
| Card fill | `#0a0e17` | `#f0f2f5` |
| Blue segments | `#60a5fa` | `#3b82f6` |
| Purple segments | `#a78bfa` | `#8b5cf6` |
| Red segments | `#f87171` | `#ef4444` |
| Bottom bar opacity | 0.5 | 0.55 |

### Wordmark

| Context | Color |
|---------|-------|
| On dark | `#f0f2f5` (--text-primary) |
| On light | `#0a0e17` (--bg-deep) |

---

## 04 · Wordmark

### Font

- **Family:** Space Mono
- **Weight:** 700 (Bold)
- **Case:** Lowercase (`zurp`)
- **Size:** 28px at the default mark size (scales proportionally)
- **Tracking:** Default (0)

### Lockup spacing

The wordmark sits to the right of the logomark with 14px gap (at default size).

```
[logomark]  14px  [zurp]
```

The vertical center of the wordmark aligns with the vertical center of the card.

---

## 05 · Sizing & Clear Space

### Minimum sizes

| Context | Min mark height | Notes |
|---------|----------------|-------|
| Full lockup (mark + wordmark) | 28px mark height | Wordmark remains legible |
| Mark only (icon) | 22px | Below this, bars merge visually |
| Favicon | 16px | Simplify to single bar if needed |

### Size scaling notes

At small sizes (≤ 28px mark height):
- Increase card stroke-width to 2–3px (proportional)
- Increase bar height and radius slightly for legibility
- Bar segment boundaries may blur — this is acceptable

### Clear space

Minimum clear space around the logo = **half the card height** on all sides.

```
         ╭─────────╮
    ½h   │  mark   │  ½h
         ╰─────────╯
              ½h
```

At default 42px card height, clear space = 21px minimum.

---

## 06 · Loading Animation (A2 — Z-Path Fill)

### Concept

Segments fade in sequentially tracing the Z path through the bars. The eye follows: top-left blue → top purple → top red → cross to bottom → bottom red → bottom purple → bottom-right blue. Then all segments fade out and the cycle repeats.

### Timing specification

| Segment | Position | Delay | Fade in | Hold | Fade out |
|---------|----------|-------|---------|------|----------|
| Top blue | Top-left | 0ms | 0→100% | — | 100→0% |
| Top purple | Top-mid | ~240ms | 0→100% | — | 100→0% |
| Top red | Top-right | ~480ms | 0→100% | — | 100→0% |
| Bottom red | Bot-left | ~720ms | 0→100% | — | 100→0% |
| Bottom purple | Bot-mid | ~960ms | 0→100% | — | 100→0% |
| Bottom blue | Bot-right | ~1200ms | 0→50% | — | 50→0% |

**Total cycle:** 2.4s
**Easing:** `ease-in-out`
**Loop:** Infinite

### CSS keyframes

```css
/* Stagger delays — each segment gets its own animation */
.top-blue    { animation: z-fill 2.4s ease-in-out infinite; }
.top-purple  { animation: z-fill 2.4s ease-in-out infinite; animation-delay: 0.24s; }
.top-red     { animation: z-fill 2.4s ease-in-out infinite; animation-delay: 0.48s; }
.bot-red     { animation: z-fill 2.4s ease-in-out infinite; animation-delay: 0.72s; }
.bot-purple  { animation: z-fill 2.4s ease-in-out infinite; animation-delay: 0.96s; }
.bot-blue    { animation: z-fill 2.4s ease-in-out infinite; animation-delay: 1.2s; }

@keyframes z-fill {
  0%, 100% { opacity: 0; }
  15%, 85% { opacity: 1; }    /* top segments hold at full */
}
```

Note: Bottom bar segments animate to 0.5 max opacity (not 1.0), matching their base dimmed state.

### Implementation approach

Each bar segment is a separate `<rect>` element inside a shared `<clipPath>`. The clipPath handles the rounded bar shape; the rects handle color and animation independently.

```xml
<clipPath id="topbar">
  <rect x="8" y="9" width="30" height="6" rx="3"/>
</clipPath>
<g clip-path="url(#topbar)">
  <rect class="top-blue"   x="8"    y="9" width="18"  height="6" fill="#60a5fa"/>
  <rect class="top-purple" x="26"   y="9" width="6.5" height="6" fill="#a78bfa"/>
  <rect class="top-red"    x="32.5" y="9" width="5.5" height="6" fill="#f87171"/>
</g>
```

### Card outline during animation

The card outline (`stroke: #22d3ee`) remains static and fully visible at all times during the loading animation. It anchors the mark while the bars animate inside it.

### When to use

- **Loading states** — waiting for API response, data processing
- **Skeleton screens** — placeholder while simulation computes
- **Splash screen** — app launch (can play 2–3 cycles before content appears)

### When NOT to animate

- **Static contexts** — print, social cards, email signatures, favicons
- **In-context UI** — nav logo, footer logo (these should be static)
- **Alongside other animations** — don't compete with page entry animations

---

## 07 · Usage Rules

### Do

- Use the F3 variant (dark fill, seamless bars) as the primary mark
- Maintain the Z by keeping bottom bar segments in reversed order
- Scale proportionally — never stretch or compress
- Use the full lockup (mark + wordmark) when space allows
- Use the mark alone when space is tight (app icon, favicon)

### Don't

- Don't rearrange segment colors or proportions
- Don't use the mark without the dark card fill on dark backgrounds (it will disappear)
- Don't add effects (drop shadows, outer glows) beyond the specified A5 breathing glow
- Don't animate the logo in contexts where it's used as static navigation
- Don't place on busy backgrounds — the bar colors need contrast to read
- Don't lock up the wordmark above or below the mark — always to the right
- Don't use the animation for anything other than loading/processing states

### Monochrome fallback

For single-color contexts (print, embroidery, watermarks), use opacity steps in a single color (cyan):

| Segment | Opacity |
|---------|---------|
| Card stroke | 1.0 |
| Blue equivalent | 1.0 / 0.4 (top/bot) |
| Purple equivalent | 0.5 / 0.2 (top/bot) |
| Red equivalent | 0.25 / 0.12 (top/bot) |

---

## 08 · SVG Source (F3 — Primary, Dark Mode)

### Full lockup

```xml
<svg width="240" height="56" viewBox="0 0 240 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Card -->
  <rect x="2" y="10" width="42" height="30" rx="5" fill="#0a0e17" stroke="#22d3ee" stroke-width="1.5"/>
  <!-- Top bar: blue → purple → red -->
  <clipPath id="topbar">
    <rect x="8" y="17" width="30" height="6" rx="3"/>
  </clipPath>
  <g clip-path="url(#topbar)">
    <rect x="8" y="17" width="18" height="6" fill="#60a5fa"/>
    <rect x="26" y="17" width="6.5" height="6" fill="#a78bfa"/>
    <rect x="32.5" y="17" width="5.5" height="6" fill="#f87171"/>
  </g>
  <!-- Bottom bar: red → purple → blue (flipped for Z) -->
  <clipPath id="botbar">
    <rect x="8" y="27" width="30" height="6" rx="3"/>
  </clipPath>
  <g clip-path="url(#botbar)">
    <rect x="8" y="27" width="5.5" height="6" fill="#f87171" opacity="0.5"/>
    <rect x="13.5" y="27" width="6.5" height="6" fill="#a78bfa" opacity="0.5"/>
    <rect x="20" y="27" width="18" height="6" fill="#60a5fa" opacity="0.5"/>
  </g>
  <!-- Wordmark -->
  <text x="60" y="35" font-family="Space Mono, monospace" font-size="28" font-weight="700" fill="#f0f2f5">zurp</text>
</svg>
```

### Icon only (46×36 viewBox)

```xml
<svg width="46" height="36" viewBox="0 0 46 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="42" height="30" rx="5" fill="#0a0e17" stroke="#22d3ee" stroke-width="1.5"/>
  <clipPath id="t">
    <rect x="8" y="9" width="30" height="6" rx="3"/>
  </clipPath>
  <g clip-path="url(#t)">
    <rect x="8" y="9" width="18" height="6" fill="#60a5fa"/>
    <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa"/>
    <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171"/>
  </g>
  <clipPath id="b">
    <rect x="8" y="19" width="30" height="6" rx="3"/>
  </clipPath>
  <g clip-path="url(#b)">
    <rect x="8" y="19" width="5.5" height="6" fill="#f87171" opacity="0.5"/>
    <rect x="13.5" y="19" width="6.5" height="6" fill="#a78bfa" opacity="0.5"/>
    <rect x="20" y="19" width="18" height="6" fill="#60a5fa" opacity="0.5"/>
  </g>
</svg>
```
