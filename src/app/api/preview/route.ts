import { NextResponse, type NextRequest } from 'next/server';
import { isProduction } from '@/lib/config/env';
import { getContentRepository, type PreviewScreenCode } from '@/lib/content';
import {
  isDocumentNavigation,
  PREVIEW_COOKIE,
  PREVIEW_NOTICE_PARAM,
  PREVIEW_SCREEN_PARAM,
  previewPageFor,
  type PreviewNotice,
} from '@/lib/preview/pages';

/**
 * Turns a Live Preview link into a preview session. docs/api-contracts.md §6.
 *
 * The panel sends the reviewer to `/newsroom/press-release-preview/?pt=…`.
 * That path is a page, and a page cannot set a cookie, so `src/proxy.ts`
 * marks the request and `next.config.ts` rewrites it here, internally
 * (`src/lib/routing/internal-rewrites.ts`). The URL in the reviewer's address
 * bar never changes to this one.
 *
 * Here: spend `pt` once, server-side, for a session; keep the session in an
 * `HttpOnly` cookie scoped to that one preview page; and answer `303` to the
 * same path **without** `pt`, so the link leaves the address bar, the history
 * and every `Referer` the page sends. A refusal goes back to the same path
 * with {@link PREVIEW_NOTICE_PARAM} set, and the page explains it.
 *
 * **Only a real page load spends the link** (`isDocumentNavigation`): `pt` is
 * single-use, and a link unfurler or a prefetch that spent it would leave the
 * reviewer with "already used" on their first click. `src/proxy.ts` only
 * rewrites navigations; the same check runs again here because this URL can
 * also be requested directly.
 */
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
} as const;

/**
 * `303` to `path` on this site, with an optional notice. **The `Location` is
 * relative**: behind nginx, this process does not know the public host, and a
 * path is all a same-origin redirect needs.
 */
function backTo(
  path: string,
  notice?: { notice: PreviewNotice; screen?: PreviewScreenCode },
): NextResponse {
  const query = new URLSearchParams();
  if (notice !== undefined) {
    query.set(PREVIEW_NOTICE_PARAM, notice.notice);
    if (notice.screen !== undefined) query.set(PREVIEW_SCREEN_PARAM, notice.screen);
  }
  const search = query.toString();
  return new NextResponse(null, {
    status: 303,
    headers: { ...NO_STORE_HEADERS, Location: search === '' ? path : `${path}?${search}` },
  });
}

/**
 * The preview path the link was opened at. **Read two ways, because which URL
 * Next hands this handler depends on how the request arrived.** Rewritten here
 * by `next.config.ts` (`src/lib/routing/internal-rewrites.ts`), it is the
 * original one, `/newsroom/press-release-preview/?pt=…`, with whatever else
 * the client put in its query; seen in a 16.3 production build on
 * 2026-10-05. Requested directly, it is `/api/preview/?to=…&pt=…`.
 *
 * **The URL's own path wins when it is a preview page**, so a `to` in the
 * query cannot send the reviewer somewhere other than the page they opened.
 */
function previewPathOf(request: NextRequest): string {
  const { pathname, searchParams } = request.nextUrl;
  const path = previewPageFor(pathname) === null ? (searchParams.get('to') ?? pathname) : pathname;
  return path.endsWith('/') ? path : `${path}/`;
}

export async function GET(request: NextRequest): Promise<Response> {
  const to = previewPathOf(request);
  const page = previewPageFor(to);
  if (page === null) {
    return new NextResponse('Not found', { status: 404, headers: NO_STORE_HEADERS });
  }

  if (!isDocumentNavigation(request.method, request.headers)) {
    return new NextResponse('Open this link in a web browser.', {
      status: 400,
      headers: NO_STORE_HEADERS,
    });
  }

  // `.get()` is the FIRST value. The panel currently sends `?pt=X&pt=X`
  // (docs/api-contracts.md §6.1, a backend defect): the whole list would be
  // an array, which the backend refuses, and the reviewer would read that as
  // "link expired". Both values are the same token. Do not assume the defect
  // has been fixed — `.get()` is correct either way.
  const token = request.nextUrl.searchParams.get('pt') ?? '';
  if (token === '') return backTo(to, { notice: 'link-refused' });

  let exchange;
  try {
    exchange = await getContentRepository().startPreviewSession(token);
  } catch (error) {
    console.error(`[preview] Could not exchange a link for ${page.screenCode}.`, error);
    return backTo(to, { notice: 'unavailable' });
  }

  if (!exchange.ok) {
    console.info(`[preview] Link refused for ${page.screenCode}: ${exchange.code ?? 'no code'}.`);
    // Opened a second time — the link is spent, but the session it bought is
    // still in this browser. Let the page use it: if it has lapsed too, the
    // page says so.
    if (request.cookies.has(PREVIEW_COOKIE)) return backTo(to);
    return backTo(to, { notice: 'link-refused' });
  }

  const { session } = exchange;
  if (session.screenCode !== page.screenCode) {
    // Spent, and valid, but for another section. It is not stored here: under
    // this page's path it would show nothing (the backend refuses the
    // section), and it would displace a session the reviewer may still be using.
    console.warn(
      `[preview] A ${session.screenCode} link was opened at ${page.root}; not stored. ` +
        "Check the panel's preview.path-template.",
    );
    return backTo(to, { notice: 'wrong-screen', screen: session.screenCode });
  }

  const response = backTo(to);
  response.cookies.set({
    name: PREVIEW_COOKIE,
    value: session.token,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    // This page and its detail pages only: never `/`, so the cookie reaches
    // neither `/app/v1/` nor another section's preview — a second reviewer
    // link for another section does not replace this one.
    path: page.root,
    maxAge: session.expiresInSeconds,
  });
  console.info(`[preview] Session started for ${page.screenCode}.`);
  return response;
}
