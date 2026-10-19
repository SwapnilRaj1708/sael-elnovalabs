import { newsroomSections, publishedOnLabel } from '@/app/_content/newsroom';
import { NewsArticleBody } from '@/components/sections/news-article';
import { SubPage } from '@/components/sections/sub-page';
import { newsArticlePath, type NewsArticle } from '@/lib/content';
import { newsArticleJsonLd } from '@/lib/seo/json-ld';
import { sanitizeArticle } from '@/lib/utils/sanitize-article';

export interface NewsArticlePageProps {
  article: NewsArticle;
  /**
   * Where the section's name above the body goes. The live listing by
   * default; a preview passes its own listing, so the way back stays inside
   * the preview.
   */
  listingHref?: string;
  /** Bypass the image optimiser. Every preview page sets it; no live page does. */
  unoptimizedImages?: boolean;
}

/**
 * A Press Release or Our Views article — the two `[slug]` routes render the
 * same page, so it is written once, here, beside them.
 *
 * The investor template's opening, as every Newsroom page has: the ripple
 * band with the headline as the `<h1>`, no breadcrumb. `layout="article"`
 * sets the headline at `--text-h2` and the body in one reading column, and
 * there is no side list — an article is read, not navigated beside; the
 * section's name above the body is the way back.
 *
 * `NewsArticle` JSON-LD beside it, from the same record, in the style of the
 * breadcrumb's `BreadcrumbList`.
 *
 * **The article's preview renders this too**, with the draft in `article`
 * — never a copy of it. See `<NewsListing>` for why.
 *
 * A Server Component; the ripple grid is the one client leaf.
 */
export function NewsArticlePage({
  article,
  listingHref,
  unoptimizedImages = false,
}: NewsArticlePageProps) {
  const section = newsroomSections[article.category];
  const jsonLd = newsArticleJsonLd({
    headline: article.title,
    path: newsArticlePath(article.category, article.slug),
    imageUrl: article.imageUrl,
    datePublished: article.publishedAt,
  });

  return (
    <SubPage masthead="ripple" layout="article" title={article.title}>
      <script
        type="application/ld+json"
        // Built from the typed record the page renders. `<` is escaped so a
        // headline can never close the script element early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <NewsArticleBody
        section={{ name: section.name, href: listingHref ?? section.path }}
        publishedAt={article.publishedAt}
        publishedOnLabel={publishedOnLabel}
        imageUrl={article.imageUrl}
        html={sanitizeArticle(article.body) ?? ''}
        unoptimizedImages={unoptimizedImages}
      />
    </SubPage>
  );
}
