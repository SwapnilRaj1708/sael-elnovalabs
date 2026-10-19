import Image, { type StaticImageData } from 'next/image';
import { Button } from '@/components/ui/button';
import { DisplayHeading } from '@/components/ui/display-heading';
import { Eyebrow } from '@/components/ui/eyebrow';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_ABOUT_CUTOUT, SIZES_ABOUT_MEDIA } from '@/lib/utils/image-sizes';

export interface IntroSplitProps {
  eyebrow?: string;
  title: string;
  body: string;
  /** Absent in the client's design for the homepage; kept for reuse. */
  cta?: { label: string; href: string };
  /**
   * The artwork, in the three layers the client supplies it in: the
   * photograph that is masked into the chamfered shape, and the cut-out figure
   * that stands in front of it. The shape itself is not an asset here — it is
   * `--mask-about-shape`, so it costs no request and takes the grade.
   */
  media: {
    /** Masked into the shape, graded by `--gradient-shape`. */
    image: StaticImageData | null;
    alt: string;
    /** Stands in front of the shape, at its bottom-left. */
    cutout: StaticImageData | null;
    cutoutAlt: string;
  };
  /** Opt into the homepage's section snapping. */
  snap?: boolean;
}

/**
 * "About SAEL" — the label, a display heading and running copy, beside the
 * composite artwork. docs/features/04 §3, rebuilt to `SAEL Home v2`.
 *
 * **A grid now, not a stage.** The previous build placed four elements inside
 * a fixed 1280:528 box as percentages, because that is how
 * `SAEL - New Website.pdf` draws the section — the heading and the body are
 * not columns there, they are two differently-inset blocks beside the
 * artwork. v2 abandons that for a plain twelve-column grid: label, heading and
 * body stack in one column, the artwork sits in the other, and the whole
 * `--about-*` coordinate set went with the stage.
 *
 * **The pair is pulled in off the gutters.** v2 sets the copy at columns 1–6
 * and the artwork at 8–12, which leaves the two ends of the section heavy and
 * a whole empty column down the middle. At the client's request on 2026-08-21
 * they are drawn together instead — copy on 2–6, artwork on 7–12, no empty
 * column between them. It was 7–11 and symmetric until 2026-08-25; the note on
 * the artwork says what bought the twelfth column and what it cost.
 *
 * **There is no rule above the body any more**, by the client's decision on
 * 2026-08-25. It used to separate the display heading from the running copy,
 * on the argument that the two would otherwise read as one block of text at
 * two sizes; the client's call is that the heading's own size and ramp already
 * do that, and the rule was buying the separation at the price of a `--flow`
 * of padding on either side of it. The gap is a single `--flow` now, and the
 * height the column gave back is spent on the artwork — see the note there.
 *
 * Below `lg` the grid collapses to ordinary flow — heading, artwork, body —
 * per docs/responsive-strategy.md §4.
 *
 * **The artwork is three layers assembled here, not one supplied image —
 * again, as of 2026-09-01.** It was assembled in the browser once before, then
 * replaced by a single graded PNG on the argument that a browser can
 * approximate a duotone but never match it. The client has since supplied the
 * layers separately, so it is assembled again, and the objection is answered
 * rather than dodged: the grade is a `multiply` of --gradient-shape over a
 * desaturated, lifted photograph, and the figures were fitted against
 * `aboutSael/sardar-kid-cutout.png` — the composite that was approved, kept
 * as the reference for the arrangement. Not for the colour, since 2026-09-02:
 * the shape now arrives as `aboutSael/mask.svg` carrying its own ramp, which
 * is brighter and bluer than the composite's, and that file wins.
 *
 * **Nothing in the assembly is a length.** The shape is a proportion of the
 * artwork box, the cut-out is a proportion of the shape, and the shape's
 * ratio is what decides how far down its top edge falls. So the arrangement
 * is the same picture at 360px as at 1920px, and there is no breakpoint
 * anywhere in it. docs/responsive-strategy.md §3.
 */
