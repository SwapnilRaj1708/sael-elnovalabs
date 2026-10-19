import type { Metadata } from 'next';
import {
  boardCommittees,
  committeeColumns,
  governancePages,
} from '@/app/_content/corporate-governance';
import { jumpLinksLabel } from '@/app/_content/investors';
import { loadAreaTiles } from '@/app/investors/_lib/documents';
import { areaNavFor } from '@/app/investors/_lib/tile-page';
import { SubPage } from '@/components/sections/sub-page';
import { DataTable } from '@/components/ui/data-table';
import { JumpLinks } from '@/components/ui/jump-links';
import { buildMetadata } from '@/lib/seo/metadata';

const page = governancePages.boardCommittees;

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  // `trailingSlash: true`, and this is the legacy URL exactly. /CLAUDE.md §2 rule 6.
  path: page.path,
});

/**
 * Board Committees — six tables, one per committee: each member's name,
 * category and role on the committee. **Not gated**, as on the legacy page.
 *
 * Static content (`boardCommittees` in `_content/corporate-governance.ts`),
 * for the reason the board is: SAEL descoped the endpoint (backend row 5.24),
 * so a change of membership — which happens by resolution — is a release.
 * Every cell is this page's own wording — including where it spells a director
 * differently from the Board of Directors page ("Bjornar", "Kewal Kundanlal
 * Handa"); neither page corrects the other.
 *
 * Each committee is a `<DataTable>` under its own `<h2>`, with the investor
 * pages' row of jump links above — the same group pattern as the document
 * pages. Three short columns wrap at 360px without scrolling sideways.
 *
 * A Server Component; the ripple band is the one client leaf.
 */
export default async function BoardCommitteesPage() {
  // The side list is the area's: these two pages, then the live tiles. The
  // tiles are the one thing on this page the backend serves.
  const tiles = await loadAreaTiles('corporate-governance');

  return (
    <SubPage
      masthead="ripple"
      title={page.name}
      nav={areaNavFor('corporate-governance', tiles, page.path)}
    >
      <div className="flex flex-col gap-flow">
        <JumpLinks
          label={jumpLinksLabel}
          links={boardCommittees.map((committee) => ({
            label: committee.name,
            href: `#${committee.id}`,
          }))}
        />

        <div className="flex flex-col gap-section-y-tight">
          {boardCommittees.map((committee) => (
            <DataTable
              key={committee.id}
              id={committee.id}
              heading={committee.name}
              columns={committeeColumns}
              rows={committee.members.map((member) => [
                member.name,
                member.category,
                member.position,
              ])}
            />
          ))}
        </div>
      </div>
    </SubPage>
  );
}
