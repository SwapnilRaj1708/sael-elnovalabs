# FE-04 — Homepage

**Depends on:** FE-03
**Reads:** `design-guidelines.md`, `responsive-strategy.md`, `content-model.md`, `asset-inventory.md`

The homepage is the reference implementation. Twelve section components are built here, and most are reused on later pages. Build them to be reused — a section that hardcodes homepage copy is a defect even if it renders correctly.

---

## Route

`src/app/page.tsx` — Server Component.

```tsx
export const metadata = buildMetadata({
  title: 'SAEL | Renewable and Green Energy Company India',
  description: '{{TODO: content — client to supply, 140–160 chars}}',
  path: '/',
});
```

> Title is carried over verbatim from the live site. Do not "improve" it — it is a ranking title.

Data: `getCapacityStats()` and `getLatestNews({ limit: 3 })` from the repository, in a `Promise.all`. Everything else is static and lives in `src/app/_content/homepage.ts`.

> **Amended 2026-10-02, corrected 2026-10-04.** The capacity figures are static content: `value` and `footnote` on each row of `businessTiles` in `src/app/_content/homepage.ts`. The backend has no endpoint for them, so `getCapacityStats()` was removed (`content-model.md` §1). The only repository call on the homepage is the In the News rail. **The figures are SAEL's reviewed ones** (`5494e70`, 2026-10-01): `8.3 GWp` / Contracted & Awarded (Solar IPP & BESS), `5 GW*` / \*Upcoming, `3.6 GWp + 5 GW*` / Operational · \*Upcoming, `164.9 MW` / Operational. The 2026-10-02 change replaced them with sael.co's figures. sael.co is SAEL's previous website, so that was wrong, and it was undone on 2026-10-04 (`content-model.md` §1.1).

Both repository calls are individually wrapped — a news failure renders `<EmptyState>` in that section and nothing else on the page is affected.

---

## Section order

**The authority is the client's ten-step section sequence of 2026-08-26**, reproduced
below. It names each section *and* its ground, and it is the current running order of
`src/app/page.tsx`. It is recorded in `docs/frontend-progress.md` and reconciled against
the build, deviation by deviation, in `docs/homepage-section-sequence-review.md` §1.

**The twelve numbered sections further down are the original specification** and their
numbering is left exactly as written, so a reference to "§8" still resolves. That list is
*not* the page. Where the two disagree, **the sequence wins.**

### The sequence — and what renders it

| Step | Client's sequence | Ground (client) | On the page | Component | Spec § |
|---|---|---|---|---|---|
| 1 | Hero | Black | `<HeroCarousel>` | `sections/hero-carousel/` | §1 |
| 2 | About SAEL | White | `<IntroSplit>` | `sections/intro-split/` | §3 |
| 3 | Business Portfolio | Black | `<BusinessTiles>` | `sections/business-tiles/` | §4 **+ §2** |
| 4 | Power Portfolio | Black | `<PresenceMap>` | `sections/presence-map/` | §5 |
| 5 | Our Endeavours | White | `<EndeavourSplit>` | `sections/endeavour-split/` | **none** |
| 6 | Solutions | Black | `<SolutionsCarousel>` | `sections/solutions-carousel/` | §6 |
| 7 | Our Goals | Black | `<GoalsGrid>` | `sections/goals-grid/` | §10 |
| 8 | Timeline | Image bleed / neutral | **not built** | — | §8 |
| 9 | News | White | `<NewsCarousel>` | `sections/news-carousel/` | §11 |
| — | *not in the sequence* | — | `<FooterPixelStrip>` | `sections/footer-pixel-strip/` | §12. **In the footer, not on the page**, since 2026-08-27 — rendered by `layout/footer/footer.tsx` as its first child, mirrored so its solid edge is the footer's top edge. `<PixelStrip>` is retired to `sections/_retired/` |
| 10 | Footer | Carbon grey + inverted pixel elements | `<Footer>` | `components/layout/footer/` | — (FE-03) |