export function IntroSplit({ eyebrow, title, body, cta, media, snap = false }: IntroSplitProps) {
  return (
    <Section
      data-snap-section
      background="paper-dots"
      className={cn('flex items-center', snap && 'min-h-viewport snap-start')}
    >
      <div className={cn('grid w-full items-center gap-flow', 'lg:grid-cols-12 lg:gap-x-gap-grid')}>
        {/* Heading first in the DOM: it is the section's <h2>, and on a phone
            it should be read before the artwork it introduces. */}
        <div className="lg:col-span-5 lg:col-start-2">
          {/* The eyebrow does not animate. It is the section's label rather
              than its content — it wants to be there already, so that what
              moves reads as the section filling in beneath a fixed heading
              rather than the whole block arriving at once. */}
          {eyebrow !== undefined && (
            <Reveal order={0}>
              <Eyebrow tone="deep">{eyebrow}</Eyebrow>
            </Reveal>
          )}

          <Reveal order={2}>
            {/*
              The display size, with the ramp clipped to the letterforms — the
              arrangement v2 gives every one of its section headings. Regular
              weight, which is the difference between the section reading as
              editorial and reading as a product page.
            */}
            <DisplayHeading ground="paper" className="mt-stack max-w-(--hero-measure)">
              {title}
            </DisplayHeading>
          </Reveal>

          <Reveal order={4} className="mt-flow">
            <p className="max-w-(--ledger-measure) text-body text-pretty text-body-soft">{body}</p>
            {cta !== undefined && (
              <Button href={cta.href} className="mt-flow">
                {cta.label}
              </Button>
            )}
          </Reveal>
        </div>

        {/* The artwork lands last: the heading introduces it, so it reads
            better arriving after the words that name it.

            Six columns, where it used to take five. The client asked on
            2026-08-25 for the artwork to take up the room the rule above the
            body gave back, and a column is the only place that room can come
            from: the artwork is `w-full` of its column and always has been, so
            it is the *grid* that sizes it, not `--about-media-max-w` —
            measured at four widths, the cap was never once the binding
            constraint. Raising the cap would have moved nothing.

            The sixth column is the spare one at the right-hand end, not one
            taken off the copy. Taking it off the copy was tried first and
            keeps the client's 2026-08-21 symmetry — a spare column outside
            each half — but it costs the body 100px at 1440 and leaves it 284px
            wide at `lg`, well inside `--ledger-measure` and visibly ragged.
            The artwork's own transparent margin means it does not read as
            flush against the gutter even though its box now reaches it, so the
            symmetry is given up where it shows least. */}
        <Reveal order={3} className="w-full lg:col-span-6 lg:col-start-7">
          {/* The artwork box. It holds nothing itself — its job is to be the
              frame the shape is measured against, and to give the cut-out the
              room above the shape that it needs in order to break its edge.
              See --about-aspect and --about-shape-inset-x. */}
          <div className="relative mx-auto aspect-(--about-aspect) w-full max-w-(--about-media-max-w)">
            {/* The shape. Inset a fixed proportion left and right and flush
                with the foot of the box, so its own ratio fixes its height and
                therefore how far down its top edge sits. `overflow` stays
                visible: the cut-out is positioned against this element and is
                taller than it. */}
            <div className="absolute inset-x-(--about-shape-inset-x) bottom-0 aspect-(--about-shape-aspect)">
              {/*
                The masked, graded photograph.

                `isolate` is load-bearing. The grade is a `multiply` of
                --gradient-shape over the picture, and without a stacking
                context of its own that blend would reach through to the
                section's paper ground and tint the page behind the shape.
                The mask would in fact establish one on its own; saying so
                explicitly is cheaper than relying on that.

                The photograph is desaturated and lifted before the ramp
                multiplies over it — grade the colour that is there and the
                result muddies, and the lift is what stops `multiply` reading
                as a dark wash rather than as a duotone. The figures match
                `aboutSael/sardar-kid-cutout.png`, the composite the client
                approved.
              */}
              <div
                className={cn(
                  'absolute inset-0 isolate',
                  'mask-(--mask-about-shape) mask-size-(--mask-fill) mask-no-repeat',
                )}
              >
                <MediaFrame
                  image={media.image}
                  alt={media.alt}
                  sizes={SIZES_ABOUT_MEDIA}
                  pending="aboutSael/burning-crop"
                  className="absolute inset-0"
                  imageClassName="anim-ken-burns-media brightness-120"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-(image:--gradient-shape) mix-blend-multiply"
                />
              </div>

              {/* The cut-out, in front. Positioned against the shape and sized
                  as a proportion of it, so the two hold their arrangement at
                  every width — there is no breakpoint here and there is not
                  meant to be one. Width only: the figure's own ratio gives the
                  height, and `h-auto` is what lets it, over the `height`
                  attribute `next/image` writes from the import. */}
              {media.cutout !== null && (
                <Image
                  src={media.cutout}
                  alt={media.cutoutAlt}
                  sizes={SIZES_ABOUT_CUTOUT}
                  className="absolute bottom-0 left-(--about-cutout-x) h-auto w-(--about-cutout-w)"
                />
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
