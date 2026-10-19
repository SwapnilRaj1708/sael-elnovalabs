import type { InvestorSection, NewsCategory, PreviewScreenCode } from '@/lib/content';

/**
 * The preview pages that exist, and the rules the proxy, the session route
 * handler and the pages share about them. docs/api-contracts.md §6.
 *
 * **Imported by `src/proxy.ts`, so it imports nothing at runtime** — no
 * environment, no repository. Only types cross the import above.
 */

/**
 * The cookie that carries a preview session, `HttpOnly`, one per preview page.
 *
 * **Not `sael_preview`.** The backend also accepts a session from a cookie of
 * that name (docs/api-contracts.md §5.1). The site and the backend share one
 * origin in production, behind one nginx, so a cookie the backend reads,
 * scoped wide enough to reach `/app/v1/`, would make the preview API callable
 * straight from the reviewer's browser. This name is the site's own, and its
 * `Path` is the preview page's root, so it reaches neither.
 */
export const PREVIEW_COOKIE = 'sael_site_preview';

/**
 * The query parameter that carries a refusal from the session route handler
 * to the page, once `pt` has been taken out of the URL. Its values are
 * {@link PreviewNotice}. Not a secret: it only chooses which message to show.
 */
export const PREVIEW_NOTICE_PARAM = 'preview';

/** With `wrong-screen`, the screen the link was actually issued for. */
export const PREVIEW_SCREEN_PARAM = 'for';

/**
 * Why a preview page has no session to show, as the route handler found it.
 *
 *  - `link-refused` — the backend would not exchange the link: expired,
 *    already used, revoked or malformed. The reviewer cannot tell these apart
 *    and does the same thing about each.
 *  - `wrong-screen` — the link is valid, but for another section.
 *  - `unavailable` — the backend could not be reached; the link may or may
 *    not have been spent.
 */
export type PreviewNotice = 'link-refused' | 'wrong-screen' | 'unavailable';

export const PREVIEW_NOTICES: readonly PreviewNotice[] = [
  'link-refused',
  'wrong-screen',
  'unavailable',
];

interface PreviewPageBase {
  screenCode: PreviewScreenCode;
  /**
   * The page's root, with its trailing slash — the path the panel opens and
   * the session cookie's `Path`.
   */
  root: string;
  /**
   * Whether the page has detail pages one segment below its root — an
   * article, a tile. In The News and Multimedia have none (their items open
   * elsewhere, and their slug is always null), and Notifications is a single
   * tile, whose page is the section's.
   */
  detail: boolean;
}

/** A Newsroom section's preview. */
export interface NewsPreviewPage extends PreviewPageBase {
  kind: 'news';
  category: NewsCategory;
}

/** An investor section's preview. */
export interface DocumentsPreviewPage extends PreviewPageBase {
  kind: 'documents';
  section: InvestorSection;
}

export type PreviewPage = NewsPreviewPage | DocumentsPreviewPage;

/**
 * **One entry per preview page that is built.** The panel opens eight
 * (docs/api-contracts.md §6.1); a screen that is not here has no page, and a
 * link to it is never exchanged — spending a reviewer's link to land them on
 * a 404 would cost them the link for nothing.
 *
 * Adding a page is three edits that must agree: an entry here, the route's
 * files (`page.tsx`, and `[slug]/page.tsx` exactly when `detail`), and its
 * literal matchers in `src/proxy.ts`'s `config` — the root, and `root/:slug`
 * exactly when `detail` — which Next requires to be written out.
 * `pnpm verify:guardrails` fails when any of the three disagree.
 */
