'use client';

import { useEffect } from 'react';

/**
 * Freeze page scrolling while an overlay is open — the mobile nav drawer.
 *
 * The subtlety is the scrollbar. Setting `overflow: hidden` on a desktop
 * browser that reserves gutter space removes the scrollbar, the viewport gets
 * ~15px wider, and everything behind the drawer jumps sideways as it opens.
 * So the width the scrollbar occupied is handed back as padding.
 *
 * The compensation is applied to `<body>` and to anything marked
 * `data-scroll-lock-offset` — the fixed header, which is positioned against
 * the viewport rather than the body and would otherwise shift on its own.
 *
 * Previous inline values are captured and restored rather than reset to a
 * hardcoded default, so two overlays open at once cannot leave the page
 * permanently padded.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;

    const offsetTargets = [
      ...document.querySelectorAll<HTMLElement>('[data-scroll-lock-offset]'),
    ].map((element) => ({ element, paddingRight: element.style.paddingRight }));

    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.overflow = 'hidden';

    // Zero on touch, where the scrollbar is an overlay and takes no space.
    if (gap > 0) {
      body.style.paddingRight = `${String(gap)}px`;
      for (const { element } of offsetTargets) {
        element.style.paddingRight = `${String(gap)}px`;
      }
    }

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      for (const { element, paddingRight } of offsetTargets) {
        element.style.paddingRight = paddingRight;
      }
    };
  }, [locked]);
}
