import type { Metadata } from 'next';
import { OFFER_DOCUMENTS_PATH, offerDocumentsIndex } from '@/app/_content/offer-documents';
import { AreaIndex } from '@/app/investors/_lib/area-index';
import { loadAreaTiles } from '@/app/investors/_lib/documents';
import { areaPages } from '@/app/investors/_lib/tile-page';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: offerDocumentsIndex.meta.title,
  description: offerDocumentsIndex.meta.description,
  // `trailingSlash: true`, and the legacy URL is `/investors/offer-documents/`.
  // /CLAUDE.md §2 rule 6.
  path: OFFER_DOCUMENTS_PATH,
});

/**
 * Offer Documents — the area's index: **a tile for each live tile the
 * backend serves, in the panel's order**, each linking to its page and not
 * to a file. A tile a maker adds and publishes appears here without a
 * release; a tile whose address the site does not serve is refused by
 * `loadAreaTiles` rather than linked.
 *
 * With the ripple masthead: the title centred over `<BackgroundRipple>` in a
 * band across the top half of the screen, in place of the legacy banner —
 * the client's ask of 2026-09-29. Every sub-page opens the same way, with
 * its own name in the band. The page is `<AreaIndex>`, which its Live
 * Preview renders too.
 */
export default async function InvestorsOfferDocumentsPage() {
  const pages = areaPages('offer-documents', await loadAreaTiles('offer-documents'));
  return <AreaIndex section="offer-documents" pages={pages} />;
}
