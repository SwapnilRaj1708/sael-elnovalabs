'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { RailContextProvider, type RailState } from './rail-context';

/** Sub-pixel slack. `scrollLeft` is fractional on a zoomed or scaled display. */
const EPSILON = 1;

export interface RailProps {
  /** The heading block, the track, and the arrows — in the design's order. */
  children: ReactNode;
  /**
   * Advance one card on its own every this many milliseconds, wrapping back to
   * the first after the last. Omit for a rail that moves only when asked to.
   * See `useAutoAdvance` below for what holds it still.
   */
  autoAdvanceMs?: number;
}

/**
 * A horizontally scrolling row of cards: the state, and nothing that is drawn.
 *
 * Renders no markup of its own. It exists to own the scroll position and hand
 * it to `<RailTrack>` and `<RailArrows>`, which the section places wherever
 * its design puts them.
 *
 * **The rail is a real scroll container, not a transformed strip.** That
 * single decision is what makes the rest of this small:
 *
 *  - It works before this bundle arrives, and on a page where it never does.
 *    The markup is a list, `overflow-x: auto` makes it swipeable, and CSS
 *    snapping makes it land cleanly. The arrows are an *addition* to a
 *    carousel that already works, not the mechanism of one.
 *  - Touch, trackpad, shift+wheel and a dragged scrollbar are the platform's
 *    problem rather than ours, along with momentum, rubber-banding and the
 *    right-to-left case.
 *  - There is no index in state, so there is no way for the state and the
 *    rendered position to disagree — the failure that makes a hand-rolled
 *    carousel jump when the viewport resizes mid-transition.
 *
 * What is left for script is the two arrows and whether each is spent, and
 * that is read back from the scroll position rather than counted — and, when
 * `autoAdvanceMs` is set, a timer that presses "next" for the reader.
 */
export function Rail({ children, autoAdvanceMs }: RailProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  // Both spent until measured, which renders both arrows hidden. That is the
  // honest initial state: it is what the server sent, and it is *correct* for
  // a viewport wide enough to show every card.
  const [spent, setSpent] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const element = trackRef.current;
    if (element === null) return;

    const furthest = element.scrollWidth - element.clientWidth;
    setSpent({
      start: element.scrollLeft <= EPSILON,
      end: element.scrollLeft >= furthest - EPSILON,
    });
  }, []);

  useEffect(() => {
    const element = trackRef.current;
    if (element === null) return;

    measure();

    // Resize, not only scroll: the number of cards on screen changes at `md`
    // and `lg`, and crossing a breakpoint can leave the rail scrolled past a
    // maximum that no longer exists. Observing the element rather than the
    // window also catches the page gutter changing under it.
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [measure]);

  /**
   * Move by exactly one card.
   *
   * The distance is measured from the two rendered cards rather than computed
   * from the token, so it stays right through a breakpoint change without this
   * component knowing what the breakpoints are — and a rail holding a single
   * card falls back to its own width rather than to zero.
   */
  const page = useCallback(
    (direction: 1 | -1) => {
      const element = trackRef.current;
      if (element === null) return;

      const [first, second] = element.children;
      const pitch =
        first !== undefined && second !== undefined
          ? second.getBoundingClientRect().left - first.getBoundingClientRect().left
          : element.clientWidth;

      element.scrollBy({
        left: direction * pitch,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    },
    [reducedMotion],
  );

  useAutoAdvance(trackRef, autoAdvanceMs, page);

  const value = useMemo<RailState>(
    () => ({ trackRef, atStart: spent.start, atEnd: spent.end, page, measure }),
    [spent.start, spent.end, page, measure],
  );

  return <RailContextProvider value={value}>{children}</RailContextProvider>;
}

/**
 * Page the rail forward one card every `intervalMs`, and back to the first
 * card after the last.
 *
 * It holds still for anything that suggests a reader is looking at, or using,
 * the rail — a pointer over it, keyboard focus in it, a finger on it — and
 * while it is off screen, where moving it would only cost battery. It does not
 * run at all under a reduced-motion preference: a strip that slides on its own
 * is exactly the motion that preference asks to be spared.
 *
 * **Every scroll re-arms the timer**, whoever caused it. A swipe, an arrow or
 * the timer's own step each buys a full interval before the next one, so the
 * rail never jumps a card the reader has just brought into view.
 *
 * The timer lives in a ref and is driven by DOM events, not React state: the
 * rail re-renders only for its arrows, as before.
 */
function useAutoAdvance(
  trackRef: RefObject<HTMLUListElement | null>,
  intervalMs: number | undefined,
  page: (direction: 1 | -1) => void,
) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = trackRef.current;
    if (element === null || intervalMs === undefined || reducedMotion) return;

    let timer: number | undefined;
    let held = { pointer: false, focus: false, touch: false };
    // Assume visible until told otherwise, like the hero: without an
    // IntersectionObserver this degrades to a rail that always advances.
    let onScreen = true;

    const step = () => {
      const furthest = element.scrollWidth - element.clientWidth;
      if (furthest <= EPSILON) return;
      if (element.scrollLeft >= furthest - EPSILON) {
        element.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        page(1);
      }
    };

    const arm = () => {
      window.clearTimeout(timer);
      timer = undefined;
      if (!onScreen || held.pointer || held.focus || held.touch) return;
      timer = window.setTimeout(step, intervalMs);
    };

    const hold = (key: keyof typeof held, value: boolean) => () => {
      held = { ...held, [key]: value };
      arm();
    };

    // A mouse only: a touch fires pointerenter too, but the touch handlers
    // below already hold it, and release it when the finger lifts rather than
    // whenever the browser decides the pointer has "left".
    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') hold('pointer', true)();
    };
    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') hold('pointer', false)();
    };
    const onFocusIn = hold('focus', true);
    const onFocusOut = (event: FocusEvent) => {
      // Focus moving between cards inside the rail is still focus in it.
      if (!element.contains(event.relatedTarget as Node | null)) hold('focus', false)();
    };
    const onTouchStart = hold('touch', true);
    const onTouchEnd = hold('touch', false);

    element.addEventListener('pointerenter', onPointerEnter);
    element.addEventListener('pointerleave', onPointerLeave);
    element.addEventListener('focusin', onFocusIn);
    element.addEventListener('focusout', onFocusOut);
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchend', onTouchEnd);
    element.addEventListener('touchcancel', onTouchEnd);
    element.addEventListener('scroll', arm, { passive: true });

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        onScreen = entry?.isIntersecting ?? true;
        arm();
      });
      observer.observe(element);
    }

    // A step finds nothing to scroll while every card fits, and nothing then
    // re-arms the timer: a rail of two that starts out fitting would stay still
    // after a rotation or a narrower window made it scroll. A resize re-arms it.
    let resizes: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizes = new ResizeObserver(arm);
      resizes.observe(element);
    }

    arm();

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      resizes?.disconnect();
      element.removeEventListener('pointerenter', onPointerEnter);
      element.removeEventListener('pointerleave', onPointerLeave);
      element.removeEventListener('focusin', onFocusIn);
      element.removeEventListener('focusout', onFocusOut);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchEnd);
      element.removeEventListener('scroll', arm);
    };
  }, [trackRef, intervalMs, reducedMotion, page]);
}
