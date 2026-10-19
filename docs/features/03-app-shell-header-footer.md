# FE-03 — App Shell: Header, Mobile Nav, Footer

**Depends on:** FE-02
**Reads:** `design-guidelines.md`, `responsive-strategy.md`, `accessibility-and-seo.md`

The shell wraps all twenty pages. **The mobile navigation does not exist in the prototype** — it is new design work and the most consequential piece of this item.

---

## 1. Navigation config

`src/components/layout/header/nav-config.ts` — one array, consumed by the desktop nav, the mobile drawer, the footer, and `sitemap.ts`. A route that is not in this array does not exist as far as the site is concerned.

```ts
export interface NavItem {
  label: string;
  href: string;                 // always with trailing slash
  children?: NavItem[];
  /** Businesses and Sustainability menus show a thumbnail per item on desktop. */
  image?: { src: string; alt: string };
}
```

Structure. The seven top-level items and every route were taken from the live site when this
was built (FE-03, 2026-08-04), and the routes must keep matching it (URL parity, /CLAUDE.md §2
rule 6).

> **The Businesses labels and their order are SAEL's, not sael.co's.** SAEL renamed and
> reordered them on 2026-10-01 (`5494e70`). The table shows SAEL's. Before that they were sael.co's:
> Solar Energy, Waste To Energy, Module Manufacturing, Solar Cell Manufacturing. sael.co is not
> grounds for restoring them (/CLAUDE.md §2 rule 8).

| Label | Href | Children |
|---|---|---|
| Company | — (trigger only) | About Us `/about-us/`, Our Team `/our-team/` |
| Businesses | — | Solar Energy Generation `/solar-energy/`, Solar Module Manufacturing `/module-manufacturing/`, Solar Cell Manufacturing `/solar-cell-manufacturing/`, Agri Waste-To-Energy `/waste-to-energy/` |
| Sustainability | — | Story of Our Influence `/story-of-our-influence/`, Our Key ESG Metrics `/our-key-esg-metrics/`, Our Core Beliefs `/our-core-beliefs/` |
| Investors | — | Offer Documents `/investors/offer-documents/`, Corporate Governance `/investors/corporate-governance/`, Financials & Reports `/investors/financials-and-reports/`, Notifications `/investors/notifications/`, Investor Contact `/investors/contact-us/` |
| Newsroom | `/newsroom/` | — |
| Career | `/career/` | — (external redirect) |
| Contact Us | `/contact-us/` | — |

> The prototype's header lists these seven as flat links with no dropdowns. The **live site has dropdowns**, and the IA requires them. Build the dropdowns. Flag to design that the prototype's flat treatment is not viable for 20 routes.

---

## 2. Header — `src/components/layout/header/`

### Desktop (≥ lg) — `desktop-nav.tsx`

Per `design-guidelines.md` §4:

- Fixed, 84px, `z-index: 100`, glass background with `backdrop-filter: blur(18px) saturate(160%)` and a `@supports` fallback.
- Logo left, 42px tall, links to `/`.
- Nav right, 42px gap, `--text-nav`, colour `rgba(28,32,40,.82)`, hover `--color-accent-hover`.
- **Dropdowns:** items with `children` open a panel on hover *and* on focus/click. Businesses and Sustainability use the image-card layout (thumbnail + title); Company and Investors use a plain link list.
- Dropdown behaviour: opens on hover after a ~120ms intent delay, closes on mouse-leave after ~200ms (prevents flicker when crossing the gap), closes on `Esc`, closes on route change. Keyboard: `Enter`/`Space` toggles, arrow keys move within, `Esc` returns focus to the trigger.
- Active route indication: the top-level item whose subtree contains the current path gets a persistent underline or colour change. Uses `usePathname()`, so the nav is a client component — keep it as small a client boundary as possible.

### Mobile (< lg) — `mobile-nav.tsx` `'use client'`

**New design. Specify with design before building if there is any doubt.**

