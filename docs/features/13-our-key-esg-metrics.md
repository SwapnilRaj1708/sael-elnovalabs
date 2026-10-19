# FE-13 — Our Key ESG Metrics

**Route:** `/our-key-esg-metrics/` · **Parent nav group:** Sustainability
**Depends on:** FE-12 · **Reads:** `content-model.md`

Repository-driven page. ESG figures are reported periodically and are read by investors — accuracy and clear period labelling matter more than visual flourish.

## Sections

1. `<PageHero>` — "Our Key ESG Metrics"
2. `<ProseBlock>` — framing copy. `{{TODO: content}}`
3. `<EsgMetricsSection>` — new component, `sections/esg-metrics/`
4. Optional: link to the full ESG/sustainability report PDF (Azure Blob, via `<DocumentLink>`)

## `<EsgMetricsSection>`

**Props:** `metrics: EsgMetric[]`

- Groups by `category` (Environment / Social / Governance), rendering a `<SectionHeading>` per group.
- Each metric reuses `<ImpactGrid>` from FE-12 if the shape fits; if it does not, extend `<ImpactGrid>` with a prop rather than forking it.
- `period` ("FY 2024-25") must be visible on every metric or stated once per group. **An ESG figure without its reporting period is misleading** — this is not optional polish.
- Ordered by `displayOrder` from the repository.
- `[]` or failure → `<EmptyState>`.

## Acceptance criteria

- [ ] Renders from `getEsgMetrics()`; no hardcoded figures
- [ ] Every metric displays its reporting period
- [ ] Category grouping handles a missing `category` (falls back to a single ungrouped list)
- [ ] Repository failure renders an empty state
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-14**.
