# Design Guidelines

**The source of truth is the built homepage.** Every value here is transcribed from
`src/styles/theme.css` and the components under `src/components/` as they stand at
commit `565a3dc`. Where a value originated in the Claude Designer prototype
(`SAEL Home.dc.html`) and has not since changed, this doc records the **computed pixel
value at the 1920px design width** — that is the number to build against, then scale down
per `responsive-strategy.md`.

This document is what a designer or a Claude Code session building a new page reads to
produce something visually consistent with the homepage. If it disagrees with the code,
the code is right and this file is stale — say so and fix it here.

**Rule: components consume tokens, never literals.** If you find yourself typing `#161616` or `8.13vw` inside a component, stop and use the token. `pnpm check` enforces this — a raw hex, an `rgb()` literal or a bare `vw` anywhere under `src/` outside `theme.css` fails the build.

---

## Change log

**2026-08-26 — reconciliation with the as-built homepage.** This document had drifted a
long way behind the code and is now realigned. Three things caused the gap:

1. **The design source reversed on 4 August 2026.** `SAEL - New Website.pdf` became the
   design and the Claude Designer prototype became reference only — the client's
   instruction was explicit. Recorded in `asset-inventory.md` §10 and tracked per section
   in `frontend-progress.md`. Where the two disagree on layout or composition, the PDF
   wins and the older `docs/features/` specs are the stale ones.
2. **`PR 2528: Homepage` (`565a3dc`)** built the page and, in doing so, nearly doubled the
   token layer — 231 declarations against the ~80 this document named.
3. **Three further rounds of client direction**, dated **2026-08-21**, **2026-08-22** and
   **2026-08-25**, landed inside that PR. They are the origin of the "SAEL Home v2" ground
   system, the new footer colours, the section-label underline and the hero progress bar.

What changed here: §1 gains the v2 ground, hairline, on-dark and header colour families
and twenty gradients; §2 gains thirteen type sizes and a rewritten uppercase rule; §3
gains the spacing, radius, shadow and aspect tokens actually in use; §4 is amended for the
header, the eyebrow, the rail and the card; §5 gains eight animations that had no recorded
reduced-motion contract; §6 splits the `priority` rule.

**Two rules added 2026-08-26, neither of which this document had ever stated.**
§1 gains **"The site is dark by default"** — dark is the starting point for everything
new, and a light-ground section must come from an explicit instruction rather than the
implementer's judgement. §3 gains **"Section snap scrolling"**, the homepage's
one-screenful-per-section behaviour: it was fully built and carefully reasoned in
`globals.css`, but the only trace of it here was a half-clause in one token's usage note,
so nothing told a new page how to opt in or what not to break.

**Amended again 2026-08-26, after the code fixes landed.** §1's interaction-state
exception is now a closed list rather than a clause; §2 gains a *Tracking* sub-section,
`--text-mega-head`, a corrected weight on `--text-nav` and the first account of inline
emphasis (**C-3**); §3 gains `--spacing-inset`, `--spacing-tight` and `--spacing-card-flow`
with two documented exclusions; **§4's Card spec was rewritten to the v2 primitive**
(**C-1**) — the old boxed spec described a surface v2 had removed; §5 and §6 record the
motion and imagery fixes as closed.

**2026-08-27 — marks are not photographs.** §6 gains a rule separating the two, after the
hero's slide marks were found centring themselves inside a square `<MediaFrame>`. It had
already been decided once, locally, in the business ledger; writing it down is what stops it
being decided a third time.

**2026-08-27 — the page now snaps all the way down.** §3's "the page's tail is
deliberately not snapped" is reversed: the last section's `scroll-margin-bottom: 150dvh`
is gone and the footer is a snap target. The 2026-08-06 exception existed to stop the pixel
strip being flung past unseen, and the strip has since become the footer's own top edge, so
it was protecting a divider that no longer sits between the two. The opt-in table gains the
footer's row, which explains why its alignment is a rule in `globals.css` and not a class.

**2026-08-27 — the two behaviours that pace the page were only half-recorded.** §4 gains
canonical specs for **`Reveal`** and **`CountUp`**. Both were built, both are load-bearing
on the homepage, and both appeared here only as a single row in §5's animation table —
enough to say what they animate, nothing about when to reach for them. §4 now carries the
props, the replay-on-every-pass contract, the two-observer asymmetry both share, and the
no-JS safety that `Reveal`'s script-applied hidden state exists to provide. With them, one
rule this document had never stated: **a figure the design singles out counts up**, and if
one figure in a row counts, every figure in that row counts. §8's new-page checklist and
§5's two table rows now point at those specs instead of standing alone.

Tokens belonging to cancelled or unbuilt surfaces are marked **deprecated** with a reason
and a date rather than deleted. The full finding-by-finding ledger, the decisions taken
and the outstanding code fixes are in **`docs/design-reconciliation.md`**.

---

> Two token names changed in FE-02, and the tables below carry the new names.
> `--color-body` became `--color-body-base`, because `--text-body` already
> claims the `text-body` utility for font-size and a name in both namespaces
> makes the colour unreachable; `--color-body-onDark` became
> `--color-body-on-dark` for consistency with every other token.
> See `src/styles/README.md`.
>
> A third changed in FE-04, for the same class of reason but a worse symptom.
> `--space-block` is implemented as **`--spacing-flow`**: Tailwind generates an
> `inline-size` utility for every spacing token, so `--spacing-block` minted an
> `inline-block` utility that collided with the core `display: inline-block`
> one and silently constrained every inline-block on the site to 24–50px wide.
> **When adding a spacing token, check the name against Tailwind's `inline-*`
> display utilities** — `inline-block`, `inline-flex`, `inline-grid`,
> `inline-table`.
>
> A fourth changed in FE-04. §3's `--shadow-tile` and `--shadow-tile-hover` ship as
> **`--drop-shadow-tile`** and **`--drop-shadow-tile-hover`**. The tile's elevation is a
> `drop-shadow` **filter**, not a `box-shadow` — filters apply before `clip-path` clips,
> which is the only way to get a shadow that follows the chamfered corner instead of
> being cut away with it. Tailwind mints `shadow-*` from `--shadow-*` and
> `drop-shadow-*` from `--drop-shadow-*`, so the namespace decides the name.

---

## 1. Colour

### Brand core

| Token | Value | Use |
|---|---|---|
| `--color-brand-red` | `#E40F14` | Primary brand red; CTA gradient midpoint; icon strokes |
| `--color-brand-red-deep` | `#AA0505` | Eyebrow gradient start |
| `--color-brand-blue` | `#0D2FA2` | Eyebrow gradient end |
| `--color-brand-purple` | `#45258D` | CTA gradient end |
| `--color-brand-yellow` | `#F9E800` | CTA gradient start (barely visible, off-canvas at -24%) |
| `--color-brand-crimson` | `#E43026` | Stats band gradient start |
| `--color-brand-indigo` | `#4A3290` | Stats band gradient end |
| `--color-accent-hover` | `#E11D34` | Link hover across the site |

### Neutrals

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#161616` | Headings |
| `--color-body-base` | `#333333` | Body copy on light |
| `--color-body-soft` | `#4A4A4A` | Secondary body (business tile copy) |
| `--color-body-muted` | `#2B2B2B` | About-section body |
| `--color-body-on-dark` | `#E6E9EE` | Body copy on dark backgrounds |
| `--color-surface` | `#FFFFFF` | Default section background |
| `--color-surface-alt` | `#F7F7F9` | Goals section background |
| `--color-surface-dark` | `#0B0D10` | Dark sections (hero track, vision) |
| `--color-surface-darker` | `#05070A` | Letterbox reveal panels |
| `--color-surface-deep` | `#111418` | Hero fallback behind imagery |
| `--color-border` | `#ECECEE` | Card borders (news cards) |
| `--color-rule` | `#D9D9D9` | ~~Stat divider rules~~ — **deprecated 2026-08-26**: the stats band was merged into the business tiles, and the dividers went with it |
| `--color-inert` | `#C7C7C7` | Placeholder fill (`MediaFrame`, at 10%) and map tooltip ground. No longer the goals-card resting background — see §4 |
| `--color-surface-map` | `#101819` | ~~Pan India Footprint ground~~ — **deprecated 2026-08-26**: the section was regrounded on `--color-surface-black` in PR 2528 |
| `--color-meta-paper` | `#6B6B73` | `--text-meta` label on a paper ground |
| `--color-tile-surface` | `#E8E9EB` | ~~Chamfered business-tile fill~~ — **deprecated 2026-08-26**: v2 sets the tile rows straight on the section's own ground. Still consumed by `ui/tile-shape.tsx`, which is itself unused — see §4 |
| `--color-footer-bg` | `#22262E` | Footer base. Cool slate, at the client's request **2026-08-22**; was `#3D4A48` |
| `--color-footer-icon` | `#1A1E25` | Social icon glyph fill; was `#2F3D3A`. A shade deeper than the ground — it is painted on a white pill in the footer and on `--color-surface-alt` in the mobile drawer, so it has to be the dark end of the pair |

### The site is dark by default

**SAEL's website is a dark-theme site. Dark is the default, and everything new is built
dark unless someone tells you otherwise.** *(Rule stated 2026-08-26.)*

This is not a preference to weigh against others when you start a section — it is the
starting point. A new page, a new section, a new component: assume
`--color-surface-black` and the dot grid, `text-body-on-dark`, `Eyebrow tone="bright"`,
`DisplayHeading ground="dark"`. If you find yourself reaching for the light ground, stop
and check whether anyone actually asked for it.

**Light is for highlighting, and it is not yours to choose.** A section may be set on the
light ground where the design deliberately lifts it out of the surrounding dark — that is
a real device and the built homepage uses it. But:

> **Every light-ground section must come from an explicit instruction — the client's, or
> the person running the session. Never decide it yourself.** If a spec does not say a
> surface is light, it is dark. If you believe a surface reads better light, say so and
> ask; do not build it light and flag it afterwards. An unrequested light section is a
> design decision taken without authority, and it is much harder to notice in review than
> a wrong colour, because nothing about it looks broken.

**Where the built homepage stands**, for reference — five dark surfaces against four
light, and each of the light ones was a specific instruction:

| Section | Ground |
|---|---|
| Hero carousel | `black` |
| Business portfolio | `black-dots` |
| Current Power Portfolio | `black-dots` |
| Solutions | `black-dots` |
| Our Goals | `black-dots` |
| About SAEL | `paper-dots` |
| Our Endeavour | `paper-dots` |
| In the News | `paper-dots` |
| Pixel strip | `ground-dots-paper` — not a `<Section>` |

**The inner pages' light sections**, all from the client's instruction of 2026-10-14,
which asked for the homepage's alternation on nine more pages. Every other section on
these pages stays dark.

| Page | On `paper-dots` |
|---|---|
| Solar Energy | Overview; "How We Reduce Cost?" |
| Module Manufacturing | Overview; Product Downloads + Manufacturing Prowess |
| Solar Cell Manufacturing | Overview; Highlights |
| Agri Waste-to-Energy | Overview; "Why Waste-to-Energy?" |
| Story of Our Influence | Public Health |
| Our Key ESG Metrics | Sustainable Development Goals |
| Our Core Beliefs | Environmental Stewardship; Our Biodiversity Commitment (and the ESG Report pill under it) |
| Career | Life at SAEL |
| About Us | Our Guiding Principles |

