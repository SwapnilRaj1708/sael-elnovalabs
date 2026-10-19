import { previewBanner, previewFacts } from '@/app/_content/preview';
import { incompleteBlock } from '@/app/_lib/preview';
import type { PreviewBannerProps } from '@/components/sections/preview-banner';
import type { NewsArticle, NewsItem, PreviewListing, Previewed } from '@/lib/content';

/**
 * The Newsroom's preview banners. Page code, beside `news.ts`, which is its
 * live counterpart. What every preview page shares is `app/_lib/preview.ts`.
 */

/**
 * A listing's banner: every item that is not what the public sees — a draft
 * in any state, or a deleted item — by title, and every item the page cannot
 * draw, by what it lacks. A listing where every item is already live says so.
 */
export function listingBanner({
  records,
  incomplete,
}: PreviewListing<NewsItem>): PreviewBannerProps {
  return {
    label: previewBanner.label,
    labelNote: previewBanner.labelNote,
    audience: previewBanner.audience,
    heading: previewBanner.listingHeading,
    emptyNote: previewBanner.listingNothingPending,
    rows: records
      .filter(({ preview }) => preview.isDraft)
      .map(({ record, preview }) => ({ title: record.title, facts: previewFacts(preview) })),
    incomplete: incompleteBlock(incomplete),
  };
}

/** An article's banner: its own state, whether or not it is a draft. */
export function articleBanner({ preview }: Previewed<NewsArticle>): PreviewBannerProps {
  return {
    label: previewBanner.label,
    labelNote: previewBanner.labelNote,
    audience: previewBanner.audience,
    heading: preview.isDraft ? previewBanner.articleHeading : previewBanner.articleLive,
    emptyNote: '',
    rows: [{ title: null, facts: previewFacts(preview) }],
  };
}
