import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { SIZES_HERO_SYMBOL } from '@/lib/utils/image-sizes';
import { cn } from '@/lib/utils/cn';
import { HeroHeadline } from './hero-headline';
import type { HeroSlide } from './types';

export interface HeroCopyProps {
  /** The slides to render. */
  slides: HeroSlide[];
  /** The index of the active slide. */
  activeIndex: number;
}

/**
 * The hero's content column: the slide's mark, a short red rule, the headline.
 *
 * **One column for all four slides, not one per slide.** The earlier design
 * placed each headline and mark at its own coordinates in the frame, so a
 * slide was a whole composition and the four cross-faded as units.
 * `SAEL Home v2` has a single composition — the column sits in the right-hand
 * half above `lg` and spans the width below it — so what changes between
 * slides is only the mark and the words. Both are stacked in a single grid
 * cell and cross-faded in place, which is also what keeps the red rule
 * between them still while they change.
 *
 * Stacking in one cell rather than swapping the mounted child is deliberate:
 * the stack is as tall as its tallest member at all times, so a longer
 * headline arriving does not move the rule, the mark, or the section's height.
 *
 * Below `lg` the column is bottom-anchored rather than centred — that is the
 * design's own mobile arrangement, and it is what leaves the photograph's
 * subject visible above the copy. docs/responsive-strategy.md §4.
 */
export function HeroCopy({ slides, activeIndex }: HeroCopyProps) {
  return (
    <Container
      className={cn(
        'relative z-2 grid min-h-viewport items-end gap-gap-grid',
        'pt-hero-pad-top pb-hero-pad-bottom',
        'lg:grid-cols-12 lg:items-center',
      )}
    >
      <div className="flex min-w-0 flex-col justify-end lg:col-span-6 lg:col-start-7 lg:justify-center">
        {/* The marks. Decorative at every size — the headline carries the
            meaning — so the whole stack is hidden from assistive technology
            rather than each image carrying an empty alt.

            **Each mark is drawn at its own proportions, in no box.** A plain
            <Image> at a height with `w-auto`, not a <MediaFrame>: the frame
            primitive exists for a photograph filling a box its parent sized,
            and the four marks are not that. They are cropped to their own
            artwork and run 0.65 to 0.92 wide-to-tall, so a square frame gave
            each of them a different amount of slack, and `object-contain`
            split that slack evenly — which is what left them centred, and
            each one centred at a *different* offset, so the mark also shifted
            sideways as the carousel cross-faded. Left-aligning inside the box
            would have fixed the symptom; giving them no box to be aligned in
            means there is no slack to distribute. The client asked for them
            flush left on 2026-08-27.

            The same call, for the same reason, as the business ledger's marks
            — see the note in sections/business-tiles. A static import already
            carries the artwork's intrinsic width and height, so a height and
            `w-auto` is all it takes.

            The height is shared, which is what matters for the stack: all four
            are `h-hero-mark` over a two-line caption, so the cross-fade never changes the column's
            height. `justify-items-start` puts every left edge on the same
            line, and they are stacked in one grid area. */}
        <div aria-hidden="true" className="mb-stack grid justify-items-start">
          {slides.map((slide, index) => {
            const stacked = cn(
              '[grid-area:1/1]',
              'transition-opacity duration-(--duration-cross-fade) motion-reduce:transition-none',
              index === activeIndex ? 'opacity-100' : 'opacity-0',
            );

            const caption = (
              <span className="mt-hero-mark-gap block text-hero-mark-label text-white uppercase">
                {slide.symbol.label.map((line) => (
                  <span key={line} className="block whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </span>
            );

            return (
              <div key={slide.id} className={cn('flex flex-col items-center text-center', stacked)}>
                {slide.symbol.image === null ? (
                  // No artwork, so no intrinsic shape to draw at. The
                  // placeholder falls back to a square — the frame's own
                  // behaviour. docs/asset-inventory.md §9.
                  <span
                    data-pending={slide.symbol.pending}
                    className="aspect-square h-hero-mark bg-inert/10"
                  />
                ) : (
                  <Image
                    src={slide.symbol.image}
                    alt=""
                    sizes={SIZES_HERO_SYMBOL}
                    className="h-hero-mark w-auto"
                  />
                )}
                {caption}
              </div>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="mb-stack h-hero-rule-h w-hero-rule-w shrink-0 bg-brand-red"
        />

        <div className="grid">
          {slides.map((slide, index) => (
            <HeroHeadline key={slide.id} slide={slide} isActive={index === activeIndex} />
          ))}
        </div>
      </div>
    </Container>
  );
}