- Header collapses to 64px. Logo 32px left, hamburger right in a 44×44px target.
- Tapping opens a full-height drawer sliding in from the right (280ms, `cubic-bezier(.2,.8,.2,1)`), covering the viewport with an opaque `--color-surface` background — not a translucent overlay, the content behind is visually noisy.
- Drawer contents: close button top-right (44×44), then the nav items stacked at `--text-h3`. Items with children are `<Accordion>` disclosures; tapping the label expands, it does not navigate. Leaf items navigate and close the drawer.
- Below the nav: the four social icons and a "Contact Us" primary button.
- **Accessibility, non-negotiable:** focus trapped inside the drawer; `Esc` closes; focus returns to the hamburger on close; `aria-expanded` on the trigger; `role="dialog"` + `aria-modal="true"` + `aria-label="Main navigation"` on the panel; body scroll locked via `use-lock-body-scroll` without layout shift.
- Route change closes the drawer.
- With `prefers-reduced-motion: reduce`, the drawer appears without the slide.

### Scroll behaviour

The header is fixed at all times. On scroll past ~80px, increase the background opacity slightly and the shadow — subtle, 200ms.

> **Above `lg` the bar never hides.** Corporate sites with deep IA benefit from a
> persistently reachable nav, and that has not changed.

**Below `lg` it does hide, at the client's request on 2026-09-03**, reversing the
blanket "do not hide-on-scroll-down" this section used to carry. A phone has a
screenful to spare and 68px of it is a lot to give a bar you are not using.

- Scrolling **down** slides the whole bar up and off; it stays off when the scroll
  stops. Scrolling **up** slides it back. `--duration-header`, `--ease-entrance`,
  `transition: none` under `prefers-reduced-motion: reduce`.
- The bar is never hidden while its own height is still on screen, so a short page
  can never strand the navigation off-screen and there is always a way back.
- One passive, rAF-throttled scroll listener drives this *and* the glass —
  `header-shell.tsx`. The breakpoint is CSS's (`lg:translate-none`), not JS's, so
  `--breakpoint-lg` is not restated in a media-query string.
- `lg:translate-none` and not `lg:translate-y-0`: a `translate` other than `none`
  makes the element a containing block for `position: fixed` descendants, and the
  desktop mega menu is `fixed inset-0` inside the bar. It is the same trap
  `backdrop-filter` sets. For the same reason the mobile drawer now portals to
  `<body>` rather than rendering inside `<header>`.

### Layout offset

The prototype uses `margin-top: 84px` on the hero. Do not do this — it breaks for every non-hero page. Instead: a spacer element or `padding-top` on `<main>` equal to the header height token, plus `scroll-padding-top` on `html` so anchor links (the SDG deep links) do not land under the header.

**On a snapping page below `lg`, that offset is given back** — the bar overlays the
page instead. It has to be: a bar that hides must leave nothing behind it, or the
section it uncovers appears not to have reached the top of the screen.

The geometry is static rather than animated in step with the bar. Moving the offset
during a scroll is a re-layout, and under `scroll-snap-type: mandatory` a re-layout
moves every snap position while the user's finger is still down. So a section always
starts at the viewport top and is always a whole screen tall, and the bar slides over
it — which means scrolling **up** re-reveals the bar across the top of the current
section. That crop is accepted: you scroll down to read, and up to navigate.

Three declarations, scoped to `html:has([data-snap-sections])` so no other page is
touched and the SDG deep links keep their `scroll-padding-top`:

| Where | Above `lg` | Below `lg` |
|---|---|---|
| `scroll-padding-top` on `html` | `--spacing-header` | `0` |
| `--spacing-viewport` (`min-h-viewport`) | `--spacing-viewport-offset` | `--spacing-viewport-full` |
| `<main>`'s `pt-header` | kept | cancelled by `-mt-header` on the page's snap wrapper |

The third is a utility on the page and not a rule in `globals.css` because
`@layer base` cannot outrank a utility whatever its specificity.

---

## 3. Footer — `src/components/layout/footer/`

Content is fixed and lives in `src/lib/content/static/footer.ts`.

### Structure (per prototype and live site)

1. **Top row:** four social icon buttons, right (Facebook, Instagram, LinkedIn, X) — 44px
   circles, white fill, `--color-footer-icon` glyph, hover lifts 3px.
   > **The wordmark left this row on 2026-08-27** and now sits beside the corporate block
   > (point 3), at the client's request. It had been the colour PNG on a **white plate**,
   > because the only artwork was a gradient over a *black* strapline and could not sit on
   > `--color-footer-bg`; `sael-logo-dark.svg` is drawn for a dark ground, so the plate went
   > with the move. The socials keep the right-hand side they already had.
