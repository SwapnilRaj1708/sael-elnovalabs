# FE-02 — Design System Foundation

**Depends on:** FE-01
**Reads:** `design-guidelines.md`, `responsive-strategy.md`, `asset-inventory.md`

Build the token layer and the reusable primitives. Everything after this item consumes what is built here. Time spent getting this right is repaid across twenty pages; time saved here is paid back with interest in duplicated CSS.

---

## Scope

### 1. Fonts

- Convert the client-supplied `DIN.ttf` (400) and `DIN Bold.otf` (700) to WOFF2, subset to `latin` plus `₹ – ’ · # ²`.
- Place in `src/assets/fonts/`. Commit WOFF2 only — never the licensed TTF/OTF originals.
- Load via `next/font/local` in the root layout with `variable: '--font-din'`, `display: 'swap'`, `fallback: ['system-ui', 'sans-serif']`.
- Verify no FOUT/CLS: the fallback metrics should be close enough that swap is imperceptible. Use `adjustFontFallback` if not.

> If the licence question (`architecture.md` Open Decision #2) is unresolved, proceed — the token layer is font-agnostic and a substitution would be a one-line change.

### 2. Token layer — `src/styles/theme.css`

Tailwind v4 CSS-first configuration. Every value from `design-guidelines.md`.

```css
@import 'tailwindcss';

@theme {
  /* Colour */
  --color-brand-red: #e40f14;
  --color-brand-red-deep: #aa0505;
  --color-brand-blue: #0d2fa2;
  /* … full set per design-guidelines.md §1 … */

  /* Type — fluid, clamp-based */
  --text-hero: clamp(1.75rem, 1.09rem + 2.94vw, 3.625rem);   /* 28 → 58 */
  --text-h2:   clamp(1.5rem,  1.36rem + 0.63vw, 2.25rem);    /* 24 → 36 */
  /* … full scale … */

  /* Spacing */
  --gutter: clamp(1.25rem, -0.5rem + 8.72vw, 9.75rem);       /* 20 → 156 */
  --space-section-y: clamp(3rem, 1.71rem + 3.57vw, 6rem);    /* 48 → 96 */
  /* … */

  /* Breakpoints */
  --breakpoint-3xl: 120rem;                                   /* 1920 */
}
```

Non-`@theme` custom properties (gradients, shadows, the measure cap) go in a `:root` block in the same file — Tailwind's `@theme` is for values that should generate utilities.

**Generate the clamp expressions**, do not hand-tune them. Add `src/styles/README.md` documenting the two-point formula used, with the min/max viewport (360px / 1920px), so a later addition to the scale is consistent with the existing ones.

`vw` inside a `clamp()` here is permitted and expected. `vw` anywhere else is not.

### 3. Animations — `src/styles/animations.css`

Port every keyframe from `design-guidelines.md` §5: `saelKen`, `fxWord`, `fxLetter`, `fxFill`, `sdgMarquee`, `dotPulse`, `sparkFlick`.

Wrap the entire file's animation *application* in:

```css
@media (prefers-reduced-motion: no-preference) { … }
```

Define utility classes (`.anim-ken-burns`, `.anim-word-in`) rather than expecting components to write `animation:` shorthand inline.

### 4. Utilities

- `src/lib/utils/cn.ts` — `clsx` + `tailwind-merge`.
- `src/lib/utils/format-date.ts` — ISO string → `"Jun 10, 2026"` via `Intl.DateTimeFormat('en-IN')`. Must be deterministic between server and client (pass an explicit `timeZone: 'Asia/Kolkata'` — otherwise the server renders one date and the browser hydrates another, which is a real and confusing bug on late-evening ISO dates).
- `src/lib/utils/blob-url.ts` — `blobUrl(path)` composing `AZURE_BLOB_BASE_URL`.
- `src/lib/utils/format-file-size.ts` — bytes → `"2.4 MB"`.

### 5. Hooks

- `use-media-query.ts` — SSR-safe (`useSyncExternalStore`), returns `false` on the server.
- `use-reduced-motion.ts` — wraps the media query, returns `true` on the server so the still state is the SSR default.
- `use-scroll-progress.ts` — element-relative scroll progress 0→1, `requestAnimationFrame`-throttled, passive listener. Used by the vision timeline.
- `use-lock-body-scroll.ts` — for the mobile nav drawer. Must not cause layout shift from the scrollbar disappearing.

### 6. UI primitives — `src/components/ui/`

Each is a Server Component unless noted. Each has an exported `<Name>Props` interface.

| Component | Spec |
|---|---|
| `container.tsx` | Applies `--gutter` horizontally. Prop `size?: 'default' \| 'narrow' \| 'full'`. **The only place horizontal page padding is defined.** |
| `section.tsx` | `<section>` with vertical rhythm and a `background` variant (`white`, `alt`, `dark`, `gradient-stats`, `wash-strength`, `wash-goals`). Composes `Container` unless `fullBleed`. |
| `section-heading.tsx` | Optional `eyebrow`, required `title`, optional `description`. Renders `h2` by default, `as` prop to override. Handles the eyebrow→title→description spacing so twelve sections do not each invent it. |
| `eyebrow.tsx` | Gradient-clipped uppercase label with the `@supports` fallback. |
| `button.tsx` | `cva` variants: `primary` (gradient CTA), `ghost`, `onDark`. Sizes `sm`/`md`. Renders `<Link>` with `href`, `<button>` without. Never a `div`. |
| `card.tsx` | Variants `news` and `tile` per `design-guidelines.md` §4. |
| `tile-shape.tsx` | The chamfered business-tile background, CSS-based. See `asset-inventory.md` §4 — **do not import `rtile-*.svg`.** |
| `date-badge.tsx` | CSS-rebuilt notched gradient badge. Not the SVG. |
| `document-link.tsx` | PDF link: title, file type, size, external-link affordance, full accessible name. Used across every investor page. |
| `accordion.tsx` | `'use client'`. Accessible disclosure. Used by the mobile nav, mobile footer, and investor document grouping. |
| `pagination.tsx` | Numbered pages, prev/next, `aria-current`. Server component driven by `searchParams`. |
| `empty-state.tsx` | Icon, message, optional action. The universal fallback when a repository call fails or returns `[]`. |
| `skeleton.tsx` | Loading placeholder for Suspense boundaries. |
| `sr-only.tsx` | Or a `.sr-only` utility class — either, but exactly one. |

Rules for every primitive:

- Zero SAEL-specific knowledge. `<Button>` does not know what "Know More" means.
- Forwards `className` and merges with `cn()`.
- Forwards `ref` and spreads remaining props to the root element.
- Has a visible `:focus-visible` state.

### 7. Icons

- SVGR configured so `import Icon from '@/assets/icons/x.svg'` yields a React component.
- Import the four business icons and four hero symbol icons per `asset-inventory.md`.
- Social icons (Facebook, Instagram, LinkedIn, X) as inline components — they exist in the prototype footer markup, extract them.
- Utility icons (chevron, close, menu, external-link, download, arrow) from `lucide-react`.

### 8. Kitchen-sink route

`src/app/_dev/design-system/page.tsx`, rendering every token and primitive in every variant and state.

- Not linked from anywhere.
- Returns `notFound()` when `NODE_ENV === 'production'`.
- This replaces Storybook (out of scope per client) and is the fastest way to check a token change across the whole system.

---

## Out of scope

Header, footer, nav (FE-03). Section components (FE-04+). Forms (FE-19).

---

## Acceptance criteria

- [ ] `theme.css` contains every token in `design-guidelines.md`; a search of the codebase for a hardcoded brand hex returns only `theme.css`
- [ ] DIN renders at 400 and 700; no synthetic weights; no CLS on load
- [ ] The kitchen-sink route renders every primitive and is `notFound()` in production
- [ ] Every primitive is keyboard reachable with a visible focus ring
- [ ] Type and gutter tokens scale smoothly from 360px to 1920px with no jump — verified by dragging the viewport, not by screenshotting two widths
- [ ] `formatDate()` produces identical output on server and client (no hydration warning)
- [ ] With `prefers-reduced-motion: reduce`, every animation utility is inert
- [ ] `<Container>` is the only file in `src/` that sets horizontal page padding
- [ ] `pnpm check` passes

## On completion

Move to Done, promote **FE-03**.
