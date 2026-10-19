import type { StaticImageData } from 'next/image';
import { CountUp } from '@/components/ui/count-up';
import { DisplayHeading } from '@/components/ui/display-heading';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { PresenceMapFigure, type PresenceSite } from './map-figure';

export type { PresenceSite, PresenceSiteFigure, SiteFigurePartner, SiteMetric } from './map-figure';

export interface PresenceMapProps {
  /**
   * The section label, above everything — "Portfolio".
   *
   * Required rather than optional: every section on the page carries one
   * and this is the last that did not, so there is no caller left that
   * would want the opt-out. See the note on the component.
   */
  eyebrow: string;
  /** The section's display heading, right of the map. */
  heading: string;
  /** Broken over two lines in the design; supplied pre-split. */
  title: [string, string];
  /** "11 States" */
  primaryStat: string;
  /** "60 Projects Sites" */
  secondaryStat: string;
  /** The dotted India artwork. `null` until it is supplied. */
  map: { image: StaticImageData | null };
  /** The project sites. */
  sites: PresenceSite[];
  snap?: boolean;
}

/**
 * "Our Current Power Portfolio" — the dotted India map and its project sites.
 * docs/features/04 §5, rebuilt to `SAEL Home v2`.
 *
 * **It carries a section label now, and the design does not.** `SAEL Home v2`
 * opens its "04 Power Portfolio" screen straight onto the display heading —
 * this was the one section on the page without the small tracked label above
 * it, and it read as the odd one out for exactly that reason. Added at the
 * client's request on 2026-08-26. `bright`, the tone the other two sections
 * on the black ground take, so the three read as a set.
 *
 * **Map left, copy right.** The previous build centred the map and hung the
 * footprint label and its two figures over the artwork at percentage offsets,
 * which was always an interim — the tracker recorded the right-hand column as
 * commented out pending a layout review. v2 settles it: two columns, the map
 * in one and heading, label and figures in the other, and nothing positioned
 * over the artwork any more.
 *
 * v2 sets those columns at 1–6 and 8–12, leaving a whole empty column between
 * them, and the two figures a `clamp(24px, 4vw, 64px)` apart. Both were pulled
 * in at the client's request — the figures on 2026-08-21, the columns again on
 * 2026-08-22.
 *
 * **A centred row, not a grid**, and that is what finally closed the gap. On a
 * twelve-column grid both halves are capped — the map by `--spacing-map`, the
 * copy by its own measure — so each floats in the middle of a column that is
 * wider than it, and the slack lands between them. Sizing the two blocks and
 * centring the row puts exactly one `--spacing-flow` between them at every
 * width. The rule above the footprint label is capped harder still, for the
 * same reason it exists: it is a break between two blocks, not a border on the
 * section.
 *
 * **The artwork is a supplied file now, not geometry.** See the note in
 * dots.ts: the client sent `dotted-map.svg` on 2026-08-21, so the 751-subpath
 * `<path>` and the gradient this component used to declare are both gone. The
 * six site coordinates are mapped across from the old space and want an eye —
 * also in that note.
 *
 * The map, its pins and their callouts are `<PresenceMapFigure>` since
 * 2026-09-18, shared with the Solar Energy page's `<ProjectsMap>`. The two
 * things that were right about the earlier build — no JavaScript, and a real
 * control per pin carrying the callout's text — live there now.
 */
export function PresenceMap({
  eyebrow,
  heading,
  title,
  primaryStat,
  secondaryStat,
  map,
  sites,
  snap = false,
}: PresenceMapProps) {
  return (
    <Section
      data-snap-section
      background="black-dots"
      spacing="tight"
      className={cn('flex items-center', snap && 'min-h-viewport snap-start')}
    >
      <div className="flex w-full flex-col gap-flow">
        <Reveal order={0}>
          <Eyebrow tone="bright">{eyebrow}</Eyebrow>
        </Reveal>

        <div
          className={cn(
            'flex w-full flex-col items-center gap-flow',
            'lg:flex-row lg:items-center lg:justify-center',
          )}
        >
          <PresenceMapFigure
            order={2}
            map={map}
            sites={sites}
            label="Map of SAEL project sites across India"
          />

          {/* The client's 5rem inset between the map and this column, at the
              design width — and 0 wherever the row cannot afford it. The `lg:`
              is the stacked case: below it the map sits *above* the copy, and
              an inset there is not a gap between two blocks, it is one column
              of the page starting further in than everything else on it. The
              ramp between 1280 and 1920 is in --map-copy-pad. */}
          <div className="w-full max-w-(--map-copy-w) lg:pl-(--map-copy-pad)">
            <Reveal order={3}>
              <DisplayHeading ground="dark" className="max-w-(--hero-measure)">
                {heading}
              </DisplayHeading>
            </Reveal>

            {/* The footprint label, demoted to a caption over the figures — in
              the PDF it was the heading, and v2 gives that job to the display
              line above. The rule is what separates the two, and it is a drawn
              element rather than a `border-t` because it is deliberately
              shorter than the block it sits over.

              It draws itself in on the same `anim-underline` the section
              labels take — this is the one section whose header rule is not an
              `<Eyebrow>`, and the client's 2026-08-25 note asks for the
              movement on all of them. Nothing else is needed: the class reads
              the `data-reveal` on the `<Reveal>` it is already inside. */}
            <Reveal order={4} className="mt-flow">
              <span
                aria-hidden="true"
                className="anim-underline block h-px w-(--map-rule-w) bg-hairline-grid"
              />
              <h3 className="mt-stack text-meta text-on-dark-faint uppercase">
                {title[0]}
                <br />
                {title[1]}
              </h3>
            </Reveal>

            {/* Tighter than the design's gap, at the client's request: the two
              read as a pair rather than as two unrelated figures. */}
            <Reveal order={5} className="mt-stack flex flex-wrap gap-stack">
              <p className="text-stat-large text-white tabular-nums">
                <CountUp value={primaryStat} />
              </p>
              <p className="text-stat-large text-white tabular-nums">
                <CountUp value={secondaryStat} />
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
