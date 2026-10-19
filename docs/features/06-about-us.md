# FE-06 — About Us

**Route:** `/about-us/` · **Depends on:** FE-05
**Reads:** `design-guidelines.md`, `responsive-strategy.md`

The first content page. It establishes the **inner-page template** that FE-07 through FE-15 all follow, so build the shared pieces here properly.

---

## New shared components

| Component | Purpose |
|---|---|
| `sections/page-hero/` | Standard inner-page hero: full-bleed image, `aspect-ratio: 3/1` desktop → `4/3` mobile, gradient scrim, `<h1>` and optional eyebrow, breadcrumb. **Every page FE-07→FE-15 uses this.** |
| `sections/prose-block/` | Heading + rich body copy, capped at `--measure`. Handles a `RichText` shape so backend-supplied HTML can render safely later. |
| `ui/breadcrumb.tsx` | Home › Company › About Us. Emits `BreadcrumbList` JSON-LD. |

## Sections

1. `<PageHero>` — title "About Us"
2. `<ProseBlock>` — the company narrative. `{{TODO: content — port from https://www.sael.co/about-us/}}`
3. `<StatsBand>` — **reuse from FE-04**, `getCapacityStats()`
4. `<GoalsTriad>` — **reuse from FE-04**, Mission / Vision / Ethos. Confirm with the client whether it belongs on both pages or only here
5. `<FeatureBanner>` — optional, if the legacy page has a plant image
6. `<Button>` CTA → `/contact-us/`

## Content sourcing

Port copy from the live page verbatim unless the client supplies replacements. Do not paraphrase corporate boilerplate — legal and IR sign off on that wording. Anything you cannot retrieve gets `{{TODO: content}}` and a line in your response.

## Acceptance criteria

- [ ] `<PageHero>`, `<ProseBlock>` and `<Breadcrumb>` are generic and take typed props
- [ ] `<StatsBand>` and `<GoalsTriad>` are reused unmodified from FE-04 — if either needed a change, the change is a prop, not a fork
- [ ] Metadata: unique title and description, canonical `/about-us/`
- [ ] Breadcrumb JSON-LD validates
- [ ] Responsive checklist passes at all seven widths
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-07**.
