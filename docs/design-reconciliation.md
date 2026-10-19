# Design Reconciliation — Ledger and Code-Fix Register

**Status, 2026-08-26: Steps 1, 2, 3 and 5 complete; Step 4 all but two items.**
`docs/design-guidelines.md` has been reconciled against the as-built homepage (Step 2),
its motion table extended (Step 3), and the guardrail note placed in both the guidelines
and `/CLAUDE.md` §2 (Step 5).

**Step 4 (code fixes): C-1 … C-12 all done. The checklist is closed.**

The full suite — `verify:guardrails`, `lint`, `typecheck`, `build`, `format:check` — is
green. **`docs/design-guidelines.md` is authoritative again**, and a session opening
About Us (FE-06) should read §9 of this document first.

**Tracker: this work is now `FE-25` in `docs/frontend-progress.md`**, at the top of
Pending, immediately before FE-06 (D-8, ruled and actioned 2026-08-26).

Rulings on D-1 … D-8 are in §3, on A-1 … A-4 in §6. Session decisions that do not belong
to any single C-item — the toolchain, the formatter, pre-existing defects found along the
way — are in §8.

**Full suite green as of 2026-08-26:** `verify:guardrails`, `lint`, `typecheck`, `build`
and `format:check` all pass.

**Purpose.** Bring `docs/design-guidelines.md` up to date with the as-built,
client-approved homepage, so it can be the authoritative source for redesigning the
remaining pages, starting with About Us.

**Baseline.** Commit `565a3dc` — *Merged PR 2528: Homepage*.

---

## 0. Read this before the ledger — the audit is partly stale

The 31-finding design audit was produced against the pre-merge working tree. **`PR 2528`
landed after it and rewrote most of what it examined**, so the audit cannot be folded in
as written. What changed:

| | Before the audit's read | At `565a3dc` |
|---|---|---|
| `theme.css` | 804 lines, 248 declarations | **1063 lines, 231 declarations** |
| Hero | one `hero-slide.tsx` | split into `hero-backdrop` / `hero-copy` / `hero-headline` / `hero-progress` |
| Rails | `ui/card-rail.tsx` | `ui/rail/` — `rail` / `rail-track` / `rail-arrows` / `rail-context` |
| Eyebrow | `Eyebrow` + `FlankedEyebrow` | one `Eyebrow`, **four tones**, default underline |
| Icons | inline `<svg>` per component | shared `ui/arrow-glyph.tsx` |
| Ground system | white / `surface-alt` / `surface-dark` | adds a **near-black + paper pair with a 13px dot grid** ("SAEL Home v2") |

The rework also carries client notes dated **2026-08-21, 08-22 and 08-25** — i.e. three
further rounds of direction after the 4 August source reversal.

**Every finding below has been re-verified against `565a3dc`.** Audit IDs are kept so the
two documents line up, with a status column saying what PR 2528 did to each. Eight
divergences the audit never saw are added as `N-*`.

`PR 2528` touched `design-guidelines.md` by **11 lines** — it added the `--spacing-flow`
rename note and nothing else. The rest of that document still describes the Designer
prototype.

### The scale of the gap, restated

| | Count |
|---|---|
| Tokens declared in `theme.css` | 231 |
| Tokens named anywhere in `design-guidelines.md` | ~80 |
| **Tokens with no entry at all** | **~150** |
| Tokens declared but referenced nowhere (deprecation candidates) | 44 |
| Findings carried forward from the audit | 24 |
| Findings resolved or partly resolved by PR 2528 | 7 |
| New divergences PR 2528 introduced | 8 |

---

## 1. Reconciliation ledger

**Action key** — `FOLD` fold into the guidelines · `DECIDE` needs your ruling ·
`CODE` code fix recommended, listed in §4 · `DEPRECATE` mark cancelled in the doc.

**Status key** — `Stands` unchanged by PR 2528 · `Partial` partly fixed ·
`Resolved` no longer divergent · `Changed` still divergent, different mechanism ·
`New` not in the audit.

### System

| ID | Class | Status | Finding | Action |
|---|---|---|---|---|
| S-1 | UNDOCUMENTED | Stands (worse) | ~150 tokens have no entry in §1–§3 | `FOLD` — §2 below |
| S-2 | DRIFT | Stands | Guardrail enforces 4 checks; "no magic pixel numbers" is not one | `CODE` C-5 + `FOLD` §5 note |
| S-3 | UNDOCUMENTED | Stands (worse) | Two design languages coexist; `Eyebrow` now carries **four** tones | `FOLD` — §2.6 below |

### §1 Colour

| ID | Class | Status | Finding | Action |
|---|---|---|---|---|
| C-1 | UNDOCUMENTED | Stands | New brand/UI colours absent from §1 tables | `FOLD` |
| C-2 | UNDOCUMENTED | Stands | 20 new gradients; 6 documented ones now dead | `FOLD` + `DEPRECATE` |
| C-3 | DRIFT | Partial | Alpha modifiers as ad-hoc colour: 15 sites → **13** | `DECIDE` D-1 |
| C-4 | DRIFT | Stands | `--color-rule` stranded (stats band merged away) | `DEPRECATE` |
| N-1 | BREACH (design) | New | `--color-footer-bg` `#3D4A48`→`#22262E`, `--color-footer-icon` `#2F3D3A`→`#1A1E25`, per client 2026-08-22. §1 lists the old pair. | `FOLD` |
| N-2 | UNDOCUMENTED | New | The **v2 ground system** — `--color-surface-black`, `--color-paper`, `--color-paper-alt`, the two dot-grid gradients and four hairline tokens — is a whole §1 family with no entry | `FOLD` |

### §2 Typography

| ID | Class | Status | Finding | Action |
|---|---|---|---|---|
| T-1 | UNDOCUMENTED | Changed | Type sizes outside the 14-step scale — now **13 extra**, and three the audit named are gone | `FOLD` |
| T-2 | BREACH (defect) | Partial | Weight overrides: 8 sites → **4**. All three `text-h2 font-normal` overrides are gone. | `CODE` C-3 |
| T-3 | BREACH (design) | Changed | Uppercase beyond §2's four roles — now a coherent `--text-meta` / `--text-action` / `--text-nav-item` system, and goals are explicitly *not* uppercased | `FOLD` — rewrite §2's rule |
| T-4 | DRIFT | Stands | `tracking-[0.25em]` overrides `--text-badge`'s own tracking, `mega-menu.tsx:177` | `DECIDE` D-2 |
| T-5 | BREACH (**unsure**) | Changed | News card title is `--text-card-title` (15→17px / 400). §2 assigns `--text-h3` (22px / 700) to exactly this role, and `--text-h3` is now stranded. | `DECIDE` D-3 |
| N-3 | BREACH (design) | New | `--text-eyebrow` changed from a flat `16px` to `clamp(0.9375rem … 1.125rem)` — 15→18px. §2's table still says 16px. | `FOLD` |
| N-4 | UNDOCUMENTED | New | `cn.ts` keeps a `FONT_SIZES` registry that **must** list every `--text-*` token or the class is silently dropped by `tailwind-merge`. Undocumented, and a trap for any new page. | `FOLD` — §2 rule |

### §3 Layout, spacing, radius

| ID | Class | Status | Finding | Action |
|---|---|---|---|---|
| L-1 | BREACH (defect) | Partial | `rounded-xs` on cards is gone; **one** remains at `presence-map:182`. `--radius-sdg` stranded. | `CODE` C-6 + `DEPRECATE` |
| L-2 | DRIFT | Stands | Intra-component spacing on Tailwind's 4px scale — no SAEL token below `--space-stack` (12→24px) | `DECIDE` D-4 |
| L-3 | BREACH (defect) | Partial | Magic values: 18 sites → **11**. `scale-210`, `scale-175` and the presence-map percentage insets are gone; `scale-[1.02]`/`[1.06]` are new. | `CODE` C-4 |
| L-4 | BREACH (design) | Changed | Nav gap is now `--spacing-nav-gap` (4→18px), tokenised. §4's "42px" is dead. | `FOLD` |
| N-5 | BREACH (design) | New | `--spacing-header` is a flat **68px**. §4 says "84px desktop / 64px mobile". | `FOLD` |
| N-6 | BREACH (design) | New | `--shadow-header` and `--gradient-header` were **deleted** — the v2 bar separates by hairline and opacity alone. §4 requires both. | `FOLD` |
| N-7 | BREACH (design) | New | `--aspect-news-thumb` `16/10` → **`5/4`**. §4 specifies 16/10. | `FOLD` |

### §4 Components

