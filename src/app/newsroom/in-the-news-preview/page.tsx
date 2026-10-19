import type { Metadata } from 'next';
import { newsroomSections } from '@/app/_content/newsroom';
import { previewMetadata, type SearchParams } from '@/app/_lib/preview';
import { NewsListingPreview } from '@/app/newsroom/_lib/preview-pages';

const section = newsroomSections['in-the-news'];

/**
 * **Rendered on every request, and never cached.** A preview is a draft
 * served to whoever holds the session; a cached render of it would be served
 * to the next visitor with no session at all. The cookie read alone would make
 * the route dynamic, but that is an inference about Next's heuristics, and
 * this must not depend on one. The repository fetches `no-store` as well.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = previewMetadata(section.name);

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * The In The News listing's preview — where the admin panel's Live Preview
 * button on an In The News record sends the reviewer. **The same
 * `<NewsListing>` as `/newsroom/in-the-news/`**, with the section's items in
 * their most recent state. Each card opens the publication that ran the piece,
 * as on live: In The News has no pages of its own, and no detail preview.
 */
export default async function InTheNewsPreviewPage({ searchParams }: PageProps) {
  return <NewsListingPreview category={section.category} searchParams={await searchParams} />;
}