export const PREVIEW_PAGES: readonly PreviewPage[] = [
  {
    kind: 'news',
    screenCode: 'NEWS_PRESS_RELEASE',
    root: '/newsroom/press-release-preview/',
    category: 'press-release',
    detail: true,
  },
  {
    kind: 'news',
    screenCode: 'NEWS_IN_THE_NEWS',
    root: '/newsroom/in-the-news-preview/',
    category: 'in-the-news',
    detail: false,
  },
  {
    kind: 'news',
    screenCode: 'NEWS_OUR_VIEWS',
    root: '/newsroom/our-views-preview/',
    category: 'our-views',
    detail: true,
  },
  {
    kind: 'news',
    screenCode: 'NEWS_MULTIMEDIA',
    root: '/newsroom/multimedia-preview/',
    category: 'multimedia',
    detail: false,
  },
  {
    kind: 'documents',
    screenCode: 'DOC_OFFER_DOCUMENTS',
    root: '/investors/offer-documents-preview/',
    section: 'offer-documents',
    detail: true,
  },
  {
    kind: 'documents',
    screenCode: 'DOC_CORPORATE_GOVERNANCE',
    root: '/investors/corporate-governance-preview/',
    section: 'corporate-governance',
    detail: true,
  },
  {
    kind: 'documents',
    screenCode: 'DOC_FINANCIALS_REPORTS',
    root: '/investors/financials-and-reports-preview/',
    section: 'financials-and-reports',
    detail: true,
  },
  {
    kind: 'documents',
    screenCode: 'DOC_NOTIFICATIONS',
    root: '/investors/notifications-preview/',
    section: 'notifications',
    detail: false,
  },
];

/**
 * The preview page a path belongs to — its root, or one segment below it on
 * a page with `detail` — or `null`. The slash after the root is optional,
 * because the proxy can see a path either way (`src/proxy.ts`, on matchers).
 */
export function previewPageFor(pathname: string): PreviewPage | null {
  for (const page of PREVIEW_PAGES) {
    const bare = page.root.slice(0, -1);
    if (pathname === bare || pathname === page.root) return page;
    if (page.detail && pathname.startsWith(page.root)) {
      const rest = pathname.slice(page.root.length).replace(/\/$/, '');
      if (rest !== '' && !rest.includes('/')) return page;
    }
  }
  return null;
}

export function previewPageForScreen(screenCode: PreviewScreenCode): PreviewPage | null {
  return PREVIEW_PAGES.find((page) => page.screenCode === screenCode) ?? null;
}

/** The preview page of an investor section. Every section has one. */
export function documentsPreviewPage(section: InvestorSection): DocumentsPreviewPage {
  const page = PREVIEW_PAGES.find(
    (candidate): candidate is DocumentsPreviewPage =>
      candidate.kind === 'documents' && candidate.section === section,
  );
  if (page === undefined) throw new Error(`No preview page is registered for ${section}.`);
  return page;
}

/** The preview page of a Newsroom section. Every section has one. */
export function newsPreviewPage(category: NewsCategory): NewsPreviewPage {
  const page = PREVIEW_PAGES.find(
    (candidate): candidate is NewsPreviewPage =>
      candidate.kind === 'news' && candidate.category === category,
  );
  if (page === undefined) throw new Error(`No preview page is registered for ${category}.`);
  return page;
}

/**
 * Whether a request is a person's browser loading the page — the only kind of
 * request allowed to spend a `pt`, which is single-use.
 *
 * Read from the Fetch Metadata headers every current browser sends:
 *
 *  - `Sec-Fetch-Mode: navigate` and `Sec-Fetch-Dest: document` — a top-level
 *    page load. A `<Link>` prefetch or an RSC fetch is `cors`; an `<img>`,
 *    `<iframe>` or `fetch()` has another destination.
 *  - no `Sec-Purpose` / `Purpose` of `prefetch` — the browser's own
 *    speculative loads (speculation rules, `<link rel=prefetch>`) also
 *    navigate, before anyone has clicked.
 *  - `GET` only, so a `HEAD` is never one.
 *
 * Link unfurlers (Slack, Teams, Outlook's link scanning, WhatsApp) and
 * crawlers send none of these headers, so they are not navigations and the
 * link survives them. **It fails closed**: a browser too old to send Fetch
 * Metadata (Safari before 16.4) cannot open a preview at all, rather than
 * every bot being able to spend one.
 */
export function isDocumentNavigation(method: string, headers: Headers): boolean {
  if (method !== 'GET') return false;
  if (headers.get('sec-fetch-mode') !== 'navigate') return false;
  if (headers.get('sec-fetch-dest') !== 'document') return false;
  const purpose = `${headers.get('sec-purpose') ?? ''} ${headers.get('purpose') ?? ''}`;
  return !/prefetch|prerender/i.test(purpose);
}
