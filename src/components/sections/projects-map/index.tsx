import type { StaticImageData } from 'next/image';
import {
  PresenceMapFigure,
  type PresenceSite,
  type SiteMetric,
} from '@/components/sections/presence-map/map-figure';
import { CountUp } from '@/components/ui/count-up';
import { DisplayHeading, type BusinessGradient } from '@/components/ui/display-heading';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface ProjectsMapFigure {
  /**
   * Pre-formatted, unit included — "8.3 GWp". Every digit run counts up. A
   * trailing `*` is set as a superscript marker, as the homepage ledger sets
   * it.
   */
  value: string;
  /** The caption under it — "Portfolio". */
  label: string;
  /** A qualifier under the caption, set smaller and softer — "(under development)". */
  note?: string;
}

export interface ProjectsMapProps {
  /** The small uppercase label — "Projects". */
  eyebrow: string;
  title: string;
  /**
   * Sets the heading in a business's mark ramp instead of the ground's — the
   * four business pages. See BUSINESS_GRADIENT_CLASS.
   */
  titleGradient?: BusinessGradient;
  /** One entry per paragraph, in order. */
  body: string[];
  /**
   * The headline figure under the copy. Omit for a page whose live source
   * has none — Solar Cell Manufacturing — rather than inventing a caption.
   */
  figure?: ProjectsMapFigure;
  /** The dotted India artwork. `null` until it is supplied. */
  map: { image: StaticImageData | null };
  /** The project sites, one pin each. */
  sites: readonly PresenceSite[];
  /** The map's accessible name — "Map of SAEL solar project sites across India". */
  mapLabel: string;
  /**
   * Which business the page is, which colours the figure — the same accent
   * its figures take on the homepage ledger. Defaults to solar.
   */
  business?: SiteMetric;
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm. See `data-snap-sections` in globals.css. From `lg`
   * the map is then capped by the screen's height, `--spacing-projects-map`,
   * so the heading, the map and the padding fit one screen.
   */
  snap?: boolean;
}

/** The `-bright` four: the figure sits on black, like the ledger. */
const FIGURE_CLASS: Record<SiteMetric, string> = {
  'solar-ipp': 'text-figure-solar-bright',
  'module-assembly': 'text-figure-module-bright',
  'solar-cell': 'text-figure-cell-bright',
  'agri-waste': 'text-figure-agri-bright',
};

/**
 * A heading over the dotted India map beside running copy and one large
 * figure — the Solar Energy page's "Projects" section.
 *
 * **Why this is not `<PresenceMap>` with a prop.** The two sections share the
 * artwork and nothing else. The homepage's column is a display heading, a
 * footprint caption and two counts; this one is two paragraphs and a
 * portfolio figure, under a heading that spans both columns. A `variant` on
 * `<PresenceMap>` would have been a switch over two unrelated compositions.
 * The shared half — the map, its pins and their hover/focus contract — was
 * extracted to `<PresenceMapFigure>` instead, and both sections compose their
 * own copy beside it. The legend is off here: a solar-only map would say
 * "Solar Energy Generation" beside every pin, which is the page's own title.
 *
 * **Map left, copy right, heading above both** — the client's reference.
 * Below `lg` the row stacks and the copy comes first, because it is first in
 * the DOM: the heading, the paragraphs and the figure are the section's
 * content, and the map is their illustration. `lg:flex-row-reverse` is what
 * puts the map on the left only once there is a left to put it on.
 *
 * The figure is `<CountUp>`, so it counts in on arrival and sits still under
 * `prefers-reduced-motion`. Its colour is the page's business's own accent,
 * the same one its figures take on the homepage ledger — `business` picks it.
 *
 * A Server Component apart from the figure's count-up.
 */
export function ProjectsMap({
  eyebrow,
  title,
  titleGradient,
  body,
  figure,
  map,
  sites,
  mapLabel,
  business = 'solar-ipp',
  snap = false,
}: ProjectsMapProps) {
  return (
    <Section
      background="black-dots"
      spacing={snap ? 'tight' : 'default'}
      data-snap-section
      className={cn(snap && 'flex min-h-viewport snap-start items-center')}
    >
      <div className="flex w-full flex-col gap-flow">
        <div className="flex flex-col gap-stack">
          <Reveal order={0}>
            <Eyebrow tone="bright">{eyebrow}</Eyebrow>
          </Reveal>

          <Reveal order={1}>
            <DisplayHeading ground="dark" business={titleGradient}>
              {title}
            </DisplayHeading>
          </Reveal>
        </div>

        <div
          className={cn(
            'flex w-full flex-col items-center gap-flow',
            'lg:flex-row-reverse lg:items-center lg:justify-center',
          )}
        >
          <div className="flex w-full max-w-(--map-copy-w) flex-col gap-stack lg:pl-(--map-copy-pad)">
            {body.map((paragraph, index) => (
              <Reveal key={paragraph} order={index + 2}>
                <p className="text-body text-pretty text-body-on-dark">{paragraph}</p>
              </Reveal>
            ))}

            {figure !== undefined && (
              <Reveal order={body.length + 2} className="mt-stack flex flex-col gap-tight">
                <p className={cn('text-business-figure tabular-nums', FIGURE_CLASS[business])}>
                  {/* The marker is not part of the count, and sits raised at
                      half size so it reads as a marker, not a digit — the
                      ledger's own treatment. */}
                  <CountUp value={figure.value.replace(/\*$/, '')} />
                  {figure.value.endsWith('*') && (
                    <span className="align-super text-ledger-figure-marker">*</span>
                  )}
                </p>
                <p className="text-h3 text-white">{figure.label}</p>
                {figure.note !== undefined && (
                  <p className="text-body-sm text-on-dark-soft">{figure.note}</p>
                )}
              </Reveal>
            )}
          </div>

          <PresenceMapFigure
            order={body.length + 3}
            map={map}
            sites={sites}
            label={mapLabel}
            legend={false}
            className={cn(snap && 'lg:max-w-projects-map')}
          />
        </div>
      </div>
    </Section>
  );
}
