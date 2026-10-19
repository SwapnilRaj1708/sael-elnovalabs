import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The page gutter, and **the only place horizontal page padding is defined.**
 *
 * No section sets its own `px-*`. A full-bleed section — the hero, the plant
 * banner, the pixel strip, the SDG marquee — opts out by not rendering a
 * Container at all, and puts one around its inner text instead.
 *
 * That rule is what keeps the left edge of every heading on the page in a
 * single vertical line at every viewport width. It is enforced:
 * `pnpm verify:guardrails` fails on a horizontal padding utility anywhere
 * else under `src/`. docs/design-guidelines.md §3.
 */
const container = cva('w-full', {
  variants: {
    size: {
      /** Gutter, edge to edge. The default for almost everything. */
      default: 'px-gutter',
      /** Gutter plus the measure cap, centred. For long-form running copy. */
      narrow: 'mx-auto max-w-(--measure) px-gutter',
      /** No gutter. For a full-bleed child that still wants the flow. */
      full: 'px-0',
    },
  },
  defaultVariants: { size: 'default' },
});

export interface ContainerProps
  extends ComponentPropsWithRef<'div'>, VariantProps<typeof container> {}

export function Container({ size, className, ...props }: ContainerProps) {
  return <div className={cn(container({ size }), className)} {...props} />;
}
