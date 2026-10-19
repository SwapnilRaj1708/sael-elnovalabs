import Image, { type StaticImageData } from 'next/image';
import { cva } from 'class-variance-authority';
import { ArrowGlyph } from '@/components/ui/arrow-glyph';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CountUp } from '@/components/ui/count-up';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { SIZES_BUSINESS_ICON } from '@/lib/utils/image-sizes';
import { cn } from '@/lib/utils/cn';

/**
 * The two title treatments the client asked to compare on 2026-08-27. Both are
 * live code; **switching between them is the one word below.**
 *
 *  - `plain`    the name on its own line at --text-ledger-title, in the row's
 *               quiet on-dark colour. The size is the whole of the change.
 *  - `gradient` the same line, with the row's mark gradient clipped to the
 *               letterforms, so the name, its capacity figure and the artwork
 *               beside them all carry one colour.
 *
 * Neither is commented out, deliberately. A commented-out variant is not
 * type-checked, not linted and not covered by `pnpm verify:guardrails`, so it
 * rots quietly until the day someone uncomments it; these two both compile
 * every build, and the guardrails see both. Flipping the constant is the same
 * one-line edit either way.
 */
const TITLE_VARIANT: 'plain' | 'gradient' = 'gradient';

/**
 * The business name on a ledger row.
 *
 * **One line that wraps only when it has to.** The name used to be supplied
 * pre-split as a two-element tuple and joined with a `<br>`, which forced the
 * break at every width; it is one string now and the browser decides. The
 * column carries `min-w-0`, so on a narrow screen the name wraps rather than
 * pushing the mark off the row, and `text-wrap: balance` splits it evenly when
 * it does instead of leaving one word stranded.
 *
 * The gradient variant reads --ledger-title-gradient, which each tile sets to
 * its own mark's ramp — see `titleGradientClassName` on BusinessTile. The
 * property is set on every row in both variants and simply goes unread in
 * `plain`, which is what keeps this a variant lookup rather than a conditional
 * threaded through the row.
 */
const ledgerTitle = cva('text-ledger-title [text-wrap:balance]', {
  variants: {
    variant: {
      plain: 'text-on-dark-faint',
      gradient: 'bg-(image:--ledger-title-gradient) gradient-text',
    },
  },
});

export interface BusinessTile {
  id: string;
  icon: StaticImageData | null;
  /**
   * The business name, as one string. Set on a single line and wrapped by the
   * browser only where the column is too narrow for it — it was a pre-split
   * `[string, string]` broken with a `<br>` until 2026-08-27.
   */
  title: string;
  /** Rendered as a superscript after the title. Marks "upcoming". */
  titleMarker?: string;
  description: string;
  /** The capacity figure, verbatim. `null` for a row that has none. */
  value: string | null;
  /** Qualifier under the figure. */
  footnote: string | null;
  href: string;
  /** Accessible label for the row's action, e.g. "Know more about …". */
  ctaLabel: string;
  /**
   * Tailwind text-colour class for the capacity figure, keyed to this
   * business's mark. A class rather than a raw colour so it stays in the token
   * layer — /CLAUDE.md §2.
   */
  figureClassName: string;
  /**
   * Background-colour class for the rule that fills across the row on hover.
   * The same accent as the figure, so the row reads as one object.
   */
  ruleClassName: string;
  /**
   * Sets `--ledger-title-gradient` to this business's mark ramp, for the
   * `gradient` title variant — `[--ledger-title-gradient:var(--gradient-ledger-solar)]`.
   * A class rather than a raw gradient so the colour stays in the token
   * layer, the same way `figureClassName` does. /CLAUDE.md §2.
   */
  titleGradientClassName: string;
  /**
   * Marks the row as not yet operational, which gives it its own ground — the
   * frosted grey the masthead takes over a white page, moved onto the black
   * one. Every other row sits on the section itself.
   */
  upcoming?: boolean;
}

export interface BusinessTilesProps {
  eyebrow?: string;
  tiles: BusinessTile[];
  snap?: boolean;
}

