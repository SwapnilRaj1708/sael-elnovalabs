# SAEL homepage hero — image spec for Claude Designer

*Derived from the code on 2026-09-03, branch `sachin/refactoring-design-guideline`.*

**Read this first.** `docs/responsive-strategy.md` §4 still specifies the hero as
`aspect-ratio: 2.34/1` above `lg` and `4/5` below it. **That is no longer what the code
does.** When the homepage moved to snap-scrolling, the hero became exactly one viewport
tall at every width — a snapping section that is not a full viewport leaves a gap or a
partial neighbour at every rest position. Every figure in this document is measured
against the box the code actually produces, not the one that doc describes. See §2.

Source files this is drawn from:

- `src/styles/animations.css` — the Ken Burns keyframes
- `src/components/sections/hero-carousel/index.tsx` — the section box
- `src/components/sections/hero-carousel/hero-backdrop.tsx` — the image stack and scrims
- `src/components/sections/hero-carousel/hero-copy.tsx` — the content column
- `src/styles/theme.css` — every token quoted below

---

## 1. The Ken Burns CSS, exactly as written

```css
@keyframes saelKen {
  from { transform: scale(1.04); }
  to   { transform: scale(1.12); }
}

/* inside @media (prefers-reduced-motion: no-preference) */
.anim-ken-burns { animation: saelKen 9s ease forwards; }

/* default / reduced motion */
.anim-ken-burns { transform: scale(1); }
```

| Property | Value |
|---|---|
| Scale range | `1.04 → 1.12` (a 7.7% growth) |
| **Translate** | **None.** Pure zoom. |
| `transform-origin` | **`var(--hero-origin)` = `50% 30%`** since 2026-09-03. Was undeclared (→ `50% 50%`); see `hero-reframe-instructions.md` |
| Duration | `9s`, `ease`, `forwards` |
| Applied to | the `<img>` itself (`fill` + `object-cover`), only while its slide is active |

**The 9s never completes.** The slide interval is `6000ms` (`HeroCarousel`'s `intervalMs`
default; the homepage passes no override). `ease` is `cubic-bezier(.25, .1, .25, 1)`, so
at t = 6/9 the eased progress is ≈ 0.925 and the image hands over at **scale ≈ 1.114**,
not 1.12. Effectively the full range is used.

### A second transform sits above it, desktop only

The wrapper `<div>` around the image carries, **at `lg` (≥ 1024px) and up only**:

```css
transform: scale(1.06) translate(
  calc(var(--parallax-x, 0) * 10px),
  calc(var(--parallax-y, 0) * 10px)
);
```

`--parallax-x` / `--parallax-y` run −1 → 1 edge to edge from the pointer position.
Because `translate` follows `scale` in the function list, the travel is effectively
**±10.6px** per axis. It is gated on `(hover: hover) and (pointer: fine)` and disabled
under reduced motion — so touch devices get none of it.

### Net effective scale

| Breakpoint | Start | At 6s handover | Theoretical max |
|---|---|---|---|
| **≥ lg** (1.06 × Ken) | 1.1024 | 1.1808 | 1.1872 |
| **< lg** (Ken only) | 1.04 | 1.114 | 1.12 |

**Radial drift is identical in both cases:** `1.1872 / 1.1024` and `1.12 / 1.04` both
equal **1.0769**. Any point drifts *away from the origin* by 7.7% of its distance from it
over the run. A face sitting 30% of the frame width from the origin moves ~2.3% of frame
width outward — about **44px at 1920**. A point at the origin does not move at all.

Since 2026-09-03 the origin is `50% 30%`, not the centre, so the face is no longer a fixed
point of the zoom — it drifts down ~6px over the 6s run. That drift is identical on all
four slides, so it costs nothing in alignment.

> **Bug worth knowing about.** When a slide goes inactive the `anim-ken-burns` class is
> removed immediately, so the outgoing image snaps `1.114 → 1.0` while it is still fading
> out over the 1100ms cross-fade (`--duration-cross-fade`). If you see the subject
> "popping smaller" mid-transition, that is this, not your artwork.

---

## 2. The hero box

The section is `min-h-viewport`, full-bleed, width `100vw`. Height resolves through
`--spacing-viewport`, which the homepage swaps because it sets `data-snap-sections`:

