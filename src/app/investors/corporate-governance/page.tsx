import type { Metadata } from 'next';
import { GOVERNANCE_PATH, governanceIndex } from '@/app/_content/corporate-governance';
import { AreaIndex } from '@/app/investors/_lib/area-index';
import { loadAreaTiles } from '@/app/investors/_lib/documents';
import { areaPages } from '@/app/investors/_lib/tile-page';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: governanceIndex.meta.title,
  description: governanceIndex.meta.description,
  path: GOVERNANCE_PATH,
});

/**
 * Corporate Governance — the area's index, on the Offer Documents template:
 * Board of Directors and Board Committees first, as on the legacy page —
 * static pages, not tiles in the backend — then **every live tile the
 * backend serves, in the panel's order**. Eight fall 4 × 2 on a desktop, as
 * Offer Documents' do. The page is `<AreaIndex>`, which its Live Preview
 * renders too.
 */
export default async function CorporateGovernancePage() {
  const pages = areaPages('corporate-governance', await loadAreaTiles('corporate-governance'));
  return <AreaIndex section="corporate-governance" pages={pages} />;
}
