'use client';

import { cn } from '@/lib/utils/cn';
import { useRail } from './rail-context';

export interface RailArrowsProps {
  previousLabel: string;
  nextLabel: string;
  /**
   * Which ground the pair is drawn on. The outline and the glyph are the only
   * things that change; the shape and the hit area do not.
   */
  tone?: 'dark' | 'paper';
  className?: string;
}

/**
 * The rail's paging pair, placed by the section rather than by the rail.
 *
 * `SAEL Home v2` sets them in the heading row, square and outlined, sharing a
 * single hairline where they meet — which is why the gap is one pixel and the
 * two are not rounded. That is a change from the earlier design, where they
 * were circles floated over the artwork.
 *
 * A spent arrow is dimmed and disabled, not removed. Taking one away moves the
 * other, and the pair stops reading as a fixed frame at the corner of the
 * section.
 */
export function RailArrows({
  previousLabel,
  nextLabel,
  tone = 'dark',
  className,
}: RailArrowsProps) {
  const { atStart, atEnd, page } = useRail();

  return (
    <div className={cn('flex shrink-0 gap-px', className)}>
      <RailArrow
        direction={-1}
        label={previousLabel}
        spent={atStart}
        tone={tone}
        onActivate={page}
      />
      <RailArrow direction={1} label={nextLabel} spent={atEnd} tone={tone} onActivate={page} />
    </div>
  );
}

interface RailArrowProps {
  direction: 1 | -1;
  label: string;
  spent: boolean;
  tone: 'dark' | 'paper';
  onActivate: (direction: 1 | -1) => void;
}

/**
 * One paging arrow.
 *
 * The chevron is drawn in SVG rather than set as the design's `‹` and `›`
 * glyphs: those are punctuation, so they sit on the text baseline and cannot
 * be optically centred in a square without a magic offset, and they render at
 * a different weight in every fallback font. One path, mirrored, so both
 * arrows are the same shape at the same optical weight.
 */
function RailArrow({ direction, label, spent, tone, onActivate }: RailArrowProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={spent}
      onClick={() => {
        onActivate(direction);
      }}
      className={cn(
        'flex size-rail-arrow-sq items-center justify-center border',
        'cursor-pointer transition duration-(--duration-micro)',
        tone === 'dark'
          ? 'border-hairline-dark text-white hover:bg-white/10'
          : 'border-hairline-paper-soft text-ink hover:bg-ink/5',
        // Spent, not gone — and dimmed rather than hidden, because the pair is
        // part of the heading row's own composition here.
        'disabled:pointer-events-none disabled:opacity-30',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={cn('size-5', direction === 1 && '-scale-x-100')}
      >
        <path
          d="M15 5 8 12l7 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
