'use client';

import { useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BackgroundRippleProps {
  /**
   * Enough rows to cover the tallest band it will fill, at the smallest cell.
   * The default covers `--ripple-hero-h` on a 1440px-tall screen.
   */
  rows?: number;
  /** Enough columns to cover the widest screen; the grid is centred and clipped. */
  cols?: number;
  /**
   * How the grid fades out. `band`, the default, is the investor mastheads':
   * from the top centre, gone by the band's foot. `screen` is for a hero a
   * whole screen tall: solid across the top half, fading from the middle
   * down and gone at the foot (Our Key ESG Metrics, 2026-10-07). Both are
   * masks in theme.css.
   */
  fade?: 'band' | 'screen';
  className?: string;
}

interface Origin {
  row: number;
  col: number;
}

/**
 * A grid of faint cells that light under the pointer and ripple outward from
 * a click — Aceternity UI's "Background Ripple Effect", at the client's
 * request of 2026-09-29. Decorative: it fills its positioned parent, and the
 * content goes on top.
 *
 * **What is Aceternity's, and what is not.**
 *
 *  - Theirs: the grid, the cell (hairline border, faint fill, inset glow),
 *    the rest and lit opacities, the hover, and the click wave — every cell
 *    lighting after a delay and for a time that both grow with its distance
 *    from the cell clicked, restarted by remounting the grid.
 *  - Coloured here, not by them. Their cells are neutral grey; these are
 *    drawn in neutral light and tinted by one layer across the whole band —
 *    `--gradient-heading-bright` in `mix-blend-mode: color` — so the grid
 *    runs violet to magenta to red left to right, the ramp the site's dark
 *    headings use. The tint acts on true black inside this box, and the box
 *    is laid onto the page with `screen`, so the page's own ground shows
 *    through where the grid is dark — animations.css (`.ripple-band`) says
 *    why a direct blend over the site's near-black washes the whole band.
 *    It adds light, so it is for a dark ground only, like the site.
 *  - Sized here, not by them. Their grid is a fixed 27 × 8 box whose fade is
 *    measured against itself; this one is wider than any screen, centred,
 *    clipped to its parent, and faded against the parent — so the fade lands
 *    on the screen at every width. Cells are 44px on a phone, 56px (theirs)
 *    at the design width.
 *  - Timing and colour live in tokens (`--ripple-*`, theme.css) and in
 *    animations.css; the script's only job is to say which cell was clicked
 *    and how far every other cell is from it.
 *
 * **One click handler for the grid**, not one per cell: the cell under the
 * pointer is worked out from the grid's own box. Hover is pure CSS.
 *
 * `aria-hidden` and never focusable — it is a background. A click on it does
 * nothing but ripple. Under reduced motion the wave does not run; the hover
 * still lights a cell, without the fade (animations.css).
 */
export function BackgroundRipple({
  rows = 14,
  cols = 48,
  fade = 'band',
  className,
}: BackgroundRippleProps) {
  const field = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  // Remounting the grid is what restarts every cell's animation from the top,
  // exactly as Aceternity does it. Cheaper than it sounds: the cells are
  // empty boxes, and it happens once per click.
  const [wave, setWave] = useState(0);

  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, index) => index),
    [rows, cols],
  );

  function handleClick(event: MouseEvent<HTMLDivElement>): void {
    const box = field.current?.getBoundingClientRect();
    if (box === undefined) return;

    const col = Math.floor(((event.clientX - box.left) / box.width) * cols);
    const row = Math.floor(((event.clientY - box.top) / box.height) * rows);
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;

    setOrigin({ row, col });
    setWave((current) => current + 1);
  }

  return (
    <div
      aria-hidden="true"
      className={cn('ripple-band absolute inset-0 overflow-hidden', className)}
    >
      <div className={cn('ripple-mask', fade === 'screen' && 'ripple-mask-screen')}>
        <div
          key={wave}
          ref={field}
          onClick={handleClick}
          data-wave={origin === null ? undefined : ''}
          className="ripple-field"
          // The column count reaches the CSS grid as a custom property — a
          // runtime value carried into CSS, the one use of `style`
          // /CLAUDE.md §5 allows.
          style={{ '--ripple-cols': cols } as CSSProperties & Record<string, number>}
        >
          {cells.map((index) => (
            <div
              key={index}
              className="ripple-cell"
              style={
                origin === null
                  ? undefined
                  : ({
                      '--ripple-d': Math.hypot(
                        origin.row - Math.floor(index / cols),
                        origin.col - (index % cols),
                      ).toFixed(2),
                    } as CSSProperties & Record<string, string>)
              }
            />
          ))}
        </div>
      </div>

      <div className="ripple-tint" />
    </div>
  );
}
