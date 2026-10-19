import { MediaFrame } from '@/components/ui/media-frame';
import { SIZES_FULL_BLEED } from '@/lib/utils/image-sizes';
import { cn } from '@/lib/utils/cn';
import type { HeroSlide } from './types';

export interface HeroBackdropProps {
  slide: HeroSlide;
  isActive: boolean;
  /** 1-based. Only the first slide is preloaded. */
  position: number;
}

/**
 * One slide's photograph and the scrims over it.
 *
 * Purely decorative: the copy that changes with the slide is not in here. In
 * the earlier design each slide carried its own headline and mark, positioned
 * per slide, so a slide was one self-contained composition. `SAEL Home v2` has
 * a single composition — the content column sits in the right-hand half at
 * every width — so the copy is one stack that cross-fades in place (see
 * `<HeroCopy>`) and what is left here is the backdrop.
 *
 * All four backdrops stay mounted and cross-fade on `opacity`, which is what
 * makes the transition free to composite. The inactive ones are `aria-hidden`
 * so a screen reader is read one photograph's description rather than four.
 * The `alt` text is still outstanding — docs/asset-inventory.md §9 — and these
 * are photographs of real sites, not decoration, so it stays a TODO rather
 * than being closed off with `alt=""`.
 *
 * Three scrims, and each earns its place:
 *
 *  - the **side** scrim darkens the right-hand half, under the copy, above lg;
 *  - the **stacked** scrim replaces it below lg, where the copy is
 *    bottom-anchored and the gradient has to run bottom-up instead;
 *  - the **foot** scrim is on at every size and is only there so the progress
 *    bar along the section's base never lands on a bright patch of sky.
 */
export function HeroBackdrop({ slide, isActive, position }: HeroBackdropProps) {
  const { image } = slide;

  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        'pointer-events-none absolute inset-0',
        'transition-opacity duration-(--duration-cross-fade) ease-[ease]',
        // An instant swap is the honest reading of "reduce motion" for a
        // change the user did not ask for. Matches card.tsx.
        'motion-reduce:transition-none',
        isActive ? 'opacity-100' : 'opacity-0',
      )}
    >
      {/*
        The photograph, oversized so parallax translation never drags an edge
        into frame. The Ken Burns pan lives on the <img> inside; this wrapper
        owns only the parallax, so the two transforms cannot fight.

        They do have to agree on one thing: `--hero-origin`, which both anchor
        to. The wrapper's `scale(1.06)` is the larger half of the desktop zoom,
        so moving the origin on the <img> alone would leave the subject's head
        being pushed out of frame by this element instead. See the note on the
        token.
      */}
      <div
        className={cn(
          'absolute inset-0 overflow-hidden',
          'lg:transition-transform lg:duration-(--duration-parallax) lg:ease-out',
          'lg:origin-(--hero-origin)',
          'lg:transform-[scale(var(--hero-image-scale))]',
        )}
      >
        {/*
          Art direction, not a re-crop: a 2.34:1 landscape squeezed into a 4:5
          portrait frame loses its subject. Two elements, one per breakpoint,
          so each ships only the crop it needs. docs/asset-inventory.md §4.

          Known cost, and it is deliberate: slide 1 marks *both* crops
          `priority`, so one of the two is preloaded and never painted. The
          alternative — `priority` on one and lazy loading on the other —
          protects LCP at one breakpoint and wrecks it at the other, and
          `next/image` cannot express a media-conditioned `<picture>` source.
          docs/responsive-strategy.md §6.
        */}
        <MediaFrame
          image={image.mobile ?? image.desktop}
          alt={image.alt}
          sizes={SIZES_FULL_BLEED}
          priority={position === 1}
          pending={`hero/${slide.id}-portrait`}
          className="absolute inset-0 lg:hidden"
          imageClassName={cn(isActive && 'anim-ken-burns')}
        />
        <MediaFrame
          image={image.desktop}
          alt={image.alt}
          sizes={SIZES_FULL_BLEED}
          priority={position === 1}
          pending={`hero/${slide.id}`}
          className="absolute inset-0 hidden lg:block"
          // `objectClassName` shifts the crop on a slide whose subject would
          // otherwise sit under the headline. No slide sets it at present; see
          // the note on the type for why it stays.
          imageClassName={cn(isActive && 'anim-ken-burns', image.objectClassName)}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-(image:--gradient-hero-scrim-stacked) lg:bg-(image:--gradient-hero-scrim-side)"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-(image:--gradient-hero-foot)" />
    </div>
  );
}
