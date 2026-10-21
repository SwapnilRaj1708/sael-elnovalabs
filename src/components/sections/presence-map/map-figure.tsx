import type { CSSProperties } from 'react';
import type { StaticImageData } from 'next/image';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils/cn';
import { SIZES_MAP } from '@/lib/utils/image-sizes';
import { MAP_VIEWBOX } from './dots';
import { MapPin } from './map-pin';

type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * The map's four legends — and they are the four businesses, which is why the
 * ledger's accents are what colours them.
 *
 * The client's map draws each as an icon beside its figure. **We render the
 * legend's name in place of its icon**, at the client's request on
 * 2026-08-27: an icon needs a legend strip to be readable at all, and the
 * name says the same thing with nothing to decode. The callouts drew the
 * Business Portfolio's marks instead for one day, 2026-10-06; on 2026-10-07
 * the client asked for the names back, figure left and name right, keeping
 * that day's figures.
 */
export type SiteMetric = 'solar-ipp' | 'module-assembly' | 'solar-cell' | 'agri-waste';

/** What a figure can be paired with: a second business, or battery storage. */
export type SiteFigurePartner = SiteMetric | 'storage';

export interface PresenceSiteFigure {
  metric: SiteMetric;
  /**
   * A figure that covers two things at once — module and cell capacity
   * together, or solar with battery storage. The callout names both, the
   * second on a line of its own after a "+".
   */
  plus?: SiteFigurePartner;
  /** Value and unit together, as the client publishes them — "298 MW", "5 GW". */
  value: string;
}

export interface PresenceSite {
  id: string;
  /** "Rajasthan", or on a single-business map "Khavda (Gujarat)". */
  name: string;
  /**
   * What the site contributes, one entry per legend it appears under. A state
   * carries between one and three; the client's map has none with four.
   */
  figures: PresenceSiteFigure[];
  /** Point in the map artwork's own viewBox — see `MAP_VIEWBOX`. */
  x: number;
  y: number;
  /**
   * The pin becomes a link to this, in a new tab, and the callout gains the
   * design's "Visit Location" line. Omit for a site whose destination has not
   * been supplied.
   */
  href?: string;
}

/** The legend names, verbatim from the client's map. */
const METRIC_LABEL: Record<SiteFigurePartner, string> = {
  'solar-ipp': 'Solar Energy Generation',
  'module-assembly': 'Solar Module Manufacturing',
  'solar-cell': 'Solar Cell Manufacturing',
  'agri-waste': 'Agri Waste-to-Energy',
  // Not one of the four legends: the client's map draws a battery beside a
  // solar figure that includes storage. The wording is the client's, from
  // their request of 2026-10-07.
  storage: 'Battery Storage',
};

/**
 * Each legend in its business's own accent, so a figure on the map and the
 * same business's row in the ledger read as one colour.
 *
 * **The `-deep` four, not the `-bright` four the ledger itself uses.** The
 * callout sits on `--color-paper-alt` and the ledger sits on black; the bright
 * accents fail contrast badly on paper. Same hues, ground-appropriate weight —
 * see the note on the tokens.
 */
const METRIC_CLASS: Record<SiteMetric, string> = {
  'solar-ipp': 'text-figure-solar-deep',
  'module-assembly': 'text-figure-module-deep',
  'solar-cell': 'text-figure-cell-deep',
  'agri-waste': 'text-figure-agri-deep',
};

/**
 * A partner's accent: a second business takes its own, and battery storage
 * takes the figure's, because it is part of that business's capacity rather
 * than a business of its own.
 */
function partnerClass(figure: PresenceSiteFigure, partner: SiteFigurePartner): string {
  return METRIC_CLASS[partner === 'storage' ? figure.metric : partner];
}

/** "Solar Module Manufacturing + Solar Cell Manufacturing". */
function figureLabel(figure: PresenceSiteFigure): string {
  return figure.plus === undefined
    ? METRIC_LABEL[figure.metric]
    : `${METRIC_LABEL[figure.metric]} + ${METRIC_LABEL[figure.plus]}`;
}

/**
 * "298 MW Solar Energy Generation; 89.4 MW Agri Waste-to-Energy" — or, with
 * the legend off, just "298 MW", and "275 MW + Battery Storage" for a paired
 * figure.
 */
function describeSite(site: PresenceSite, legend: boolean): string {
  return site.figures
    .map((figure) => {
      if (legend) return `${figure.value} ${figureLabel(figure)}`;
      return figure.plus === undefined
        ? figure.value
        : `${figure.value} + ${METRIC_LABEL[figure.plus]}`;
    })
    .join('; ');
}

