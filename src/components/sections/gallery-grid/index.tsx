import type { StaticImageData } from 'next/image';
import { DisplayHeading } from '@/components/ui/display-heading';
import { Eyebrow, type EyebrowTone } from '@/components/ui/eyebrow';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section, type SectionProps } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_GALLERY } from '@/lib/utils/image-sizes';

export interface GalleryImage {
  /** `null` until the asset is supplied — the frame then holds the box. */
  image: StaticImageData | null;
  /** What is in the photograph. Never `''`: a gallery's pictures are its content. */
  alt: string;
  /** The asset's name in docs/asset-inventory.md, for the pending placeholder. */
  pending?: string;
}

/** The ground the section is drawn on. */
export type GalleryGridGround = 'dark' | 'paper';

export interface GalleryGridProps {
  eyebrow?: string;
  title: string;
  /** One entry per paragraph, in order. */
  body: string[];
  images: readonly GalleryImage[];
  ground?: GalleryGridGround;
  /**
   * `closing` for the last section on a page, where the footer's pixel strip
   * meets it and the standard rhythm reads as too little room beneath the
   * photographs. See `<Section spacing>`. Without it, a snapping section
   * takes the tight rhythm.
   */
  spacing?: 'default' | 'closing';
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm unless `spacing` says otherwise. See
   * `data-snap-sections` in globals.css.
   *
   * From `lg` the photographs then stand in one row rather than two-by-two
   * (2026-10-11): two rows of half-width photographs made the section
   * 1,400px tall at 1920, and no screen holds that. One row never strands a photograph,
   * whatever the count, which was the reason for two-by-two.
   */
  snap?: boolean;
}

const GROUND: Record<
  GalleryGridGround,
  { section: SectionProps['background']; eyebrow: EyebrowTone; body: string }
> = {
  dark: { section: 'black-dots', eyebrow: 'bright', body: 'text-body-on-dark' },
  paper: { section: 'paper-dots', eyebrow: 'deep', body: 'text-body-base' },
};

/**
 * A heading and copy over a grid of photographs — the Careers page's "Life
 * at SAEL".
 *
 * **Two columns from `sm`, not an auto-fit floor.** The other grids on this
 * site reflow on a column floor so a card count that changes needs no new
 * rule. A gallery is different: it is four 3:2 photographs, and a floor that
 * gave two columns at 768 gives three or four at 1920 and strands one on its
 * own row. Two-by-two at every width from 480 up is the composition; below
 * that the photographs stack, and each is the full content width.
 *
 * Every photograph is its own `<Reveal>`, unlike the value grid's one reveal
 * for all its cards: four pictures arriving a step apart is a cadence, eight
 * cards arriving a step apart is a wait. The heading block cascades above
 * them as everywhere else.
 *
 * The photographs are not interactive and carry no hover state — a picture
 * that moves under the pointer suggests it can be opened, and these cannot.
 *
 * Content-agnostic: the copy and the pictures are props. A Server Component.
 */
export function GalleryGrid({
  eyebrow,
  title,
  body,
  images,
  ground = 'dark',
  spacing,
  snap = false,
}: GalleryGridProps) {
  const tone = GROUND[ground];
  const headingOrder = eyebrow === undefined ? 0 : 1;
  const gridOrder = body.length + headingOrder + 1;

  return (
    <Section
      background={tone.section}
      spacing={spacing ?? (snap ? 'tight' : 'default')}
      data-snap-section
      className={cn(snap && 'flex min-h-viewport snap-start items-center')}
    >
      <div className="flex w-full flex-col gap-flow">
        <div className="flex flex-col gap-stack">
          {eyebrow !== undefined && (
            <Reveal order={0}>
              <Eyebrow tone={tone.eyebrow}>{eyebrow}</Eyebrow>
            </Reveal>
          )}

          <Reveal order={headingOrder}>
            <DisplayHeading ground={ground}>{title}</DisplayHeading>
          </Reveal>
        </div>

        <div className="flex max-w-(--measure) flex-col gap-stack">
          {body.map((paragraph, index) => (
            <Reveal key={paragraph} order={index + headingOrder + 1}>
              <p className={cn('text-body text-pretty', tone.body)}>{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <div
          className={cn(
            'grid grid-cols-1 gap-gap-grid sm:grid-cols-2',
            snap && 'lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none',
          )}
        >
          {images.map((picture, index) => (
            <Reveal
              key={picture.pending ?? picture.image?.src ?? index}
              order={gridOrder + index}
              className="relative aspect-(--aspect-gallery) w-full overflow-hidden rounded-card"
            >
              <MediaFrame
                image={picture.image}
                alt={picture.alt}
                sizes={SIZES_GALLERY}
                pending={picture.pending}
                className="absolute inset-0"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
