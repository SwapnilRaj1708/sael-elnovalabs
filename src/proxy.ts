import { NextResponse, type NextRequest } from 'next/server';
import { INVESTOR_AREAS } from '@/app/investors/_lib/tile-routes';
import {
  getContentRepository,
  type InvestorSection,
  type NewsArticleCategory,
} from '@/lib/content';
import { isDocumentNavigation, previewPageFor } from '@/lib/preview/pages';
import {
  INTERNAL_REWRITE_HEADER,
  internalRewriteHeaderValue,
  type InternalRewrite,
} from '@/lib/routing/internal-rewrites';

/**
 * Answers a request for an article, or an investor tile, that does not exist
 * with the root not-found page, **before** its `[slug]` route renders. Also
 * hands a Live Preview link to the preview session handler — see
 * {@link previewRequest}, which runs first.
 *
 * **It never rewrites itself.** It marks the request and `next.config.ts`
 * routes it ({@link internally}); a `NextResponse.rewrite()` from here left the
 * server behind nginx. `src/lib/routing/internal-rewrites.ts` has why.
 *
 * **Why here and not in the page.** A `notFound()` thrown while a page
 * renders reaches the visitor, in Next 16.3, as a 404 whose HTML body is
 * empty: Next sets the status only on its error-recovery path, and that path
 * serves a bare shell that only JavaScript fills. A routing miss is served
 * the prerendered not-found page instead, fully rendered, with a 404. So an
 * unknown slug is turned into a routing miss here. Next's own guidance
 * (docs: loading.js, Status Codes) is the same.
 *
 * **It also means an unknown slug is never cached.** Before, the 404 the
 * page rendered was stored as ISR for its whole window, so an article
 * requested before its publish stayed missing after it.
 *
 * **Fails open.** If the backend cannot answer, the request goes on to the
 * page exactly as it would without this check: a cached page is still
 * served, and the page itself still calls `notFound()` for a missing
 * article. The check is `HEAD`, uncached, and capped well below a render's
 * timeout, because it runs on every article request, cache hits included.
 */

const ARTICLE = /^\/newsroom\/(press-release|our-views)\/([^/]+)\/?$/;

/**
 * A tile page under one of the three areas with a `[slug]` route. Their
 * static pages (Board of Directors, Board Committees) are not tiles and are
 * let through untouched; `tile-routes.ts` is the one list of them.
 */
const TILE =
  /^\/investors\/(offer-documents|corporate-governance|financials-and-reports)\/([^/]+)\/?$/;

/** Whether the request is for a tile, and if so which — `null` for anything else. */
function tileOf(pathname: string): { section: InvestorSection; slug: string } | null {
  const match = TILE.exec(pathname);
  if (match === null) return null;
  const section = match[1] as Exclude<InvestorSection, 'notifications'>;
  const slug = decodeURIComponent(match[2] ?? '');
  const staticPages: readonly string[] = INVESTOR_AREAS[section].staticPages;
  return staticPages.includes(slug) ? null : { section, slug };
}

/** Whether what the request names exists — `null` when it names nothing this checks. */
function exists(pathname: string): Promise<boolean> | null {
  const article = ARTICLE.exec(pathname);
  if (article !== null) {
    return getContentRepository().hasNewsArticle(
      article[1] as NewsArticleCategory,
      decodeURIComponent(article[2] ?? ''),
    );
  }
  const tile = tileOf(pathname);
  return tile === null ? null : getContentRepository().hasInvestorTile(tile.section, tile.slug);
}

/**
 * The request goes on to `rewrite`'s route, inside this server: the header
 * marks it, and a `beforeFiles` rewrite in `next.config.ts` acts on the mark.
 */
function internally(request: NextRequest, rewrite: InternalRewrite): NextResponse {
  const headers = new Headers(request.headers);
  headers.set(INTERNAL_REWRITE_HEADER, internalRewriteHeaderValue(rewrite));
  return NextResponse.next({ request: { headers } });
}

/**
 * The request goes on to its own route. A mark the client sent is removed,
 * so only this proxy ever routes with it.
 */
function onward(request: NextRequest): NextResponse {
  if (!request.headers.has(INTERNAL_REWRITE_HEADER)) return NextResponse.next();
  const headers = new Headers(request.headers);
  headers.delete(INTERNAL_REWRITE_HEADER);
  return NextResponse.next({ request: { headers } });
}

/**
 * A preview page opened from a Live Preview link: a real page load carrying
 * `pt` is handed to the session route handler (`app/api/preview/route.ts`),
 * which spends it and redirects back here without it. The hand-over is
 * internal; the address bar does not change.
 *
 * Anything else on a preview path goes straight to the page — **including a
 * `pt` that arrives in a request that is not a navigation**, such as a link
 * unfurler's, which must not spend the reviewer's single-use link. The page
 * then shows its "open the link from the panel" message.
 *
 * **Never the existence check.** That asks the *live* API whether an article
 * is published, and a draft's preview page exists precisely because it is not.
 */
function previewRequest(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  if (previewPageFor(pathname) === null) return null;

  if (!searchParams.has('pt') || !isDocumentNavigation(request.method, request.headers)) {
    return onward(request);
  }

  // `pt` stays in the query, every value of it; the handler spends the first
  // (the panel sends it twice — app/api/preview/route.ts).
  return internally(request, {
    to: 'preview',
    path: pathname.endsWith('/') ? pathname : `${pathname}/`,
  });
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const preview = previewRequest(request);
  if (preview !== null) return preview;

  const check = exists(request.nextUrl.pathname);
  if (check === null) return onward(request);

  try {
    return (await check) ? onward(request) : internally(request, { to: 'not-found' });
  } catch (error) {
    console.error(`[proxy] Could not check ${request.nextUrl.pathname}; serving the page.`, error);
    return onward(request);
  }
}

/**
 * **No trailing slash on a matcher**, though every URL here has one. Under
 * `next dev`, Next 16.3 matches the request's path as received, slash and all,
 * and then matches again in the render server against the path with its
 * slash removed (`handleCatchallMiddlewareRequest`). A pattern ending in `/`
 * passes the first test and fails the second. The proxy never runs, and the
 * response is a 200 with an empty body and no log line. Without the slash,
 * both tests pass, in development and in a production build alike.
 */
export const config = {
  matcher: [
    // Preview pages — each entry in lib/preview/pages.ts, and its `:slug`
    // exactly when it has detail pages. `pnpm verify:guardrails` checks the two
    // lists agree, with the route files.
    '/newsroom/press-release-preview',
    '/newsroom/press-release-preview/:slug',
    '/newsroom/in-the-news-preview',
    '/newsroom/our-views-preview',
    '/newsroom/our-views-preview/:slug',
    '/newsroom/multimedia-preview',
    '/investors/offer-documents-preview',
    '/investors/offer-documents-preview/:slug',
    '/investors/corporate-governance-preview',
    '/investors/corporate-governance-preview/:slug',
    '/investors/financials-and-reports-preview',
    '/investors/financials-and-reports-preview/:slug',
    '/investors/notifications-preview',
    '/newsroom/press-release/:slug',
    '/newsroom/our-views/:slug',
    '/investors/offer-documents/:slug',
    '/investors/corporate-governance/:slug',
    '/investors/financials-and-reports/:slug',
  ],
};