export interface PresenceMapFigureProps {
  /** The dotted India artwork. `null` until it is supplied. */
  map: { image: StaticImageData | null };
  /** The project sites. */
  sites: readonly PresenceSite[];
  /** The accessible name of the whole figure — "Map of SAEL project sites across India". */
  label: string;
  /**
   * Name each figure's business in the callout. On for the homepage, whose
   * map carries all four businesses; off for a page whose map carries one,
   * where the legend would repeat the page's own title beside every pin. A
   * paired figure names its partner either way ("+ Battery Storage"), because
   * without it a state's second figure for the same business means nothing.
   */
  legend?: boolean;
  /** Reveal stagger position within the section. */
  order?: number;
  /** Applied to the figure's box, which is the `<Reveal>` itself. */
  className?: string;
}

/**
 * The dotted India map and its pins — the artwork half of `<PresenceMap>`,
 * on its own.
 *
 * Extracted on 2026-09-18 for the Solar Energy page, whose "Projects" section
 * is this same map with a different column beside it: two paragraphs and a
 * portfolio figure rather than a heading and two counts. The pins, callouts
 * and their hover/focus contract are one thing and now live in one place; the
 * two sections compose their own copy around it.
 *
 * Two things carry over from the earlier build:
 *
 * 1. **CSS opens the tooltips, wherever it can.** Hover and focus are things
 *    CSS already knows, so the tooltips are `group-hover` /
 *    `group-focus-within`, this is a Server Component, and a mouse or a
 *    keyboard works before hydration. A tap is the exception: on an iPhone
 *    it produces neither hover nor focus. Since 2026-10-21 each pin is a
 *    `<MapPin>`, a small client leaf that adds `data-open` on a tap. That
 *    is the one piece of JavaScript here. See the note there.
 *
 * 2. **Each pin is a real control** whose accessible name carries everything
 *    the tooltip shows, so a keyboard user hears "Jalore (Rajasthan), 298 MW"
 *    on focus and sees the same tooltip a pointer would. The tooltip itself
 *    is `aria-hidden` — it is the visual echo of the control's name, and
 *    announcing both would say it twice. Focus, not just hover, is what
 *    reveals it. The pins are therefore also the map's text equivalent:
 *    every figure is real text in the DOM, reachable in document order.
 *
 * A pin with an `href` is an `<a>` to that location in a new tab, and says so
 * in its name; one without is a `<button>` that does nothing but reveal its
 * callout. The design's "Visit Location" line only renders on the former.
 * Until 2026-09-18 that line rendered as text with nothing behind it. On a
 * touch screen a link pin's first tap opens its callout, and the second
 * follows the link.
 */
