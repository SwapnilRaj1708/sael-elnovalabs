'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * How far the page has scrolled through an element, from 0 to 1.
 *
 * `0` while the element's top edge is still below the viewport top, `1` once
 * its bottom edge has passed it. Built for the vision timeline's pinned
 * 220vh track, where the path draw is a function of scroll position rather
 * than time. docs/responsive-strategy.md §4.
 *
 * Scroll fires far more often than the display refreshes, so the listener does
 * nothing but request a frame; the measurement happens once per frame at most.
 * The listener is `passive`, so it can never delay the scroll itself.
 *
 * @param ref the element to measure against
 * @param enabled pass `false` to stop measuring — with reduced motion, the
 *   consumer wants the completed state, not a progressive one, and there is no
 *   reason to run a scroll listener to reach a constant.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, enabled = true): number {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (element === null) return;

    const measure = () => {
      frame.current = null;

      const rect = element.getBoundingClientRect();
      // The distance the element travels past the viewport top. Guarded
      // because a zero-height element would divide by zero.
      const travel = rect.height;
      if (travel <= 0) {
        setProgress(0);
        return;
      }

      const scrolled = -rect.top;
      const next = Math.min(Math.max(scrolled / travel, 0), 1);

      // Only re-render on a change the eye could resolve. Sub-pixel churn on
      // a long track is otherwise a re-render every frame for nothing.
      setProgress((current) => (Math.abs(current - next) < 0.001 ? current : next));
    };

    const onScroll = () => {
      frame.current ??= window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [ref, enabled]);

  return enabled ? progress : 1;
}
