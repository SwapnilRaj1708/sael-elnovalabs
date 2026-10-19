import type { Metadata } from 'next';
import {
  mediaContact,
  NEWSROOM_INDEX_ROW,
  newsCardLabels,
  newsEmpty,
  newsroomIndex,
  newsroomSectionList,
  sectionLinksLabel,
  viewMoreLabel,
} from '@/app/_content/newsroom';
import { MediaContact } from '@/components/sections/media-contact';
import { NewsGrid } from '@/components/sections/news-grid';
import { NewsIndexRow } from '@/components/sections/news-index-row';
import { SubPage } from '@/components/sections/sub-page';
import { JumpLinks } from '@/components/ui/jump-links';
import { buildMetadata } from '@/lib/seo/metadata';
import { loadNewsItems } from './_lib/news';

export const metadata: Metadata = buildMetadata({
  title: newsroomIndex.meta.title,
  description: newsroomIndex.meta.description,
  // `trailingSlash: true`, and the legacy URL is `/newsroom/`. /CLAUDE.md §2 rule 6.
  path: newsroomIndex.path,
});

/**
 * The Newsroom — a centred row of the four sections' names, then the four
 * sections in the legacy order, each its newest cards in a row with "View
 * More" to its listing, then the Media Contact block the legacy index ends
 * with.
 *
 * **The row is the investor pages' `<JumpLinks>`**, the client's ask of
 * 2026-10-01 — the same chips as Annual Return's year tabs, centred under the
 * centred title. Each is a link to its section's anchor (`#press-release`),
 * so a press scrolls down to it — smoothly, unless reduced motion is asked
 * for, and clear of the masthead, both by the page's own scroll settings —
 * with no script, and a section can be linked to directly.
 *
 * On `<SubPage>` with the ripple masthead and no side list, since this page
 * *is* that list — the Offer Documents index's arrangement. The four
 * sections are fetched together, and a failure in any one fails the render,
 * so that a section missing for a transient reason is never cached as empty:
 * Next keeps the last good page instead. `loadNewsItems` explains why.
 *
 * A Server Component; the ripple grid and each video card's player are the
 * client leaves.
 */
export default async function NewsroomPage() {
  const rows = await Promise.all(
    newsroomSectionList.map(async (section) => ({
      section,
      items: await loadNewsItems(section.category, NEWSROOM_INDEX_ROW),
    })),
  );

  return (
    <SubPage masthead="ripple" title={newsroomIndex.title}>
      <div className="flex flex-col gap-section-y-tight">
        <JumpLinks
          label={sectionLinksLabel}
          align="center"
          links={newsroomSectionList.map((section) => ({
            label: section.name,
            href: `#${section.category}`,
          }))}
        />

        {rows.map(({ section, items }) => (
          <NewsIndexRow
            key={section.category}
            id={section.category}
            heading={section.name}
            viewMore={{ href: section.path, label: viewMoreLabel }}
          >
            <NewsGrid
              items={items}
              label={section.name}
              headingLevel="h3"
              columns="row"
              labels={newsCardLabels}
              empty={newsEmpty}
            />
          </NewsIndexRow>
        ))}

        <MediaContact {...mediaContact} />
      </div>
    </SubPage>
  );
}
