# FE-07 — Our Team

**Route:** `/our-team/` · **Depends on:** FE-06
**Reads:** `content-model.md`

First page driven entirely by repository data.

## Sections

1. `<PageHero>` — "Our Team"
2. `<TeamGrid>` — new component, `sections/team-grid/`

## `<TeamGrid>`

**Props:** `members: TeamMember[]`

- Card: photo (`aspect-ratio: 1`, `object-fit: cover`), name, designation.
- If `bio` is present the card is expandable — a `<Dialog>` or an inline disclosure. Decide once; do not mix. Prefer a dialog: bios can be long and inline expansion causes large layout shifts in a grid.
- `photo === null` → an initials avatar on a brand-gradient background. Do not ship a broken image icon.
- `bio` may contain HTML. Sanitise before rendering even though the backend sanitises too — defence in depth.
- Sorted by `order` from the repository. **Do not re-sort client-side.**
- Grid: 4 col `xl` → 3 `lg` → 2 `md` → 1 below.
- `[]` or a repository failure → `<EmptyState>`.

> **Amended 2026-10-02.** The roster is static content, `ourTeamMembers` in `src/app/_content/our-team.ts`, checked verbatim against the live page. The backend's team endpoint was descoped by SAEL on 20 Sep 2026 (backend row 5.24), so `getTeamMembers()` was removed and there is no repository call or failure path on this page. The first and fourth criteria below are superseded by that; a change to the team is a release.

## Acceptance criteria

- [ ] ~~Renders from `getTeamMembers()`; no hardcoded people~~ — superseded 2026-10-02, see above
- [ ] Missing photo and missing bio both handled gracefully
- [ ] Bio dialog: focus trapped, `Esc` closes, focus returns to the trigger
- [ ] ~~Repository failure renders an empty state, not a 500~~ — superseded 2026-10-02: no repository call
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-08**.
