# Responsive Strategy

**This is the most important document in the folder.** The client's single most critical requirement is a mobile-first site. The approved prototype is desktop-locked at 1920px. Reconciling those two facts is the central engineering task of this project.

---

## 1. The core problem

The prototype expresses nearly every dimension in viewport-width units:

```html
<section style="height:46.44vw; padding:0 120px">      <!-- stats band -->
<div style="position:absolute; left:8.13vw; top:13vw; width:38vw">
<img style="width:36vw">
```

At 1920px, `46.44vw` = 892px and works. At 390px it is 181px, and every absolutely-positioned child inside it overlaps. `vw` is not a responsive unit — it is a *proportional* unit, and proportional scaling is the opposite of responsive design. A layout that is correct at 1920 and merely *smaller* at 390 is unreadable at 390.

**Therefore: no component ships a raw `vw` value.** The prototype's `vw` numbers are treated as measurements at 1920px, converted to pixels, and re-expressed through the fluid scale below.

---

## 2. Breakpoints

Mobile-first. Every rule is authored for the smallest viewport and enhanced with `min-width`.

| Token | Min-width | Represents |
|---|---|---|
| *(base)* | 0 | 360–479px — small phones. **Design floor is 360px.** |
| `sm` | 480px | Large phones |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small laptop. **Primary desktop/mobile divide.** |
| `xl` | 1280px | Laptop |
| `2xl` | 1536px | Desktop |
| `3xl` | 1920px | The prototype's design width — reference only |

Above 1920px the layout does not keep growing. Sections stay fluid but body copy is capped at `--measure: 68ch` and the India map / hero content max out. Test at 2560px.

**`lg` (1024px) is the hinge.** Everything that has a fundamentally different mobile design — the nav, the vision timeline, the hero text placement — switches there. Do not scatter one-off breakpoints; if a section needs a bespoke breakpoint, justify it in a code comment.

---

## 3. The fluid scale

Two mechanisms, used deliberately:

**(a) `clamp()` for continuous properties** — type, gutters, section padding. One expression covers the whole range.

```css
/* Section heading: 24px at 360 → 36px at 1920 */
--text-h2: clamp(1.5rem, 1.36rem + 0.63vw, 2.25rem);

/* Page gutter: 20px at 360 → 156px at 1920 */
--gutter: clamp(1.25rem, -0.5rem + 8.72vw, 9.75rem);
```

Generate these from the design-guidelines table using the standard two-point formula. `vw` **is** permitted inside a `clamp()` in `theme.css`, because the `min` and `max` bounds make it safe. It is never permitted bare, and never inside a component.

**(b) Breakpoint switches for discontinuous properties** — grid column counts, layout direction, whether a component exists at all. A carousel does not `clamp()` into an accordion.

### Never use `vw` for height

Replace every `height: Nvw` from the prototype with either:

- intrinsic height (content + padding), which is the right answer for the stats band, About, Strength and Goals sections; or
- `aspect-ratio`, which is the right answer for media banners (hero `2.34/1` on desktop → `4/5` on mobile); or
- `min-height` with `svh`/`dvh` for genuinely viewport-filling sections (only the pinned vision timeline).

Use `dvh`, not `vh`, anywhere a full-viewport height is needed — mobile browser chrome makes `100vh` overflow.

---

## 4. Per-section mobile specification

This table is normative. Each row is an acceptance criterion for that section.

### Header
| | |
|---|---|
| **≥ lg** | As prototype: 84px tall, logo left, 7 inline nav items right, glass background. |
| **< lg** | 64px tall. Logo left (32px), hamburger right (44×44 touch target). Nav becomes a full-screen drawer sliding from the right: items stacked at `--text-h3`, dropdown groups (Company, Businesses, Sustainability, Investors) as accordions. Body scroll locked while open, focus trapped, `Esc` closes, close button top-right. |
| **Notes** | The prototype has no mobile nav. This is new design work — see `features/03`. |

