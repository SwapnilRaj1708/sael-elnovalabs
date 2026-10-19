import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BackgroundGradientProps {
  /**
   * How strong the light is at full hover, 0–1. Omit for
   * `--bg-gradient-intensity`, which is where the site-wide default is tuned.
   */
  intensity?: number;
  /** The card's ground. `paper` swaps in the colours tuned for white. */
  ground?: 'dark' | 'paper';
  className?: string;
}

/**
 * Aceternity UI's "Background Gradient", trialled on every outlined card at
 * the client's request of 2026-09-25 — a ring of moving colour round a card,
 * with a soft bloom behind it. https://ui.aceternity.com/components/background-gradient
 *
 * Ported from the registry source rather than installed as it ships. Their
 * component wraps the card, pads it by the ring, and animates the gradient
 * with the `motion` library; three things change here, and each is a rule of
 * this codebase rather than a taste:
 *
 *  - **It is a layer, not a wrapper.** `<Card>` renders it inside every
 *    outlined card. The card is already `relative` and a `group`, so the
 *    card's own hover and keyboard focus drive the effect with no new
 *    element round it, and the grid keeps its measurements. The ring is
 *    drawn outside the card's border; see `.anim-bg-gradient` for why.
 *  - **It is hover-only** — or tap-only on a touch screen, through
 *    `<TouchLight>`. Theirs is always lit and brightens on hover.
 *  - **The motion is CSS**, so no client JavaScript and no new dependency.
 *    The pan runs only while the card is hovered, and not at all under
 *    reduced motion, where the gradient holds its first frame.
 *
 * Their colours are replaced by `--gradient-bg-glow` and their blur and ring
 * widths by tokens beside it in theme.css. Decorative, so `aria-hidden`.
 */
export function BackgroundGradient({
  intensity,
  ground = 'dark',
  className,
}: BackgroundGradientProps) {
  return (
    <span
      aria-hidden="true"
      data-ground={ground}
      style={
        intensity === undefined
          ? undefined
          : ({ '--bg-gradient-intensity': intensity } as CSSProperties & Record<string, number>)
      }
      className={cn(
        'anim-bg-gradient',
        'group-hover:opacity-(--bg-gradient-intensity) group-hover:[--bg-gradient-play:running]',
        'group-has-focus-visible:opacity-(--bg-gradient-intensity) group-has-focus-visible:[--bg-gradient-play:running]',
        'group-data-touch-lit:opacity-(--bg-gradient-intensity) group-data-touch-lit:[--bg-gradient-play:running]',
        className,
      )}
    >
      <span className="anim-bg-gradient-glow">
        <span className="anim-bg-gradient-blur anim-bg-gradient-fill" />
      </span>
      <span className="anim-bg-gradient-ring anim-bg-gradient-fill" />
    </span>
  );
}
