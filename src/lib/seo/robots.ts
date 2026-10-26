import type { MetadataRoute } from 'next';
import { PRODUCTION_URL } from '../config/production-origin.ts';
import { PREVIEW_PAGES } from '../preview/pages.ts';

/**
 * The `robots.txt` for a build, from the decision the root layout makes for `noindex`
 * (`isPublicSite`, src/lib/config/site.ts). It is passed in rather than read here, so this module
 * reads no environment and the test can ask for both builds.
 *
 * Relative imports with `.ts`, unlike the rest of `src/`, so that `node --test` can load this
 * file without the `@/` alias.
 */

/**
 * Paths no crawler needs on the production site: the admin panel and the backend's API, both
 * behind the same nginx, this site's own route handlers, and every Live Preview section. The
 * preview pages are `noindex` already (next.config.ts, `headers()`); this keeps crawlers from
 * fetching them at all.
 */
export const DISALLOWED_PATHS: readonly string[] = [
  '/admin/',
  '/app/v1/',
  '/api/',
  ...PREVIEW_PAGES.map((page) => page.root),
];

export function robotsFor(isPublicSite: boolean): MetadataRoute.Robots {
  if (!isPublicSite) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...DISALLOWED_PATHS] },
    sitemap: new URL('/sitemap.xml', PRODUCTION_URL).href,
  };
}