/**
 * "Business Portfolio" — the four businesses, each with its headline capacity.
 * docs/features/04 §4, rebuilt to `SAEL Home v2`.
 *
 * **A ledger, not a grid of cards.** The earlier build set four centred tiles
 * on a light ground with the figure tucked in beside the business name. v2
 * sets the same four as rows on the black ground: a hairline across the top,
 * the business named above a capacity figure that is the largest thing on the
 * page after the hero headline, its mark at the row's right edge, and the copy
 * running underneath. The figure is why the row exists, and the row is now
 * laid out to say so.
 *
 * The name was set small and quiet until 2026-08-27, when the client asked for
 * it to carry more of the row. It is one line at roughly twice the size now,
 * in one of two treatments — see TITLE_VARIANT below.
 *
 * The figures are the page's static content (`app/_content/homepage.ts`),
 * passed in with the rest of each row — the backend has no endpoint for them.
 * A row whose `value` is null renders without its figure.
 *
 * **The whole row is the link, and there is exactly one link in it.** The
 * design draws a "Know More" action; making the row a link *and* keeping the
 * action would nest two interactive elements. Instead the action's hit area is
 * stretched over the row with a pseudo-element, so a pointer gets the whole
 * row, a keyboard gets one stop, and a screen reader hears one link.
 *
 * A Server Component apart from the figures' count-up.
 */
