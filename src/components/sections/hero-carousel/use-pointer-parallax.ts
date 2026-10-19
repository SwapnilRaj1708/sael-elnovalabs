'use client';

import { useEffect, type RefObject } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Publish the pointer's position within an element as two custom properties,
 * `--parallax-x` and `--parallax-y`, each running −1 → 1 from edge to edge.
 *
 * The layers themselves decide what to do with that: the image drifts with the
 * pointer, the symbol drifts further, the headline drifts against it. Keeping
 * the *magnitudes* in CSS and only the *position* in JavaScript is what lets
 * the whole effect switch off below `lg` with a media query, and it means this
 * hook never touches a node React owns. docs/features/04 §8 requires exactly
 * that discipline of the timeline; it applies here for the same reason.
 *
 * Gated on `(hover: hover) and (pointer: fine)` rather than a width
 * breakpoint. A touch screen has no hover state to track, and a laptop with a
 * touchscreen is still a mouse machine. docs/responsive-strategy.md §5.
 *
 * Writes are throttled to one per animation frame — `pointermove` fires far
 * more often than the display refreshes, and every write invalidates style.
 */
export function usePointerParallax(ref: RefObject<HTMLElement | null>): void {
  const reducedMotion = useReducedMotion();
  const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const enabled = !reducedMotion && hasFinePointer;

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    if (!enabled) {
      // The preference can change mid-session. Drop back to centred rather
      // than leaving the layers wherever the pointer last was.
      element.style.removeProperty('--parallax-x');
      element.style.removeProperty('--parallax-y');
      return;
    }

    let frame: number | null = null;
    let pending: { x: number; y: number } | null = null;

    const write = () => {
      frame = null;
      if (pending === null) return;
      element.style.setProperty('--parallax-x', String(pending.x));
      element.style.setProperty('--parallax-y', String(pending.y));
      pending = null;
    };

    const schedule = (x: number, y: number) => {
      pending = { x, y };
      frame ??= requestAnimationFrame(write);
    };

    const onMove = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;
      schedule(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      );
    };

    const onLeave = () => {
      schedule(0, 0);
    };

    element.addEventListener('pointermove', onMove, { passive: true });
    element.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      if (frame !== null) cancelAnimationFrame(frame);
      element.style.removeProperty('--parallax-x');
      element.style.removeProperty('--parallax-y');
    };
  }, [ref, enabled]);
}