export function PresenceMapFigure({
  map,
  sites,
  label,
  legend = true,
  order = 0,
  className,
}: PresenceMapFigureProps) {
  return (
    <Reveal
      order={order}
      role="group"
      aria-label={label}
      // A container, so a pin can be a share of the map's width.
      className={cn('@container relative aspect-map-india w-full max-w-map shrink-0', className)}
    >
      <MediaFrame
        image={map.image}
        alt=""
        sizes={SIZES_MAP}
        pending="map/dotted-map"
        className="absolute inset-0 bg-transparent"
        // The landmass has to sit inside its box whole — a `cover` crop
        // would take the coasts off, and every pin below is positioned
        // against the artwork's own coordinates.
        imageClassName="object-contain"
      />

      {sites.map((site, index) => {
        // The tooltip grows away from whichever edge the pin is nearest,
        // so it can never be clipped by the map's box. Decided here rather
        // than measured at runtime, because the coordinates are static.
        const towardsLeft = site.x > MAP_VIEWBOX.width * 0.55;
        const towardsBottom = site.y < MAP_VIEWBOX.height * 0.3;

        const pinClass = 'absolute size-touch -translate-x-1/2 -translate-y-1/2 cursor-pointer';
        // The pin and its halo are --map-pin-share percent of the map's width,
        // and square. `cqw` resolves against the figure, which is the
        // container below, so the pin follows the map's box rather than the
        // 44px button it sits in.
        const dotClass =
          'absolute top-1/2 left-1/2 aspect-square w-[calc(var(--map-pin-share)*1cqw)] -translate-x-1/2 -translate-y-1/2';
        const pinContent = (
          <>
            <span className="sr-only">
              {site.name}: {describeSite(site, legend)}
              {site.href !== undefined && ', Visit Location (opens in a new tab)'}
            </span>
            {/* The pin. A hard square, plus a halo that pulses out of it. */}
            <span
              aria-hidden="true"
              className={cn(
                dotClass,
                'rounded-none bg-white',
                'transition-transform duration-(--duration-micro)',
                'group-focus-within:scale-175 group-hover:scale-175 group-data-open:scale-175',
                'motion-reduce:transition-none',
              )}
            />
            <span
              aria-hidden="true"
              className={cn('anim-map-ping rounded-full bg-white', dotClass)}
            />
          </>
        );

        return (
          <MapPin
            key={site.id}
            link={site.href !== undefined}
            style={
              {
                left: `${String((site.x / MAP_VIEWBOX.width) * 100)}%`,
                top: `${String((site.y / MAP_VIEWBOX.height) * 100)}%`,
                '--anim-index': index,
              } as StyleWithVars
            }
          >
            {site.href === undefined ? (
              <button type="button" className={pinClass}>
                {pinContent}
              </button>
            ) : (
              <a href={site.href} target="_blank" rel="noopener noreferrer" className={pinClass}>
                {pinContent}
              </a>
            )}

            <div
              aria-hidden="true"
              className={cn(
                // Narrower on a phone, so a callout opening rightwards from a
                // pin near the middle of the map stays on the screen. From
                // `lg`, where the map sits beside its copy, uncapped: every
                // row holds one line (client, 2026-10-07), and the widest,
                // Uttar Pradesh's, still ends well inside the screen.
                'pointer-events-none absolute z-10 w-max max-w-(--map-tip-w-narrow) sm:max-w-(--map-tip-w) lg:max-w-none',
                'bg-paper-alt px-3.5 py-2.5 shadow-tooltip',
                // Grows out of the pin as well as fading in, so the
                // callout reads as opening from the site rather than
                // appearing over it.
                'scale-90 opacity-0 transition duration-(--duration-micro)',
                'group-focus-within:scale-105 group-hover:scale-105 group-data-open:scale-105',
                'motion-reduce:scale-100 motion-reduce:transition-none',
                'group-focus-within:opacity-100 group-hover:opacity-100 group-data-open:opacity-100',
                towardsLeft ? 'right-0 mr-4 origin-right' : 'left-0 ml-4 origin-left',
                towardsBottom ? 'top-0 mt-2' : 'bottom-0 mb-2',
              )}
            >
              <p className="text-body-sm font-bold text-ink">{site.name}</p>
              {/* One row per figure: the figure as it is published, then
                  the legend's name in that business's accent, and a paired
                  figure's partner after a "+". The figure keeps
                  --text-meta, the role it already had here; the name takes
                  the quieter --text-tile-note, the footnote-on-a-figure
                  role, which is not one of the five uppercase ones — at
                  --text-meta's 0.2em tracking "Solar Module Manufacturing"
                  would be half the map wide. §2.

                  The client's rule (2026-10-07): one line per figure where
                  the map sits beside its copy, wrapping only where the
                  section stacks. So from `lg` the figure, the name and the
                  partner are one unbroken line. From `sm` to `lg` the name
                  sits right of its figure, against the callout's edge, with
                  the partner on a line of its own under it. Below `sm` the
                  callout is too narrow for a name beside its figure, so
                  each drops under its figure, and the rows take a gap so
                  each pair reads as one. The space before the partner only
                  renders inline: between flex items it is dropped. */}
              <ul className="flex list-none flex-col gap-1.5 sm:gap-0.5">
                {site.figures.map((figure, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-3"
                  >
                    <span className="shrink-0 text-meta tracking-normal text-meta-paper uppercase">
                      {figure.value}
                    </span>
                    {(legend || figure.plus !== undefined) && (
                      <span className="flex flex-col text-tile-note sm:items-end sm:text-right lg:block lg:whitespace-nowrap">
                        {legend && (
                          <span className={METRIC_CLASS[figure.metric]}>
                            {METRIC_LABEL[figure.metric]}
                          </span>
                        )}{' '}
                        {figure.plus !== undefined && (
                          <span className={partnerClass(figure, figure.plus)}>
                            + {METRIC_LABEL[figure.plus]}
                          </span>
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {site.href !== undefined && (
                <p className="mt-1 flex items-center gap-1.5 text-tile-note text-body-soft">
                  <span className="size-1 rounded-full bg-body-soft" />
                  Visit Location
                </p>
              )}
            </div>
          </MapPin>
        );
      })}
    </Reveal>
  );
}
