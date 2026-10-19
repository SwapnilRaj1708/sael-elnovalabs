'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>;

export interface HeroProgressProps {
  /** Re-keys the fill, so it restarts from empty on every slide change. */
  activeIndex: number;
  /** Drives the fill: it runs only while autoplay is actually advancing. */
  isPlaying: boolean;
  /** Dwell per slide, and the duration of one full sweep of the bar. */
  intervalMs: number;
}

/**
 * The countdown on the slide on screen. Display only — slide selection moved
 * to `<HeroDots>` on 2026-10-01, when the client found four invisible click
 * targets across the bar undiscoverable.
 *
 * **One bar, one full sweep per slide.** It started as four segments filling
 * one after another, then briefly as a quarter-width run per slide that read
 * as one continuous pass across the cycle. The client settled it on
 * 2026-08-22: the bar crosses the whole width once per image, resets, and
 * crosses it again for the next. So the bar is a countdown on the slide you
 * are looking at, not on the carousel.
 *
 * The bar is pinned to the base of the section, which is the point of it: the
 * hero is exactly one viewport tall, so a bar on its bottom edge is on screen
 * the whole time the hero is.
 *
 * `animation-play-state` is set inline because it is genuinely runtime state:
 * the fill freezes where it is while the carousel is paused and resumes from
 * there, which no static class can express.
 */
export function HeroProgress({ activeIndex, isPlaying, intervalMs }: HeroProgressProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-3">
      <div className="absolute inset-x-0 bottom-0 h-hero-track bg-hero-track">
        <span
          // Re-keyed per slide, which is what restarts the sweep from empty
          // rather than leaving it sat full where the last slide finished.
          key={activeIndex}
          className={cn('anim-track-fill block h-full w-full', 'bg-(image:--gradient-hero-fill)')}
          style={
            {
              '--slide-duration': `${String(intervalMs)}ms`,
              animationPlayState: isPlaying ? 'running' : 'paused',
            } as StyleWithVars
          }
        />
      </div>
    </div>
  );
}