Each is a `ground="paper"` prop on its section. A section's marks take `ground="paper"`
too and draw the icon set's coloured no-tile variant in place of the white one. On a
business page the paper sections' eyebrows and headings are in the business's own ledger
ramp, the one its dark sections use: a trial, to judge it on paper first. A darkened
ramp, `--gradient-ledger-*-deep`, is defined and not in use; see `business-ramp-*` in
globals.css.

Record the instruction beside any new light section, the way `frontend-progress.md`
records the ones above. A ground with no recorded reason is the one a later session will
"correct".

> **Open point — `<Section>`'s own default is still `white`.** `defaultVariants` in
> `ui/section.tsx` is `background: 'white'`, so a `<Section>` with no `background` renders
> light. That predates this rule and now contradicts it. It is **not** changed here,
> because `error.tsx`, `not-found.tsx` and the dev design-system page all rely on the
> default and would flip to dark — a visual change to two real routes, which needs a
> ruling rather than a refactor. **Until it is settled, pass `background` explicitly on
> every new `<Section>`** and do not rely on the default at all.

### Grounds — "SAEL Home v2"

Added in PR 2528. The design alternates two grounds, each carrying the same 13px dot
grid. Both sit a shade off the surfaces above — `--color-surface-dark` stays the
*header's* ground — so they are their own tokens rather than a nudge to those.

| Token | Value | Use |
|---|---|---|
| `--color-surface-black` | `#08090C` | The dark ground |
| `--color-paper` | `#FBFBF9` | The light ground |
| `--color-paper-alt` | `#F4F4F2` | Paper, one step down |
| `--gradient-dot-dark` | `radial-gradient(circle at center, rgb(255 255 255 / .028) 0, rgb(255 255 255 / .028) var(--spacing-dot-radius), transparent calc(var(--spacing-dot-radius) + 0.5px))` | Dot grid on black |
| `--gradient-dot-paper` | `radial-gradient(circle at center, rgb(20 24 32 / .04) 0, rgb(20 24 32 / .04) var(--spacing-dot-radius), transparent calc(var(--spacing-dot-radius) + 0.5px))` | Dot grid on paper |

> The `+ 0.5px` feather is load-bearing, not a rounding artefact. Without it, a zoom level
> that lands the dot on a fraction of a device pixel can round the whole grid away to
> nothing — the dropout the client reported on **2026-08-25**. Half a pixel of feather
> always leaves something to paint, at any zoom and any DPR, and is invisible at 100%.
> Grid pitch and dot radius are `--spacing-dot-grid` and `--spacing-dot-radius`, §3.

### Hairlines

A rule on the black ground and a rule on paper are the same design element at two
opacities, not two elements.

| Token | Value | Use |
|---|---|---|
| `--color-hairline-dark` | `rgb(255 255 255 / .16)` | Rule on the black ground |
| `--color-hairline-grid` | `rgb(255 255 255 / .14)` | Grid rule on black |
| `--color-hairline-paper` | `rgb(20 24 32 / .18)` | Rule on paper |
| `--color-hairline-paper-soft` | `rgb(20 24 32 / .2)` | Paper rule, heavier |
| `--color-hairline-on-media` | `rgb(255 255 255 / .38)` | Rule drawn over a photograph rather than a flat ground — more than twice `--color-hairline-dark` because it has to survive whatever is underneath it |

### Copy on dark

`--color-body-on-dark` is the solid case. These three are its quieter steps, and they are
tokens rather than opacity modifiers on `white` for the reason §1 exists at all — a
colour that appears in a component but not in this table is a colour nobody can find.

| Token | Value | Use |
|---|---|---|
| `--color-on-dark-soft` | `rgb(230 233 238 / .72)` | Secondary copy on dark |
| `--color-on-dark-faint` | `rgb(230 233 238 / .62)` | Tertiary copy on dark |
| `--color-on-dark-muted` | `rgb(230 233 238 / .55)` | Quietest copy on dark |

> **Alpha modifiers are not a colour source.** `text-white/72` and its relatives are a
> colour that exists nowhere in this document and cannot be changed from the token layer.
> Use the three tokens above. The footer was the last place carrying them as design
> colours and was converted on 2026-08-26 (**C-10**).
>
> The one sanctioned exception is a value that is a **wash over an unknown ground, or a
> transient interaction state**, rather than a colour in its own right. **The exception is
> closed — these five are all of it:**
>
> | Site | Value | Why it is not a colour |
> |---|---|---|
> | `Button` | `bg-white/10` | Hover wash; the ground underneath varies by variant |
> | `ui/rail/rail-arrows` | `bg-ink/5` | Same, on the light ground |
> | `mega-menu.tsx:145` | `border-nav-accent/50` | Hover border — a fade of `--color-nav-accent` toward its own ground, not a second accent |
> | `mega-menu.tsx:152` | `border-nav-accent/40` | …the quieter of the pair |
> | `media-frame.tsx:68` | `bg-inert/10` | The missing-asset placeholder. Not a design colour at all — it marks an absence and is deleted with the placeholder branch |
>
> A sixth is a sign that a token is missing, not that the list should grow.

### Header

The masthead's own set. Structure taken from the client's `SAEL Home v2` design and its
two opacities; the hue is ours, because this site's bar is light and stays light (client
note, **2026-08-25**).

| Token | Value | Use |
|---|---|---|
| `--color-nav-link` | `rgb(28 32 40 / .82)` | Nav link at rest |
| `--color-nav-accent` | `#7A1F57` | Hovered or current nav link — the CTA gradient's mid-stop, so the bar reads as one family |
| `--color-header-hairline` | `rgb(20 24 32 / .09)` | Hairline under the bar, at rest |
| `--color-header-hairline-scrolled` | `rgb(20 24 32 / .13)` | …once scrolled |
| `--color-header-veil` | `rgb(255 255 255 / .7)` | Translucent fill, at rest |
| `--color-header-veil-scrolled` | `rgb(255 255 255 / .86)` | …once scrolled |
| `--color-header-solid` | `rgb(255 255 255 / .96)` | Fallback where `backdrop-filter` is unsupported |
| `--color-mega-rule` | `rgb(20 40 32 / .12)` | Mega-menu row rule |
| `--color-mega-head-rule` | `rgb(160 160 160 / .28)` | Mega-menu column-head rule |

### Section-specific

| Token | Value | Use |
|---|---|---|
| `--color-eyebrow-accent` | `#8A2380` | The flat `accent` eyebrow tone — see §4 |
| `--color-hero-track` | `rgb(255 255 255 / .16)` | Unfilled hero progress track |
| `--color-tile-upcoming` | `rgb(255 255 255 / .07)` | "Upcoming" business row wash |
| `--color-tile-upcoming-edge` | `rgb(255 255 255 / .13)` | ~~…its edge~~ — **deprecated 2026-08-26**: no consumer |
| `--color-pixel-1` … `-6` | `#F5C000` `#F28C00` `#E8262A` `#B81F6A` `#7B2382` `#4632A0` | The pixel strip's six-stop ramp. **Live** — read at runtime by `footer-pixel-strip/scatter.tsx` through `getPropertyValue()`, so no static reference exists and a search will wrongly call them dead. The reader was `pixel-strip/scatter.tsx` until that section was retired on 2026-08-27; the tokens did not go with it |

**Business capacity figures.** Four colours, keyed to each business's mark rather than all
four sharing brand red. These are the on-dark pair; a colour that clears 4.5:1 on a light
tile is not the same colour that clears it on `--color-surface-black`.

| Token | Value | Business |
|---|---|---|
| `--color-figure-solar-bright` | `#E8865C` | Solar |
| `--color-figure-cell-bright` | `#CF74C4` | Cell |
| `--color-figure-module-bright` | `#3FBF99` | Module |
| `--color-figure-agri-bright` | `#8FC44A` | Agri waste |

**Share-price ticker.** Declared, no consumer yet — the surface is not built. Green is the
design's "up" colour and means something, so it is named for its meaning rather than its
appearance. `--color-quote-up` `#0E9C6A` · `--color-quote-up-ink` `#0B7A4F` ·
`--color-quote-down` `#C22F3A` · `--color-quote-label` `#526B62` · `--color-quote-value`
`#141A18` · `--color-quote-muted` `#8A9A92`. **Deprecated 2026-08-26** pending a decision
on whether the ticker is still in scope.

### Gradients

Declare these as tokens; do not re-type the stops.

| Token | Value | Use |
|---|---|---|
| `--gradient-eyebrow` | `linear-gradient(90deg, #AA0505 0%, #0D2FA2 100%)` | Section eyebrows, clipped to text |
| `--gradient-cta` | `linear-gradient(105deg, #F9E800 -24%, #E40F14 6%, #45258D 95%)` | "Know More" / primary buttons |
| `--gradient-stats` | `linear-gradient(90deg, #E43026 0%, #4A3290 100%)` | Stats band |
| `--gradient-wash-strength` | `linear-gradient(270deg, rgba(254,0,0,.31) 0%, rgba(0,31,134,.31) 76.53%)` over `#fff` | "Our Strength" section |
| `--gradient-wash-strength-stacked` | as above, vertical | The same wash below `lg`, where the section reflows to one column and the tint has to read top-to-bottom |
| `--gradient-wash-goals` | `linear-gradient(120deg, rgba(170,5,5,.05) 0%, rgba(13,47,162,.05) 100%)` over `#F7F7F9` | "Our Goals" section |

**Section labels and headings.** Added in PR 2528. `bright` and `deep` are the same travel
at two weights — one built for the black ground, one darkened to carry on paper — because
the sections they label alternate between the two, and a label legible on one is illegible
on the other.

| Token | Value | Use |
|---|---|---|
| `--gradient-eyebrow-bright` | `linear-gradient(90deg, #8F83E0 0%, #D95A95 52%, #FF6A6E 100%)` | `<Eyebrow tone="bright">`, on black |
| `--gradient-eyebrow-deep` | `linear-gradient(90deg, #2B215F 0%, #8A1F43 55%, #C91D2F 100%)` | `<Eyebrow tone="deep">`, on paper |
| `--gradient-heading-bright` | `linear-gradient(90deg, #7D6FD4 0%, #CF3F7F 52%, #FF4A4F 100%)` | Display heading on black, clipped. Brighter than the eyebrow ramp at both ends — this is display type carrying the section |

**Hero.**

| Token | Value | Use |
|---|---|---|
| `--gradient-hero-fill` | `linear-gradient(90deg, #F5C000 0%, #E8262A 33%, #B81F6A 55%, #7B2382 78%, #4632A0 100%)` | Progress bar. Walks the pixel-strip ramp end to end so the bar fills **once over the whole cycle**, not four times over four slides — client request, **2026-08-21** |
| `--gradient-hero-word-1` | `linear-gradient(92deg, #FFD23D 0%, #FF7A3D 55%, #FF5470 100%)` | Slide 1 headline highlight |
| `--gradient-hero-word-2` | `linear-gradient(92deg, #8CE6A6 0%, #3FD2C4 55%, #4FA9E2 100%)` | Slide 2 |
| `--gradient-hero-word-3` | `linear-gradient(92deg, #FF7AC0 0%, #D07AE8 100%)` | Slide 3 |
| `--gradient-hero-word-4` | `linear-gradient(92deg, #ECF25C 0%, #7AD657 100%)` | Slide 4 |
| `--gradient-hero-scrim-side` | `linear-gradient(90deg, rgb(6 7 10 / 0) 0%, … .88 100%)` | Scrim above `lg`. Takes no angle from the slide — v2 has one composition, not four |
| `--gradient-hero-scrim-stacked` | `linear-gradient(0deg, rgb(6 7 10 / .92) 0%, … .3 100%)` | Scrim below `lg` |
| `--gradient-hero-foot` | `linear-gradient(0deg, rgb(6 7 10 / .55) 0%, transparent 30%)` | Under the progress bar, so the track never lands on a bright patch of photograph |