| ID | Class | Status | Finding | Action |
|---|---|---|---|---|
| P-1 | BREACH (defect) | Stands | `ui/card.tsx` has **zero call sites**; `TileShape` reachable only through it | `CODE` C-1 |
| P-2 | BREACH (defect) | Stands | `ui/section-heading.tsx` used only by `error.tsx` / `not-found.tsx` | `CODE` C-2 |
| P-3 | UNDOCUMENTED | Stands | `HeaderCta` is a second canonical button, outside `<Button>` | `FOLD` |
| P-4 | UNDOCUMENTED | Stands | `Button` carries `outline` and `quiet` beyond §4's three variants | `FOLD` |
| P-5 | BREACH (**unsure**) | Changed (worse) | `DateBadge` now has **zero call sites** — both variants. §4 devotes a subsection to it. | `DECIDE` D-5 |
| P-6 | UNDOCUMENTED | Resolved as duplication | `FlankedEyebrow` folded into `Eyebrow`. But `Eyebrow` now has 4 tones + a default underline, none documented. | `FOLD` |
| P-7 | BREACH (design) | Changed | Business tile has no chamfer/shadow/lift; v2 sets the rows on the section's own dark ground. `--color-tile-surface` now has no consumer. | `FOLD` + `DEPRECATE` |

### §5 Motion

| ID | Class | Status | Finding | Action |
|---|---|---|---|---|
| M-1 | BREACH (defect) | Partial | Raw `duration-300` / `duration-200` are **gone** — `300ms` became `--duration-header`. Six durations remain undocumented. | `FOLD` |
| M-2 | UNDOCUMENTED | Stands | Animations absent from §5's table — now **eight**, incl. the new `.anim-underline` and `.anim-track-fill` | `FOLD` — Step 3 |
| M-3 | BREACH (defect) | Stands | `.anim-mega-col` declares its **hidden** state unconditionally, inverting the contract its own file states. `translateY(22px)` is a raw literal where `--reveal-shift` exists. | `CODE` C-7 |
| M-4 | BREACH (defect) | Stands | `--duration-reveal` (550ms) drives a card **hover** at `news-carousel:119`; §5 assigns 280ms | `CODE` C-8 |
| M-5 | DRIFT | Stands | Timings and distances are literals inside `animations.css` | `DECIDE` D-6 |
| M-6 | DRIFT | Stands | `sdgMarquee`, `dotPulse`, `sparkFlick` ship for cancelled/unbuilt sections | `DEPRECATE` |

### §6 Imagery

| ID | Class | Status | Finding | Action |
|---|---|---|---|---|
| I-1 | BREACH (**unsure**) | Stands | Three `priority` images — both hero crops plus the logo. §6 says one. | `DECIDE` D-7 |
| I-2 | BREACH (defect) | Stands | `MediaFrame`'s image branch sets `alt=""` without `aria-hidden`; §6 asks for both | `CODE` C-9 |

---

## 2. Proposed fold-ins — exact text

Every value below is transcribed from `src/styles/theme.css` at `565a3dc`. Nothing is
invented. Where a value is ambiguous it appears in §3 as a decision instead.

### 2.1 §1 Colour — new neutral and ground families

Append to the **Neutrals** table:

| Token | Value | Use |
|---|---|---|
| `--color-surface-map` | `#101819` | Pan India Footprint ground — *stranded, see §5* |
| `--color-meta-paper` | `#6B6B73` | Metadata label on paper |
| `--color-tile-surface` | `#E8E9EB` | Chamfered tile fill — *stranded, see §5* |

New sub-section, **Grounds (SAEL Home v2)**:

> The v2 design alternates two grounds, each carrying the same 13px dot grid. Both sit a
> shade off the surfaces above — `--color-surface-dark` stays the *header's* ground — so
> they are their own tokens rather than a nudge to those.

| Token | Value | Use |
|---|---|---|
| `--color-surface-black` | `#08090C` | The dark ground |
| `--color-paper` | `#FBFBF9` | The light ground |
| `--color-paper-alt` | `#F4F4F2` | Paper, one step down |
| `--gradient-dot-dark` | `radial-gradient(circle at center, rgb(255 255 255 / .028) 0, … var(--spacing-dot-radius), transparent calc(… + 0.5px))` | Dot grid on black |
| `--gradient-dot-paper` | `radial-gradient(circle at center, rgb(20 24 32 / .04) 0, … var(--spacing-dot-radius), transparent calc(… + 0.5px))` | Dot grid on paper |
| `--spacing-dot-grid` | `0.8125rem` (13px) | Grid pitch |
| `--spacing-dot-radius` | `1.5px` | Dot radius. The `+0.5px` feather is deliberate — without it the grid drops out at fractional zoom (client report, 2026-08-25) |

New sub-section, **Hairlines**:

| Token | Value | Use |
|---|---|---|
| `--color-hairline-dark` | `rgb(255 255 255 / .16)` | Rule on the black ground |
| `--color-hairline-grid` | `rgb(255 255 255 / .14)` | Grid rule on black |
| `--color-hairline-paper` | `rgb(20 24 32 / .18)` | Rule on paper |
| `--color-hairline-paper-soft` | `rgb(20 24 32 / .2)` | Paper rule, heavier |
| `--color-hairline-on-media` | `rgb(255 255 255 / .38)` | Rule drawn over a photograph |

New sub-section, **On-dark copy** — *this is the fix for half of C-3*:

| Token | Value | Use |
|---|---|---|
| `--color-on-dark-soft` | `rgb(230 233 238 / .72)` | Secondary copy on dark |
| `--color-on-dark-faint` | `rgb(230 233 238 / .62)` | Tertiary copy on dark |
| `--color-on-dark-muted` | `rgb(230 233 238 / .55)` | Quietest copy on dark |