The grounds as actually built, in the same order: `black` · `paper-dots` · `black-dots` ·
`black-dots` · `paper-dots` · `black-dots` · `black-dots` · *(absent)* · `paper-dots` ·
`ground-dots-paper` · `--color-footer-bg`. Every section but the hero carries the dot grid.

### Where the sequence and this document do not line up

- **Step 3 absorbs §2.** The capacity figures §2 specifies as a standalone `<StatsBand>`
  are instead the largest element on each Business Portfolio row. Each row carries
  its own figure in `_content/homepage.ts` (static since 2026-10-02); there is no separate
  band, and no `<StatsBand>`.
- **Step 4 is §5 renamed twice.** "Our Presence" in this document, "Power Portfolio" in the
  sequence, "Our Current Power Portfolio" as the heading on the page.
- **Step 5 is specified nowhere.** Our Endeavours is in the sequence and on the page, but
  has no entry in this document and no feature doc of its own; its only other trace in
  `docs/` is two tokens in `design-guidelines.md` (`--endeavour-max-w`,
  `--aspect-endeavour`). It came across from the client's PDF. **A documentation gap, not a
  section to be removed.** Note also that §7's title — "Adoption of clean and affordable
  energy projects" — appears verbatim inside its first paragraph; whether §7 and this are
  one section under two names is unconfirmed, and neither the PDF nor the prototype is in
  the repo to settle it. The client's sequence says **"Our Endeavours"**, plural; the
  eyebrow on the page is singular. Ruled incidental — no copy change.
- **Step 6 is not §6's component.** §6 specifies `<FeatureBanner>`, one full-bleed image
  with a gradient caption plaque. What shipped is a rail of four 4:3 plates, plaque gone,
  rebuilt to `SAEL Home v2` on 2026-08-20. It moved *after* Our Endeavours and onto the
  black ground on 2026-08-26.
