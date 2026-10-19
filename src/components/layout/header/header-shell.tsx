'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HeaderGlass } from '@/components/layout/header/header-glass';
import { cn } from '@/lib/utils/cn';

/**
 * The masthead's own element, and the one scroll listener behind both of the
 * bar's scroll-driven states.
 *
 * Two things depend on scroll position: the glass firms up once the page
 * leaves the top, and — below `lg` — the whole bar slides out of the way when
 * you scroll down and comes back when you scroll up. Both are read from the
 * same measurement in the same frame, because two listeners computing
 * `window.scrollY` on the same tick is a listener too many.
 *
 * `children` is the server-rendered bar content, passed straight through. This
 * component is client only for the two booleans; nothing inside it is.
 *
 * **Auto-hide is a mobile behaviour, and the breakpoint is CSS's to decide.**
 * The listener runs at every width and `hidden` toggles at every width, but
 * `lg:translate-none` neutralises it from 1024px up. Gating the listener in JS
 * instead would mean restating `--breakpoint-lg` in a media-query string, and
 * a breakpoint written in two places is a breakpoint that drifts.
 *
 * `lg:translate-none` — rather than `lg:translate-y-0` — is load-bearing. A
 * `translate` that is not `none` makes the element a containing block for
 * `position: fixed` descendants, and the desktop mega menu is `fixed inset-0`
 * inside this bar; `translate-y-0` would still be a containing block and would
 * collapse the menu onto the 68px bar. It is the same trap `backdrop-filter`
 * sets, and the reason the mobile drawer now portals to `<body>` — see the
 * notes in header.tsx and mobile-nav.tsx.
 *
 * docs/features/03-app-shell-header-footer.md §2.
 */

/** `SAEL Home v2`'s own `scrollY > 8` — the bar reacts to leaving the top, not
 *  to having scrolled a distance. */
const GLASS_THRESHOLD_PX = 8;

/**
 * How far the page must move in one direction before the bar acts on it.
 *
 * Sub-threshold movement is deliberately *accumulated* rather than discarded:
 * `lastY` is only advanced when the bar actually reacts, so a slow drag still
 * reaches the threshold instead of creeping under it forever. Its job is to
 * stop a fingertip resting on a touchscreen from flickering the bar in and out.
 */
const DIRECTION_THRESHOLD_PX = 6;

export interface HeaderShellProps {
  children: ReactNode;
}

export function HeaderShell({ children }: HeaderShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);
  const frame = useRef<number | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const measure = () => {
      frame.current = null;

      // Clamped at zero: iOS reports a negative offset while rubber-banding at
      // the top of the document, and releasing from one would otherwise read
      // as a deliberate scroll down.
      const y = Math.max(window.scrollY, 0);

      setScrolled(y > GLASS_THRESHOLD_PX);

      // The bar is never hidden while its own height is still on screen. Two
      // reasons: there is nothing to gain from hiding a bar you have barely
      // scrolled past, and it guarantees a way back — a page shorter than the
      // hide threshold can never strand the navigation off-screen.
      const topZone = barRef.current?.offsetHeight ?? 0;
      if (y <= topZone) {
        lastY.current = y;
        setHidden(false);
        return;
      }

      const delta = y - lastY.current;
      if (Math.abs(delta) < DIRECTION_THRESHOLD_PX) return;

      lastY.current = y;
      setHidden(delta > 0);
    };

    // Deep-linking into a page starts it mid-scroll. Seed the baseline from
    // where the page actually is, or the first measurement reads the whole
    // offset as one scroll down and hides the bar before it is ever seen.
    lastY.current = Math.max(window.scrollY, 0);
    measure();

    const onScroll = () => {
      frame.current ??= window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <header
      ref={barRef}
      className={cn(
        'fixed inset-x-0 top-0 z-(--z-header)',
        'transition-transform duration-(--duration-header) ease-(--ease-entrance)',
        'motion-reduce:transition-none',
        hidden && '-translate-y-full lg:translate-none',
      )}
    >
      <HeaderGlass scrolled={scrolled} />
      {children}
    </header>
  );
}
