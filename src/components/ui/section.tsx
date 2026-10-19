import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';
import { Container, type ContainerProps } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

/**
 * A page section: vertical rhythm, a background treatment, and the gutter.
 *
 * Wraps its children in a {@link Container} unless `fullBleed` is set, which
 * is the escape hatch for a section whose *background* must reach the viewport
 * edge — a banner image, the SDG marquee. Such a section renders its own
 * Container around whatever text it has.
 *
 * docs/design-guidelines.md §1, §3.
 */
const section = cva('relative', {
  variants: {
    background: {
      white: 'bg-surface',
      alt: 'bg-surface-alt',
      dark: 'bg-surface-dark text-body-on-dark',
      'gradient-stats': 'bg-(image:--gradient-stats) text-body-on-dark',
      /* The wash gradients sit over a base colour, so both are set. Below lg
       * the Strength section reflows to a single column and the tint has to
       * read top-to-bottom rather than right-to-left, hence the stacked
       * variant. docs/responsive-strategy.md §4. */
      'wash-strength':
        'bg-surface bg-(image:--gradient-wash-strength-stacked) lg:bg-(image:--gradient-wash-strength)',
      'wash-goals': 'bg-surface-alt bg-(image:--gradient-wash-goals)',
      /* The two grounds of `SAEL Home v2`, each carrying the same fine dot
       * grid. Colour, image and cell size travel together in one utility —
       * see `ground-dots-*` in globals.css — because the pixel strip above
       * the footer needs the same ground and is not a Section.
       *
       * `black`/`paper` are the same two grounds without the grid, for a
       * section whose own content is a full-bleed photograph and would hide
       * it anyway. */
      black: 'bg-surface-black text-body-on-dark',
      'black-dots': ['ground-dots-dark', 'text-body-on-dark'],
      paper: 'bg-paper text-ink',
      'paper-dots': ['ground-dots-paper', 'text-ink'],
    },
    spacing: {
      /** 48 → 96px. The standard. */
      default: 'py-section-y',
      /** 40 → 65px. "Our Presence", "Solutions". */
      tight: 'py-section-y-tight',
      /**
       * The standard above, 80 → 160px below. For a page's last section,
       * where the footer's pixel strip meets it with a solid edge and the
       * standard rhythm reads as too little room. Added 2026-09-22.
       */
      closing: 'pt-section-y pb-section-y-closing',
      /** For a section that owns its own vertical space, e.g. a banner. */
      none: 'py-0',
    },
  },
  defaultVariants: { background: 'white', spacing: 'default' },
});

export interface SectionProps
  extends ComponentPropsWithRef<'section'>, VariantProps<typeof section> {
  /** Skip the inner Container so the content reaches the viewport edge. */
  fullBleed?: boolean;
  /** Forwarded to the inner Container. Ignored when `fullBleed`. */
  containerSize?: ContainerProps['size'];
}

export function Section({
  background,
  spacing,
  fullBleed = false,
  containerSize,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(section({ background, spacing }), className)} {...props}>
      {fullBleed ? children : <Container size={containerSize}>{children}</Container>}
    </section>
  );
}
