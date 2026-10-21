/**
 * `sizes` hints for `next/image`, in one place.
 *
 * Every fill image must carry one — an unset `sizes` ships a 1920px asset to a
 * phone, and that is a build-review rejection. docs/design-guidelines.md §6,
 * docs/responsive-strategy.md §6.
 *
 * They live here rather than at the call sites for a narrow reason: a `sizes`
 * value is a list of *media conditions*, and viewport units are the only way
 * to express one. Everywhere else under `src/`, a `vw` is banned outright and
 * `pnpm verify:guardrails` enforces it — a proportional unit is not a
 * responsive one (docs/responsive-strategy.md §1). This module is the single
 * exemption, which keeps that rule absolute in every file where it means
 * something, and confines the exception to eight lines that contain no layout.
 *
 * These describe the *rendered* width of the image, not the asset's size.
 */

import type { StaticImageData } from 'next/image';

/** One box a cover image fills: the condition it holds under, and its size. */
interface CoverBox {
  /** A media condition. Omitted on the last box, which is the default. */
  media?: string;
  /** The box's width, as a CSS length. */
  width: string;
  /** The box's height, as a CSS length. */
  height: string;
}

/**
 * `sizes` for an `object-cover` image, described by the box it fills.
 *
 * **The box's width is not the width the image is drawn at.** `object-cover`
 * scales an image until it covers the box, so an image wider than the box,
 * as a ratio, is drawn at the box's height and runs past both sides. A
 * landscape photograph that fills an upright phone screen is drawn about three
 * screens wide. A hint that gives only the box's width fetches a third of the
 * pixels that photograph needs, and the result is the blur seen on phones
 * until 2026-10-21. The drawn width is `max(width, height × ratio)`, and that
 * is what this writes, per box, from the asset's own ratio.
 *
 * `overscale` is a transform that enlarges the image beyond that size, such as a Ken
 * Burns push or a parallax scale, so the hint covers its largest frame.
 *
 * **`fallback` is the box-width hint, written after them.** `max()` in `sizes`
 * is a math function, and a browser that cannot read one there drops the
 * entry as a parse error and moves on to the next. The last box carries no
 * condition, so a browser that reads `max()` never reaches the fallback, and
 * one that does not uses the fallback alone. A missing image takes it too.
 */
function coverSizes(
  image: StaticImageData | null,
  boxes: readonly CoverBox[],
  fallback: string,
  overscale = 1,
): string {
  if (image === null) return fallback;

  const ratio = image.width / image.height;
  const scaled = (length: string, factor: number): string =>
    factor === 1 ? length : `${length} * ${String(+factor.toFixed(3))}`;

  const entries = boxes.map(({ media, width, height }) => {
    const drawn = `max(${scaled(width, overscale)}, ${scaled(height, ratio * overscale)})`;
    return media === undefined ? drawn : `${media} ${drawn}`;
  });

  return [...entries, fallback].join(', ');
}

/** Edge to edge at every breakpoint — the hero, banners, the pixel strip. */
export const SIZES_FULL_BLEED = '100vw';

/**
 * A `<PageHero>` banner — the full width, and `--page-hero-h` tall, which is
 * `max(36rem, --spacing-viewport)`. `100vh` stands in for the viewport here.
 * It is at least as tall as the `dvh` the token uses, so the hint errs large.
 */
export function pageHeroSizes(image: StaticImageData | null): string {
  return coverSizes(image, [{ width: '100vw', height: 'max(36rem, 100vh)' }], SIZES_FULL_BLEED);
}

/**
 * A homepage hero slide — the full width and the screen's height
 * (`min-h-viewport`). The Ken Burns push ends at `scale(1.12)` and holds there
 * (`saelKen`), and from `lg` the parallax wrapper adds `--hero-image-scale`
 * (1.06) on top. The two scales are copied here, so change them together.
 */