### Hero carousel
| | |
|---|---|
| **≥ lg** | `aspect-ratio: 2.34/1`. Per-slide `textX/textY/iconX/iconY` positioning as in the prototype. Mouse parallax active. |
| **< lg** | `aspect-ratio: 4/5` (portrait). **Abandon per-slide absolute positioning entirely** — headline is bottom-anchored, left-aligned, full width inside `--gutter`, over a bottom-up scrim `linear-gradient(0deg, rgba(8,10,14,.85) 0%, transparent 60%)`. Background icon scales to 42vw and sits top-right at 12% opacity, purely decorative. |
| **Both** | Swipe/drag to change slide on touch. Dots remain, min 44px touch target (visual dot stays small, hit area padded). Autoplay pauses when the section is out of the viewport (`IntersectionObserver`) and on user interaction. |
| **Type** | Hero H1 clamps 28px → 58px. At 360px, 28px/1.15 over 4 lines is the worst case — verify the longest headline ("Generating clean energy by investing in advanced technology and systems") does not exceed 5 lines. |

### Stats band
| | |
|---|---|
| **≥ lg** | 4 columns, gradient background, intrinsic height (**delete `height: 46.44vw`**). |
| **md** | 2×2 grid. |
| **< md** | Single column, stacked. The 60×3px rule and 28px/22px spacing scale to 40×2px and 16px/12px. Stat figure clamps 28px → 40px. |
| **Notes** | Vertical padding replaces the fixed height: `clamp(40px, 6vw, 96px)`. |

### About SAEL
| | |
|---|---|
| **≥ lg** | Layered composition as prototype — background image full-bleed, secondary image pinned left, text block absolutely positioned at `left: 8.13vw`. |
| **< lg** | **Un-stack the absolute positioning.** Becomes a normal flow: background image as a `16/9` banner on top, text block below in a white card with `--gutter` padding. The left-pinned decorative image is dropped below `md` (it is decorative and unreadable at that size). |

### Our Business (4 tiles)
| | |
|---|---|
| **≥ lg** | 2×2 grid, `aspect-ratio: 2`, SVG shape backgrounds. |
| **md** | 2×2, `aspect-ratio: 1.6`. |
| **< md** | Single column, **`aspect-ratio` removed** — tiles size to content. Test the SVG background at tall aspect ratios: `rtile-*.svg` must use `preserveAspectRatio="none"` or be replaced with a CSS-drawn equivalent. Verify with the longest tile copy. |
| **Notes** | Icon size clamps 72px → 150px. |

### Our Presence (India map)
| | |
|---|---|
| **≥ lg** | Image at `min(42vw, 820px)`. |
| **< lg** | The flat PNG is unreadable — state labels become sub-6px. Ship the image at full container width **plus** a visible list of the states of operation beneath it, as an unordered list. The list is the accessible representation at every breakpoint (`sr-only` above `lg`, visible below). |
| **Open** | Rebuilding as an interactive SVG is Open Decision #6 in `architecture.md`. The list fallback is required either way. |

### Solutions banner
| | |
|---|---|
| **≥ lg** | Full-bleed image, `height: 32vw` → `aspect-ratio: 3/1`. Gradient caption badge bottom-left. |
| **< lg** | `aspect-ratio: 4/3`. Caption badge moves to below the image, full width, so it never covers the subject. |

### Our Strength
| | |
|---|---|
| **≥ lg** | Two-column flex, 46% text / engineer cut-out right, bottom-aligned. |
| **< lg** | Single column: text first, image below at `width: 100%` with `max-width: 420px`, centred. Gradient wash direction rotates to `180deg` so the tint reads top-to-bottom. |

### Vision timeline — **two separate components**
| | |
|---|---|
| **≥ lg** | `<VisionTimelineDesktop>` — the pinned 220vh scroll track, SVG path draw driven by `stroke-dashoffset`, travelling spark positioned via `getPointAtLength`, 5 milestones revealing at computed thresholds. Refactored to use refs and a single `requestAnimationFrame`-throttled scroll listener. |
| **< lg** | `<VisionTimelineMobile>` — a **completely different component**. Vertical timeline: a 3px gradient rail down the left at `--gutter`, milestone dots on the rail, year + copy to the right. Each milestone fades/slides in via `IntersectionObserver`. No pinning, no path maths, no 220vh track. |
| **Selection** | Rendered by a wrapper using CSS (`hidden lg:block` / `lg:hidden`) so both are server-rendered and there is no hydration flash. Do **not** select with a JS media-query hook at the top level. |
| **Reduced motion** | Desktop: path fully drawn, all milestones visible, no spark, no pin. Mobile: all milestones visible immediately. |
| **Rationale** | Scroll-pinning on mobile fights the browser's own scroll behaviour and address-bar resize. This is the single biggest divergence from the prototype and it is intentional. |

