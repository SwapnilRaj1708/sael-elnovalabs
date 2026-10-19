import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { DisplayHeading, type BusinessGradient } from '@/components/ui/display-heading';
import { Eyebrow, type EyebrowTone } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { Section, type SectionProps } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface ValueGridItem {
  /**
   * The card's heading. Rendered as `<h3>` under the section's `<h2>`. Omit
   * for a card that is a numbered or marked paragraph with no heading of its
   * own — Module Manufacturing's "Manufacturing Prowess" cards.
   */
  name?: string;
  /** A numeral above the copy — "01". Meta type, not a heading. */
  ordinal?: string;
  body: string;
  /**
   * The mark at the head of the card. Always decorative — `name` is what
   * carries the meaning — so whatever is passed must be `aria-hidden`.
   * Use `<ValueMark image={null}>` for an asset the client has not supplied.
   */
  mark: ReactNode;
}

/** The ground the section is drawn on. */
export type ValueGridGround = 'dark' | 'paper';

/** The grid's column floor — see `columns`. */
export type ValueGridColumns = 'default' | 'wide' | 'thirds';

export interface ValueGridProps {
  eyebrow?: string;
  title: string;
  /**
   * Sets the heading in a business's mark ramp instead of the ground's — the
   * four business pages. See BUSINESS_GRADIENT_CLASS.
   */
  titleGradient?: BusinessGradient;
  items: readonly ValueGridItem[];
  /**
   * The grid's column floor. `default` is 260px, for short cards;
   * `wide` is 340px, for cards carrying a paragraph. `thirds` is `wide`
   * that holds at three across from `xl`: six cards in two rows of three
   * rather than four-and-two, which is what fits Agri Waste-to-Energy's
   * benefits on one 1920 × 1080 screen now the page snaps (2026-10-11).
   */
  columns?: ValueGridColumns;
  /**
   * `tight` for a section between two taller ones. Defaults to `tight` on a
   * snapping section and `default` otherwise — see `snap`.
   */
  spacing?: 'default' | 'tight';
  /**
   * Draw the accent that fills across each card's hairline on hover.
   * Off by default: a card that is not interactive should not suggest it is,
   * and neither of these two surfaces links anywhere. Ignored for `outlined`,
   * which has no hairline for the accent to run along.
   */
  accent?: boolean;
  /**
   * `hairline` is the v2 card — a top rule, left-aligned. `outlined` is the
   * client's reference of 2026-09-17 for the strategic pillars: a rounded box
   * bordered on all sides with the mark, name and copy centred inside it.
   */
  variant?: 'hairline' | 'outlined';
  /**
   * Centre a short last row instead of leaving it hanging at the left.
   *
   * Off by default, and the grid is then a CSS grid whose last row aligns
   * with the columns above it — right for eight cards in four columns. On
   * for a count no column count divides: the Careers page's five culture
   * cards are five across at the design width, three-and-two on a laptop
   * and two-two-one on a tablet, and a grid would hang the odd ones left.
   * A wrapping flex row centres them, and they grow to fill their row up to
   * `--value-grid-card-max`, so the last row reads as balanced rather than
   * as a grid with a gap in it.
   */
  balance?: boolean;
  /**
   * Draw each `outlined` card as frosted glass — see `<Card frosted>`. For
   * the business pages' paper sections, where the dot grid shows through
   * behind the copy (2026-10-14). Does nothing on the dark ground or for the
   * `hairline` variant.
   */
  frosted?: boolean;
  /**
   * `dark` is the site's default and needs no instruction
   * (docs/design-guidelines.md §8). `paper` is for a page that alternates its
   * grounds deliberately, and picks the ramps and inks to match. The marks
   * are the caller's: on paper, pass each mark its `ground="paper"` too, so it
   * draws the icon set's coloured variant rather than the white one.
   */
  ground?: ValueGridGround;
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm. See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

const COLUMNS_CLASS: Record<ValueGridColumns, string> = {
  default: 'grid-cols-[repeat(auto-fit,minmax(min(100%,var(--value-grid-col-min)),1fr))]',
  wide: 'grid-cols-[repeat(auto-fit,minmax(min(100%,var(--value-grid-col-min-wide)),1fr))]',
  thirds:
    'grid-cols-[repeat(auto-fit,minmax(min(100%,var(--value-grid-col-min-wide)),1fr))] xl:grid-cols-3',
};

/** The same floors, as a flex basis for the balanced row. */
const BASIS_CLASS: Record<ValueGridColumns, string> = {
  default: 'basis-(--value-grid-col-min)',
  wide: 'basis-(--value-grid-col-min-wide)',
  thirds: 'basis-(--value-grid-col-min-wide)',
};

const GROUND: Record<
  ValueGridGround,
  {
    section: SectionProps['background'];
    eyebrow: EyebrowTone;
    name: string;
    body: string;
    ordinal: string;
    /** The ramp the hover accent fills in — the eyebrow's, on either ground. */
    accent: string;
  }
> = {
  dark: {
    section: 'black-dots',
    eyebrow: 'bright',
    name: 'text-white',
    body: 'text-on-dark-soft',
    ordinal: 'text-on-dark-faint',
    accent: 'bg-(image:--gradient-eyebrow-bright)',
  },
  paper: {
    section: 'paper-dots',
    eyebrow: 'deep',
    name: 'text-ink',
    body: 'text-body-soft',
    ordinal: 'text-meta-paper',
    accent: 'bg-(image:--gradient-eyebrow-deep)',
  },
};

/**
 * The mark at the head of a value card.
 *
 * On the dark ground, `brightness-0 invert` crushes any colour to black and
 * then flips it to white — the same treatment the homepage's goal marks take,
 * and the reason it is that pair rather than the design file's `invert(1)
 * hue-rotate(180deg)`: hue rotation exists to preserve colour through an
 * inversion, and there is none here to preserve. On paper the artwork is
 * drawn as supplied, so pass the icon set's coloured no-tile variant there
 * (About Us's guiding principles, on paper since 2026-10-14).
 *
 * Always decorative. The card's heading is the mark's name, so announcing it
 * again would be repetition — `alt=""` and `aria-hidden` together, which is
 * what keeps a screen reader from landing on an empty graphic.
 *
 * Sized by `--value-mark-size` rather than by the width and height attributes,
 * which carry the asset's intrinsic 128px so `next/image` can reserve the box
 * and pick a sensible srcset. `image` accepts `null` for a page whose artwork
 * has not been supplied; it then holds the same box as a plain placeholder,
 * which is the bargain `<MediaFrame>` makes for photographs.
 */
export function ValueMark({
  image,
  pending,
  ground = 'dark',
}: {
  image: StaticImageData | null;
  pending?: string;
  ground?: ValueGridGround;
}) {
  if (image === null) {
    return (
      <span
        aria-hidden="true"
        data-pending={pending}
        className="block size-(--value-mark-size) shrink-0 bg-inert/10"
      />
    );
  }

  return (
    <Image
      src={image}
      alt=""
      aria-hidden
      className={cn(
        'size-(--value-mark-size) shrink-0 object-contain',
        ground === 'dark' && 'brightness-0 invert',
      )}
    />
  );
}

/**
 * A heading over a grid of value cards — a mark, a name, a paragraph.
 *
 * Built to `About Us.dc.html` §05 "Our Strategic Pillars" (three cards, an
 * accent, the 260px floor) and §07 "Our Guiding Principles" (eight cards, no
 * accent, the 340px floor). One component, because the two differ only in
 * things that are properly props, and it is the shape FE-07 → FE-15 inherit
 * for any "here are N things we believe" surface.
 *
 * **The grid arrives as one `<Reveal>`, not one per card.** That is the
 * design's own composition and it is right here: eight cards cascading at
 * `--duration-reveal-step` apart would still be arriving long after the reader
 * got to them. The heading block above still cascades per element, which is
 * the rule that matters — see `design-reconciliation.md` §9.
 *
 * The mark is a `ReactNode` rather than an image, because the two surfaces
 * supply different kinds: §05's are line art drawn in `pillar-marks.tsx` and
 * animated, §07's are artwork files that have not been supplied. Keeping it a
 * node is what lets this component stay ignorant of the difference.
 *
 * `balance` and `ground` were added on 2026-09-22 for the Careers page, both
 * opt-in — see their prop notes. No earlier call site changes.
 *
 * A Server Component. The cards' hover and focus states are CSS.
 */
export function ValueGrid({ spacing, snap = false, ...props }: ValueGridProps) {
  return (
    <Section
      background={GROUND[props.ground ?? 'dark'].section}
      spacing={spacing ?? (snap ? 'tight' : 'default')}
      data-snap-section
      // An outlined card's hover gradient (ui/background-gradient.tsx)
      // reaches past the card, and past the viewport's edge on a phone — a
      // horizontal scroll even while it is invisible. `clip`, not `hidden`,
      // so the bloom above and below is left alone.
      className={cn(
        props.variant === 'outlined' && 'overflow-x-clip',
        snap && 'flex min-h-viewport snap-start items-center',
      )}
    >
      <ValueGridLayout {...props} />
    </Section>
  );
}

/** {@link ValueGrid}'s own props, less the two that belong to its section. */
export type ValueGridLayoutProps = Omit<ValueGridProps, 'spacing' | 'snap'>;

/**
 * The heading and the cards, without the `<Section>` around them.
 *
 * Exported so `<DownloadsProwess>` can set the prowess cards under the
 * product downloads in one section (Module Manufacturing, 2026-10-12). A
 * section around it that draws `outlined` cards needs `overflow-x-clip`, as
 * {@link ValueGrid}'s own does. Everything documented on {@link ValueGrid}
 * applies here.
 */
export function ValueGridLayout({
  eyebrow,
  title,
  titleGradient,
  items,
  columns = 'default',
  accent = false,
  variant = 'hairline',
  balance = false,
  frosted = false,
  ground = 'dark',
}: ValueGridLayoutProps) {
  const outlined = variant === 'outlined';
  const tone = GROUND[ground];
  // Frosted glass is drawn on outlined cards on paper and nowhere else — the
  // same condition `<Card>`'s compounds apply, held here so the grid's reveal
  // below can follow it.
  const glass = frosted && outlined && ground === 'paper';

  return (
    <div className="flex w-full flex-col gap-flow">
      <div className="flex flex-col gap-stack">
        {eyebrow !== undefined && (
          <Reveal order={0}>
            <Eyebrow tone={tone.eyebrow}>{eyebrow}</Eyebrow>
          </Reveal>
        )}

        <Reveal order={eyebrow === undefined ? 0 : 1}>
          <DisplayHeading ground={ground} business={titleGradient}>
            {title}
          </DisplayHeading>
        </Reveal>
      </div>

      <Reveal
        order={2}
        // `<Reveal>` keeps `will-change: opacity, transform` on its box for good,
        // and an ancestor with `will-change: opacity` is a *backdrop root*: the
        // cards' `backdrop-filter` then sees only what is inside the root, not
        // the dot grid behind it, and blurs nothing. Measured on a production
        // build, 2026-10-14: the dots stayed fully visible through a frosted
        // card, and vanished with this hint off. Frosted grids go without it;
        // the fade-in is unchanged, and the blur arrives as it settles.
        className={cn(glass && 'will-change-auto!')}
      >
        <div
          className={cn(
            'gap-x-gap-grid gap-y-flow',
            balance ? 'flex flex-wrap justify-center' : ['grid', COLUMNS_CLASS[columns]],
          )}
        >
          {items.map((item) => (
            <Card
              key={item.name ?? item.ordinal ?? item.body}
              as="article"
              ground={ground}
              shape={variant}
              frosted={glass}
              inset={outlined ? 'none' : 'top'}
              accentClassName={accent && !outlined ? tone.accent : undefined}
              className={cn(
                balance && ['grow', BASIS_CLASS[columns], 'max-w-(--value-grid-card-max)'],
              )}
            >
              <div
                className={cn(
                  'flex w-full flex-col gap-tight',
                  outlined && 'items-center gap-stack text-center',
                )}
              >
                {item.mark}
                {item.ordinal !== undefined && (
                  <p className={cn('text-meta uppercase', tone.ordinal)}>{item.ordinal}</p>
                )}
                {item.name !== undefined && (
                  <h3 className={cn('text-h3', tone.name)}>{item.name}</h3>
                )}
                <p className={cn('text-body-sm text-pretty', tone.body)}>{item.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