export function heroSlideSizes(image: StaticImageData | null, crop: 'mobile' | 'desktop'): string {
  const overscale = crop === 'desktop' ? 1.12 * 1.06 : 1.12;
  return coverSizes(image, [{ width: '100vw', height: '100vh' }], SIZES_FULL_BLEED, overscale);
}

/**
 * The hero's mark, which in `SAEL Home v2` sits in the content column rather
 * than floating in the frame as a watermark. `--spacing-hero-icon` sets its
 * height, 74 → 176px, and the marks are close to square, so the largest it is
 * ever drawn is 176px. Kept in step with that token.
 */
export const SIZES_HERO_SYMBOL = '176px';

/**
 * The About SAEL photograph — the layer masked into the chamfered shape. Half
 * the content column at `lg` and above, close to full width below it, both
 * inside the page gutter. The shape is inset 2.5% a side inside that box,
 * which is inside the rounding these figures already carry.
 */
export const SIZES_ABOUT_MEDIA = '(min-width: 64rem) 44vw, 88vw';

/**
 * The About SAEL cut-out — the figure standing in front of the shape.
 *
 * `--about-cutout-w` is 37% of the shape, and the shape is 95% of the box the
 * hint above describes, so this is 0.37 x 0.95 of those figures: 15.5vw and
 * 31vw, rounded outward. The two must move together — change
 * `--about-cutout-w` and this is the other half of that change.
 */
export const SIZES_ABOUT_CUTOUT = '(min-width: 64rem) 16vw, 32vw';

/**
 * A card on the solutions rail. `--spacing-solution-card` is
 * `clamp(250px, 30vw, 440px)`; 30vw overtakes the 250px floor at about 833px
 * of viewport, which is where the first condition starts, and the 440px cap
 * binds from about 1467px. Rounded outward at both hinges — the cost of a hint
 * that is a little generous is a slightly larger file, and the cost of one
 * that is short is a visibly soft photograph.
 */
export const SIZES_SOLUTION_CARD = '(min-width: 90rem) 440px, (min-width: 52rem) 30vw, 250px';

/**
 * The same card as a cover box: `--spacing-solution-card` wide, written out
 * here as the token's own clamp, and `--aspect-plate` (4:3) tall. The plant
 * photographs are wider than 4:3, so they are drawn at the card's height.
 */
const SOLUTION_CARD_W = 'clamp(15.625rem, 12.8846rem + 12.1795vw, 27.5rem)';

export function solutionCardSizes(image: StaticImageData | null): string {
  return coverSizes(
    image,
    [{ width: SOLUTION_CARD_W, height: `${SOLUTION_CARD_W} * 0.75` }],
    SIZES_SOLUTION_CARD,
  );
}

/**
 * The "Our Endeavour" panel photograph — the layer masked into the chamfered
 * shape. The artwork box is capped at `--endeavour-media-w` (31rem) beside the
 * copy above `lg` and close to the full column below it; the panel is inset
 * `--endeavour-panel-inset-x` a side inside that, so 92% of both figures.
 */
export const SIZES_ENDEAVOUR_PANEL = '(min-width: 64rem) 29rem, 82vw';

/**
 * The same panel as a cover box. `--endeavour-panel-aspect` is 498:491, so it
 * is as tall as it is wide, near enough. Over-scaled by `saelKenMedia`'s
 * `scale(1.16)`, the far end of its breathing.
 */
export function endeavourPanelSizes(image: StaticImageData | null): string {
  return coverSizes(
    image,
    [
      { media: '(min-width: 64rem)', width: '29rem', height: '29rem' },
      { width: '82vw', height: '82vw' },
    ],
    SIZES_ENDEAVOUR_PANEL,
    1.16,
  );
}

