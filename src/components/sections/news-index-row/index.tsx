import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export interface NewsIndexRowProps {
  /** The row's anchor and the stem of its heading's id — the section's URL segment. */
  id: string;
  /** The section's name, verbatim — "Press Release". */
  heading: string;
  /** The link to the full listing. */
  viewMore: {
    href: string;
    /** "View More", verbatim. */
    label: string;
  };
  /** The row's cards — a `<NewsGrid columns="row">`. */
  children: ReactNode;
}

/**
 * One section of the Newsroom index: its name, a "View More" link to its
 * listing, and a row of its newest cards — the legacy index's composition,
 * whose header put the heading on the left and the button on the right.
 *
 * The four "View More" links read the same, so each carries its section in
 * its accessible name ("View More: Press Release") — four identical link
 * names are a list of nothing to a screen-reader user. The visible label is
 * the legacy one.
 *
 * A Server Component.
 */
export function NewsIndexRow({ id, heading, viewMore, children }: NewsIndexRowProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className="flex flex-col gap-flow">
      <div className="flex flex-wrap items-center justify-between gap-stack">
        <h2 id={headingId} className="text-h2 text-white">
          {heading}
        </h2>

        <Button href={viewMore.href} variant="onDark" size="sm">
          {viewMore.label}
          <span className="sr-only">: {heading}</span>
        </Button>
      </div>

      {children}
    </section>
  );
}
