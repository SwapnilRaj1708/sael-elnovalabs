import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The small uppercase label above a section heading, with the brand gradient
 * clipped to the letterforms and a rule that draws itself underneath.
 *
 * Rendered as a `<p>` and never as a heading. It reads like a kicker, but
 * marking it up as one would put an empty level in the document outline
 * between the section heading and whatever precedes it.
 *
 * The gradient-clip and its no-support fallback live in the `gradient-text`
 * utility — see globals.css. docs/design-guidelines.md §1.
 */
export type EyebrowTone = 'gradient' | 'accent' | 'bright' | 'deep';

/**
 * Which ramp is clipped to the letterforms.
 *
 * `accent` is the one flat tone in the set and stays a colour utility;
 * everything else is a gradient token consumed through `gradient-text`.
 *
 * `bright` and `deep` are the same travel at two weights — one built to sit on
 * the near-black ground, one darkened to carry on paper. They are a pair
 * because the sections they label alternate between those two grounds, and a
 * label that is legible on one is illegible on the other.
 */
const TONE_CLASS: Record<EyebrowTone, string> = {
  gradient: 'bg-(image:--gradient-eyebrow) gradient-text',
  accent: 'text-eyebrow-accent',
  bright: 'bg-(image:--gradient-eyebrow-bright) gradient-text',
  deep: 'bg-(image:--gradient-eyebrow-deep) gradient-text',
};

/**
 * The rule under the label, in the label's own ramp — so the two read as one
 * object rather than as a heading with a line under it.
 *
 * `accent` is flat and takes a colour utility; the other three take the same
 * gradient token their letterforms take. This is what "the underline matches
 * the colour theme of the title" means concretely: there is one source for
 * both, and picking a tone picks both.
 */
const RULE_CLASS: Record<EyebrowTone, string> = {
  gradient: 'bg-(image:--gradient-eyebrow)',
  accent: 'bg-eyebrow-accent',
  bright: 'bg-(image:--gradient-eyebrow-bright)',
  deep: 'bg-(image:--gradient-eyebrow-deep)',
};

export interface EyebrowProps extends ComponentPropsWithRef<'p'> {
  /**
   * `gradient` is the prototype's red→blue. `accent` is the flat purple the
   * client's earlier design used. `bright` and `deep` are `SAEL Home v2`'s
   * pair, on the black ground and on paper respectively. All four are in the
   * system because all four are in use.
   */
  tone?: EyebrowTone;
  /**
   * The rule underneath, on by default.
   *
   * Default-on rather than opt-in because it is not decoration on a particular
   * section — it is what a section label looks like, and the client's
   * 2026-08-25 note asks for it on all of them. A label that wants to go
   * without has to say so, which is the right way round: the odd one out is
   * the one that should carry the justification.
   */
  underline?: boolean;
}

export function Eyebrow({
  tone = 'gradient',
  underline = true,
  className,
  children,
  ...props
}: EyebrowProps) {
  const label = (
    <p
      className={cn(
        'text-eyebrow uppercase',
        TONE_CLASS[tone],
        // A tracked uppercase run reads as one word to a screen reader unless
        // it is given somewhere to breathe; the width also keeps the gradient
        // from stretching across the whole column on a short label.
        'w-fit',
        underline ? undefined : className,
      )}
      {...props}
    >
      {children}
    </p>
  );

  if (!underline) return label;

  return (
    // `w-fit` again, and it is the whole trick: the wrapper shrinks to the
    // label, so the rule under it is exactly as wide as the text without
    // anything having to measure the text.
    <div className={cn('w-fit', className)}>
      {label}

      {/*
        Decorative — the label above it is the content, and a rule announced to
        a screen reader is noise.

        It animates from nothing to full width as its section arrives, and it
        does that in CSS off the `data-reveal` attribute `<Reveal>` already
        sets rather than by observing anything of its own. Three things follow
        from that, all of them wanted: it costs no JavaScript, it is in step
        with the label it belongs to instead of racing it, and it replays on
        every pass exactly as the reveals do. See animations.css.
      */}
      <span
        aria-hidden="true"
        className={cn('anim-underline mt-2.5 block h-rule-h w-full', RULE_CLASS[tone])}
      />
    </div>
  );
}
