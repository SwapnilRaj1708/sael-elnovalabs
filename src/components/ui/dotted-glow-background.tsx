'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { TOUCH_LIT_ATTR } from '@/components/ui/touch-light';
import { cn } from '@/lib/utils/cn';

export interface DottedGlowBackgroundProps {
  /**
   * How strong the field is at full hover, 0–1. Omit for
   * `--dotted-glow-intensity`, which is where the site-wide default is tuned.
   */
  intensity?: number;
  /** The card's ground. `paper` swaps in the colours tuned for white. */
  ground?: 'dark' | 'paper';
  /** Distance between dot centres, in CSS pixels. Aceternity's default. */
  gap?: number;
  /** Radius of each dot, in CSS pixels. Aceternity's default. */
  radius?: number;
  /** The slowest and fastest a dot pulses, in radians a second. */
  speedMin?: number;
  speedMax?: number;
  /** A multiplier on every dot's speed. */
  speedScale?: number;
  className?: string;
}

interface Dot {
  x: number;
  y: number;
  phase: number;
  speed: number;
}

/**
 * Aceternity UI's "Dotted Glow Background", trialled on every accented
 * hairline card at the client's request of 2026-09-25 — a grid of dots on a canvas, each
 * pulsing on its own phase and throwing a little light at its brightest.
 * https://ui.aceternity.com/components/dotted-glow-background
 *
 * Ported from the registry source. The dot grid, the per-dot phase and speed,
 * the triangle-wave pulse and the glow threshold are theirs unchanged. What
 * differs:
 *
 *  - **It shows only on hover, or on a tap.** `<Card>` renders it inside
 *    every hairline card that has an accent; the card's `group` hover — or,
 *    on a touch screen, `<TouchLight>`'s tap — fades the layer in to
 *    `--dotted-glow-intensity`. It sits at `z-index: -1` in the card's
 *    isolated stacking context, so the card's content needs nothing.
 *  - **It only draws while it can be seen.** Theirs runs a frame loop for as
 *    long as it is on screen; eight cards would be eight loops painting an
 *    invisible canvas. The loop here starts when a mouse or pen enters the
 *    card, or a tap lights it, and stops once the fade-out has finished.
 *  - **Reduced motion gets one still frame** rather than the pulse.
 *  - **Colours are tokens**, `--dotted-glow-dot` and `--dotted-glow-light`,
 *    read from the cascade once, with a paper pair for a card on white.
 *    Their dark-mode detection is dropped: the site's grounds are fixed per
 *    section, not per colour scheme.
 *  - **Intensity is CSS opacity** on the layer rather than their canvas
 *    `globalAlpha`, which is the same multiplication, so it can be tuned
 *    in theme.css like everything else.
 *
 * Decorative, so `aria-hidden`.
 */
export function DottedGlowBackground({
  intensity,
  ground = 'dark',
  gap = 12,
  radius = 2,
  speedMin = 0.4,
  speedMax = 1.3,
  speedScale = 1,
  className,
}: DottedGlowBackgroundProps) {
  const layerRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const host = layer?.parentElement;
    if (!layer || !canvas || !host) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(layer);
    const dotColor = styles.getPropertyValue('--dotted-glow-dot').trim();
    const glowColor = styles.getPropertyValue('--dotted-glow-light').trim();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2);

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let active = false;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.fillStyle = dotColor;

      const time = (now / 1000) * Math.max(speedScale, 0);
      for (const dot of dots) {
        // A linear triangle wave, 0 → 1 → 0, so each dot glows and dims evenly.
        const mod = (time * dot.speed + dot.phase) % 2;
        const lin = mod < 1 ? mod : 2 - mod;
        const alpha = 0.25 + 0.55 * lin;

        if (alpha > 0.6) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 6 * ((alpha - 0.6) / 0.4);
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const layout = () => {
      const rect = layer.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Offset every other row by half a gap, and randomise phase and speed
      // per dot, which is what makes the field shimmer rather than blink.
      const cols = Math.ceil(width / gap) + 2;
      const rows = Math.ceil(height / gap) + 2;
      const min = Math.min(speedMin, speedMax);
      const span = Math.max(speedMin, speedMax) - min;
      dots = [];
      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          dots.push({
            x: i * gap + (j % 2 === 0 ? 0 : gap * 0.5),
            y: j * gap,
            phase: Math.random() * Math.PI * 2,
            speed: min + Math.random() * span,
          });
        }
      }

      // A resize clears the canvas; a still frame on show has to be redrawn.
      if (active && still.matches) draw(performance.now());
    };

    const activate = () => {
      active = true;
      clearTimeout(stopTimer);
      if (still.matches) {
        stop();
        draw(performance.now());
      } else if (raf === 0) {
        raf = requestAnimationFrame(frame);
      }
    };

    // Keep drawing through the fade-out, then stop. The fade is the layer's
    // own transition, so its length is read rather than repeated here.
    const deactivate = () => {
      active = false;
      clearTimeout(stopTimer);
      const fadeMs = (parseFloat(getComputedStyle(layer).transitionDuration) || 0) * 1000;
      stopTimer = setTimeout(stop, fadeMs);
    };

    const touchLit = () => host.hasAttribute(TOUCH_LIT_ATTR);

    // A touch has no hover; <TouchLight> marks a tapped card instead, and
    // pointerleave fires on every lift of a finger, so both are left to it.
    const handleEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') activate();
    };
    const handleLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' && !touchLit()) deactivate();
    };

    const resize = new ResizeObserver(layout);
    resize.observe(layer);
    layout();

    const tap = new MutationObserver(() => {
      if (touchLit()) activate();
      else deactivate();
    });
    tap.observe(host, { attributes: true, attributeFilter: [TOUCH_LIT_ATTR] });

    host.addEventListener('pointerenter', handleEnter);
    host.addEventListener('pointerleave', handleLeave);

    return () => {
      stop();
      clearTimeout(stopTimer);
      resize.disconnect();
      tap.disconnect();
      host.removeEventListener('pointerenter', handleEnter);
      host.removeEventListener('pointerleave', handleLeave);
    };
  }, [gap, radius, speedMin, speedMax, speedScale]);

  return (
    <span
      ref={layerRef}
      aria-hidden="true"
      data-ground={ground}
      style={
        intensity === undefined
          ? undefined
          : ({ '--dotted-glow-intensity': intensity } as CSSProperties & Record<string, number>)
      }
      className={cn(
        'anim-dotted-glow',
        'group-hover:opacity-(--dotted-glow-intensity)',
        'group-has-focus-visible:opacity-(--dotted-glow-intensity)',
        'group-data-touch-lit:opacity-(--dotted-glow-intensity)',
        className,
      )}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </span>
  );
}
