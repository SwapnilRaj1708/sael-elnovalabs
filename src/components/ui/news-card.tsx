import { cva } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowGlyph } from '@/components/ui/arrow-glyph';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  NEWS_CARD_ACTION_VARIANT,
  newsCardAction,
  newsCardLayout,
  type NewsCardGround,
  type NewsCardLayout,
} from '@/components/ui/news-card-action';
import { cn } from '@/lib/utils/cn';
import { formatDate, toDateTimeAttribute } from '@/lib/utils/format-date';

/** The card's parts, per ground and layout. */
const parts = cva('', {
  variants: {
    part: {
      time: 'text-meta uppercase',
      thumb: 'relative w-full overflow-hidden',
      title: 'line-clamp-3 text-card-title [text-wrap:pretty]',
    },
    ground: { paper: '', dark: '' },
    layout: { stack: '', adaptive: '' },
  },
  compoundVariants: [
    { part: 'time', ground: 'paper', className: 'text-meta-paper' },
    { part: 'time', ground: 'dark', className: 'text-on-dark-soft' },
    { part: 'thumb', ground: 'paper', className: 'bg-surface-alt' },
    { part: 'thumb', ground: 'dark', className: 'bg-surface-deep' },
    { part: 'title', ground: 'paper', className: 'text-ink' },
    { part: 'title', ground: 'dark', className: 'text-white' },

    { part: 'thumb', layout: 'stack', className: 'mt-3.5' },
    { part: 'title', layout: 'stack', className: 'mt-4' },
    // A row: the thumbnail takes the first column down the card's height,
    // and everything else is placed in the second.
    { part: 'time', layout: 'adaptive', className: 'col-start-2' },
    {
      part: 'thumb',
      layout: 'adaptive',
      className: 'col-start-1 row-span-3 row-start-1 self-start @2xl:mt-3.5',
    },
    { part: 'title', layout: 'adaptive', className: 'col-start-2 mt-tight @2xl:mt-4' },
  ],
});

const thumbAspect = { photo: 'aspect-news-thumb', video: 'aspect-video' } as const;

export type { NewsCardGround, NewsCardLayout } from '@/components/ui/news-card-action';

export interface NewsCardProps {
  title: string;
  /** `h3` under a section heading, as on the homepage; `h2` straight under the `<h1>`. */
  headingLevel?: 'h2' | 'h3';
  /** ISO 8601. Omit, or pass `null`, and the card has no date line at all. */
  publishedAt?: string | null;
  imageUrl: string | null;
  /** Required, so every call site decides — `""` only where the image is decorative. */
  imageAlt: string;
  /** The `sizes` hint for the thumbnail — `lib/utils/image-sizes.ts`. */
  sizes: string;
  ground?: NewsCardGround;
  layout?: NewsCardLayout;
  media?: keyof typeof thumbAspect;
  /** Drawn over the thumbnail's centre — a video's play mark. Decorative. */
  thumbOverlay?: ReactNode;
  /** `<NewsCardLink>` or `<VideoDialog>`. */
  action: ReactNode;
  /**
   * Load the image straight from its URL, bypassing `/_next/image`. **Set on
   * every preview page.** A preview's image can be a signed URL to a draft in
   * private storage; through the optimiser it would be stored in Next's image
   * cache and served to anyone who asks, with no preview session at all.
   */
  unoptimized?: boolean;
}

