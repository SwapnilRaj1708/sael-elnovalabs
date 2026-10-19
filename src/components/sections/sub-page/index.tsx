import type { ReactNode } from 'react';
import { RippleHero } from '@/components/sections/ripple-hero';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import type { BreadcrumbTrailItem } from '@/lib/seo/json-ld';
import { cn } from '@/lib/utils/cn';
import { SubPageNav, type SubPageNavProps } from './sub-page-nav';

export type { SubPageNavItem, SubPageNavProps } from './sub-page-nav';

export interface SubPageProps {
  /** The page's single `<h1>`, verbatim. */
  title: string;
  /**
   * Root first, current page last. See `<Breadcrumb>`. Optional: the Offer
   * Documents pages dropped theirs on 2026-09-29 at the client's request, as
   * About Us did on 2026-09-17. Pass it to bring the trail back.
   */
  breadcrumb?: readonly BreadcrumbTrailItem[];
  /**
   * The area's other pages, shown beside the content from `lg` and after it
   * below. Omit on an area's index, which *is* that list.
   */
  nav?: SubPageNavProps;
  /**
   * How the page opens. `plain`, the default, is the trail and `<h1>` on the
   * dotted ground above the body. `ripple` is `<RippleHero>` — the title
   * centred in a band across the top half of the screen over the ripple grid,
   * the client's ask for the Offer Documents index on 2026-09-29. Any
   * investor page can take it with this one prop.
   */
  masthead?: 'plain' | 'ripple';
  /**
   * `default` gives the body the full content width. `article` is a reading
   * layout, for a Newsroom article: the body in one centred column as wide as
   * the legal pages' (`--measure-legacy-doc`, three-quarters of the content
   * width from `lg` — the client's call of 2026-10-13, when 68ch read as too
   * narrow beside the Privacy Policy), and the `<h1>` at `--text-h2` rather
   * than display size, because an article's title is a headline of up to thirty-five
   * words and not a page name. Pass no `nav` with it — an article is read,
   * not navigated beside.
   */
  layout?: 'default' | 'article';
  /** The page's body — a document list, a notice, a table. */
  children: ReactNode;
}

/**
 * The investor page template: trail, title, body, and the area's pages.
 *
 * **Built with Offer Documents to be what every investor page is built on**
 * — Financials & Reports and its five sub-pages, Corporate Governance,
 * Notifications. It is the About Us template's counterpart for document
 * pages, and it differs from it on purpose.
 *
 * **No banner photograph.** `<PageHero>` is a full screen of image with the
 * title at its foot; on a page whose whole purpose is one PDF, that puts the
 * PDF a screen below the fold on every device. This opens the way Our Team
 * does — trail and `<h1>` on the dotted black ground — and the document is on
 * the first screen at 360px. It is also closer to the legacy page, whose
 * header is a short band with the title in it, not a photograph.
 *
 * **The area's pages on the left from `lg`**, as on the legacy site — the
 * client's call of 2026-09-29, reversing this template's first layout, which
 * put them on the right. Below `lg` they follow the content.
 *
 * **In the source, the content still comes first.** The grid places the list
 * in the left column; the DOM does not move it. On a phone, and to a screen
 * reader everywhere, the document comes before eight links to other pages —
 * which is the order a reader who came for the document needs. The cost is
 * at `lg` and up, where Tab reaches the content before the list beside it on
 * the left; the content is still reached first, which is the point.
 *
 * **No breadcrumb on the Offer Documents pages** since 2026-09-29, the
 * client's call. The trail is still built in their content file and renders
 * again if a page passes it: Home › Investors › Offer Documents › this page,
 * with its own `BreadcrumbList`. Without it the side list and the header's
 * Investors menu are the way around the area.
 *
 * `spacing="closing"` — the page's last section meets the footer's pixel
 * strip, and the standard rhythm is too little room there.
 *
 * No `-mt-header`: nothing here is full-bleed, so the masthead offsets the
 * page exactly as `<main>`'s padding already arranges. With
 * `masthead="ripple"` the band is full-bleed but still starts under the bar.
 *
 * `overflow-x-clip` on the body's section: a `<GlowFrame>` halo reaches past
 * its card, and on a phone past the screen's edge — a horizontal scroll even
 * while it is unlit. `clip`, not `hidden`, so it creates no scroll container
 * and a sticky consent bar inside still sticks.
 *
 * A Server Component. What is interactive inside `children` brings its own
 * client leaf.
 */
export function SubPage({
  title,
  breadcrumb,
  nav,
  masthead = 'plain',
  layout = 'default',
  children,
}: SubPageProps) {
  const article = layout === 'article';

  const body = (
    <div
      className={cn(
        'flex flex-col gap-y-section-y-tight',
        nav !== undefined &&
          'lg:grid lg:grid-cols-[var(--sub-page-nav-w)_minmax(0,1fr)] lg:items-start lg:gap-x-ledger-col-gap',
      )}
    >
      {/* Placed in the grid's second column from `lg`: the list takes the
          first, on the left. See the note on order above. */}
      <Reveal
        order={2}
        className={cn(
          'min-w-0 lg:col-start-2 lg:row-start-1',
          article && 'mx-auto w-full max-w-(--measure-legacy-doc) lg:w-3/4',
        )}
      >
        {children}
      </Reveal>

      {nav !== undefined && (
        <Reveal
          order={3}
          className={cn(
            'lg:col-start-1 lg:row-start-1',
            // Stays in view while the right column scrolls, clear of the
            // masthead — the same offset Contact Us's details take
            // (client, 2026-10-06). Capped to the viewport, with its own
            // scroll, so a long list can never run off the bottom unreached.
            'lg:sticky lg:top-[calc(var(--spacing-header)+var(--spacing-flow))]',
            'lg:max-h-[calc(100dvh-var(--spacing-header)-var(--spacing-flow)*2)] lg:overflow-y-auto',
          )}
        >
          <SubPageNav {...nav} />
        </Reveal>
      )}
    </div>
  );

  if (masthead === 'ripple') {
    return (
      <>
        <RippleHero
          title={title}
          breadcrumb={breadcrumb}
          titleSize={article ? 'article' : 'hero'}
        />
        <Section background="black-dots" spacing="closing" className="overflow-x-clip">
          {body}
        </Section>
      </>
    );
  }

  return (
    <Section background="black-dots" spacing="closing" className="overflow-x-clip">
      <div className="flex w-full flex-col gap-flow">
        <div className="flex flex-col gap-stack">
          {breadcrumb !== undefined && (
            <Reveal order={0}>
              <Breadcrumb items={breadcrumb} />
            </Reveal>
          )}

          <Reveal order={1}>
            {/* The measure, not --hero-measure: that 15ch cap is sized for a
                two-word title, and "Information with respect to Group
                Companies" would break into four lines under it. */}
            <h1
              className={cn(
                'text-balance text-white',
                article ? 'max-w-(--measure-article) text-h2' : 'max-w-(--measure) text-hero',
              )}
            >
              {title}
            </h1>
          </Reveal>
        </div>

        {body}
      </div>
    </Section>
  );
}