### SDG marquee
| | |
|---|---|
| **≥ lg** | 44s infinite CSS marquee, pause on hover, edge mask. |
| **< lg** | Native horizontal scroll: `overflow-x: auto`, `scroll-snap-type: x mandatory`, `scroll-snap-align: start` on cards, momentum scrolling, hidden scrollbar. Marquee animation **off** — a moving target is unusable on touch. Card width clamps 150px → 250px. |
| **Both** | Cards are focusable links (they deep-link to `/sustainable-development-goals/#sdg-N`). Keyboard focus must scroll the card into view and must not be trapped in the marquee loop — this is why the duplicated set is `aria-hidden` and `tabindex="-1"`. |

### Our Goals (Mission / Vision / Ethos)
| | |
|---|---|
| **≥ lg** | 3 columns, gradient-on-hover. |
| **< lg** | Single column. **Hover gradient does not exist on touch** — apply the gradient as the resting state on `(hover: none)` devices so the design intent survives, rather than leaving three grey boxes. |

### In the News
| | |
|---|---|
| **≥ lg** | 3 columns. |
| **md** | 2 columns. |
| **< md** | Single column. Card title clamps 16px → 22px, and clamps to 3 lines with `line-clamp-3` — the longest current headline runs to 5 lines at 360px. |

### Footer
| | |
|---|---|
| **≥ md** | 4 link columns as prototype. |
| **< md** | Link groups become accordions (collapsed by default, `<details>`/`<summary>` or an accessible disclosure). Logo and socials stack and centre. Legal bar wraps to two rows. |
| **Notes** | `footer-bg.png` must be checked for legibility at mobile crop; if the focal area is lost, fall back to `--color-footer-bg` below `md`. |

### Pixel strip divider
Decorative full-bleed image. Keep at all sizes but cap `max-height: 48px` and `object-fit: cover` so it does not become a thick band on narrow screens.

---

## 5. Touch and input

- Minimum touch target **44×44px** for every interactive element. The visual can be smaller; pad the hit area.
- Every `:hover` affordance has a `:focus-visible` equivalent.
- Nothing is hover-only. Where hover reveals information, that information is present by default on `(hover: none)` devices.
- Carousels, marquees and maps are swipeable, with `touch-action` set explicitly so vertical page scroll is never captured.
- Use `(hover: hover) and (pointer: fine)` — not a width breakpoint — to gate mouse parallax and hover states.

---

## 6. Performance budget (mobile, 4G, mid-tier Android)

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.05 |
| INP | < 200ms |
| Initial JS (homepage) | < 120KB gzipped |
| Hero image (mobile) | < 180KB, AVIF/WebP |
| Lighthouse mobile performance | ≥ 90 |

Enforcement:

- Every `<Image fill>` has a `sizes` attribute. No exceptions.
- The mobile hero serves a portrait crop, not the desktop landscape image scaled down. See `asset-inventory.md`.
- `'use client'` only on: mobile nav, hero carousel, desktop vision timeline, SDG marquee (touch scroll), forms. If a sixth client component appears, justify it.
- Fonts: WOFF2, subset, `display: swap`, preloaded.
- No layout shift from the fixed header — the page offsets by header height via `scroll-padding-top` and a spacer, not `margin-top` on an absolutely-positioned element.

---

## 7. Testing checklist — every section, every PR

- [ ] 360 × 640 (small phone) — no horizontal overflow, no text clipping
- [ ] 390 × 844 (iPhone 14) — primary mobile reference
- [ ] 768 × 1024 (tablet portrait)
- [ ] 1024 × 768 (tablet landscape — the `lg` switch fires here)
- [ ] 1440 × 900 (laptop)
- [ ] 1920 × 1080 (design reference — must match the prototype)
- [ ] 2560 × 1440 (no runaway scaling)
- [ ] `prefers-reduced-motion: reduce` enabled
- [ ] Keyboard-only traversal of the whole section
- [ ] 200% browser zoom at 1280px (WCAG reflow)
- [ ] Longest realistic copy in every text slot, not the placeholder

A quick way to catch the classic failure: at 360px, `document.body.scrollWidth` must equal `window.innerWidth`. Add this as a manual check before every PR.
