import type { StaticImageData } from 'next/image';
// The map in this business's own ramp — the homepage map, recoloured.
import dottedMap from '@/assets/images/solar-cell-map.svg';
import type { CapabilityItem, CapabilitySplitProps } from '@/components/sections/capability-split';
import type { PageHeroProps } from '@/components/sections/page-hero';
import type { PresenceSite } from '@/components/sections/presence-map';
import type { ProseSplitProps } from '@/components/sections/prose-split';
import { cdnImage } from '@/lib/assets/cdn';
import { TODO_CONTENT } from '@/lib/config/site';
import { SIZES_BUSINESS_OVERVIEW_MEDIA } from '@/lib/utils/image-sizes';

/**
 * The Solar Cell Manufacturing page's static content.
 *
 * **Every string here is transcribed verbatim from the live
 * https://www.sael.co/solar-cell-manufacturing/**, read from its HTML on
 * 2026-09-19 with only its source whitespace collapsed — including its curly
 * apostrophes (`SAEL’s`, `India’s`). That is **SAEL's instruction of
 * 2026-09-18 for the four business pages, and it still stands for them**:
 * their reference screenshot fixes the structure, their live page fixes the
 * copy. It is specific to these pages, not the general rule (/CLAUDE.md §2
 * rule 8). Same bargain as `solar-energy.ts`, which this follows section for
 * section.
 *
 * ## What the live page does not have
 *
 * **No portfolio figure.** The reference screenshot draws "5 GW" over a
 * "Portfolio" caption under the projects copy; the live page has no such
 * block — the 5 GW appears in the paragraph and on the map's one pin, and
 * "Portfolio" appears nowhere on the page. /CLAUDE.md §2 rule 3: nothing is
 * added, so `<ProjectsMap>` is given no `figure` here. Flagged for the client;
 * restoring it is one line once they confirm the caption.
 *
 * **No headings on the four highlights.** The live page sets them as four
 * bare paragraphs, and so does the screenshot. `<CapabilitySplit>` renders
 * them mark-and-copy only.
 *
 * ## The artwork
 *
 * All three photographs live in Azure Blob Storage under
 * `<container>/web-assets/media/solar-cell-manufacturing/`, supplied
 * 2026-09-21 and described by `cdnImage(path, width, height)` with
 * **dimensions read from the blobs themselves**. Only container-relative
 * paths are committed (/CLAUDE.md §7). The two masked slots take the same
 * `mask1`/`mask2` shapes as Solar Energy — both assets are opaque, so the
 * CSS mask does the cutting, unlike Module Manufacturing's, which arrives
 * pre-shaped. The map is the homepage's, recoloured to this business's ramp (`solar-cell-map.svg`).
 *
 * **The hero is a photograph, not a video**, on the client's instruction of
 * 2026-09-21 — the one business page of the four without one. `<PageHero>`
 * needs nothing special for that: it draws the photograph whenever `video`
 * is absent, which is the About Us behaviour.
 */

export type HighlightCopy = Omit<CapabilityItem, 'mark'>;

/**
 * Describe one asset in the Solar Cell Manufacturing folder of the blob
 * container.
 */
const cellAsset = (file: string, width: number, height: number): StaticImageData | null =>
  cdnImage(`web-assets/media/solar-cell-manufacturing/${file}`, width, height);

export const solarCellMeta = {
  /** The live page's own `<title>`, verbatim. */
  title: 'Solar Cell Manufacturing | SAEL',
  /** The live page ships an empty description. Nothing invented. */
  description: TODO_CONTENT,
} as const;

export const solarCellHero: PageHeroProps = {
  title: 'Solar Cell Manufacturing',
  intro: 'Harnessing the Sun to Tread the Path of Sustainable Growth',
  align: 'center',
  // A photograph rather than a video, unlike the other three business pages.
  image: cellAsset('hero-image.webp', 1344, 768),
  /**
   * Written from the photograph. The live page's own alt is the bare
   * "Solar Cell Manufacturing", but that describes a *different* banner —
   * the client replaced the asset on 2026-09-21 — and repeating the page
   * title tells a screen-reader user nothing they have not just heard.
   */
  imageAlt:
    'A robotic gripper lifting a stack of blue solar cells from a foam tray on a production line',
};

export const solarCellOverview: ProseSplitProps = {
  eyebrow: 'Overview',
  title: 'About Solar Cell Manufacturing',
  body: [
    'SAEL is poised to further strengthen its renewable energy value chain through the development of an advanced solar cell manufacturing facility in Greater Noida. This upcoming plant represents a strategic move toward backward integration, ensuring greater control over quality, supply reliability, and technology adoption within the solar ecosystem.',
    "The facility will feature state-of-the-art automation and focus on high-efficiency N-Type TOPCon cell technology, enabling SAEL to support both its own module production and the broader market's evolving needs. Sustainability and operational excellence will remain central to all processes, in line with SAEL's commitment to responsible growth and innovation.",
  ],
  media: {
    image: cellAsset('mask1Image.jpg', 503, 503),
    // The live page's slot carries no alt. Written from the photograph.
    alt: 'Stacks of blue solar cells resting in foam trays on an automated production line',
    orientation: 'landscape',
    frame: 'aspect-(--aspect-solar-overview) max-w-(--business-overview-media-w)',
    mask: 'mask-(--mask-solar-overview)',
    sizes: SIZES_BUSINESS_OVERVIEW_MEDIA,
  },
};

/**
 * The one site the live page's map carries. Its coordinate is Solar Energy's
 * "Gr. Noida (Uttar Pradesh)" pin — the same place — so the two pages agree.
 */
export const solarCellSites: readonly PresenceSite[] = [
  {
    id: 'greater-noida',
    name: 'Greater Noida',
    x: 94.6,
    y: 84,
    figures: [{ metric: 'solar-cell', value: '5 GW' }],
  },
];

export const solarCellProjects = {
  eyebrow: 'Projects',
  title: 'Solar Cell Manufacturing (proposed)',
  body: [
    'The Greater Noida plant will have an annual capacity of 5 GW, which will position SAEL to meet increasing demand for advanced solar solutions.',
    'This backward integration will optimize production efficiency, reduce reliance on imports, and accelerate the deployment of next-generation solar technologies across India.',
  ],
  figure: {
    value: '5 GW*',
    label: 'Cell Manufacturing Capacity',
    note: '(under development)',
  },
  map: { image: dottedMap },
  mapLabel: 'Map of the SAEL solar cell manufacturing site in India',
} as const;

export const solarCellHighlights: {
  eyebrow: CapabilitySplitProps['eyebrow'];
  title: CapabilitySplitProps['title'];
  items: readonly HighlightCopy[];
  media: CapabilitySplitProps['media'];
} = {
  eyebrow: 'Highlights',
  title: 'Solar Cell Manufacturing Business',
  items: [
    {
      body: 'The upcoming facility marks a significant step in SAEL’s backward integration strategy, enhancing supply chain resilience and quality assurance.',
    },
    {
      body: 'Advanced automation and stringent quality protocols will be implemented to deliver industry-leading N-Type TOPCon cells.',
    },
    {
      body: 'The project aligns with India’s renewable energy targets, supporting scalable and efficient solar module manufacturing.',
    },
    {
      body: 'Strong government policy support and a skilled talent pool will underpin the facility’s success.',
    },
  ],
  media: {
    image: cellAsset('mask2Image.webp', 800, 1054),
    // The live page's slot carries no alt. Written from the photograph.
    alt: 'A row of solar cells under red inspection light on a stringing machine',
  },
};
