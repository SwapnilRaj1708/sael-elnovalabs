import type { Metadata } from 'next';
import { previewScreenNames } from '@/app/_content/preview';
import { previewMetadata, type SearchParams } from '@/app/_lib/preview';
import { AreaIndexPreview } from '@/app/investors/_lib/preview-pages';

/**
 * **Rendered on every request, and never cached.** A preview is a draft
 * served to whoever holds the session; a cached render of it would be served
 * to the next visitor with no session at all. The cookie read alone would make
 * the route dynamic, but that is an inference about Next's heuristics, and
 * this must not depend on one. The repository fetches `no-store` as well.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = previewMetadata(previewScreenNames.DOC_FINANCIALS_REPORTS);

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * The Financials & Reports index's preview — where the admin panel's Live Preview
 * button on any Financials & Reports tile or document sends the reviewer. **The same
 * `<AreaIndex>` as `/investors/financials-and-reports/`**, with the section's tiles in their
 * most recent state, each opening its tile's preview.
 */
export default async function FinancialsAndReportsPreviewPage({ searchParams }: PageProps) {
  return <AreaIndexPreview section="financials-and-reports" searchParams={await searchParams} />;
}
