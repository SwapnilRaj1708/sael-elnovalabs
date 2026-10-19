import type { Metadata } from 'next';
import { previewScreenNames } from '@/app/_content/preview';
import { previewMetadata } from '@/app/_lib/preview';
import { TilePagePreview } from '@/app/investors/_lib/preview-pages';

/** Never cached — see the index's preview page. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = previewMetadata(previewScreenNames.DOC_CORPORATE_GOVERNANCE);

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * One Corporate Governance tile's preview, reached from the index's preview. **The
 * same `<TilePage>` as `/investors/corporate-governance/{slug}/`**, with the tile and its
 * documents in their most recent state, and its gate, if it has one, exactly
 * as a visitor will meet it.
 */
export default async function CorporateGovernanceTilePreviewPage({ params }: PageProps) {
  return <TilePagePreview section="corporate-governance" slug={(await params).slug} />;
}
