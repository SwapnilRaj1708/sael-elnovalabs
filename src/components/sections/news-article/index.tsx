import Image from 'next/image';
import Link from 'next/link';
import { formatDate, toDateTimeAttribute } from '@/lib/utils/format-date';
import { SIZES_ARTICLE_LEAD } from '@/lib/utils/image-sizes';

export interface NewsArticleBodyProps {
  /** The section it belongs to, verbatim — "Press Release" — and its listing. */
  section: { name: string; href: string };
  /** ISO 8601, or `null` for an article that shows no date (Our Views). */
  publishedAt: string | null;
  /** "Published On:", verbatim. */
  publishedOnLabel: string;
  imageUrl: string | null;
  /**
   * The body, **already sanitised** by `lib/utils/sanitize-article.ts` on the
   * server — a separate prop from the record's own `body`, so this component
   * cannot render the raw field. `sanitizeBio`'s bargain with `<BioDisclosure>`.
   */
  html: string;
  /** Bypass the image optimiser — on a preview page, always. See `<NewsCard unoptimized>`. */
  unoptimizedImages?: boolean;
}

/**
 * A Newsroom article under its `<h1>`: what it is and when, its image, and
 * its body — the order and the content of the legacy article page, whose
 * header put the section's name (a button back to the listing), the title
 * and "Published On: …" beside the image, with the body below.
 *
 * - **The section's name is a link to its listing**, as the legacy "Press
 *   Release" button was — the way back from an article, since the page has
 *   no breadcrumb.
 * - **The date is absent, not empty**, on an Our Views piece, which has none.
 * - **The image is decorative here** (`alt=""`), as on the legacy page: it is
 *   the card's picture, and the headline it illustrates is the `<h1>` right
 *   above it. 16:9, which is what nearly all of them are (700 × 394); the
 *   few that are not lose a sliver to `object-cover` rather than leaving bars.
 * - **The body is set by `article-prose`** (globals.css) in the reading
 *   column `<SubPage layout="article">` provides.
 *
 * A Server Component.
 */
export function NewsArticleBody({
  section,
  publishedAt,
  publishedOnLabel,
  imageUrl,
  html,
  unoptimizedImages = false,
}: NewsArticleBodyProps) {
  return (
    <div className="flex flex-col gap-flow">
      <div className="flex flex-wrap items-center gap-x-stack gap-y-tight border-b border-hairline-dark pb-stack text-meta uppercase">
        <Link
          href={section.href}
          className="flex min-h-touch items-center text-white transition-colors duration-(--duration-micro) hover:text-brand-red-bright focus-visible:outline-white"
        >
          {section.name}
        </Link>

        {publishedAt !== null && (
          <p className="text-on-dark-soft">
            {publishedOnLabel}{' '}
            <time dateTime={toDateTimeAttribute(publishedAt)}>{formatDate(publishedAt)}</time>
          </p>
        )}
      </div>

      {imageUrl !== null && (
        <div className="relative aspect-video w-full overflow-hidden bg-surface-deep">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes={SIZES_ARTICLE_LEAD}
            unoptimized={unoptimizedImages}
            className="object-cover"
          />
        </div>
      )}

      {/* Sanitised on the server, and this component cannot reach the raw
          field — see the `html` prop. */}
      <div
        className="article-prose text-body text-pretty text-body-on-dark"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