- **< lg (< 1024px):** `100dvh` — the masthead overlays the hero and auto-hides on scroll
- **≥ lg:** `100dvh − 68px` (`--spacing-header`) — the masthead offsets the page

| Viewport | Hero box | Ratio |
|---|---|---|
| 360 × 800 | 360 × 800 | **0.450** |
| 390 × 844 | 390 × 844 | 0.462 |
| 430 × 932 | 430 × 932 | 0.461 |
| 768 × 1024 (tablet portrait) | 768 × 1024 | **0.750** |
| 1024 × 768 | 1024 × 700 | 1.463 |
| 1280 × 800 | 1280 × 732 | 1.749 |
| 1440 × 900 | 1440 × 832 | 1.731 |
| 1920 × 1080 | 1920 × 1012 | **1.897** |

**Yes — mobile is a very tall crop, and it changes the safe zone drastically.** 0.45:1 is
taller than 9:16.

---

## 3. The source assets, and how much of them survives

```
Desktop (used ≥ lg)              Mobile (used < lg)
hero-1.png  2100×1026  2.047     hero-image-mobile-1.jpg   5028×3328  1.511
hero-2.png  2100×1026  2.047     hero-image-mobile-2.jpg   5382×3328  1.617
hero-3.png  2100×1026  2.047     hero-image-mobile-3.jpg   5040×3909  1.289
hero-4.png  2100×1026  2.047     hero-image-mobile-4.jpg  10549×6144  1.717
```

Every source ratio (1.289 – 2.047) is wider than the widest box ratio (1.897), so
**`object-cover` is height-bound at every single breakpoint.** That one fact simplifies
everything below — see §6.

### Visible window, desktop (% of the 2100 × 1026 master, centred)

| Viewport | Width visible (start → 6s) | Height visible |
|---|---|---|
| 1024 | 64.8% → **60.2%** | 90.7% → 84.2% |
| 1280 | 77.5% → 72.0% | 90.7% → 84.2% |
| 1440 | 76.7% → 71.2% | 90.7% → 84.2% |
| 1920 | 84.1% → 78.1% | 90.7% → 84.2% |

The narrower the desktop viewport, the tighter the horizontal crop. **1024 is the binding
case, not 1920.**

### Visible window, mobile — this is the problem

At **360 × 800**, the % of the mobile source's width that is ever on screen:

| Slide | Source ratio | Start (1.04) | At 1.12 |
|---|---|---|---|
| 1 | 1.511 | 28.6% | **26.6%** |
| 2 | 1.617 | 26.8% | **24.9%** |
| 3 | 1.289 | 33.6% | **31.2%** |
| 4 | 1.717 | 25.2% | **23.4%** |

At **768 × 1024** it improves to 39–52%. Height visible is 96.2% → 89.3% throughout, and
there is no parallax below `lg` to eat into it.

**On a phone, roughly three-quarters of each mobile image is thrown away.** The files
currently bound as "mobile" are landscape stand-ins — `docs/asset-inventory.md` §9 still
lists the art-directed portrait crops as outstanding and blocking FE-04. That is the root
cause, and fixing it is worth more than any amount of repositioning. See §7.

---

## 4. Where the copy sits — the exclusion zone

**≥ lg.** The content column (mark → red rule → headline) is a 12-column grid at
`col-start-7 / span 6` inside `--spacing-gutter`. Its left edge lands at
**50.8% – 51.1% of viewport width** at every width from 1024 to 1920 — near enough to
call it a flat 51%. A left-to-right scrim (`--gradient-hero-scrim-side`) darkens from 6%
opacity at 32% across to 88% at the right edge.

**< lg.** The column is full-width and **bottom-anchored**. At 360 × 800 it stacks a 74px
mark (`--spacing-hero-icon`) + 12px + a 2px rule + 12px, above a headline capped at `15ch`
(`--hero-measure`) of 28px/1.08 type (`--text-hero`) — up to about 7 lines on slide 2 —
above 64px of bottom padding (`--spacing-hero-pad-bottom`). That puts the column's top
edge at roughly **y = 53% of the screen**. A bottom-up scrim
(`--gradient-hero-scrim-stacked`) runs 92% opaque at the base to 30% at the top.

**Both.** A 44px progress bar (`--spacing-hero-progress`) is pinned to the very base,
under its own foot scrim (55% → transparent over the bottom 30%).