- **Step 8 is the one unbuilt step.** Deferred by the client on 2026-08-20 and accepted as
  deliberate on 2026-08-26. Two things need answering before it is picked up: *which*
  timeline (§8's scroll-pinned vision timeline and v2 §08 are different screens), and what
  "image bleed / neutral" means as a ground — `<Section>` has no such variant.
- **Steps 7 and 9 are not §10's and §11's components either.** §10's `<GoalsTriad>` — three
  grey cards that gradient on hover — shipped as `goals-grid/`, three photographic cards a
  hairline apart inside a hairline frame on black. §11's `<NewsGrid>` shipped as a rail
  rather than a grid. It remains the one homepage surface fed by the repository.
- **The pixel strip is in no step.** It sits between News and Footer, and the sequence asks
  the *footer* for inverted pixel elements instead. Both were accepted as deliberate on
  2026-08-26: the strip stays, the footer's pixels are not outstanding work.

### Specified here, absent from the sequence and the page

| Spec § | Section | State |
|---|---|---|
| §2 | Stats band | Absorbed into step 3. |
| §7 | Our Strength | Not started. In neither the client's PDF nor v2 — **ask before building** (and see step 5 above). |
| §9 | SDG marquee | Skipped, confirmed by the client on 2026-08-05. |

### The component names below are mostly not the ones that shipped

Eleven of the twelve sections below name a component (§12 names none). **Seven of those
eleven do not exist as code.** Their directories were scaffolded at the start of FE-04 and
are still empty — `.gitkeep` and nothing else:

`stats-band/` · `feature-banner/` · `strength-split/` · `vision-timeline/` ·
`sdg-marquee/` · `goals-triad/` · `news-grid/`

So searching for `<GoalsTriad>` or `<NewsGrid>` finds nothing; the built equivalents are
`goals-grid/` and `news-carousel/` in the table above. The four named components that do
exist are §1, §3, §4 and §5. (`page-hero/` is an eighth empty scaffold, which this document
does not name at all.)

---

## 1. `<HeroCarousel>` — `sections/hero-carousel/`

Client component (interaction + timers). The single most complex piece on the page.

**Props:** `slides: HeroSlide[]`, `intervalMs?: number` (default 6000)

```ts
interface HeroSlide {
  image: { desktop: StaticImageData; mobile: StaticImageData; alt: string };
  symbol: { src: string; alt: '' };
  headline: string;
  /** Desktop-only positioning. Ignored below lg. */
  desktop: { textX: string; textY: string; textWidth: string; symbolX: string; symbolY: string; symbolSize: string };
}
```

**Content** (from the prototype):

| # | Image | Symbol | Headline |
|---|---|---|---|
| 1 | `hero/solar-modules` | cell-manufacturing | A leading manufacturer for Bifacial TOPCon solar modules |
| 2 | `hero/energy-generation` | module-manufacturing | Generating clean energy by investing in advanced technology and systems |
| 3 | `hero/clean-energy-vision` | solar-generation | A vision to building the capacity for India's clean energy needs |
| 4 | `hero/agri-waste` | agri-waste | Converting ~2 million tonnes of paddy waste into clean energy |

Desktop positions per slide are in the prototype's `defaultHeroSlides()` — carry them across as data, not as CSS.

**Behaviour:**

- Cross-fade between slides, 1.1s.
- Ken Burns on the active slide: `scale(1.04) → scale(1.12)` over 9s.
- Headline animates in word by word: `fxWord`, 700ms, 55ms stagger. Re-keyed per slide so it replays.
- Letterbox reveal on first load only: two panels covering the top and bottom halves, `scaleY(1) → 0` over 1s. **First mount only** — not on every slide change.
- Mouse parallax, gated on `(hover: hover) and (pointer: fine)`: image ±10px, symbol ±24px, headline ∓14px, 500ms ease-out follow.
- Autoplay 6s. Pauses on hover, on focus within, and when the section leaves the viewport (`IntersectionObserver`).
- Dots: active dot widens to 34px and fills with `--color-brand-red` over the interval; inactive are 6px.
- Touch: horizontal swipe changes slide. Set `touch-action: pan-y` so vertical page scroll is never captured.

**Responsive:** see `responsive-strategy.md` §4. Below `lg`, per-slide positioning is abandoned entirely — headline bottom-anchored, full width, over a bottom-up scrim; symbol decorative at 12% opacity. The mobile image is a **separate art-directed portrait crop**, not the landscape image with `object-position`.

**Accessibility:** `aria-roledescription="carousel"`, dots are `<button>`s with `aria-label` and `aria-current`, non-active slides `aria-hidden`, autoplay pauses on focus. Slide 1 image has `priority`.

**Reduced motion:** no Ken Burns, no word stagger, no letterbox, no parallax, no autoplay. Dots become plain navigation. The carousel still works — it just does not move on its own.

---

## 2. `<StatsBand>` — `sections/stats-band/`

Server component. **Reused on About Us and the business pages.**

**Props:** `stats: CapacityStat[]`

Full-bleed `--gradient-stats`. Each item: value at `--text-stat` (700, white), a 60×3px `--color-rule` divider, label at `--text-label` uppercase.

- **Delete the prototype's `height: 46.44vw`.** Height is intrinsic; vertical padding is `clamp(40px, 6vw, 96px)`.
- `footnote` renders as a superscript marker with the note below the grid.
- ~~Data is `getCapacityStats()`, not hardcoded.~~ Static since 2026-10-02 — see the amendment under §Route. Current values, SAEL's: 8.3 GWp / 5 GW\* / 3.6 GWp + 5 GW\* / 164.9 MW. Not sael.co's, which differ (`content-model.md` §1.1).
- **Contrast issue:** white 16px uppercase on the red gradient end is ~4.0:1, below AA. Raise in design review — bold it, size it up, or darken the gradient start. Do not ship it unresolved.

Responsive: 4 col → 2×2 at `md` → 1 col below.

---

## 3. `<IntroSplit>` — `sections/intro-split/`

Server component. Generic "layered image + text block" section. **Reused on business pages.**

**Props:** `eyebrow`, `title`, `body`, `cta`, `backgroundImage`, `overlayImage?`

Content: eyebrow "About SAEL", title "Endeavoring to make a sustainable impact", the four-sentence body from the prototype, CTA "KNOW MORE" → `/about-us/`.

The prototype's absolute positioning (`left: 8.13vw; top: 13vw; width: 38vw`) applies at `lg` and above only. Below that it un-stacks into normal flow — image banner, then text. See `responsive-strategy.md`.

Fix: the prototype sets `font-family: 'Inter'` on this CTA. It is DIN.

---

## 4. `<BusinessTiles>` — `sections/business-tiles/`

Server component. Heading "Our Business", then four tiles.

**Props:** `title`, `tiles: BusinessTile[]` where each is `{ icon, title, description, href }`

Content (icon → copy → destination):

1. Solar Energy Generation → "SAEL develops and operates large-scale solar power plants…" → `/solar-energy/`
2. Solar Cell Manufacturing → "Our facilities manufacture high-efficiency solar cells using advanced bifacial TOPCon technology…" → `/solar-cell-manufacturing/`
3. Solar Module Manufacturing → "We produce bifacial solar modules engineered for performance, durability…" → `/module-manufacturing/`
4. Agri Waste to Energy → "We convert agricultural residue into clean energy, reducing stubble burning…" → `/waste-to-energy/`

Full copy is in the prototype; carry it across verbatim.

Notes:

- **The tiles are not links in the prototype but must be.** Each maps to a business page and users will expect to click it. Whole tile is the link target.
- Background shape: use `<TileShape>` from FE-02. **Do not import `rtile-*.svg`** — see `asset-inventory.md` §4.
- Hover: lift 8px, deepen shadow, 280ms.
- Below `md` the fixed `aspect-ratio: 2` is removed and tiles size to content. Verify the chamfered corner survives a tall aspect ratio.

---

## 5. `<PresenceMap>` — `sections/presence-map/`

Server component. Heading "Our Presence" plus the India map.

- Image at `min(42vw, 820px)` above `lg`, full container width below.
- ~~**A list of the states of operation is required at every breakpoint**~~ — the names arrived on **2026-08-27** in `SAEL-Numbers and data.pdf` page 2, and the section now pins all eleven, each with its capacity figures. Every pin carries its state and figures in an `sr-only` span, so the list exists at every breakpoint for assistive technology.
  > **Still open below `lg`, and it is the same point the original bullet made.** The figures are reachable only by hover or focus, and a touch device has neither — the map is a picture with invisible data on a phone. The names being known does not fix that; a visible list or an always-open layout below `lg` is still owed, and is not in this change.
- **Each pin lists one row per legend**: the figure as published, then the legend's name in that business's accent — `Solar IPP Projects`, `In-house Module Assembly Capacity`, `Solar Cell Manufacturing`, `Agri Waste-to-Energy Projects`. The client's map marks these with icons and decodes them in a strip beneath; the client asked on **2026-08-27** for the name in place of the icon, which removes the need for the strip. Colours are the ledger's four accents in their `-deep` variants, because the callout is on paper and the ledger is on black.
- `alt` describes the information, not the picture: "SAEL's operational presence across 11 Indian states".
- See `asset-inventory.md` §6 for the vector-rebuild option.

---

## 6. `<FeatureBanner>` — `sections/feature-banner/`

Server component. Full-bleed image with an eyebrow/heading block above and a gradient caption badge over the image. **Reused as the page hero on business and sustainability pages.**

**Props:** `eyebrow?`, `title?`, `image`, `caption?`

Content: eyebrow "Solutions", title "Embracing Green Energy for a Sustainable World", image `mizoram-solar-plant`, caption "MIZORAM 21MW Solar Plant".

Desktop `aspect-ratio: 3/1`; below `lg`, `4/3` and the caption moves below the image so it never covers the subject.

---

## 7. `<StrengthSplit>` — `sections/strength-split/`

Server component. Two-column: copy left (46%), cut-out engineer image right, bottom-aligned, over `--gradient-wash-strength`.

Content: eyebrow "Our Strength", title "Adoption of clean and affordable energy projects", three paragraphs from the prototype, CTA "KNOW MORE" → `/about-us/`.

Below `lg`: single column, text then image (max-width 420px, centred), wash rotates to `180deg`.

---

## 8. Vision timeline — **two components**

`sections/vision-timeline/index.tsx` is a thin wrapper rendering both, with CSS visibility switching (`hidden lg:block` / `lg:hidden`). Both are server-rendered so there is no hydration flash. **Do not select with a JS media query at the top level.**

Shared props: `title`, `backgroundImage`, `milestones: Milestone[]`

```ts
interface Milestone {
  id: string;
  year: string;
  description: string;
  /** Desktop only: the point on the SVG path this milestone attaches to. */
  anchor: { x: number; y: number };
}
```

Content — title "Contributing to the Vision of Aatmanirbhar Bharat":

| Year | Description | Anchor (1440×1040 viewBox) |
|---|---|---|
| 2018–2021 | Strengthened renewable energy capabilities and expanded the solar and agri waste-to-energy portfolio across India | 188.6, 769.6 |
| 2022 | Entered solar PV manufacturing, and commissioned the first 200 MW facility in Punjab | 532.8, 769.6 |
| 2023 | Secured USD ~145 million in growth equity investment from Norfund (Norwegian Sovereign Fund) and US Development Finance Corporation (US DFC) | 789.1, 600.1 |
| 2024 | Raised USD 305 million through green bond issuance and expanded solar PV manufacturing capacity to 3.4 GW in Rajasthan | 789.1, 374.4 |
| 2026 | Expanded the overall Solar portfolio to 8.3 GWp, WTE installed capacity of 165 MW, commenced construction of an integrated 5 GW solar cell and 5 GW solar PV manufacturing facility in Uttar Pradesh | 1179.4, 179.9 |

### `<VisionTimelineDesktop>` (≥ lg) `'use client'`

- 220vh scroll track containing a `position: sticky; top: 0; height: 100dvh` stage.
- SVG path `M0 770 H745 Q790 770 790 725 V225 Q790 180 835 180 H1440` on a `0 0 1440 1040` viewBox, `preserveAspectRatio="none"`, stroke width 30, `--gradient-timeline` fill, over a `rgba(255,255,255,.10)` track path.
- Path draws via `stroke-dashoffset` driven by scroll progress through the track.
- A glowing spark follows the drawing head, positioned with `getPointAtLength(len * progress)`, converted to percentage coordinates.
- Milestone thresholds are computed once on mount by sampling the path for the point nearest each `anchor`. Milestones fade and scale in as progress passes their threshold.

**Refactor requirements** — the prototype's implementation is not production code:

- `useRef`, never `document.querySelector`.
- One `requestAnimationFrame`-throttled passive scroll listener, cleaned up on unmount.
- Recompute path length on resize, debounced.
- Do not mutate `style` on nodes React owns — drive milestone visibility from state, or use CSS custom properties set on a container.
- Guard `getPointAtLength` — it throws if the path is not laid out yet.

### `<VisionTimelineMobile>` (< lg)

A different component, not a squeezed version:

- Vertical layout. A 3px gradient rail down the left inside `--gutter`.
- Each milestone: dot on the rail, year at `--text-h3`, description beside it.
- Reveal via `IntersectionObserver` as each scrolls into view.
- No pinning, no 220vh track, no path maths, no spark.

**Reduced motion, both:** everything visible immediately, path fully drawn, no spark, no pin.

---

## 9. `<SdgMarquee>` — `sections/sdg-marquee/`

Client component (touch scrolling). Eyebrow "Sustainable Development Goals", title "Our Commitment to the UN SDGs", then the card strip.

Ten cards, official UN colours (see `design-guidelines.md` §1). Each: `#N` numeral, name, a white icon top-right, background in the SDG's colour, `--radius-sdg`. Each links to `/sustainable-development-goals/#sdg-N`.

- **Desktop:** 44s linear infinite marquee, pause on hover, edge mask `linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)`. The duplicated set for the seamless loop is created **in the component's render**, not in the data — and is `aria-hidden="true"` with `tabindex="-1"` on its links.
- **Mobile:** marquee off. Native horizontal scroll with `scroll-snap-type: x mandatory`, hidden scrollbar, momentum.
- Keyboard focus must scroll a card into view and must not loop into the duplicated set.

---

## 10. `<GoalsTriad>` — `sections/goals-triad/`

Server component. Eyebrow "Our Goals", then three cards: Mission, Vision, Ethos — icon, uppercase title, body. Copy from the prototype.

- Resting `--color-inert`, hover `--gradient-goal-hover` over 350ms, square corners.
- **On `(hover: none)` devices, apply the gradient as the resting state** — three grey boxes is not the design.
- Section background `--gradient-wash-goals`.
- 3 col → 1 col below `lg`.

---

## 11. `<NewsGrid>` — `sections/news-grid/`

Server component. **Reused on the Newsroom page.**

**Props:** `eyebrow?`, `title?`, `items: NewsItem[]`, `viewAllHref?`

Eyebrow "In the News". Three cards: image (16:10), `<DateBadge>`, headline, whole card is the link.

- Data from `getLatestNews({ limit: 3 })`.
- Items link to `externalUrl` when present → `target="_blank" rel="noopener noreferrer"` with an accessible new-tab indication.
- `image === null` → the `news/fallback.jpg` placeholder.
- Headline `line-clamp-3`.
- Add a "View all" link to `/newsroom/` — absent from the prototype, but the newsroom is otherwise only reachable from the nav.
- Repository failure or `[]` → `<EmptyState>`. The rest of the page renders.
- 3 col → 2 at `md` → 1 below.

---

## 12. Pixel strip

Full-bleed decorative image, `alt=""`, `aria-hidden`, `max-height: 48px`, `object-fit: cover`.

---

## Acceptance criteria

- [ ] At 1920×1080 the page matches the prototype section for section
- [ ] At 390×844 every section is legible, correctly ordered, and free of overlap
- [ ] `document.body.scrollWidth === window.innerWidth` at 360px
- [ ] The vision timeline renders the desktop version at `lg`+ and the mobile version below, with no hydration flash at either
- [ ] With `prefers-reduced-motion: reduce`, every section is fully visible and static, and the page is fully usable
- [ ] Carousel is operable by keyboard, swipe, and dots; autoplay pauses on hover, focus, and when off-screen
- [ ] Every section component takes typed props and imports nothing from `@/lib/content`
- [ ] Stats and news come from the repository; no hardcoded figures or headlines in components
- [ ] A forced repository failure still renders the full page with empty states
- [ ] Lighthouse mobile: performance ≥ 90, accessibility 100
- [ ] No committed image exceeds 250KB; every `<Image fill>` has `sizes`
- [ ] `axe` scan: zero criticals
- [ ] `pnpm check` passes

## Blocked on

- High-resolution masters for the three news images
- Art-directed portrait crops of the four hero photographs
- Confirmation that the hero photography is final
- Meta description copy
- The list of states for `<PresenceMap>`

## Open questions for design review

1. Stats-band label contrast (below AA at the red end)
2. Whether the chamfered tile shape holds at mobile aspect ratios
3. Date badge CSS rebuild — visual parity with the SVG
4. Whether the mobile hero should be 4:5 or 3:4

## On completion

Move to Done, promote **FE-05**.
