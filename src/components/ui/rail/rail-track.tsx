'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useRail } from './rail-context';

/**
 * `hair` puts a single pixel between cards, so a row of photographs reads as
 * one strip; `wide` opens them into separate objects. The gap is also written
 * to `--rail-gap`, which the `rail-inset` utility subtracts from its end
 * spacers — set it in one place and the first card still lands on the gutter.
 */
const track = cva(
  [
    'flex items-stretch overflow-x-auto',
    'gap-(--rail-gap)',
    'scrollbar-none snap-x snap-mandatory',
    // Full bleed, with the cards coming to rest on the page gutter.
    'rail-inset',
    // `overflow-x: auto` drags `overflow-y` along with it, which let the
    // entrance animation of the cards still off the end make the rail
    // scrollable downward — far enough to hide a news card's date. See
    // globals.css.
    'rail-reveal-slack',
    // Stops a swipe past the last card triggering the browser's
    // back-navigation gesture, or scrolling the page behind it.
    'overscroll-x-contain',
    'focus-visible:outline-offset-4',
  ],
  {
    variants: {
      gap: {
        hair: '[--rail-gap:var(--spacing-rail-gap-hair)]',
        wide: '[--rail-gap:var(--spacing-rail-gap-wide)]',
      },
    },
    defaultVariants: { gap: 'wide' },
  },
);

export interface RailTrackProps extends VariantProps<typeof track> {
  /** Names the list for a screen reader, e.g. "SAEL plants". */
  label: string;
  /** The `<li>` cards. Server-rendered — this component never inspects them. */
  children: ReactNode;
  className?: string;
}

/**
 * The scrolling list itself.
 *
 * **How wide a card is belongs to the caller**, as a class on each `<li>` —
 * four plant photographs and six news cards are the same mechanism at two
 * sizes. Children are stretched to equal heights, so a card can push its
 * action to the base with `mt-auto`.
 *
 * `data-scroll-rail` is not decoration: the homepage snaps section by section,
 * and this is what tells anything watching the page's gestures to keep its
 * hands off a sideways one.
 */
export function RailTrack({ label, gap, children, className }: RailTrackProps) {
  const { trackRef, measure } = useRail();

  return (
    <ul
      ref={trackRef}
      data-scroll-rail
      // Focusable because it scrolls. A region a pointer can reach and a
      // keyboard cannot is a WCAG 2.1.1 failure. Once focused, the arrow keys
      // scroll it natively — and unlike up and down, neither is claimed by
      // the page's section snapping.
      tabIndex={0}
      aria-label={label}
      onScroll={measure}
      className={cn(track({ gap }), className)}
    >
      {children}
    </ul>
  );
}
