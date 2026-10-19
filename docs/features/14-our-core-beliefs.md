# FE-14 — Our Core Beliefs

**Route:** `/our-core-beliefs/` · **Parent nav group:** Sustainability
**Depends on:** FE-13 · **Reads:** `design-guidelines.md`

Values and principles page. Should be almost pure composition of existing components.

## Sections

1. `<PageHero>` — "Our Core Beliefs"
2. `<ProseBlock>` — framing copy. `{{TODO: content}}`
3. `<HighlightGrid>` — **reuse from FE-08.** One card per belief: icon, title, description. `{{TODO: content}}`
4. `<GoalsTriad>` — **reuse from FE-04** if the client wants Mission/Vision/Ethos repeated here. Confirm first; repeating it on three pages dilutes it.
5. Cross-links to the other sustainability pages

## Acceptance criteria

- [ ] No new section components. If one is genuinely needed, justify it in the PR.
- [ ] Unique metadata; breadcrumb JSON-LD validates
- [ ] Responsive checklist passes
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-15**.
