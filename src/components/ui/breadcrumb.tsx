import Link from 'next/link';
import { breadcrumbJsonLd, type BreadcrumbTrailItem } from '@/lib/seo/json-ld';

export interface BreadcrumbProps {
  /**
   * The trail, root first, **including the current page as the last entry**.
   * The last entry is rendered as the current page and is never a link, so a
   * caller does not decide that — passing an `href` on it is simply ignored.
   */
  items: readonly BreadcrumbTrailItem[];
  className?: string;
}

/**
 * The inner-page breadcrumb: Home › Company › About Us.
 *
 * Emits its own `BreadcrumbList` JSON-LD next to the trail it describes. That
 * placement is deliberate — the root layout emits `Organization` and `WebSite`
 * because those are the same on every page, but a breadcrumb is per-page, and
 * building it from the same array that renders the links is what stops the
 * structured data and the visible trail from drifting apart.
 * docs/features/06-about-us.md, docs/accessibility-and-seo.md §3.
 *
 * **One `<li>` per rung.** The separators are `aria-hidden` spans *inside* the
 * item they follow, not list items of their own: a screen reader announcing
 * "list, five items" for a three-step trail is wrong, and hiding the two
 * spacers still leaves them counted.
 *
 * `--text-meta` is the type — §2's "uppercase metadata label", which is one of
 * the five closed uppercase roles, so this introduces no sixth.
 *
 * Dark ground only, with no tone variant, because the site is a dark-theme
 * site and every page that uses this hero is dark. docs/design-guidelines.md §8.1.
 *
 * A Server Component. Nothing here is interactive beyond the links themselves.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-tight text-meta text-on-dark-soft uppercase">
        {items.map((item, index) => {
          const isCurrent = index === lastIndex;

          return (
            <li key={item.name} className="flex items-center gap-tight">
              {isCurrent ? (
                // The current page is text, not a link to itself.
                <span aria-current="page" className="text-white">
                  {item.name}
                </span>
              ) : item.href === undefined ? (
                // A grouping rung — "Company" names a section of the site that
                // has no page of its own. Rendering it as a dead link would be
                // worse than rendering it as text.
                <span>{item.name}</span>
              ) : (
                // `focus-visible:outline-white`: this component is dark-ground
                // only (see above), and the global --color-brand-blue ring is
                // 1.84:1 there — below WCAG 1.4.11's 3.0 floor. Found while
                // building FE-07, and it applies equally to the About Us hero.
                <Link
                  href={item.href}
                  className="transition-colors hover:text-white focus-visible:outline-white"
                >
                  {item.name}
                </Link>
              )}

              {!isCurrent && (
                <span aria-hidden="true" className="text-on-dark-muted">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <script
        type="application/ld+json"
        // Built from the same typed array the trail above renders; JSON.stringify
        // is the sanctioned way to emit it. Matches app/layout.tsx.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(items)) }}
      />
    </nav>
  );
}
