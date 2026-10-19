import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Numbered pagination, driven by `searchParams`.
 *
 * A Server Component: every page is a real URL, so a result page can be
 * linked, bookmarked, shared and crawled, and the control works before any
 * JavaScript arrives. Used by the newsroom listing.
 *
 * `aria-current="page"` marks the current page. The current page is rendered
 * as a `<span>`, not a link — a link to where you already are is a dead end
 * for keyboard users and adds nothing for anyone else.
 */

/** How many numbers to show either side of the current page before eliding. */
const WINDOW = 1;

type PageItem = number | 'gap';

/** 1 … 4 5 6 … 20 — always the ends, always a window around the middle. */
function pageItems(current: number, total: number): PageItem[] {
  const pages = new Set<number>([1, total]);

  for (let page = current - WINDOW; page <= current + WINDOW; page++) {
    if (page >= 1 && page <= total) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];

  for (const [index, page] of sorted.entries()) {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) items.push('gap');
    items.push(page);
  }

  return items;
}

export interface PaginationProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  currentPage: number;
  totalPages: number;
  /** The listing's path, e.g. `'/newsroom/'`. */
  basePath: string;
  /** Query parameters to preserve across pages — filters, search terms. */
  searchParams?: Readonly<Record<string, string | undefined>>;
  /** The page query parameter's name. */
  pageParam?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
  pageParam = 'page',
  className,
  ...props
}: PaginationProps) {
  // Nothing to paginate. Render nothing rather than a lone disabled "1".
  if (totalPages <= 1) return null;

  const page = Math.min(Math.max(Math.round(currentPage), 1), totalPages);

  const hrefFor = (target: number): string => {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== pageParam && value !== undefined && value !== '') query.set(key, value);
    }

    // Page 1 is the canonical listing URL. Emitting `?page=1` would create a
    // second URL for identical content — docs/accessibility-and-seo.md.
    if (target > 1) query.set(pageParam, String(target));

    const suffix = query.toString();
    return suffix === '' ? basePath : `${basePath}?${suffix}`;
  };

  const stepClasses = cn(
    'inline-flex items-center justify-center gap-1',
    'min-h-touch min-w-touch px-3',
    'transition-colors duration-(--duration-micro)',
  );

  return (
    <nav aria-label="Pagination" className={cn('flex justify-center', className)} {...props}>
      <ul className="flex list-none flex-wrap items-center gap-1">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              rel="prev"
              className={cn(stepClasses, 'hover:text-accent-hover')}
            >
              <ChevronLeft className="size-4" aria-hidden="true" focusable="false" />
              Previous
            </Link>
          ) : (
            <span className={cn(stepClasses, 'text-inert')} aria-hidden="true">
              <ChevronLeft className="size-4" focusable="false" />
              Previous
            </span>
          )}
        </li>

        {pageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            // A gap has no identity beyond its position, so the index is the
            // only honest key available.
            <li key={`gap-${String(index)}`} aria-hidden="true" className="px-2">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span
                  aria-current="page"
                  className={cn(
                    'inline-flex items-center justify-center',
                    'min-h-touch min-w-touch',
                    'bg-brand-red text-white',
                  )}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={hrefFor(item)}
                  className={cn(
                    'inline-flex items-center justify-center',
                    'min-h-touch min-w-touch',
                    'transition-colors duration-(--duration-micro) hover:text-accent-hover',
                  )}
                >
                  <span className="sr-only">Page </span>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              rel="next"
              className={cn(stepClasses, 'hover:text-accent-hover')}
            >
              Next
              <ChevronRight className="size-4" aria-hidden="true" focusable="false" />
            </Link>
          ) : (
            <span className={cn(stepClasses, 'text-inert')} aria-hidden="true">
              Next
              <ChevronRight className="size-4" focusable="false" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