**Header** (replaces §4's prose values):

| Token | Value |
|---|---|
| `--color-nav-link` | `rgb(28 32 40 / .82)` |
| `--color-header-hairline` | `rgb(20 24 32 / .09)` |
| `--color-header-hairline-scrolled` | `rgb(20 24 32 / .13)` |
| `--color-header-veil` | `rgb(255 255 255 / .7)` |
| `--color-header-veil-scrolled` | `rgb(255 255 255 / .86)` |
| `--color-header-solid` | `rgb(255 255 255 / .96)` |

**Business figures, on the dark ledger:**

| Token | Value | Business |
|---|---|---|
| `--color-figure-solar-bright` | `#E8865C` | Solar |
| `--color-figure-cell-bright` | `#CF74C4` | Cell |
| `--color-figure-module-bright` | `#3FBF99` | Module |
| `--color-figure-agri-bright` | `#8FC44A` | Agri waste |

**Amend the two footer rows in place** (N-1):

| Token | Value | Use |
|---|---|---|
| `--color-footer-bg` | `#22262E` | Footer base — *cool slate, client 2026-08-22; was `#3D4A48`* |
| `--color-footer-icon` | `#1A1E25` | Social icon glyph — *was `#2F3D3A`* |

### 2.2 §1 Gradients — 20 additions

| Token | Use |
|---|---|
| `--gradient-eyebrow-bright` | Section label on the black ground |
| `--gradient-eyebrow-deep` | Section label on paper |
| `--gradient-heading-bright` | Power Portfolio display heading, clipped |
| `--gradient-hero-fill` | Hero progress bar — one ramp across the whole cycle, client 2026-08-21 |
| `--gradient-hero-word-1..4` | Per-slide headline highlight (four tokens) |
| `--gradient-hero-scrim-side` | Hero scrim above `lg` |
| `--gradient-hero-scrim-stacked` | Hero scrim below `lg` |
| `--gradient-hero-foot` | Under the progress bar |
| `--gradient-goal-reveal` | Goals card scrim, on hover only |
| `--gradient-nav-cta` | Masthead Contact Us |
| `--gradient-mega`, `--gradient-mega-hot` | Mega-menu panel and lit column |
| `--gradient-date-chip` | Pill date badge |
| `--gradient-wash-strength-stacked` | Strength wash below `lg` |

### 2.3 §2 Type scale — 13 additions

| Token | Min → Max | Weight | LH | Tracking | Use |
|---|---|---|---|---|---|
| `--text-display` | 30 → 64px | 400 | 1.02 | -0.028em | v2 section display heading |
| `--text-stat-large` | 36 → 76px | 700 | 0.9 | -0.04em | Headline figure |
| `--text-ledger-figure` | 36 → 72px | 700 | 0.9 | -0.04em | Business ledger figure |
| `--text-ledger-figure-long` | 28 → 58px | 700 | 0.9 | -0.04em | …when the string is long |
| `--text-goal-name` | 22 → 34px | 400 | 1.15 | -0.02em | Goal name — **sentence case** |
| `--text-plate-title` | 16 → 20px | 400 | 1.25 | -0.01em | Solutions plate title |
| `--text-card-title` | 15 → 17px | 400 | 1.42 | -0.01em | News card title |
| `--text-meta` | 11 → 12.5px | 700 | 1.5 | 0.2em | Uppercase metadata label |
| `--text-action` | 12 → 13px | 700 | 1 | 0.18em | Uppercase inline action |
| `--text-nav-item` | 11px | 700 | 1.18 | 0.18em | Desktop nav link |
| `--text-tile-note` | 11 → 12px | 400 | 1.35 | — | Figure footnote |
| `--text-tile-marker` | 12 → 14px | 700 | — | — | "Upcoming" superscript |
| `--text-footprint-title` | 21 → 26px | 700 | 1.2 | 0.02em | *Stranded, see §5* |

**Amend `--text-eyebrow` in place** (N-3): `16px` → **15 → 18px**,
`clamp(0.9375rem, 0.8942rem + 0.1923vw, 1.125rem)`.

### 2.4 §2 — rewrite the uppercase rule (T-3)

Replace the closing note of §2 with:

> Section headings are sentence case as written in the copy, never CSS `text-transform`.
> Uppercase is carried by the token, not by the call site, and belongs to exactly five
> roles: `--text-eyebrow`, `--text-meta`, `--text-action`, `--text-nav-item` and
> `--text-cta`. **Goal names are not uppercased** — `--text-goal-name` is sentence case at
> weight 400, and that is the client's design.

### 2.5 §2 — new rule: the `cn()` font-size registry (N-4)

> **Adding a `--text-*` token means adding it to `FONT_SIZES` in `src/lib/utils/cn.ts`.**
> `tailwind-merge` matches `text-*` against Tailwind's *default* scale to decide whether a
> class is a size or a colour. Every size here is a custom `@theme` token, so an
> unregistered one falls through to the colour group and is discarded the moment it meets
> a colour: `cn('text-hero text-white')` → `'text-white'`, silently, with the element
> rendering at the inherited body size. This shipped in FE-02 and was found in FE-04.

### 2.6 §4 — Components

- **Eyebrow** — four tones (`gradient`, `accent`, `bright`, `deep`) and a rule underneath,
  **on by default**. `bright` and `deep` are the same travel at two weights, one per
  ground. The rule takes the label's own ramp and animates off `<Reveal>`'s `data-reveal`
  attribute. Client note 2026-08-25 asks for the underline on all labels.
- **Button** — add `outline` (gradient `border-image`, fills on hover) and `quiet` (ink
  until hovered) to the three documented variants.
- **HeaderCta** — record as a deliberate second CTA: `--radius-nav-cta` (16px),
  `--gradient-nav-cta`, `--text-nav` at 700, `--shadow-nav-cta`. Not `<Button>`, and why.
- **Rail** — new §4 entry for `ui/rail/`: a real scroll container with CSS snapping, arrows
  as an addition rather than the mechanism. `--spacing-rail-gap`, `--spacing-rail-gap-wide`,
  `--spacing-rail-arrow`, `--spacing-rail-arrow-sq`.
- **ArrowGlyph** — new shared icon primitive; note it replaced per-component inline SVG.
- **Header** — amend: height a flat **68px** (`--spacing-header`), **no shadow** at any
  scroll position, `blur(22px) saturate(1.4)`, scroll threshold **8px** (was 80), nav gap
  `--spacing-nav-gap` 4→18px.
- **Card (news)** — amend `aspect-ratio` to **5/4**.

---

## 3. Decisions taken — D-1 … D-8

**All eight were ruled on 2026-08-26 and are applied.** The "recommendation" column is
kept as written so the reasoning behind each ruling survives; where a ruling was later
amended by evidence, the amendment is recorded in the row itself.

| # | Finding | Question | My recommendation |
|---|---|---|---|
| D-1 | C-3 | 13 alpha-modifier sites remain, mostly `text-white/72`, `text-white/80`, `border-white/20` in the footer. PR 2528 already minted `--color-on-dark-*` for exactly this. Promote the footer's three, or codify alpha modifiers on `white`/`ink` as an allowed exception? | **Promote.** The footer is the last consumer and the tokens already exist. Leaves `bg-white/10`, `bg-ink/5` on `Button`/`rail-arrows` as a codified exception for interaction states. |
| D-2 | T-4 | `tracking-[0.25em]` on the mega-menu strapline overrides `--text-badge`'s 0.0214em. | **Ruled: reuse `--text-meta`. ~~Amended 2026-08-26 during C-4: mint `--tracking-strapline` (`0.25em`) instead.~~** The original ruling was taken on the tracking delta alone — 0.25em vs 0.2em, correctly judged imperceptible. It missed that `--text-meta` also differs in **size** (11 → 12.5px against `--text-badge`'s 12 → 14px) and **line-height** (1.5 vs 1.0). Swapping tokens would therefore have resized the strapline, which the C-4 no-visual-change constraint forbids. An exact-equivalent tracking token was minted instead; the size stays on `--text-badge`. Recorded in guidelines §2 *Tracking*. |
| D-3 | T-5 | News card title: `--text-card-title` (15→17px / 400) vs §2's `--text-h3` (22px / 700) for the same role. Is the smaller title the approved v2 design, or a regression? | **Likely design** — it is a purpose-built token with its own tracking and line-height, not a borrowed one. If you confirm, §2's `--text-h3` usage note moves and `--text-h3` is marked stranded. **I have not assumed this.** |
| D-4 | L-2 | No spacing token below `--space-stack` (12→24px), so card padding and icon gaps use Tailwind's 4px scale. | **Mint two tokens** — an intra-card `--spacing-inset` and a tight `--spacing-tight` — or codify "Tailwind's scale below 12px is the system". Either is fine; the current silence is not. |
| D-5 | P-5 | `DateBadge` now has **zero** call sites; §4 devotes a subsection to rebuilding it. Delete the primitive, or is a page still to consume it? | **Ask before deleting.** Newsroom (FE-18) is the obvious consumer. Recommend keeping and noting "built, awaiting FE-18". |
| D-6 | M-5 | `animations.css` holds literals — `55ms` stagger, `0.75rem` pulse, `scale(2.6)`, `9s`, `44s`. §5 specifies most of these numbers. | **Leave as intentional exception**, but say so in §5. Tokenising keyframe internals buys little and costs indirection. |
| D-7 | I-1 | Three `priority` images. Both hero crops is documented and deliberate; the masthead logo is not discussed anywhere. | **Split the rule.** Amend §6 to allow the art-directed pair, and decide separately whether the logo keeps `priority` (it is a small PNG above the fold — defensible). |
| D-8 | — | `docs/frontend-progress.md` lists FE-04 as In Progress. Does this reconciliation become its own tracker row, or ride inside FE-04? | **Its own row.** *Actioned 2026-08-26 on explicit instruction* — `FE-25`, at the top of **Pending**, immediately before FE-06. Pending rather than In Progress because `/CLAUDE.md` §3 allows exactly one In Progress item and FE-04 holds it. Its spec is `design-reconciliation.md`, not a `features/NN-*.md`: it reconciles an existing document rather than specifying a new surface. |

---

## 4. Code fixes — checklist

Each item is approved individually. **All twelve are `[x]` done as of 2026-08-26.**

### Landed — was the only hard blocker on FE-06

- [x] **C-5 (S-2) — extend the guardrail. DONE 2026-08-26. FE-06 is unblocked.**
      A fifth `VALUE_CHECKS` entry, pattern `/\b[a-z][a-zA-Z-]*-\[-?\d[^\]]*\]/g`.
      **Anchoring on a leading digit is what removed the need for a broad allowlist**: it
      admits composed values (`pt-[calc(var(--a)+var(--b))]` — a token being *used*),
      arbitrary properties (`[clip-path:…]` — no `utility-` prefix) and variant brackets
      (`supports-[…]`, `data-[…]` — start with a letter). Only grid tracks needed a
      carve-out, via a new optional `except` field on the check machinery, because `1fr`
      is a ratio no token could express. This was the root cause of the magic-number
      drift; without it About Us would have re-accumulated C-4 from scratch.

### Closed by declining adoption, and extracting what was actually shared