export function BusinessTiles({ eyebrow, tiles, snap = false }: BusinessTilesProps) {
  return (
    <Section
      data-snap-section
      background="black-dots"
      spacing="tight"
      className={cn('flex items-center', snap && 'min-h-viewport snap-start')}
    >
      <div className="flex w-full flex-col gap-stack">
        {eyebrow !== undefined && (
          <Reveal order={0}>
            <Eyebrow tone="bright">{eyebrow}</Eyebrow>
          </Reveal>
        )}

        {/* A column gap and no row gap. The rows are separated by their own top
            hairline, which is what makes four of them read as one ledger
            rather than as four detached blocks. */}
        <div className="grid gap-x-ledger-col-gap md:grid-cols-2">
          {tiles.map((tile, index) => {
            return (
              <Reveal
                key={tile.id}
                // 2, 3, 4, 5 — the eyebrow is 0 and 1 is deliberately unused,
                // so the label lands, a beat passes, then the rows follow in
                // reading order.
                order={index + 2}
                className="flex"
              >
                <Card
                  // Half the 0.3 it was — the client found the dots too
                  // strong on hover, 2026-10-06.
                  hoverIntensity={0.15}
                  as="article"
                  ground="dark"
                  inset="block"
                  // Each row's own accent colour. The hairline it fills across,
                  // and the timing, come from the primitive.
                  accentClassName={tile.ruleClassName}
                  className={cn(
                    // A row, not a stack: the copy is one column and the mark
                    // is the other. The mark used to be absolutely positioned
                    // over the row with a right padding reserving space for
                    // it, which is what kept clipping it — an out-of-flow box
                    // whose only child is itself out of flow has no content to
                    // size against, so its height came from `aspect-ratio`
                    // alone and any disagreement about that showed up as a
                    // trimmed mark. In flow it is laid out like anything else
                    // and there is nothing left to get wrong.
                    'gap-x-flow',
                    // Every row's mark stands off the row's right edge by the
                    // same margin, the padding the upcoming row's panel brought
                    // with it — the client's call of 2026-10-14. `inset` up to
                    // `md`.
                    //
                    // From `md` there is neither gap nor padding on the row:
                    // the mark's own zone, below, counts both (the client,
                    // 2026-10-14), so the mark can stand centred in the room
                    // the text leaves.
                    'pr-inset md:gap-x-0 md:pr-0',
                    // The one row that is not yet operational carries its own
                    // ground. Left padding comes with it: without it the copy
                    // would start hard against the panel's edge, where every
                    // other row starts against nothing.
                    tile.upcoming === true && 'bg-tile-upcoming pl-inset',
                  )}
                >
                  {/* `min-w-0` so a long capacity figure shrinks the column
                      rather than pushing the mark off the row — a flex item's
                      floor is its content's min-content width until you say
                      otherwise. */}
                  <div className="flex min-w-0 flex-1 flex-col md:flex-initial">
                    <h3
                      className={cn(
                        ledgerTitle({ variant: TITLE_VARIANT }),
                        tile.titleGradientClassName,
                      )}
                    >
                      {tile.title}
                      {/* Its own colour, not the heading's. Under the gradient
                        variant the heading is `color: transparent` with the
                        ramp clipped to its letterforms, and a child with no
                        colour of its own inherits the transparency without
                        inheriting the background — so an unstyled marker
                        would simply vanish. */}
                      {tile.titleMarker !== undefined && (
                        <sup className="text-tile-marker text-on-dark-faint">
                          {tile.titleMarker}
                        </sup>
                      )}
                    </h3>

                    {/* Counts up from zero when the section is reached. The figure
                      is the reason this row exists, so it is the one thing on
                      it that moves — and its colour is keyed to the mark beside
                      it rather than all four sharing brand red. */}
                    {tile.value !== null && (
                      <p
                        className={cn('mt-4 text-ledger-figure tabular-nums', tile.figureClassName)}
                      >
                        {/* One size for all four figures, at the client's
                          request on 2026-10-01 — "3.6 GWp + 5 GW" no longer
                          steps down. A trailing asterisk is split off and set
                          at half size so it reads as a marker, not a digit. */}
                        <CountUp value={tile.value.replace(/\*$/, '')} />
                        {tile.value.endsWith('*') && (
                          <span className="align-super text-ledger-figure-marker">*</span>
                        )}
                      </p>
                    )}

                    {tile.footnote !== null && (
                      <p className="mt-3 text-meta text-on-dark-muted uppercase">{tile.footnote}</p>
                    )}

                    {/* `--ledger-measure`, not `--measure`. The mark takes
                      real space beside this column now, so the copy can no
                      longer run under it — but 68ch still lets a line run far
                      wider than the design sets it. 46ch is the design's own
                      cap. */}
                    <p className="mt-4 max-w-(--ledger-measure) text-body-sm text-pretty text-on-dark-soft">
                      {tile.description}
                    </p>

                    {/* `mt-auto` keeps the actions on one line across rows whose
                      copy runs to different lengths. */}
                    <Button
                      href={tile.href}
                      variant="onDark"
                      size="micro"
                      className={cn(
                        // `onDark` brings the focus ring this needs on the black
                        // ground; its outline and hover fill belong to a boxed
                        // button and are removed, because here the action is a
                        // bare label with an arrow.
                        'border-0 pt-card-flow hover:bg-transparent',
                        // Red on hover, like the news card's "Read More". On
                        // the *group*, not on itself, so the label turns with
                        // the arrow beside it — <ArrowGlyph> already travels on
                        // `group-hover`, and the two firing on different
                        // triggers is what would read as broken. The row is one
                        // link, so hovering anywhere on it is hovering this.
                        // No `transition-*` here: the Button base already sets
                        // `transition`, and adding one would have tailwind-merge
                        // drop the base for the narrower class.
                        'group-focus-within:text-brand-red-bright group-hover:text-brand-red-bright',
                        "after:absolute after:inset-0 after:content-['']",
                      )}
                    >
                      <span className="sr-only">{tile.ctaLabel}</span>
                      <span aria-hidden="true" className="inline-flex items-center gap-tight">
                        Know More
                        <ArrowGlyph />
                      </span>
                    </Button>
                  </div>

                  {/*
                    The client's clean marks — no baked-in lettering, so
                    nothing is cropped and the row's own heading is the only
                    place the business is named.

                    A plain <Image>, not <MediaFrame>. The frame primitive
                    exists for a photograph filling a box its parent sized, and
                    using it for a mark meant undoing it three times over: an
                    aspect ratio computed from the import to stop the box
                    disagreeing with the artwork, `object-contain` to cancel
                    its `object-cover`, and `overflow-visible` to cancel its
                    clip. Three corrections to arrive back at what an <img>
                    does unaided. A static import already carries the artwork's
                    intrinsic width and height, so a width and `h-auto` draw
                    each mark at its own proportions — nothing to letterbox and
                    nothing to crop, which is the whole requirement.

                    The four run 0.838 to 1.002, so their rendered heights
                    differ. That is the artwork, not a defect: they are pinned
                    to a common width and centred on the row. (These files were
                    re-cut on 2026-08-26 from the hero masters after the first
                    set turned out to be sliced through at the bottom edge —
                    the crop the client reported was baked into the PNGs, not
                    applied by anything here.)

                    `pointer-events-none` so the mark never intercepts the link
                    stretched over the row.
                  */}
                  {tile.icon !== null && (
                    <div
                      className={cn(
                        'flex shrink-0 justify-center self-center',
                        // From `md` the text column is as wide as its content
                        // (`flex-initial`, above), not the whole row, and this
                        // zone takes everything left of it and centres the mark
                        // in that room (the client, 2026-10-14). Its floor is
                        // the room the mark had beside the text before, so
                        // where the text has no slack it keeps its width.
                        'md:min-w-ledger-mark-zone-md md:flex-1 lg:min-w-ledger-mark-zone-lg',
                      )}
                    >
                      <Image
                        src={tile.icon}
                        alt=""
                        sizes={SIZES_BUSINESS_ICON}
                        className="pointer-events-none h-auto w-ledger-icon shrink-0"
                      />
                    </div>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
