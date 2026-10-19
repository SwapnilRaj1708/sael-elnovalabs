import type { MetadataRoute } from 'next';
import { loadAreaTiles } from '@/app/investors/_lib/documents';
import { INVESTOR_AREAS } from '@/app/investors/_lib/tile-routes';
import { loadNewsItems } from '@/app/newsroom/_lib/news';
import { NAV_ITEMS, type NavItem } from '@/components/layout/header/nav-config';
import { siteConfig } from '@/lib/config/site';
import { newsListingPath, type NewsArticleCategory, type NewsCategory } from '@/lib/content';
import { LEGAL_LINKS } from '@/lib/content/static/footer';

/**
 * `/sitemap.xml` — every page the site serves for search engines to index,
 * at its canonical, trailing-slash URL. docs/features/22-seo-and-redirects.md §3.
 *
 * **Derived, not listed.** The pages come from the lists the site itself
 * renders from: the navigation, the footer's legal links, the investor areas,
 * and the live articles and tiles. A page added to one of those is in the
 * sitemap with no edit here. What is written out below is only what no list
 * holds: the homepage, the SDG page and the Newsroom's four listings.
 *
 * **Left out on purpose:** the Live Preview pages and `/dev/` (both
 * `noindex`), the API routes, and the short redirects in
 * `src/lib/seo/redirects.ts` — a sitemap lists canonical URLs, never one that
 * redirects.
 *
 * **`lastModified` only where it is true.** An article carries its
 * publication date. No other page has a date anywhere in the source, and
 * Google ignores `lastmod` on a site where it proves inaccurate, so the
 * others carry none rather than the build's time. `changeFrequency` and
 * `priority` are omitted for the same reason: Google ignores both.
 *
 * **Fails as the pages do.** The article and tile loaders throw rather than
 * return an empty list (`app/newsroom/_lib/news.ts` says why). At build time
 * that fails the build; on the running server Next keeps serving the last
 * good sitemap. With `CONTENT_SOURCE=api` the loaders' fetches are cached for
 * five minutes, so the sitemap is regenerated on that clock: an article
 * published now is listed within five minutes, with no webhook involved.
 */

/** The Newsroom's listings — each one a page, every item on it (no paging). */
const NEWS_LISTINGS = [
  'press-release',
  'in-the-news',
  'our-views',
  'multimedia',
] as const satisfies readonly NewsCategory[];

/** The two categories whose items are pages on this site. */
const ARTICLE_CATEGORIES = [
  'press-release',
  'our-views',
] as const satisfies readonly NewsArticleCategory[];

/** Every internal `href` in the navigation, children included. */
function navPaths(items: readonly NavItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.href === undefined || item.external === true ? [] : [item.href]),
    ...navPaths(item.children ?? []),
  ]);
}

/** Pages whose address is fixed in the source. */
function staticPaths(): string[] {
  const investorStaticPages = Object.values(INVESTOR_AREAS).flatMap((area) =>
    area.staticPages.map((slug) => `${area.path}${slug}/`),
  );

  return [
    '/',
    ...navPaths(NAV_ITEMS),
    '/sustainable-development-goals/',
    ...NEWS_LISTINGS.map(newsListingPath),
    ...investorStaticPages,
    ...LEGAL_LINKS.map((link) => link.href),
  ];
}

/** Every live investor tile with its own page. */
async function tileEntries(): Promise<MetadataRoute.Sitemap> {
  const areas = Object.values(INVESTOR_AREAS).filter((area) => area.pages === 'slug-route');
  const tiles = await Promise.all(areas.map((area) => loadAreaTiles(area.section)));
  return tiles.flat().map((tile) => ({ url: absolute(tile.path) }));
}

/** Every published article, dated where it has a date. */
async function articleEntries(): Promise<MetadataRoute.Sitemap> {
  const items = await Promise.all(ARTICLE_CATEGORIES.map((category) => loadNewsItems(category)));
  return items.flat().flatMap((item) =>
    item.slug === null
      ? []
      : [
          {
            url: absolute(item.href),
            ...(item.publishedAt === null ? {} : { lastModified: item.publishedAt }),
          },
        ],
  );
}

function absolute(path: string): string {
  return new URL(path, siteConfig.url).href;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tiles, articles] = await Promise.all([tileEntries(), articleEntries()]);
  const entries = [
    ...staticPaths().map((path) => ({ url: absolute(path) })),
    ...tiles,
    ...articles,
  ];

  // A page reachable from two lists — a nav link that is also an investor
  // static page, say — is listed once, where it first appears.
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