- [x] **C-1 (P-1) — adopt `ui/card.tsx`. DONE 2026-08-26. The primitive was rewritten.**
      Adopted by both `news-carousel` and `business-tiles`. **`card.tsx` as written could
      not be adopted without redesigning the page**, so per the ruling — the homepage is
      authoritative, the primitive is not — the primitive changed instead.

      **What the primitive used to be, and why none of it survived.** `news` was a white
      box: `bg-surface`, a border on all four sides, `--radius-card`, `overflow-hidden`,
      hover lifting `--lift-card` with `--shadow-card-hover`. `tile` wrapped its children
      in `<TileShape>` for the chamfered business tile, with `--drop-shadow-tile` and an
      8px lift. **v2 removed both surfaces outright** — the news card "lost its box" and
      the business tiles became rows of a ledger. Neither variant had a call site, so that
      spec survived only in the primitive and in guidelines §4, describing a page that had
      not existed since PR 2528.

      **What the two built surfaces actually are — and they are the same shape:**

      ```
      news card:    group relative flex w-full flex-col  border-t border-hairline-paper pt-inset
      ledger row:   group relative flex w-full gap-x-flow border-t border-hairline-dark  py-inset
      ```

      plus, in both, an **identical six-line accent span** differing only in colour. That
      trio — hairline, inset, accent — is the v2 card idiom, and it is now the primitive:

      | Prop | Values | Notes |
      |---|---|---|
      | `ground` | `paper` / `dark` | Picks the hairline token |
      | `inset` | `top` / `block` | `pt-inset` vs `py-inset` |
      | `accentClassName` | a colour class | Omit for no accent |
      | `as` | `div` / `article` / `section` | Defaults to `div`; both consumers pass `article` |

      Flex direction, the column gap and the upcoming row's own ground stay at the call
      sites — they are composition, and folding them in would make the primitive a switch
      statement over two callers.

      **Proof of inertness — element-level, from the prerendered homepage.** Class *sets*
      compared before and after (order is irrelevant, and was proved so in the C-11
      formatting pass):

      | Element | Classes | Result |
      |---|---|---|
      | news `<article>` | 8 | **identical** |
      | ledger `<article>` | 8 | **identical** |
      | ledger `<article>`, upcoming row | 10 | **identical** |
      | news accent `<span>` | 12 | **identical** |
      | ledger accent `<span>` | 12 | **identical** |

      Both elements still render as `<article>`; `as` exists so that stayed true rather
      than silently becoming a `<div>`.

      **The built-stylesheet diff is not zero, and every line is accounted for.** The old
      variants' utilities are gone — `shadow-card-hover`, `drop-shadow-tile-hover`, the two
      lifts with their `translate`/`filter` carriers, and one `aspect-ratio:2` from the dev
      page. Tailwind had been emitting them because it scans source *text*; **none applied
      to any element on the site**, because `Card` had zero call sites. Verified directly
      against the shipped stylesheet and the prerendered homepage: `drop-shadow-tile` and
      `-translate-y-(--lift-card)` appear on **no** element, and `shadow-card-hover`
      survives only as the footer logo plate's, which is untouched.

      > **Correction, and it is a fact about the measurement rather than the code.** This
      > entry first cited "4840 → 4831 declarations". Those counts were inflated: the
      > snapshots concatenated **every** `.css` file left in `.next`, including stale
      > chunks from earlier builds. A clean build (`rm -rf .next`) emits **one** stylesheet
      > of 1611 declarations. The lost/gained *lists* were right in kind but multiplied,
      > and no conclusion above rests on them — the load-bearing proof is the element-level
      > class-set comparison, which reads the prerendered HTML and is unaffected.
      > **Method note for anyone repeating this: clear `.next` first.**

      **Two consequences to rule on, not actioned here:**

      1. **`ui/tile-shape.tsx` now has no consumer outside the dev page.** Not deleted —
         the chamfer is real, correct work and may return — but `--drop-shadow-tile`,
         `--drop-shadow-tile-hover` and `--lift-card` are stranded with it. Added to §5.
      2. The dev design-system page's two `Card` demos were rewritten to the new
         primitive, and its standalone `TileShape` demo now says it has no call site.
         That page's appearance changed; the site's did not.
- [x] **C-2 (P-2) — `ui/section-heading.tsx`. DONE 2026-08-26, option 1.**
      Resolved as: **`DisplayHeading` extracted, `SectionHeading` retained as
      correct-and-consumed, homepage adoption correctly declined.** The audit's premise
      was wrong — P-2 read "no homepage section uses it" as a defect in the primitive,
      when it is a fact about the homepage's composition.

      **The homepage sections do not converge on a heading block.** Not into one shape,
      and not into two or three coherent groups either. Nine sections compose the page;
      `HeroCarousel` and `PixelStrip` have no heading, leaving **seven**:

      | Section | Eyebrow | Display `<h2>` | Copy in the block | Spacing | Shape |
      |---|---|---|---|---|---|
      | `intro-split` | `deep` | ✔ `mt-stack max-w-(--hero-measure)`, `--gradient-eyebrow-deep` | ✔ `<p>` at `mt-flow`, `--ledger-measure` | `mt-*` per element | eyebrow + heading + copy |
      | `solutions-carousel` | `deep` | ✔ no margin, no cap, `--gradient-eyebrow-deep` | ✘ — its sentence is a separate row below | `gap-stack` on the wrapper | eyebrow + heading |
      | `presence-map` | `bright` | ✔ `max-w-(--hero-measure)`, `--gradient-heading-bright` — **but in the other column**, `Reveal order={3}` | ✘ | — | eyebrow and heading are not adjacent |
      | `business-tiles` | `bright` | ✘ | ✘ | `gap-stack` on the parent | eyebrow alone |
      | `goals-grid` | `bright` | ✘ | ✘ | `gap-flow` on the parent | eyebrow alone |
      | `news-carousel` | `deep` | ✘ | ✘ | `gap-stack`, `justify-between` beside `RailArrows` | eyebrow alone |
      | `endeavour-split` | `accent` | ✘ **deliberately** — the section carries `aria-label` instead, because "an `<h2>` here would be inventing a level the design does not have" | ✔ N paragraphs at `mt-stack` | `mt-stack` | eyebrow + paragraphs |

      **Two cells in the `solutions-carousel` row went stale hours after this was
      written.** The client's section sequence of 2026-08-26 moved that section onto the
      black ground, so its eyebrow is now `bright` and its heading takes
      `--gradient-heading-bright`. The row is left exactly as audited: this ledger is
      pinned to `565a3dc` (§0), and the ramp was never load-bearing for the ruling. The
      argument is about *shape*, and the shape is unchanged — eyebrow + heading, its
      sentence still a separate row below. See `docs/homepage-section-sequence-review.md`.

      **Four of the seven are an `<Eyebrow>` and nothing else.** They already consume the
      right primitive. Wrapping a single child in a `SectionHeading` would add a layout box
      and buy nothing.

      **The blocker on the other three is structural, not cosmetic.** Every section wraps
      each of eyebrow / heading / copy in its **own `<Reveal order={n}>`** — 0, then 2,
      then 4 — so they cascade one after another. `Reveal` **is** the box (it says so in
      its own doc comment) and carries one `--reveal-order` per element. A primitive that
      renders eyebrow, title and description as siblings inside one `<div>` **cannot
      express that stagger at all**. It is not a matter of restyling the wrapper: the
      three elements have to be three `Reveal`s, and the primitive would have to render
      `Reveal`s itself — which would then break the two error pages, since `error.tsx` is
      a client error boundary with no reveal machinery and no scroll to observe.

      Three further mismatches, any one of which would have needed the primitive rewritten:
      it hardcodes `text-h2` where all three homepage headings are `text-display`; it has
      no gradient clip, where the design's rule is that **the ramp follows the ground**
      (`--gradient-eyebrow-deep` on paper, `--gradient-heading-bright` on black); and it
      renders `<Eyebrow>` with no `tone`, where all seven sections pass one.

      **Adoption count: 0 of 7.** Not "six of seven with two exceptions" — the primitive as
      written fits none of them, and the shape that would fit them cannot also serve the
      error pages.

      **`SectionHeading` is not actually unused.** P-2 recorded it as "used only by
      `error.tsx` / `not-found.tsx`". Both use it correctly and idiomatically — `as="h1"`,
      eyebrow, title, description, no `Reveal` — which is the exact composition it was
      written for. A two-consumer primitive doing its job is not the same defect as
      `Card`'s zero call sites was.

      **What *is* worth extracting — the recommendation.** Three sections share the
      gradient-clipped display heading, and they differ only in the two things a call site
      should decide anyway:

      ```
      intro-split:  mt-stack max-w-(--hero-measure)  bg-(image:--gradient-eyebrow-deep)  gradient-text text-display
      solutions:                                     bg-(image:--gradient-eyebrow-deep)  gradient-text text-display
      presence-map:           max-w-(--hero-measure) bg-(image:--gradient-heading-bright) gradient-text text-display
      ```

      A small `<DisplayHeading ground="paper" | "dark">` would own `gradient-text
      text-display` and the ground→ramp pairing, leaving the cap and the margin to the call
      site. That pairing is the part a new page gets wrong, and it is precisely what About
      Us will need. It is a **new primitive beside `SectionHeading`, not a rewrite of it**,
      so the error pages are untouched.

      **Ruled: option 1.** `ui/display-heading.tsx` was extracted as a **new primitive
      beside `SectionHeading`**; `SectionHeading`, `error.tsx` and `not-found.tsx` were not
      touched.

      | Prop | Values | Notes |
      |---|---|---|
      | `ground` | `paper` / `dark` | Selects the ramp: `--gradient-eyebrow-deep` / `--gradient-heading-bright` |
      | `as` | `h1` / `h2` / `h3` | `h2` by default; level is a structure decision the component will not guess |

      The base is `gradient-text text-display`. **The cap and the margin stay at the call
      sites** — they vary across the three and depend on what the heading sits beside, so
      they are not properties of the heading.

      **Encoding the ground→ramp pairing is the point of the primitive.** The trap has a
      sharp edge: the dark heading takes `--gradient-heading-bright`, **not**
      `--gradient-eyebrow-bright`, which is a different ramp belonging to the label above
      it. Prose in §4 would not have stopped that; a variant does.

      | Site | Before → After |
      |---|---|
      | `intro-split:89` | `<h2 className={cn('mt-stack max-w-(--hero-measure)', 'bg-(image:--gradient-eyebrow-deep) gradient-text', 'text-display')}>` → `<DisplayHeading ground="paper" className="mt-stack max-w-(--hero-measure)">` |
      | `solutions-carousel:78` | `<h2 className="bg-(image:--gradient-eyebrow-deep) gradient-text text-display">` → `<DisplayHeading ground="paper">` |
      | `presence-map:225` | `<h2 className={cn('max-w-(--hero-measure)', 'bg-(image:--gradient-heading-bright) gradient-text', 'text-display')}>` → `<DisplayHeading ground="dark" className="max-w-(--hero-measure)">` |

      **The `solutions-carousel` row records the C-2 migration, not the current call
      site.** That section moved to the black ground later the same day, so the call site
      now reads `<DisplayHeading ground="dark">` and has shifted further down the file.
      The row is deliberately not updated: the inertness proof below is a statement about
      *this* diff, and rewriting the "After" column would falsify it. See
      `docs/homepage-section-sequence-review.md`.

      **Proof of inertness — the strongest available, and it is exact.** Two *clean* builds
      (`rm -rf .next` each time), pre-C-2 source and post-C-2 source: the emitted
      stylesheet is **byte-identical, sha256 match**, 1611 declarations both ways, none
      lost and none gained. At the element level, all three rendered `<h2>` class sets are
      identical (5, 3 and 4 classes). Nothing new was emitted because the primitive assembles
      the same class strings the call sites were writing by hand.

      **The four eyebrow-only sections were not touched.** `<Eyebrow>` is already the right
      primitive there, and wrapping a single child would have added a layout box for
      nothing.

      **`SectionHeading` keeps its role, recorded in guidelines §4 so this is not
      re-raised:** the single-block heading — eyebrow, title and description arriving
      together — for a page that is not built on the reveal cascade. The two error pages
      are exactly that, and a future page that does not stagger its sections should use it.

