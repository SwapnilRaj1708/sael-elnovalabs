import Image, { type StaticImageData } from 'next/image';
import { ProseSplitLayout, type ProseSplitProps } from '@/components/sections/prose-split';
import { DisplayHeading } from '@/components/ui/display-heading';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_CUTOUT_PORTRAIT } from '@/lib/utils/image-sizes';

export interface CutoutSplitProps extends ProseSplitProps {
  /** The shaped paper panel the copy sits on from `md`. Decorative. */
  panel: StaticImageData | null;
  /** The taller panel below `md`, notched top-right. Decorative. */
  panelMobile: StaticImageData | null;
  /** The cut-out portrait standing against the panel's right edge. */
  cutout: StaticImageData | null;
  /** Describes the portrait, which is the only meaningful image here. */
  cutoutAlt: string;
}

/**
 * "Our Ambition" — the client's cut-out composition of 2026-09-17: a shaped
 * paper panel carrying the copy, and a cut-out portrait standing against its
 * right edge. One panel from `md`, a taller one below.
 *
 * **Two layouts, one section.** Below `md` it is the client's mobile
 * reference: a tall panel notched at the top-right, the copy running down
 * its body, and the portrait standing on its bottom-right foot and
 * overhanging the edge. From `md` it is the wide panel. They are siblings
 * toggled by `md:hidden` / `md:flex` rather than one layout bent to do both,
 * because each panel's geometry is its artwork's and does not reflow;
 * /CLAUDE.md §8 draws the same line for the vision timeline. Each carries
 * its own `--cutout-*` fractions, the mobile set prefixed `--cutout-m-`.
 *
 * **The panel is the block's width, less a right inset, and the section is
 * as tall as that makes it.** The inset (`--cutout-panel-inset-r`) is what
 * lets the portrait, anchored bottom-right of the block, stand proud of the
 * panel's edge, with its head rising into the room the heading leaves above.
 * The client set the desktop composition by hand on 2026-09-17 and it is the
 * approved one; the earlier width caps and viewport-height budgets are gone.
 * From `lg` the block is `--cutout-block-w` of the container, centred.
 *
 * **The copy is body copy**, `text-body` like every other paragraph on the
 * page. Until 2026-10-08 it was a display statement in its own size, 18px to
 * 36px on the wide panel; review asked for it to match the rest of the text,
 * and the composition came down by a fifth with it so the smaller copy still
 * fills the shelf. See `--cutout-block-w` and `--cutout-m-w`.
 *
 * **Everything on the panel is a fraction of the panel.** The notch, the
 * shelf and the portrait's stance are read off the SVG path and minted as
 * `--cutout-*` tokens in theme.css, so the copy stays on the paper as the
 * panel scales. The panel is a `next/image` with `h-auto` rather than a CSS
 * background, so it sizes itself from its own aspect ratio and the positioned
 * layers follow.
 *
 * **The heading is the section's, not the panel's.** It sits at the top of
 * the block against the container's left edge, exactly where "Our Strategic
 * Pillars" and "Our Guiding Principles" put theirs, with the panel directly
 * beneath it; the client's ruling of 2026-09-17, after a cut that set it in
 * the panel's notch.
 *
 * The panel's own dot texture is baked into the SVG and is the same paper
 * ground as `ground-dots-paper`, so the copy on it is set in `--color-ink`.
 *
 * **Both panels are SVG and are rendered `unoptimized`.** They come from the
 * blob container, and Next's optimizer refuses a remote SVG unless
 * `dangerouslyAllowSVG` is set — which it is not, and should not be. The Next
 * docs recommend `unoptimized` for vectors in any case: there is nothing in a
 * path to resample. It also makes `sizes` meaningless, so neither panel
 * carries one; the portrait is a PNG and still does.
 *
 * **A missing container degrades to the prose split.** `cdnImage()` returns
 * `null` when `AZURE_BLOB_BASE_URL` is unset, and the copy on the panel is
 * near-black — drawn on the section's own ground with no paper under it, it
 * would be invisible rather than merely unstyled. So the composition is
 * abandoned wholesale and the pre-cutout layout renders in its place, which is
 * legible on black and needs no artwork to be so.
 *
 * A Server Component. Nothing here is interactive.
 */
export function CutoutSplit({ panel, panelMobile, cutout, cutoutAlt, ...prose }: CutoutSplitProps) {
  const { title, body, snap = false } = prose;
  // The prose split's own `snap`, and its tight rhythm, for both branches.
  const snapClass = cn(snap && 'flex min-h-viewport snap-start items-center');
  const spacing = snap ? 'tight' : 'default';

  // See the note above: without the paper there is nothing to read the copy
  // against, so the whole composition stands down rather than half-render.
  if (panel === null || panelMobile === null || cutout === null) {
    return (
      <Section background="black-dots" spacing={spacing} data-snap-section className={snapClass}>
        <ProseSplitLayout {...prose} />
      </Section>
    );
  }

  return (
    <Section background="black-dots" spacing={spacing} data-snap-section className={snapClass}>
      <div className="flex w-full flex-col gap-stack md:hidden">
        <Reveal order={0}>
          <DisplayHeading ground="dark">{title}</DisplayHeading>
        </Reveal>

        {/* The block is the container's width up to its cap. The panel is the
            block less a right inset, which is the room the portrait — anchored
            to the block's bottom-right — overhangs into. */}
        <div className="relative mx-auto w-full max-w-(--cutout-m-w)">
          <div className="relative w-full pr-(--cutout-m-panel-inset-r)">
            <Image src={panelMobile} alt="" aria-hidden unoptimized className="h-auto w-full" />

            <div className="absolute top-(--cutout-m-notch-h) bottom-(--cutout-m-foot-b) left-(--cutout-m-copy-x) flex w-(--cutout-m-copy-w) flex-col gap-stack pt-stack">
              {body.map((paragraph, index) => (
                <Reveal key={paragraph} order={index + 2}>
                  <p className="text-body text-balance text-ink">{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal
            order={body.length + 2}
            className="absolute right-0 bottom-0 w-(--cutout-m-portrait-w)"
          >
            <Image
              src={cutout}
              alt={cutoutAlt}
              sizes={SIZES_CUTOUT_PORTRAIT}
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </div>

      <div className="hidden w-full flex-col md:flex">
        <Reveal order={0}>
          <DisplayHeading ground="dark">{title}</DisplayHeading>
        </Reveal>

        {/* The panel is inset on the right so the portrait, anchored to the
            block's bottom-right, stands proud of the panel's edge; its head
            rises into the room the heading leaves above. From `lg` the block
            is a fraction of the container, so the panel and the portrait
            scale down together, and centred. */}
        <div className="relative mx-auto w-full lg:w-(--cutout-block-w)">
          <div className="relative w-full pr-(--cutout-panel-inset-r)">
            <Image src={panel} alt="" aria-hidden unoptimized className="h-auto w-full" />

            <div className="absolute top-(--cutout-notch-h) bottom-(--cutout-shelf-b) left-(--cutout-copy-x) flex w-(--cutout-copy-w) max-w-(--measure) flex-col justify-center gap-stack">
              {body.map((paragraph, index) => (
                <Reveal key={paragraph} order={index + 2}>
                  <p className="text-body text-balance text-ink">{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal
            order={body.length + 2}
            className="absolute right-(--cutout-portrait-r) bottom-0 w-(--cutout-portrait-w)"
          >
            <Image
              src={cutout}
              alt={cutoutAlt}
              sizes={SIZES_CUTOUT_PORTRAIT}
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
