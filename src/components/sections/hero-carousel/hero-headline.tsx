import { Fragment, type CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import type { HeroSlide } from './types';

/** `style` that also carries custom properties, without an `any` cast. */
type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>;

export interface HeroHeadlineProps {
  slide: HeroSlide;
  isActive: boolean;
}

/** One staggered piece of a headline: a single word, or the whole highlight. */
interface Piece {
  text: string;
  highlighted: boolean;
}

/**
 * Break a headline into the pieces the stagger animates.
 *
 * Every word is its own piece **except** the highlighted run, which stays
 * whole. That is not a detail — the gradient is clipped to the text of the box
 * it is set on, so a run split into four boxes is four separate ramps side by
 * side rather than the one sweep the design draws. Keeping the run in a single
 * box is the only way to get one gradient across it.
 *
 * The cost is that the run enters as a unit rather than word by word, and it
 * is the right trade: the sweep is the thing you can see.
 *
 * If `highlight` is absent or is not an exact run of words in the headline,
 * every word comes back unhighlighted and the headline renders flat. A typo
 * there costs a highlight, not a headline.
 */
function splitHeadline(headline: string, highlight: string | undefined): Piece[] {
  const words = headline.split(' ');
  const target = highlight === undefined ? [] : highlight.split(' ');

  if (target.length === 0) {
    return words.map((text) => ({ text, highlighted: false }));
  }

  for (let start = 0; start + target.length <= words.length; start++) {
    if (!target.every((word, offset) => words[start + offset] === word)) continue;

    return [
      ...words.slice(0, start).map((text) => ({ text, highlighted: false })),
      { text: target.join(' '), highlighted: true },
      ...words.slice(start + target.length).map((text) => ({ text, highlighted: false })),
    ];
  }

  return words.map((text) => ({ text, highlighted: false }));
}

/**
 * One slide's headline, set a piece at a time with a gradient run inside it.
 *
 * Rendered as `h1` while the slide is showing and `p` otherwise — there is one
 * `h1` per page, and four headlines stacked in the same grid cell would
 * otherwise be four. The inactive ones are also `aria-hidden` and `inert`, so
 * they are out of the accessibility tree and out of the tab order entirely.
 *
 * The pieces are presentational, so `aria-label` restores the headline to one
 * string rather than letting it be announced fragment by fragment.
 */
export function HeroHeadline({ slide, isActive }: HeroHeadlineProps) {
  const { headline, highlight, highlightClassName } = slide;
  const pieces = splitHeadline(headline, highlight);

  const Heading = isActive ? 'h1' : 'p';

  return (
    <Heading
      // Remounts when the slide takes over, which is what replays the stagger.
      // Without it the animation would run once at page load, on all four
      // headlines at once, three of them invisible.
      key={isActive ? 'active' : 'idle'}
      aria-label={headline}
      aria-hidden={!isActive}
      inert={!isActive}
      className={cn(
        // Every headline occupies the same cell, so the stack is as tall as
        // its longest member and nothing below it moves as slides change.
        '[grid-area:1/1]',
        'max-w-(--hero-measure) text-hero text-white',
        'text-shadow-(--shadow-hero-text)',
        'transition-opacity duration-(--duration-cross-fade) motion-reduce:transition-none',
        isActive ? 'opacity-100' : 'opacity-0',
      )}
    >
      {pieces.map((piece, index, all) => (
        <Fragment key={`${slide.id}-${String(index)}`}>
          <span
            aria-hidden="true"
            style={{ '--anim-index': index } as StyleWithVars}
            className={cn(
              isActive && 'anim-word-in',
              piece.highlighted
                ? [
                    // A plain inline box, and deliberately not `inline-block`:
                    // this piece is several words and has to be able to break
                    // across lines, which an atomic inline cannot. `anim-word-in`
                    // still runs on it — its `translateY` is simply ignored on
                    // an inline box, so the run fades in where the words around
                    // it rise, which is a difference nobody will catch at this
                    // size.
                    //
                    // `box-decoration-break: clone` so a run that does break is
                    // painted with the full ramp on each line rather than one
                    // gradient stretched across both.
                    //
                    // `whitespace-pre-line` so a `\n` written into the run is
                    // a line break, as the headline's author set it, rather
                    // than collapsing into a space and leaving the wrap to
                    // the measure.
                    'gradient-text',
                    '[box-decoration-break:clone] [-webkit-box-decoration-break:clone]',
                    'whitespace-pre-line',
                    highlightClassName,
                  ]
                : [
                    // Not decorative: `transform` has no effect on a
                    // non-replaced inline box, so staggering a word by
                    // translateY needs that word to be an atomic inline.
                    'inline-block',
                    // globals.css sets `overflow-wrap: break-word` on every
                    // heading. That is right for a heading and wrong for a box
                    // holding exactly one word — it permits a break mid-word.
                    'whitespace-nowrap',
                  ],
            )}
          >
            {piece.text}
          </span>
          {/*
            A real space, not a margin on the span. It restores the wrap
            opportunity between pieces that the inline-blocks would otherwise
            have to supply themselves, and it means selecting the headline
            copies "A leading manufacturer" rather than "Aleadingmanufacturer".
          */}
          {index < all.length - 1 && ' '}
        </Fragment>
      ))}
    </Heading>
  );
}
