# Frontend Progress Tracker

**This file is the single source of truth for what to build next.** Read `/CLAUDE.md` §3 for the rules governing it.

Rules, in short:

- Exactly **one** item is In Progress at any time.
- Finish it → move to **Done** → promote the top **Pending** item into **In Progress**.
- Tracker changes are committed **in the same commit** as the code they describe.
- Never skip ahead. If the order looks wrong, raise it — do not reorder alone.

Legend: `Reads` = the supporting docs to load for that item (beyond `/CLAUDE.md` and the item's own feature doc).

---

## ✅ Done

| ID | Item | Feature doc | Owner | Completed |
|---|---|---|---|---|
| FE-15 | Sustainable Development Goals | `features/15-sustainable-development-goals.md` | Swapnil Raj | 2026-10-07 |
| FE-12 | Story of Our Influence | `features/12-story-of-our-influence.md` | Swapnil Raj | 2026-10-06 |
| FE-13 | Our Key ESG Metrics | `features/13-our-key-esg-metrics.md` | Swapnil Raj | 2026-10-06 |
| FE-14 | Our Core Beliefs | `features/14-our-core-beliefs.md` | Swapnil Raj | 2026-10-06 |
| FE-09 | Waste to Energy | `features/09-waste-to-energy.md` | Swapnil Raj | 2026-09-19 |
| FE-10 | Module Manufacturing | `features/10-module-manufacturing.md` | Swapnil Raj | 2026-09-19 |
| FE-11 | Solar Cell Manufacturing | `features/11-solar-cell-manufacturing.md` | Swapnil Raj | 2026-09-19 |
| FE-08 | Solar Energy | `features/08-solar-energy.md` | Swapnil Raj | 2026-09-18 |
| FE-07 | Our Team | `features/07-our-team.md` | Swapnil Raj | 2026-09-10 |
| FE-06 | About Us | `features/06-about-us.md` | Swapnil Raj | 2026-09-10 |
| FE-04 | Homepage | `features/04-homepage.md` | Swapnil Raj | 2026-09-10 |
| FE-25 | Design-system reconciliation — guidelines vs. the as-built homepage | `design-reconciliation.md` | Swapnil Raj | 2026-09-10 |
| FE-03 | App shell — header, mobile nav, footer, layout | `features/03-app-shell-header-footer.md` | Swapnil Raj | 2026-08-04 |
| FE-02 | Design system foundation (tokens, fonts, primitives) | `features/02-design-system-foundation.md` | Swapnil Raj | 2026-08-04 |
| FE-01 | Initial project setup | `features/01-initial-project-setup.md` | Swapnil Raj | 2026-08-04 |

### Business Portfolio: the mark centred in the room right of the text (not a tracker item), 2026-10-14

At the client's request, from `md` (768) up the mark in each Business Portfolio row stands
centred in the room to the right of the description, not hung off the row's edge. Below `md`
nothing changed. **Done on the user's instruction**; FE-05 stays In Progress.

**How.** The text column was `flex-1`, so its box always spanned the row and the mark sat at the
far right. From `md` it is `flex-initial`: as wide as its content, which is the description's own
`--ledger-measure` box (46ch) and so the same for every row, and no wider. The mark moves into a
zone that takes all the width the text does not, and centres the mark in it. The zone's floor is
the mark, the gap and the right padding the row had before, as `--spacing-ledger-mark-zone-md` and
`-lg` (the padding is `--spacing-inset` below `lg`, `--spacing-ledger-pad-r` from it). So where the
text has no slack its column is exactly as wide as it was. The row's gap and right padding are 0
from `md`, because the zone counts them.

**What it does by width.** Text, line counts and row heights are unchanged at every width. The
mark moves left about 5–7px from 768 to 1280, because there the description fills the row and the
room right of it is only gap + mark + padding. It moves about 24px at 1440 and 80–92px at 1920,
where the 46ch box leaves real room (L = R: 127px each side at 1920). The client's own 90px trial
in `theme.css` is replaced by this; `--spacing-ledger-pad-r` is back to
`calc(var(--spacing-flow) * 0.7)`.

**"md and lg" is read as the code's own `md:` and `lg:` rules are:** min-width, with no upper cap.
An earlier pass of the same day closed the range at `xl` and changed almost nothing, as the text
has no slack below it. To cap it, add `max-xl:` to the zone and column classes, and `xl:` to the
gap and padding that return.

**One side effect.** The upcoming (Solar Cell) row's panel indents its copy by `--spacing-inset`, so
its mark centres in room that starts that much further right: about 11–12px right of Agri's
below it, at 1440 and above. Below 1280 the two line up, as before.

**Verified** on a production build at 360, 480, 600, 767, 768, 900, 1024, 1180, 1279, 1280, 1440,
1920, comparing the old layout (emulated in the page) with the new, card by card: no re-wrap, no
height change, no horizontal scroll up to 2560. `typecheck`, `lint`, `verify:guardrails` and
`build` are clean.

### Frosted cards on three business sections (not a tracker item), 2026-10-14

At the user's instruction, the outlined cards of Solar Energy's "Our EPC And O&M
Practices", Module Manufacturing's "Manufacturing Prowess" and Agri Waste-to-Energy's
"Benefits of Waste-to-Energy" are frosted glass, so the dot grid does not show behind their
copy. **Done on the user's instruction**; FE-05 stays In Progress. The prompt came from the
Claude-in-Chrome extension; its values are used as given.

**Opt-in.** `<Card frosted>` (outlined, on paper only), reached through `<ValueGrid frosted>`.
Switched on in `app/solar-energy/page.tsx`, `app/waste-to-energy/page.tsx` and, for the
prowess cards only, in `prowess` on `app/module-manufacturing/page.tsx`. Product Downloads
is not a card and is unchanged. The values are tokens in `theme.css`:
`--color-surface-frosted`, `--color-outline-frosted`, `--shadow-frosted-card`,
`--blur-frosted-card` and `--saturate-frosted-card`. The hairline cards (Solar Cell's
Highlights, About Us's principles) and every other outlined card are unchanged.

**A trap, found by measuring.** `<Reveal>` keeps `will-change: opacity, transform` for good,
which makes it a backdrop root, so the cards' blur saw nothing behind them and the dots
stayed fully visible (sd 0.7–0.8 over an empty strip of card). Reduced-motion hides this,
as it drops the hint. The grid's reveal now takes `will-change-auto!` when the glass is
drawn (`<ValueGridLayout>`), and the same strip is uniform. The fade-in is unchanged; the
blur arrives as it settles. See `design-guidelines.md` §4's Card section.

**Verified** on a production build in normal-motion Chrome: exactly 13 cards are frosted
(4 + 3 + 6); Core Beliefs' cards, About Us's, Solar Cell's and Product Downloads are
unchanged; no horizontal scroll at 360, 768, 1024 or 1920. `typecheck`, `lint`,
`verify:guardrails` and `build` are clean.

### Light sections on nine more pages (not a tracker item), 2026-10-14

The client asked for the homepage's mix of dark and light sections on nine more pages.
**Done on the user's instruction**; FE-05 stays In Progress. The fifteen sections now on
`paper-dots` are listed in `design-guidelines.md` §1, next to the homepage's. Every other
section stays dark. Sixteen were asked for. Career's "Career at SAEL" was built light and
then put back to dark the same day, on the user's instruction.

**How.** Each section takes `ground="paper"`. `<ProseSplit>`, `<ValueGrid>` and
`<GalleryGrid>` already had the prop. `<CapabilitySplit>`, `<ProductDownloads>` (and its
layout), `<DownloadsProwess>`, `<StorySplit>`, `<SdgGrid>` and `<BeliefSection>` (via the
belief's own `ground`) gained it. All of them default to `dark`, so no other call site
changes. Each section's eyebrow, heading, copy, rules, card outlines, hover accent and hover
light follow the ground.

**Three things the client has not seen and should approve:**

- **Business headings on paper.** The business pages' headings and eyebrows are in each
  business's ledger ramp. **On trial, on the user's instruction:** the paper sections use
  that same ramp, unchanged, to judge whether it reads before anything is put to the
  client. Solar's and agri's yellow ends are 1.2–1.3:1 on paper. If it does not read, the
  fallback is ready and unused: `--gradient-ledger-*-deep` darkens each stop (hue and
  saturation held) to 4.5:1, which turns those two yellow ends olive (`#827503`,
  `#7c7707`). The switch is described at `business-ramp-*` in globals.css. **Also on
  trial:** a very slight shadow under each business heading on paper,
  `--drop-shadow-heading-paper` (0 1px 1px, ink at 22%), applied by `<DisplayHeading>`.
  It is a `drop-shadow` filter because a `text-shadow` paints over clipped gradient text.
  It gives the pale letters an edge without changing their contrast.
  `business-ramp-*` also carries the paper hover glows, so paper cards keep the
  business's colour.
- **Icons on paper are the coloured no-tile variants** from the supplied set (brand red →
  purple), not the white ones. They are not the business colour. The other choice was the
  white file filtered to black, a one-line change in each marks file. The 34 no-tile files
  newly in use were given the white files' loop edit (`asset-inventory.md` §3).
- **The ESG Report pill** under Our Biodiversity Commitment sits on paper now: a new
  `pillOnPaper` button variant, with the `deep` ramp outline, an ink label and a red hover.

**Verified** on a production build (`next start`, headless Chrome at 1440 × 900 and 360 ×
780): each of the fifteen sections renders on paper and no others do, section heights are
unchanged, and nothing scrolls sideways. `typecheck`, `lint`, `verify:guardrails` and
`build` are clean.

### Module Manufacturing: downloads and prowess as one section (not a tracker item), 2026-10-12

At the client's request, Product Downloads and Manufacturing Prowess are one section,
`<DownloadsProwess>`. Each had been a short screen of its own since the page started snapping.
The datasheets come first, as on the live page, then the cards, `--spacing-section-y-tight`
apart. Neither one's content changed. It composes `<ProductDownloadsLayout>` and
`<ValueGridLayout>`, split out of their sections for it, as Our Key ESG Metrics'
`<ReportingStakeholders>` composes two layouts. `<ProductDownloads>` stays, unused, for any
business page that needs it on its own.

**Verified** on a production build: the merged section fits one screen at 1920 × 1080,
1536 × 864 and 1440 × 900 (650px of content at 1440), and stepping down lands hero, overview,
map, this section, then the footer. At 1366 × 768 and below it is taller than the screen and
scrolls before snapping on (+54px at 1366 × 768). Nothing scrolls sideways at 360.

### Snapping on six more pages (not a tracker item), 2026-10-11

The client asked for the homepage's section snapping on Solar Energy, Module Manufacturing,
Solar Cell Manufacturing, Agri Waste-to-Energy, Career and About Us. **Done on the user's
instruction**; FE-05 stays In Progress. About Us had snapped until the design removed it on
2026-09-10 (see FE-06 below); this puts it back.

**Same mechanism, nothing new in globals.css.** Each page's wrapper carries
`data-snap-sections`, every section takes `snap`, and the footer is the last stop. Seven
sections gained the prop: `<ProjectsMap>`, `<CapabilitySplit>`, `<ValueGrid>`,
`<ProductDownloads>`, `<CtaPanel>`, `<GalleryGrid>` and `<CutoutSplit>`. `<PageHero>` and
`<ProseSplit>` had it already. Every addition is opt-in, so non-snapping call sites (Contact Us,
for one) are unchanged.

**What changed so that sections fit a screen**, all only when snapping:

- **Tight rhythm on every snapping section** unless it passes `spacing`, since the content is
  centred in a screen-tall box. Career's gallery keeps its `closing` padding.
- **Projects map** is capped from `lg` by `--spacing-projects-map`, and the execution
  photograph by `--business-execution-media-w-snap`. Both derive from `--snap-row-max-h`, the
  screen less the tight padding and the heading above the row.
- **Capability lists of four or more** go two-up from `xl` (Solar Cell, Waste-to-Energy). Mark,
  name and copy order and one rule per card are kept, as asked on 2026-09-21. Solar Energy's
  three stay in one column.
- **Waste-to-Energy's six benefits** go 3 + 3 from `xl` (`<ValueGrid columns="thirds">`), not
  4 + 2.
- **Career's "Life at SAEL"** puts its four photographs in one row from `lg`. Two by two was
  1,400px tall at 1920.

**Verified** on a production build (`next start`), measured in headless Chrome. **At 1920 ×
1080 every section on all six pages fits one screen**, and stepping down with the keyboard
lands on each section's top in turn, footer last. At 1440 × 900, Module Manufacturing, Solar
Cell Manufacturing and Career fit throughout. **Still taller than a 1440 × 900 screen**, and so
scrolled through before the next snap: Solar Energy's capabilities (+144px), About Us's guiding
principles (+143), and Waste-to-Energy's benefits (+56), technology (+53) and overview (+3).
Each would need smaller type, narrower cards than the 340px floor, or a reversal of an approved
composition, so they are left for SAEL to choose. Below `lg` most sections are taller than the
screen, as on the 2026-10-06 pages. Nothing scrolls sideways at 360, 768, 1024 or 1280.
`typecheck`, `lint`, `verify:guardrails` and `build` are clean. A real mouse wheel could not be
reproduced headlessly: Chrome snaps synthetic wheel events by end position, as for a trackpad.

### The supplied icon set — as built, 2026-10-08

SAEL supplied 71 icons (`src/assets/icons/<name>/`, each in `animated/` and `static/`, in
white, coloured no-tile and coloured-tile variants). **Not a tracker item, done on the user's
instruction**; FE-05 stays In Progress. Icons 1–71, numbered by their filenames, replace the
marks drawn in code and the lucide stand-ins:

| Icons | Page | Variant | Where |
|---|---|---|---|
| 1–3, 4–11 | About Us | white | Strategic Pillars (`pillar-marks.tsx`); Guiding Principles (`_content/about-us.ts`, replacing the CDN's `principle-icon-1…8`) |
| 12–18 | Solar Energy | white | `solar-marks.tsx` |
| 19–28, 29–31, 32–35 | Waste to Energy, Module, Solar Cell | white | `business-marks.tsx` |
| 36–39 | Our Core Beliefs | white | in the badge, 36 → 40px; the badge's diamond frame is removed |
| 40–47 | Career | white | `career-marks.tsx` |
| 48–50 | Contact Us | coloured no-tile | `<ContactDetails>`, 40px |
| 51–71 | Investors indexes | coloured no-tile | `link-grid/investor-marks.tsx`, by tile slug; `--spacing-investor-mark` (48 → 58, 20% over `--spacing-icon-mark`) |

Each icon in use is a `next/image` file, not SVGR. Each used `-animated.svg` was edited to loop
(3.5s: the 1.5s draw, then a 2s hold). See `asset-inventory.md` §3. The mark components keep
their exported names, so the pages' call sites did not change. A tile added in the admin panel
with no icon of its own takes the "other documents" mark.

**Verified** on a production build: the investor mark measured 48px at 360 and 58px at 1920.
`typecheck`, `lint`, `verify:guardrails` and `build` are clean. **Not yet reviewed at every
width**; the larger Contact Us icon and the investor tiles are the places to look first.

### Client changes of 2026-10-07, and FE-15 — as built

One round of client feedback on the homepage map, the business pages and Our Key ESG
Metrics, which also asked for the SDG page. **FE-15 was worked ahead of FE-05 on the
user's instruction**, the trade FE-07, FE-09 → FE-11 and FE-12 → FE-14 made; FE-05 stays
In Progress.

**Homepage map callouts.** Back to figure left, legend name right, in the business's
`-deep` accent: the Business Portfolio marks of 2026-10-06 are gone (`marks` →
`legend` again), and the 2026-10-06 figures stay. A paired figure names its partner,
"+ Battery Storage" (the client's wording) or "+ Solar Cell Manufacturing". **From `lg`,
where the map sits beside its copy, every row is one line**, and the callout is uncapped.
From `sm` to `lg` the partner wraps under the name. Below `sm` each name drops under its
figure, and the callout is capped at `--map-tip-w-narrow` (184px) so Uttar Pradesh's
stays on a 360px screen. The business pages' maps, legend off, now say "+ Battery Storage"
too, where they showed two bare solar figures for one state.

**Business pages' Projects figures** are the homepage ledger's: Solar Energy
**8.3 GWp** (was 8299.5 MWp), Module Manufacturing **3.6 GWp + 5 GW\*** (was
3625 MW + 5000 MW (proposed)). `ProjectsMapFigure` gained the ledger's superscript `*`.
The ledger's footnote, "Operational · \*Upcoming", was carried under the module figure
for a day and removed at the client's request on 2026-10-08, so the `*` there is
unexplained. Waste to Energy (164.9 MW) already matched. Solar Cell has no figure block,
and none was added. The prose keeps "3.625 GW".

**Our Key ESG Metrics.**

- **Hero**: wheel over copy, centred at every width. The design's three glows are replaced by
  `<BackgroundRipple fade="screen">`, the investor masthead grid, solid across the top half
  and gone at the foot (`--mask-ripple-screen`). The copy is `pointer-events: none`, so
  the grid lights under it. `--spacing-esg-wheel` is capped at 42% of the screen's height.
- **SDGs**: the icon grid is centred, and the label and heading stay left like every other
  section's (the client's call, 2026-10-08). The UN disclaimer and its two links are
  removed, with everything else under the icons. The ten goals are `_content/sdg-goals.ts`
  now, shared with FE-15.
- **Reporting Framework + Stakeholder's Map** are one section, `<ReportingStakeholders>`,
  composing `<ProseSplitLayout>` and the new `<StakeholderMapLayout>`. Our Core Beliefs'
  ESG Report pill sits under the "Reporting Framework" heading. With `copyBeside`, a
  `<ProseSplit>` action now goes in the heading's column. The pill is
  `app/_lib/esg-report-link.tsx`, shared by both pages, and since 2026-10-08 it opens
  `/investors/corporate-governance/sustainability-reports/` in the same tab rather than
  the CY 2023 PDF in a new one.
- **To share one screen**, the beside columns are halves (was 5 : 7, which wrapped the
  heading below 1440), the tree's boxes are 80px (was 104) and its connectors 16/24/24px
  (was 24/36/36), and the section's padding is `--spacing-flow`. It fits one screen from
  1280 × 800 up, and is 25px over at 1366 × 768. On a phone it is taller than the screen,
  as the SDG grid is.

**FE-15, `/sustainable-development-goals/`.** No design exists, so it is built from
existing pieces: `<RippleHero>` (new optional `intro`) with the live page's "UN SDGs" and
its subheading, then `<SdgDetailList>` (`sections/sdg-detail/`). That list renders the live
page's five-column table as one block per goal, `id="sdg-N"` on each. In each block the
UN icon sits beside "SDG N" and the goal's name, and the four cells form a `<dl>` under the
table's own column headings. The copy is the live page's, verbatim
(`_content/sustainable-development-goals.ts`). **Departures from `features/15`**: no
`<PageHero>` (no photograph), and no framing paragraph or figures (SAEL have written
neither). There is no homepage marquee to link from; the links come from Our Key ESG
Metrics.

**Verified** on a production build (`next start`). All ten anchors land under the masthead
on a cold load at 1440 and 360. No horizontal scroll on the homepage, Solar Energy or Module
Manufacturing with any callout open at 1440, 1024, 768 or 360. The ESG sections were
measured at 1024 × 768 through 1920 × 1080. `pnpm lint`, `typecheck`, `verify:guardrails`
and `build` are clean, and both new routes are static (`○`).

**For SAEL:** the UN's guidelines ask for their disclaimer beside the icons, and it is now
on neither page. Also: the old Solar Energy and Module figures recorded in the backend's
`docs/client/static-content-sign-off.md` §4 are superseded by this request.

### FE-12, FE-13, FE-14 — as built, 2026-10-06

The three Sustainability pages, built together to the client's Claude Design project
`6afc516d-b81b-469a-b128-4c5c94d3ffa1` ("ESG Project Pages Setup"), read through the design
MCP. **Worked ahead of FE-05 on the user's instruction**, the trade FE-07 and FE-09 → FE-11
made; FE-05 stays In Progress. As with the business pages, the designs fixed the layout,
and `features/12`, `13` and `14` were not the spec and have not been reconciled to what was
built (differences below).

| Page | Route | Design file | Sections |
|---|---|---|---|
| Story of Our Influence | `/story-of-our-influence/` | `Story of Our Influence.dc.html` | no hero; three `<StorySplit>` stories, one screen each, **snapping** |
| Our Key ESG Metrics | `/our-key-esg-metrics/` | `Our Key ESG Metrics v2.dc.html` | `<EsgHero>` (the animated wheel from `ESG Animated Banner.dc.html`), `<SdgGrid>`, `<ProseSplit copyBeside>`, `<StakeholderMap>`, **snapping** |
| Our Core Beliefs | `/our-core-beliefs/` | `Our Core Beliefs.dc.html` | `<PageHero>` (one photograph; the collage was replaced 2026-10-13), `<BeliefStack>` (one `<BeliefSection>` per belief) with the ESG Report pill, **snapping** |

**New:** `sections/story-split/`, `sections/esg-hero/` (+ `esg-wheel.tsx`),
`sections/sdg-grid/`, `sections/stakeholder-map/`, `sections/belief-stack/`
(+ `belief-section.tsx`). **Opt-ins on shared
pieces, no existing call site changed:** `<PageHero snap>`, `<ProseSplit copyBeside>` and `snap`,
`<Button variant="pill">`, the `gradient-outline` utility, `legacyOrCdnImage()` in
`lib/assets/cdn.ts`. Tokens in `theme.css` (two masks, the ESG wheel's colours, the
belief accents, the collage scrim); the wheel's keyframes in `animations.css`, still state
first; `story-title` added to `cn()`'s font sizes.

**Copy** is the designs', which their handoffs record as the live pages' word for word. It
was spot-checked against the legacy HTML and matches. Two exceptions, both for SAEL:
the story eyebrows "Community", "Biodiversity" and "Public Health" are the designer's
suggestions, and the UN disclaimer and two links under the SDG icons are the UN's
wording, which its icon guidelines ask for on the same page.

**Assets.** The ten SDG icons are the UN's official colour files, downloaded from un.org and
committed under `src/assets/images/sdg/`. Every photograph is the live page's own file,
read from the legacy site while `LEGACY_ASSET_BASE_URL` is set and from
`web-assets/media/story-of-our-influence/` or `…/our-core-beliefs/` once it is unset.
**Neither folder is uploaded yet.** Alt text was written from the images. The design's
alt for `in-4.webp` ("a family in their village") was wrong: it is a power plant.
*Since 2026-10-08:* both folders are uploaded, each file renamed for its section
(`community.jpg`, `environmental-stewardship.webp`, `new-our-core-beliefs-hero-1.webp`
and so on). Each file was checked against its legacy original: the dimensions match, and
the cut-outs keep their alpha. Both pages read them through `cdnImage()`, and
`legacyOrCdnImage()` is removed. The ten SDG icons were uploaded the same day to
`web-assets/media/sdg/goal-NN.png`, byte-identical to the committed files, which are
deleted. `_content/sdg-goals.ts` describes them with `cdnImage()`, and `<SdgGrid>` and
`<SdgDetailList>` draw them through `<MediaFrame>`, which shows a placeholder when the
container is unset.

**Where the build departs from the design or the feature docs:**

- **ESG Report link.** The design's `/report/sael-esg-report-cy-2023.pdf` answers **404**
  on sael.co. It links the same file (8,143,097 bytes) at its investor-documents path
  instead. A later CY 2024 report exists, and which one to link is SAEL's call.
  *Settled 2026-10-08:* it links the Sustainability Reports page, which lists both.
- **No metrics on Our Key ESG Metrics.** The live page reports none and the design adds
  none, so FE-13's `<EsgMetricsSection>` and `getEsgMetrics()` are not built. `EsgMetric`
  stays specified in `content-model.md`.
- **FE-12's `<ImpactGrid>`, FE-14's `<HighlightGrid>` reuse and Mission/Vision/Ethos:**
  none of them is in the designs. `<BeliefStack>` is FE-14's one new section, and a
  `<HighlightGrid>` card cannot hold a cut-out, a checklist and an accent.
- **No breadcrumbs or breadcrumb JSON-LD**, as on every inner page since 2026-09-17.
- **Story of Our Influence has a visually hidden `<h1>`**, because the design draws no hero.
  It snaps through the homepage's `data-snap-sections`. The design's request for
  `proximity` on phones was not added: `mandatory` already lets a story that is taller
  than the screen scroll freely (see globals.css).
- **The SDG tiles link to `/sustainable-development-goals/#sdg-N`.** Those anchors land
  only once FE-15 builds that page.
- The SDGs are drawn as the design's grid option, not its carousel.
- **All three pages snap, as the homepage does** (the client's call, 2026-10-06), through
  the same `data-snap-sections` mechanism, footer last. The designs draw Key ESG Metrics
  and Core Beliefs as scrolling pages, so two things were tightened to make each section
  one screen at 1440 × 900 and 1920 × 1080. Each belief card is its own section, with the
  copy taking 7 parts to the cut-out's 5 from `lg`, so every belief's name holds one line
  (the design's even split put each name on two), and with a tight rhythm. The SDG
  section has a tight rhythm and its icon grid is capped at `--sdg-grid-w` (icons about
  190px rather than 224–300). Checked by scrolling each page in headless Chrome: every
  stop lands on a section's top at both sizes. On a phone the SDG grid and the belief
  cards are taller than the screen, and scroll inside before snapping on.

**Verified** on a production build (`next start`) at 360 / 768 / 1024 / 1440, captured
with reduced motion and again with motion for the wheel. None of the routes scrolls
horizontally, every image loads, there is one `<h1>` per page, and each route is static
(`○`). `pnpm lint`, `typecheck`, `verify:guardrails` and `build` are clean. Not measured:
FE-12's 600KB mobile image budget.

**For SAEL:** the three eyebrows, the CY 2023 / CY 2024 report choice, the alt text, and
higher-resolution files for the three hero collage photographs. Those are 600px wide and
are drawn at about 480 × 740.

### Fix: proxy rewrites left the server behind nginx (not a tracker item), 2026-10-05

On prod2-preview every Live Preview link and every missing article or tile answered `500`
(`Failed to proxy https://localhost:3000/… EPROTO wrong version number`). Reproduced locally
against the standalone server with `HOSTNAME=127.0.0.1` and nginx's `Host` and
`X-Forwarded-Proto: https`.

- **Cause.** Next 16.3 treats a proxy rewrite as internal only when its origin equals the router's
  own, built from `HOSTNAME` (`127.0.0.1`). It shows the proxy every loopback host as `localhost`,
  in `request.url`, `request.nextUrl` and its clones alike, so the origins never matched and every
  rewrite was proxied out, over TLS when nginx said `https`. Over plain HTTP the server proxied the
  request back to itself, which is why no local run caught it. `nextUrl.clone()` fails the same way.
- **Fix.** The proxy marks the request (`x-sael-internal-rewrite`) and a `beforeFiles` rewrite in
  `next.config.ts` routes it: `src/lib/routing/internal-rewrites.ts`. Its destination is a path, so
  it stays internal whatever the host or protocol. The handler takes the preview page from its
  URL's own path, which a config rewrite leaves as the original.
- **Check.** `pnpm verify:guardrails` check 9 fails on any `NextResponse.rewrite(`/`.redirect(`
  under `src/` and on a URL built in the proxy from the request's origin.
- **Only behaviour change:** a client that sends `x-sael-internal-rewrite` itself on a path the
  proxy does not handle gets a `404` (`private, no-store`) for its own request.

### Live Preview: the other seven sections (not a tracker item), 2026-10-05

**For SAEL's internal testing from 9 October.** FE-05 stays In Progress and untouched. Every Live
Preview button in the panel now opens a page. Before this, all but Press Release went to a 404.

- **Pages.** In The News, Our Views (+ articles), Multimedia, Offer Documents, Corporate
  Governance, Financials & Reports (+ each tile) and Notifications. Each route file is a few
  lines around `newsroom/_lib/preview-pages.tsx` or `investors/_lib/preview-pages.tsx`, which
  render **the live route's own component**. Two were extracted for that: `<AreaIndex>`, from the
  three investor index pages, and `<NotificationsPageBody>`. The 13 live pages touched were
  checked before and after on a production build, and their `<main>` is byte-identical.
  `api-contracts.md` §6.3 has the table.
- **Investor previews.** `type`/`section` is sent on every preview fetch. Headings, empty headings
  and the unheaded group render exactly as live. Gated tiles show the disclaimer. Their URLs come
  through `investors/preview-actions.ts`, which reads the tile with the reviewer's session.
  `TilePage` takes its gate actions as a prop, live by default.
- **Incomplete records are shown, not dropped.** A preview record that fails the live schema or
  mapper is listed in the banner with what it lacks ("Missing a link"), its heading and its
  state. So is a tile with no page on the site. Live behaviour is unchanged.
- **Consistency check.** `pnpm verify:guardrails` check 8 fails unless the registry, the route
  files and `proxy.ts`'s matchers agree, and every preview page is `force-dynamic` with no
  `revalidate`. It is proved against seven kinds of drift.
- **Verified through the panel** on a standalone production build against the local backend.
  A draft in each of the seven sections was created and opened with Live Preview. Other checks:
  the DRHP gate, then I Confirm, opened a draft PDF from a SAS URL (`200 application/pdf`); a
  `file: null` link and a document with no file both render; General Meeting's empty "Postal
  Ballot" and the unheaded group render; a link for one section opened on another is refused,
  naming both; YouTube and hosted Multimedia drafts play. Every preview route answers `noindex`
  in the header and the HTML, `no-store`, and is `ƒ` in the build.
- **Backend findings, not fixed here:** preview gives a published, never-promoted file a working
  SAS URL where live sends `file: null` (`api-contracts.md` §5.1). The doubled `pt` was not seen.

### Live Preview: the token exchange and `/newsroom/press-release-preview/` (not a tracker item), 2026-10-04

**For SAEL's internal testing from 9 October.** FE-05 stays In Progress and untouched. The admin
panel's Live Preview button sent reviewers to `-preview` URLs that all 404'd.

- **Exchange.** `src/proxy.ts` rewrites a real page load carrying `pt` to
  `src/app/api/preview/route.ts`. The handler spends the **first** `pt` (the panel still sends it
  twice), sets `sael_site_preview` (`HttpOnly`, `Lax`, `Secure` in production, `Path` = the
  preview page) and answers `303` to the same path without `pt`. Refusals come back as
  `?preview=…` and the page explains them. `api-contracts.md` §6.3 has the details.
- **Pages.** `/newsroom/press-release-preview/` and `/[slug]/` are `force-dynamic` (the build
  marks both `ƒ`). They render the live routes' own components. `NewsListingPage` was split into
  the live loader and a pure `<NewsListing>`; `<NewsArticlePage>` already took its data as a
  prop. Three presentational differences: `<PreviewBanner>`; images `unoptimized`, so a signed
  draft image never enters `/_next/image`'s cache; and `noindex` in the metadata plus
  `X-Robots-Tag` from `next.config.ts`. Copy: `app/_content/preview.ts`, functional, for SAEL to
  review.
- **Repository.** `startPreviewSession`, `getNewsPreview` and `getNewsArticlePreview` were added
  to the interface and to both adapters. In the mock, the link `mock:NEWS_PRESS_RELEASE` opens a
  preview. `ApiClient` takes a bearer and refuses one on any cached request.
- **Verified through the panel.** Signed in as the maker, created a draft with a newly uploaded
  image, and clicked Live Preview. The draft rendered under the banner, its image a SAS URL to
  the private container. A published article's rendered `<main>` is identical live and in
  preview, apart from the banner, the image's source attributes and the in-preview link.
- **Backend defects found, not fixed here:** the doubled `pt`; the media picker invalidating
  the panel form's CSRF token (any save after choosing an image is a 403); local
  `preview.site.base-url` defaulting to `https://www.sael.co`.

### Correction: SAEL's homepage capacity figures restored (not a tracker item), 2026-10-04

**Backend row 5.24, frontend side.** FE-05 stays In Progress and untouched.

- **What went wrong.** The 2026-10-02 entry below replaced the homepage's capacity figures with
  sael.co's, on the reasoning that the live site was the source of truth. **That reasoning was
  wrong.** The figures we held had been supplied by SAEL after their own review, and were set on
  2026-10-01 in `5494e70`. sael.co is SAEL's *previous* website. The new site's reviewed content is
  what https://sael-dev.vercel.app/ shows. **So the change reverted SAEL-supplied content to their
  old website's content.** That is now undone.
- **Restored from git, not retyped.** The strings were copied by script from
  `HEAD:src/lib/content/mock/data/capacity-stats.json` (blob `d2b64f4`) into `value` and
  `footnote` on each row of `businessTiles` in `_content/homepage.ts`. They were checked
  byte-for-byte against that blob: 8 of 8 strings identical, and the row order matches.

  | Row | 2026-10-02 (sael.co) | Restored (SAEL's) |
  |---|---|---|
  | Solar Energy Generation | `8299.5 MWp` / no note | `8.3 GWp` / Contracted & Awarded (Solar IPP & BESS) |
  | Solar Cell Manufacturing | `5000 MW+ (proposed)` / no note | `5 GW*` / \*Upcoming |
  | Solar Module Manufacturing | `3625 MW + 5000 MW (proposed)` / no note | `3.6 GWp + 5 GW*` / Operational · \*Upcoming |
  | Agri Waste-to-Energy | `164.9 MW` / no note | `164.9 MW` / Operational |

  The repository method and the JSON fixture stay removed; only the content is restored.
- **Labels were not touched, and they match sael-dev.** That covers the "Business Portfolio"
  eyebrow and the four row titles. All are identical to `HEAD`. sael-dev.vercel.app's homepage,
  read on 2026-10-04, shows the same eyebrow, titles, figures, notes and descriptions as the
  restored build.
- **Verified.** A `next build` (mock) prerendered the homepage with exactly sael-dev's Business
  Portfolio text and none of sael.co's figures. `tsc --noEmit` and `eslint .` are clean.
  `verify:guardrails` passes 18 of 18 under Node 24. It fails its env checks under Node 20, which
  is below the `engines` floor.
- **Audit of the rest of the 2026-10-02 change.** The board (10), committees (6, 30 rows) and team
  (17) were compared by script with the deleted `HEAD` fixtures: every field and the order are
  identical. Every name, designation, biography, committee row, column heading and LinkedIn link is
  also on sael-dev. No other value in that change moved toward sael.co. Its new `our-team.ts`
  comment had named sael.co as the roster's source; that comment is corrected.
- **Elsewhere, recorded and not changed.** These are display copy taken from sael.co *at build
  time* in FE-08 to FE-11, on the client's instruction of 2026-09-18 ("the screenshot fixes the
  structure and the live page fixes the copy"):
  - the `/solar-energy/` figure `8299.5 MWp` and its "How We Reduce Cost?" label;
  - the `/module-manufacturing/` figure `3625 MW + 5000 MW (proposed)`;
  - the dropped cell-manufacturing figure;
  - the "Why Waste-to-Energy?" casing.

  sael-dev shows all of them as built. The two figures now disagree with the homepage's, and the
  sign-off list asks SAEL about that. The comments and feature docs that state "the live page wins
  on content" as a principle predate rule 8. They were listed in the 2026-10-04 report, and were
  reworded later that day. Each now reads as SAEL's instruction of 2026-09-18 for the four business
  pages, which still stands for them, rather than as a general rule: the four `_content/` files, the
  four page files, and feature docs 08 to 11. In the same pass, the nav, the footer, Waste to
  Energy's name and feature doc 03 stopped claiming to match the live site. SAEL changed those
  labels on 2026-10-01.
- **Rule recorded** in `/CLAUDE.md` §2 rule 8 and `content-model.md` §1.1. For display copy, the
  authority is SAEL's reviewed content for the new site, not sael.co. sael.co is the source only
  for migrated records and slugs. "The live site says X" is not grounds for changing display copy.

### Board, committees, team and capacity figures as static content (not a tracker item), 2026-10-02

**Backend row 5.24, frontend side.** FE-05 stays In Progress and untouched.

- **Before.** The four read through `getContentRepository()`, and the API adapter's methods
  threw `NotImplementedError`. A `CONTENT_SOURCE=api` build, which production runs, rendered Board
  of Directors, Board Committees and Our Team as empty states, and the homepage ledger without its
  figures.
- **After.** Static content, the pattern every other page uses: `boardMembers` and
  `boardCommittees` in `_content/corporate-governance.ts`, `ourTeamMembers` in `_content/our-team.ts`,
  and each figure as `value` on its row of `businessTiles` in `_content/homepage.ts`.
  `getBoardMembers`, `getBoardCommittees`, `getTeamMembers` and `getCapacityStats` are gone from the
  interface and from both adapters, along with their four fixtures, their types in
  `lib/content/types.ts` (`TeamMember` and `TeamGroup` moved to `team-grid/types.ts`), the empty
  states that only a failed fetch reached, and `investors/_lib/governance.ts`. `content-model.md` §1
  now says what decides static versus repository.
- **Checked against sael.co's HTML first, field by field, script against script.** The board
  (10: name, designation, bio, order), committees (6, 30 rows: name, category, role, order) and
  team (17: name, designation, tab, bio, LinkedIn, order) fixtures **were real and verbatim**. The
  only differences were `&` against `&amp;`, which render the same. No invented name was ever
  published. Neither governance page shows a DIN or a photograph. **The capacity fixture was not
  the live site's**: `8.3 GWp`, `5 GW*`, `3.6 GWp + 5 GW*` with "Contracted & Awarded (Solar IPP &
  BESS)", "Operational" and "*Upcoming", changed on 2026-10-01 in `5494e70` with no recorded
  source. On the developer's instruction it is now the live homepage's Business Portfolio block,
  verbatim: `8299.5 MWp`, `5000 MW+ (proposed)`, `3625 MW + 5000 MW (proposed)`, `164.9 MW`, no
  footnotes. The homepage now reads 8299.5, as the live site does, which settles FE-08's
  8299-versus-8299.5 note for the homepage. SAEL confirm the figure through the sign-off list.
  **⚠ Wrong, and undone on 2026-10-04 — see the correction entry above.** The capacity fixture
  held SAEL's own reviewed figures. sael.co is their previous website. This bullet replaced
  SAEL-supplied content with the old site's.
- **Portraits.** The seventeen are in the blob container at `web-assets/media/our-team/` and are
  byte-identical (SHA-256) to the live `/img/team/` files. Nothing points at the legacy site. The
  container is the agency's account today: backend cutover checklist §1.12 copies `web-assets/` to
  SAEL's and rebuilds. Our Team is now fully prerendered, so its portrait URLs are fixed at build.
- **Verified by rendering, in both modes.** `CONTENT_SOURCE=api` against the running backend, then
  `mock`. Each build was served, and every field of the four surfaces was parsed out of the HTML
  and compared with the live extraction. All 17 portraits were fetched through `/_next/image`
  (200, `image/*`). Pages were screenshotted at 1440 and 360. Same result in both modes.
  `pnpm typecheck`, `lint`, `verify:guardrails` and both builds clean.
- **Open, for the client.** The sign-off list (backend `docs/client/static-content-sign-off.md`)
  is to be sent to SAEL. At full ledger size, "(proposed)" wraps onto its own line; the live site
  sets it small and lowercase. That is a design call, and it was not changed here.

### Release packaging, Node floor and the noindex gate (not a tracker item), 2026-10-02

**`pnpm package` could not produce an archive. It now does, and the archive has been extracted and
run.** FE-05 stays In Progress and untouched.

- **Cause.** Turbopack writes `.next/node_modules/postcss-9745a0d11e3197ae -> ../../node_modules/postcss`,
  a relative link that the server chunks `require` by that hashed name (`postcss` is a Next
  server-external package, and `sanitize-html` requires it). `package-release.mjs` copied the
  standalone tree with `fs.cp`, whose default (`verbatimSymlinks: false`) rewrites a relative link
  as an absolute path to the source, so the staged link pointed back into the build machine.
  The step-5 guard then refused every symlink. **Fix:** copy with `verbatimSymlinks: true`. The
  guard now refuses only links that are absolute, dangle, or resolve outside the archive. The
  link is required: with it pointing outside the tree, the first re-render after a publish
  returns 500 with `Cannot find module 'postcss-9745a0d11e3197ae'` while the webhook reports 200.
- **Verified end to end** with a clean build against the running backend (`CONTENT_SOURCE=api`),
  `--strip-components=1` extraction into a stand-in `/var/www/sael-web`, and `node server.js`.
  This was run on macOS (Node 24.19) and on Linux with GNU tar (Node 24.21 and 22.23.3, as a
  non-root user owning only `.next`). It listens on 127.0.0.1 only, serves pages, re-renders
  through the link after a signed webhook, and writes its page, fetch and image caches under `.next`.
- **Built on a Mac, the archive has no Linux `sharp`.** On the VM, Next then serves images
  unoptimised and logs nothing. Releases must be built on the VM's OS and CPU (`architecture.md` §8).
  macOS tar's `com.apple.provenance` xattrs, which made GNU tar print 5,310 warnings, are now left out.
- **Node.** Nothing declares or uses anything newer than Node 22: `sanitize-html` needs ≥22.12 at
  runtime, pnpm 11 needs ≥22.13 and `lint-staged` ≥22.22.1 to build. `engines: >=24` is policy.
  `DEPLOY.txt` and `architecture.md` §8 now say Node 24 LTS, not 25, which reached end of life in June 2026.
- **The noindex gate is announced.** See `accessibility-and-seo.md` §4. §4.1 lists the edits if SAEL
  choose the apex. The canonical host is unchanged.

### Deployment — systemd, nginx and HSTS (not a tracker item), 2026-10-02

**Brought in line with the deployment facts sent to SAEL's infrastructure team on 2026-10-02.**
FE-05 stays In Progress and untouched. The backend's rows are 5.25–5.27.

- **systemd, not PM2.** The site runs as one systemd-managed `node /var/www/sael-web/server.js`
  process, with no flags and environment file `/etc/sael-web/sael-web.env`, which sets
  `HOSTNAME=127.0.0.1` and `PORT=3000`. `ecosystem.config.cjs` now throws, so `pm2 start` fails
  with the reason. It stays in the repo because `package-release.mjs` copies it into the archive.
  `DEPLOY.txt`, the README, `CLAUDE.md` §7 and `architecture.md` §8 say so. **Still one process:**
  each holds its own page cache, so a second one serves stale pages after a publish while the
  webhook reports success.
- **`deploy/nginx.conf.sample` rewritten** as the reference for what was sent: one server block in
  front of both applications, an eleven-row route table with `^~` on rows 1–10, `/admin/`'s upload
  limits, and nginx owning `Strict-Transport-Security` (no `includeSubDomains`, no `preload`).
  Neither application sends HSTS. Tested on nginx 1.24 with stub upstreams. The old
  `/_next/static/` block is gone, because Next 16 sets that `Cache-Control` itself.
- **Recorded where provisioning reads it:** the build prerenders whatever `CONTENT_SOURCE` the
  build machine has, so a production build comes after the backend's content import and is made
  with `CONTENT_SOURCE=api`. And `NEXT_PUBLIC_SITE_URL` is compiled in, so moving the host is a
  rebuild (see Blocked).

### Client trial — Aceternity hover light (not a tracker item), 2026-09-25 → 29

**On `feat/about-us-aceternity-trial`, for the client to judge; not merged.** FE-05 stays
In Progress and untouched. If the client declines, the branch is dropped; if they accept,
it merges as it stands. Two unrelated fixes rode along and should ship either way.

- **Every card of each idiom lights on hover**, applied once in `ui/card.tsx`: an outlined
  card gets Aceternity's *Background Gradient* (`ui/background-gradient.tsx`), an accented
  hairline card their *Dotted Glow Background* (`ui/dotted-glow-background.tsx`). Both are
  ported from the registry source rather than installed — Aceternity is copy-in, not a
  package — so no `motion` dependency: the gradient's pan is CSS, the dots a canvas client
  leaf that only runs while lit. Recoloured to the brand's bright ramp, hover-only where
  theirs is always on, and still under reduced motion. The CTA panel is exempt
  (`hoverEffect={false}`) — it has `<GlowFrame>` already.
- **Intensity** is `--bg-gradient-intensity` and `--dotted-glow-intensity` in theme.css
  site-wide, or `<Card hoverIntensity>` per card (the homepage business rows take 0.3).
- **Touch screens light a card on tap** (`ui/touch-light.tsx`): a second tap, a tap on
  another card, or any touch elsewhere puts it out; a scroll never lights one. The card
  accent fills on the tap as it does on hover.
- **Overflow**: the gradient's bloom reaches past the viewport on a phone, so `<ValueGrid>`
  (outlined) and `<ProseSplit>` (with an aside) clip `overflow-x`. Verified no horizontal
  scroll on the eight card-bearing routes at 360 / 768 / 1024 / 1920.

**Fixes carried on the same branch, independent of the trial:**

- **Careers scrolled sideways by 20px at 360.** `<GlowFrame>`'s halo reaches
  `--glow-halo-radius` past the CTA panel; `<CtaPanel>`'s section now clips `overflow-x`.
- **The mobile hamburger was focused on every page load**, ring and all, until the first
  tap. `mobile-nav.tsx`'s return-focus effect ran on mount and took the initial closed
  state for a close. It now returns focus only after a real open → close.

### FE-09, FE-10, FE-11 — as built

The three remaining business pages, built together on 2026-09-19 on the FE-08 template,
**worked ahead of FE-05 on the client's instruction** — the same trade FE-07 made. As
with FE-08: the client's reference screenshots fixed the layout, the live sael.co pages
fixed every word, and `features/09`, `10` and `11` were not the spec and have not been
reconciled to what was built. Nothing new was minted; the four pages share
`<PageHero>`, `<ProseSplit>`, `<ProjectsMap>`, `<CapabilitySplit>` and `<ValueGrid>`,
and three of those grew an opt-in to fit.

| Page | Route | Sections | Figure |
|---|---|---|---|
| Waste To Energy | `/waste-to-energy/` | all five — 11 plant pins, 4 technology entries, **6** benefit cards | `164.9 MW`, agri accent |
| Module Manufacturing | `/module-manufacturing/` | five — no "how do we work?" list on the live page or in the screenshot, but a "Product Downloads" list between the map and the cards; 3 state pins, 3 prowess cards | `3625 MW + 5000 MW (proposed)`, module accent |
| Solar Cell Manufacturing | `/solar-cell-manufacturing/` | four — 1 pin, 4 unheaded highlights, no cards | **none** — see below |

**What the shared sections gained, all opt-in so FE-08 is untouched:**

- `<ProjectsMap>` — `figure` is optional, and `business` picks the figure's accent from
  the four `--color-figure-*-bright` tokens so each page's number takes the colour its
  business has on the homepage ledger.
- `<CapabilitySplit>` — `name` is optional; Solar Cell's four highlights are a mark and a
  sentence each, on the live page and in the screenshot.
- `<ValueGrid>` — `name` is optional and `ordinal` renders a numeral above the copy.
  Module's prowess cards were "01 / 02 / 03" over a sentence until the client dropped
  the numerals on 2026-09-21; they are now a mark and a sentence, and no page sets
  `ordinal`. The prop stays.
- **`sections/product-downloads/`** — the one new section, added 2026-09-21 (below).
- **`value-grid/business-marks.tsx`** — seventeen drawn marks, same idiom and same
  instruction as `solar-marks.tsx`.

**Where the screenshots and the live pages disagree, the live page won:**

- Waste To Energy has **six** benefit cards, not the screenshot's four identical
  placeholders, and casts its label "Why Waste-to-Energy?" and heading "Benefits of
  Waste-to-Energy" with a lower-case "to".
- Module Manufacturing's portfolio figure is on the live page and not in the screenshot;
  it is carried. Its `<title>` is `Module Manufacturing - SAEL` with a hyphen, as
  transcribed — FE-22's separator question again.

**Deliberately not built, flagged for the client:**

- **Solar Cell's "5 GW / Portfolio" figure.** The screenshot draws it; the live page has
  no such block — 5 GW appears only in the paragraph and on the pin, and the word
  "Portfolio" nowhere on that page. /CLAUDE.md §2 rule 3 forbids adding the caption, so
  the section renders without a figure. One line restores it once the client confirms.
- **"More Details" links** on three pins (Punjab, Ferozepur, Jaitu) point at
  project-detail pages the new site does not have. Only "Visit Location" is carried.

**Client feedback of 2026-09-21, applied across the four business pages:**

- **Module's "Product Downloads" is built after all.** The client asked for the block
  back, linking to the PDFs where they are today. `sections/product-downloads/` is a
  heading over a `<ul>` of the investor pages' `<DocumentLink>`, which gained a
  `ground="dark"` variant for it (paper stays the default; the investor pages are
  untouched). Two columns from `lg` — heading left, list right — because a three-row
  list capped at the measure left the right half of a 1920px section empty. The hrefs
  are composed on `PRODUCTION_URL` + `/documents/product-downloads/…`, and **they
  become 404s the day the new site takes over www.sael.co** unless the three files are
  moved to blob storage first; the note beside `moduleDownloads` says so. A cutover
  task. The dark variant is on `/dev/design-system` under the DocumentLink entry.
- **Module's prowess cards lost their numerals** — see the `<ValueGrid>` note above.
- **`<CapabilitySplit>` rows** — one rule per row and none under the last (they were
  `inset="block"` with a closing rule: four lines around three cards), the same
  hover accent the guiding-principle and team cards fill across their hairline, and
  the mark above the heading rather than below it, matching the value grid on the
  same page. All three pages that draw the section follow.
- **The map pins' pulse** was hard to see; its radius is now `--map-ping-scale` in
  theme.css, the one place to tune it, read by `saelPing` in animations.css.
- **The artwork moved to blob storage.** Solar Energy's two photographs and hero video,
  and Module Manufacturing's photograph and video, are described by `cdnImage()` /
  `tryBlobUrl()` against `AZURE_BLOB_BASE_URL`; the two `.webp` files that had been
  committed under `assets/images/solarEnergy/` for three days are gone. The two shape
  masks stay in the repo. With it, the media caps and `sizes` hints were renamed from
  `solar-*` to `business-*`, since all four pages share them, and `<ProseSplit>`
  split its `mask` prop into `frame` (the box) and `mask` (the clip) so a pre-shaped
  export can skip the clip.
- A pointer-tracking spotlight on `<Card>` (after reactbits' SpotlightCard) was built,
  reviewed and withdrawn the same day. Nothing of it remains in the tree; if it is
  wanted later it is a client-leaf primitive and a handful of theme tokens.

Still open:

- **Artwork.** Every hero poster is still `null` with a `pending` name. Solar Cell
  Manufacturing has no supplied media at all; the other three carry what the client
  has uploaded so far.
- **Meta descriptions** — all three live pages ship an empty one. `{{TODO: content}}`.
- **Pin coordinates are fitted, not measured**, as on FE-08. Waste To Energy's Punjab
  cluster (Ferozepur, Jaitu, Channu) and its **two Bikaner pins** — the live page lists
  Bikaner 14.9 MW twice with different map links, so both are carried a few units apart
  — want an eye first.
- `features/09`, `10` and `11` want rewriting to the as-built.

### FE-08 — as built

Built to **the client's reference screenshot** for layout and to **the live
https://www.sael.co/solar-energy/** for every word, on the client's instruction of
2026-09-18 that the screenshot fixes the structure and the live page fixes the copy.
`features/08-solar-energy.md` was not the spec for this build and has not been
reconciled to it; the page is the first business page and the first to take the
`<PageHero>` opening with a **video** behind it.

| # | Section | Component | State |
|---|---|---|---|
| 1 | Hero — "Solar Energy" over a looping video | `sections/page-hero/` | **Extended.** Optional `video`; the photograph becomes its poster and the reduced-motion still |
| 2 | Overview — copy beside a masked photograph | `sections/prose-split/` | **Extended.** Optional `eyebrow`, and `media.mask` + `media.sizes` for a designer-supplied shape |
| 3 | Projects — dotted India map, copy, portfolio figure | `sections/projects-map/` | **New.** Composes `<PresenceMapFigure>` beside two paragraphs and a `<CountUp>` |
| 4 | How Do We Work? — three capabilities beside a masked photograph | `sections/capability-split/` | **New.** Hairline `<Card>` rows, closing rule, mask2 on the artwork |
| 5 | How We Reduce Cost? — four practice cards | `sections/value-grid/` | Reused, `variant="outlined"` |

**The map was extracted, not forked.** `sections/presence-map/map-figure.tsx` is the
dotted India artwork, its pins and their callouts, lifted out of `<PresenceMap>` so the
homepage and this page share one implementation; `<PresenceMap>` composes it and renders
identically. A `legend` flag turns off the business name in the callout, which on a
solar-only map would repeat the page's title beside every pin. **A pin with an `href` is
now a real `<a>` to that location in a new tab** — the live page links fourteen of its
twenty-three sites to Google Maps, and until this the "Visit Location" line rendered as
text with nothing behind it. The pins remain the map's text equivalent: every site name
and capacity is real DOM text on a focusable control, in document order.

**Twenty-three site capacities, transcribed as the live page publishes them**, from
Kurnool (Andhra Pradesh) 2707 MW down to Assam 1 MW, including the live page's own
spellings ("Karnatka", "Nagamangla", "Gr. Noida"). Coordinates are fitted through the
homepage's eleven state pins rather than measured, as those were; the three "Other
Locations" entries sit near their state centroid; Khavda was clamped inward from the
artwork's western edge. **The pins want an eye before this ships.**

Landed alongside it:

- **`ui/video-frame.tsx`** — a silent, looping, inline-autoplay `<video>` over a
  `<MediaFrame>` poster, decorative by contract and `aria-hidden`. `autoPlay` cannot be
  gated by a media query in markup, so the client leaf decides: the poster is rendered on
  the server and for anyone preferring reduced motion, and the video mounts only once
  the preference is known to allow it. The file lives in the blob container at
  `web-assets/media/solar-energy/patiala-project.mp4`; only the path is committed.
- **`--mask-solar-overview` and `--mask-solar-execution`** in theme.css — the client's
  `solarEnergy/mask1.svg` and `mask2.svg` carried as alpha masks, the same idiom
  `intro-split` and `endeavour-split` use, with `--aspect-solar-*` from their viewBoxes
  and `--solar-*-media-w` caps (704 / 544) wider than the prose split's own, at the
  client's request of 2026-09-18 — the notched shapes read smaller than a plain
  photograph in the same box. `image-sizes.ts` carries matching hints.
- **`value-grid/solar-marks.tsx`** — seven line-art marks drawn in the `pillar-marks`
  idiom, at the client's request rather than waiting on artwork: a ticked clipboard, a
  gauge, a site pin, two people, a ticked calendar, a pylon, a monitor with a trend line.
  Any one swaps for a supplied file by replacing its line in `page.tsx`.
- **`web-assets/images` → `web-assets/media`**, everywhere, following the client's
  rename of the container folder on 2026-09-18. The About Us artwork and the seventeen
  team portraits resolve from the new prefix; the base URL is unchanged.

**Departures from the reference screenshot, all deliberate:**

- Its four identical EPC cards are placeholder art; the live page's four distinct cards
  are built.
- Its boardroom hero photograph is placeholder art; the hero is the client's video.
- Its "How do we reduce cost?" label reads "How We Reduce Cost?" on the live page, which
  wins on content.
- Its gradient on the portfolio figure is rendered as `--color-figure-solar-bright`, the
  solar business's own accent on the homepage ledger, rather than a new gradient token
  minted for one number.

Still open:

- **The portfolio figure reads `8299.5 MWp`, not the screenshot's `8299 MWp`.** The live
  markup is `<span data-target="8299">0</span><span>.5</span> MWp` — the counter lands on
  8299 and the ".5" is static text after it, so the settled figure is 8299.5. A scrape
  mid-count reads "0.5 MWp", which is the failure the client warned of. The homepage's
  mock capacity stat still reads 8299. **Client to confirm which is right.** *(2026-10-04: still
  open. The homepage reads SAEL's `8.3 GWp`, not either of these. The 2026-10-02 note that it read
  8299.5 MWp described a change that has been undone; see the correction entry under Done.)*
- **No hero poster.** Until a still is supplied (`pending: solar-energy/hero-poster`) the
  box shows the neutral placeholder before the first frame and for reduced-motion users.
- **A meta description for `/solar-energy/`.** The live page ships
  `<meta name="description" content="">`; `{{TODO: content}}` and none emitted.
- **The map pins**, as above.
- **`features/08-solar-energy.md`** describes a page this is not, and wants rewriting to
  the as-built rather than the other way round.

### FE-07 — as built

Merged to `main` on 2026-09-10 (PR 2534). **Revised 2026-09-17 on the client's
feedback**, together with About Us (PR 2535): the card accent that fills across the
hairline on hover now runs on the team cards as well as the About Us principle cards,
matching the two pages to each other.

**FE-05 was skipped to get here, on the client's instruction of 2026-09-10.** It was
still the top of Pending when FE-07 closed, and is In Progress now. What FE-07 needed from
it — `TeamMember`,
`getTeamMembers()` on the interface, and the method in both implementations — was carved
out and landed here, which is exactly the trade FE-04 made for `CapacityStat` and
`NewsItem`. FE-05 is correspondingly smaller now; nothing in it was dropped.

Built to **`Our Team.dc.html`**, the client's Claude Design project
(`a6a044b5-3829-44df-baae-d700f52344ec`), read through the design MCP. The first page
whose content is entirely repository-driven — seventeen real people, no hardcoded names.

| # | Section | Component | State |
|---|---|---|---|
| 1 | Heading, tabs and roster | `sections/team-grid/` | **New.** One `Section background="black-dots"` carrying the breadcrumb, the `<h1>`, the standfirst, a Leadership/Management tab list and both panels of cards. One section and not two because the design draws it as one, and splitting it would put `--spacing-section-y` between a tab and the panel it controls |
| — | Page hero | — | **Not built** — see below |

**The design has no banner hero, and that is the one place it disagrees with
`features/07` §1.** The feature doc specifies `<PageHero>`; the design opens on the dotted
black ground with the `<h1>` and a standfirst, and `asset-inventory.md` has no Our Team
banner to put behind one. **The client's ruling on 2026-09-10 was to follow the design and
keep the breadcrumb** — which the design also omits, but `accessibility-and-seo.md` §3
requires `BreadcrumbList` on every page below the root, and that is an obligation rather
than a visual detail. So the page is the design's opening with `<Breadcrumb>` restored
above the title.

That makes `sections/team-grid/` the **second inner-page opening**, beside
`sections/page-hero/`. It is not a rival template: a page with a supplied banner still
uses `<PageHero>`, and FE-08 → FE-15 should pick by whether the client has supplied
artwork.

**Three smaller departures from `features/07`, all following the design:**

- **The portrait is 3:4, not 1:1.** The feature doc specifies a square; the design draws
  a portrait crop, which is what a head-and-shoulders photograph wants.
- **The grid is `auto-fill`, not the doc's 4/3/2/1 breakpoints.** One
  `repeat(auto-fill, minmax(min(100%, 250px), 1fr))` reflows on the space it has, and
  `auto-fill` rather than `auto-fit` deliberately: Management has seven cards to
  Leadership's ten, and `auto-fit` would collapse the empty tracks and draw the same
  person wider on one tab than on the other.
- **There is no separate `<TeamGrid>` under a `<PageHero>`.** The one component owns both,
  for the reason in the table above.

Landed alongside it:

- **`TeamMember.group`** — new, and in neither `content-model.md` §2 nor
  `api-contracts.md` §4 before this. A tab is a partition of the roster, so the grouping
  has to come from the data rather than a hardcoded list of names. Both docs are updated
  and the backend proposal is a `group` string on `GET /api/v1/team`.
- **`photoUrl: string | null`** rather than the documented `photo: ImageAsset | null`,
  following `NewsItem.imageUrl` — a CMS asset the frontend cannot know at build time is a
  URL for `next/image`, not a bundled import. `photoAlt` is ignored: a portrait's `alt` is
  the name of the person in it, which `name` already carries.
- **`lib/utils/sanitize-bio.ts`** — the frontend half of the two-sided sanitisation
  `api-contracts.md` §4 describes, allowlisting exactly the eight tags it permits. Runs on
  the server, so `sanitize-html` never reaches the browser bundle; only the clean string
  crosses into the client leaf.
- **`rich-text`**, an `@utility` in globals.css, giving those eight tags back the margins
  the preflight reset strips. Type and colour stay on the element that carries it.
- **`<EmptyState ground="dark">`** — its first real consumer. The paper palette's
  near-black type is invisible on `--color-surface-black`; the default is unchanged.
- **`focus-visible:outline-white` on this page's controls and on `<Breadcrumb>`'s links.**
  The global ring is `--color-brand-blue`, which is **1.84:1** on `--color-surface-black`
  — under WCAG 1.4.11's 3.0 floor, so effectively invisible. White is 19.9:1. The
  breadcrumb fix applies to the About Us hero too.
- **Seventeen portraits, served from the client's CDN.** They were briefly mirrored into
  `public/team/` from the legacy site's `/img/team/` while the real URLs were
  outstanding; **the client supplied them on 2026-09-10** and the copies were deleted —
  byte-identical, so nothing changed but where they are served from. The fixture stores
  the **container path** (`web-assets/media/our-team/<slug>`), never the absolute URL,
  so no hostname is committed (/CLAUDE.md §7); `tryBlobUrl()` composes it with
  `AZURE_BLOB_BASE_URL`, which `.env.example` now carries. The same mapping survives
  FE-23 untouched, because `blobUrl()` passes an already-absolute value straight
  through — which is what the API will send.

  `tryBlobUrl` rather than `blobUrl` deliberately: with the base unset each card falls
  back to its initials avatar and the roster still renders in full, instead of the whole
  page becoming an empty state over a configuration mistake. The cost is that the
  omission is quiet, which is why the working base is the documented default.
- **`TeamMember.linkedinUrl`** — added 2026-09-10 from the live site's own popups, where
  **seven of the seventeen** publish a profile and ten do not. Rendered under the
  biography, which is where the live site puts it, as an outbound link with
  `rel="noopener noreferrer"`. Sparse by nature rather than unfilled, so a person without
  one gets no link at all — no disabled affordance. Both contract docs updated.
  **Dialog only, and not on the card**: the card's whole surface is already the trigger's
  `::before`, so a link underneath it would be unreachable.
- **`ui/card.tsx`: `group-focus-within` → `group-has-focus-visible`** — a real bug, found
  on this page and fixed in the shared primitive. See below.

**The card accent was stuck after closing a dialog, and the fix was in `<Card>`.** The
accent keyed off `group-focus-within`. A native `<dialog>` returns focus to its trigger
on close — correctly, and `features/07` requires it — and that trigger is inside the
card, so `:focus-within` stayed true and the bar stayed filled indefinitely, including
while the pointer moved over other cards. `:focus-within` cannot distinguish restored
focus from a deliberate keyboard visit; `:has(:focus-visible)` defers to the browser's
own modality heuristic and can. Measured before and after over CDP:

| path | before | after |
|---|---|---|
| at rest | collapsed | collapsed |
| mouse open → `×` or backdrop close | **filled, no focus ring** | collapsed |
| mouse open → `Esc` close | **filled, no focus ring** | filled, **with** the focus ring — and clears on the next click |
| `Tab` to the trigger | filled | filled |

The `Esc` row is the one that still fills, and that is correct rather than residual: the
browser treats the restored focus as keyboard-visible and draws its ring there, so the
accent agrees with the ring instead of contradicting it. It clears on the next click.
The change touches every `<Card>`; `<ValueGrid>`'s cards contain nothing focusable, and
the news and ledger cards hold links whose focus is genuinely visible when tabbed to, so
all three are unaffected or strictly better.

**Verified in a real browser**, which is new for this project — a headless Chrome driven
over CDP, scripted in the scratchpad rather than committed. Both tabs switch by pointer
and by `ArrowLeft`/`ArrowRight`/`Home`/`End` with a roving `tabIndex`; the dialog opens
modal, moves focus inside, is labelled by the name heading, closes on `Esc` and on a
backdrop click, and returns focus to its trigger. No horizontal overflow at 360 or 390.

Still open:

- **A meta description for `/our-team/`.** The design file carries a `<title>` and no
  `<meta name="description">`, so none is emitted rather than a placeholder being
  invented. `{{TODO: content}}`.
- **The `<title>` separator disagrees between design files** — `Our Team - SAEL` here
  against `About Us | SAEL`. Both are transcribed verbatim. **FE-22 should settle it**
  against the legacy titles; changing a ranking title is not a decision to make in
  passing.
- **Two portraits are not 4:5.** `archana-capoor.webp` is 500x457 and
  `puneet-upneja.webp` 500x533, where the other fifteen are 500x625. In a 3:4 box
  `object-cover` crops them left and right rather than top and bottom. Both read
  correctly, but they are the odd two and want an eye on them.
- **`photoUrl: null` and `bio: null` are unexercised.** Every one of the seventeen has
  both, and inventing an eighteenth person to exercise the branches would put a
  fabricated director on a page of real ones. `features/05` §3 owns that fixture edge
  case; the card and the page already handle both.

### FE-06 — as built

Built to **`About Us.dc.html`**, the client's Claude Design project
(`f05dd0a1-42c8-4f44-b688-f8dceb7f677b`), read through the design MCP. It is the first
content page, so the shared pieces are the deliverable as much as the page is.

**Revised again on 2026-09-17 on the client's feedback** (PR 2535, with FE-07): the
breadcrumb trail was dropped and the hero copy centred; "Our Endeavours" and the "What We
Believe" label are withheld, their copy kept in `_content/about-us.ts`; "Our Ambition"
became the `<CutoutSplit>` composition with the client's shaped panel and cut-out; the
strategic pillars took the new `outlined` card variant; and the principle cards gained
the hover accent. The fourteen About Us assets moved from the repository to the blob
container the same day, described by `cdnImage()`.

**Revised on 2026-09-10 against a second read of `About Us.dc.html`.** The design file
changed in exactly two ways and nothing else — the whole diff is ten hunks, eight of
which are one attribute:

- **Section snapping is gone.** The `scroll-snap-type: y mandatory` block, the
  `section[data-snap-section]` rule, the `footer[data-snap-section]` rule and the
  `prefers-reduced-motion` override that switched snapping off all went, along with
  `data-snap-section` on all seven sections and the footer. The page scrolls normally
  now: `page.tsx` renders no `data-snap-sections`, and `<PageHero>`, `<ProseSplit>` and
  `<ValueGrid>` each lost their `snap` prop entirely rather than keeping a prop with no
  consumer. **FE-07 → FE-15 inherit a template that does not snap**; the homepage still
  does, and `globals.css`, `--spacing-viewport` and the footer's own opt-in are all
  untouched because they still serve it.
- **The hero was resized twice on 2026-09-10.** The design file replaced
  `min-height: 100dvh` with `clamp(420px, 72svh, 760px)`, and that was built; the client
  then asked for a full-viewport hero back, with a floor so it does not collapse on a
  short screen. It is now `--page-hero-h`, `max(36rem, var(--spacing-viewport))`.
  **The floor is a `max()` and not a breakpoint, because the failure is a short viewport
  rather than a narrow one** — a phone held landscape is ~390px tall and needs the floor,
  the same phone upright does not, and no width query separates them. `--spacing-viewport`
  is the screen less whatever the masthead takes, so at `lg` the hero ends exactly at the
  viewport foot rather than 68px past it.

**The hero scrim was lightened in the same pass**, at the client's report that the
photograph looked dull. It was using `--gradient-hero-scrim-stacked`, the homepage
carousel's ramp, which is 0.3 opaque even at the top of the frame and so lays a grey
film over the whole picture — right for a composition where a headline and a progress bar
cross the entire image, wrong for one carrying a breadcrumb and two lines at the foot.
`--gradient-page-hero-scrim` keeps 0.88 under the copy and is fully clear by 82%. The
homepage token is untouched. **No live reference existed to match**: the boardroom
photograph is a new CDN asset and https://www.sael.co/about-us/ has no image hero at all,
only a contact banner, so it was tuned against the source file.

Two things that look like they should have gone with it and did not:

- **`-mt-header lg:mt-0` stays.** It reads as part of the snap opt-in — the homepage's
  own comment introduces it that way — but it is a statement about the masthead: below
  `lg` the bar overlays the page and slides away on scroll, so a full-bleed hero starts
  at the viewport top and has to give back `<main>`'s `pt-header`. Nothing about that
  depends on snapping.
- **The footer keeps its `data-snap-section`.** It is inert here, because both snap
  rules are scoped to `html:has([data-snap-sections])` and this page no longer sets it,
  and it is still load-bearing on the homepage.

Also dropped in the same pass: the `flex items-center` that `<ProseSplit>` and
`<ValueGrid>` put on their `<Section>`. It existed to centre content inside a
viewport-tall snap area, and with the height gone it was making the `<Container>` a
flex item — which sizes to content rather than filling its parent. Removing it restores
ordinary block layout and the section's own `py-section-y` rhythm.

| # | Section | Component | State |
|---|---|---|---|
| 1 | Page hero | `sections/page-hero/` | **New, and the inner-page template.** Full-bleed banner, `--gradient-hero-scrim-stacked`, breadcrumb, the page's single `<h1>`, a standfirst. Takes its own breadcrumb as data — the trail differs per page and a component deriving it from the route would have to know the site's IA |
| 2 | Our Endeavours | `sections/prose-split/` | **New.** Display heading and three paragraphs beside a 4:3 photograph |
| 3 | Our Ambition | `sections/prose-split/` | The same component, one paragraph at `--ledger-measure` beside a 4:5 portrait. The two differ only in props, which is why there is one component and not two |
| 4 | Our Strategic Pillars | `sections/value-grid/` | **New.** Three `<Card>`s a `--spacing-gap-grid` apart, each with a line-art mark that animates one idea — the bars grow, the gear turns, the leaf sways. Drawn in `pillar-marks.tsx` rather than imported, because an exported PNG cannot animate its parts |
| 5 | Our Guiding Principles | `sections/value-grid/` | The same component: eight cards, the 340px column floor, no accent |
| — | Stats band (design §03) | — | **Not built** — see below |
| — | Our Goals triad (design §06) | — | **Not built** — see below |

**Two sections were deliberately omitted, and this is the one place the design and
`features/06` disagree.** The design wraps both in `sc-if` flags whose placeholder value
is `false` — it draws the page with both off — where `features/06` §3–4 asks for both to
be reused from FE-04. The client's ruling on **2026-09-10** was to follow the design.
Both already exist on the homepage, so the cost of reversing this is two lines in
`page.tsx` plus the props; the copy for both is in the design file if it is wanted.

**Three smaller departures from `features/06`, all following the design:**

- **The hero is `min-h-viewport`, not `aspect-ratio`.** §1 of the feature doc specifies
  `3/1` on desktop falling to `4/3` on mobile. The design draws a full-viewport hero on a
  page that snaps, and an aspect-ratio hero inside a snap area either overflows it or
  leaves a band of ground beneath it.
- **No `<FeatureBanner>` and no CTA button** (§5, §6). The design has neither.
- **`<ProseBlock>` is `<ProseSplit>` with `media` omitted.** The feature doc names a
  heading-over-copy component; the design has no such section, only the split twice. With
  `media` undefined the grid has one column and the split *is* that component, so a
  separate primitive would have been the same file with a branch removed.

Landed alongside it:

- **`ui/breadcrumb.tsx`** — Home › Company › About Us, emitting its own `BreadcrumbList`
  from the same array that renders the links, so the markup and the structured data
  cannot drift. `breadcrumbJsonLd()` is in `lib/seo/json-ld.ts` beside the two the root
  layout emits. A rung with no `href` ("Company", which groups pages but is not one)
  emits `name` and `position` and no `item`. **One `<li>` per rung** — the separators are
  `aria-hidden` spans inside the item they follow, not list items, because a screen
  reader announcing "list, five items" for a three-step trail is wrong.
- **Eight tokens**, all in `:root` beside the other component geometry: the two prose
  media caps and their aspects, the split's column floor, the value grid's two floors and
  its mark size. Every token the design itself referenced already existed — it was
  authored against our real theme, so nothing had to be invented to match it.
- **Three animations** in `animations.css`, still state first and motion only inside
  `prefers-reduced-motion: no-preference`.

**The grids are `auto-fit` tracks, not breakpoints.** Each is one
`repeat(auto-fit, minmax(min(100%, <floor>), 1fr))`, so a section reflows on the space it
has rather than on a viewport width — which is what keeps it correct inside a snap area
on a short laptop as well as on a phone. The `min(100%, …)` is what stops a 380px floor
from overflowing a 360px viewport.

**The artwork landed on 2026-09-10** — all eleven assets, supplied as CDN URLs under
`<container>/web-assets/media/about-us/`. Nothing on the page is a placeholder any more.

They were **committed at `src/assets/images/about-us/` and imported** until 2026-09-17,
and that was deliberate: a bundled `StaticImageData` carries the intrinsic width, height
and `blurDataURL` that `next/image` needs in order to reserve the box and avoid a layout
shift, and a bare URL string throws all three away. Wiring them as URLs before the
container was populated would have had to be undone.

**The client populated the container on 2026-09-17** — all fourteen assets, including the
three cut-out panels added that day — and the local copies came out of the repository in
the same pass. `src/lib/assets/cdn.ts` now closes the gap they left: `cdnImage(path,
width, height)` returns an object shaped exactly like the one an `import` produces, so
every `StaticImageData` prop downstream is untouched, but the bytes are fetched from the
container at runtime. Only the *path* is passed; the host comes from
`AZURE_BLOB_BASE_URL` via `blobUrl()`, so no hostname sits in the repository
(/CLAUDE.md §7).

Four notes on the assets themselves:

- **The dimensions are read from the blobs, not from the deleted local copies.** They are
  what the browser reserves before a byte arrives, so a wrong one is a layout shift that
  nothing catches. `cutout.png` is 1076 × 1984, not the 1991 a local `file` reading had
  reported.
- **`about-us-hero.JPG` is the one uppercase name, and it no longer blocks anything.**
  Turbopack refused an uppercase extension outright (*Unknown module type*), which is why
  the repository held a `.jpg` while the only URL that resolved was `.JPG`. Nothing
  bundles the file now, so the call site simply spells it in upper case. It is still the
  odd one out in an otherwise lowercase folder and still wants renaming; it is no longer
  urgent. Raised in `asset-inventory.md` §9.
- **The two panels are SVG and render `unoptimized`.** Next's optimizer refuses a remote
  SVG unless `dangerouslyAllowSVG` is set, which it is not and should not be, and the
  Next docs recommend `unoptimized` for vectors regardless. `sizes` is meaningless
  without a srcset, so neither panel carries one.
- **The eight principle icons are inverted at the call site.** They are monochrome line
  art in near-black on transparent and would be invisible on the black card as supplied.
  `<ValueMark>` applies `brightness-0 invert` — the homepage goal marks' treatment, and
  the right one here because the design file's `invert(1) hue-rotate(180deg)` exists to
  preserve colour through an inversion and there is none to preserve.
- **The icon-to-principle pairing was checked, not assumed.** The filenames are bare
  ordinals. The artwork settles it: a lightbulb for Entrepreneurial, stacked hands for
  Teamwork, a handshake under a tick for Trust and Respect, a brain for Owner Mind-Set
  and a wired brain for Continuous Learning all land on the design's own order.

Both `alt` strings the design was missing are now written from the photographs
themselves — the banner is a boardroom group shot, which the design's slot did not
describe at all.

Still open:

- **The Our Ambition sitter's name and role.** The `alt` describes what is visible and
  asserts no identity, which is as far as it can honestly go without them.
- **`solar-field.webp` is square (1024×1024) in a 4:3 box.** The design drew that slot at
  4:3 against a different asset, so `object-cover` centre-crops roughly an eighth off the
  top and bottom. The horizon and the panel rows both survive it and it reads correctly,
  but it is a deliberate crop rather than a fit and wants an eye on it.
- The responsive checklist at all seven widths, and the breadcrumb JSON-LD through a
  validator. Both need a browser, which this project has no tooling for — the same gap
  that sent three of FE-04's criteria to FE-24.

---

### FE-04 — as built

Built section by section, in the order the client's design lays them out. **Built to
`SAEL - New Website.pdf`, not to the Designer prototype** — that reversal and what it
changes per section is recorded in `asset-inventory.md` §10.

**Revised on 2026-08-20 against `SAEL Home v2.dc.html`**, the client's Claude Design
project (`980d47d4-c8e2-40f1-a514-465c538039fb`, read through the design MCP). That
file is now the reference for the sections marked below; the PDF still governs the
ones it does not cover. Where the client's instruction and v2 disagree, the
instruction wins and the disagreement is recorded beside the token or component.

| # | Section | Component | State |
|---|---|---|---|
| 1 | Hero carousel | `sections/hero-carousel/` | **Rebuilt to v2.** One composition, not four: mark → red rule → headline in a single column, right half above `lg` and bottom-anchored below it. The six per-slide placement coordinates are gone. The progress bar pinned to the section's base runs **one full sweep per slide** — four segments, then a quarter-run per slide, then this (2026-08-22). Headline set at `--text-hero`, not v2's larger size — the client's call. Slide 2's crop is shifted right above `lg` so its subject clears the headline. Autoplay still does not pause on hover, only on keyboard focus |
| 2 | About SAEL | `sections/intro-split/` | **Rebuilt to v2** on 2026-08-21, after being held back a day. The PDF's fixed 1280:528 stage and its whole `--about-*` coordinate set are gone; it is a twelve-column grid with a display heading, a rule and running copy beside the composite. Copy on columns 2–6 and artwork on 7–11, drawn in off the gutters rather than v2's 1–6 / 8–12 — the client's call |
| 3 | Business portfolio | `sections/business-tiles/` | **Rebuilt to v2.** A ledger of four rows on the black dotted ground, not four centred tiles on a light one. Capacity figure is now the largest thing on the row. Solar Cell Manufacturing carries its own frosted-grey ground as the one upcoming business. Marks are at three quarters of v2's own `clamp(92px, 10vw, 176px)` — the design's curve, our scale (2026-08-22). The agri mark's per-row nudge was withdrawn the same day; `iconScale` survives unused for when it returns. The copy is capped at v2's 46ch so it wraps before it reaches the mark, and the gutter beside the mark was deliberately **not** reduced with the mark. Each mark is drawn on **its own aspect ratio**, not forced square: the four run 0.918 to 1.040, so a square box letterboxed each differently and left the agri-waste leaves visibly smallest. **And the mark is in flow**, a real column beside the copy, rather than absolutely positioned over the row with a right padding reserving space for it — an out-of-flow box whose only child is also out of flow has no content to size against, so its height came from `aspect-ratio` alone and kept resolving short, which is what was trimming the artwork. `--spacing-ledger-gutter` went with it; a `gap-x-flow` does that job now. Both 2026-08-24. **All of that box is gone as of 2026-08-26**: the mark is a plain `<Image>` at a width with `h-auto`, so it draws at its own proportions with nothing to letterbox and nothing to clip, and `iconScale`, `--aspect-icon-mark` and the `<MediaFrame>` around it went with it. The four PNGs were re-cut the same day — see the revision note below |
| 4 | Our Current Power Portfolio | `sections/presence-map/` | **Rebuilt to v2** on 2026-08-21, and the layout review it was waiting on is closed: map left, display heading with the footprint label and the two figures right, nothing positioned over the artwork any more. A centred flex row rather than v2's 1–6 / 8–12 grid: on a grid both halves are capped and the slack lands between them, which is what kept reading as a hole. The two figures sit a `--spacing-stack` apart and the rule over the footprint label is capped at `--map-rule-w` — all the client's calls, 2026-08-21 and -22. **The 751-subpath generated map is gone**, replaced by the client's supplied `dotted-map.svg`; the six site coordinates are mapped across from the old viewBox and **want a visual check** — see the note in `presence-map/dots.ts`. Carries a **"Portfolio"** section label as of 2026-08-26 — v2's own screen has none, so this is a deliberate departure at the client's request |
| 5 | Our Endeavour | `sections/endeavour-split/` | Unchanged. Left as-is at the client's request on 2026-08-20. **Moved ahead of Solutions on 2026-08-26** — a two-line reorder in `page.tsx`; the section itself is untouched |
| 6 | Solutions | `sections/solutions-carousel/` | **Rebuilt to v2** — four 4:3 plates a hairline apart, each captioned underneath; the gradient plaque is gone. It was kept **before** Our Endeavour and set on the light ground, both the client's calls on 2026-08-20; **both were withdrawn on 2026-08-26** and it now follows Our Endeavour on the black ground, which is v2's own arrangement. The flip minted no token — every ramp is the declared dark counterpart of the paper one it replaced |
| 7 | Our Goals | `sections/goals-grid/` | **Rebuilt to v2** — three cards a hairline apart inside a hairline frame, on black. **The resting state shows the photograph untreated**: the scrim arrives with the pointer, along with the description. The three marks are the client's own artwork as of 2026-08-21, inverted to white at the call site; the `lucide-react` stand-ins are gone. Sized 40 → 56px, then ~4.5x that on 2026-08-22, then halved again to 60 → 126px on 2026-08-24 against the client's revised artwork — the mark is the card's subject, not an icon over a title. **Two sets of marks are in `src/assets/images/`**: `*-goal.svg`, which is what is wired up, and a later `*-icon.svg` set. Confirm which is current before this ships |
| 8 | In the News | `sections/news-carousel/` | **Rebuilt to v2.** The card lost its box — a hairline it hangs from, the date above a 5:4 thumbnail, the accent filling across the rule on hover. Still the one homepage surface fed by the repository |
| 9 | Pixel strip | `sections/footer-pixel-strip/` | Drawn to a canvas. **Moved into the footer on 2026-08-27** and mirrored to do it — solid along its top, dissolving downward, on the flat footer colour with no dot grid. It closed the page from `sections/pixel-strip/` until then, on the dotted paper ground as of 2026-08-26; that version is **retired** to `sections/_retired/pixel-strip/`, which is lint-blocked from being imported. The two files differ by the ground and by one expression, the row's `y` |
| — | Timeline (v2 §08) | — | **Not built.** Deferred by the client on 2026-08-20; to be revisited |
| — | SDG marquee (`features/04` §9) | — | **Skipped**, confirmed by the client on 2026-08-05: not to be built for now |
| — | Our Strength (§7), vision timeline (§8) | — | Not started. Neither appears in the client's PDF — ask before building either |

Landed alongside the v2 revision:

- **`--text-display` (30 → 64px)**, v2's gradient section heading, now used by About
  SAEL, Solutions and the Power Portfolio. `--text-h2` (24 → 36) is left to headings
  inside a card or a rail. `--text-stat-large` (36 → 76) is the footprint figures.
- **The footer takes v2's ground** — `--color-footer-bg` is `#22262e`, a cool slate
  in place of the green-grey it was, with `--color-footer-icon` a shade deeper again
  because it is painted on a white pill rather than on the ground.
- **New client assets, 2026-08-21**: `dotted-map.svg` and the three goal marks, all in
  `src/assets/images/`. The goal marks are drawn in near-black and inverted to white
  with `brightness-0 invert` — they cannot be inlined as components, because all three
  declare the same `clippath` id.

- **`--text-eyebrow` up ~15%** (13 → 16px becomes 15 → 18px), at the client's request:
  every section label on the site moves with it. Note this is the one place the
  instruction and v2 disagree — v2 sets those labels at 10px.
- **`<CardRail>` is gone**, replaced by `ui/rail/` — a `<Rail>` provider with a
  `<RailTrack>` and a `<RailArrows>` that the section places itself. v2 sets the
  arrows in the heading row rather than over the artwork, and one component cannot
  render its own part into a sibling's layout.
- New primitives: `ui/arrow-glyph.tsx`, and a `micro` size on `<Button>`. `<Eyebrow>`
  gained the `bright` and `deep` tones; `<FlankedEyebrow>` gained `rules="leading"` (and was
  deleted again on 2026-08-26 — see below);
  `<Section>` gained the `black`, `black-dots`, `paper` and `paper-dots` grounds.
- Tokens with no consumer left after the revision were removed (the hero dot sizes,
  the light-ground figure colours, the solutions plaque gradient, the always-on goals
  scrim, the tile type scale, the About stage's coordinates, the map's dot ramp).
  `lib/utils/cn.ts`'s `FONT_SIZES` list was updated to match — a `--text-*` token
  missing from it is silently discarded by `cn()`.

**Revised again on 2026-08-25 and -26**, against the client's review of the deployed
build and a second read of `SAEL Home v2.dc.html` through the design MCP:

- **The masthead's outer bar is v2's, turned over into the light.** A flat 68px at every
  width (the `lg` step to 84px is gone — v2 draws one height), `blur(22px) saturate(1.4)`,
  one flat translucent veil at v2's 0.70 → 0.86 in place of the vertical gradient, the
  hairline at its 0.09 → 0.13, its `.3s` transition, and its 8px scroll threshold in place
  of 80. **No shadow at any scroll position** — v2 draws none, so `--shadow-header` and
  `--gradient-header` went with it. Only the structure crossed over, never the hue: the
  design's bar is dark and this one stays light, which is the client's explicit call.
- **The six nav links are v2's middle section**, read off the deployed design rather than
  guessed: `--text-nav-item` at 11px/700/0.18em uppercase, no pill, a
  `clamp(4px, 1vw, 18px)` gap. `--color-nav-pill` and `--radius-nav-pill` went with the
  pill. The CTA is deliberately *not* moved — it still takes `--text-nav`, which is why
  there are now two nav type tokens. The current-page rule is kept; v2 has no equivalent
  and a prototype can afford that, a site cannot.
- **Section labels lost the leading dash and gained an underline that draws itself in.**
  `<FlankedEyebrow>` is deleted — it existed only to draw that dash — and `<Eyebrow>` now
  carries the rule itself, on by default, in the label's own ramp, so picking a tone picks
  both. The rule is CSS reading the `data-reveal` on the `<Reveal>` it already sits in, so
  it replays with everything else and costs no script.
- **The dot grid is one utility now** (`ground-dots-paper` / `ground-dots-dark` in
  globals.css, colour and image and cell size travelling together) and covers **every
  section but the hero**, the pixel strip included. The dot carries a token radius shared
  by both grounds and a half-pixel of feather, so it survives a zoom-out that used to
  erase it — verified 33% → 300%; below 33% it goes, which is the cost of the alphas
  coming down. Those alphas are ~0.4x their original weight after the first pass rendered
  them roughly three times too heavy: the radius went up for the zoom fix and the alpha
  went up alongside it, and the two multiply.
- **The Business Portfolio marks are plain `<Image>`s.** `<MediaFrame>` is for a photograph
  filling a box its parent sized, so using it for a mark meant undoing it three times over
  — a computed aspect ratio, `object-contain`, `overflow-visible`. A static import already
  carries the artwork's intrinsic size.
- **The four business icon PNGs were re-cut** from the hero masters on 2026-08-26. The
  originals were sliced through at the bottom edge — `icon-solar-module.png` ended in a
  132px run of fully opaque artwork sitting *on* its last row — so the crop the client
  reported was baked into the files and no CSS change could have fixed it. They now run
  0.838 to 1.002. **The hero symbol filenames are crossed**: the lettering baked into the
  masters proves `sael-icon-1` is the solar-energy mark and `-3` the cell mark, where the
  hero slides pair them the other way round. The business icons are mapped by that
  lettering; **the hero carousel is not, and wants a look before this ships.**
- **Smaller, all client-requested:** the Solutions heading block stacks below `lg` and its
  title spans a line of its own above the copy and the arrows (its right-hand column was
  `flex-1`, whose `flex-basis: 0` meant it never wrapped — it was squeezed to a ~100px
  column with its copy running off the side of a phone); an Our Goals card pushes its mark
  and name up and brings the description in beneath a rule, rather than swapping one for
  the other; the capacity figures count up on every pass into view.
- **A rail can no longer scroll vertically.** `overflow-x: auto` drags `overflow-y` with it,
  so the entrance transform on the cards still off the right-hand end left every rail 28px
  scrollable *downward* — enough for one diagonal swipe on a phone to hide a news card's
  date under its own top edge, which is what the client was seeing. `rail-reveal-slack`
  absorbs the transform in end padding it takes straight back out of the flow.

**Revised a third time on 2026-08-26**, against a ten-step section sequence from the
client naming each section and its ground. Six of the ten already matched. Two were
fixed, and they are the same two the client had ruled on six days earlier:

- **Our Endeavour now precedes Solutions**, and **Solutions is on `black-dots`** — both
  restoring `SAEL Home v2.dc.html`'s own arrangement, and both explicitly withdrawing the
  2026-08-20 calls recorded in rows 5 and 6 above. The ground flip is eight token swaps
  and no new token: `paper-dots` → `black-dots`, `<Eyebrow>` `deep` → `bright`,
  `<DisplayHeading>` `paper` → `dark`, `text-body-soft` → `text-on-dark-soft`,
  `<RailArrows>` `paper` → `dark`, `border-hairline-paper` → `border-hairline-dark`,
  `text-meta-paper` → `text-on-dark-muted`, and the plate title's `text-ink` **deleted**
  rather than swapped — `<Section>` sets the ground's full-strength ink itself, so naming
  it at the call site was duplication on either ground.
- **The other two deviations were ruled deliberate by the client** and are not outstanding
  work: the Timeline stays unbuilt, and the pixel strip stays where it is rather than
  moving into the footer.

Both the comparison and the remediation plan are in
`docs/homepage-section-sequence-review.md`.

Also landed inside this item, as `features/05` intends: the content repository slice
(`src/lib/content/`) with its mock and API adapters behind `getContentRepository()`,
now carrying `getCapacityStats()` and `getNewsItems()`.

**And a change to FE-03, which is Done.** The masthead was reworked on 2026-08-05 to
the client's `assets/navbar/` design: pill nav links, a gradient Contact Us button, and
a full-screen mega menu in place of the per-item dropdowns (`nav-dropdown.tsx` is
gone). `features/03` §2 describes the old bar and is now the stale document.

Outstanding content, all rendering as `{{TODO: content}}` or flagged: hero `alt` ×4,
the page meta description, and the map's "Visit Location" URLs. **Kurnool's capacity and
the Patiala question are closed** — the map was rebuilt on 2026-08-27 from
`SAEL-Numbers and data.pdf` page 2, which pins eleven *states* rather than six sites, and
neither site is among them. Two things about that map still want the client: which legend
each figure belongs to (derived from page 1's totals, not read from the icons — the
reasoning is in `_content/homepage.ts`), and why the Solar IPP figures sum to 9090 MW
where the same PDF's page 1 says 8.3 GWp. The news items' `href` all point at `/newsroom/`
because no per-article URLs were supplied, and two of their dates are in the future —
both are the client's own design, transcribed rather than corrected. `alt` text for
Solutions, Our Endeavour, About SAEL and the news thumbnails is written and wants a
review.

Two deferred tasks to raise at the end of the project:

- The photography is committed unoptimised (~86 MB across `src/assets/images/`), by
  the client's decision on 2026-08-04 to proceed and revisit. The Our Goals
  backgrounds are the worst of it — 23 MB serving cards that render ~350px wide.
- ~~The Our Goals icons are `lucide-react` stand-ins.~~ Closed 2026-08-21: the client
  supplied the three marks.

**Closed 2026-09-10.** `pnpm check` is clean — lint, typecheck, all nineteen guardrails
and the production build. What that does *not* cover is recorded here rather than ticked,
because three of `features/04`'s acceptance criteria cannot honestly be marked met:

- **The vision timeline criterion is moot.** The client deferred the timeline on
  2026-08-20 and it was never built, so there is no desktop/mobile pair to verify.
- **Autoplay does not pause on hover**, only on keyboard focus. That is `SAEL Home v2`'s
  own behaviour and a deliberate call, not an oversight — but it is a knowing deviation
  from the criterion as written.
- **The image budget is breached and waived.** 45 files exceed the 250KB cap and
  `src/assets/images/` is ~128MB. The client decided on 2026-08-04 to proceed and revisit;
  it is the first of the two deferred tasks below.

Three more — Lighthouse ≥90/100, `axe` zero criticals, and the 360px `scrollWidth`
check — need a browser, and the project has no Playwright, axe or Lighthouse dependency.
They are **FE-24**'s work by definition and are not claimed here. Everything statically
verifiable does pass: no section imports the repository (`news-carousel`'s lone
`import type { NewsItem }` is erased at compile time and is how a content-agnostic
component declares its props), stats and news both come through
`getContentRepository()`, a forced repository failure degrades to figures-less tiles
rather than a dead page, and every `<Image fill>` on the site carries a `sizes`.

### FE-25 — landed

Closed alongside FE-04 on 2026-09-10, which is what it was always waiting on — it
reconciled the guidelines against the homepage, so it could not be signed off while the
homepage was still moving.
Opened after FE-04 revealed that `design-guidelines.md` named ~80 tokens against the 231
`theme.css` actually declares, so the document a new page is supposed to build from
described a homepage that no longer existed. Its spec is **`design-reconciliation.md`**
rather than a `features/NN-*.md` — it reconciles an existing document instead of
specifying a new surface, so there is nothing for a feature doc to hold that the ledger
does not already hold better.

**Landed as of 2026-08-26.** `design-guidelines.md` is realigned against `565a3dc` and is
authoritative again; the guardrail now enforces all four of `/CLAUDE.md` §2.2's value
rules (**C-5**), and the magic-number drift it was written to stop has been cleared
(**C-4**). Ten further fixes are in — **C-1**, **C-3**, **C-6 … C-12**. The full suite is
green.

**`ui/card.tsx` was rewritten, not just adopted** (**C-1**). Its spec described a boxed,
elevated card that v2 had removed, and it had no call sites, so the page's own shape — a
hairline, an inset, an accent that fills across the hairline — became the primitive.
`news-carousel` and `business-tiles` both consume it. Proved inert element-by-element.
Side effect for a later ruling: `ui/tile-shape.tsx` now has no call site, and three tokens
are stranded with it.

**C-2 closed by declining adoption** (2026-08-26). `ui/section-heading.tsx` cannot be
adopted by the homepage: four of the seven heading sections are an `<Eyebrow>` and nothing
else, and the other three wrap every element in its own `<Reveal>` so they cascade — which
a primitive rendering three siblings in one `<div>` cannot express. Its two consumers,
`error.tsx` and `not-found.tsx`, use it exactly as intended, so it was retained unchanged
and the finding recorded as a **documented non-defect**. What the three sections genuinely
shared — the gradient-clipped `--text-display` heading — was extracted as
**`ui/display-heading.tsx`** and all three migrated. Proved inert by two clean builds with
a byte-identical stylesheet.

**Nothing outstanding.** All twelve code fixes are done and the full suite is green.
**A session opening FE-06 should read `design-reconciliation.md` §9 first** — a handoff
covering the primitives, the ground/ramp rule, the `FONT_SIZES` trap, the magic-number
guardrail and the toolchain.

---

## 🔨 In Progress

| ID | Item | Feature doc | Reads | Owner | Started |
|---|---|---|---|---|---|
| FE-05 | Content repository + mock data layer | `features/05-content-repository.md` | `content-model.md`, `api-contracts.md` | Swapnil Raj | 2026-09-18 |

Promoted 2026-09-18 as the top of Pending once FE-08 closed, per the rule. **FE-09 →
FE-11 were then worked ahead of it on 2026-09-19 on the client's instruction**, the same
trade FE-07 made; it stays In Progress. Most of it has already landed piecemeal —
`CapacityStat` and `NewsItem` inside FE-04, `TeamMember` inside FE-07 — so what remains
is the parts no page has needed yet; see the note under Pending.

---

## 📋 Pending

Delivery order. The critical path — FE-01 → FE-04 plus the FE-25 reconciliation — is
done, and FE-06, FE-07 and FE-08 have since established the inner-page openings, so
FE-12 → FE-15 all build on `sections/page-hero/` (photograph or video) or
`sections/team-grid/` plus `sections/prose-split/`, `sections/value-grid/`,
`sections/projects-map/` and `sections/capability-split/`, rather than starting from
the design system alone. The four business pages (FE-08 → FE-11) are done and are the
worked example.

**FE-05 is In Progress now, and is largely already built.** Its repository slice landed
inside FE-04 and feeds the homepage; FE-07 then carved out the team slice —
`TeamMember`, `getTeamMembers()` and both implementations. What remains is the parts no
page has needed yet.

| ID | Item | Feature doc | Reads |
|---|---|---|---|
| FE-16 | Investors hub + Corporate Governance + Notifications | `features/16-investors-hub.md` | `content-model.md`, `api-contracts.md` |
| FE-17 | Financials & Reports (5 nested document pages) | `features/17-financials-and-reports.md` | `content-model.md`, `api-contracts.md` |
| FE-18 | Newsroom (listing + pagination) | `features/18-newsroom.md` | `content-model.md`, `api-contracts.md` |
| FE-19 | Contact Us + Investor Contact (forms) | `features/19-contact-and-forms.md` | `api-contracts.md`, `accessibility-and-seo.md` |
| FE-20 | Career redirect | `features/20-career-redirect.md` | `accessibility-and-seo.md` |
| FE-21 | Legal pages (Privacy, Disclaimer, T&C) | `features/21-legal-pages.md` | — |
| FE-22 | SEO, redirects, sitemap, robots | `features/22-seo-and-redirects.md` | `accessibility-and-seo.md` |
| FE-23 | Backend API cutover (mock → Spring Boot) | `features/23-api-integration-cutover.md` | `content-model.md`, `api-contracts.md` |
| FE-24 | Performance & accessibility hardening pass | `features/24-hardening-pass.md` | `accessibility-and-seo.md`, `responsive-strategy.md` |

---

## 🚧 Blocked

Items that cannot start until an external dependency lands. Move to Pending once unblocked.

| ID | Item | Blocked on | Raised |
|---|---|---|---|
| FE-23 | Backend API cutover | Spring Boot endpoints + OpenAPI spec from backend team | — |
| — | Career redirect target URL | Client to confirm exact Oracle recruiting URL | — |
| — | DIN webfont licence confirmation | Client legal. The supplied files permit embedding (`fsType` 0 on the bold OTF, 8 on the regular), which is not the same as holding a licence | — |
| — | Footer contact email + the four social URLs | Client. Stubbed as `{{TODO: content}}` in `src/lib/config/site.ts` — *blocks FE-03* | 2026-08-04 |
| — | SAEL logo, **white** variant | Client. The colour logo ships as a PNG by decision on 2026-08-04, but white cannot be derived from it — the wordmark is a gradient over a black strapline. The footer renders the wordmark as DIN text meanwhile; swapping in the SVG is a one-element change in `footer.tsx` | 2026-08-04 |
| — | `footer-background.jpg` | Client. Absent from the handover, so the footer uses the flat `--color-footer-bg`. `asset-inventory.md` §4 | 2026-08-04 |
| — | Design sign-off on the mobile nav drawer | Design. Built to `features/03` §2 and verified against its accessibility contract; it has no prototype reference, so the visual treatment still wants a review | 2026-08-04 |
| — | A cut of DIN containing `₹` (U+20B9) | Client. Neither supplied file has the glyph, so rupee figures fall back to another face mid-number. Alternative: design approves writing amounts as `INR` — see `src/assets/fonts/README.md` | 2026-08-04 |
| — | Investor document headings from the API: named groups, subgroups, labels exactly as SAEL write them, CSR's oldest-first order, anchors derived from labels | Backend row **3.52**, Not Started. `documents-live` returns one level of groups, labelled `FY {yyyy}` or null, newest year first (`api-contracts.md` §4.3), so Codes & Policies, Sustainability Reports, Other Documents, General Meeting and CSR cannot be rendered from it as built. How those pages go live without it is not yet decided | 2026-10-01 |
| — | Board of Directors, Board Committees and Our Team editable by SAEL | SAEL's answer to decision 14 (backend rows 3.24 and **5.24**). **Static in this repo at go-live**, and since 2026-10-02 actually static: `src/app/_content/`, not the content repository, so a `CONTENT_SOURCE=api` build renders all three (see the 2026-10-02 entry under Done). There is no backend endpoint for any of them (`api-contracts.md` §9), so every change is a release by us. SAEL's sign-off list: backend `docs/client/static-content-sign-off.md`, not yet sent | 2026-10-01 |
| — | Rebuild for the production host when DNS moves from `prod2-preview.sael.co` | **The DNS switch, and a decision on the production origin.** `NEXT_PUBLIC_SITE_URL` is compiled in, so the move is a rebuild. On any origin but `PRODUCTION_URL` (`https://www.sael.co`, `src/lib/config/site.ts`), every page is `noindex`. The backend's cutover checklist §1.7 records `https://sael.co` for the panel, which conflicts with `www` being canonical (`accessibility-and-seo.md`). One must change before the switch. Backend row **5.27**, checklist §1.11 | 2026-10-02 |

**Resolved 2026-08-05**, both by the client supplying the artwork, both consumed by FE-04:

- *Business tile icons without baked-in lettering* — supplied as PNGs in `src/assets/images/business/`. The tiles render them beside an HTML heading, so nothing is duplicated or cropped.
- *Hero overlay symbol icons* — supplied as `src/assets/images/hero/sael-icon-{1..4}.png` and wired per slide.

> FE-23 also appears in Pending because the mock-side scaffolding (adapter shape, env switch, Zod schemas) can and should be built ahead of the real endpoints. Only the final swap is blocked.

---

## Status definitions

| Status | Meaning |
|---|---|
| **Pending** | Specified, not started. Feature doc exists. |
| **In Progress** | Actively being built. Exactly one at a time. |
| **Done** | Acceptance criteria met, `pnpm check` clean, merged to `main` by PR. |
| **Blocked** | Cannot proceed without an external input. Must name the dependency. |

## Adding a new item

1. Write `features/NN-<slug>.md`.
2. Append a row to **Pending** with the next `FE-NN` ID.
3. If it introduces new data, update `content-model.md` and `api-contracts.md` in the same change.
