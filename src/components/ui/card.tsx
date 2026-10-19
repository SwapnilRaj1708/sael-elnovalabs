import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { DottedGlowBackground } from '@/components/ui/dotted-glow-background';
import { TouchLight } from '@/components/ui/touch-light';
import { cn } from '@/lib/utils/cn';

/**
 * The v2 card: a hairline, an inset under it, and an accent that fills across
 * the hairline when the card is hovered or focused. docs/design-guidelines.md §4.
 *
 * **This primitive was rewritten on 2026-08-26 (C-1) to match the built
 * homepage**, which is authoritative. It previously described the pre-v2 card —
 * a white box with `--radius-card`, a border on all four sides,
 * `--shadow-card-hover` and a 5px lift — plus a `tile` variant that wrapped its
 * children in `<TileShape>` for the chamfered business tile. v2 removed both
 * surfaces: the news card "lost its box" and the business tiles became rows of
 * a ledger. Neither variant had a single call site, so the old spec survived
 * only here and in the guidelines, describing a page that no longer existed.
 *
 * What is shared is smaller than the old primitive but real: the two sections
 * had the same six-line accent span duplicated verbatim, and the same
 * `group relative flex w-full border-t` spine underneath it. That trio —
 * hairline, inset, accent — *is* the v2 card idiom, and it is what a new page
 * should reach for.
 *
 * Deliberately **not** in here: flex direction, the column gap, and the one
 * upcoming row's own ground. Those are each section's composition, and pushing
 * them into variants would make this a switch statement over two callers rather
 * than a primitive.
 *
 * The accent is `scaleX` from a left origin, so nothing is laid out again per
 * frame, and it is `aria-hidden` — it repeats the hover state a focus ring
 * already carries. `group-has-focus-visible` mirrors `group-hover`
 * throughout, so a card reached by keyboard behaves as it does under a pointer.
 * docs/responsive-strategy.md §5.
 *
 * **It was `group-focus-within` until FE-07, and that was a bug.** A card whose
 * content opens a modal — the team card's biography dialog — gets focus back on
 * its trigger when the dialog closes, because that is what a native `<dialog>`
 * correctly does. `:focus-within` cannot tell that restored focus from a
 * deliberate keyboard visit, so the accent stayed filled after a mouse user
 * closed the dialog, and stayed filled while they moved the pointer over other
 * cards. `:has(:focus-visible)` defers to the browser's own modality
 * heuristic instead: after a pointer interaction the ring is not drawn and
 * neither is the accent, and after a keyboard one both are — which is right,
 * because a keyboard user does need to see where focus landed.
 *
 * **`shape="outlined"` is the second card idiom**, added 2026-09-17 to the
 * client's reference for the strategic pillars: a rounded box outlined on all
 * four sides, with its content set inside `--spacing-flow` of padding. It
 * keeps the same `group` and ground so the accent and the hover contract are
 * unchanged; only the frame differs. The hairline idiom stays the default.
 *
 * **Hover light — an Aceternity UI trial, client request of 2026-09-25.**
 * Every card of each idiom gets the same light on hover, so the client can
 * judge the effect across the whole site rather than on one page: an
 * outlined card gets `<BackgroundGradient>`, and a hairline card with an
 * accent gets `<DottedGlowBackground>`. A touch screen has no hover, so
 * `<TouchLight>` lights a card on a tap instead. A hairline card with no accent is
 * not interactive and gets neither, for the reason it has no accent. The
 * light is a layer at `z-index: -1` inside a card that isolates, so it sits
 * above the card's own ground and below all of its content with nothing
 * asked of the children. Pass `hoverEffect={false}` to exempt one card; to
 * take the trial out, delete the two layers below and their components.
 */
