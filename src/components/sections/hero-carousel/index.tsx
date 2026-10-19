'use client';

import {
  useRef,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { HeroBackdrop } from './hero-backdrop';
import { HeroCopy } from './hero-copy';
import { HeroDots } from './hero-dots';
import { HeroProgress } from './hero-progress';
import { useHeroCarousel } from './use-hero-carousel';
import { usePointerParallax } from './use-pointer-parallax';
import type { HeroSlide } from './types';

/** Horizontal travel, in px, before a drag counts as a swipe. */
const SWIPE_THRESHOLD = 50;

/**
 * How long after a pointer lands that the focus it causes still counts as
 * "the pointer did this" rather than "the keyboard did this".
 *
 * Focus arrives on pointerdown, well inside this, so the ordering is never in
 * doubt: pointerdown → focus → pointerup.
 */
const POINTER_FOCUS_MS = 400;

export interface HeroCarouselProps {
  slides: HeroSlide[];
  /** Autoplay dwell per slide. Also the duration of the dot fill. */
  intervalMs?: number;
}

/**
 * The homepage hero. docs/features/04 §1, rebuilt to `SAEL Home v2`.
 *
 * The v2 arrangement, and what changed from the one before it:
 *
 *  - **One composition, not four.** The mark, a short red rule and the
 *    headline sit in a single content column — the right-hand half above `lg`,
 *    the full width and bottom-anchored below it. The six per-slide
 *    coordinates that used to place each headline in the frame are gone. See
 *    `<HeroCopy>`.
 *  - **A progress bar across the base**, pinned to the bottom edge of a
 *    section that is exactly one viewport tall — so it is on screen for as
 *    long as the hero is. It fills once across the whole cycle rather than
 *    once per slide. See `<HeroProgress>`.
 *  - **The headline is set at --text-hero**, the site's own display size,
 *    rather than the larger size the design file draws it at. The client's
 *    call on 2026-08-20: the layout is v2's, the type scale is ours.
 *
 * The one client component on this page, and the only section that needs to
 * be: it owns timers, pointer tracking and a slide index. Everything it can
 * hand to CSS, it does — the Ken Burns pan, the word stagger, the letterbox
 * reveal, the dot fill and the marquee-style pauses are all classes from
 * animations.css whose still state is the *default* and whose motion is inside
 * `@media (prefers-reduced-motion: no-preference)`. So the reduced-motion
 * build of this carousel is not a second code path; it is what the CSS does
 * when nothing opts in. /CLAUDE.md §5, docs/design-guidelines.md §5.
 *
 * Autoplay is the one piece of motion CSS cannot own, and `useHeroCarousel`
 * gates it on the same preference.
 */
export function HeroCarousel({ slides, intervalMs = 6000 }: HeroCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const lastPointerAt = useRef(0);

  const { index, goTo, next, previous, isPlaying, pause, resume } = useHeroCarousel({
    count: slides.length,
    intervalMs,
    sectionRef,
  });

  usePointerParallax(sectionRef);

  if (slides.length === 0) return null;

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    // Every pointer type, and before the mouse guard below: this is what tells
    // the focus handler that a pointer, not the keyboard, is driving.
    lastPointerAt.current = Date.now();

    // Mouse drags are not swipes — a click-drag across a hero is how people
    // select text or just move the pointer. Touch and pen only.
    if (event.pointerType === 'mouse') return;
    dragOrigin.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const origin = dragOrigin.current;
    dragOrigin.current = null;
    if (origin === null) return;

    const travelX = event.clientX - origin.x;
    const travelY = event.clientY - origin.y;

    if (Math.abs(travelX) < SWIPE_THRESHOLD) return;
    // Horizontal intent, not just horizontal distance. A diagonal flick down
    // the page covers plenty of x on the way, and changing the slide under
    // someone who is scrolling is the carousel taking a gesture that was not
    // aimed at it. `touch-action: pan-y` stops us stealing the *scroll*; this
    // stops us acting on it.
    if (Math.abs(travelX) <= Math.abs(travelY)) return;

    if (travelX < 0) next();
    else previous();
  };

  /**
   * Pause only for the keyboard.
   *
   * `onFocus` fires for a tap as much as for a Tab, and on a touch screen the
   * matching blur very often never comes — there is nothing to move focus to,
   * so it stays on the dot. Autoplay stopped for good the first time anyone
   * touched a dot, which is the reported "sometimes stops working on mobile".
   *
   * Decided from *when the last pointer landed*, not from `:focus-visible`.
   * The pseudo-class is the browser's own answer to the same question, but it
   * also matches a programmatic `focus()`, so anything that moves focus in
   * script re-introduces the bug — which is exactly how this was caught.
   * Timing is the thing actually being asked about and it cannot be spoofed
   * by a stray `focus()` call.
   */
  const onFocusCapture = (event: ReactFocusEvent<HTMLElement>) => {
    void event;
    if (Date.now() - lastPointerAt.current > POINTER_FOCUS_MS) pause();
  };

  return (
    <Section
      ref={sectionRef}
      fullBleed
      spacing="none"
      background="black"
      data-snap-section
      aria-roledescription="carousel"
      aria-label="SAEL highlights"
      // No pause on hover, by the client's decision on 2026-08-05: the hero
      // keeps cycling whether or not the pointer rests on it.
      //
      // Keyboard focus still pauses, and that is not the same feature. Someone
      // who has tabbed to a segment is *operating* the carousel; advancing the
      // slide under them moves the thing they are aiming at. See
      // `onFocusCapture`, which is where "keyboard" is decided.
      onFocus={onFocusCapture}
      onBlur={resume}
      onPointerDown={onPointerDown}
      // Resume unconditionally on any pointer release, so autoplay cannot end
      // up wedged off. Even if something pauses it that this component did not
      // anticipate, touching the hero puts it back — a stuck carousel is the
      // one failure worth being ungraceful about.
      onPointerUp={(event) => {
        onPointerUp(event);
        resume();
      }}
      // Both reset the drag. Cancel is the browser taking the gesture over —
      // a vertical pan, usually. Leave is the finger going out of the section
      // mid-swipe, after which no `pointerup` will arrive here and a stale
      // origin would otherwise turn the *next* tap into a phantom swipe.
      onPointerCancel={() => (dragOrigin.current = null)}
      onPointerLeave={() => (dragOrigin.current = null)}
      className={cn(
        'relative isolate overflow-hidden',
        /*
         * One screenful below the fixed header, at every size.
         *
         * This replaces the aspect ratios responsive-strategy.md §4 specifies
         * for the hero (2.34/1 above lg, 4/5 below). Those describe a hero in
         * normal document flow; the client has since asked for the homepage to
         * snap section by section, and a snapping section that is not a
         * viewport tall leaves a gap or a partial neighbour at every rest
         * position. The photographs are `object-cover`, so they fill whatever
         * height this resolves to rather than letterboxing.
         *
         * `min-h`, not `h`: if the headline ever wraps past the available
         * space at 360px the section grows instead of clipping it. The content
         * column reserves --spacing-hero-pad-bottom underneath itself, which
         * is more than the progress bar is tall, so the two never meet.
         */
        'min-h-viewport snap-start',
        // Vertical page scroll is never captured by the swipe handler.
        'touch-pan-y',
      )}
    >
      {slides.map((slide, slideIndex) => (
        <HeroBackdrop
          key={slide.id}
          slide={slide}
          isActive={slideIndex === index}
          position={slideIndex + 1}
        />
      ))}

      {/*
        The letterbox reveal — two panels wiping off the hero on first paint.
        First mount only, never on a slide change.

        They are rendered server-side and animated purely by CSS, which is what
        makes them safe: `.anim-letterbox` is `display: none` by default and
        only becomes visible inside the no-preference media query. So a user
        who asked for reduced motion never sees them, and a user whose
        JavaScript never arrives still gets the reveal rather than a hero
        sitting under two black panels forever.
      */}
      <div
        aria-hidden="true"
        className="anim-letterbox pointer-events-none absolute inset-x-0 top-0 z-10 h-1/2 origin-top bg-surface-darker"
      />
      <div
        aria-hidden="true"
        className="anim-letterbox pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 origin-bottom bg-surface-darker"
      />

      <HeroCopy slides={slides} activeIndex={index} />

      <HeroProgress activeIndex={index} isPlaying={isPlaying} intervalMs={intervalMs} />

      <HeroDots
        labels={slides.map((slide) => slide.headline)}
        activeIndex={index}
        onSelect={goTo}
      />
    </Section>
  );
}

export type { HeroSlide } from './types';
