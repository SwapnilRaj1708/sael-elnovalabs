import type { Metadata } from 'next';
import { boardMembers, boardTable, governancePages } from '@/app/_content/corporate-governance';
import { loadAreaTiles } from '@/app/investors/_lib/documents';
import { areaNavFor } from '@/app/investors/_lib/tile-page';
import { SubPage } from '@/components/sections/sub-page';
import { DataTable } from '@/components/ui/data-table';
import { buildMetadata } from '@/lib/seo/metadata';
import { sanitizeBio } from '@/lib/utils/sanitize-bio';

const page = governancePages.boardOfDirectors;

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  // `trailingSlash: true`, and this is the legacy URL exactly. /CLAUDE.md §2 rule 6.
  path: page.path,
});

/**
 * Board of Directors — the ten directors, each with a designation and an
 * "About" biography. **Not gated**, as on the legacy page.
 *
 * **Static content, not repository content, and not Our Team's.**
 * `boardMembers` in `_content/corporate-governance.ts` is the governance
 * record, transcribed from this page's legacy HTML. SAEL descoped the board
 * endpoint (backend row 5.24), so a change to the board is a release. Every
 * director is on /our-team/ too, with the same text today; each page keeps
 * its own copy, so a change to one cannot silently change the other.
 *
 * **On a phone.** The table is Name, Designation and a column of "+"
 * toggles, which holds at 360px with every cell wrapping and nothing
 * scrolling sideways. The biographies — up to 2,600 characters — do not go in
 * a column, where they would be a word wide: each opens in a full-width row
 * under its director, the legacy page's own "+" arrangement
 * (`<DataTable detail>`). Every biography is in the HTML from the start,
 * hidden until opened.
 *
 * Biographies are HTML — the legacy page's `<p>` and `<strong>` — and are
 * sanitised here before they render, as Our Team's are.
 *
 * A Server Component; the ripple band and the row toggles are the client
 * leaves.
 */
export default async function BoardOfDirectorsPage() {
  // The side list is the area's: these two pages, then the live tiles. The
  // tiles are the one thing on this page the backend serves.
  const tiles = await loadAreaTiles('corporate-governance');

  return (
    <SubPage
      masthead="ripple"
      title={page.name}
      nav={areaNavFor('corporate-governance', tiles, page.path)}
    >
      <DataTable
        id="board-of-directors"
        heading={boardTable.heading}
        columns={boardTable.columns}
        rows={boardMembers.map((member) => [member.name, member.designation])}
        detail={{
          column: boardTable.detailColumn,
          content: boardMembers.map((member) => {
            const bio = sanitizeBio(member.bio);
            return bio === null ? null : (
              <div
                className="rich-text max-w-(--measure) text-body-sm text-pretty text-body-on-dark"
                // Sanitised on the line above — `lib/utils/sanitize-bio.ts`
                // allows only p, br, strong, em, ul, ol, li and a.
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            );
          }),
        }}
      />
    </SubPage>
  );
}
