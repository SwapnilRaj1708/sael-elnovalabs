import type { NextConfig } from 'next';

/**
 * How `src/proxy.ts` hands a request to another route of this site without it
 * leaving the server: the routing-miss for a missing article or tile, and the
 * preview session handler for a Live Preview link.
 *
 * **Imported by `next.config.ts` and `src/proxy.ts`, so it imports nothing at
 * runtime.**
 *
 * **Why not `NextResponse.rewrite()`.** A proxy rewrite takes an absolute URL,
 * and Next 16.3 treats it as internal only when its origin equals the
 * server's own, which Next builds from `HOSTNAME`. But Next shows the proxy
 * any loopback host as `localhost`: in `request.url`, in `request.nextUrl` and
 * its clones, and again when it re-reads the rewrite's destination. With
 * `HOSTNAME=127.0.0.1`, as the VM runs it, the two origins never agree, so
 * every rewrite was proxied as an *external* request to
 * `https://localhost:3000` — `https` from nginx's `X-Forwarded-Proto` — a TLS
 * handshake against a plain-HTTP port, and a 500. Over plain HTTP the same
 * mismatch went unseen, because the server proxied the request back to
 * itself and that worked. Found on prod2-preview, 2026-10-05.
 *
 * **Instead, the proxy marks the request** with {@link INTERNAL_REWRITE_HEADER}
 * and lets it continue; a `beforeFiles` rewrite in `next.config.ts`, which runs
 * after the proxy and sees the headers it set, sends it on. A config rewrite's
 * destination is a path, so it stays internal whatever the host, port or
 * protocol. `pnpm verify:guardrails` keeps `NextResponse.rewrite()` out of
 * `src/`.
 *
 * **The header steers nothing for a client that sends it.** The proxy removes
 * it from every request it handles before deciding. On any other path it can
 * only send the client's own request to a 404, or to the preview handler,
 * which is a public URL that checks everything again.
 */
export const INTERNAL_REWRITE_HEADER = 'x-sael-internal-rewrite';

/**
 * A path no route matches, so Next serves the root not-found page with a 404
 * and `Cache-Control: private, no-store`. Not `/_not-found/`: that is the
 * page's own static route and answers `s-maxage=31536000`, which any shared
 * cache in front of the site would hold for a year, for a slug that may be
 * published tomorrow.
 */
export const NOT_FOUND_PATH = '/__not-found__/';

/** The preview session handler, `app/api/preview/route.ts`. */
export const PREVIEW_HANDLER_PATH = '/api/preview/';

/**
 * Where the proxy sends a request:
 *
 *  - `not-found` — the routing-miss, so the root not-found page is rendered
 *    in full on the server with a 404;
 *  - `preview` — the session handler, with `path` (the preview page, with its
 *    trailing slash) as its `to`. `pt` travels in the request's own query,
 *    every value of it; the handler spends the first.
 *
 * Next 16.3 hands the handler the request's original URL, not the
 * destination, so it reads the preview page from that URL's path; `to` is
 * there for a Next that hands over the destination instead
 * (`app/api/preview/route.ts`, `previewPathOf`).
 */
export type InternalRewrite = { to: 'not-found' } | { to: 'preview'; path: string };

/** The {@link INTERNAL_REWRITE_HEADER} value that asks for `rewrite`. */
export function internalRewriteHeaderValue(rewrite: InternalRewrite): string {
  return rewrite.to === 'not-found' ? 'not-found' : `preview:${rewrite.path}`;
}

type Rewrite = Extract<Awaited<ReturnType<NonNullable<NextConfig['rewrites']>>>, unknown[]>[number];

/**
 * The `beforeFiles` rewrites that act on the header. Where the destination is
 * what Next hands over, its own `to` overrides one in the request's query.
 */
export const INTERNAL_REWRITES: Rewrite[] = [
  {
    source: '/:path*',
    has: [{ type: 'header', key: INTERNAL_REWRITE_HEADER, value: 'not-found' }],
    destination: NOT_FOUND_PATH,
  },
  {
    source: '/:path*',
    has: [{ type: 'header', key: INTERNAL_REWRITE_HEADER, value: 'preview:(?<to>/.*)' }],
    destination: `${PREVIEW_HANDLER_PATH}?to=:to`,
  },
];
