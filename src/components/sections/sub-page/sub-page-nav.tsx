import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface SubPageNavItem {
  name: string;
  /** Root-relative, trailing slash included. */
  href: string;
}

export interface SubPageNavProps {
  /** The area's name, verbatim — the nav's heading and its accessible name. */
  label: string;
  /** Every page in the area, in the area's own order. */
  items: readonly SubPageNavItem[];
  /** The page being shown; its entry is marked current and is still a link. */
  currentHref: string;
}

/**
 * The list of an area's pages beside the one being read — the legacy
 * site's "Offer Documents" side panel, which every sub-page carries.
 *
 * A labelled `<nav>` with an `<h2>`, so it is a landmark a screen reader can
 * jump to and a heading it can find, and `aria-current="page"` on the entry
 * for this page. The current entry stays a link, as it is on the legacy
 * site: a reader who has scrolled the notice away can get back to the top of
 * the page with it, and a list with a hole in it reads as broken.
 *
 * The current entry is marked three ways — weight, full white, and a short
 * gradient rule at its leading edge — so the state never rests on colour
 * alone.
 *
 * A Server Component.
 */
export function SubPageNav({ label, items, currentHref }: SubPageNavProps) {
  const headingId = 'sub-page-nav-heading';

  return (
    <nav aria-labelledby={headingId} className="flex flex-col gap-stack">
      <h2 id={headingId} className="text-h3 text-white">
        {label}
      </h2>

      <ul className="flex flex-col border-t border-hairline-dark">
        {items.map((item) => {
          const current = item.href === currentHref;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-touch items-center border-b border-hairline-dark py-tight pl-inset',
                  'text-body-sm transition-colors duration-(--duration-micro)',
                  // The global ring is 1.84:1 on this ground; white is the
                  // dark surfaces' override.
                  'focus-visible:outline-white',
                  // The leading rule, drawn for the current entry only.
                  'before:absolute before:inset-y-tight before:left-0 before:w-rule-accent',
                  current
                    ? 'font-bold text-white before:bg-(image:--gradient-eyebrow-bright)'
                    : 'text-on-dark-soft hover:text-white',
                )}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
