# FE-15 — Sustainable Development Goals

**Route:** `/sustainable-development-goals/`
**Depends on:** FE-14 · **Reads:** `design-guidelines.md`, `accessibility-and-seo.md`

The destination for the homepage SDG marquee. **Deep-link anchors are the critical requirement here** — the marquee links to `#sdg-3`, `#sdg-5`, `#sdg-7` and so on, and those must land correctly.

## Sections

1. `<PageHero>` — "Sustainable Development Goals"
2. `<ProseBlock>` — SAEL's commitment framing. `{{TODO: content}}`
3. `<SdgDetailList>` — new component, `sections/sdg-detail/`

## `<SdgDetailList>`

One block per SDG, in ascending number order: 3, 5, 7, 8, 9, 10, 11, 12, 13, 15.

Each block:

- `id="sdg-{n}"` on the section element
- The SDG's official colour block with the `#N` numeral and name (visually consistent with the homepage marquee card)
- SAEL's contribution narrative for that goal. `{{TODO: content}}`
- Optionally supporting figures — reuse `<ImpactGrid>` from FE-12

## Anchor requirements — verify explicitly

- `scroll-padding-top` on `<html>` equals the fixed header height, so an anchored section is not hidden under the header. Test at both desktop (84px) and mobile (64px) header heights.
- **Trailing-slash interaction:** the live site links to `/sustainable-development-goals#sdg-7` without a slash. With `trailingSlash: true`, Next 308s to `/sustainable-development-goals/#sdg-7`. Confirm the fragment survives the redirect in Chrome, Safari and Firefox. If it does not, add an explicit redirect preserving the hash, or update the homepage marquee links to use the slashed form directly (preferred — fix it at the source).
- Deep-linking from a cold load (paste the URL into a new tab) must land correctly, not just in-page navigation. This is the case that usually breaks, because the browser scrolls before images have reserved their height. Every image above the anchor must have explicit dimensions.

## Accessibility

Colour must never be the only carrier of meaning — each block carries its number and name as text. Do not adjust the official UN colours for contrast; instead ensure the text alternative exists (see `accessibility-and-seo.md` §5).

## Acceptance criteria

- [ ] All ten SDG anchors resolve correctly on cold load, not obscured by the header
- [ ] Homepage marquee links land on the correct block in all three browsers
- [ ] No cumulative layout shift pushes the anchor target after scroll
- [ ] Official UN colours used exactly
- [ ] Unique metadata; canonical set
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-16**.
