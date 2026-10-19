import Image, { type StaticImageData } from 'next/image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_ENDEAVOUR_FIGURE, SIZES_ENDEAVOUR_PANEL } from '@/lib/utils/image-sizes';

export interface EndeavourSplitProps {
  eyebrow: string;
  /** One entry per paragraph, in order. */
  body: string[];
  /**
   * The artwork, in the three layers the client supplies it in: the photograph
   * masked into the chamfered panel, and the cut-out figure standing in front
   * of it. The panel itself is not an asset here — it is
   * `--mask-endeavour-panel`, so it costs no request and takes the grade.
   */
  media: {
    /** Masked into the panel, graded by `--gradient-endeavour-panel`. */
    image: StaticImageData | null;
    alt: string;
    /** Stands in front of the panel, at its bottom-left. */
    cutout: StaticImageData | null;
    cutoutAlt: string;
  };
  snap?: boolean;
}

/**
 * "Our Endeavour" — running copy beside the composite artwork.
 *
 * The mirror of `<IntroSplit>`: there the artwork is on the left and the copy
 * on the right, here it is the other way round. Deliberately a sibling
 * component rather than a `reverse` prop on that one, because the two differ
 * in more than their handedness — this section has **no heading at all** (the
 * design's "OUR ENDEAVOUR" is the eyebrow) and its copy is three paragraphs
 * rather than one.
 *
 * **The artwork is three layers assembled here — again, as of 2026-09-02.**
 * The note that stood here said the client supplied it pre-rendered and that
 * this was better in every way, not least because it carried solar-grid line
 * work no arrangement of the handover's parts could reproduce. The client has
 * since supplied that line work itself, as `endeavour/solar-panel.png`, along
 * with `endeavour/mask.svg` and the cut-out, so the objection is answered
 * rather than dodged. `5.svg` is the same panel from the original handover and
 * is no longer the source for this section.
 *
 * **Built exactly as `<IntroSplit>`'s About SAEL artwork is**, one day earlier
 * and by the same reasoning: the panel is a proportion of the artwork box, the
 * figure is a proportion of the panel, and the panel's own ratio decides how
 * far down its top edge falls. No length, no breakpoint. The two sections also
 * share one animation, `.anim-ken-burns-media`, rather than each carrying a
 * copy — which is what stops them drifting apart. docs/design-guidelines.md §5.
 *
 * The grade is the one real difference, and it is the mask file's own: this
 * ramp carries `fill-opacity="0.67"` and simply sits over the photograph,
 * where About's multiplies. That is what lets a third of the solar grid read
 * through, which is the whole character of the panel.
 *
 * A Server Component. Nothing here is interactive.
 */
export function EndeavourSplit({ eyebrow, body, media, snap = false }: EndeavourSplitProps) {
  return (
    <Section
      data-snap-section
      // The paper ground with its dot grid, like every section on this page but
      // the hero. It was the bare white default, which left one undotted band
      // between two dotted ones — /CLAUDE.md aside, the grid is the page's
      // texture and a section without it reads as a gap in the page.
      background="paper-dots"
      // No heading, so the section carries its own accessible name rather than
      // being an unlabelled region. An <h2> here would be inventing a level
      // the design does not have.
      aria-label={eyebrow}
      className={cn('flex items-center', snap && 'min-h-viewport snap-start')}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-(--endeavour-max-w) flex-col items-center gap-flow',
          'lg:flex-row lg:items-center',
        )}
      >
        {/* Copy first in the DOM and first on screen — the one place the
            mirrored layout costs nothing, because it reads the same way
            stacked on a phone as it does side by side. */}
        <div className="lg:flex-1">
          {/* Same shape as About SAEL: the label is fixed, everything under it
              arrives. Orders continue 2, 3, 4 … so the paragraphs cascade. */}
          <Reveal order={0}>
            <Eyebrow tone="accent">{eyebrow}</Eyebrow>
          </Reveal>
          {body.map((paragraph, index) => (
            <Reveal key={paragraph} order={index + 2}>
              <p className="mt-stack text-body [text-wrap:pretty] text-body-muted">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal order={body.length + 2} className="w-full max-w-(--endeavour-media-w) shrink-0">
          {/* The artwork box. It holds nothing itself — it is the frame the
              panel is measured against, and the headroom the girl needs in
              order to stand above the panel's top edge. */}
          <div className="relative aspect-(--aspect-endeavour) w-full">
            {/* The panel. Inset a fixed proportion left and right and flush
                with the foot, so its own ratio fixes its height and therefore
                how far down its top edge sits. `overflow` stays visible: the
                girl is positioned against this element and is taller than it. */}
            <div className="absolute inset-x-(--endeavour-panel-inset-x) bottom-0 aspect-(--endeavour-panel-aspect)">
              <div className="absolute inset-0 mask-(--mask-endeavour-panel) mask-size-(--mask-fill) mask-no-repeat">
                <MediaFrame
                  image={media.image}
                  alt={media.alt}
                  sizes={SIZES_ENDEAVOUR_PANEL}
                  pending="endeavour/solar-panel"
                  className="absolute inset-0"
                  imageClassName="anim-ken-burns-media grayscale"
                />
                {/* No blend mode and no `isolate`, unlike About SAEL: the alpha
                    is carried in the ramp's own stops, so this is ordinary
                    compositing and there is nothing to contain. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-(image:--gradient-endeavour-panel)"
                />
              </div>

              {/* The girl, in front.

                  The wrapper is the *design*: her content rectangle, placed and
                  sized as proportions of the panel, foot on the panel's foot.
                  The image inside it is the *asset* — `endeavour-girl.png` is
                  half empty canvas, so it is scaled up and pulled left until its
                  artwork fills the wrapper, and `overflow-hidden` keeps the rest
                  from spilling across the copy column as an invisible box that
                  still swallows text selection. Every number in the pair is an
                  `--endeavour-figure-*` token, and the two `-bleed-` ones are
                  the only figures in this section that describe a file rather
                  than a design.

                  `max-w-none` is load-bearing: preflight caps `img` at
                  `max-width: 100%`, which would silently clamp the 190% and
                  leave her cropped. */}
              {media.cutout !== null && (
                <div className="absolute bottom-0 left-(--endeavour-figure-x) aspect-(--endeavour-figure-aspect) w-(--endeavour-figure-w) overflow-hidden">
                  <Image
                    src={media.cutout}
                    alt={media.cutoutAlt}
                    sizes={SIZES_ENDEAVOUR_FIGURE}
                    className="absolute bottom-0 left-(--endeavour-figure-bleed-x) h-auto w-(--endeavour-figure-bleed-w) max-w-none"
                  />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