/**
 * The "Our Endeavour" cut-out — the girl standing in front of the panel.
 *
 * **Larger than the artwork box, and that is not a mistake.** She is 70% of the
 * panel, so 64% of the box — but `endeavour-girl.png` carries ~48% dead
 * transparent canvas (see `--endeavour-figure-bleed-w`), so the `<img>` that
 * has to be *rendered* is 190% of that, i.e. 122% of the whole artwork box.
 * `sizes` describes the element, not the visible girl, so these are the honest
 * figures. Trim the export and they drop by nearly half.
 */
export const SIZES_ENDEAVOUR_FIGURE = '(min-width: 64rem) 38rem, 100vw';

/**
 * An "Our Goals" card's background: a third of the content column at `md` and
 * above, the full column below it.
 */
export const SIZES_GOAL_CARD = '(min-width: 48rem) 32vw, 92vw';

/**
 * The same card as a cover box. Its height is `min-h-goal-card` from `md` and
 * `min-h-goal-card-sm` below it. The copy has not outgrown either floor at any
 * width checked, so the floors, written out here as the tokens' own clamps,
 * are the heights. Over-scaled by `--scale-goal-hover` (1.06).
 */
export function goalCardSizes(image: StaticImageData | null): string {
  return coverSizes(
    image,
    [
      {
        media: '(min-width: 48rem)',
        width: '32vw',
        height: 'clamp(20rem, 17.4038rem + 11.5385vw, 31.25rem)',
      },
      { width: '92vw', height: 'clamp(13.125rem, 30vh, 18.125rem)' },
    ],
    SIZES_GOAL_CARD,
    1.06,
  );
}

/**
 * A news card's thumbnail — `--spacing-news-card` wide, 238 → 330px.
 */
export const SIZES_NEWS_CARD = '(min-width: 64rem) 330px, 238px';

/**
 * A news card in a Newsroom grid — sections/news-grid. While the grid is one
 * column the card is a row and its thumbnail is `--news-row-thumb-w`, 160px
 * at most; the grid has two columns from a 42rem container, which a screen
 * reaches at about 44rem once the gutters are off. From there a card is at
 * most ~560px (two across a 72rem index), and from 90rem it is at most ~440px
 * (four across). The grid's breakpoints are container queries and these are
 * media queries, so the hinges are the nearest viewport widths, rounded
 * outward.
 */
export const SIZES_NEWS_GRID = '(min-width: 90rem) 28rem, (min-width: 44rem) 36rem, 10rem';

/**
 * A Newsroom article's lead image — the reading column's full width, which is
 * `--measure-article` (68ch, ~720px at --text-body's 20px) once the screen is
 * wide enough, and the content width inside the gutter below that. The
 * legacy files are 700–800px wide, so the cap is never short of the source.
 */
export const SIZES_ARTICLE_LEAD = '(min-width: 50rem) 720px, 92vw';

/**
 * An "Our Goals" mark — `--spacing-goal-icon` wide, 48 → 101px.
 */
export const SIZES_GOAL_ICON = '101px';

/**
 * The dotted India map. Half the content column at `lg` and above, capped by
 * `--spacing-map` at 608px; close to the full column below it.
 */
export const SIZES_MAP = '(min-width: 64rem) 38rem, 92vw';

/**
 * A business mark on a ledger row — `--spacing-ledger-icon` wide, 55 → 106px.
 */
export const SIZES_BUSINESS_ICON = '106px';

/**
 * A `<ProseSplit>` photograph. The split's columns have a 380px floor, so the
 * grid collapses to one column somewhere under 50rem of viewport and the
 * artwork is then the full content width inside the gutter. Above that it is
 * one column of two, capped by `--prose-media-landscape-w` (560px) or
 * `--prose-media-portrait-w` (420px). The caps and these hints move together.
 */
export const SIZES_PROSE_MEDIA_LANDSCAPE = '(min-width: 50rem) 560px, 88vw';
export const SIZES_PROSE_MEDIA_PORTRAIT = '(min-width: 50rem) 420px, 88vw';