- [x] **C-3 (T-2) — the four weight overrides. DONE 2026-08-26, four separate resolutions.**
      The original ruling assumed a subtle-vs-visible test that **DIN makes impossible**:
      the face ships exactly **400 and 700**, and `globals.css` sets
      `font-synthesis-weight: none`, so dropping `font-bold` is never a nudge — it is the
      full width of the typeface's range. Re-ruled per site once that was established.

      | Site | Resolution | Visual change |
      |---|---|---|
      | `header-cta.tsx:34` | **The token was wrong.** `--text-nav--font-weight` 400 → **700**; override dropped | **None** — proved below |
      | `mega-menu.tsx:120` | **New token.** `--text-mega-head` minted at `--text-label`'s metrics, weight 700; site migrated. `--text-label` stays 400 for the footer | **None** — proved below |
      | `footer.tsx:95` | **Override kept**, now conforming to a new §2 rule | None — untouched |
      | `presence-map.tsx:209` | Same | None — untouched |

      **`--text-nav` had one consumer and it was 700.** `desktop-nav` uses
      `--text-nav-item`; `text-nav-link` is a *colour*. Guidelines §4 has documented the
      masthead CTA as "`--text-nav` at 700" throughout, so the token contradicted the doc
      that described it. Corrected, not worked around.

      **`--text-mega-head` is named for the role, beside `--color-mega-head-rule`** —
      the family already existed. Registered in `FONT_SIZES` (`src/lib/utils/cn.ts`) per
      the §2 rule; an unregistered `--text-*` is silently dropped by `tailwind-merge` the
      moment it meets a colour, and the call site is inside a `cn()`.

      **The new §2 rule — emphasis within body copy.** `footer:95` and
      `presence-map:209` are neither a wrong token nor a wrong override; they are inline
      emphasis inside a body-size role, marking the subject of a block — a legal name in
      an address, a tooltip's title above its description. §2 had **no account of
      emphasis at all**, which is the only reason they read as breaches. The rule now
      sanctions `font-bold` on a **body token** and explicitly withholds it from headings,
      labels and any token whose role already carries a weight. Minting
      `--text-body-sm-strong` was rejected: its only distinguishing property would be the
      one thing the call site already says.

      **Proof of inertness — element-level, not asserted.** The class *set* on every
      affected element, before and after:

      | Element | Result |
      |---|---|
      | header CTA | `font-bold` removed, nothing added |
      | mega-menu column head | `text-label font-bold` → `text-mega-head` |

      `.text-nav`'s emitted rule is byte-identical across the two builds —
      `font-weight: var(--tw-font-weight, var(--text-nav--font-weight))`. Before,
      `.font-bold` set `--tw-font-weight: 700`, so it resolved to **700**. After,
      `--tw-font-weight` is unset, so it falls back to the token, now **700**. Same
      computed value by a different route. For the mega menu, `--text-mega-head` resolves
      to `clamp(.875rem, .8462rem + .1282vw, 1rem)` / `1.35` / `.0625em` / `700` — which
      is `--text-label`'s three metrics with the weight the override was already applying.

      **One deliberate change, on a dev route only:** `/dev/design-system`'s `text-nav`
      swatch now renders bold. It is showing the token's declared weight, so it is more
      truthful than before, not less.

