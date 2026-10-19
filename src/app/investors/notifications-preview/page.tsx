import type { Metadata } from 'next';
import { previewScreenNames } from '@/app/_content/preview';
import { previewMetadata, type SearchParams } from '@/app/_lib/preview';
import { NotificationsPreview } from '@/app/investors/_lib/preview-pages';

/**
 * **Rendered on every request, and never cached.** A preview is a draft
 * served to whoever holds the session; a cached render of it would be served
 * to the next visitor with no session at all. The cookie read alone would make
 * the route dynamic, but that is an inference about Next's heuristics, and
 * this must not depend on one. The repository fetches `no-store` as well.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = previewMetadata(previewScreenNames.DOC_NOTIFICATIONS);

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * Notifications' preview — where the admin panel's Live Preview button on a
 * notification sends the reviewer. **The same `<NotificationsPageBody>` as
 * `/investors/notifications/`**: the section's one tile is the page, so there
 * is no detail preview below it.
 */
export default async function NotificationsPreviewPage({ searchParams }: PageProps) {
  return <NotificationsPreview searchParams={await searchParams} />;
}