**Navigation, cards and sections.**

| Token | Value | Use |
|---|---|---|
| `--gradient-nav-cta` | `linear-gradient(100deg, #2B1A6B 0%, #7A1F57 48%, #D81F35 100%)` | Masthead "Contact Us" — see §4 |
| `--gradient-mega` | `radial-gradient(…)` | Mega-menu panel ground |
| `--gradient-mega-hot` | `linear-gradient(…)` | Mega-menu lit column |
| `--gradient-date-chip` | `linear-gradient(90deg, #16357E, #2F8F3F)` | `<DateBadge variant="pill">` |
| `--gradient-goal-reveal` | `linear-gradient(180deg, rgb(8 9 12 / .28) 0%, rgb(8 9 12 / .62) 46%, rgb(8 9 12 / .9) 100%)` | Goals card scrim. **On hover only** — at rest the photograph is shown untreated |
| `--gradient-shape` | `linear-gradient(114.87deg, #3035AA 11.4%, #8A1E42 63.3%, #FB3633 88.6%)` | About SAEL shape. **Back on 2026-09-01**, **restated 2026-09-02** to `aboutSael/mask.svg`'s own ramp when the client supplied that file. `multiply` over a desaturated, `brightness-150` photograph. The angle and stops are the SVG's `userSpaceOnUse` line remapped onto a CSS one — computed, not eyeballed, and valid only while the box holds `--about-shape-aspect` |

**Deprecated 2026-08-26** — declared, no consumer, kept rather than deleted:

| Token | Why |
|---|---|
| `--gradient-caption` | Superseded in PR 2528; the solutions plate now sets `--text-meta` on paper |
| `--gradient-goal-hover` | Goals cards are photographs now, not grey boxes that reveal a gradient |
| `--gradient-timeline` | Vision timeline not built — `features/04` §8 says ask before building |
| `--gradient-footprint` | Footprint label redesigned in PR 2528 |
| `--gradient-rule-left` / `-right` | Belonged to `FlankedEyebrow`, which folded into `Eyebrow` |
| `--gradient-hero-scrim` / `-scrim-mobile` / `-vignette` | Replaced by the `-side` / `-stacked` / `-foot` set above |
| `--gradient-header` | Deleted — the v2 bar is a flat veil, not a vertical gradient. See §4 |

**Eyebrow implementation** — recurring pattern, built once in `components/ui/eyebrow.tsx`:

```css
background: var(--gradient-eyebrow);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```
Include a `@supports not (background-clip: text)` fallback to `--color-brand-red-deep`.
The `gradient-text` utility in `globals.css` carries both. Four tones and the rule
underneath are specified in §4.

### SDG palette

> **Cancelled 2026-08-26.** The SDG marquee was dropped at the client's request on
> **2026-08-05** and no other surface consumes these. The palette, `--radius-sdg` and
> `--text-sdg-num` are kept against the sustainable-development-goals page (FE-15) needing
> them; nothing on the homepage does. Do not treat them as live design.