---

## 5. Face safe zones

All coordinates are **% of the source image**, origin top-left.

### Desktop master (2100 × 1026)

```
Always on screen (1024→1920, full zoom, incl. parallax):   x 20.5–79.5%   y 9.2–90.8%
Clear of the copy column — screen 51% maps to source ~50.7% at every desktop width
Clear of the foot scrim and the progress bar

  ➜ FACE ZONE:    x 22–46%      y 12–78%
  ➜ RECOMMENDED:  x 33%         y 38%
```

At that target the face lands at **screen x 21.8% – 29.8%** and **screen y 35.7% – 36.8%**
across the whole 1024 → 1920 range and the whole Ken Burns run.

The 8-point horizontal band is the irreducible cost of a fixed image in a variable-ratio
box: there is no single source coordinate that pins a face to one screen fraction at
every viewport width. If "identical location" has to mean tighter than ±4 points, that
needs a second desktop crop at a breakpoint, not a better-placed single one.

### Mobile crops

The binding constraint is slide 4 — widest source, narrowest window, x 38.3–61.7% visible.

```
  ➜ FACE ZONE:    x 39–61%      y 15–44%
  ➜ RECOMMENDED:  x 50% (dead centre)     y 30%
```

`y ≥ 15%` clears the overlaying masthead (68px = 8.5% of an 800px screen); `y ≤ 44%`
clears the bottom-anchored copy. At x = 50%, y = 30% the face renders at screen
y ≈ 27.6 – 29.2%.

**Horizontally on mobile there is effectively no choice but centre.** With only ~23% of
the width surviving on the worst slide, any offset runs off screen on the next one.

---

## 6. Position only, or head size too?

Separate the two — they have different answers.

**Position** is cheap: an art-directed crop, no re-rendering. The zones in §5 are all you
need.

**Head size** is also easy to specify, and here is the useful part:

> Because the cover crop is **height-bound at every breakpoint** (§3), rendered head
> height in CSS px = `(head height ÷ source image HEIGHT) × box height × scale`. Box
> height and scale are shared by all four slides.
>
> **⇒ Four heads are identical on screen if and only if each is the same percentage of
> its own source image's HEIGHT.**
>
> Percentage of *width* will not work — the four mobile crops have four different aspect
> ratios (1.289 to 1.717), so the same width-percentage yields four different head sizes.

The same logic applies to horizontal position across differing ratios: express the offset
from centre **in units of image height**, not width. On desktop all four masters share one
2100 × 1026 frame, so % of width is safe there.

Concrete conversions, where `h` is head height as a fraction of source image height:

| Family | Rendered head height |
|---|---|
| Desktop @ 1920 | `h × 1159px` — h=20% → 232px, h=24% → 278px, h=30% → 348px |
| Desktop @ 1024 | `h × 802px` |
| Mobile @ 360 × 800 | `h × 864px` — h=18% → 156px (43% of screen width), h=22% → 190px |

**Suggested:** desktop `h = 24%`, mobile `h = 18%`. Desktop and mobile are separate
assets, so the two families can be tuned independently.

---

## 7. Three things to fix while you are in there

1. **The mobile set is not the portrait crop.** `docs/asset-inventory.md` §9 specifies
   **4:5, art-directed, ≤ 140KB @ 1080w**; what is bound is landscape 1.289 – 1.717:1. A
   true 4:5 export lifts phone visibility from 23–31% of width to ~50%. If you want
   better than that, **2:3 (e.g. 1600 × 2400)** is the sweet spot — 60% of width visible
   at 360 × 800 and 79% of height at 768 × 1024 — but it departs from the documented
   ratio, so raise it as a decision rather than shipping it silently.

2. **The desktop masters are undersized.** At 1920 CSS px only ~78% of a 2100px-wide
   source is on screen, i.e. 1640 source px stretched across 1920 CSS px — soft at 1× DPR
   and badly soft at 2×. Needed: **≥ 2500px wide for 1×, ~4900px for 2×.** Recommend
   re-exporting at **4800 × 2345** (same 2.047:1). The mobile files are already large
   enough.

3. **`alt` text is `{{TODO: content}}` on all four slides**
   (`src/app/_content/homepage.ts`). Each needs a description of the scene, not the brand
   — `docs/design-guidelines.md` §6.