const card = cva('group relative flex w-full', {
  variants: {
    /** `hairline` hangs from a top rule; `outlined` is a rounded, bordered box. */
    shape: {
      hairline: 'border-t',
      outlined: 'rounded-(--radius-card-outlined) border p-flow',
    },
    /** Which hairline the card hangs from — follow the section's ground. */
    ground: {
      paper: 'border-hairline-paper',
      dark: 'border-hairline-dark',
    },
    /**
     * Frosted glass: a translucent white face that blurs the dot grid behind
     * it, a softer frame and a layered shadow. For the business pages'
     * outlined cards, to keep their copy clear of the dots (2026-10-14).
     * **`outlined` on paper only** — the glass is white, which is wrong on
     * the dark ground, and a hairline card has no face to frost. The
     * compounds below are what enforce that: elsewhere this does nothing.
     */
    frosted: { true: '', false: '' },
    /**
     * `top` insets below the hairline only, for a card whose own last element
     * closes it. `block` insets both edges, for a row in a stack of rows.
     */
    inset: {
      top: 'pt-inset',
      block: 'py-inset',
      /** For `outlined`, whose padding is its own. */
      none: '',
    },
  },
  compoundVariants: [
    // The box needs a stronger line than a lone hairline — see --color-outline-*.
    { shape: 'outlined', ground: 'dark', className: 'border-outline-dark' },
    { shape: 'outlined', ground: 'paper', frosted: false, className: 'border-outline-paper' },
    {
      shape: 'outlined',
      ground: 'paper',
      frosted: true,
      className: [
        'border-outline-frosted bg-surface-frosted shadow-frosted-card',
        'backdrop-blur-frosted-card backdrop-saturate-(--saturate-frosted-card)',
      ],
    },
  ],
  defaultVariants: { ground: 'paper', inset: 'top', shape: 'hairline', frosted: false },
});

export type CardHoverEffect = 'gradient' | 'dotted-glow';

export interface CardProps extends ComponentPropsWithRef<'div'>, VariantProps<typeof card> {
  /**
   * The element to render. Both homepage consumers are `article`, and the
   * default stays `div` so a card that is not a self-contained composition is
   * not silently announced as one.
   */
  as?: 'div' | 'article' | 'section';
  /**
   * The accent's colour, e.g. `bg-brand-red` or a per-row gradient class.
   * Omit to render no accent — a card that is not interactive should not
   * suggest it is.
   */
  accentClassName?: string;
  /**
   * The hover light. Omit for the idiom's own — see the note above — or pass
   * `false` for a card that carries a light of its own (the CTA panel).
   */
  hoverEffect?: CardHoverEffect | false;
  /** The light's strength at full hover, 0–1. Omit for the token default. */
  hoverIntensity?: number;
}

export function Card({
  as: Element = 'div',
  ground,
  inset,
  shape,
  frosted = false,
  accentClassName,
  hoverEffect,
  hoverIntensity,
  className,
  children,
  ...props
}: CardProps) {
  const defaultEffect: CardHoverEffect | false =
    shape === 'outlined' ? 'gradient' : accentClassName !== undefined ? 'dotted-glow' : false;
  const effect = hoverEffect ?? defaultEffect;
  const tone = ground ?? 'paper';

  return (
    <Element
      className={cn(
        card({ ground, inset, shape, frosted }),
        effect !== false && 'isolate',
        className,
      )}
      {...props}
    >
      {effect === 'gradient' && <BackgroundGradient ground={tone} intensity={hoverIntensity} />}
      {effect === 'dotted-glow' && (
        <DottedGlowBackground ground={tone} intensity={hoverIntensity} />
      )}
      {effect !== false && <TouchLight />}
      {accentClassName !== undefined && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 -top-px h-rule-accent origin-left',
            'scale-x-0 transition-transform duration-(--duration-card)',
            'group-hover:scale-x-100 group-has-focus-visible:scale-x-100',
            // A tap on a touch screen fills it too, with the hover light.
            'group-data-touch-lit:scale-x-100',
            'motion-reduce:transition-none',
            accentClassName,
          )}
        />
      )}
      {children}
    </Element>
  );
}
