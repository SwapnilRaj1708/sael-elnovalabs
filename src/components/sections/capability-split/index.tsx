import type { StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { DisplayHeading, type BusinessGradient } from '@/components/ui/display-heading';
import { Eyebrow, type EyebrowTone } from '@/components/ui/eyebrow';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section, type SectionProps } from '@/components/ui/section';
import { imageAspectVar } from '@/lib/utils/image-aspect';
import { cn } from '@/lib/utils/cn';
import { SIZES_BUSINESS_OVERVIEW_MEDIA } from '@/lib/utils/image-sizes';

export interface CapabilityItem {
  /**
   * The entry's heading. Rendered as `<h3>` under the section's `<h2>`. Omit
   * for an entry that is a mark and a paragraph only — Solar Cell
   * Manufacturing's "Highlights".
   */
  name?: string;
  body: string;
  /**
   * The mark under the heading. Decorative — `name` carries the meaning — so
   * whatever is passed must be `aria-hidden`. Omit for an entry without one.
   */
  mark?: ReactNode;
}

/** The ground the section is drawn on. */
export type CapabilitySplitGround = 'dark' | 'paper';

export interface CapabilitySplitMedia {
  image: StaticImageData | null;
  alt: string;
  /** The asset's name in docs/asset-inventory.md, for the pending placeholder. */
  pending?: string;
}

export interface CapabilitySplitProps {
  /** The small uppercase label — "How Do We Work?". */
  eyebrow: string;
  title: string;
  /**
   * Sets the heading in a business's mark ramp instead of the ground's — the
   * four business pages. See BUSINESS_GRADIENT_CLASS.
   */
  titleGradient?: BusinessGradient;
  items: readonly CapabilityItem[];
  /** The portrait photograph beside the list. */
  media: CapabilitySplitMedia;
  /**
   * `dark` is the site's default. `paper` is for a page that alternates its
   * grounds — Solar Cell Manufacturing's "Highlights" (2026-10-14) — and
   * picks the ramps, inks and rules to match. The marks are the caller's:
   * pass each its own `ground="paper"` too.
   */
  ground?: CapabilitySplitGround;
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm. See `data-snap-sections` in globals.css.
   *
   * Four entries or more then stand two-up from `xl`, rather than in one
   * column (2026-10-11). Four stacked rows were taller than a 1920 × 1080
   * screen on Agri Waste-to-Energy, and two rows of two keep the mark, name
   * and copy order and the one rule per card that the client asked for on
   * 2026-09-21. Three stay in one column: two-and-one would hang.
   *
   * The photograph is no taller than the list beside it at any width from
   * `lg`, snapping or not — see the note at the photograph.
   */
  snap?: boolean;
}

/**
 * A heading over a hairline-separated list of capabilities beside one
 * masked photograph — the Solar Energy page's "How Do We Work?" section.
 *
 * **A new section rather than a `<ValueGrid>` or a `<ProseSplit>`.** The
 * entries are value cards in content — a name, a mark, a paragraph — but not
 * in composition: they stack in one column, separated by rules that run the
 * column's width, with a photograph beside the whole stack. `<ValueGrid>` lays
 * its cards out in a grid and has no media slot; `<ProseSplit>` has the media
 * slot but takes paragraphs, not headed entries. Each row *is* the v2 `<Card>`
 * in its hairline idiom — one rule above each, and nothing under the last.
 * It was `inset="block"` with a closing rule until 2026-09-21, which put four
 * lines around three cards; the client asked for the one-rule-per-card the
 * value grid and the team grid already draw, so the stack is spaced by
 * `gap-flow` like theirs instead of by the rows' own bottom inset.
 *
 * The list is a `<div>` of `<article>`s rather than a `<ul>`: each entry has
 * its own heading, and a screen reader walking headings gets the same
 * structure a list would give it, without the row count read twice.
 *
 * Same `auto-fit` grid as `<ProseSplit>`, and for the same reason — the row
 * reflows on the space it has, and `min(100%, …)` keeps the 380px floor from
 * overflowing a 360px viewport. The list is first in the DOM, so stacked it
 * reads before the photograph.
 *
 * A Server Component. The rows are not links; their hover accent is CSS,
 * from <Card>.
 */
