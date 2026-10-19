import type { Metadata } from 'next';
import { newsroomSections } from '@/app/_content/newsroom';
import { previewMetadata, type SearchParams } from '@/app/_lib/preview';
import { NewsListingPreview } from '@/app/newsroom/_lib/preview-pages';

const section = newsroomSections['press-release'];

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
 * The Press Release listing's preview — where the admin panel's Live Preview
 * button on a Press Release record sends the reviewer. **The same
 * `<NewsListing>` as `/newsroom/press-release/`**, with the section's items in
 * their most recent state. Each card opens its article's preview.
 */
export default async function PressReleasePreviewPage({ searchParams }: PageProps) {
  return <NewsListingPreview category={section.category} searchParams={await searchParams} />;
}
