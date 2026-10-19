import type { Metadata } from 'next';
import {
  newsCardLabels,
  newsEmpty,
  newsroomNav,
  type NewsroomSection,
} from '@/app/_content/newsroom';
import { NewsGrid } from '@/components/sections/news-grid';
import { SubPage } from '@/components/sections/sub-page';
import type { NewsItem } from '@/lib/content';
import { buildMetadata } from '@/lib/seo/metadata';
import { loadNewsItems } from './news';

/** A listing's metadata: the legacy `<title>`, and its own path as the canonical. */
export function listingMetadata(section: NewsroomSection): Metadata {
  return buildMetadata({
    title: section.meta.title,
    description: section.meta.description,
    path: section.path,
  });
}

export interface NewsListingPageProps {
  section: NewsroomSection;
}

/**
 * A live listing: the section's published items, rendered by
 * {@link NewsListing}. The four live listing routes are this.
 */
export async function NewsListingPage({ section }: NewsListingPageProps) {
  const items = await loadNewsItems(section.category);
  return <NewsListing section={section} items={items} />;
}

export interface NewsListingProps {
  section: NewsroomSection;
  items: readonly NewsItem[];
  /** Bypass the image optimiser. Every preview page sets it; no live page does. */
  unoptimizedImages?: boolean;
}

/**
 * One Newsroom section's listing — the four listing routes render the same
 * page, so it is written once, here, beside them. **So does each one's
 * preview** (`/newsroom/press-release-preview/`): what a reviewer approves is
 * drawn by the markup that will publish it, and only the items differ. Never
 * fork it for a preview — a preview that has drifted from the live page is
 * worse than none, because the checker approves something that then publishes
 * differently.
 *
 * The investor template, as every Newsroom page has: the ripple band with
 * the section's name as the `<h1>`, no breadcrumb, and the area's side list
 * — the legacy tab row of the four sections — on the left from `lg`. Every
 * item is on the one page, as on the legacy site: no paging, and so no new
 * URLs.
 *
 * Cards are `<h2>`s, straight under the `<h1>`.
 */
export function NewsListing({ section, items, unoptimizedImages = false }: NewsListingProps) {
  return (
    <SubPage masthead="ripple" title={section.name} nav={newsroomNav(section)}>
      <NewsGrid
        items={items}
        label={section.name}
        headingLevel="h2"
        columns="listing"
        labels={newsCardLabels}
        empty={newsEmpty}
        unoptimizedImages={unoptimizedImages}
      />
    </SubPage>
  );
}
