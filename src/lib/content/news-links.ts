import { youtubeThumbnailUrl, youtubeWatchUrl } from '@/lib/utils/youtube';
import type { NewsArticleCategory, NewsCategory, NewsVideo } from './types';

/**
 * Where a news item's card goes, and the image a video card shows — resolved
 * once, in the data layer, by both adapters, so neither a component nor the
 * backend has to know the site's route shapes.
 *
 * Shared by the mock and the API adapter for the same reason `blobUrl()` is:
 * one mapping that both implementations call cannot drift between them.
 */

/** The Newsroom's root, and the root of every listing and article below it. */
export const NEWSROOM_PATH = '/newsroom/';

/** A section's listing — `/newsroom/press-release/`. */
export function newsListingPath(category: NewsCategory): string {
  return `${NEWSROOM_PATH}${category}/`;
}

/**
 * An article's page — `/newsroom/press-release/<slug>/`. The slug goes in as
 * it is: these are legacy URLs with search equity, and a slug that looks
 * wrong (`india39s`, a mangled apostrophe) is still the URL that ranks.
 */
export function newsArticlePath(category: NewsArticleCategory, slug: string): string {
  return `${newsListingPath(category)}${slug}/`;
}

/**
 * A section's **preview** listing — `/newsroom/press-release-preview/`: the
 * live listing's path with `-preview` on its last segment, as the admin
 * panel's Live Preview links open it (docs/api-contracts.md §6.1).
 */
export function newsPreviewListingPath(category: NewsCategory): string {
  return `${NEWSROOM_PATH}${category}-preview/`;
}

/** An article's preview page — `/newsroom/press-release-preview/<slug>/`. */
export function newsPreviewArticlePath(category: NewsArticleCategory, slug: string): string {
  return `${newsPreviewListingPath(category)}${slug}/`;
}

/**
 * Where a card goes **inside a preview**: an article's preview page, so a
 * reviewer who opens a draft from the listing stays on the preview session
 * and sees the draft, not the live article — which for an unpublished draft
 * does not exist. Every other card goes where it goes on the live page.
 */
export function newsPreviewItemHref(item: {
  category: NewsCategory;
  slug: string | null;
  href: string;
}): string {
  const { category, slug } = item;
  if ((category === 'press-release' || category === 'our-views') && slug !== null && slug !== '') {
    return newsPreviewArticlePath(category, slug);
  }
  return item.href;
}

/**
 * Where a video lives when it is not being played in the dialog — the card's
 * link before hydration, and the dialog's own fallback.
 */
export function newsVideoPageUrl(video: NewsVideo): string {
  switch (video.provider) {
    case 'youtube':
      return youtubeWatchUrl(video.id);
    case 'vimeo':
      return video.pageUrl;
    case 'hosted':
      return video.fileUrl;
  }
}

export interface NewsDestination {
  category: NewsCategory;
  slug: string | null;
  externalUrl: string | null;
  video: NewsVideo | null;
}

/**
 * The card's href, or `null` when the item lacks the field its category
 * needs — an article with no slug, a video with no source. The caller decides
 * what to do with such an item; it must not render a card that goes nowhere.
 */
export function newsItemHref({
  category,
  slug,
  externalUrl,
  video,
}: NewsDestination): string | null {
  switch (category) {
    case 'press-release':
    case 'our-views':
      return slug === null || slug === '' ? null : newsArticlePath(category, slug);
    case 'in-the-news':
      return externalUrl === null || externalUrl === '' ? null : externalUrl;
    case 'multimedia':
      return video === null ? null : newsVideoPageUrl(video);
  }
}

/**
 * A video's own still, for a card whose item carries no artwork — YouTube
 * only, since it is the one provider that serves stills at a fixed address.
 */
export function newsVideoThumbnail(video: NewsVideo | null): string | null {
  return video?.provider === 'youtube' ? youtubeThumbnailUrl(video.id) : null;
}
