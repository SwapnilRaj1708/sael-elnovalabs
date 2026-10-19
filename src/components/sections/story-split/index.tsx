import type { StaticImageData } from 'next/image';
import { DisplayHeading } from '@/components/ui/display-heading';
import { Eyebrow } from '@/components/ui/eyebrow';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_STORY_MEDIA } from '@/lib/utils/image-sizes';

export interface StorySplitMedia {
  image: StaticImageData | null;
  /** Meaningful description, or `''` if the photograph is decorative. */
  alt: string;
  /** The asset's name in docs/asset-inventory.md, for the pending placeholder. */
  pending?: string;
}

export interface StorySplitProps {
  /**
   * The section's `id`, and the stem of its heading's — so a story can be
   * linked to, and the section is labelled by its own heading.
   */
  id: string;
  /** The small uppercase label above the heading. Omit for a story without one. */
  eyebrow?: string;
  title: string;
  /** The story, as one paragraph. */
  body: string;
  media: StorySplitMedia;
  /**
   * Which side the photograph takes from `lg`. Stories alternate down the
   * page — start, end, start — so the eye zig-zags rather than running down
   * one edge. Below `lg` the photograph always leads, beside the heading.
   */
  side?: 'start' | 'end';
  /**
   * `dark` is the page's default. `paper` sets the eyebrow, heading and
   * story in their paper ramps and ink — the Public Health story, on paper
   * at the client's request of 2026-10-14.
   */
  ground?: 'dark' | 'paper';
  /** Opt into the page's section snapping. See `data-snap-sections`. */
  snap?: boolean;
}

/**
 * One story on Story of Our Influence — a shaped photograph beside an
 * eyebrow, a display heading and a paragraph, as its own screen.
 *
 * Built to `Story of Our Influence.dc.html` (FE-12, Claude Design project
 * `6afc516d-…`, 2026-10-06). The page has no hero: each story is a full
 * screen and the page snaps from one to the next, as the homepage does,
 * through the same `data-snap-sections` mechanism in globals.css.
 *
 * **One DOM, two compositions, on one grid.** Below `lg` the photograph is a
 * 120px thumbnail in the first column beside the eyebrow and heading, and
 * the paragraph runs the full width under both. From `lg` the photograph is
 * a column of its own, `--story-media-h` tall, and the heading and
 * paragraph stack beside it; the grid's `1fr auto auto 1fr` rows centre that
 * stack on the photograph without either knowing the other's height. The
 * reading order — heading, story, then nothing else — is the same in both.
 *
 * The photograph is clipped to the client's `1.svg` shape
 * (`--mask-story-shape`) at that shape's own ratio, so it is never stretched.
 *
 * Below `lg` the masthead overlays the page, so the section clears it with
 * padding rather than the page offsetting it — the homepage's arrangement.
 *
 * A Server Component; only `<Reveal>` is client.
 */
export function StorySplit({
  id,
  eyebrow,
  title,
  body,
  media,
  side = 'start',
  ground = 'dark',
  snap = false,
}: StorySplitProps) {
  const titleId = `${id}-title`;
  const paper = ground === 'paper';
  const headingOrder = eyebrow === undefined ? 1 : 2;

  return (
    <Section
      id={id}
      aria-labelledby={titleId}
      background={paper ? 'paper-dots' : 'black-dots'}
      data-snap-section
      className={cn(
        'flex items-center pt-[calc(var(--spacing-header)+var(--spacing-section-y))] lg:pt-section-y',
        snap && 'min-h-viewport snap-start',
      )}
    >
      <div
        className={cn(
          'grid items-center gap-x-inset gap-y-flow',
          'grid-cols-[var(--spacing-story-thumb)_minmax(0,1fr)]',
          'lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-split-wide lg:gap-y-0',
          side === 'start'
            ? 'lg:grid-cols-[auto_minmax(0,1fr)]'
            : 'lg:grid-cols-[minmax(0,1fr)_auto]',
        )}
      >
        <Reveal
          order={0}
          className={cn(
            'relative aspect-(--aspect-story-shape) w-full',
            'mask-(--mask-story-shape) mask-size-(--mask-fill) mask-no-repeat',
            'lg:row-span-4 lg:row-start-1 lg:h-(--story-media-h) lg:w-auto',
            side === 'start' ? 'lg:col-start-1' : 'lg:col-start-2',
          )}
        >
          <MediaFrame
            image={media.image}
            alt={media.alt}
            sizes={SIZES_STORY_MEDIA}
            pending={media.pending}
            className="absolute inset-0"
          />
        </Reveal>

        <div
          className={cn(
            'flex min-w-0 flex-col gap-stack lg:row-start-2',
            side === 'start' ? 'lg:col-start-2' : 'lg:col-start-1',
          )}
        >
          {eyebrow !== undefined && (
            <Reveal order={1}>
              <Eyebrow tone={paper ? 'deep' : 'bright'}>{eyebrow}</Eyebrow>
            </Reveal>
          )}

          <Reveal order={headingOrder}>
            <DisplayHeading
              id={titleId}
              ground={ground}
              // The display size from `lg`; beside the thumbnail below it, a
              // step down so the heading is not a column of single words.
              className="w-fit text-story-title text-balance lg:text-display"
            >
              {title}
            </DisplayHeading>
          </Reveal>
        </div>

        <Reveal
          order={headingOrder + 1}
          className={cn(
            'col-span-2 lg:col-span-1 lg:row-start-3 lg:mt-flow',
            side === 'start' ? 'lg:col-start-2' : 'lg:col-start-1',
          )}
        >
          <p
            className={cn(
              'max-w-(--measure) text-body-sm text-pretty lg:text-body',
              paper ? 'text-body-base' : 'text-body-on-dark',
            )}
          >
            {body}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
