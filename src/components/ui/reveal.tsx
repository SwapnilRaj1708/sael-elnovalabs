'use client';

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

/** Marks the document once the observer is live. See the note on `Reveal`. */
const READY_CLASS = 'reveal-ready';

/**
 * Fire as soon as any of the element crosses 10% up from the bottom edge,
 * rather than waiting for a fraction of it to be visible. A percentage
 * threshold behaves very differently for a 60px heading and a 500px image;
 * a margin treats them the same.
 */
const ROOT_MARGIN = '0px 0px -10% 0px';

/**
 * How far into the viewport an element must already be at mount to count as
 * "there before the user was", and skip the animation.
 *
 * Not simply `top < innerHeight`: a section resting exactly on the fold — which
 * is where every one of them starts on this page — would qualify, be revealed
 * synchronously, and never animate at all. It has to be *properly* in view.
 */
const ALREADY_SEEN = 0.75;

export interface RevealProps extends Omit<ComponentPropsWithoutRef<'div'>, 'style'> {
  children: ReactNode;
  /**
   * Applied to the element itself, not to a wrapper — `Reveal` **is** the box.
   * So it can carry a section's own positioning and nothing extra lands in
   * the layout tree.
   */
  className?: string;
  /**
   * Stagger position. Each step delays the start by `--duration-reveal-step`,
   * so a heading can land before the paragraph under it.
   */
  order?: number;
}

/**
 * Fades its content up as it scrolls into view — every time it does.
 *
 * **Replays on every pass**, by the client's decision on 2026-08-06 (it was
 * once-only before that). Two observers share the work, and the asymmetry
 * between them is the point:
 *
 *  - the *reveal* observer fires at `ROOT_MARGIN`, 10% up from the bottom,
 *    so content starts its entrance a beat after it appears;
 *  - the *reset* observer re-arms at the true viewport edge, only once the
 *    element is **completely** off screen. Resetting at the reveal margin
 *    would visibly fade content back out while it still occupies the bottom
 *    tenth of the screen; resetting off screen is free, because nobody can
 *    see the state change.
 *
 * ---------------------------------------------------------------------------
 * The hidden state is applied by script, never by the server, and that is what
 * keeps the page readable when the script does not arrive.
 *
 * The obvious build — ship `opacity: 0` in the HTML and let JavaScript remove
 * it — means a browser that fails to run the bundle shows a blank section for
 * ever. Instead the CSS only hides an element once `<html>` carries
 * `reveal-ready`, which this component adds on mount. No script, no class, no
 * hiding: the content is simply visible, which is the correct outcome.
 *
 * An element already on screen at mount is marked revealed synchronously,
 * before the observer is wired, so it never flashes hidden for a frame.
 *
 * Motion is gated on `prefers-reduced-motion: no-preference` in the
 * stylesheet, so the whole effect is inert for anyone who has asked for less
 * of it. /CLAUDE.md §5.
 */
export function Reveal({ children, className, order = 0, ...props }: RevealProps) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = element.current;
    if (node === null) return;

    const root = document.documentElement;
    root.classList.add(READY_CLASS);

    const reveal = (): void => {
      node.dataset.reveal = 'shown';
    };

    // Already on screen — reveal now rather than waiting for the observer's
    // first callback, which would leave it hidden for a frame. No early
    // return any more: the observers below still need wiring, or the element
    // would never re-arm after its first pass out of view.
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight * ALREADY_SEEN && box.bottom > 0) {
      reveal();
    }

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal();
      },
      { rootMargin: ROOT_MARGIN },
    );

    // Re-arms at the *unadjusted* viewport, so the hidden state only ever
    // lands while the element cannot be seen. `!isIntersecting` here means
    // fully outside the screen, whichever edge it left by.
    const resetObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => !entry.isIntersecting)) {
        node.dataset.reveal = 'pending';
      }
    });

    revealObserver.observe(node);
    resetObserver.observe(node);
    return () => {
      revealObserver.disconnect();
      resetObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={element}
      data-reveal="pending"
      style={{ '--reveal-order': order } as CSSProperties & Record<string, number>}
      className={cn('anim-reveal', className)}
      {...props}
    >
      {children}
    </div>
  );
}
