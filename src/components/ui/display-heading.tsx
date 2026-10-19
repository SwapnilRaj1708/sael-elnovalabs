import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The v2 section heading — `--text-display` with a gradient clipped to the
 * letterforms. docs/design-guidelines.md §4.
 *
 * **The ramp follows the ground, and that is the whole reason this exists.**
 * `--gradient-eyebrow-deep` on paper, `--gradient-heading-bright` on black.
 * Getting the pair wrong is the fastest way for a new section to look
 * off-system, and it is not something a call site can be relied on to
 * remember — note in particular that the dark heading takes
 * `--gradient-heading-bright`, *not* `--gradient-eyebrow-bright`, which is a
 * different ramp belonging to the label above it.
 *
 * Extracted 2026-08-26 (**C-2**) from `intro-split`, `solutions-carousel` and
 * `presence-map`, which had written the same three classes out by hand.
 *
 * **Deliberately not props:** the measure cap (`max-w-(--hero-measure)`) and
 * the top margin (`mt-stack`). Both vary across the three call sites because
 * they depend on what the heading sits beside — a cap keeps it clear of a
 * column, a margin spaces it under a label — and neither is a property of the
 * heading itself. They stay in `className`.
 *
 * This is **not** `ui/section-heading.tsx`, and the two are not alternatives.
 * That primitive renders eyebrow → title → description as one block, which is
 * what a page outside the homepage's reveal cascade wants. A homepage section
 * wraps each of those in its own `<Reveal order={n}>` so they arrive one after
 * another, so it needs the heading on its own — which is this.
 */
const displayHeading = cva('gradient-text text-display', {
  variants: {
    /** The section's ground. Picks the ramp; there is no other correct pairing. */
    ground: {
      paper: 'bg-(image:--gradient-eyebrow-deep)',
      dark: 'bg-(image:--gradient-heading-bright)',
    },
  },
  defaultVariants: { ground: 'paper' },
});

/**
 * A business's own mark ramp — the gradient its name takes on the homepage's
 * Business Portfolio ledger. The four business pages set every section
 * heading in their business's ramp instead of the ground's, at the client's
 * request of 2026-10-06. Their hero titles take a brightened copy of it,
 * because they sit on video; see `<PageHero>`.
 */
export type BusinessGradient = 'solar' | 'cell' | 'module' | 'agri';

export const BUSINESS_GRADIENT_CLASS: Record<BusinessGradient, string> = {
  solar: 'bg-(image:--gradient-ledger-solar)',
  cell: 'bg-(image:--gradient-ledger-cell)',
  module: 'bg-(image:--gradient-ledger-module)',
  agri: 'bg-(image:--gradient-ledger-agri)',
};

export interface DisplayHeadingProps
  extends ComponentPropsWithRef<'h2'>, VariantProps<typeof displayHeading> {
  /**
   * Heading level. `h2` by default — a section heading. Pass `h1` on the one
   * heading per page that is the page title. Level is a document-structure
   * decision and this component will not guess it: getting it wrong breaks the
   * outline a screen-reader user navigates by.
   */
  as?: 'h1' | 'h2' | 'h3';
  /** Replaces the ground's ramp with a business's. See BUSINESS_GRADIENT_CLASS. */
  business?: BusinessGradient;
}

export function DisplayHeading({
  as: Heading = 'h2',
  ground,
  business,
  className,
  children,
  ...props
}: DisplayHeadingProps) {
  return (
    <Heading
      className={cn(
        business === undefined
          ? displayHeading({ ground })
          : [
              // `w-fit` so the ramp spans the words, not the column: a
              // background is sized to the box, and a full-width box showed a
              // short heading only the first part of its ramp.
              'w-fit gradient-text text-display',
              BUSINESS_GRADIENT_CLASS[business],
              // On paper, a very slight shadow to give the bright ramp an
              // edge — a trial (2026-10-14). See --drop-shadow-heading-paper.
              // Paper unless told otherwise, as the ground's own default.
              (ground ?? 'paper') === 'paper' && 'drop-shadow-heading-paper',
            ],
        className,
      )}
      {...props}
    >
      {children}
    </Heading>
  );
}
