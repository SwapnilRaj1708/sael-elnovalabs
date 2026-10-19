'use client';

import { useCallback, useEffect, useRef } from 'react';

/** The prototype's grid. Cell pitch and the gap knocked out of each square. */
const CELL = 7;
const GAP = 1.4;

/**
 * How quickly the squares thin out going **down**, this being the mirrored
 * strip. Above 1 the fall-off is front-loaded, so the rows nearest the
 * footer's top edge stay dense and the lowest few are almost empty — a
 * dissolve rather than a linear fade.
 */
const FALLOFF = 1.75;

/**
 * Solid rows added *above* the dissolve, not taken out of it — the page
 * strip's band, mirrored to the other end.
 *
 * The fall-off curve already ends on one complete row of its own — at its
 * first row the probability is 1 — so six more below it make the seven the
 * design asks for. They are extra height rather than a slice of the existing
 * fade: `--spacing-pixel-strip` carries the 6 × `CELL` this costs, and the
 * curve is still measured over the same 20 rows it always was. Shortening the
 * fade to make room instead changes the pattern the client approved.
 */
const SOLID_ROWS = 6;

/** The six ramp stops, read from the token layer at paint time. */
const STOP_COUNT = 6;

/**
 * Deterministic value noise in [0, 1).
 *
 * `Math.random()` would repaint a different pattern on every resize, which
 * reads as the strip flickering as you drag a window. This is the prototype's
 * hash: the same cell always resolves the same way, so a resize re-flows the
 * grid without reshuffling it.
 */
function hash(column: number, row: number): number {
  const n = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * The scattered squares below the footer strip's solid band.
 *
 * **The vertical mirror of `sections/pixel-strip/scatter.tsx`**, and the only
 * difference between the two files is which end row 0 sits at — see `y` in
 * the fill loop. The hash, the fall-off curve, the cell pitch and the ramp are
 * all identical, so the two strips are the same pattern seen from opposite
 * sides rather than two patterns that happen to look alike.
 *
 * The ramp still runs left→right, deliberately: mirroring that too would put
 * the strips' colours out of step with each other where they meet.
 *
 * **A canvas, where the map next door is an SVG** — the opposite call, for the
 * opposite reason. The map is a fixed 620 × 660 drawing that wants to scale
 * and be styled; this is a field of 7px cells whose *count* depends on how
 * wide the viewport is, and which must stay 7px at every width. An SVG would
 * have to either stretch the squares out of square or tile the ramp, and the
 * ramp has to run once across the full width. Nothing here is content, so the
 * things a canvas costs — selectable text, assistive technology, CSS styling —
 * cost nothing.
 *
 * **It is the whole strip now**, where it used to be the dissolve above a CSS
 * gradient bar. That bar was the no-script fallback; with it gone, a browser
 * that never runs this draws nothing at all. Acceptable for a divider that
 * carries no information — the page reads identically without it — and the
 * alternative the client rejected was 18px of solid colour they did not want.
 */
export function PixelScatter() {
  const canvas = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const element = canvas.current;
    if (element === null) return;

    const { width, height } = element.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    // Cap at 2: beyond that the extra pixels are invisible and the canvas is
    // four times the memory. The prototype's cap, and the right one.
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);

    const context = element.getContext('2d');
    if (context === null) return;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    // The ramp lives in the token layer, so it is read from the element rather
    // than duplicated here. /CLAUDE.md §2.
    const styles = getComputedStyle(element);
    const gradient = context.createLinearGradient(0, 0, width, 0);
    const offsets = [0, 0.2, 0.42, 0.62, 0.8, 1];

    for (let index = 0; index < STOP_COUNT; index += 1) {
      const colour = styles.getPropertyValue(`--color-pixel-${String(index + 1)}`).trim();
      if (colour === '') return;
      gradient.addColorStop(offsets[index] ?? 0, colour);
    }

    context.fillStyle = gradient;

    const rows = Math.max(0, Math.floor(height / CELL));
    const columns = Math.ceil(width / CELL);

    // The rows the dissolve is spread over, once the solid band is taken out.
    // Guarded: a strip too short to hold the band renders as all solid rather
    // than dividing by zero and painting nothing.
    const scatterRows = Math.max(1, rows - SOLID_ROWS);

    for (let row = 0; row < rows; row += 1) {
      const scattered = row - SOLID_ROWS;
      const probability = scattered < 0 ? 1 : Math.pow(1 - scattered / scatterRows, FALLOFF);
      // Row 0 is the *top* row here, where the page strip anchors row 0 to
      // the bottom. That single expression is the mirror: the solid band
      // lands flush against the footer's top edge and the dissolve runs down
      // into the footer instead of up out of the page.
      const y = row * CELL;

      for (let column = 0; column < columns; column += 1) {
        if (hash(column, row) < probability) {
          context.fillRect(column * CELL, y, CELL - GAP, CELL - GAP);
        }
      }
    }
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (element === null) return;

    draw();

    // The column count is a function of width, so the grid has to be rebuilt
    // when the element changes size — not merely stretched, which is what
    // leaving the canvas alone would do.
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(draw);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [draw]);

  return <canvas ref={canvas} className="absolute inset-0 block h-full w-full" />;
}
