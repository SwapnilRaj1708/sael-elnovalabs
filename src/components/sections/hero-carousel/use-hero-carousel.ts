'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export interface UseHeroCarouselOptions {
  count: number;
  intervalMs: number;
  /** The element whose visibility gates autoplay. */
  sectionRef: RefObject<HTMLElement | null>;
}

export interface HeroCarouselState {
  index: number;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  /** Whether autoplay is currently advancing. Drives the dot fill. */
  isPlaying: boolean;
  /** Bind to the section: autoplay pauses while keyboard focus is inside. */
  pause: () => void;
  resume: () => void;
}

/**
 * Slide index, autoplay, and the three things that must stop it.
 *
 * Autoplay is the default, but it yields to all of: a reduced-motion
 * preference, keyboard focus being inside the carousel, and the section having
 * scrolled out of view. **Hovering does not pause it** — see the note at the
 * binding in index.tsx. The last one matters more than it
 * looks — a carousel that keeps cycling three screens above the fold burns
 * battery to animate something nobody is looking at, and on a phone that is
 * the whole page's idle cost. docs/features/04 §1.
 *
 * The timer is a `setTimeout` re-armed on every index change rather than a
 * long-lived `setInterval`. That way a manual jump to a slide restarts the
 * full interval instead of inheriting whatever was left of the previous one,
 * and the dot's fill animation — which runs for exactly `intervalMs` — stays
 * in step with the slide it belongs to.
 */
export function useHeroCarousel({
  count,
  intervalMs,
  sectionRef,
}: UseHeroCarouselOptions): HeroCarouselState {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(true);
  const reducedMotion = useReducedMotion();

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => {
    if (count === 0) return;
    setIndex((current) => (current + 1) % count);
  }, [count]);

  const previous = useCallback(() => {
    if (count === 0) return;
    setIndex((current) => (current - 1 + count) % count);
  }, [count]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Visibility. `IntersectionObserver` rather than a scroll listener: the
  // browser does the work off the main thread and only calls back on a
  // threshold crossing.
  useEffect(() => {
    const element = sectionRef.current;
    if (element === null) return;

    // Older Safari and any non-browser render target. Assume visible, which
    // degrades to the prototype's unconditional autoplay rather than to a
    // carousel that never advances.
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOnScreen(entry?.isIntersecting ?? true);
      },
      // Any sliver on screen counts. A stricter threshold would stop a hero
      // that is still three-quarters visible.
      { threshold: 0 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [sectionRef]);

  const isPlaying = !reducedMotion && !isPaused && isOnScreen && count > 1;

  // `index` is a real dependency, not a trick to force a re-run: the timer is
  // armed *from* the current slide, so advancing — by autoplay or by a tap on
  // a dot — tears this one down and arms a fresh full interval for the slide
  // that replaced it.
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setTimeout(() => {
      setIndex((index + 1) % count);
    }, intervalMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPlaying, intervalMs, index, count]);

  return { index, goTo, next, previous, isPlaying, pause, resume };
}
