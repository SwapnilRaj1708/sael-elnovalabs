import 'server-only';

import { newsItemHref, newsPreviewItemHref, newsVideoThumbnail } from '../news-links';
import type {
  NewsArticle,
  NewsArticleCategory,
  NewsCategory,
  NewsItem,
  NewsVideo,
  PreviewState,
  Previewed,
} from '../types';
import { InvalidContentError } from './client';
import type {
  NewsDetailBody,
  NewsListItemBody,
  NewsPreviewDetailBody,
  NewsPreviewListItemBody,
  NewsType,
} from './schemas';

/**
 * `NewsBody` → the site's `NewsItem` and `NewsArticle`. The one place the
 * backend's names meet the frontend's (docs/api-contracts.md §10):
 *
 * | backend                       | frontend                 |
 * |-------------------------------|--------------------------|
 * | `publicId`                    | `id`                     |
 * | `type` `PRESS_RELEASE`        | `category` `press-release` (both ways) |
 * | `publishDate`                 | `publishedAt`            |
 * | `heroImage.url` / `.altText`  | `imageUrl` / `imageAlt`  |
 * | `sourcePublication`           | `publication`            |
 * | `mediaKind` + `mediaVideoId` / `mediaUrl` / `mediaFileUrl` | `video` |
 * | `bodyHtml`                    | `body`                   |
 * | `seoTitle`, `seoDescription`, `ogImage.url` | the same, `ogImageUrl` |
 *
 * A record the schema admits but the site cannot render — a video with no
 * source, an article with no slug — throws {@link InvalidContentError}, and
 * the caller applies the same policy as to a schema failure.
 */

/**
 * Both directions as literal tables, each checked exhaustive by `satisfies`,
 * so a fifth type or category is a compile error rather than an `undefined`.
 * Routes use the kebab-case value; the API requires the upper-case one.
 */
const CATEGORY_BY_TYPE = {
  PRESS_RELEASE: 'press-release',
  IN_THE_NEWS: 'in-the-news',
  OUR_VIEWS: 'our-views',
  MULTIMEDIA: 'multimedia',
} as const satisfies Record<NewsType, NewsCategory>;

const TYPE_BY_CATEGORY = {
  'press-release': 'PRESS_RELEASE',
  'in-the-news': 'IN_THE_NEWS',
  'our-views': 'OUR_VIEWS',
  multimedia: 'MULTIMEDIA',
} as const satisfies Record<NewsCategory, NewsType>;

export function newsTypeOf(category: NewsCategory): NewsType {
  return TYPE_BY_CATEGORY[category];
}

export function newsCategoryOf(type: NewsType): NewsCategory {
  return CATEGORY_BY_TYPE[type];
}

/**
 * The video, for a Multimedia item; `null` for every other type.
 *
 * `mediaVideoId` is read **only** as the id of the provider `mediaKind`
 * names — a Vimeo id handed to the YouTube player is a broken card. A
 * Multimedia item with no `mediaKind` but a `mediaUrl` is a provider the
 * backend did not recognise; it throws rather than being left out unseen.
 */
function toVideo(body: NewsListItemBody, endpoint: string): NewsVideo | null {
  if (body.type !== 'MULTIMEDIA') return null;

  const invalid = (field: string, detail: string) =>
    new InvalidContentError(endpoint, field, detail, body.publicId);

  switch (body.mediaKind) {
    case 'YOUTUBE':
      if (body.mediaVideoId === null) throw invalid('mediaVideoId', 'is null on a YOUTUBE item');
      return { provider: 'youtube', id: body.mediaVideoId };
    case 'VIMEO':
      if (body.mediaVideoId === null) throw invalid('mediaVideoId', 'is null on a VIMEO item');
      if (body.mediaUrl === null) throw invalid('mediaUrl', 'is null on a VIMEO item');
      return { provider: 'vimeo', id: body.mediaVideoId, pageUrl: body.mediaUrl };
    case 'HOSTED':
      if (body.mediaFileUrl === null) throw invalid('mediaFileUrl', 'is null on a HOSTED item');
      return { provider: 'hosted', fileUrl: body.mediaFileUrl };
    case null:
      throw body.mediaUrl === null
        ? invalid('mediaKind', 'is null and the item has no video')
        : invalid(
            'mediaKind',
            `is null: the provider of ${body.mediaUrl} is not one the site can play`,
          );
  }
}

export function toNewsItem(body: NewsListItemBody, endpoint: string): NewsItem {
  const category = newsCategoryOf(body.type);
  const video = toVideo(body, endpoint);
  const href = newsItemHref({ category, slug: body.slug, externalUrl: body.externalUrl, video });

  if (href === null) {
    const field = category === 'in-the-news' ? 'externalUrl' : 'slug';
    throw new InvalidContentError(
      endpoint,
      field,
      `is null, so the card has nowhere to go`,
      body.publicId,
    );
  }

  return {
    id: body.publicId,
    category,
    title: body.title,
    publishedAt: body.publishDate,
    href,
    imageUrl: body.heroImage?.url ?? newsVideoThumbnail(video),
    imageAlt: body.heroImage?.altText ?? null,
    slug: body.slug,
    externalUrl: body.externalUrl,
    video,
    publication: body.sourcePublication,
  };
}

export function toNewsArticle(
  body: NewsDetailBody,
  category: NewsArticleCategory,
  endpoint: string,
): NewsArticle {
  const item = toNewsItem(body, endpoint);
  // toNewsItem has already refused an article without a slug; this narrows it.
  if (item.slug === null) throw new InvalidContentError(endpoint, 'slug', 'is null', body.publicId);

  return {
    ...item,
    category,
    slug: item.slug,
    body: body.bodyHtml ?? '',
    summary: body.summary,
    seoTitle: body.seoTitle ?? null,
    seoDescription: body.seoDescription ?? null,
    ogImageUrl: body.ogImage?.url ?? null,
  };
}

/**
 * The `preview` block as a {@link PreviewState}. Field for field: the backend
 * already speaks the site's language here.
 */
function toPreviewState({
  preview,
}: {
  preview: NewsPreviewListItemBody['preview'];
}): PreviewState {
  return {
    status: preview.status,
    versionNo: preview.versionNo,
    isDraft: preview.isDraft,
    lastUpdatedBy: preview.lastUpdatedBy,
    lastUpdatedAt: preview.lastUpdatedAt,
  };
}

/**
 * A preview listing's item: the card exactly as live maps it — the same
 * {@link toNewsItem}, so the two cannot drift — with an article's link turned
 * to its preview page.
 */
export function toNewsPreviewItem(
  body: NewsPreviewListItemBody,
  endpoint: string,
): Previewed<NewsItem> {
  const item = toNewsItem(body, endpoint);
  return { record: { ...item, href: newsPreviewItemHref(item) }, preview: toPreviewState(body) };
}

/** A preview article: {@link toNewsArticle}, unchanged, and its state. */
export function toNewsArticlePreview(
  body: NewsPreviewDetailBody,
  category: NewsArticleCategory,
  endpoint: string,
): Previewed<NewsArticle> {
  return { record: toNewsArticle(body, category, endpoint), preview: toPreviewState(body) };
}
