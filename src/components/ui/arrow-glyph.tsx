import { cn } from '@/lib/utils/cn';

export interface ArrowGlyphProps {
  className?: string;
}

/**
 * The arrow trailing a card's action label, which slides on hover.
 *
 * Drawn in SVG rather than set as the design's `→` character. That glyph is
 * punctuation: it sits on the text baseline, it cannot be optically centred
 * against a tracked uppercase label without a magic offset, and it renders at
 * a different weight in every fallback font — including in DIN's own metrics
 * if the face ever fails to load. Same argument as the rail arrows.
 *
 * Decorative by definition — the label beside it already says what the control
 * does — so it is hidden from assistive technology and never focusable.
 *
 * Moves on `group-hover`, so the card it sits in must be the `group`. It is
 * always the whole card that is hovered here, never the label alone: the
 * action's hit area is stretched over the card.
 */
export function ArrowGlyph({ className }: ArrowGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        'size-4 shrink-0',
        'transition-transform duration-(--duration-micro) group-hover:translate-x-1',
        'group-focus-within:translate-x-1',
        'motion-reduce:transition-none motion-reduce:group-hover:translate-x-0',
        className,
      )}
    >
      <path
        d="M5 12h13m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
