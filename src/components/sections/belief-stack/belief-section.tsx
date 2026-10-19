import { Check } from 'lucide-react';
import type { StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { DisplayHeading } from '@/components/ui/display-heading';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { imageAspectVar } from '@/lib/utils/image-aspect';
import { SIZES_BELIEF_CUTOUT } from '@/lib/utils/image-sizes';

/** A belief's accent — one of the bright ramps' stops. See --color-ramp-*. */
export type BeliefAccent = 'violet' | 'rose' | 'coral' | 'indigo';

const ACCENT_CLASS: Record<BeliefAccent, string> = {
  violet: 'text-ramp-violet',
  rose: 'text-ramp-rose',
  coral: 'text-ramp-coral',
  indigo: 'text-ramp-indigo',
};

export interface BeliefCutout {
  /** A cut-out on a transparent ground, fitted rather than cropped. */
  image: StaticImageData | null;
  /** Meaningful description, or `''` if the cut-out is decorative. */
  alt: string;
  /** The asset's name in docs/asset-inventory.md, for the pending placeholder. */
  pending?: string;
  /**
   * Which edge of the card the figure runs out to, over its padding. Below
   * `lg` the figure stands at the card's foot, so `right` and `left` also
   * reach the bottom edge; from `lg` it is its half of the card, and
   * `bottom-flush` alone reaches the bottom. Omitted: centred, inside the padding.
   *
   * From `xl`, `right` also runs the figure over the top and bottom padding:
   * it is the card's full height, at its own ratio, from the right edge, and
   * spills left past its column when that ratio is wider than the column
   * (Environmental Stewardship, 2026-10-19).
   *
   * `right-middle` and `left-middle` run out over that side's padding only,
   * and keep the figure centred top to bottom (Sustainability Governance,
   * 2026-10-19): a wide figure there is held by its width, so the extra width
   * is what makes it larger.
   */
  anchor?: 'right' | 'left' | 'right-middle' | 'left-middle' | 'bottom-flush';
  /** Mirror the figure horizontally. */
  flip?: boolean;
}

const ANCHOR_BOX_CLASS = {
  right: '-mr-flow lg:mb-0',
  left: '-ml-flow lg:mb-0',
  'right-middle': '-mr-flow lg:mb-0',
  'left-middle': '-ml-flow lg:mb-0',
  'bottom-flush': '',
} as const;

/** A mirrored image is positioned before it is flipped, so its side swaps. */
const MIRRORED = {
  right: 'left',
  left: 'right',
  'right-middle': 'left-middle',
  'left-middle': 'right-middle',
  'bottom-flush': 'bottom-flush',
} as const;

/**
 * The frame inside the box. `right` from `xl`: top and bottom over the card's
 * padding, pinned to the right edge (the box already runs out to it), and as
 * wide as `--media-aspect` makes it — so the figure fills it exactly, and the
 * card's own clip is the only thing that stops it. From `xl` rather than `lg`
 * because between the two the copy column is too narrow, and the figure,
 * spilling left, lands on the checklist; there it stays fitted in its column.
 */
const ANCHOR_FRAME_CLASS = {
  right: 'xl:inset-auto xl:-inset-y-flow xl:right-0 xl:aspect-(--media-aspect)',
  left: '',
  'right-middle': '',
  'left-middle': '',
  'bottom-flush': '',
} as const;

const ANCHOR_IMAGE_CLASS = {
  right: 'object-right-bottom lg:object-right',
  left: 'object-left-bottom lg:object-left',
  'right-middle': 'object-right',
  'left-middle': 'object-left',
  'bottom-flush': 'object-bottom',
} as const;

/** One belief: what its card says and shows. */
export interface Belief {
  /** The section's `id`, so a belief can be linked to; its heading's is derived. */
  id: string;
  title: string;
  body: string;
  /** The checklist under the copy, in order. */
  points: readonly string[];
  /** A white line icon, drawn inside the diamond badge. Decorative. */
  icon: ReactNode;
  cutout: BeliefCutout;
  accent: BeliefAccent;
  /** Which half of the card the cut-out takes from `lg`. Beliefs alternate. */
  side: 'start' | 'end';
  /**
   * The ground the belief is drawn on. `dark` unless given. `paper` sets the
   * section, the card's outline, the heading, copy and checklist in their
   * paper ramps and inks — Environmental Stewardship and Our Biodiversity
   * Commitment, at the client's request of 2026-10-14. The accent is the
   * belief's own on either ground: violet and indigo, the two on paper, are
   * 3.1 and 4.0 against it, over the 3.0 a check mark needs; coral would
   * not be. The icon is the caller's: pass the set's coloured variant.
   */
  ground?: 'dark' | 'paper';
}

export interface BeliefSectionProps extends Belief {
  /** Something under the card — the page's closing action, on the last belief. */
  action?: ReactNode;
  /** Opt into the page's section snapping. See `data-snap-sections`. */
  snap?: boolean;
}

/**
 * One belief on Our Core Beliefs, as a screen of its own — an outlined card
 * holding a diamond badge, a display heading, a paragraph and a checklist,
 * beside a cut-out figure.
 *
 * Built to `Our Core Beliefs.dc.html` (FE-14). The design stacks the four
 * cards in one long column; the page snaps from one to the next as the
 * homepage does (the client's call of 2026-10-06), so each card is its own
 * section, a screen tall with the card centred in it. Below `lg` a card is
 * taller than a phone's screen, and a snapping section that is taller than
 * the screen scrolls freely inside and snaps at its edges — see globals.css.
 *
 * Three things the design adds to the outlined card, all kept to this file:
 *
 *  - **The cut-out stands at the card's edge.** It is fitted into a
 *    box at the card's foot, under the copy, and runs out over the card's
 *    padding to its right, left or bottom edge (the cut-out's `anchor`; the
 *    card clips it at the corners). From `lg` the cut-out is half of the
 *    card instead, alternating sides.
 *  - **A diamond badge** — the live page's diamond, kept: a hairline square
 *    turned 45° with the line icon upright inside it.
 *  - **One accent per belief**, on the check marks and on a glow pooled
 *    behind the cut-out, and nowhere else. The glow's gradient is drawn in
 *    `currentColor` (--gradient-belief-glow-*), so the layer that paints it
 *    takes the accent as its text colour and one token serves all four.
 *
 * The card takes **no hover light** (`hoverEffect={false}`). It is not
 * interactive, and it already carries a light of its own; the two would
 * compete — the same reasoning as the CTA panel's.
 *
 * A Server Component; only `<Reveal>` is client.
 */
export function BeliefSection({
  id,
  title,
  body,
  points,
  icon,
  cutout,
  accent,
  side,
  ground = 'dark',
  action,
  snap = false,
}: BeliefSectionProps) {
  const titleId = `${id}-title`;
  const paper = ground === 'paper';

  return (
    <Section
      id={id}
      aria-labelledby={titleId}
      background={paper ? 'paper-dots' : 'black-dots'}
      // Tight, so a belief fits one screen at the sizes the site is
      // reviewed at: the card is the screen's content, not a band in it.
      spacing="tight"
      data-snap-section
      className={cn(snap && 'flex min-h-viewport snap-start items-center')}
    >
      <Card
        shape="outlined"
        ground={ground}
        inset="none"
        hoverEffect={false}
        className={cn(
          'isolate flex-col',
          // The figures run out to the card's edge and are clipped by its corners.
          'overflow-clip',
          'lg:grid lg:items-stretch lg:gap-x-ledger-col-gap',
          // The copy takes seven parts to the cut-out's five, so a belief's
          // name holds one line and the card fits a screen; the design's even
          // split set every name on two. The cut-out is fitted, not cropped,
          // so the narrower column costs it nothing but size.
          side === 'end'
            ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'
            : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]',
        )}
      >
        {/* The accent's glow, under everything in the card. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 -z-10 rounded-card-outlined',
            'bg-(image:--gradient-belief-glow-top)',
            side === 'end'
              ? 'lg:bg-(image:--gradient-belief-glow-end)'
              : 'lg:bg-(image:--gradient-belief-glow-start)',
            ACCENT_CLASS[accent],
          )}
        />

        <div
          className={cn(
            'flex flex-col lg:row-start-1',
            side === 'end' ? 'lg:col-start-1' : 'lg:col-start-2',
          )}
        >
          <Reveal order={0}>
            {/* The badge. The square is the frame and the icon stands upright
                in it; both are decoration, the heading names the belief. */}
            <span aria-hidden="true" className="relative block size-14 shrink-0 lg:size-16">
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  '[&_svg]:size-6 lg:[&_svg]:size-7',
                  paper ? 'text-ink' : 'text-white',
                )}
              >
                {icon}
              </span>
            </span>
          </Reveal>

          <Reveal order={1} className="mt-inset">
            <DisplayHeading id={titleId} ground={ground} className="w-fit text-balance">
              {title}
            </DisplayHeading>
          </Reveal>

          <Reveal order={2} className="mt-inset">
            <p
              className={cn(
                'max-w-(--measure) text-body text-pretty',
                paper ? 'text-body-base' : 'text-body-on-dark',
              )}
            >
              {body}
            </p>
          </Reveal>

          <Reveal order={3} className="mt-inset">
            <ul className="flex flex-col">
              {points.map((point) => (
                <li
                  key={point}
                  className={cn(
                    'flex items-center gap-inset border-t py-3 last:border-b lg:py-2.5',
                    paper ? 'border-hairline-paper' : 'border-hairline-dark',
                  )}
                >
                  <Check
                    aria-hidden="true"
                    focusable="false"
                    className={cn('size-5 shrink-0', ACCENT_CLASS[accent])}
                  />
                  <span className={cn('text-body', paper ? 'text-ink' : 'text-white')}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal
          order={1}
          className={cn(
            // Below `lg`: a box at the card's foot, under the copy, running
            // out over the padding to the bottom edge.
            'relative mt-flow -mb-flow h-belief-cutout',
            // From `lg`: a column of the card, beside the copy.
            'lg:row-start-1 lg:mt-0 lg:h-auto lg:min-h-belief-media',
            side === 'end' ? 'lg:col-start-2' : 'lg:col-start-1',
            cutout.anchor !== undefined && ANCHOR_BOX_CLASS[cutout.anchor],
          )}
        >
          <MediaFrame
            image={cutout.image}
            alt={cutout.alt}
            sizes={SIZES_BELIEF_CUTOUT}
            pending={cutout.pending}
            // A cut-out has its own transparent ground: no fill behind it.
            className={cn(
              'absolute inset-0 bg-transparent',
              cutout.anchor !== undefined && ANCHOR_FRAME_CLASS[cutout.anchor],
            )}
            style={cutout.anchor === 'right' ? imageAspectVar(cutout.image) : undefined}
            imageClassName={cn(
              'object-contain',
              cutout.anchor !== undefined
                ? ANCHOR_IMAGE_CLASS[cutout.flip === true ? MIRRORED[cutout.anchor] : cutout.anchor]
                : 'lg:object-center',
              cutout.flip === true && '-scale-x-100',
            )}
          />
        </Reveal>
      </Card>

      {action !== undefined && action !== null && (
        <Reveal order={4} className="mt-flow flex justify-center">
          {action}
        </Reveal>
      )}
    </Section>
  );
}
