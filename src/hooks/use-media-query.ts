'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query.
 *
 * `useSyncExternalStore` rather than `useEffect` + `useState`: it gives React a
 * separate server snapshot, so the value is defined during SSR instead of
 * flipping on mount and tearing the first paint.
 *
 * **Returns `false` on the server and on the very first client render.** There
 * is no viewport to measure while rendering HTML, and guessing is worse than
 * conceding. The consequence is that this hook must never decide *whether a
 * component exists* — a `false` on the server followed by `true` on the client
 * is a hydration flash. Choose between two layouts with CSS
 * (`hidden lg:block` / `lg:hidden`) so both are server-rendered, and keep this
 * hook for behaviour that only matters once the page is interactive: whether
 * to attach a parallax listener, whether autoplay should start.
 * docs/responsive-strategy.md §4.
 *
 * @param query a media query string, e.g. `'(min-width: 64rem)'`
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
