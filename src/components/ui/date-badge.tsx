import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatDate, toDateTimeAttribute } from '@/lib/utils/format-date';

/**
 * The notched gradient date chip on a news card.
 *
 * **Rebuilt in CSS, not the prototype's `date-badge.svg`.** That file stretches
 * with `preserveAspectRatio="none"`, so its 16px angled notch skews the moment
 * the date string changes length — and "Jun 1, 2026" and "December 31, 2026"
 * are different lengths. docs/design-guidelines.md §4, asset-inventory.md §4.
 *
 * Renders `<time>`, so the machine-readable instant travels with the human
 * one. The asymmetric padding is the prototype's: the notch eats into the
 * right edge, and the text needs clearance from it.
 */
export interface DateBadgeProps extends Omit<ComponentPropsWithRef<'time'>, 'children'> {
  /** An ISO 8601 string, or a Date. */
  date: string | Date;
  /**
   * `notch` is the prototype's angled chip described above. `pill` is the
   * rounded blue→green chip the client's own design uses on its news cards.
   * Both are in the system because both are in use.
   */
  variant?: 'notch' | 'pill';
}

export function DateBadge({ date, variant = 'notch', className, ...props }: DateBadgeProps) {
  const label = formatDate(date);

  // A date that would not parse renders nothing at all rather than an empty
  // gradient chip. /CLAUDE.md §6.
  if (label === '') return null;

  return (
    <time
      dateTime={toDateTimeAttribute(date)}
      className={cn(
        'inline-block w-fit',
        'text-badge text-white uppercase',
        variant === 'notch'
          ? [
              'bg-(image:--gradient-eyebrow)',
              'pt-1.5 pr-6 pb-2 pl-4',
              '[clip-path:polygon(0_0,100%_0,calc(100%-var(--badge-notch))_100%,0_100%)]',
            ]
          : ['bg-(image:--gradient-date-chip)', 'rounded-pill px-3 py-1'],
        className,
      )}
      {...props}
    >
      {label}
    </time>
  );
}
