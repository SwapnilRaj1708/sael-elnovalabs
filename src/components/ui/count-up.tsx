'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/** Every run of digits, with or without a decimal part. */
const NUMBER = /\d+(?:\.\d+)?/g;

/** Ease-out cubic. Fast first, so the figure is legible almost immediately. */
function ease(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export interface CountUpProps {
  /**
   * The finished string, exactly as it should read: `"3625 MW + 5 GW"`,
   * `"164.9 MW"`. Every number in it counts up; everything else is left alone,
   * so units, separators and the `+` never animate.
   */
  value: string;
  /** Milliseconds for the whole run. */
  durationMs?: number;
  className?: string;
}

/**
 * Counts a figure up from zero as it scrolls into view — every time it does.
 *
 * **It animates the numbers inside a string, not a number.** These figures are
 * pre-formatted by the business — `"3625 MW + 5 GW"` is two quantities and two
 * units in one value, and `docs/content-model.md` §2 is explicit that the
 * frontend must not try to compose them. So the string is split on its digit
 * runs, each run is counted independently, and the text between them is
 * emitted verbatim.
 *
 * Decimals are preserved: `"164.9"` counts in tenths and lands on `164.9`,
 * because rounding it to `165` would print a figure the company does not
 * publish.
 *
 * **The width is reserved by the final string.** A counter that grows from one
 * digit to four drags the layout along with it, and on a card with a heading
 * beside it that is very visible. The finished value is rendered underneath,
 * invisible but taking its full space, and the animating text sits over it.
 *
 * **Every figure takes the same time, whatever it counts to.** `3625 MW + 5 GW`
 * and `164.9 MW` both run for `durationMs`, so a row of them finishes together
 * rather than the small numbers landing first and the ledger settling in
 * pieces. A per-digit or per-magnitude rate would do the opposite.
 *
 * **It replays on every pass**, like `<Reveal>` and by the same two-observer
 * asymmetry — see the note there. The counting observer fires 10% up from the
 * bottom edge; the re-arming one waits until the figure is *completely* off
 * screen before resetting it to zero, because resetting at the counting margin
 * would visibly blank a figure still sitting in the bottom tenth of the screen.
 *
 * Reduced motion prints the value and stops. Assistive technology always gets
 * the final string, never the intermediate ones — `aria-hidden` on the ticker
 * and the real value in an `sr-only` span.
 */
export function CountUp({ value, durationMs = 1500, className }: CountUpProps) {
  const element = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = element.current;
    if (node === null) return;

    // Reduced motion: the value is already the initial state, so there is
    // nothing to set and nothing to animate.
    if (reducedMotion) return;

    const targets = [...value.matchAll(NUMBER)].map((match) => ({
      raw: match[0],
      end: Number(match[0]),
      // Count in the same precision the published figure uses, so a value
      // with one decimal place never renders with none, or with three.
      decimals: match[0].includes('.') ? (match[0].split('.')[1]?.length ?? 0) : 0,
    }));

    if (targets.length === 0) return;

    const zeros = value.replace(NUMBER, () => '0');

    let frame = 0;
    let start: number | null = null;
    let running = false;
    let countObserver: IntersectionObserver | null = null;
    let resetObserver: IntersectionObserver | null = null;

    const step = (now: number): void => {
      start ??= now;
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = ease(progress);

      let index = 0;
      setShown(
        value.replace(NUMBER, () => {
          const target = targets[index++];
          if (target === undefined) return '';
          return (target.end * eased).toFixed(target.decimals);
        }),
      );

      if (progress < 1) frame = requestAnimationFrame(step);
      else {
        running = false;
        setShown(value);
      }
    };

    const run = (): void => {
      // Already counting, or already landed on this pass. Without this guard
      // every scroll that re-crosses the margin without ever leaving the
      // screen would restart the run, and the figure would stutter under the
      // reader rather than settle.
      if (running) return;
      running = true;
      start = null;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(step);
    };

    const rearm = (): void => {
      running = false;
      start = null;
      cancelAnimationFrame(frame);
      setShown(zeros);
    };

    // Zero until it is seen, so the count is not already over by the time the
    // section is scrolled to. Deferred a frame rather than set synchronously:
    // writing state during an effect makes React render twice before paint,
    // and here the second render is the one that matters.
    const prime = requestAnimationFrame(() => {
      setShown(zeros);

      // No observer to ask: count now and never re-arm. The figure is real
      // content — a card reading "0 MWp" because a callback never arrived is
      // worse than one that never animated.
      if (typeof IntersectionObserver === 'undefined') {
        run();
        return;
      }

      // Already on screen at mount: start now rather than waiting for the
      // observer's first callback. The observers below are still wired, or
      // the figure would never re-arm after its first pass out of view.
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) run();

      countObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) run();
        },
        { rootMargin: '0px 0px -10% 0px' },
      );

      // Re-arms at the *unadjusted* viewport, so the figure is only ever
      // blanked back to zero while nobody can see it happen.
      resetObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => !entry.isIntersecting)) rearm();
      });

      countObserver.observe(node);
      resetObserver.observe(node);
    });

    return () => {
      cancelAnimationFrame(prime);
      countObserver?.disconnect();
      resetObserver?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, reducedMotion]);

  return (
    <span ref={element} className={className}>
      {/* The finished value, holding the width open and carrying the
          accessible text. `invisible` rather than `sr-only`: it has to occupy
          its real box, which `sr-only` explicitly does not. */}
      <span className="invisible block h-0 overflow-hidden" aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
