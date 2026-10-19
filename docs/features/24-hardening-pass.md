# FE-24 — Performance & Accessibility Hardening

**Depends on:** FE-23 · **Reads:** `accessibility-and-seo.md`, `responsive-strategy.md`

A dedicated pass over the finished site. Individual items were built to standard; this catches what only appears in aggregate — cumulative bundle growth, a focus order that breaks across pages, an image budget that crept up.

---

## 1. Performance

Measure on **throttled 4G, mid-tier Android**, not a desktop connection.

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.05 |
| INP | < 200ms |
| Homepage JS | < 120KB gzipped |
| Lighthouse mobile performance | ≥ 90 |

Checks:

- `@next/bundle-analyzer` on the production build. Anything unexpected in the client bundle is a `'use client'` boundary placed too high.
- Confirm the client components are still only: mobile nav, hero carousel, desktop vision timeline, SDG marquee, forms, and the team bio dialog. Any others need justification.
- Every `<Image>` has `sizes`; only the hero has `priority`.
- No committed raster over 250KB.
- Fonts subset, WOFF2, preloaded, `display: swap`.
- No layout shift from the fixed header, from font swap, or from images without dimensions.
- Verify the mobile hero serves the portrait crop, not a downscaled landscape.

## 2. Accessibility

- `axe` scan on every route, zero criticals.
- Keyboard-only traversal of every page, including the mobile drawer, carousel, dialogs, accordions and forms. No traps, logical order, focus always visible.
- Screen reader pass (VoiceOver + NVDA) on the homepage, one investor page, and a form.
- 200% zoom at 1280px on every page — no content loss (WCAG 1.4.10).
- `prefers-reduced-motion: reduce` across the whole site: nothing moves, everything is reachable.
- Contrast audit. **Resolve the stats-band label issue flagged in FE-04** — it must not reach production unresolved.
- Heading hierarchy audit: one `<h1>` per page, no skipped levels.

## 3. Cross-browser and device

Chrome, Safari, Firefox, Edge (latest two versions each) plus iOS Safari and Chrome Android. Watch specifically for:

- `backdrop-filter` on the header in Firefox
- `background-clip: text` on eyebrows in older Safari — confirm the fallback fires
- `clip-path` + `border-radius` composition on the tile shapes
- `dvh` behaviour on iOS Safari with the address bar collapsing
- Scroll-snap on the mobile SDG strip in Safari
- `getPointAtLength` on the vision timeline in Firefox

## 4. Content and copy sweep

- Search the codebase for `{{TODO:` — every occurrence must be resolved or explicitly deferred with client sign-off. Produce the list.
- Check for lorem ipsum, placeholder images, and `#` hrefs.
- Verify every external link resolves and opens in a new tab correctly.
- Verify every PDF link resolves.

## 5. Resilience

- Kill the backend and walk the whole site — every page must render with empty states.
- Confirm no page 500s under any of the failure modes from FE-23.
- Confirm `/api/health` responds.

## Acceptance criteria

- [ ] All performance targets met on throttled mobile
- [ ] `axe`: zero criticals on every route
- [ ] Keyboard and screen reader passes complete, issues fixed
- [ ] Stats-band contrast resolved
- [ ] Cross-browser matrix verified
- [ ] Zero unresolved `{{TODO:` markers, or a signed-off deferral list
- [ ] Site fully navigable with the backend down
- [ ] `pnpm check` passes

## On completion
Move to Done. The tracker's In Progress column is empty — the next item comes from whatever is added to Pending.