2. **Link grid, 4 columns:**
   - *Know More* — About Us, Our Team, Contact Us, Newsroom, Career
   - *Solutions* — Solar Energy Generation, Solar Module Manufacturing, Solar Cell
     Manufacturing, Agri Waste-to-Energy. SAEL's labels and order since 2026-10-01, as in the
     navigation (§1), and not sael.co's.
   - *Sustainability* — Story of Our Influence, Our Key ESG Metrics, Our Core Beliefs
   - *Investors* — Corporate Governance, Financials & Reports, Notifications, Investor Contact
3. **Corporate block** — present on the live site, absent from the prototype. **Include it**, it is legally useful. **The wordmark sits at the right-hand end of this row** as of 2026-08-27, address left; below `md` the two stack, address first:
   > SAEL INDUSTRIES LIMITED
   > Registered Office: H. No. 44, Model Town, Firozpur, Guruharsahai, Punjab, India, 152022
   > CIN: U40106PB2022PLC055755
   > Telephone: 011-44910011 · Email: (from `site.ts`)

   Place it above the divider. Confirm placement with design.
4. **Divider**, then legal bar: `© {currentYear} SAEL | All Rights Reserved` left; Privacy Policy, Disclaimer, Terms & Conditions right.

Background: `footer-background.jpg` over `--color-footer-bg`.

Notes:

- The year is computed at render, not hardcoded.
- The email on the live site is Cloudflare-obfuscated. Use a plain `mailto:` — obfuscation is theatre and it breaks accessibility.
- Below `md` the link groups become accordions and the top row stacks and centres. See `responsive-strategy.md`.
- **Column headings are underlined, and the two breakpoints underline them differently.** Above `md` the heading is static and takes a plain `underline underline-offset-8`. Below `md` the same heading is an accordion trigger, and a static underline there reads as a link on something that is a disclosure — so it becomes a rule that draws itself in from the left as the panel opens and retracts as it closes, on `--duration-underline`. It is CSS off the trigger's own `aria-expanded` via `group-aria-expanded:`, so `<Accordion>` needs no state of its own. Client's ask, 2026-09-03; contract in `design-guidelines.md` §5.
- `<nav aria-label="Footer">` around the link grid.

---

## 4. Root layout

`src/app/layout.tsx`:

- `<html lang="en">` with the DIN font variable class.
- Skip link to `#main-content` as the first focusable element.
- `<Header />`, `<main id="main-content">{children}</main>`, `<Footer />`.
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`; title template `%s | SAEL`.
- `Organization` and `WebSite` JSON-LD.
- Staging guard: emit `robots: { index: false, follow: false }` when `NEXT_PUBLIC_SITE_URL` is not the production host.

Also build `not-found.tsx` and `error.tsx` properly — branded, with the shell, and a route back to the homepage. These get seen during a migration more than anyone expects.

---

## Acceptance criteria

- [ ] Header matches the prototype at 1920px
- [ ] Dropdowns work on hover, click, and keyboard; close on `Esc` and on route change
- [ ] Mobile drawer: opens, traps focus, `Esc` closes, focus returns to the trigger, body scroll locked, closes on navigation
- [ ] The entire nav — desktop and mobile, including dropdowns — is operable with keyboard only
- [ ] Adding a route to `nav-config.ts` makes it appear in the desktop nav, the mobile drawer, and the sitemap with no other change
- [ ] Footer accordions work below `md`; four columns above
- [ ] No content is obscured by the fixed header, including when navigating to an `#anchor`
- [ ] At 360px there is no horizontal overflow: `document.body.scrollWidth === window.innerWidth`
- [ ] Reduced motion: no drawer slide, no header transition
- [ ] `axe` scan on a page with the drawer open: zero criticals
- [ ] `pnpm check` passes

## Blocked on

- SAEL logo as **SVG**, colour and white variants (`asset-inventory.md` §9)
- Design sign-off on the mobile drawer, which has no prototype reference

## On completion

Move to Done, promote **FE-04**.