- [x] **C-4 (L-3) — tokenise the magic values. DONE 2026-08-26.** All 17 occurrences
      across 13 sites replaced by tokens. Verified no visual change: the built stylesheet
      holds 689 distinct declarations before and after, with **zero lost** — every
      replacement resolves to the byte-identical value. Tokens minted:
      `--z-header`/`--z-drawer`/`--z-skip-link`, `--spacing-logo`, `--blur-header`,
      `--blur-mega`, `--saturate-glass`, `--brightness-cta-hover`, `--lift-card`,
      `--lift-social`, `--scale-goal-rest`, `--scale-goal-hover`, `--tracking-strapline`.
      All documented in guidelines §2 and §3.
      **D-2 was amended here, and the amendment was accepted.** `tracking-[0.25em]`
      became `--tracking-strapline` (exact equivalent), *not* `--text-meta`. The original
      D-2 ruling was taken on the tracking delta alone — 0.25em vs 0.2em, correctly judged
      imperceptible — and missed that `--text-meta` also differs in **size** (11 → 12.5px
      against `--text-badge`'s 12 → 14px) and **line-height** (1.5 vs 1.0). The swap would
      therefore have resized the strapline. Recorded in guidelines §2 *Tracking*; the D-2
      row in §3 carries the amended ruling.
      **`--spacing-logo` is `2.625rem`, not `42px`, deliberately.** Identical at a 16px
      root. The consequence is intentional: the literal it replaced did not respond to
      browser font scaling, while the `h-8` (`2rem`) beside it on mobile always did — so
      the desktop and mobile logo heights used to scale differently. They now scale
      together, which is the behaviour the rest of the token layer already has. This is
      the one behavioural difference in the whole C-4 set; every other replacement is
      byte-identical. Accepted as a fix rather than a regression.
      The four `grid-rows-[0fr]`/`[1fr]` matches stay, admitted by the check's `except`.
- [x] **C-6 (L-1) — `rounded-xs` at `presence-map:182`. DONE 2026-08-26.**
      `rounded-xs` → **`rounded-none`**. It was the last radius bypass on the site —
      Tailwind's own 2px default rather than a token, on a **7px** square map pin.
      `--radius-card` was rejected: at 14px on a 7px box it exceeds half the side, so the
      pin would have rendered as a **circle**, which is neither the design nor
      distinguishable from the `rounded-full` halo pulsing out of it. `--radius-none` is
      both the nearest token *and* what the component's own comment already asked for —
      *"The pin. A hard square, plus a halo that pulses out of it."* **Rendered
      difference: 2px of corner rounding removed from a 7px element**, toward the stated
      intent. The one non-inert byte in C-6 … C-9, and a subtle one.
- [x] **C-7 (M-3) — invert `.anim-mega-col`. DONE 2026-08-26.**
      Both the hidden state **and** its `[data-mega='open']` counterpart moved inside
      `@media (prefers-reduced-motion: no-preference)`, mirroring `.anim-reveal`, so the
      resting state is now the unconditional one. Verified in the built stylesheet: no
      `.anim-mega-col` rule exists outside the media query. `translateY(22px)` →
      `translateY(var(--reveal-shift))`.

      **Nothing is exposed by the inversion.** A reduced-motion user now gets columns at
      full opacity with no transform *regardless* of `[data-mega]` — which is correct,
      because the panel carries its own `opacity-0 pointer-events-none` when closed and
      `inert={!open}`. The column's `opacity: 0` was the animation's starting point, never
      what hid it; that is exactly why the unconditional version was safe-by-accident and
      still wrong. It was one selector away from stranding the columns at `opacity: 0`.

      **Two rendered differences, both intended:** a reduced-motion user opening the panel
      now sees the columns immediately instead of watching them rise — the point of the
      fix — and the travel for everyone else went **22px → 28px**, since `--reveal-shift`
      is the distance every other entrance on the site uses. 6px over 450ms.
- [x] **C-8 (M-4) — `news-carousel:119`. DONE 2026-08-26.**
      `duration-(--duration-reveal)` → `duration-(--duration-card)`. **550ms → 280ms.**
      The thumbnail's zoom had been running at twice the speed of the card lift it is part
      of, so the photograph visibly lagged the card. Both resting states are unchanged —
      only the transition rate moves, and it moves onto the token §5 assigns to card
      hovers. A reveal token driving a hover is the specific mistake §5's first standard
      is worded to catch, and it is now recorded there as closed.
- [x] **C-9 (I-2) — `MediaFrame`. DONE 2026-08-26.**
      `aria-hidden={alt === '' ? true : undefined}` on the image branch, matching the
      placeholder branch above it, which already had it. `undefined` rather than `false`
      so a meaningful image emits no attribute at all. **Visually inert** — no rendered
      change; a screen reader can no longer land on an unlabelled graphic while walking
      a section. §6's rule now spells out why both halves are needed, not just that they
      are: `alt=""` governs the accessible *name*, `aria-hidden` the *tree*.

### Created by the D-1 / D-4 / A-4 rulings

Three code changes the decisions required. They were not on the original ledger. All
three have since been actioned — C-10 and C-12 in full, C-11 with three groups held.

- [x] **C-10 (D-1) — promote the footer's alpha modifiers to tokens. DONE 2026-08-26.**
      Six sites, no alpha modifier left in the footer. `text-white/72` →
      `text-on-dark-soft` (`footer.tsx:94`, `:124`); `border-white/20` →
      `border-hairline-dark` (`footer.tsx:121`, `footer-links.tsx:67`); `text-white/80` →
      `text-body-on-dark` (`footer-links.tsx:22`, and the `hover:` half of `:68`).
      The last pair was held for a ruling and settled on `--color-body-on-dark`: §1
      defines it as the token for body copy on dark, it moves less than the alternative,
      and it moves *brighter* — the safer direction on an interactive element. Contrast
      on the link goes 10.22 → 12.46.

      Composited on `--color-footer-bg` `#22262E`:

      | Site | Before → After | Composited | Contrast | Δ/channel |
      |---|---|---|---|---|
      | `footer.tsx:94`, `:124` | `text-white/72` → `text-on-dark-soft` | `rgb(193,194,196)` → `rgb(175,178,184)` | 8.51 → 7.14 | −18/−16/−12 |
      | `footer.tsx:121`, `footer-links.tsx:67` | `border-white/20` → `border-hairline-dark` | `rgb(78,81,88)` → `rgb(69,73,79)` | 1.91 → 1.67 | −9/−8/−9 |
      | `footer-links.tsx:22`, `:68` | `text-white/80` → `text-body-on-dark` | `rgb(211,212,213)` → `rgb(230,233,238)` | 10.22 → 12.46 | +19/+21/+25 |

      **The accordion trigger's hover is softer, and that is accepted.**
      *Ruled 2026-08-26 — resolved, not deferred.* At `footer-links.tsx:68` the base is
      pure `text-white`, so the hover now travels 255 → 230 where it used to travel
      255 → 211: roughly **half the previous depth**. It still reads as a state change,
      and contrast improved across the conversion as a whole. The alternative — a bespoke
      hover token for one accordion trigger — buys back the depth at a maintenance cost
      the surface does not justify, and would have the trigger hovering *darker* than its
      resting state. **No further action; do not reopen this as a defect.**
- [x] **C-11 (D-4 / A-1) — mint the sub-12px spacing steps. DONE 2026-08-26.**
      `--spacing-inset` (16 → 24px) and `--spacing-tight` (8 → 12px) minted from the
      two-point formula in `src/styles/README.md`; both names checked against Tailwind's
      `inline-*` display utilities. **Six card and panel sites migrated**, converging
      values that previously disagreed — max movement 4.6px at any width:

      | Site | Before → After | 360px | 1024px | 1920px |
      |---|---|---|---|---|
      | `business-tiles:131` ledger row, block | `py-4 lg:py-6` → `py-inset` | 16 → 16.0 | 24 → 19.4 (−4.6) | 24 → 24.0 |
      | `business-tiles:136` upcoming panel, inline | `px-4 lg:px-5` → `px-inset` | 16 → 16.0 | 20 → 19.4 (−0.6) | 20 → 24.0 (+4.0) |
      | `goals-grid:142` goal card | `p-5 lg:p-6` → `p-inset` | 20 → 16.0 (−4.0) | 24 → 19.4 (−4.6) | 24 → 24.0 |
      | `news-carousel:81` news card, top | `pt-4 lg:pt-5` → `pt-inset` | 16 → 16.0 | 20 → 19.4 (−0.6) | 20 → 24.0 (+4.0) |
      | `business-tiles:212` label→arrow gap | `gap-2` → `gap-tight` | 8 → 8.0 | 8 → 9.7 (+1.7) | 8 → 12.0 (+4.0) |
      | `news-carousel:149` label→arrow gap | `gap-2` → `gap-tight` | 8 → 8.0 | 8 → 9.7 (+1.7) | 8 → 12.0 (+4.0) |
      **The three held groups were ruled on 2026-08-26. C-11 is now closed:**

      1. **Component chrome** — Button, accordion, masthead, mega menu, pagination.
         **Permanently excluded**, not pending. Each has its own §4 spec, and a generic
         inset token laid over it would replace a documented decision with a default.
         The boundary is now stated in `--spacing-inset`'s own entry in guidelines §3:
         the token is for card and panel *interiors*; where §4 specifies a component's
         padding, §4 wins.
      2. **The card body→footer gap** — **`--spacing-card-flow` minted** (16 → 24px), on
         the *same clamp curve* as `--spacing-inset` so the two read as one rhythm, but
         named apart because it is flow rather than inset. Both sites migrated:

         | Site | Before → After | 360px | 1024px | 1920px |
         |---|---|---|---|---|
         | `business-tiles:207` tile CTA | `pt-5` → `pt-card-flow` | 20 → 16.0 (−4.0) | 20 → 19.4 (−0.6) | 20 → 24.0 (+4.0) |
         | `news-carousel:140` news card action | `pt-4` → `pt-card-flow` | 16 → 16.0 | 16 → 19.4 (+3.4) | 16 → 24.0 (+8.0) |

         The news card is the larger move — it had been the tighter of the two at every
         width, and the convergence resolves that in the business tile's favour. 8px at
         1920 on a gap above a "Know More" is a visible loosening, and it is the intended
         outcome: two cards on the same page had disagreed about the same gap.
      3. **`presence-map:212` `gap-1.5`** — **left as a named exception**, recorded in
         guidelines §3 with the reason. 6px beside a 4px bullet; `--spacing-tight` would
         take it to 8–12px, which is proportionally large next to a mark that size.
         Proportion to the adjacent object governs here, not membership of the scale.
         The doc says explicitly: do not "fix" this to a token.
- [x] **C-12 (A-4) — close the footer's uppercase breach. DONE 2026-08-26, option 2.**
      `uppercase` dropped from `footer-links.tsx:46` and `:66`; `--text-label` stays.
      The five-role rule holds because `--text-label` is no longer an uppercase role, and
      **nothing about size, weight or tracking moves** — only capitalisation.
      **Option 1 (`--text-label` → `--text-meta`) was rejected.** It would have changed
      four things at once — size −21%, weight 400 → 700, tracking ×3.2, line-height
      1.35 → 1.5 — which is a redesign of the footer headings, not a token cleanup, and
      not something to smuggle into a refactor pass. Guidelines §2 records the closure and
      the rejected alternative.

---

## 5. Deprecation candidates

**Not to be deleted** — to be marked in the guidelines as cancelled, with a reason and a
date, per the Step 2 constraint. 44 tokens are declared and referenced nowhere outside
`theme.css`.

| Group | Tokens | Reason |
|---|---|---|
| SDG marquee | `--color-sdg-3/5/7/8/9/10/11/12/13/15`, `--radius-sdg`, `--text-sdg-num` | Section cancelled by the client, 2026-08-05 |
| Vision timeline | `--gradient-timeline`, `--text-milestone` | Not built; `features/04` §8 says ask first |
| Share-price ticker | `--color-quote-*` (6), `--radius-quote`, `--shadow-quote`, `--shadow-quote-hover` | Surface not built |
| Superseded by v2 | `--gradient-caption`, `--gradient-goal-hover`, `--gradient-footprint`, `--text-footprint-title`, `--gradient-hero-scrim-mobile`, `--gradient-hero-vignette`, `--color-surface-map` | Replaced during PR 2528 |
| `FlankedEyebrow` removal | `--gradient-rule-left`, `--gradient-rule-right` | Primitive folded into `Eyebrow` |
| Stats band merge | `--color-rule` | Band merged into the business tiles |
| Business tile v2 | `--color-tile-surface`, `--color-tile-upcoming-edge`, `--spacing-icon-mark` | Tiles now sit on the section ground |
| Hero v2 | `--hero-parallax-symbol`, `--hero-parallax-text` | Parallax reduced to the image only |

| Unclear | `--business-max-w`, `--spacing-dot-target` | **Verify before marking** — may be pending consumers |
| Dead keyframes | `sdgMarquee`, `dotPulse`, `sparkFlick` + their `.anim-*` classes | Same cancelled/unbuilt sections |

> **False positive, do not deprecate:** `--color-pixel-1..6` are read at runtime by
> `pixel-strip/scatter.tsx` through a template literal
> (`getPropertyValue(\`--color-pixel-${n}\`)`), so no static reference exists. They are live.

### Retained-dormant — a different category from the table above

**Ruled 2026-08-26.** Everything in the table above describes a **surface that no longer
exists**: the client cancelled the SDG marquee, deferred the timeline, never commissioned
the share-price ticker. Those tokens are deprecated because the thing they describe is
gone.

The group below is not that. These describe a **form that still exists and is correctly
built — it simply has no consumer on the homepage.** They are *not* deprecated, must not
be pruned by a future cleanup that reads "no references" as "dead", and need no reason to
come back beyond a page that wants the shape.

| Primitive / tokens | Why it is dormant | Why it is kept |
|---|---|---|
| `ui/tile-shape.tsx` | v2 replaced the business tiles with ledger rows, and `ui/card.tsx` stopped wrapping it in **C-1**. Rendered only on `/dev/design-system` | A distinctive SAEL form, and the hard part — a chamfer that survives `clip-path` without a stretched SVG — is already solved. Annotated in the file itself |
| `--drop-shadow-tile`, `--drop-shadow-tile-hover` | The tile's elevation, a `drop-shadow` filter applied before `clip-path` clips | Meaningless apart from the chamfer; they travel with it |
| `--lift-card` | The 5px hover lift the pre-v2 news card used | Same shape of thing — the v2 card lifts nothing, but a boxed card elsewhere would |
| `ui/date-badge.tsx` | Zero call sites since PR 2528 (**P-5** / **D-5**) | Newsroom (FE-18) is its obvious consumer. The same "between consumers" ruling |

> **Not in this group — still live, do not touch:** `--radius-card` and
> `--shadow-card-hover`. Both look stranded from `card.tsx` alone, but the **footer's logo
> plate** (`footer.tsx:52`) uses both, and `--radius-card` is additionally used by
> `ui/tile-shape.tsx` and `ui/skeleton.tsx`. Checked at HEAD, 2026-08-26.

---

## 6. Ambiguities — resolved 2026-08-26

Four places where `theme.css` at `565a3dc` could not settle a value, or contradicted the
approved ledger. All four are now ruled on and applied.

| # | Where | The problem | Ruling and what was done |
|---|---|---|---|
| A-1 | **D-4 token values** | `--spacing-inset` / `--spacing-tight` do not exist in `theme.css`, and the built components disagree with themselves — card inset appears as both `p-4` and `p-5 lg:p-6`, icon gaps as `gap-3`, `gap-4`, `gap-1.5`. No single value to transcribe. | **Proposal accepted as approved values: `--spacing-inset` 16 → 24px, `--spacing-tight` 8 → 12px.** Recorded in §3 of the guidelines as approved, with an explicit note that the doc states intent ahead of the code. Minting and call-site migration remain **C-11**. |
| A-2 | **`--gradient-hero-scrim`** | Also unreferenced at HEAD; the ledger had listed only `-scrim-mobile` and `-vignette`. | **Approved.** Deprecated alongside the other two in §1, one reason covering all three. |
| A-3 | **`--color-inert`** | Live (`bg-inert/10` in `MediaFrame`, map tooltip ground) but §1's usage note — "Goals card resting background" — had been wrong since the goals redesign. | **Approved.** Reclassified, not deprecated. Usage note rewritten to what it does. |
| A-4 | **`--text-label` as a sixth uppercase role** | The footer's two column headings set `--text-label` uppercase, outside the five-role rule. | **Rule stays at five roles; the footer moves to `--text-meta`.** §2's uppercase rule is now explicitly closed — "a sixth uppercase surface is a sign that one of the five is the right token". `--text-label`'s own row is amended to sentence case, since the uppercase stat-label role left with the stats band. The code change is **C-12**. |

### Closed from the C-3 recount — the exception is now named and shut

The footer's six sites were closed by **C-10**. The remaining alpha modifiers sat under
§1's interaction-state exception without being named in it; **ruled 2026-08-26: name them
explicitly and close the list.** §1 now carries a five-row table rather than a clause —
`bg-white/10` (`Button`), `bg-ink/5` (rail arrows), `border-nav-accent/50` and `/40`
(`mega-menu.tsx:145`, `:152`) and `bg-inert/10` (`media-frame.tsx:68`) — each with the
reason it is not a colour, and a closing line: *a sixth is a sign that a token is missing,
not that the list should grow.* No code changed; this was a documentation closure.

An implied exception is not enforceable and not reviewable — the next contributor cannot
tell an admitted wash from a breach that nobody has noticed yet. That is the whole reason
for naming them.

---

## 7. What happens next

**All five steps are complete and all twelve code fixes have landed.** The full suite is
green. `docs/design-guidelines.md` describes the homepage that exists, and About Us
(FE-06) can open against it.

**C-1 and C-2 came out opposite ways, and the difference is the most useful thing in this
document.** Both asked: does the built page match the primitive? For `Card`, the page had
one consistent shape and the primitive described a surface v2 had cancelled — so **the
primitive changed**. For `SectionHeading`, the page has **no** consistent heading block,
and the primitive is being used correctly by the two consumers it has — so **adoption was
declined**, and only the part three sections genuinely shared was extracted as
`DisplayHeading`. Zero call sites was a defect; two correct call sites was not. An audit
that counts references will mistake the second for the first.

**Nothing is outstanding.** Two items are parked by ruling rather than left open:

- **Retained-dormant** — `ui/tile-shape.tsx`, `ui/date-badge.tsx` and the three tokens that
  travel with the chamfer. Built, correct, unused. §5 keeps them separate from the
  deprecated group so a future cleanup does not read "no references" as "dead".
- **`docs/frontend-progress.md`** carries this work as **FE-25** in Pending, before FE-06.
  It is not In Progress — `/CLAUDE.md` §3 allows one such item and FE-04 holds it.

## 8. Session record — decisions outside any single C-item

### The formatter reorders Tailwind classes, and that is inert

`prettier --write` over the five files with pre-existing style drift produced two class
reorders, because the project's `.prettierrc.json` loads `prettier-plugin-tailwindcss`:

- `intro-split/index.tsx` — `lg:col-start-2 lg:col-span-5` → `lg:col-span-5 lg:col-start-2`
- `pixel-strip/index.tsx` — `ground-dots-paper` moved to the end of its class list

This ran against a "formatting only, no class-order changes" instruction, and the two
could not both be honoured: the plugin is in the project's own config, so reverting the
order puts `format:check` back in the red.

**Proven inert rather than assumed.** The tree was built twice — once with the `HEAD`
versions, once with the formatted versions — and the emitted stylesheets compared at the
declaration level: **694 declarations, identical.** Class attribute order has no bearing
on the cascade for utilities in the same layer; only layer order does. The one mechanism
that *is* order-sensitive, `tailwind-merge`'s last-wins conflict resolution, does not
apply — neither list contains a conflicting pair.

### Toolchain — this repo needs Node 24, and the machine had Node 20

`package.json` requires Node ≥24 / pnpm ≥11. The machine had only Node 20, and
`node_modules` was absent, so nothing in `pnpm check` could run at first.

- Installed `node@24` via Homebrew. It is **keg-only** — it must be put on `PATH`
  explicitly (`export PATH="/opt/homebrew/opt/node@24/bin:$PATH"`); nothing was written
  to any shell profile.
- pnpm 11.5.1 activated through `corepack`, then `pnpm install --frozen-lockfile`.
- **`.env.local` was missing** and the build fails without `NEXT_PUBLIC_SITE_URL`. Copied
  from `.env.example` unmodified. Gitignored via `.env*.local`; **not to be committed.**
- **`next-env.d.ts` had never been generated.** This made `lint` report 31 errors and
  `typecheck` 14 × `TS2307: Cannot find module '@/assets/images/…'` — all of it one
  missing `/// <reference types="next/image-types/global" />`. Both went clean after the
  first successful build. Anyone bootstrapping this repo will hit the same thing: **build
  before believing lint or typecheck.**

### Pre-existing defects found and fixed

- **`src/styles/theme.css` ended with a dangling `/*`** — an unterminated comment,
  committed in `565a3dc`. Tailwind and PostCSS tolerated it so `build` passed, but
  Prettier aborted on it, and because Prettier aborts the *whole run* on a syntax error
  it was masking style drift in five further files. Removed (approved); the five files
  were then formatted.
- `format:check` is **not** part of `pnpm check` (`lint && typecheck &&
  verify:guardrails && build`), which is why the above went unnoticed. `lint-staged` does
  run Prettier on staged files, so it would have surfaced at the next commit touching any
  of them. Worth considering whether `format:check` belongs in `check`.

---

## 9. Handoff — what an About Us (FE-06) session needs to know

Written 2026-08-26, at the close of this work. Read this, then
`docs/design-guidelines.md` §8 *Building a new page*, then `docs/features/06-about-us.md`.

### The one-paragraph version

`design-guidelines.md` had drifted ~150 tokens behind the code and has been realigned
against the built homepage; it is authoritative again. Twelve code fixes landed. The
guardrail now catches magic numbers, so a value you cannot express as a token will fail
the build rather than the review. Reach for the primitives below before writing a surface —
two of them were rewritten or extracted in this pass specifically so About Us would
inherit something correct.

### Primitives — what to use, and for what

| Primitive | Use it for | Notes |
|---|---|---|
| `ui/section.tsx` | Every section | Carries the ground: `black`, `black-dots`, `paper`, `paper-dots`, plus `fullBleed` and `spacing` |
| `ui/container.tsx` | The page's horizontal padding | **The only legal source of `px-gutter`.** A guardrail fails the build if any other file sets it. A full-bleed section opts out by not rendering one, and puts a `<Container>` around its inner text instead |
| `ui/eyebrow.tsx` | The section label | Four tones — `gradient`, `accent`, `bright`, `deep`. **`deep` on paper, `bright` on black.** Underline is on by default and rides `<Reveal>`'s `data-reveal` |
| `ui/display-heading.tsx` | The section heading | **New (C-2).** `<DisplayHeading ground="paper" \| "dark">`. The ramp follows the ground and the variant is what keeps that right |
| `ui/card.tsx` | Any hairline-and-inset surface | **Rewritten (C-1).** `ground`, `inset`, `accentClassName`, `as`. Hairline + inset + an accent filling across it on hover |
| `ui/section-heading.tsx` | A **single-block** heading — eyebrow, title and description together | For a page not built on the reveal cascade. The error pages use it. **Do not** use it in a section that staggers its parts |
| `ui/rail/` | A horizontal scroller | `Rail` + `RailTrack` + `RailArrows`. A real scroll container with CSS snapping; the arrows are an addition, not the mechanism, and the section places them |
| `ui/reveal.tsx` | Everything inside a section | See the cascade rule below |
| `ui/media-frame.tsx` | Bundled artwork | Holds the box whether or not the asset exists yet. Takes `StaticImageData`; a CMS URL needs a plain `<Image>` |
| `ui/arrow-glyph.tsx`, `ui/button.tsx`, `ui/accordion.tsx`, `ui/pagination.tsx`, `ui/empty-state.tsx`, `ui/skeleton.tsx` | As named | `Button` has five variants — `primary`, `ghost`, `onDark`, `outline`, `quiet` — and a `micro` size |
| `ui/tile-shape.tsx`, `ui/date-badge.tsx` | **Nothing yet** | **Retained-dormant** (§5). Built and correct, no consumer. `DateBadge` is Newsroom's (FE-18). Do not delete either, and do not feel obliged to use them |

### The five things that will bite you

1. **The ground decides the ramp, and there are two different "bright"s.**
   Paper → `Eyebrow tone="deep"` + `DisplayHeading ground="paper"`
   (`--gradient-eyebrow-deep`). Black → `tone="bright"` +
   `ground="dark"` — and the heading's ramp is **`--gradient-heading-bright`**, *not*
   `--gradient-eyebrow-bright`, which belongs to the label above it. `DisplayHeading`
   encodes this; if you hand-roll a heading you will get it wrong.

2. **A new `--text-*` token must also go in `FONT_SIZES` in `src/lib/utils/cn.ts`.**
   `tailwind-merge` matches `text-*` against Tailwind's *default* scale to decide whether
   a class is a size or a colour. Every size here is a custom `@theme` token, so an
   unregistered one falls through to the colour group and is **silently discarded** the
   moment it meets a colour: `cn('text-hero text-white')` → `'text-white'`, with the
   element rendering at the inherited body size. No error, no warning. This shipped in
   FE-02 and was found in FE-04.

3. **Magic numbers now fail the build** (C-5). The check matches an arbitrary value whose
   contents begin with a digit, so `h-[42px]` and `z-[100]` are rejected while
   `pt-[calc(var(--a)+var(--b))]`, `supports-[…]` and `data-[…]` still pass. Grid tracks
   are the one carve-out. Mint a token in `theme.css` — and check the name against
   Tailwind's `inline-*` display utilities first, because `--spacing-block` once minted an
   `inline-block` utility that silently constrained every inline-block on the site.

4. **The reveal cascade is composed per element, not per block.** Wrap *each* of label,
   heading and copy in its own `<Reveal order={n}>` with ascending order — 0, 2, 4 — so
   they arrive one after another. `Reveal` **is** the box and carries one
   `--reveal-order`. This is why `SectionHeading` is not used on the homepage, and why a
   heading primitive must be a heading and nothing more.

5. **Every animation defines its still state unconditionally** and adds motion only inside
   `@media (prefers-reduced-motion: no-preference)`. A reduced-motion user must get the
   resting design, never a half-applied one and never an element stranded at `opacity: 0`.
   Bespoke keyframes go in `src/styles/animations.css`, never inline.

### Rules with a documented exception — do not "fix" these

- **`--spacing-inset` is for card and panel interiors.** Component chrome — `Button`, the
  accordion, the masthead, the mega menu, pagination — has its own §4 spec and is
  **permanently excluded**. Where §4 specifies a component's padding, §4 wins.
- **`presence-map:212`'s `gap-1.5`** is a named exception: 6px beside a 4px bullet.
- **Alpha modifiers are not a colour source**, and §1's interaction-state exception is a
  **closed five-row list**. A sixth means a token is missing.
- **`font-bold` is legal in exactly one place**: emphasis within body copy, on a body
  token. Not on headings, not on labels, not on any token whose role carries a weight.
- **Uppercase belongs to five roles** and the list is closed.

### Running the toolchain

`package.json` needs **Node ≥24** and pnpm ≥11. If Node 24 came from Homebrew it is
keg-only: `export PATH="/opt/homebrew/opt/node@24/bin:$PATH"`. Copy `.env.example` to
`.env.local` (`NEXT_PUBLIC_SITE_URL` is required and `.env.local` must never be committed).
**Build before believing `lint` or `typecheck`** — `next-env.d.ts` is generated by the
build and gitignored, and without it you will see ~45 phantom errors that are not real.
Note `format:check` is **not** part of `pnpm check`; run it before committing.

### Proving a refactor changed nothing

The method used throughout this work, in order of strength:

1. **Two clean builds and compare the stylesheet.** `rm -rf .next` **each time** — stale
   chunks from earlier builds otherwise inflate every count and can invent differences. A
   byte-identical sha256 is the end of the argument.
2. **Compare rendered class *sets* per element** from `.next/server/app/index.html`. Order
   is irrelevant: utilities in one layer are governed by layer order, not attribute order,
   and `tailwind-merge`'s last-wins only applies to a conflicting pair.
3. Only then reason about the CSS.
