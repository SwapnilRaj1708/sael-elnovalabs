# FE-08 — Solar Energy

**Route:** `/solar-energy/` · **Parent nav group:** Businesses
**Depends on:** previous item · **Reads:** `design-guidelines.md`, `responsive-strategy.md`

One of the four business pages. **These four share a template.** Whichever is built first defines it; the other three should be almost entirely composition with different content. If you find yourself writing new section components on the third business page, the template was wrong — go back and generalise it.

> **Copy source: SAEL's instruction of 2026-09-18 for the four business pages, which still
> stands for them.** SAEL's reference screenshot fixes the structure and the live page,
> https://www.sael.co/solar-energy/, fixes the copy. The page was built that way on 2026-09-18, not to the
> section list below, which has not been reconciled to it (`frontend-progress.md`, "FE-08 — as built").
> The instruction is SAEL's and specific to these four pages. It is not the general rule, which is
> that SAEL's reviewed content for the new site is the authority for display copy and sael.co is
> not (/CLAUDE.md §2 rule 8).

## Sections

1. `<PageHero>` — title "Solar Energy", hero image, breadcrumb Home › Businesses › Solar Energy
2. `<ProseBlock>` — overview copy. `{{TODO: content — port from https://www.sael.co/solar-energy/}}`
3. `<StatsBand>` — capacity figures relevant to this business, filtered from `getCapacityStats()`
4. `<FeatureBanner>` — plant or facility imagery with a caption
5. `<HighlightGrid>` — new shared component if the legacy page has a capabilities list: icon + title + short copy, 3 col → 1. Build it generically on the first business page so the other three reuse it.
6. `<BusinessTiles>` — **reuse from FE-04**, cross-linking the other three businesses. Filter out the current page.
7. CTA `<Button>` → `/contact-us/`

## Assets

Business icon: `icons/business-solar-generation.svg` (from FE-02). Hero and facility photography: `{{TODO: assets — client to supply}}`. Do not reuse homepage hero crops as page heroes; the aspect ratios differ.

## Acceptance criteria

- [ ] Reuses `<PageHero>`, `<ProseBlock>`, `<StatsBand>`, `<FeatureBanner>` and `<BusinessTiles>` without forking any of them
- [ ] Cross-link tiles exclude the current page
- [ ] Unique metadata; canonical `/solar-energy/`
- [ ] Breadcrumb JSON-LD validates
- [ ] Responsive checklist passes at all seven widths
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-09**.
