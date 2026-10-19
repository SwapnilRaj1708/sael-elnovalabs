import { notFound } from 'next/navigation';
import { newsroomSections } from '@/app/_content/newsroom';
import { incompleteMessage, previewLiveLinkLabel, previewMessages } from '@/app/_content/preview';
import {
  noticeMessage,
  previewSessionToken,
  refusalMessage,
  type SearchParams,
} from '@/app/_lib/preview';
import { NewsArticlePage } from '@/app/newsroom/_lib/article-page';
import { NewsListing } from '@/app/newsroom/_lib/listing-page';
import { articleBanner, listingBanner } from '@/app/newsroom/_lib/news-preview';
import { PreviewBanner } from '@/components/sections/preview-banner';
import { PreviewMessage } from '@/components/sections/preview-message';
import {
  getContentRepository,
  newsPreviewListingPath,
  type NewsArticleCategory,
  type NewsCategory,
} from '@/lib/content';

/**
 * The Newsroom's preview pages, written once for its four sections — the
 * `…-preview` route files are each a few lines around one of these, as the
 * live routes are around `<NewsListingPage>` and `<NewsArticlePage>`.
 *
 * **Each renders the live route's own component** — `<NewsListing>`,
 * `<NewsArticlePage>` — given the section's records in their most recent
 * state rather than their published one. What a reviewer approves is drawn by
 * the markup that will publish it. Never fork either for a preview: a preview
 * that has drifted from the live page is worse than none, because the checker
 * approves something that then publishes differently.
 *
 * Three things differ, all presentational: the draft banner above, images
 * loaded straight from their (signed) URLs rather than through the optimiser,
 * and `noindex`. An article card opens its article's preview; In The News and
 * Multimedia cards open what they open live — the publication, the video —
 * since neither has a page of its own here.
 */

export interface NewsListingPreviewProps {
  category: NewsCategory;
  searchParams: SearchParams;
}

/**
 * A section's preview listing — where the admin panel's Live Preview button
 * on any record of the section sends the reviewer (docs/api-contracts.md
 * §6.1). The link's `pt` never reaches it: `src/proxy.ts` hands it to
 * `app/api/preview/route.ts`, which exchanges it and redirects here without it.
 */
export async function NewsListingPreview({ category, searchParams }: NewsListingPreviewProps) {
  const section = newsroomSections[category];
  const liveLink = { href: section.path, label: previewLiveLinkLabel(section.name) };

  const notice = noticeMessage(searchParams, section.name);
  if (notice !== null) return <PreviewMessage {...notice} liveLink={liveLink} />;

  const token = await previewSessionToken();
  if (token === null) return <PreviewMessage {...previewMessages.noSession} liveLink={liveLink} />;

  const read = await getContentRepository().getNewsPreview(category, token);
  if (!read.ok) {
    return <PreviewMessage {...refusalMessage(read, section.name)} liveLink={liveLink} />;
  }

  return (
    <>
      <PreviewBanner {...listingBanner(read.value)} />
      <NewsListing
        section={section}
        items={read.value.records.map(({ record }) => record)}
        unoptimizedImages
      />
    </>
  );
}

export interface NewsArticlePreviewProps {
  category: NewsArticleCategory;
  slug: string;
}

/**
 * One article's preview, reached from a card on its section's preview
 * listing, with its section link back to that listing. A slug the session's
 * section does not have is a 404, as on live; an article too incomplete to
 * draw says what it lacks.
 */
export async function NewsArticlePreview({ category, slug }: NewsArticlePreviewProps) {
  const section = newsroomSections[category];
  const liveLink = { href: section.path, label: previewLiveLinkLabel(section.name) };

  const token = await previewSessionToken();
  if (token === null) return <PreviewMessage {...previewMessages.noSession} liveLink={liveLink} />;

  const read = await getContentRepository().getNewsArticlePreview(category, slug, token);
  if (!read.ok) {
    return <PreviewMessage {...refusalMessage(read, section.name)} liveLink={liveLink} />;
  }
  if (read.value === null) notFound();
  if (!read.value.complete) {
    return <PreviewMessage {...incompleteMessage(read.value.record)} liveLink={liveLink} />;
  }

  return (
    <>
      <PreviewBanner {...articleBanner(read.value.value)} />
      <NewsArticlePage
        article={read.value.value.record}
        listingHref={newsPreviewListingPath(category)}
        unoptimizedImages
      />
    </>
  );
}
