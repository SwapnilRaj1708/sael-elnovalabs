import { cva, type VariantProps } from 'class-variance-authority';
import { Newspaper, Play } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { NewsCard, NewsCardLink } from '@/components/ui/news-card';
import { VideoDialog } from '@/components/ui/video-dialog';
import type { NewsItem } from '@/lib/content';
import { cn } from '@/lib/utils/cn';
import { SIZES_NEWS_GRID } from '@/lib/utils/image-sizes';

/**
 * The functional copy the cards need. Not transcribed — the legacy cards
 * have no visible action at all, their headline is the link — so it is the
 * homepage card's own wording, passed in rather than written here.
 */
export interface NewsGridLabels {
  /** "Read More" — the visible action on an article or outbound card. */
  read: string;
  /** "Read more" — prefixed to the headline in the action's accessible name. */
  readPrefix: string;
  /** "opens in a new tab" — appended to an outbound card's accessible name. */
  newTab: string;
  /** "Watch Video" — the visible action on a video card. */
  watch: string;
  /** "Watch video" — prefixed to the title in its accessible name. */
  watchPrefix: string;
  /** "Close" — the video dialog's close button. */
  close: string;
}

const grid = cva('grid gap-x-gap-grid gap-y-stack @2xl:gap-y-flow', {
  variants: {
    /**
     * `row` is one row of four on a wide screen, for the Newsroom index's
     * sections — two by two below that, so four never leave an orphan.
     * `listing` is a whole section, three across and then four.
     */
    columns: {
      row: 'grid-cols-1 @2xl:grid-cols-2 @6xl:grid-cols-4',
      listing: 'grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4',
    },
  },
  defaultVariants: { columns: 'listing' },
});

export interface NewsGridProps extends VariantProps<typeof grid> {
  items: readonly NewsItem[];
  /** The list's accessible name — the section's name, "In The News". */
  label: string;
  /** `h2` on a listing, straight under the `<h1>`; `h3` under an index section's `<h2>`. */
  headingLevel: 'h2' | 'h3';
  labels: NewsGridLabels;
  /** Shown in place of the grid when there are no items — the repository failed. */
  empty: { title: string; description: string };
  /** Bypass the image optimiser — on a preview page, always. See `<NewsCard unoptimized>`. */
  unoptimizedImages?: boolean;
}

/**
 * The play mark over a video's thumbnail: decorative, since the action under
 * the card already says what pressing it does, and it fills with the accent
 * red as the card's rule does.
 */
function PlayMark() {
  return (
    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
      <span
        className={cn(
          'flex size-play-mark items-center justify-center rounded-full',
          'bg-scrim-dialog text-white ring-1 ring-hairline-on-media',
          'transition-colors duration-(--duration-micro)',
          'group-hover:bg-brand-red group-has-focus-visible:bg-brand-red group-data-touch-lit:bg-brand-red',
          'motion-reduce:transition-none',
        )}
      >
        {/* Nudged right by a pixel: a triangle's visual centre is left of its
            box's, and an unnudged play mark looks off-centre. */}
        <Play className="size-2/5 translate-x-px" fill="currentColor" focusable="false" />
      </span>
    </span>
  );
}

/**
 * News cards in a grid — the Newsroom's listings and the rows on its index.
 * Every card is `<NewsCard>`, the homepage rail's card, on the dark ground;
 * what differs per category is only its action and its date:
 *
 *  - **Press Release** — date, image, headline, "Read More" to the article.
 *  - **In The News** — the same, but the link opens the publication in a new
 *    tab, and says so to a screen reader.
 *  - **Our Views** — no date, because the item has none. The `<time>` is
 *    absent, not hidden.
 *  - **Multimedia** — the 16:9 artwork with a play mark, the title, and
 *    `<VideoDialog>` in place of the link, playing YouTube, Vimeo or a file
 *    we host.
 *
 * **The grid's columns follow its own width, not the screen's**: it is a
 * size container, and the columns and each card's row-or-column layout are
 * container queries. A listing sits beside the area's side list from `lg`,
 * an index section does not, and the same breakpoints serve both.
 *
 * **Every card image has alternative text**: the legacy `alt`, which is the
 * headline, or the headline where the source has none (the videos).
 *
 * No `<Reveal>` per card. Forty-two staggered entrances is a page that is
 * still arriving long after it has been read; the grid arrives as one with
 * the template's body.
 *
 * A Server Component; each video card's player is the client leaf.
 */
export function NewsGrid({
  items,
  label,
  headingLevel,
  labels,
  empty,
  columns,
  unoptimizedImages = false,
}: NewsGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        ground="dark"
        icon={Newspaper}
        title={empty.title}
        description={empty.description}
      />
    );
  }

  return (
    <div className="@container">
      <ul aria-label={label} className={grid({ columns })}>
        {items.map((item) => {
          const shared = {
            title: item.title,
            headingLevel,
            publishedAt: item.publishedAt,
            imageUrl: item.imageUrl,
            imageAlt: item.imageAlt ?? item.title,
            sizes: SIZES_NEWS_GRID,
            ground: 'dark',
            layout: 'adaptive',
            unoptimized: unoptimizedImages,
          } as const;

          return (
            <li key={item.id} className="flex">
              {item.category === 'multimedia' && item.video !== null ? (
                <NewsCard
                  {...shared}
                  media="video"
                  thumbOverlay={<PlayMark />}
                  action={
                    <VideoDialog
                      video={item.video}
                      href={item.href}
                      title={item.title}
                      label={labels.watch}
                      accessibleLabel={`${labels.watchPrefix}: ${item.title}`}
                      closeLabel={labels.close}
                      ground="dark"
                      layout="adaptive"
                    />
                  }
                />
              ) : (
                <NewsCard
                  {...shared}
                  action={
                    <NewsCardLink
                      href={item.href}
                      label={labels.read}
                      accessibleLabel={`${labels.readPrefix}: ${item.title}`}
                      newTabNote={item.category === 'in-the-news' ? labels.newTab : undefined}
                      ground="dark"
                      layout="adaptive"
                    />
                  }
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
