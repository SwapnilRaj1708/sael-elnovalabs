import type { Metadata } from 'next';
import { notificationsPage as page } from '@/app/_content/notifications';
import { loadAreaTiles, loadTilePage } from '@/app/investors/_lib/documents';
import { NotificationsPageBody } from '@/app/investors/_lib/tile-page';
import { INVESTOR_AREAS } from '@/app/investors/_lib/tile-routes';
import { buildMetadata } from '@/lib/seo/metadata';

const AREA = INVESTOR_AREAS.notifications;

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  // `trailingSlash: true`, and this is the legacy URL exactly. /CLAUDE.md §2 rule 6.
  path: page.path,
});

/**
 * Notifications — the company's notices to investors, by financial year.
 *
 * **The section's one tile, `notifications`, is this page**: its documents
 * under the headings the backend gives — one per financial year, newest
 * first, with anchors (`#fy2026`) that are the legacy tab ids. On the
 * investor template with the ripple band, but **no side list**: the legacy
 * page is a page on its own, not part of an area. **Not gated**, as on the
 * legacy page — unless the backend gates the tile.
 *
 * The section's tiles are listed too, though only the one is shown, so that
 * a second tile — which would have no page — is reported by
 * `loadAreaTiles` rather than sitting unseen. With the tile not live, the
 * page says nothing is published rather than 404ing at a legacy URL. The
 * page is `<NotificationsPageBody>`, which its Live Preview renders too.
 *
 * A Server Component; the ripple band is the one client leaf.
 */
export default async function NotificationsPage() {
  const [tilePage] = await Promise.all([
    loadTilePage(AREA.section, AREA.sectionTile),
    loadAreaTiles(AREA.section),
  ]);

  return <NotificationsPageBody tilePage={tilePage} />;
}