/**
 * The news card — the homepage "In the News" rail's card, pulled out on
 * 2026-10-01 so the Newsroom builds all four of its card types from it
 * rather than drawing a second card.
 *
 * **The card lost its box** in `SAEL Home v2`, and this keeps it that way: a
 * hairline across the top, the date above the image rather than on it, a
 * thumbnail, the headline, and the action at the base. The card is defined
 * by the rule it hangs from and its own alignment, not by an outline; the
 * accent fills across that rule on hover. All of that is `<Card>`'s — this
 * component is the news card's *contents*, in the order the design sets.
 *
 * **Four variants, one card:**
 *
 *  - `ground` — `paper` is the homepage rail; `dark` is the Newsroom, which
 *    sits on the investor template's black. Date, headline, the image's
 *    empty frame and the action follow it; the shape does not change.
 *  - `layout` — `stack` always stands up, as the homepage's fixed-width
 *    rail cards do. `adaptive` is a **row** while its grid is one column —
 *    the thumbnail at `--news-row-thumb-w` on the left, the rest beside it —
 *    and stands up from the grid's `@2xl` container width. The breakpoint is
 *    the *grid's* width, not the screen's, because a listing beside the
 *    area's side list is narrower than the screen by that list.
 *  - `media` — `photo` is the 5:4 thumbnail; `video` is 16:9, the frame a
 *    YouTube thumbnail is cut for.
 *  - The date is **optional in the props**, not hidden: an item with no
 *    `publishedAt` renders no `<time>` at all. Our Views and Multimedia
 *    carry none.
 *
 * The action is a slot — `<NewsCardLink>` for an article or an outbound
 * piece, `<VideoDialog>` for a video — and whichever fills it stretches its
 * hit area over the whole card with `after:inset-0`, so the image and the
 * headline are clickable while the accessible name stays the action's own.
 *
 * **The headline clamps to three lines.** These run from eight words to
 * thirty-five, and left alone the tallest sets the height of a whole row.
 * `line-clamp` truncates visually and leaves the full string in the
 * accessibility tree and in the page text. It needs no `overflow-hidden` of
 * its own — it is `-webkit-box` clamping, which already hides the overflow,
 * and adding one would clip the focus ring on the action below.
 *
 * A Server Component.
 */
export function NewsCard({
  title,
  headingLevel: Heading = 'h3',
  publishedAt = null,
  imageUrl,
  imageAlt,
  sizes,
  ground = 'paper',
  layout = 'stack',
  media = 'photo',
  thumbOverlay,
  action,
  unoptimized = false,
}: NewsCardProps) {
  return (
    // The hairline, the inset under it and the accent that fills across it
    // on hover all come from <Card> — the same three the ledger rows take.
    <Card
      as="article"
      ground={ground}
      inset="top"
      accentClassName="bg-brand-red"
      className={newsCardLayout({ layout })}
    >
      {/* The machine-readable instant and the human one come from the same
          helper, so they cannot disagree — and the display string is pinned
          to IST, which is what keeps the server and the browser rendering
          the same date. */}
      {publishedAt !== null && (
        <time
          dateTime={toDateTimeAttribute(publishedAt)}
          className={parts({ part: 'time', ground, layout })}
        >
          {formatDate(publishedAt)}
        </time>
      )}

      <div className={cn(parts({ part: 'thumb', ground, layout }), thumbAspect[media])}>
        {imageUrl !== null && (
          <Image
            // A CMS URL, not a bundled import — hence the plain <Image>
            // rather than <MediaFrame>, which takes a StaticImageData. The
            // card keeps its box either way.
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes={sizes}
            unoptimized={unoptimized}
            className={cn(
              'object-cover transition duration-(--duration-card)',
              'group-hover:scale-105',
              'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
            )}
          />
        )}
        {thumbOverlay}
      </div>

      <Heading className={parts({ part: 'title', ground, layout })}>{title}</Heading>

      {action}
    </Card>
  );
}

export interface NewsCardLinkProps {
  href: string;
  /** The visible label — "Read More". */
  label: string;
  /**
   * The accessible name, which carries the headline: "Read more: …". The
   * visible label is the same on every card, and a list of identical link
   * names is no list at all to a screen-reader user.
   */
  accessibleLabel: string;
  /**
   * Set for a link that leaves the site: it opens in a new tab, with
   * `rel="noopener noreferrer"` (from `<Button>`), and this text — "opens in
   * a new tab" — is appended to the accessible name so the new tab is not a
   * surprise. The glyph turns to an outward arrow, for sighted users.
   */
  newTabNote?: string;
  ground?: NewsCardGround;
  layout?: NewsCardLayout;
}

/** A card's link: an article here, or the publication that ran the piece. */
export function NewsCardLink({
  href,
  label,
  accessibleLabel,
  newTabNote,
  ground = 'paper',
  layout = 'stack',
}: NewsCardLinkProps) {
  const external = newTabNote !== undefined;

  return (
    <Button
      href={href}
      target={external ? '_blank' : undefined}
      variant={NEWS_CARD_ACTION_VARIANT[ground]}
      size="micro"
      className={newsCardAction({ layout })}
    >
      <span className="sr-only">
        {accessibleLabel}
        {external && ` (${newTabNote})`}
      </span>
      <span aria-hidden="true" className="inline-flex items-center gap-tight">
        {label}
        {external ? (
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" focusable="false" />
        ) : (
          <ArrowGlyph />
        )}
      </span>
    </Button>
  );
}
