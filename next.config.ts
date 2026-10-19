import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { indexingBanner } from './src/lib/config/production-origin';
import { INTERNAL_REWRITES } from './src/lib/routing/internal-rewrites';
import { REDIRECTS } from './src/lib/seo/redirects';

type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number];

/**
 * The legacy site's origin as an image source, while `LEGACY_ASSET_BASE_URL`
 * is set — the Newsroom's card and article images are served from there
 * until the client uploads them to the blob container (see .env.example).
 * Read from the environment, not written here, so no hostname is committed
 * (/CLAUDE.md §7), and confined to `/img/`, the only legacy path an image
 * comes from. Unset the variable and the pattern goes with it.
 *
 * **Read at build time**: `remotePatterns` is compiled into the build, so the
 * build must see the same value the server runs with.
 */
function legacyImagePattern(): RemotePattern[] {
  const base = process.env.LEGACY_ASSET_BASE_URL;
  if (base === undefined || base === '') return [];

  const { protocol, hostname } = new URL(base);
  return [
    {
      protocol: protocol === 'http:' ? 'http' : 'https',
      hostname,
      pathname: '/img/**',
    },
  ];
}

/**
 * `next dev` only: the local backend's media, served by Azurite at
 * `http://127.0.0.1:10000/devstoreaccount1/…` (docs/api-contracts.md §2.6).
 *
 * Gated on `NODE_ENV`, which Next sets to `development` for `next dev` and to
 * `production` for `next build`, so neither the address nor
 * `dangerouslyAllowLocalIP` can reach the standalone artefact (/CLAUDE.md §7).
 * The second is needed because Next 16 refuses to optimise an image whose
 * host is a private address, `127.0.0.1` included — the SSRF guard that must
 * stay on in production. The port is Azurite's default, which the backend's
 * Docker Compose publishes unless `SAEL_AZURITE_BLOB_PORT` moves it.
 */
const isDevServer = process.env.NODE_ENV === 'development';

function localStoragePatterns(): RemotePattern[] {
  if (!isDevServer) return [];
  return [
    { protocol: 'http', hostname: '127.0.0.1', port: '10000', pathname: '/devstoreaccount1/**' },
  ];
}

/**
 * `next dev` only: `/app/v1/` on the dev server, sent on to `API_BASE_URL`.
 *
 * The contact form calls the backend from the browser at relative
 * `/app/v1/…` URLs (docs/api-contracts.md §8). In production nginx routes
 * those to the backend on the same host, ahead of Next, so this rewrite does
 * not exist there: it is gated on `NODE_ENV` like `localStoragePatterns()`,
 * and nothing is added to the build's routes. Here the browser is on :3000
 * and the backend somewhere else, so the dev server forwards the call.
 *
 * **The slash.** With `trailingSlash: true` Next first answers
 * `/app/v1/contact-enquiry` with a 308 to `/app/v1/contact-enquiry/` — which
 * keeps the method and the body — and the source must match that form. The
 * backend does not route a trailing slash, so the destination drops it.
 *
 * Every visitor through the dev server reaches the backend from one address,
 * so they share its per-IP limit. A development backend with
 * `SAEL_INTAKE_CORS_ALLOWED_ORIGINS` set must list `http://localhost:3000`,
 * because the browser's `Origin` is passed through.
 */
function devBackendRewrites() {
  const base = process.env.API_BASE_URL;
  if (!isDevServer || base === undefined || base === '') return [];
  return [{ source: '/app/v1/:path*/', destination: `${base.replace(/\/+$/, '')}/app/v1/:path*` }];
}

