'use client';

import { useSyncExternalStore } from 'react';

const subscribeNever = () => () => undefined;

/**
 * True once this component is running in the browser, false in the server
 * HTML and through hydration. React reads the server snapshot while it
 * hydrates and re-renders with the client one after, so the two never
 * mismatch.
 *
 * For a control that is a plain link without JavaScript and becomes a button
 * with it — `<YouTubeDialog>`, `<MapEmbed>` — so it is never a button that
 * does nothing.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
