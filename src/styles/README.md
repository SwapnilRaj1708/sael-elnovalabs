# Styles

Three files, imported in this order by `globals.css`, which is the only
stylesheet the application imports:

| File             | Holds                                                         |
| ---------------- | ------------------------------------------------------------- |
| `theme.css`      | Every design token. `@import 'tailwindcss'` lives here.       |
| `animations.css` | Bespoke `@keyframes` and the utility classes that apply them. |
| `globals.css`    | Document reset, base element styling, the entry point.        |

**Adding a token means editing `theme.css`.** Do not introduce a new custom
property in a component file, and do not put a literal in one — `pnpm check`
fails on a brand hex or a bare `vw` outside `theme.css`.

---

## The fluid scale

Continuous properties — type sizes, gutters, section rhythm — are single
`clamp()` expressions spanning the whole viewport range. Discontinuous ones —
column counts, layout direction, whether a component exists at all — are
breakpoint switches. A carousel does not `clamp()` into an accordion.
`docs/responsive-strategy.md` §3.

### Anchors

|     | Viewport   | Meaning                                                                                                   |
| --- | ---------- | --------------------------------------------------------------------------------------------------------- |
| min | **360px**  | The design floor. Below this we do not go.                                                                |
| max | **1920px** | The prototype's design width, from which every desktop value in `docs/design-guidelines.md` was measured. |

### The two-point formula

For a value that should be `min` px at 360 and `max` px at 1920:

```
slope     = (max − min) / (1920 − 360)
vw        = slope × 100
intercept = min − slope × 360           (px, may be negative)

--token: clamp( min/16 rem, intercept/16 rem + {vw}vw, max/16 rem );
```

Worked, for `--text-h2` (24 → 36):

```
slope     = (36 − 24) / 1560          = 0.0076923
vw        = 0.76923
intercept = 24 − 0.0076923 × 360      = 21.2308px = 1.3269rem

--text-h2: clamp(1.5rem, 1.3269rem + 0.7692vw, 2.25rem);
```

Round the `rem` and `vw` parts to four decimal places. **Generate these, do not
hand-tune them** — an eyeballed expression drifts a few pixels off its own
endpoints, and the drift is invisible until two tokens that should agree at
1920px do not.

Note what the bounds buy: below 360px the `min` holds, above 1920px the `max`
holds, so the layout stops growing on an ultrawide without a second rule. This
is also why `vw` is permitted inside a `clamp()` here and nowhere else — the
bounds make it safe, and a bare `vw` is a proportional unit masquerading as a
responsive one.

### Mobile minimums for the type scale

`docs/design-guidelines.md` §2 gives only the 1920px value. Five minimums are
stated elsewhere in the docs; the rest were proposed in FE-02 and approved.

| Token               | Min | Max | Minimum from                                          |
| ------------------- | --- | --- | ----------------------------------------------------- |
| `--text-hero`       | 28  | 58  | `responsive-strategy.md` §4, Hero → Type              |
| `--text-h2`         | 24  | 36  | `features/02-design-system-foundation.md` §2          |
| `--text-h3`         | 16  | 22  | `responsive-strategy.md` §4, In the News              |
| `--text-stat`       | 28  | 40  | `responsive-strategy.md` §4, Stats band               |
| `--text-sdg-num`    | 34  | 56  | `design-guidelines.md` §1, "the card's 34px+ numeral" |
| `--text-milestone`  | 28  | 36  | proposed                                              |
| `--text-goal-title` | 20  | 26  | proposed                                              |
| `--text-body`       | 16  | 20  | proposed — 16 is the floor for running copy           |
| `--text-body-sm`    | 15  | 17  | proposed                                              |
| `--text-label`      | 14  | 16  | proposed                                              |
| `--text-eyebrow`    | 13  | 16  | proposed                                              |
| `--text-cta`        | 15  | 17  | proposed                                              |
| `--text-badge`      | 12  | 14  | proposed                                              |
| `--text-nav`        | —   | 16  | fixed; below `lg` the nav renders at `--text-h3`      |

Tracking is stored in `em`, converted from the doc's px value at the **desktop**
size (eyebrow: 2.5px ÷ 16px = 0.1563em). In `px` it would read loose at 360 and
tight at 1920; in `em` the ratio holds across the ramp.

### Why `--spacing-gutter` is not one clamp

The gutter table is 20 / 40 / 64 / 104 / 156px at 360 / 768 / 1024 / 1440 /
1920 — and it is **not linear**. A straight 360→1920 fit gives 56px at 768
where the table says 40, a 40% overshoot that eats tablet content width.

The table is, however, strictly convex; its segment slopes only ever increase:

| Segment     | Slope     |
| ----------- | --------- |
| 360 → 768   | 4.9020vw  |
| 768 → 1024  | 9.3750vw  |
| 1024 → 1440 | 9.6154vw  |
| 1440 → 1920 | 10.8333vw |

A convex piecewise-linear function is exactly the `max()` of its own segment
lines, so:

```css
--spacing-gutter: clamp(
  1.25rem,
  max(0.1471rem + 4.902vw, 9.375vw - 2rem, 9.6154vw - 2.1538rem, 10.8333vw - 3.25rem),
  9.75rem
);
```

reproduces all five anchors **to the pixel** and stays continuous — the value
never jumps at a breakpoint, only its gradient changes. If a future anchor
breaks convexity the `max()` trick stops working; recheck the slopes before
editing the table.

---

## Tokens that are not in `@theme`

Tailwind v4 generates utilities from recognised namespaces (`--color-*`,
`--text-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`,
`--ease-*`, `--font-*`). Gradients, `--measure` and the motion durations have no
namespace, so they sit in `:root` instead of generating nothing from `@theme`.

Use them by name:

```jsx
<div className="bg-(image:--gradient-cta)" />
<p className="max-w-(--measure)" />
```

### Two token renames from `docs/design-guidelines.md`

Both are recorded in that document; this is the reasoning.

- **`--color-body` → `--color-body-base`.** `--text-body` already claims the
  `text-body` utility for font-size. With both defined, `text-body` resolves to
  the size and the colour becomes unreachable.
- **`--color-body-onDark` → `--color-body-on-dark`.** It was the only camelCase
  token in the set, and it generated a `text-body-onDark` utility that no other
  utility in the codebase resembles.

---

## Motion

Every keyframe lives in `animations.css`, and every _application_ of one is
inside `@media (prefers-reduced-motion: no-preference)`. **The still state is
the default**, not the thing you opt into. Components apply a utility class
(`.anim-ken-burns`), never an `animation:` shorthand inline.

Where an animation needs a per-item value — the hero headline's 55ms per-word
stagger — the component sets a custom property (`--anim-index`) and the
utility class does the arithmetic. That is the one sanctioned use of
`style={{}}`: a runtime value carried into CSS, not a style decision.