const nextConfig: NextConfig = {
  // `next dev` only — the LAN address a phone on the same network uses to
  // reach the dev server, which Next otherwise refuses as a cross-origin
  // request. `next build` ignores it, so nothing in the standalone artefact
  // reads it and /CLAUDE.md §7's "no hardcoded hostnames" is not in play.
  // It is one machine's address: change it, do not assume it is yours.
  allowedDevOrigins: ['192.168.0.156'],
  // Standalone output is the deployment artefact: `.next/standalone/server.js`
  // runs under systemd behind nginx. See docs/architecture.md §8 and /CLAUDE.md §7,
  // which requires it. It stays the default, so `pnpm build && pnpm package`
  // produces the client's archive with no environment set at all.
  //
  // `STANDALONE_OUTPUT=false` turns it off, for a host that builds its own
  // output rather than running ours. A platform-neutral switch on purpose: it
  // names what it does, not who asked for it, and nothing about the shipped
  // application changes either way.
  //
  // The concrete case is a preview deploy on Vercel, whose builder reads
  // `.next/next-server.js.nft.json` to trace server files and fails with ENOENT
  // once standalone has relocated that tree — Vercel's own guidance is not to
  // set `output` there.
  output: process.env.STANDALONE_OUTPUT === 'false' ? undefined : 'standalone',
  // URL parity with the legacy site — see docs/accessibility-and-seo.md.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowLocalIP: isDevServer,
    remotePatterns: [
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
      // YouTube's thumbnail host, for the Newsroom's Multimedia cards — a
      // fixed public endpoint, not configuration. Optimised like any other
      // image rather than served `unoptimized`. lib/utils/youtube.ts.
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
      ...legacyImagePattern(),
      ...localStoragePatterns(),
    ],
  },
  turbopack: {
    rules: {
      // SVGR, scoped to the icon folder only. Icons inherit `currentColor` and
      // so have to be components; the brand artwork in src/assets/images/ is
      // fixed-colour and stays a file for `next/image` to process. Widening
      // this to all `*.svg` would break every image import.
      // docs/asset-inventory.md §3. Types: src/types/svg.d.ts.
      './src/assets/icons/*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  async redirects() {
    // Legacy URL mappings join these in FE-22.
    return REDIRECTS;
  },
  async rewrites() {
    // Where src/proxy.ts sends a request it has marked: the routing-miss and
    // the preview session handler. Here, not in the proxy, because a proxy
    // rewrite behind nginx left the server (src/lib/routing/internal-rewrites.ts).
    return { beforeFiles: INTERNAL_REWRITES, afterFiles: devBackendRewrites(), fallback: [] };
  },
  async headers() {
    return [
      {
        // Every Live Preview page — the eight `…-preview` sections the admin
        // panel opens (docs/api-contracts.md §6.1) and the pages under them.
        // The pages' own metadata says `noindex` too; this covers whatever
        // reads the header rather than the HTML, and covers a page the moment
        // it exists. The root layout only marks non-production origins, so
        // without both a preview on the real host would be indexable.
        source: '/:area(newsroom|investors)/:section([a-z-]+-preview)/:rest*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

/**
 * Says, in every build's output, whether the build is indexable. `NEXT_PUBLIC_SITE_URL` is
 * compiled in, and every origin but `PRODUCTION_URL` gets `noindex` from the root layout, so a
 * build for the wrong host would otherwise ship a site hidden from search engines with nothing
 * reporting it. A warning, not a failure: preview builds are meant to be `noindex`. An unset or
 * malformed value prints nothing here, because src/lib/config/env.ts fails the build on it.
 *
 * `next build` loads this file more than once, in its own process and in workers that inherit its
 * environment, so the environment carries the fact that the banner has been printed.
 */
const INDEXING_ANNOUNCED = 'SAEL_BUILD_INDEXING_ANNOUNCED';

function announceIndexing(): void {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env[INDEXING_ANNOUNCED] === '1') return;
  if (siteUrl === undefined || !URL.canParse(siteUrl)) return;
  process.env[INDEXING_ANNOUNCED] = '1';
  console.warn(`\n${indexingBanner(siteUrl)}\n`);
}

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) announceIndexing();
  return nextConfig;
}
