'use client';

import { cn } from '@/lib/utils/cn';

export interface HeroDotsProps {
  /** One label per slide — the headline the dot goes to. */
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * The hero's slide selector: one dot per slide, centred at the base of the
 * section, sitting in the same row as `<HeroProgress>`.
 *
 * The client asked on 2026-10-01 for an obvious manual control. Selection used
 * to live on four invisible quarter-width buttons over the progress bar; it
 * lives here now, and the bar is a countdown and nothing else.
 *
 * Each dot is a real `<button>` whose hit area is padded out around the 8px
 * visual: --spacing-dot-target (24px, WCAG 2.5.8) wide so the row holds
 * together as one control, --spacing-hero-progress (44px) tall since nothing
 * above or below it can be mis-hit. docs/responsive-strategy.md §5.
 */
export function HeroDots({ labels, activeIndex, onSelect }: HeroDotsProps) {
  return (
    <div
      // The backdrops above are `pointer-events-none` so that a drag anywhere
      // on the hero reaches the swipe handler; the dots have to opt back in.
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-4 flex h-hero-progress items-center justify-center gap-hero-dot-gap"
    >
      {labels.map((label, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={label}
            type="button"
            onClick={() => {
              onSelect(index);
            }}
            aria-label={`Show slide ${String(index + 1)} of ${String(labels.length)}: ${label}`}
            aria-current={isActive ? 'true' : undefined}
            className="flex h-full min-w-dot-target cursor-pointer items-center justify-center rounded-pill"
          >
            <span
              aria-hidden="true"
              className={cn(
                'block h-hero-dot rounded-pill transition-all duration-300 motion-reduce:transition-none',
                isActive ? 'w-hero-dot-active bg-hero-dot-active' : 'w-hero-dot bg-hero-dot',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
