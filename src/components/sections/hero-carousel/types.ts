import type { StaticImageData } from 'next/image';

export interface HeroSlide {
  /** Stable across renders — keys the word animation, so it must not be the
   *  array index. docs/content-model.md §2. */
  id: string;
  image: {
    /** Landscape master, used at `lg` and above. */
    desktop: StaticImageData | null;
    /**
     * Art-directed portrait crop, used below `lg`. **Not** the landscape image
     * re-cropped with `object-position` — scaling a 2.34:1 frame into 4:5
     * crops the subject out. docs/asset-inventory.md §4.
     */
    mobile: StaticImageData | null;
    /** Describes the scene, not the brand. docs/design-guidelines.md §6. */
    alt: string;
    /**
     * Tailwind `object-position` class for the landscape crop, e.g.
     * `lg:object-right`. Absent means centred.
     *
     * **No slide sets it as of 2026-09-03.** Slide 2 was the one that did, and
     * the shifted crop was dropped after review. The prop stays because the
     * problem it solves is a property of the artwork rather than of that one
     * photograph — the next hero image with a centred subject needs it again.
     *
     * It reads backwards and it is not: aligning the image's *right* edge with
     * the frame shows the right part of the photograph, which moves a centred
     * subject to the *left* of the frame. That is the whole reason this
     * exists — above `lg` the headline occupies the right-hand half, and a
     * subject sitting under it has to move out from under it.
     *
     * A class rather than a raw value so it stays in the token layer, and
     * scoped to `lg:` by the caller because the portrait crop below that
     * breakpoint is art-directed and needs no shifting.
     */
    objectClassName?: string;
  };
  /**
   * The slide's mark, stacked above the headline.
   *
   * Decorative at every size — the headline carries the meaning — so it is
   * always `alt=""`. In the earlier design this floated free in the frame as
   * a watermark, positioned per slide; `SAEL Home v2` sets it in the content
   * column instead, which is why the six placement coordinates that used to
   * live on this interface are gone.
   */
  symbol: {
    /** The symbol image. */
    image: StaticImageData | null;
    /** Name in docs/asset-inventory.md, for the pending-asset placeholder. */
    pending: string;
    /**
     * The business name set beneath the mark, one entry per line. Broken by
     * hand rather than left to wrap so every mark carries a two-line caption
     * and the stacked column never changes height between slides.
     */
    label: readonly [string, string];
  };
  headline: string;
  /**
   * The run of words inside `headline` that takes the gradient fill, as an
   * exact substring of it — "Bifacial TOPCon solar modules", say.
   *
   * A substring rather than a pre-split headline because the headline is also
   * the slide's accessible name and the label on its progress segment, and
   * those want it whole. If the substring is not found the headline simply
   * renders flat, which is the right failure: a typo here costs a highlight,
   * not a headline.
   */
  highlight?: string;
  /**
   * Tailwind background-image class for the highlight's ramp, e.g.
   * `bg-(image:--gradient-hero-word-1)`. A class rather than a raw gradient so
   * it stays in the token layer — /CLAUDE.md §2.
   */
  highlightClassName?: string;
}
