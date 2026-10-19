import type { InvestorSection } from '@/lib/content';

/**
 * The cache tags the revalidation webhook expires beside the paths it is
 * sent. docs/api-contracts.md §7.1.
 *
 * **Why a tag and not more paths.** Every page of an investor section —
 * its index, each tile's page, Corporate Governance's two static pages —
 * renders the section's tile list in its side list or its grid. The backend
 * names only the section's index and the one tile that changed, so a tile
 * created, retitled, reordered, unpublished or deleted stayed missing or
 * stale on every *sibling* page until that page's own five-minute
 * regeneration. The tile-list fetch carries {@link investorTilesTag}, and
 * Next records a fetch's tags on every page rendered from it, so expiring
 * the one tag expires every page that shows the list — including tile pages
 * created after the build and pages the backend does not know exist.
 */

/**
 * Each investor section's address: the backend's `section.basePath`, which
 * it sends in `paths` for every tile and document event of the section.
 * `INVESTOR_AREAS` reads its paths from here, and `loadAreaTiles` checks
 * every live tile's `sectionPath` against them, so a backend that files a
 * section elsewhere fails the build rather than missing its tag.
 */
export const INVESTOR_SECTION_PATHS: Readonly<Record<InvestorSection, string>> = {
  'offer-documents': '/investors/offer-documents/',
  'corporate-governance': '/investors/corporate-governance/',
  'financials-and-reports': '/investors/financials-and-reports/',
  notifications: '/investors/notifications/',
};

/** The tag on one section's live tile-list fetch, `GET /app/v1/documents-live?section=…`. */
export function investorTilesTag(section: InvestorSection): string {
  return `investor-tiles:${section}`;
}

/**
 * The tags to expire for a webhook's `paths`: the tile-list tag of every
 * investor section one of the paths lies in.
 *
 * **Read from `paths`, not `screenCode`**, as the route reads nothing else:
 * `paths` is the one field the contract requires, and the backend puts the
 * section's own address in it for every tile and document event. A document
 * event expires the list too, although it never changes it — a handful of
 * extra pages regenerated, against a decision about which events can change
 * a tile's title, order or presence that the payload cannot support.
 */
export function revalidationTagsFor(paths: readonly string[]): string[] {
  const withSlash = paths.map((path) => (path.endsWith('/') ? path : `${path}/`));
  return (Object.keys(INVESTOR_SECTION_PATHS) as InvestorSection[])
    .filter((section) => withSlash.some((path) => path.startsWith(INVESTOR_SECTION_PATHS[section])))
    .map(investorTilesTag);
}