/**
 * Everything that follows from the ground, decided once — the same pairs
 * `<ValueGrid>` draws its cards in.
 */
const GROUND: Record<
  CapabilitySplitGround,
  {
    section: SectionProps['background'];
    eyebrow: EyebrowTone;
    name: string;
    body: string;
    accent: string;
  }
> = {
  dark: {
    section: 'black-dots',
    eyebrow: 'bright',
    name: 'text-white',
    body: 'text-on-dark-soft',
    accent: 'bg-(image:--gradient-eyebrow-bright)',
  },
  paper: {
    section: 'paper-dots',
    eyebrow: 'deep',
    name: 'text-ink',
    body: 'text-body-soft',
    accent: 'bg-(image:--gradient-eyebrow-deep)',
  },
};

export function CapabilitySplit({
  eyebrow,
  title,
  titleGradient,
  items,
  media,
  ground = 'dark',
  snap = false,
}: CapabilitySplitProps) {
  const twoUp = snap && items.length >= 4;
  const tone = GROUND[ground];

  return (
    <Section
      background={tone.section}
      spacing={snap ? 'tight' : 'default'}
      data-snap-section
      className={cn(snap && 'flex min-h-viewport snap-start items-center')}
    >
      <div className="flex w-full flex-col gap-flow">
        <div className="flex flex-col gap-stack">
          <Reveal order={0}>
            <Eyebrow tone={tone.eyebrow}>{eyebrow}</Eyebrow>
          </Reveal>

          <Reveal order={1}>
            <DisplayHeading ground={ground} business={titleGradient}>
              {title}
            </DisplayHeading>
          </Reveal>
        </div>

        <div
          className={cn(
            'grid w-full items-center gap-x-ledger-col-gap gap-y-flow',
            'grid-cols-[repeat(auto-fit,minmax(min(100%,var(--prose-split-col-min)),1fr))]',
          )}
        >
          <Reveal
            order={2}
            className={cn(
              'flex flex-col gap-flow',
              twoUp && 'xl:grid xl:grid-cols-2 xl:gap-x-gap-grid',
            )}
          >
            {items.map((item) => (
              <Card
                key={item.name ?? item.body}
                as="article"
                ground={ground}
                inset="top"
                // The accent that fills across the hairline on hover — the same
                // one the guiding principles and the team cards carry, on the
                // client's ask of 2026-09-21.
                accentClassName={tone.accent}
              >
                <div className="flex w-full flex-col gap-tight">
                  {/* Mark, then name, then copy — the order the value grid draws
                      ("Best Practices" on the same page); the client asked for
                      the two sections to match, 2026-09-21. */}
                  <div className="flex flex-col items-center gap-tight text-center">
                    {item.mark}
                    {item.name !== undefined && (
                      <h3 className={cn('text-h3', tone.name)}>{item.name}</h3>
                    )}
                  </div>
                  <p className={cn('text-body-sm text-pretty', tone.body)}>{item.body}</p>
                </div>
              </Card>
            ))}
          </Reveal>

          {/* The photograph, pre-cut, under the overview's width cap and
              no taller than the cards beside it (both 2026-10-19). From `lg`
              the box drops its ratio and stretches to the row; its content is
              absolutely placed, so it adds no height of its own and the list
              alone sets the row. The photograph is fitted inside at its own
              ratio. Below `lg` the two stack and the box keeps that ratio.
              `--aspect-solar-execution` holds the box open while the asset is
              pending. */}
          <Reveal
            order={3}
            style={imageAspectVar(media.image)}
            className={cn(
              'relative mx-auto w-full max-w-(--business-overview-media-w) justify-self-center',
              'aspect-(--aspect-solar-execution)',
              media.image !== null && 'aspect-(--media-aspect) lg:aspect-auto lg:self-stretch',
            )}
          >
            <MediaFrame
              image={media.image}
              alt={media.alt}
              sizes={SIZES_BUSINESS_OVERVIEW_MEDIA}
              pending={media.pending}
              // Pre-cut: the transparent corners show the ground, not the
              // frame's placeholder fill.
              className="absolute inset-0 bg-transparent"
              imageClassName="object-contain"
            />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
