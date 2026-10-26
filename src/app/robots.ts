import type { MetadataRoute } from 'next';
import { isPublicSite } from '@/lib/config/site';
import { robotsFor } from '@/lib/seo/robots';

/**
 * `/robots.txt`. docs/features/22-seo-and-redirects.md §4.
 *
 * Decided at build time, by the same `isPublicSite` that marks every page `noindex` in the root
 * layout: a production build allows crawling and names the sitemap, any other build disallows
 * everything. Static, so it is prerendered once and never changes without a rebuild.
 */
export default function robots(): MetadataRoute.Robots {
  return robotsFor(isPublicSite);
}
