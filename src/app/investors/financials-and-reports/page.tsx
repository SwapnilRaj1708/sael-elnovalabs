import type { Metadata } from 'next';
import { FINANCIALS_PATH, financialsIndex } from '@/app/_content/financials-and-reports';
import { AreaIndex } from '@/app/investors/_lib/area-index';
import { loadAreaTiles } from '@/app/investors/_lib/documents';
import { areaPages } from '@/app/investors/_lib/tile-page';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: financialsIndex.meta.title,
  description: financialsIndex.meta.description,
  path: FINANCIALS_PATH,
});

/**
 * Financials & Reports — the area's index, on the Offer Documents template:
 * **every live tile the backend serves, in the panel's order** — five on the
 * legacy page, balanced 3 + 2 on a desktop and 2 + 2 + 1 on a tablet. The
 * page is `<AreaIndex>`, which its Live Preview renders too.
 */
export default async function FinancialsAndReportsPage() {
  const pages = areaPages('financials-and-reports', await loadAreaTiles('financials-and-reports'));
  return <AreaIndex section="financials-and-reports" pages={pages} />;
}
