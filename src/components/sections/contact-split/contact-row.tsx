import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ContactRowProps {
  /** The narrow column: a heading, or a caption for what is beside it. */
  aside: ReactNode;
  /** The wide column. */
  children: ReactNode;
  /** The heading inside `aside` that names the row, if it has one. */
  labelledBy?: string;
  className?: string;
}

/**
 * A row of Contact Us under the details and the form — "Join Our Online
 * Community", the office map — on **the same two columns as
 * `<ContactSplit>`** and hung from a hairline as the details' own rows are.
 *
 * That shared grid is the point, the client's ask of 2026-10-06: the page
 * should scroll as one thing, not jump between boxed sections. With every
 * row on the same 1 : 2 columns, the left edge of the address, the social
 * heading and the map's caption is one line, and so is the right edge of the
 * form, the icons and the map; the hairlines carry the eye from one row to
 * the next.
 *
 * Stacked below `lg`, the aside first.
 *
 * A Server Component.
 */
export function ContactRow({ aside, children, labelledBy, className }: ContactRowProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(
        'flex flex-col gap-stack border-t border-hairline-dark pt-flow',
        'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-ledger-col-gap',
        className,
      )}
    >
      <div className="min-w-0">{aside}</div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
