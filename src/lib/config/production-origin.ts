/**
 * The one origin that may be indexed, and the decision every build makes against it.
 *
 * Anything else — a staging box, a preview VM, localhost — must serve `noindex`, because a staging
 * copy indexed under the client's brand is a launch-day incident. docs/accessibility-and-seo.md §4.
 *
 * Kept free of imports so that next.config.ts can read it too, and announce the decision in the
 * build output (see `indexingBanner`). Without that, a build for a host this file does not name
 * ships a site telling search engines to stay away, and nothing says so.
 *
 * **Choosing the apex (`https://sael.co`) instead of `www`** is a change to `PRODUCTION_URL` here,
 * then a rebuild. The rest of that change is listed in docs/accessibility-and-seo.md §4.1.
 */
export const PRODUCTION_URL = 'https://www.sael.co';

/** Compared on origin, so a trailing slash or a path cannot let a staging host through. */
export function isProductionOrigin(siteUrl: string): boolean {
  return new URL(siteUrl).origin === new URL(PRODUCTION_URL).origin;
}

/**
 * True for an origin that is not `PRODUCTION_URL` but names the same site: the apex for `www` (or
 * the reverse), `http:` for `https:`, another port. A build for one of these is almost certainly
 * meant to be the public site, and is not.
 */
function isNearMiss(siteUrl: URL): boolean {
  const production = new URL(PRODUCTION_URL);
  const bare = (host: string) => host.replace(/^www\./, '');
  return (
    siteUrl.origin !== production.origin && bare(siteUrl.hostname) === bare(production.hostname)
  );
}

/** What the build prints about indexing for `NEXT_PUBLIC_SITE_URL`. One line when indexable. */
export function indexingBanner(siteUrl: string): string {
  const url = new URL(siteUrl);
  if (isProductionOrigin(siteUrl)) {
    return `Search indexing ON: built for ${url.origin}, the production origin.`;
  }

  const lines = [
    `SEARCH INDEXING OFF. Every page of this build is marked noindex, nofollow.`,
    ``,
    `  NEXT_PUBLIC_SITE_URL  ${url.origin}`,
    `  PRODUCTION_URL        ${PRODUCTION_URL}   (src/lib/config/production-origin.ts)`,
    ``,
    `Only PRODUCTION_URL may be indexed. Right for a staging or preview build.`,
  ];
  if (isNearMiss(url)) {
    lines.push(
      ``,
      `${url.origin} is the production site under another origin. If this build is meant to`,
      `serve the public site, do not ship it: either build with NEXT_PUBLIC_SITE_URL=${PRODUCTION_URL},`,
      `or, if ${url.origin} has been chosen as canonical, change PRODUCTION_URL first`,
      `(docs/accessibility-and-seo.md §4.1).`,
    );
  }

  const width = Math.max(...lines.map((line) => line.length));
  const rule = '!'.repeat(width + 4);
  return [rule, ...lines.map((line) => `! ${line.padEnd(width)} !`), rule].join('\n');
}
