import type { Metadata } from 'next';
import { TODO_CONTENT } from '@/lib/config/site';

export interface BuildMetadataOptions {
  /**
   * The complete `<title>`, used verbatim. The root layout's `%s | SAEL`
   * template is bypassed, because several of these titles are carried over
   * from the legacy site and already contain the brand — appending it again
   * would change a ranking title. docs/accessibility-and-seo.md §2.
   */
  title: string;
  description?: string;
  /** Site-relative, with the trailing slash the legacy URLs carry. */
  path: string;
  /**
   * An article page's Open Graph: `og:type` `article`, its image and its
   * publication date — what the legacy article pages emit. Omit for every
   * other page, which stays `website`.
   */
  article?: {
    /** Absolute. `null` when the article has none. */
    image: string | null;
    /** ISO 8601, or `null` for an article with no date (Our Views). */
    publishedTime: string | null;
  };
}

/**
 * Per-route metadata, with the canonical URL derived rather than typed.
 *
 * `metadataBase` is set once in the root layout, so `path` resolves against
 * the configured origin and a staging deployment cannot emit canonicals
 * pointing at production.
 *
 * A `description` that is still `{{TODO: content}}` is **dropped**, not
 * emitted. Shipping a placeholder into a meta description is worse than
 * shipping none: Google will render whatever is there, and an empty tag at
 * least lets it compose a snippet from the page. The marker stays visible
 * where it belongs — in the source, and in the pre-launch grep. /CLAUDE.md §3.
 *
 * This is the minimum FE-04 needs. The full metadata pass — Open Graph
 * imagery, per-route Twitter cards, the sitemap — is FE-22.
 */
export function buildMetadata({
  title,
  description,
  path,
  article,
}: BuildMetadataOptions): Metadata {
  const isSupplied = description !== undefined && description !== TODO_CONTENT;
  const shared = { title, ...(isSupplied ? { description } : {}), url: path };

  return {
    title: { absolute: title },
    ...(isSupplied ? { description } : {}),
    alternates: { canonical: path },
    openGraph:
      article === undefined
        ? { ...shared, type: 'website' }
        : {
            ...shared,
            type: 'article',
            ...(article.image === null ? {} : { images: [article.image] }),
            ...(article.publishedTime === null ? {} : { publishedTime: article.publishedTime }),
          },
  };
}
