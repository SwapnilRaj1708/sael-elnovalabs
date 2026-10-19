'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils/cn';

export interface GlowFrameProps {
  /** The panel the light sweeps round — an outlined `<Card>`, full width. */
  children: ReactNode;
  /**
   * Whether the light sweeps once round as the enclosing `<Reveal>` shows.
   * On by default — the Careers panel. `false` is a frame lit by the pointer
   * and by keyboard focus only: React Bits' own default (`animated={false}`),
   * and what the Offer Documents tiles use.
   */
  intro?: boolean;
  /**
   * The frame's corner radius, which must be the radius of the card inside
   * it, or the ring will not sit on the card's border. `outlined` is the
   * outlined card's own 40px; `card` is --radius-card, 14px, for a smaller
   * card whose `className` sets the same.
   */
  radius?: 'outlined' | 'card';
  /**
   * `strong` lights nearer the centre (a 20% dead zone instead of 30%),
   * reaches full strength sooner, and blooms a brighter halo. The client's
   * tuning for the Offer Documents tiles, 2026-09-29; `default` is the
   * Careers panel, unchanged.
   */
  strength?: 'default' | 'strong';
  className?: string;
}

const RADIUS_CLASS: Record<NonNullable<GlowFrameProps['radius']>, string> = {
  outlined: 'rounded-(--radius-card-outlined)',
  card: 'rounded-(--radius-card)',
};

/**
 * How close to an edge the pointer has to be, as a fraction of the way from
 * the panel's centre to its edge, before the light starts to show. At 0 the
 * whole panel would light on entry; at 1 it never would. The pasted effect's
 * own `edgeSensitivity` of 30.
 */
const EDGE_THRESHOLD: Record<NonNullable<GlowFrameProps['strength']>, number> = {
  default: 0.3,
  strong: 0.2,
};

/**
 * A frame whose border lights up and sweeps once round as its section
 * reveals, and lights under the pointer near its edges.
 *
 * Three boxes, all on the same radius: a halo behind the panel, the panel
 * itself, and a one-pixel ring over the panel's border. The wrapper carries
 * the radius and the children fill it, so the ring drawn at `inset: 0` sits
 * exactly on the border of whatever is inside — the alignment the pasted
 * effect of 2026-09-22 lacked, because it drew its own box at its own radius
 * around a card that had another.
 *
 * **Both behaviours drive the same two custom properties**, `--glow-angle`
 * and `--glow-edge`, which the ring and halo read in animations.css.
 *
 *  - **The sweep is CSS.** Two keyframe animations, gated on the
 *    `data-reveal="shown"` attribute the enclosing `<Reveal>` sets and
 *    clears, so it plays on first arrival and every return, and is inert
 *    under reduced motion.
 *  - **The hover follow is the one thing that needs JavaScript**, and it is
 *    why this is a client component: the pointer's angle from the panel's
 *    centre and its closeness to an edge are written straight to the two
 *    properties as inline styles — a runtime value carried into CSS, the
 *    use of `style` /CLAUDE.md §5 allows — with no React state and no
 *    re-render per move. It is attached only where a pointer can hover
 *    (`hover: hover` and `pointer: fine`), so a phone never sees a half-lit
 *    frame after a tap, and not under reduced motion, the same gate the
 *    hero's parallax takes.
 *
 * While the sweep runs, the animation's values win over the inline ones;
 * once it ends the inline values apply, which is why the keyframes fill
 * `backwards` rather than `both` — a forward fill would pin the properties
 * at the sweep's end state and the pointer could never move them.
 *
 * **Keyboard focus lights the whole frame.** Anything inside it that takes
 * `:focus-visible` — the tile's link, the panel's button — lights the ring
 * and halo all the way round, statically: the hover light's keyboard
 * equivalent, done in CSS off `:has()`. See animations.css.
 *
 * The two light layers are decorative and `aria-hidden`. Must be rendered
 * inside a `<Reveal>` for the sweep; outside one only the hover applies.
 */
export function GlowFrame({
  children,
  intro = true,
  strength = 'default',
  radius = 'outlined',
  className,
}: GlowFrameProps) {
  const frame = useRef<HTMLDivElement>(null);
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = useReducedMotion();
  const follow = canHover && !reducedMotion;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    const el = frame.current;
    if (el === null) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = event.clientX - rect.left - cx;
    const dy = event.clientY - rect.top - cy;

    // 0 at the centre, 1 at the nearest edge.
    const proximity = Math.min(1, Math.max(Math.abs(dx) / cx, Math.abs(dy) / cy));
    const threshold = EDGE_THRESHOLD[strength];
    const edge = Math.max(0, (proximity - threshold) / (1 - threshold));
    // Measured clockwise from the top, which is where a conic gradient starts.
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

    el.style.setProperty('--glow-angle', `${angle.toFixed(2)}deg`);
    el.style.setProperty('--glow-edge', edge.toFixed(3));
  }

  function handlePointerLeave(): void {
    frame.current?.style.setProperty('--glow-edge', '0');
  }

  return (
    <div
      ref={frame}
      onPointerMove={follow ? handlePointerMove : undefined}
      onPointerLeave={follow ? handlePointerLeave : undefined}
      data-glow-intro={intro ? undefined : 'off'}
      data-glow-strength={strength === 'strong' ? 'strong' : undefined}
      className={cn('anim-glow-sweep relative', RADIUS_CLASS[radius], className)}
    >
      <span aria-hidden="true" className="anim-glow-halo" />
      {children}
      <span aria-hidden="true" className="anim-glow-border" />
    </div>
  );
}
