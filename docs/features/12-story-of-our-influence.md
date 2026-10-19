# FE-12 — Story of Our Influence

**Route:** `/story-of-our-influence/` · **Parent nav group:** Sustainability
**Depends on:** FE-11 · **Reads:** `design-guidelines.md`, `responsive-strategy.md`

Community-impact narrative page. Establishes the **sustainability page template** shared with FE-13 and FE-14.

## Sections

1. `<PageHero>` — "Story of Our Influence", breadcrumb Home › Sustainability › …
2. `<ProseBlock>` — narrative. `{{TODO: content — port from the live page}}`
3. `<ImpactGrid>` — new shared component: figure + label + supporting line, for community-impact numbers. 3 col → 1. Reused by FE-13.
4. Photo story — a responsive image grid or a `<FeatureBanner>` sequence. `{{TODO: assets}}`
5. Cross-links to the other two sustainability pages

## Notes

- Impact figures here are editorial, not from `getCapacityStats()`. If the client wants them backend-managed later, they map to `EsgMetric` — do not invent a new type.
- Photo-heavy page: lazy-load everything below the fold, `sizes` on every image, watch the mobile payload.

## Acceptance criteria

- [ ] `<ImpactGrid>` is generic and reused by FE-13
- [ ] Unique metadata; canonical set; breadcrumb JSON-LD validates
- [ ] Total mobile image payload under 600KB
- [ ] Responsive checklist passes
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-13**.