/**
 * A business page's two shaped photographs, which run wider than the prose
 * split's own caps — both to `--business-overview-media-w` (704px). Same
 * hinge as the prose split, since they sit in the same grid. The cap and this
 * hint move together.
 */
export const SIZES_BUSINESS_OVERVIEW_MEDIA = '(min-width: 50rem) 704px, 88vw';

/**
 * A portrait on a team card. The grid's floor is `--team-grid-col-min` (250px)
 * and it is `auto-fill`, so a column never grows much past that on a wide
 * screen — 340px is the widest it is drawn before another track fits. Below
 * the first wrap it is two columns inside the gutter, and below the second it
 * is one.
 */
export const SIZES_TEAM_CARD = '(min-width: 64rem) 340px, (min-width: 35rem) 46vw, 92vw';

/** The small portrait in a biography dialog — `--team-dialog-portrait-w`, 96px. */
/** A 96px box, but the portrait is drawn at 1.5× inside it (the passport crop), so 144px of pixels. */
export const SIZES_TEAM_DIALOG_PORTRAIT = '144px';

/**
 * The cut-out portrait of the "Our Ambition" panel. From `md` it is 34% of a
 * panel that is as wide as the container unless the screen's height caps it
 * first; below `md` it is the prose split's portrait and takes that constant
 * instead. The 34vw is the uncapped case and over-fetches a little when the
 * height binds, which is the safe direction.
 */
export const SIZES_CUTOUT_PORTRAIT = '(min-width: 48rem) 34vw, 190px';

/* The two panels behind it had `sizes` constants here until 2026-09-17. They
 * are SVG served from the blob container, so `<CutoutSplit>` renders them
 * `unoptimized` — no srcset is generated and `sizes` would describe nothing. */

/**
 * A photograph in a gallery grid — sections/gallery-grid. One column inside
 * the gutter below `sm`, two from `sm` up; at 1920 a column is ~790px, which
 * is 41vw, so the first condition is rounded outward from that.
 */
export const SIZES_GALLERY = '(min-width: 30rem) 48vw, 92vw';

/**
 * A story's photograph on Story of Our Influence — sections/story-split.
 * From `lg` it is `--story-media-h` tall, 640px at most, and its width
 * follows from `--aspect-story-shape` (352 : 483.43): 466px at most, rounded
 * up. Below `lg` it stands at the story's foot, two thirds of the column
 * below `sm` and half of it from `sm`; the column is the viewport less the
 * gutters, so 67vw and 50vw round outward. Until 2026-10-21 it was a 120px
 * thumbnail there, and the 7.5rem that described it fetched a file a third
 * the width of the new box — the blur on phones.
 */
export const SIZES_STORY_MEDIA = '(min-width: 64rem) 30rem, (min-width: 30rem) 50vw, 67vw';

/**
 * A belief card's cut-out — sections/belief-stack. From `lg` it is five
 * twelfths of the card, and the card is the content width less its own
 * padding: 440px at 1440 and 600px at 1920, about 31vw at both, rounded up.
 * Below `lg` it is the card's width less a small inset either side.
 */
export const SIZES_BELIEF_CUTOUT = '(min-width: 64rem) 33vw, 88vw';

/**
 * An SDG icon on Our Key ESG Metrics — sections/sdg-grid. Five across from
 * `md`: ~130px at 768 (17vw), and from `lg` five across `--sdg-grid-w`
 * (65rem), so never more than ~190px. Two across the content width below `md`.
 */
export const SIZES_SDG_TILE = '(min-width: 64rem) 12rem, (min-width: 48rem) 17vw, 45vw';

/**
 * An SDG icon on the SDG page — sections/sdg-detail, `--spacing-sdg-detail-icon`:
 * 80px on a phone, ~130px at 1024, 160px from 1440.
 */
export const SIZES_SDG_DETAIL_ICON = '(min-width: 64rem) 10rem, 8rem';