Official UN colours. Do **not** adjust for contrast — they are prescribed. Use white text at weight 700 over them (all pass AA at the card's 34px+ numeral size).

`#3 #4C9F38` · `#5 #FF3A21` · `#7 #FCC30B` · `#8 #A21942` · `#9 #FD6925` · `#10 #DD1367` · `#11 #FD9D24` · `#12 #BF8B2E` · `#13 #3F7E44` · `#15 #56C02B`

> Note: `#7 #FCC30B` (Affordable & Clean Energy) with white text is below 4.5:1. The prototype uses it as designed and the UN brand guidelines mandate it. Keep it, but ensure the card title is also exposed as accessible text and not conveyed by colour alone.

---

## 2. Typography

**Family:** DIN — supplied by the client as `DIN.ttf` (400) and `DIN Bold.otf` / `DIN Bold.ttf` (700).

Load with `next/font/local`, converted to **WOFF2** and subset to `latin`. Declare `display: 'swap'` and a `fallback` of `['system-ui', 'sans-serif']`. Two weights only — do not synthesise 500/600; where the prototype specifies `font-weight: 500` or `600`, round to 400 or 700 as noted below.

> Licensing: DIN is a commercial typeface. Only client-supplied files. Never fetch from a CDN. See `architecture.md` Open Decision #2.

### Type scale (values at 1920px; see `responsive-strategy.md` for the fluid ramp)

| Token | Desktop | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `--text-hero` | 58px | 400 | 1.08 | 0.2px | Hero H1 |
| `--text-h2` | 36px | 700 | 1.15 | — | Section headings |
| `--text-h3` | 22px | 700 | 1.30 | — | **Sub-section heading** — a heading inside a section, below the `h2`. Reclassified 2026-08-26: this was "news card titles", which now take `--text-card-title`. Generic infrastructure, currently between consumers; About Us is the expected next one |
| `--text-stat` | 40px | 700 | 1.0 | — | Stats band figures |
| `--text-milestone` | 36px | 400 | 1.0 | — | ~~Timeline year labels~~ — **deprecated 2026-08-26**: vision timeline not built |
| `--text-sdg-num` | 56px | 700 | 1.0 | — | ~~SDG card numeral~~ — **deprecated 2026-08-26**: marquee cancelled 2026-08-05; held for FE-15 |
| `--text-goal-title` | 26px | 700 | 1.2 | 1px | ~~Mission/Vision/Ethos, uppercase~~ — **deprecated 2026-08-26**: superseded by `--text-goal-name`, which is 400 and sentence case |
| `--text-body` | 20px | 400 | 1.55 | — | Body copy |
| `--text-body-sm` | 17px | 400 | 1.5 | — | Footer links |
| `--text-label` | 16px | 400 | 1.35 | 1px | Small label. **Sentence case** — the uppercase stat-label role went with the stats band when it merged into the business tiles. *Amended 2026-08-26; see the uppercase rule below* |
| `--text-nav` | 16px | **700** | 1.0 | 0.2px | Masthead CTA — its only consumer. **Amended 2026-08-26 (C-3)**: declared 400 while the CTA overrode it to 700 at the call site, which §4 had documented all along |
| `--text-eyebrow` | **15 → 18px** | 700 | 1.0 | 0.1563em | Section eyebrows, uppercase. **Amended 2026-08-26**: was a flat 16px; PR 2528 made it fluid |
| `--text-cta` | 17px | 700 | 1.0 | 1px | Button labels, uppercase |
| `--text-badge` | 14px | 700 | 1.0 | 0.3px | Date badges |

### Type scale — added in PR 2528

Thirteen sizes the v2 design needed and the prototype did not have. Ranges are min → max
across the 360 → 1920 fluid ramp, per `src/styles/README.md`.

| Token | Range | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `--text-display` | 30 → 64px | 400 | 1.02 | -0.028em | v2 section display heading |
| `--text-stat-large` | 36 → 76px | 700 | 0.9 | -0.04em | Headline figure |
| `--text-ledger-figure` | 36 → 72px | 700 | 0.9 | -0.04em | Business ledger capacity figure |
| `--text-ledger-figure-long` | 28 → 58px | 700 | 0.9 | -0.04em | …the same, where the string is long |
| `--text-goal-name` | 22 → 34px | 400 | 1.15 | -0.02em | Goal name — **sentence case**, not uppercase |
| `--text-plate-title` | 16 → 20px | 400 | 1.25 | -0.01em | Solutions plate title |
| `--text-card-title` | 15 → 17px | 400 | 1.42 | -0.01em | News card title |
| `--text-meta` | 11 → 12.5px | 700 | 1.5 | 0.2em | Uppercase metadata label — the workhorse of the v2 sections |
| `--text-action` | 12 → 13px | 700 | 1.0 | 0.18em | Uppercase inline action ("Read More") |
| `--text-nav-item` | 11px | 700 | 1.18 | 0.18em | Desktop nav link |
| `--text-mega-head` | 14 → 16px | **700** | 1.35 | 0.0625em | Mega-menu column heading. `--text-label`'s metrics at 700 — a distinct role that shares a size, minted 2026-08-26 (**C-3**) so `--text-label` can stay 400 for the footer |
| `--text-tile-note` | 11 → 12px | 400 | 1.35 | — | Capacity figure footnote |
| `--text-tile-marker` | 12 → 14px | 700 | — | — | "Upcoming" superscript |
| `--text-footprint-title` | 21 → 26px | 700 | 1.2 | 0.02em | ~~Map footprint label~~ — **deprecated 2026-08-26**: no consumer after the PR 2528 map rework |

### Tracking

Each size token carries its own `letter-spacing`. One role needs a value its size token
does not have, and it gets a token rather than a literal:

| Token | Value | Use |
|---|---|---|
| `--tracking-strapline` | `0.25em` | The mega menu's strapline, which takes `--text-badge`'s size but is set far wider than that token's own `0.0214em` |

> Kept as an exact-equivalent token rather than folded into `--text-meta`. `--text-meta`
> is a different size, tracking *and* line-height, so that swap is a visual change — see
> the note under **C-4** in `docs/design-reconciliation.md`.

Notes:

- The hero H1 is **regular weight at 58px**, not bold. This is deliberate and is the most-often-broken detail in the design.
- The prototype's About CTA specifies `font-family: 'Inter'` on one button. That is a prototype slip. **Everything is DIN.**
- **Uppercase belongs to the token, not the call site.** Headings and body copy are sentence case as written in the copy, never CSS `text-transform`. **Exactly five roles are uppercase** — `--text-eyebrow`, `--text-meta`, `--text-action`, `--text-nav-item`, `--text-cta` — and the list is closed. A sixth uppercase surface is a sign that one of the five is the right token, not that the rule needs widening. **Goal names are not uppercased**: `--text-goal-name` is sentence case at 400, and that is the client's design. *(Rule restated 2026-08-26; it previously named eyebrows, stat labels, goal titles and CTAs, two of which no longer exist as surfaces.)*
  - *Closed 2026-08-26.* The footer's column headings were the one live breach — `--text-label` set uppercase. They are sentence case now (**C-12**), which is why `--text-label`'s own row reads as it does. The rule was **not** widened to accommodate them, and the alternative — moving them to `--text-meta` — was rejected because it would have resized and re-weighted the headings under cover of a token cleanup.
- **Weight comes from the token.** Each `--text-*` declares its own `--font-weight`; that is what makes this a scale rather than a list of sizes. Do not override it with `font-bold` / `font-normal` at the call site — if a role needs a different weight it needs a token, or the token's weight is wrong. `font-synthesis-weight: none` is set on `body`, so a weight DIN does not have will not be faked.
  - **DIN has exactly two weights, 400 and 700.** There is no 500 and no 600. A weight override is therefore never a nudge — it is the full width of the typeface's range, which is why one is always worth stopping over.
  - **The one sanctioned override: emphasis within body copy.** A run of text inside a body-size role may take `font-bold` to mark it as the subject of its block — a company's legal name in an address, a tooltip's title above its description. This is a typographic need with no token of its own, because it is *inline emphasis within a size*, not a role that owns a size: minting `--text-body-sm-strong` would create a token whose only distinguishing property is the one thing the call site is already saying.
    **It applies to body tokens only.** Not to headings, not to labels, and not to any token whose role already carries a weight — those have a weight *because* the role decided one, and overriding it is the breach this rule exists to catch. The two conforming sites are `footer.tsx:95` and `presence-map.tsx:209`. *(Rule added 2026-08-26 — **C-3**; §2 previously had no account of emphasis at all, which is why those two read as breaches when they are not.)*
  - *Closed 2026-08-26 (**C-3**).* The other two overrides were real and are gone. `header-cta.tsx` set `font-bold` over `--text-nav`, whose declared 400 was simply wrong — the CTA is its only consumer and §4 has always documented it at 700, so the **token** was corrected. `mega-menu.tsx` set `font-bold` over `--text-label`, which has genuine 400 consumers in the footer, so the column head got **its own token**, `--text-mega-head`.

### Adding a type token

**A new `--text-*` token must also be added to `FONT_SIZES` in `src/lib/utils/cn.ts`.**

`tailwind-merge` decides whether `text-*` is a font size or a text colour by matching
against Tailwind's *default* scale. Every size in this system is a custom `@theme` token,
so an unregistered one falls through to the **colour** group — and the moment it meets a
real colour, the two look like two colours and the later one wins:

```
cn('text-hero text-white')   // → 'text-white'   the size is gone
cn('text-h3 text-ink')       // → 'text-ink'
```

There is no error and no warning; the element simply renders at the inherited body size.
This shipped in FE-02 and was found in FE-04 in the hero headline (58px rendering at
16px), the date badge and the empty state.

---

## 3. Layout and spacing

### Page gutter

The prototype uses `8.13vw` = **156px at 1920**. Expressed as a token:

| Token | 360px | 768px | 1024px | 1440px | 1920px |
|---|---|---|---|---|---|
| `--gutter` | 20px | 40px | 64px | 104px | 156px |

Implement as a single `<Container>` primitive. **No section sets its own horizontal padding.** Full-bleed sections (hero, plant banner, pixel strip, SDG marquee) opt out by not using `<Container>`, and place a `<Container>` around their inner text instead.

Max content width: none — the design is fluid to the viewport. But cap body-copy measure at `--measure: 68ch` so text does not run to 1600px on ultrawide.

### Vertical rhythm

Prototype section padding is `5vw 8.13vw 5.5vw` ≈ 96px top / 105px bottom at 1920.

| Token | Mobile | Desktop | Use |
|---|---|---|---|
| `--space-section-y` | 48px | 96px | Standard section top/bottom |
| `--space-section-y-tight` | 40px | 65px | "Our Presence", "Solutions" |
| `--space-block` *(built as `--spacing-flow`)* | 24px | 50px | Heading → content gap |
| `--space-stack` | 12px | 24px | Within a text block |

**Below `--space-stack`.** Two further steps, **approved 2026-08-26**:

| Token | Mobile | Desktop | Use |
|---|---|---|---|
| `--spacing-inset` | 16px | 24px | Padding inside a **card or panel** — the distance from its edge to its content. **Not** component chrome: see the exclusion below |
| `--spacing-card-flow` | 16px | 24px | The gap between a card's **body and its footer** — the space above a "Know More", not padding at an edge |
| `--spacing-tight` | 8px | 12px | Icon and inline gaps |

**Minted and migrated 2026-08-26 (C-11).** Before these existed, anything tighter than
12px fell back to Tailwind's generic 4px scale — which is how a card ended up `p-4` in one
section and `p-5 lg:p-6` in another, with nothing to arbitrate. Eight card and panel
surfaces now share the three tokens; the convergence moved each by at most 4.6px at any
width.

`--spacing-card-flow` carries the **same curve** as `--spacing-inset` — deliberately, so a
card's inset and its internal division read as one rhythm rather than two. It is named
apart because it is *flow*, not inset: a future card should be able to ask for the gap it
means without borrowing a token that describes an edge. Adjusting one without the other is
a legitimate design move; sharing a single token would have foreclosed it.

**What is *not* on these tokens:**

- **Component chrome with its own spec** — `Button`'s padding (§4), the accordion, the
  masthead, the mega menu, pagination. **A permanent exclusion, not a pending migration.**
  Each of these is a documented component decision in §4, and a generic inset token
  applied over it would overwrite a decision with a default. `--spacing-inset` is for card
  and panel *interiors*; where §4 specifies a component's padding, §4 wins.
- **`presence-map`'s `gap-1.5`** — a **named exception**, 6px, kept as it is. It sits
  beside a 4px bullet; `--spacing-tight` would take it to 8–12px, which is proportionally
  large next to a mark that size. Proportion to the adjacent object is the governing
  constraint here, not membership of the scale. Do not "fix" this to a token.

### Section snap scrolling

**On the homepage each section scrolls as one screenful.** The browser corrects where a
scroll comes to rest so it lands on a section boundary. This is **CSS scroll-snap and
nothing else** — a GSAP `Observer` that replaced scrolling with one-gesture-per-section
paging was removed on 2026-08-06, because `preventDefault: true` is what makes paging work
and it costs the browser's own momentum and rubber-banding on touch. Do not reintroduce a
scroll-hijacking library. The full reasoning is in the comment above the rules in
`src/styles/globals.css`.

**How a page opts in — three parts, all three required:**

| Where | What | Why |
|---|---|---|
| The page | Wrap the sections in `<div data-snap-sections>` | `globals.css` matches `html:has([data-snap-sections])`, so snapping is scoped to the page that wants it and the root layout never has to know which routes those are |
| Each section | `data-snap-section` on the `<Section>` | Gets `scroll-snap-stop: always` |
| Each section | A `snap?: boolean` prop, applied as `snap && 'min-h-viewport snap-start'` | The section is a screenful and aligns to the top. **The prop is how a section stays reusable** — the same component on a non-snapping page renders at its natural height |
| The footer | `data-snap-section` on `<footer>`, with its `scroll-snap-align` set in `globals.css` | It is the last stop. The alignment cannot be a class on the footer: `<Footer>` is in the root layout and renders on every page, so `snap-start` there would be a property of the footer when it is really a property of *this page* snapping. A section can carry the class because it takes a `snap` prop and only a snapping page passes it |

```tsx
<div data-snap-sections>
  <HeroCarousel slides={heroSlides} />
  <IntroSplit {...aboutSael} snap />
  …
</div>
```

**Four decisions behind it, none of which should be changed casually:**

1. **The document is the scroll container**, not a `height: 100dvh; overflow-y: scroll`
   wrapper. A wrapper snaps just as well and breaks everything around it: mobile browsers
   only collapse their address bar for the *document* scroller, `Home`/`End` and
   find-in-page stop behaving, and the footer ends up inside the scrolling box.
2. **`mandatory`, not `proximity`** — the client wants one scroll to land on the next
   section every time. Mandatory is safe here because the spec handles the tall-section
   case: a snap area larger than the snapport may rest anywhere that keeps it covering the
   viewport (css-scroll-snap-1 §6.2), so a section taller than a screen scrolls freely
   inside itself and snaps only at its own edges.
3. **`scroll-snap-stop: always`** on every section, so a hard fling stops at the *next*
   boundary rather than sailing through three.
4. **`scroll-padding-top` is `--spacing-header`**, set on `html`, so a `snap-start` section
   aligns *under* the fixed bar rather than behind it. **These two must stay in step** — a
   change to the header height that does not reach the scroll padding puts every section's
   top edge under the masthead.

**The page snaps all the way down, footer included** — the client's decision on
**2026-08-27**. Every section snaps, and then the footer snaps, and there is no longer a
tail that behaves differently from the rest.

> **This reverses a rule that stood here from 2026-08-06 to 2026-08-27, and the reversal is
> not a change of mind.** The tail used to be ordinary scroll: the *last* section's snap
> area was extended past the end of the document with `scroll-margin-bottom: 150dvh`,
> making news-to-end one oversized area, which under point 2 above may rest anywhere that
> covers the viewport. The reason was the pixel strip — snapping from news straight to the
> footer flung a 182px divider past too fast to see. **The strip is now the footer's own
> top edge** rather than a band between the two (see `sections/footer-pixel-strip/`), so
> landing on the footer *is* landing on the strip, and the exception had nothing left to
> protect. `scroll-margin-bottom` is gone; do not restore it without restoring a mid-page
> divider first.

**The footer needs no height rule.** At most widths it is shorter than the viewport, so its
aligned position falls past the maximum scroll offset — which needs no handling, because
snap positions are clamped to the scrollable range and the last stop is simply the end of
the document with the footer fully in view. On a short viewport where the footer is taller
than the screen, point 2 applies to it exactly as it does to the tall Solutions carousel.
Both are correct; neither is a special case. **Do not give the footer `min-h-viewport`** to
"make it a screenful" — that buys nothing and adds empty space at every width where the
footer is already close to a screen tall.

> **Sizing a snapping section.** `--spacing-viewport` is `calc(100dvh - var(--spacing-header))`
> — one screenful below the fixed bar, consumed as `min-h-viewport`. It is a **minimum**,
> not a fixed height: a section whose content needs more is allowed to be taller, and
> point 2 above is what keeps that from breaking. Never set a fixed `height` on a section
> to make it snap.

> **Check a snapping section at 360px and at a short laptop viewport.** `dvh` is what makes
> this survive a collapsing mobile address bar, and it is the value to reach for; `vh` is
> not. A section that only just fits at 1920 will overflow its own snap area on a 768px-tall
> screen, and the user then cannot reach the part that overflowed without the browser
> pulling them to the next boundary.

### Component and section spacing

Added in PR 2528. Values are min → max across the fluid ramp unless a single figure is
given.

| Token | Value | Use |
|---|---|---|
| `--spacing-header` | **68px** | Masthead height, `<main>` offset and `scroll-padding-top`. One token, three consumers, so they cannot disagree. **Amended 2026-08-26**: was 84px desktop / 64px mobile; v2 is flat |
| `--spacing-viewport` | `calc(100dvh - var(--spacing-header))` | One screenful below the fixed bar — what a snapping section is measured against |
| `--spacing-touch` | 44px | WCAG floor for a touch target |
| `--spacing-dot-target` | 24px | Narrow axis of a hero dot's hit area — WCAG 2.5.8's minimum, used where a 44px square would space a row of controls apart rather than hold them together |
| `--spacing-nav-gap` | 4 → 18px | Between two masthead links |
| `--spacing-logo` | 42px (`2.625rem`) | Masthead logo above `lg`. Below it the mark is `h-8` (32px), already a step on the spacing scale. **Held in `rem` deliberately**: the literal it replaced was `42px`, which did not respond to browser font scaling while the `h-8` beside it always did. Both now scale together, which is the behaviour the rest of the system already has |
| `--spacing-dot-grid` | 13px | Dot-grid pitch |
| `--spacing-dot-radius` | 1.5px | Dot radius — see §1 for the feather |
| `--spacing-rail-gap` | 12 → 18px | Between two cards on a rail. Deliberately tighter than `--gap-grid`: a rail reads as one continuous strip, and the grid gap opens it into separate objects |
| `--spacing-rail-gap-wide` | 16 → 36px | …where the cards are large |
| `--spacing-rail-gap-hair` | 1px | …where the cards butt together |
| `--spacing-rail-arrow` | 56px | Round rail arrow |
| `--spacing-rail-arrow-sq` | 52px | Square rail arrow |
| `--spacing-news-card` | 238 → 330px | News card width |
| `--spacing-solution-card` | 250 → 440px | Solutions card width |
| `--spacing-goal-card` | 320 → 500px | Goals card min-height |
| `--spacing-goal-card-sm` | 210 → 290px | …below `md` |
| `--spacing-goal-icon` | 60 → 126px | Goal mark |
| `--spacing-ledger-icon` | 69 → 132px | Business ledger mark |
| `--spacing-ledger-col-gap` | 24 → 72px | Business ledger column gap |
| `--spacing-hero-icon` | 74 → 176px | Hero watermark symbol |
| `--spacing-hero-pad-top` | 72 → 108px | Hero copy inset, top |
| `--spacing-hero-pad-bottom` | 60 → 96px | …bottom |
| `--spacing-hero-rule-w` / `-rule-h` | 52px / 2px | Hero eyebrow rule |
| `--spacing-hero-progress` | 44px | Hero progress bar hit area |
| `--spacing-hero-track` | 3px | …its visible track |
| `--spacing-map` | `min(38rem, …)` | Dotted India map, capped so the section still fits one screen |
| `--map-pin-share` | 1.2057 (% of the map's width) | Solid square at a pin's centre: its width as a share of the map's width, height 1:1. In `:root`, not `@theme`; consumed through `cqw` |
| `--spacing-pixel-strip` | 182px | Pixel strip height — 26 rows of 7px |
| `--spacing-rule-w` / `-rule-h` | 44px / 3px | Section accent rule |
| `--spacing-rule-accent` | 2px | Thin accent rule |
| `--spacing-icon-mark` | 40 → 48px | ~~Business icon mark~~ — **deprecated 2026-08-26**: no consumer after the v2 tile rework |

### Measures and maximum widths

| Token | Value | Use |
|---|---|---|
| `--measure` | `68ch` | Running body copy |
| `--hero-measure` | `15ch` | Hero headline |
| `--ledger-measure` | `46ch` | Business ledger copy |
| `--map-copy-w` | `40rem` (640px) | Map section copy column |
| `--map-rule-w` | `9rem` (144px) | Map section rule |
| `--endeavour-max-w` | `75rem` | "Our Endeavour" row |
| `--endeavour-media-w` | `31rem` | …its artwork |
| `--about-media-max-w` | `min(100%, calc(min(58vh, 32.5rem) * 605 / 412))` | About composite, capped so the section fits one screen |
| `--business-max-w` | `72.5rem` (1160px) | ~~Business grid~~ — **deprecated 2026-08-26**: no consumer after the v2 ledger rework |

### Aspect ratios

| Token | Value | Use |
|---|---|---|
| `--aspect-news-thumb` | **`5 / 4`** | News card thumbnail. **Amended 2026-08-26**: was `16 / 10` |
| `--aspect-plate` | `4 / 3` | Solutions plate |
| `--aspect-endeavour` | `511 / 488` | "Our Endeavour" artwork |
| `--about-aspect` | `605 / 412` | About SAEL artwork box — the frame the three layers are measured in |
| `--about-shape-aspect` | `973 / 620` | …the chamfered shape inside it — `aboutSael/mask.svg`'s viewBox, which its path fills exactly. **Was** `354.45 / 225.97`, `14.svg`'s path bounding box, until 2026-09-02; the same ratio to four decimals |
| `--aspect-map-india` | `311.33 / 337.45` | Dotted India map viewBox |

### The About SAEL artwork — assembled, 2026-09-01

Three supplied layers, put together in the browser: `aboutSael/burning-crop.png`
masked into `aboutSael/mask.svg`'s silhouette, graded by `--gradient-shape`, with
`aboutSael/sardar-kid-cropped.png` standing in front of it.

`mask.svg` arrived on **2026-09-02** and replaced a derivation from `14.svg`.
Same silhouette to the decimal, but drawn in the design's orientation and tight
to its viewBox, where `14.svg` is mirrored and padded ~21 units a side — so the
`rotate(180)` and the retightened viewBox that stood in the token are gone. It
also carries the ramp `--gradient-shape` now transcribes. **`14.svg` is not the
source for this section any more**; treat `mask.svg` as the shape of record.

**Every figure is a proportion.** There is no length and no breakpoint in the
composition — it is the same picture at 360px as at 1920px, which is the whole
reason it is expressed this way. `aboutSael/sardar-kid-cutout.png`, the composite
the client approved, is the reference the figures were fitted against; it is no
longer rendered.

| Token | Value | Use |
|---|---|---|
| `--about-shape-inset-x` | `2.5%` | The shape's inset from the left and right of the artwork box. It sits flush with the foot, so narrowing it is what lowers its top edge — this is what buys the cut-out the room to break that edge |
| `--about-cutout-x` | `2.5%` | The cut-out's offset from the shape's left edge — measured **against the shape**, not the artwork box |
| `--about-cutout-w` | `37%` | …and its width, against the shape. Width only: the figure's own ratio gives the height, which lands at 109% of the shape's — taller than what it stands in front of, deliberately |
| `--mask-about-shape` | `url("data:image/svg+xml,…")` | `aboutSael/mask.svg`'s path verbatim, with `fill` changed to opaque white — a mask reads alpha, and the ramp is `--gradient-shape`'s job. Inlined rather than `url(../assets/…)` — a `url()` inside a custom property is an unparsed token stream, and a mask that fails to resolve fails silently |

### Grid

| Section | Mobile | Tablet | Desktop |
|---|---|---|---|
| Stats band | 1 col | 2 col | 4 col |
| Business tiles | 1 col | 2 col | 2 col |
| Goals triad | 1 col | 1 col | 3 col |
| News grid | 1 col | 2 col | 3 col |
| Footer links | 1 col (accordion) | 2 col | 4 col |

Gutters: `--gap-grid` 16px mobile → 31px desktop (prototype `1.6vw`).

### Radius and elevation

| Token | Value | Use |
|---|---|---|
| `--radius-card` | 14px | News cards, footer logo plate |
| `--radius-nav-cta` | 16px | Masthead "Contact Us" — see §4 |
| `--radius-pill` | 999px | Carousel dots, social buttons, rail arrows |
| `--radius-none` | 0 | CTA buttons and the map pin — square by design |
| `--radius-sdg` | 16px | ~~SDG cards~~ — **deprecated 2026-08-26**: marquee cancelled 2026-08-05; held for FE-15 |
| `--radius-quote` | 18px | ~~Share-price ticker~~ — **deprecated 2026-08-26**: surface not built |
| `--drop-shadow-tile` | `0 12px 22px rgb(20 24 32 / .10)` | Business tile at rest. A `drop-shadow` filter, not a `box-shadow` — see the rename note in the preamble |
| `--drop-shadow-tile-hover` | `0 26px 40px rgb(20 24 32 / .16)` | …on hover |
| `--shadow-card-hover` | `0 22px 44px rgb(20 24 32 / .14)` | News card hover |
| `--shadow-tooltip` | `0 8px 24px rgb(0 0 0 / .35)` | Map pin tooltip |
| `--shadow-nav-cta` | `0 10px 24px -8px rgb(216 31 53 / .5)` | Masthead CTA |
| `--shadow-nav-cta-hover` | `0 16px 30px -8px rgb(216 31 53 / .6)` | …on hover |
| `--shadow-hero-text` | `0 2px 26px rgb(0 0 0 / .5)` | Hero headline, over photography |
| `--shadow-goal-title` | `0 2px 18px rgb(0 0 0 / .55)` | Goal name and mark. They sit on an untreated photograph at rest, so they carry their own separation rather than leaning on a scrim that is not there |
| `--shadow-quote` / `-hover` | `0 16px 34px -18px rgb(6 40 30 / .45)` / `0 16px 44px -16px rgb(6 40 30 / .5)` | ~~Share-price ticker~~ — **deprecated 2026-08-26** |

> **The map pin moved onto the scale 2026-08-26 (C-6).** It was the last `rounded-xs` on
> the site — Tailwind's own 2px default, not a token, on a 7px square. `--radius-none` is
> both the nearest token and what `presence-map`'s own comment already asked for ("a hard
> square"), so the pin's corners lost 2px of rounding and gained a token. That is the only
> rendered difference in the fix.

> **`--shadow-header` was removed 2026-08-26.** The v2 masthead has no shadow at any
> scroll position — it separates itself with the hairline and the opacity step alone. The
> token had no other consumer. `--radius-nav-pill` and `--color-nav-pill` went with the
> pill nav in the same rework.

### Stacking order

Three fixed layers, and the order between them is the point: the drawer covers the bar it
was opened from, and the skip link clears both, because a keyboard user who cannot see
where focus went has no way back. A scale rather than three numbers at three call sites —
which is how the third one ends up underneath the first.

| Token | Value | Use |
|---|---|---|
| `--z-header` | `100` | The fixed masthead |
| `--z-drawer` | `110` | Mobile nav drawer, over the bar |
| `--z-skip-link` | `120` | Skip link, over everything |

Tailwind v4 has no z-index namespace, so these live in `:root` and are consumed
functionally: `z-(--z-header)`.

### Glass, filter and transform amounts

*Added 2026-08-26 as part of C-4, which tokenised the last of the magic numbers. Every
value is the one that was already rendering; nothing here changed the design.*

| Token | Value | Use |
|---|---|---|
| `--blur-header` | `22px` | Masthead veil. A `--blur-*` token, so it drives `backdrop-blur-header` |
| `--blur-mega` | `30px` | Mega-menu panel. **New documented value** — the surface post-dates this document and its blur had never been recorded. Heavier than the masthead's on purpose: the bar sits over whatever the page is scrolled to and needs only enough blur to keep a nav label legible, while the panel covers the viewport and has to render what is behind it as texture rather than as content |
| `--saturate-glass` | `1.4` | Paired with both blurs — the design saturates the two panes by the same amount, so one token serves both |
| `--brightness-cta-hover` | `1.08` | The primary CTA's hover. A filter rather than a second gradient, so the button lifts without the stops being restated |
| `--lift-card` | `5px` | News card hover lift |
| `--lift-social` | `3px` | Footer social button hover lift |
| `--scale-goal-rest` | `1.02` | A goal card's photograph at rest — held slightly over-size so it has room to move without an edge coming into frame |
| `--scale-goal-hover` | `1.06` | …on hover. Under reduced motion the photograph stays at the resting value |

Tailwind has no namespace for saturate, brightness or scale, and `translate-*` reads the
spacing scale, which these distances are not on — so all but the two blurs live in `:root`
and are consumed functionally: `brightness-(--brightness-cta-hover)`,
`-translate-y-(--lift-card)`, `scale-(--scale-goal-hover)`.

### Motion tokens

Durations and easings live in the token layer so a transition cannot drift off the scale.
The three §5 standards plus the additions PR 2528 needed:

| Token | Value | Use |
|---|---|---|
| `--duration-micro` | 180ms | Micro-interactions: hover, focus |
| `--duration-card` | 280ms | Card hovers |
| `--duration-reveal` | 550ms | Scroll reveals |
| `--duration-reveal-step` | 90ms | Stagger between reveal steps |
| `--duration-underline` | 720ms | A rule drawing itself in: the section eyebrow's, and the footer accordion head's (**2026-09-03**) |
| `--duration-header` | 300ms | Masthead firming on scroll |
| `--duration-mega` | 450ms | Mega-menu panel |
| `--duration-mega-step` | 60ms | Stagger between mega-menu columns |
| `--duration-cross-fade` | 1100ms | Hero slide cross-fade |
| `--duration-parallax` | 500ms | Hero parallax follow |
| `--reveal-shift` | 28px | Distance a revealing element travels |
| `--ease-entrance` | `cubic-bezier(.2,.8,.2,1)` | Entrances |
| `--ease-letterbox` | `cubic-bezier(.7,0,.2,1)` | Letterbox wipe |

---

## 4. Components — canonical specs

### Button / CTA ("Know More")

- Background `--gradient-cta`, square corners, white uppercase label at `--text-cta`.
- Padding `12px 33px` desktop (prototype `0.63vw 1.7vw`), `10px 24px` mobile.
- Hover: `filter: brightness(1.08)`, 180ms.
- Focus-visible: 2px offset outline in `--color-brand-blue`.
- Variants via `cva`: `primary` (gradient), `ghost` (text + underline on hover), `onDark`, plus two added in FE-04:
  - `outline` — the gradient held back until wanted: an outline at rest, filling on hover. For a grid of cards where four solid gradient buttons compete with the content they belong to. The border is drawn with the same gradient via `border-image`, which takes no radius — so the variant is square, as it already is by design.
  - `quiet` — ink until the pointer arrives, then brand red and underlined. For a link at the foot of a card that should not shout over the headline above it.
- Renders as `<Link>` when `href` is passed, a plain `<a>` when that href leaves the site, `<button>` otherwise. Never a `<div>` with `onClick`.
- The font size lives on the `size` variant, not the base — `--text-cta` and `--text-action` are both registered font sizes, so they would merge correctly, but only one can be right for a given button and one source is simpler than a merge that has to be trusted.

### Masthead CTA — a second, deliberate button

`components/layout/header/header-cta.tsx` is **not** `<Button variant="primary">`, and
that is intentional. The page's CTA is square, `--gradient-cta`, `--text-cta`. The
masthead's is a different object in the client's design: `--radius-nav-cta` (16px),
`--gradient-nav-cta`, `--text-nav` at 700, `--shadow-nav-cta` lifting to
`--shadow-nav-cta-hover`. Forcing one primitive to be both would mean three new variants
on a component used everywhere; it shares the token layer instead, which is where the
coupling belongs.

Shown from `xl`, not `lg` — at 1024 the logo, six nav items and a 130px button overrun the
content width. Between `lg` and `xl` the bar is logo plus nav, and Contact Us is the last
item of the drawer's own list.

### Header

*Amended 2026-08-26 for the v2 masthead. The previous spec described the pill nav and
per-item dropdowns, both replaced in the 2026-08-05 rework.*

- Fixed, height **68px at every width** (`--spacing-header`), `z-index: 100`.
- A flat translucent veil — `--color-header-veil` at rest, `--color-header-veil-scrolled`
  once scrolled — with `backdrop-filter: blur(22px) saturate(1.4)`.
- Bottom hairline `--color-header-hairline`, firming to
  `--color-header-hairline-scrolled`. **No shadow at any scroll position.**
- The scroll threshold is **8px**, not the 80 the previous bar waited for.
- The transition runs `--duration-header` on background and border colour only.
- Logo height 42px desktop / 32px mobile.
- Desktop nav gap is `--spacing-nav-gap` (4 → 18px). *The prototype's 42px is dead: the
  links carry their own padding and tracking, and a 42px gap on top of that read as six
  separate buttons rather than one bar.*
- Provide a `@supports not (backdrop-filter: blur())` fallback of `--color-header-solid`.
- **The glass is painted on an inner layer, not on `<header>` itself.**
  `backdrop-filter` makes an element a containing block for `position: fixed`
  descendants, so with the filter on the header the mobile drawer's `fixed inset-0` would
  resolve against the 68px bar and render as a sliver across the top.

### Card

`components/ui/card.tsx`. **Rewritten 2026-08-26 (C-1) to match the built homepage.**

A v2 card is three things: **a top hairline, an inset below it, and an accent that fills
across the hairline on hover or focus.** That is the whole primitive. Both homepage
consumers — the news card and the business ledger row — are that shape, and were carrying
an identical six-line accent span each.

| Prop | Values | Meaning |
|---|---|---|
| `ground` | `paper` \| `dark` | Which hairline the card hangs from — `--color-hairline-paper` or `--color-hairline-dark`. Follow the section's ground |
| `inset` | `top` \| `block` | `pt-inset` for a card whose last element closes it; `py-inset` for a row in a stack of rows |
| `frosted` | `boolean` | **`outlined` on paper only; does nothing elsewhere.** Frosted glass: `--color-surface-frosted` face, `--blur-frosted-card` + `--saturate-frosted-card` backdrop blur, `--color-outline-frosted` frame, `--shadow-frosted-card` elevation. Opt-in, off by default. On for the business pages' outlined cards (2026-10-14). The cards' `<Reveal>` must not keep `will-change` — see below |
| `accentClassName` | a colour class | The accent's colour. **Omit to render no accent** — a card that is not interactive should not suggest it is |
| `as` | `div` \| `article` \| `section` | Defaults to `div`, so a card that is not a self-contained composition is not announced as one |

**`frosted` and `<Reveal>`.** `<Reveal>` keeps `will-change: opacity, transform` on its box,
and an ancestor with `will-change: opacity` is a backdrop root, so a `backdrop-filter` inside
it sees only what that ancestor contains and blurs nothing behind it. A reveal that wraps a
frosted card therefore takes `will-change-auto!` (`<ValueGridLayout>` does it). Not visible
with `prefers-reduced-motion: reduce`, which drops the hint: check in the normal-motion mode.

The accent is `scaleX` from a left origin at `--duration-card`, `aria-hidden` (it repeats
what a focus ring already says), and `group-focus-within` mirrors `group-hover`
throughout — a card reached by keyboard behaves as it does under a pointer.

**What the primitive deliberately does not own:** flex direction, column gaps, and the one
upcoming ledger row's own ground. Those are each section's composition; folding them in
would make this a switch statement over two callers.

> **What this replaced, and why.** Until 2026-08-26 this section specified a `news`
> variant — white, `1px solid --color-border`, `--radius-card`, hover lifting `-5px` with
> `--shadow-card-hover` — and a `tile` variant wrapping its children in `ui/tile-shape.tsx`
> at `--tile-chamfer` (44px), lifting `-8px`. **v2 removed both surfaces.** The news card
> lost its box; the business tiles became rows of a ledger. Neither variant had a call
> site, so that spec survived only in this document and in the primitive itself,
> describing a page that no longer existed. The homepage is authoritative, so the
> primitive was changed to match it rather than the other way round.
>
> **`ui/tile-shape.tsx` is now unreferenced outside the dev design-system page.** It is
> not deleted — the chamfer is real, well-implemented work and may return — but it has no
> consumer, and `--drop-shadow-tile`, `--drop-shadow-tile-hover` and `--lift-card` are
> stranded with it. Listed in `docs/design-reconciliation.md` §5 for a ruling.
> If the chamfer does return: **do not import `rtile-*.svg`.** Those files are a single
> path with `preserveAspectRatio="none"`, so stretching one to a tall mobile tile turns
> its corner radii into ellipses, and the fill is hardcoded where a token belongs. The
> elevation must stay a `drop-shadow` on the wrapper rather than the clipped child,
> because filters apply before `clip-path` clips.

The news thumbnail keeps `aspect-ratio: var(--aspect-news-thumb)` (**5/4**, amended
2026-08-26) with `object-fit: cover`. That lives in the section, not the primitive — it is
the shape of that section's artwork, not of a card.

### Section heading

`components/ui/section-heading.tsx` — eyebrow → title → description, with the spacing
between them decided once. Renders `h2` by default; pass `as="h1"` on the one heading per
page that is the page title, and `as="h3"` where the section sits inside another. Heading
level is a document-structure decision and the component will not guess it; size comes
from the token, because level is about structure and size is about hierarchy.

> **Status 2026-08-26: used by `error.tsx` and `not-found.tsx`, and that is correct.**
> Both pass `as="h1"`, an eyebrow, a title and a description — the exact composition this
> primitive was written for. Unlike `Card`'s zero call sites (**C-1**), two correct
> consumers are not a defect.
>
> **It is not adopted by any homepage section, and that is a documented non-defect —
> do not re-raise it.** *(Surveyed and closed 2026-08-26, **C-2**.)* Of the seven sections
> that have a heading, **four are an `<Eyebrow>` and nothing else**, and the other three
> wrap **each** of label, heading and copy in its **own `<Reveal order={n}>`** so they
> cascade one after another. `Reveal` *is* the box and carries a single `--reveal-order`,
> so a primitive rendering three siblings inside one `<div>` cannot express that stagger at
> all. A primitive that rendered `Reveal`s itself would break `error.tsx`, a client error
> boundary with no scroll to observe — scroll observation does not belong inside a heading.
> **This is a structural mismatch, not a styling one**, and it is a fact about the
> homepage's composition rather than a fault in this primitive.
>
> **Its role is the single-block heading**: eyebrow, title and description arriving
> together, on a page that is not built on the reveal cascade. The two error pages are
> exactly that, and any future page that does not stagger its sections should use it too.
>
> **A new page should not read this as licence to hand-roll a heading.** In a section that
> cascades: `<Eyebrow>` with the tone matching the ground, `<DisplayHeading>` for the
> heading (below), each in its own `<Reveal>` with an ascending `order`.

### Display heading

`components/ui/display-heading.tsx` — `--text-display` with a gradient clipped to the
letterforms. **This is the v2 section heading**, and the one to reach for on a new page.
Extracted 2026-08-26 (**C-2**) from `intro-split`, `solutions-carousel` and
`presence-map`, which had written the same three classes out by hand.

| Prop | Values | Meaning |
|---|---|---|
| `ground` | `paper` \| `dark` | Selects the ramp. `paper` → `--gradient-eyebrow-deep`; `dark` → `--gradient-heading-bright` |
| `as` | `h1` \| `h2` \| `h3` | `h2` by default. Level is a document-structure decision and the component will not guess it |

**The ramp follows the ground, and that is the whole reason this primitive exists.**
Getting the pair wrong is the fastest way for a section to look off-system, and the trap
has a sharp edge: the dark heading takes **`--gradient-heading-bright`, not
`--gradient-eyebrow-bright`** — the latter is a different ramp belonging to the *label*
above it. Encoding the pairing in a variant is what stops a call site having to remember
that.

**Deliberately not props:** the measure cap (`max-w-(--hero-measure)`) and the top margin
(`mt-stack`). Both vary across the three call sites, because they depend on what the
heading sits beside — a cap keeps it clear of a column, a margin spaces it under a label —
and neither is a property of the heading. They stay in `className`.

`DisplayHeading` and `SectionHeading` are **not alternatives**. This one is a heading and
nothing else, for a section that wraps each element in its own `<Reveal>`. That one is
eyebrow → title → description as a single block, for a page outside the reveal cascade.

### Eyebrow

`components/ui/eyebrow.tsx`. A `<p>`, never a heading — it reads like a kicker, but
marking it up as one would put an empty level in the document outline.

**Four tones**, all in the system because all four are in use:

| Tone | Fill | Where |
|---|---|---|
| `gradient` | `--gradient-eyebrow` clipped to the letterforms | The prototype's red→blue. Default |
| `accent` | flat `--color-eyebrow-accent` | The client's earlier design. The one flat tone |
| `bright` | `--gradient-eyebrow-bright` clipped | v2 sections on the black ground |
| `deep` | `--gradient-eyebrow-deep` clipped | v2 sections on paper |

**The rule underneath is on by default.** It is not decoration on a particular section —
it is what a section label looks like, and the client's **2026-08-25** note asks for it on
all of them. A label that wants to go without passes `underline={false}`, which is the
right way round: the odd one out carries the justification.

The rule takes the label's own ramp, so picking a tone picks both and the two read as one
object rather than as a heading with a line under it. It draws itself in from the left as
its section arrives — see §5 — and its width comes from a `w-fit` wrapper, so it is
exactly as wide as the text without anything having to measure the text.

### Rail

`components/ui/rail/` — a horizontally scrolling row of cards with paging arrows. Shared
by Solutions and In the News. The rail owns scrolling, snapping, the arrows and gutter
alignment; **how wide a card is belongs to the caller**, as a class on each `<li>`.

**It is a real scroll container, not a transformed strip**, and that single decision is
what keeps it small: it works before the bundle arrives, touch and trackpad and
shift+wheel and momentum are the platform's problem, and there is no index in state that
can disagree with the rendered position. The arrows are an *addition* to a carousel that
already works, not the mechanism of one.

Tokens: `--spacing-rail-gap` / `-wide` / `-hair` for the gap, `--spacing-rail-arrow` and
`--spacing-rail-arrow-sq` for the two arrow shapes.

### Arrow glyph

`components/ui/arrow-glyph.tsx` — one shared chevron/arrow, replacing the per-component
inline SVG that preceded it. Drawn as a path rather than set as `‹` / `›`: those are
punctuation, so they sit on the text baseline and cannot be optically centred without a
magic offset, and they render at a different weight in every fallback font.

### Date badge

Rebuilt in CSS, **not** the prototype's `date-badge.svg`. That file stretches with
`preserveAspectRatio="none"`, so its 16px angled notch skews the moment the date string
changes length — and "Jun 1, 2026" and "December 31, 2026" are different lengths. Renders
`<time>`, so the machine-readable instant travels with the human one.

- `notch` — the angled chip, via `clip-path` with `--badge-notch` (16px) and
  `--gradient-eyebrow`. Asymmetric padding: the notch eats into the right edge and the
  text needs clearance from it.
- `pill` — the rounded chip on `--gradient-date-chip`, at `--radius-pill`.

> **Status 2026-08-26: `DateBadge` has no call sites — neither variant.** The homepage news
> card sets its date with `--text-meta` instead. The primitive is **kept, awaiting FE-18
> (Newsroom)**, which is the obvious consumer. Do not delete it, and do not build a third
> date treatment on About Us without checking here first.
### Reveal — the scroll entrance

`components/ui/reveal.tsx`. **This is how content arrives on this site.** Every section on
the homepage is built on it, and a new section that renders its content plainly will look
wrong next to one that does not — not because the entrance is decoration, but because the
whole page is paced by it.

`Reveal` **is the box**, not a wrapper around one: it takes the `className` the element
would have had, so nothing extra lands in the layout tree and the component can carry a
section's own positioning.

| Prop | Type | Meaning |
|---|---|---|
| `order` | `number` (default `0`) | Stagger position. Each step delays the start by `--duration-reveal-step`, so a label lands before the heading and the heading before the copy |
| `className` | `string` | Applied to the revealing element itself |

**Spec:** `opacity 0→1` with `translateY(--reveal-shift)→0` over `--duration-reveal` on
`--ease-entrance`, delayed `order × --duration-reveal-step`. Values from §3's motion
tokens — never a raw `duration-*` and never a hand-written travel distance.

Four behaviours a new page inherits and must not re-invent:

- **It replays on every pass.** The client's decision, **2026-08-06** — it was once-only
  before that. Two observers do the work and their asymmetry is deliberate: the *reveal*
  observer fires 10% up from the bottom edge so content starts a beat after it appears;
  the *reset* observer re-arms at the true viewport edge, only once the element is
  **completely** off screen, because resetting at the reveal margin would visibly fade
  content back out while it still sits in the bottom tenth of the screen.
- **The hidden state is applied by script, never by the server.** The stylesheet only
  hides an element once `<html>` carries `reveal-ready`, which the component adds on
  mount. Ship `opacity: 0` in the HTML instead and a browser that never runs the bundle
  shows a blank section for ever. **Do not "simplify" this into a static hidden state.**
- **Anything already properly in view at mount is revealed synchronously**, before the
  observer is wired, so it never flashes hidden for a frame. The threshold is 75% of the
  viewport height, not the fold: every section on a snapping page starts resting exactly
  *on* the fold, and a `top < innerHeight` test would reveal all of them at once and
  animate none.
- **Motion is gated in CSS**, and both the transition *and* the hidden state live inside
  the `prefers-reduced-motion: no-preference` block — §5's standard, and the inversion of
  it is the bug closed as **C-7**.

**The eyebrow's rule rides the same attribute** rather than observing anything of its own;
see `Eyebrow` above and `.anim-underline` in §5.

`Reveal` is a client component by necessity, and it is the *only* client boundary most
sections need — the section around it stays a Server Component. /CLAUDE.md §5.

### CountUp — the figure ticker

`components/ui/count-up.tsx`. Counts a figure up from zero as it scrolls into view, every
time it does.

> **The rule: a figure the design singles out counts up.** If a section sets a number at
> `--text-stat-large`, `--text-ledger-figure`/`-long`, or any other display-scale type
> whose job is to be *the* thing in its row, it is wrapped in `<CountUp>`. Wrapping one
> figure in a row and not its neighbour is the failure this rule exists to prevent — a row
> of figures must animate as a row. Numbers set in body copy, in a table, in a date or in
> a label do **not** count up; the treatment marks a headline figure, and applying it to
> ordinary numbers spends the emphasis it exists to create.

| Prop | Type | Meaning |
|---|---|---|
| `value` | `string` | The finished string exactly as it should read — `"3625 MW + 5 GW"`, `"164.9 MW"` |
| `durationMs` | `number` (default `1500`) | Milliseconds for the whole run |

**Spec:** every digit run inside `value` counts from zero to its target over `durationMs`
on ease-out cubic, triggered on intersection 10% up from the bottom edge — the same margin
`Reveal` uses, so a figure and the block around it arrive together.

- **It animates the numbers inside a string, not a number.** These figures are
  pre-formatted by the business: `"3625 MW + 5 GW"` is two quantities and two units in one
  value, and `content-model.md` §2 is explicit that the frontend must not compose them. So
  the string is split on its digit runs, each run counts independently, and the text
  between them — units, separators, the `+` — is emitted verbatim and never animates.
- **Decimals are preserved.** `"164.9"` counts in tenths and lands on `164.9`. Rounding it
  to `165` would print a figure the company does not publish.
- **Every figure takes the same time, whatever it counts to**, so a row finishes together
  instead of the small numbers landing first and the ledger settling in pieces.
- **The width is reserved by the final string** — the finished value renders underneath,
  invisible but taking its full box, with the ticker over it. Without that, a counter
  growing from one digit to four drags its whole row along with it. **Pair it with
  `tabular-nums`** so the digits do not jitter as they change.
- **Reduced motion prints the value and stops**, gated in JS by `useReducedMotion()` — not
  in CSS, because the intermediate values are generated in script. Assistive technology
  always gets the final string: `aria-hidden` on the ticker, the real value in `sr-only`.
- **The figure is real content, not decoration.** Where `IntersectionObserver` is missing
  it counts immediately and never re-arms — a card reading `0 MWp` because a callback
  never arrived is worse than one that never animated. A null figure from the repository
  renders the row without it rather than printing a zero.

**Live consumers:** the business ledger's capacity figures (`business-tiles`) and the two
footprint figures over the map (`presence-map`). Both sections are Server Components apart
from this one client leaf.


---

## 5. Motion

All prototype animations, with their required mobile/reduced-motion behaviour.

| Name | Spec | Where | `prefers-reduced-motion` |
|---|---|---|---|
| `saelKen` | `scale(1.04) → scale(1.12)`, 9s ease forwards | Hero image Ken Burns | **Disable** — hold at `scale(1)` |
| `fxWord` | `opacity 0→1`, `translateY(32px)→0`, `blur(9px)→0`, 700ms, stagger 55ms/word | Hero headline | **Disable** — render at rest |
| `fxLetter` | `scaleY(1)→0`, 1s `cubic-bezier(.7,0,.2,1)` | Letterbox reveal panels on load | **Disable** — panels absent |
| `fxFill` | `width 0→100%`, linear over the slide interval | Active carousel dot | **Disable** — dot shows static active state |
| `sdgMarquee` | `translateX(0 → -50%)`, 44s linear infinite | SDG strip — *cancelled 2026-08-05, keyframes still shipped* | **Disable** — becomes a horizontally scrollable list |
| `dotPulse` | box-shadow pulse, 2.4s infinite | Timeline milestone dots — *not built* | **Disable** |
| `sparkFlick` | opacity 0.85↔1, 900ms infinite | Timeline travelling spark — *not built* | **Disable** |
| Hero parallax | `mousemove`-driven translate: image 10px | Hero. *Reduced in PR 2528 to the image only; `--hero-parallax-symbol` and `-text` are deprecated* | **Disable**; also inert on touch (no pointer) |
| Timeline path draw | `stroke-dashoffset` driven by scroll over a 220vh track | Vision section — *not built* | **Jump to complete state** |
| `saelKenMedia` / `.anim-ken-burns-media` | `scale(1.16) → scale(1)`, 6s `ease-in-out` **infinite alternate** — a 12s round trip | The masked photograph in **About SAEL and Our Endeavour**. One animation, not one each: the two sections are the same construction, so sharing it is what keeps them from drifting apart. Ambient and endless, unlike the hero's one-shot — neither is tied to a slide that expires. Added **2026-09-01**, shared **2026-09-02** | **Disable** — hold at `scale(1)`. A loop has no end state to rest at, so the still state is the cycle's open framing rather than either extreme |
| Footer accordion head rule | `scaleX(0→1)` from a left origin, `--duration-underline` `--ease-entrance`, driven by `group-aria-expanded:` on the trigger | The footer's four link columns **below `md` only**, where the headings are accordion triggers. Above `md` the same headings take a static `underline underline-offset-8` and this does not apply. Added **2026-09-03** | **Disable transition** — rule tracks the panel, present when open and absent when closed |
| `saelSettle` / `.anim-about-settle` | `scale(1.16) translate3d(2.5%, -1.5%, 0) → scale(1.02)`, `--ease-entrance`, gated on `[data-reveal='shown']` | — **declared, no consumer.** A reveal-triggered settle, superseded by the breathing loop above on 2026-09-02. Kept rather than deleted, like the deprecated gradients | **Disable** — hold at `scale(1.02)` |

### Added in PR 2528

Eight behaviours the v2 homepage introduced. Contracts below are **as implemented at
`565a3dc`**, except where noted.

| Name | Spec | Where | `prefers-reduced-motion` |
|---|---|---|---|
| `.anim-reveal` | `opacity 0→1` + `translateY(--reveal-shift)→0`, `--duration-reveal`, staggered `--duration-reveal-step` per `--reveal-order` | **Every section**, via `ui/reveal.tsx` — full spec in §4 | **Disable** — content simply present. Both the transition *and* the hidden state live inside the media query |
| `.anim-underline` | `scaleX(0→1)` from a left origin, `--duration-underline`, same stagger | The rule under a section eyebrow | **Disable** — rule drawn at full width |
| `.anim-track-fill` | `clip-path: inset(0 100% 0 0) → inset(0)`, linear over the slide interval | Hero progress bar | **Disable** — bar reads as simply filled |
| `.anim-map-ping` | `scale(1)→scale(2.6)`, `opacity .55→0`, 2.6s infinite, offset `--anim-index × 420ms` so pins do not pulse in lockstep | Map pin halo | **Disable** — halo absent; the solid pin underneath is always there |
| `.anim-drawer-in` | `translateX(100%)→0`, 280ms `--ease-entrance` | Mobile nav drawer | **Disable** — drawer already open when it renders; the slide is decoration on top |
| `.anim-mega-col` | `opacity 0→1` + `translateY(--reveal-shift)→0`, `--duration-mega`, staggered `--duration-mega-step` per `--mm-index` | Mega-menu columns | **Disable** — columns present as soon as the panel opens |
| `CountUp` | Every digit run in the string counts from zero over 1500ms, ease-out cubic, on intersection 10% up from the bottom edge; replays on every pass | **Every highlighted figure**, via `ui/count-up.tsx` — full spec and the rule for when a figure counts are in §4 | **Disable** — final value printed immediately. Gated in JS by `useReducedMotion()`, not CSS |
| Card lift & media zoom | `translateY` on the card at `--duration-card`; `scale(1.06)` on its photograph | News cards, goal cards, rail arrows | **Disable transition**; goal cards keep a `scale(1.02)` resting nudge, which is a state change rather than motion |

> **`.anim-mega-col` was corrected on 2026-08-26 (C-7)** and now matches this table. It
> had declared its *hidden* state unconditionally, with only the transition inside the
> media query — the inversion of the standard below. Both now live inside it, so the
> resting state is the unconditional one. Its travel also moved from a raw
> `translateY(22px)` to `--reveal-shift` (28px), which is the same distance every other
> entrance on the site uses. Nothing was exposed by the inversion: the panel carries its
> own `opacity-0 pointer-events-none` and `inert={!open}`, so the column's `opacity: 0`
> was the animation's starting point, never what hid it.

Standards:

- Transitions default to `180ms` for micro-interactions, `280ms` for card hovers, `550ms` for scroll reveals. **Take these from the token layer** — `--duration-micro`, `--duration-card`, `--duration-reveal` — never as a raw Tailwind `duration-*`, and never one role's token on another's element.
  - *Closed 2026-08-26 (**C-8**).* The news card's thumbnail zoom was the one live breach — a card hover running on `--duration-reveal` (550ms) inside a card running on `--duration-card` (280ms), so the photograph lagged the lift it was part of. Both are on `--duration-card` now. A reveal token on a hover is the specific mistake this standard is worded to catch.
- Easing: `--ease-entrance` for entrances, `ease-out` for parallax follow, `linear` for progress fills.
- Animate `transform` and `opacity` only. Never `width`/`height`/`top`/`left`. Two sanctioned exceptions, both bounded: the `fxFill` dot is 34px wide, and `.anim-track-fill` animates `clip-path` rather than laying anything out.
- **Every animation is inside a `@media (prefers-reduced-motion: no-preference)` block**, or gated by the `useReducedMotion()` hook. **The default state is the still state, not the other way round** — an element whose hidden state is unconditional is one selector away from being stranded at `opacity: 0` for ever, which is the failure this rule exists to prevent.
- Hover-only affordances must have a non-hover equivalent. Where content lives behind a hover — the goals card description — gate it on `hover-hover:` (`@media (hover: hover) and (pointer: fine)`) so touch devices get both states stacked and visible. Tailwind's bare `hover:` fires on touch too, on the tap that precedes a click.
- **Keyframe internals are a sanctioned literal zone.** The timings and distances *inside* `@keyframes` and their `.anim-*` classes in `animations.css` — the 55ms word stagger, `9s`, `2.4s`, `scale(2.6)`, `0.75rem` — stay as literals. They are the definition of a single named animation rather than values shared across components, and tokenising them buys indirection without buying reuse. *(Decision recorded 2026-08-26.)* Durations that a **component** applies still come from the token layer, per the first standard above.

---

## 6. Imagery

- All raster images through `next/image`. `sizes` is mandatory on every fill image — an unset `sizes` ships a 1920px asset to a phone and is a build-review rejection.
- Decorative images: `alt=""` plus `aria-hidden`. Both halves, always — `alt=""` keeps the image out of the accessible *name*, `aria-hidden` keeps the node out of the *tree*. With only the first, a screen reader can still land on an unlabelled graphic while walking the section. *Closed 2026-08-26 (**C-9**): `MediaFrame`'s image branch had the first and not the second, and now derives `aria-hidden` from `alt === ''`.*
- Hero slides carry meaningful `alt` describing the scene, not the brand.
- **`priority` is for genuine LCP candidates, and there are three.** *(Rule split 2026-08-26; it previously read "hero slide 1, nothing else".)*
  - **Hero slide 1 marks both of its art-directed crops.** A 2.34:1 landscape squeezed into a 4:5 portrait frame loses its subject, so each breakpoint ships its own crop — and `next/image` cannot express a media-conditioned `<picture>` source. Marking one and lazy-loading the other protects LCP at one breakpoint and wrecks it at the other. The cost is that one of the two is preloaded and never painted, which is accepted.
  - **The masthead logo keeps `priority`.** It is a small PNG, above the fold on *every* page, and on a text-led route it is a legitimate LCP candidate in its own right.
  - Nothing else does. A fourth `priority` on a page needs a reason written next to it.
- **A mark is not a photograph, and does not go in a `<MediaFrame>`.** *(Rule added 2026-08-27, after the same call was made twice.)* The frame primitive exists for a photograph filling a box its parent sized; a mark, logo or icon is artwork with proportions of its own. Draw it as a plain `<Image>` from its static import, constrained on **one** axis with the other `auto` — `h-auto w-ledger-icon` in the business ledger, `h-hero-icon w-auto` in the hero. The import already carries the intrinsic width and height, so nothing has to be measured, letterboxed or cropped.
  - **The failure it prevents is silent mis-alignment.** A square frame around a mark that is not square leaves slack, and `object-contain` splits that slack evenly — so the mark centres itself inside a box the layout thinks is full. Where several marks share a row or a stack and their ratios differ, each one centres at a *different* offset, and nothing in the markup says so. The hero's four marks run 0.65 to 0.92 wide-to-tall and drifted up to 24px against each other as the carousel cross-faded; the client asked for them flush left on **2026-08-27**, and removing the box was the fix rather than `object-left`, because a box with no slack has nothing to align.
  - **Centring inside a square is fine where it is the design.** The Our Goals marks sit in `size-goal-icon` with `object-contain` and are *meant* to be centred — the card's whole content is. The rule is about a box the design does not ask for, not about every square.
- Cut-out PNGs (`engineer.png`, `solar-plant.png`) keep transparency — do not convert to JPEG. See `asset-inventory.md`.

---

## 7. What the prototype gets wrong (do not replicate)

1. **`vw`-based sizing throughout.** `height: 46.44vw` on the stats band is 167px on a phone. Replaced by the fluid scale in `responsive-strategy.md`.
2. **A fixed 1920 design width.** Nothing may assume it.
3. **Inline styles and `style-hover` attributes.** Designer-tool syntax; not real CSS.
4. **Hardcoded content in the render function.** Everything becomes props.
5. **`font-family: 'Inter'` on the About CTA.** Slip — use DIN.
6. **Duplicated SDG array for the marquee loop.** Duplicate in the component's render, not in the data.
7. **`document.querySelector` for timeline setup.** Use refs.
8. **No mobile nav at all.** Must be designed and built — see `features/03-app-shell-header-footer.md`.

> **Standing 2026-08-26.** All eight still apply as engineering rules. But note the wider
> point: since the **4 August** source reversal the prototype is reference only, so where
> it disagrees with `SAEL - New Website.pdf` on *layout or composition* the PDF wins and
> this is not the section that settles it — `asset-inventory.md` §10 is. Items 6 and 7
> concern surfaces that were subsequently cancelled or never built.

---

## 8. Building a new page

The homepage is the reference implementation. Before starting a route, read this section,
then the feature doc for the item that is **In Progress** in `frontend-progress.md`.

1. **Take the ground first, and the ground is dark.** The site is a dark-theme site and
   dark is the default — `--color-surface-black` with its dot grid, `text-body-on-dark`,
   `Eyebrow tone="bright"`, `DisplayHeading ground="dark"`. **A light section must come
   from an explicit instruction and is never your call**; if the spec does not say a
   surface is light, it is dark. Ask rather than build it light and flag it after. §1.
   Pass `background` explicitly — do not rely on `<Section>`'s default, which is still
   `white` and is an open point in §1.
2. **`<Container>` is the only horizontal padding on the page.** A full-bleed section opts
   out by not rendering one and puts a `<Container>` around its inner text instead. A
   guardrail fails the build if any other file sets `px-gutter`.
3. **Reach for a primitive before writing a surface.** `src/components/ui/` already holds
   `Button`, `Container`, `Eyebrow`, `SectionHeading`, `Card`, `MediaFrame`, `Reveal`,
   `Rail`, `ArrowGlyph`, `DateBadge`, `Accordion`, `Pagination`, `EmptyState`, `CountUp`. **`Card` is
   the one to start from for any hairline-and-inset surface** — it was adopted by both
   homepage consumers on 2026-08-26. `SectionHeading` (**C-2**) and `DateBadge` are still
   unused on the homepage; that is a defect being fixed, not a licence to hand-roll
   another copy.
4. **Every value comes from a token.** No hex, no `rgb()`, no bare `vw`, no magic pixel
   number. **All four fail `pnpm check`** — see the note below for what the fourth one
   matches and what it deliberately lets through.
5. **A new `--text-*` token also goes in `FONT_SIZES`** in `src/lib/utils/cn.ts`. §2.
6. **Wrap section content in `<Reveal>`** with ascending `order` so it cascades, and let
   the eyebrow's rule ride the same attribute rather than observing anything of its own.
   A section that renders its content plainly reads as broken next to one that does not.
   §4. **And wrap every headline figure in `<CountUp>`** — if the design sets a number at
   display scale to make it the thing in its row, it counts up, and so does every other
   figure in that row. §4.
7. **If the page snaps, opt in in three places** — `<div data-snap-sections>` around the
   sections, `data-snap-section` on each `<Section>`, and a `snap?: boolean` prop applied
   as `snap && 'min-h-viewport snap-start'` so the component stays usable on a page that
   does not snap. §3. The footer is already opted in and needs nothing from a new page.
   Snapping is CSS only; do not reach for a scroll-hijacking library.
8. **Check it at 360px before you check it at 1920.** `responsive-strategy.md` §4. For a
   snapping section, check a short laptop viewport too — a section that only just fits at
   1920 will overflow its own snap area at 768px tall.

> **Magic numbers used to accumulate; since 2026-08-26 they cannot.**
> `pnpm verify:guardrails` enforces five rules — no raw hex, no `rgb()`/`hsl()`, no bare
> `vw`, `<Container>` as the only source of horizontal page padding, and **no magic pixel
> number** (**C-5**). The last one matches an arbitrary value whose contents begin with a
> digit, so `h-[42px]`, `z-[100]` and `backdrop-blur-[22px]` now fail the build, while
> `pt-[calc(var(--a)+var(--b))]`, `supports-[…]` and `data-[…]` still pass — those start
> with a letter, and the first of them is a token being used rather than a literal. Grid
> tracks (`grid-rows-[0fr]`) are the single carve-out, because `1fr` is a ratio no token
> could express.
>
> Before that check existed, every arbitrary value passed, and most of the literals it
> would have caught encoded a number this document already specifies — they were
> hand-written only because no token had been minted. That was the whole of the dimension
> drift found in FE-04, cleared under **C-4** in the same pass. Both are recorded in
> `docs/design-reconciliation.md`. The check-by-check table is in **`/CLAUDE.md` §2** —
> that is where the `VALUE_CHECKS` rules are stated, and where a contributor asking *why*
> the check exists will look first.
