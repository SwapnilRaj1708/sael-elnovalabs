import { PixelScatter } from './scatter';

/**
 * The pixel strip that opens the footer — the vertical mirror of
 * `sections/pixel-strip`, which closes the page above it.
 *
 * **Drawn, not a picture.** Same canvas, same 7px grid, same six-stop ramp
 * read from the token layer; `scatter.tsx` here differs from the page strip's
 * by one expression, the row's `y`. See the note there.
 *
 * **Mirrored, so the dense edge is the one that meets the footer.** The page
 * strip is solid at its base and dissolves upward, out of the page. This one
 * is solid along its top and dissolves downward, into the footer — the band of
 * colour sits hard against the footer's top edge and thins out as the footer
 * begins, which is what makes it read as the footer's own edge rather than as
 * a second divider stacked under the first.
 *
 * **It takes the footer's ground, not the page's, and takes it flat.** Just
 * `--color-footer-bg`, so the squares dissolve into the footer with no seam
 * where the strip ends. The page strip above carries `ground-dots-paper`
 * because every section it follows is dotted and a bare band would read as
 * bolted on; the footer is the opposite case — it is flat colour throughout,
 * so a dotted band across its top is the thing that would stand out. Set
 * explicitly rather than inherited from `<footer>`: the strip owns its ground
 * the same way the page strip owns its own.
 *
 * Wholly decorative — it carries no information the page does not already
 * state — so it is `aria-hidden` and is a `<div>` rather than a `<section>`,
 * which would put an empty landmark in the document outline.
 */
export function FooterPixelStrip() {
  return (
    <div aria-hidden="true" className="relative h-pixel-strip w-full overflow-hidden bg-footer-bg">
      <PixelScatter />
    </div>
  );
}
