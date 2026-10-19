import type { NextConfig } from 'next';

type Redirect = Awaited<ReturnType<NonNullable<NextConfig['redirects']>>>[number];

/**
 * Static redirects, returned by `redirects()` in `next.config.ts`
 * (docs/accessibility-and-seo.md, "Redirect implementation").
 *
 * **Imported by `next.config.ts`, so it imports nothing at runtime.**
 *
 * **Every source and destination ends in `/`.** Next's own slash redirect
 * (`trailingSlash: true`) runs before these, so `/governance` has already
 * become `/governance/` by the time it is matched here, and Next matches a
 * source strictly. A destination without its slash would add a third hop.
 */

/**
 * Short addresses for sections that live deeper in the site. These are new
 * addresses, not legacy ones, so they are temporary (307): browsers cache a
 * 308 indefinitely, so a target changed later would be ignored by anyone who
 * had already followed it. `/career/` was a 308 that ran into exactly that.
 */
const SHORTCUTS: Redirect[] = [
  { source: '/governance/', destination: '/investors/corporate-governance/', permanent: false },
  { source: '/financials/', destination: '/investors/financials-and-reports/', permanent: false },
  { source: '/media/', destination: '/newsroom/multimedia/', permanent: false },
  { source: '/blog/', destination: '/newsroom/our-views/', permanent: false },
];

export const REDIRECTS: Redirect[] = [...SHORTCUTS];
