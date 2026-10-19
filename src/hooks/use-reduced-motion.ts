'use client';

import { useMediaQuery } from '@/hooks/use-media-query';

/**
 * Whether the user has asked for reduced motion.
 *
 * **Returns `true` on the server**, so the still state is what gets rendered
 * into the HTML and motion is something the client opts into once it can
 * actually read the preference. The inverse default would flash an animation
 * at exactly the people who asked not to see one.
 *
 * That default falls out of the query rather than being special-cased:
 * `useMediaQuery` reports `false` on the server, and the query asked here is
 * the *permissive* one — the same `(prefers-reduced-motion: no-preference)`
 * that gates every rule in animations.css. No match means no motion.
 *
 * Use this for motion JavaScript owns — a scroll-driven timeline, an autoplay
 * interval, a mousemove parallax. Motion that CSS owns needs no hook: it is
 * already inside the media query.
 */
export function useReducedMotion(): boolean {
  return !useMediaQuery('(prefers-reduced-motion: no-preference)');
}
