import { PixelScatter } from './scatter';

/**
 * ---------------------------------------------------------------------------
 * RETIRED 2026-08-27. Not rendered anywhere. Do not import — `pnpm lint`
 * blocks it; see ../README.md.
 *
 * It closed the homepage between the last section and the footer until
 * `sections/footer-pixel-strip/` — its vertical mirror, solid along the top
 * and dissolving down — took the job over at the top of the footer instead.
 * Both were on the page together briefly for comparison; this is the one that
 * lost. The client may yet want a divider mid-page, which is why this is here
 * and not in the history.
 *
 * **Its tokens are still live and are not retired with it.**
 * `--color-pixel-1`…`-6` and `--spacing-pixel-strip` are read by the footer
 * strip; `--gradient-hero-fill` walks the same six stops. Nothing here is
 * safe to delete on the grounds that this file is the only reader.
 *
 * The only difference between this file and the live one is the ground —
 * `ground-dots-paper` against the footer colour — and one expression in
 * `scatter.tsx`, the row's `y`.
 * ---------------------------------------------------------------------------
 *
 * The pixel strip between the last section and the footer.
 * docs/features/04 §12.
 *
 * **Drawn, not a picture.** §12 specifies a full-bleed decorative *image*
 * capped at 48px, which describes the prototype's 569 KB PNG — a raster of a
 * pattern, at one width, that blurs on a wide display.
 * `docs/asset-inventory.md` §10 already records that the client's design has
 * this as live vector and calls it the better source. Generating it costs a
 * few hundred bytes, stays sharp at any width, and puts the six ramp colours
 * in the token layer where they can be changed.
 *
 * **The squares are the whole strip.** It used to sit on a solid gradient bar
 * — a CSS rectangle under the canvas, so that the band of colour rendered even
 * without script. The client asked for the bar and the space it took to go, so
 * the grid now runs to the strip's own base and the seven filled rows at the
 * bottom do the job the bar was doing. `--spacing-pixel-strip` lost the bar's
 * 18px with it, so nothing above the strip moved.
 *
 * **It sits on the paper ground with its dot grid**, like every section above
 * it — the client's 2026-08-26 call. It was bare `--surface` white, which is
 * both a different white from `--paper` and the only undotted band left on the
 * page, so the strip read as a separate thing bolted to the end rather than as
 * the page running out. The grid shows through the scatter because the canvas
 * paints squares and leaves the gaps transparent.
 *
 * Wholly decorative — it carries no information the page does not already
 * state — so it is `aria-hidden` and is a `<div>` rather than a `<section>`,
 * which would put an empty landmark in the document outline.
 */
export function PixelStrip() {
  return (
    <div
      aria-hidden="true"
      className="relative h-pixel-strip w-full overflow-hidden ground-dots-paper"
    >
      <PixelScatter />
    </div>
  );
}
