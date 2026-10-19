import type { Metadata } from 'next';
import {
  getContentRepository,
  newsArticlePath,
  type NewsArticle,
  type NewsArticleCategory,
  type NewsCategory,
  type NewsItem,
} from '@/lib/content';
import { buildMetadata } from '@/lib/seo/metadata';
import { articleDescription } from '@/lib/utils/article-description';

/**
 * What the Newsroom's pages share between the repository and the sections.
 * Page code, so it lives beside the pages — a section never fetches
 * (docs/architecture.md §3) — in a `_lib` folder the router ignores. The
 * investor area's `_lib/documents.ts` is the pattern.
 */

/**
 * One section's items. **A failure throws, in every environment**, never an
 * empty list.
 *
 * An empty list would be cached as the page for the whole ISR window, a
 * section with nothing published, until the next regeneration happened to
 * succeed. A throw is not cached: during a regeneration Next keeps serving
 * the last good page and tries again on a later request, and during the
 * build it fails the build rather than shipping an empty Newsroom. A page
 * with no good version yet — the first render after a deploy whose build
 * succeeded but whose backend is now down — goes to the error boundary with a
 * 500. The error's message, which Next logs, names the endpoint, the status
 * and the backend's `code` and `correlationId`.
 *
 * `limit` is a hint to the repository, which may return more, so the list is
 * cut here too.
 */
export async function loadNewsItems(category: NewsCategory, limit?: number): Promise<NewsItem[]> {
  const items = await getContentRepository().getNewsItems({ category, limit });
  return limit === undefined ? items : items.slice(0, limit);
}

/**
 * Every article's slug in a section, for `generateStaticParams` — the pages
 * built ahead of the first visitor.
 *
 * **Not the list of pages that exist.** The routes set `dynamicParams =
 * true`, so an article published after the build renders on its first
 * request and is cached like the rest. A failure here fails the build, as
 * {@link loadNewsItems} does for the listings.
 */
export async function loadArticleSlugs(category: NewsArticleCategory): Promise<{ slug: string }[]> {
  const items = await loadNewsItems(category);
  return items.flatMap(({ slug }) => (slug === null ? [] : [{ slug }]));
}

/**
 * One article, or `null` for a slug that is not one. **Not caught**: a
 * listing can degrade to an empty state, but an article page has nothing to
 * degrade to, and a source failure is not a 404 — it goes to the error
 * boundary.
 */
export function loadNewsArticle(
  category: NewsArticleCategory,
  slug: string,
): Promise<NewsArticle | null> {
  return getContentRepository().getNewsArticle(category, slug);
}

/**
 * An article page's metadata. **What the maker wrote in the panel wins**:
 * `seoTitle`, `seoDescription` and the share image are used as given
 * wherever they are set, and nothing is derived over them.
 *
 * Where one is blank, the fallback is the legacy page's own: the `<title>` is
 * the headline alone, with no " - SAEL"; the description is the article's
 * summary (docs/api-contracts.md §3.2), and failing that the legacy
 * derivation from the body — the legacy articles carry neither SEO fields
 * nor a summary, so their search snippets do not change at cutover; the
 * share image is the card's. `og:type` is `article`, and the canonical is the
 * legacy URL.
 */
export function articleMetadata(article: NewsArticle): Metadata {
  return buildMetadata({
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.summary ?? articleDescription(article.body),
    path: newsArticlePath(article.category, article.slug),
    article: { image: article.ogImageUrl ?? article.imageUrl, publishedTime: article.publishedAt },
  });
}
