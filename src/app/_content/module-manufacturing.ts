import type { StaticImageData } from 'next/image';
// The map in this business's own ramp — the homepage map, recoloured.
import dottedMap from '@/assets/images/solar-module-map.svg';
import type { PageHeroProps } from '@/components/sections/page-hero';
import type { PresenceSite } from '@/components/sections/presence-map';
import type { ProductDownloadsProps } from '@/components/sections/product-downloads';
import type { ProjectsMapProps } from '@/components/sections/projects-map';
import type { ProseSplitProps } from '@/components/sections/prose-split';
import type { ValueGridItem, ValueGridProps } from '@/components/sections/value-grid';
import { cdnImage } from '@/lib/assets/cdn';
import { PRODUCTION_URL, TODO_CONTENT } from '@/lib/config/site';
import { tryBlobUrl } from '@/lib/utils/blob-url';
import { SIZES_BUSINESS_OVERVIEW_MEDIA } from '@/lib/utils/image-sizes';

/**
 * The Module Manufacturing page's static content.
 *
 * **Every string here is transcribed verbatim from the live
 * https://www.sael.co/module-manufacturing/**, read from its HTML on
 * 2026-09-19 with only its source whitespace collapsed. That is **SAEL's
 * instruction of 2026-09-18 for the four business pages, and it still stands
 * for them**: their reference screenshot fixes the structure, their live page
 * fixes the copy. It is specific to these pages, not the general rule
 * (/CLAUDE.md §2 rule 8). Follows `solar-energy.ts`.
 *
 * ## The page with a section fewer
 *
 * There is no "How do we work?" list here, on the live page or in the
 * screenshot. The page goes hero → overview → projects → the three product
 * sheets → the three "Manufacturing Process" cards (titled "Manufacturing
 * Prowess" until 2026-10-19).
 *
 * ## Where the screenshot and the live page disagree
 *
 * - **The portfolio figure is the homepage ledger's**, `3.6 GWp + 5 GW*`,
 *   since the client's request of 2026-10-07 that every business page's
 *   Projects figure match the Business Portfolio row. The ledger's footnote
 *   ("Operational · *Upcoming") is not carried: the client asked for the
 *   figure alone (2026-10-08). The
 *   screenshot draws only the caption "Module Manufacturing Portfolio"; the
 *   live page draws two counters over it, landing on 3625 MW + 5000 MW
 *   (proposed), which this page carried until then. The disagreement the
 *   backend's `docs/client/static-content-sign-off.md` §4 recorded is
 *   settled in the ledger's favour. The paragraphs keep "3.625 GW", the live
 *   page's own wording, which the rounded figure agrees with.
 * - **"Product Downloads."** The live page lists three product-sheet PDFs
 *   between the map and the prowess cards; the screenshot has no such block.
 *   Left out at first, because the PDFs live under the legacy site's
 *   `/documents/`, which the new site does not serve; **built on the
 *   client's ask of 2026-09-21**, linking to the legacy files where they are.
 *   See `moduleDownloads` for what that means at cutover.
 * - **"More Details" on the Punjab pin** links to `/firozpur-project-details/`,
 *   a page the new site does not have. Only the "Visit Location" link is
 *   carried.
 * - **The prowess cards have no headings**, on the live page or in the
 *   screenshot: a mark and a sentence. The live page also numbers them 01–03;
 *   the client asked for the numerals dropped on 2026-09-21, so `<ValueGrid>`
 *   renders them with neither `ordinal` nor `name`.
 *
 * ## The artwork
 *
 * The hero video and the one photograph live in Azure Blob Storage under
 * `<container>/web-assets/media/module-manufacturing/`, supplied 2026-09-21.
 * Only container-relative paths are committed; the host comes from
 * `AZURE_BLOB_BASE_URL` (/CLAUDE.md §7). The hero poster is still `null`.
 * There is no second photograph, and correctly so — this is the page without
 * a capability section. The map is the homepage's, recoloured to this business's ramp (`solar-module-map.svg`).
 *
 * **The photograph arrives pre-cut.** `mask1Image.webp` carries its shape in
 * its alpha channel, so it is drawn unmasked at its own ratio (`intrinsic`).
 */

export type ProwessCopy = Omit<ValueGridItem, 'mark'>;

const PENDING: StaticImageData | null = null;

/** Describe one asset in the Module Manufacturing folder of the blob container. */
const moduleAsset = (file: string, width: number, height: number): StaticImageData | null =>
  cdnImage(`web-assets/media/module-manufacturing/${file}`, width, height);

export const moduleMeta = {
  /**
   * The live page's own `<title>`, verbatim — a hyphen where the other three
   * business pages carry a pipe. Transcribed, not normalised; FE-22 settles
   * the separator against the legacy titles (see `our-team.ts`).
   */
  title: 'Module Manufacturing - SAEL',
  /** The live page ships an empty description. Nothing invented. */
  description: TODO_CONTENT,
} as const;

export const moduleHero: PageHeroProps = {
  title: 'Solar Module Manufacturing',
  intro:
    "Modules: Building Blocks of Innovation, Engineered for Excellence, Shaping Tomorrow's Technology Landscape",
  align: 'center',
  // Supplied 2026-09-21, as on Solar Energy and Agri Waste-to-Energy: a video
  // rather than a photograph. `null` when the container is unconfigured, and
  // the hero then shows its poster.
  video: tryBlobUrl('web-assets/media/module-manufacturing/module-manufacturing.mp4'),
  // The poster under the video and the still for reduced motion. Not yet
  // supplied.
  image: PENDING,
  pending: 'module-manufacturing/hero-poster',
  /** The live page's own alt, verbatim. */
  imageAlt: 'Module Manufacturing',
};

export const moduleOverview: ProseSplitProps = {
  eyebrow: 'Overview',
  title: 'About Solar Module Manufacturing',
  body: [
    "SAEL stands at the forefront of sustainable innovation as a leading solar module manufacturing company. With a steadfast commitment to excellence, we harness cutting-edge technology to produce high-quality solar modules, featuring operational solar module assembly lines with a combined capacity of 3.625 GW per year in Rajasthan and Punjab, India. We are manufacturing the latest Bifacial N-Type TOPCon modules, with the industry's leading efficiency.",
    "Our dedication to sustainability extends beyond products; it's ingrained in every aspect of our operations.",
  ],
  media: {
    image: moduleAsset('mask1Image.webp', 2478, 2123),
    // The live page's slot carries no alt. Written from the photograph
    // itself.
    alt: 'A robotic arm lifting a solar module by vacuum cups on an assembly line inside a factory',
    orientation: 'landscape',
    frame: 'aspect-(--aspect-solar-overview) max-w-(--business-overview-media-w)',
    intrinsic: true,
    sizes: SIZES_BUSINESS_OVERVIEW_MEDIA,
  },
};

/**
 * The three sites the live page's map carries, in its order. The live page
 * pins states rather than towns here, so the coordinates are the homepage's
 * own state pins for Punjab, Rajasthan and Uttar Pradesh.
 */
export const moduleSites: readonly PresenceSite[] = [
  {
    id: 'punjab',
    name: 'Punjab',
    x: 86.8,
    y: 59.9,
    figures: [{ metric: 'module-assembly', value: '225 MW' }],
    // href: 'https://maps.app.goo.gl/k7XpdviL8peJT1NT6',
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    x: 48.4,
    y: 116.3,
    figures: [{ metric: 'module-assembly', value: '3400 MW' }],
    // href: 'https://maps.app.goo.gl/UW8wXkYiQQG7WzHdA',
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh (proposed)',
    x: 125,
    y: 108.4,
    figures: [{ metric: 'module-assembly', plus: 'solar-cell', value: '10000 MW' }],
  },
];

export const moduleProjects: Omit<ProjectsMapProps, 'sites'> = {
  eyebrow: 'Projects',
  title: 'Module Manufacturing',
  body: [
    "SAEL distinguishes itself as one of the select Indian renewable energy firms equipped with in-house solar manufacturing and assembly infrastructure. Currently, we are developing a robust ecosystem for Solar PV manufacturing, featuring operational solar module assembly lines with a combined capacity of 3.625 GW per year in Rajasthan and Punjab and an upcoming 5 GW facility in Uttar Pradesh, India. We are manufacturing the latest Bifacial N-Type TOPCon modules, with the industry's leading efficiency.",
  ],
  // The homepage ledger's figure, verbatim. See the note at the top of this
  // file.
  figure: { value: '3.6 GW + 5 GW*', label: 'Module Manufacturing Capacity' },
  map: { image: dottedMap },
  mapLabel: 'Map of SAEL module manufacturing sites across India',
  business: 'module-assembly',
};

export const moduleProwess: {
  title: ValueGridProps['title'];
  items: readonly ProwessCopy[];
} = {
  // No label on the live page or in the screenshot — the one section on the
  // four business pages that opens straight on its heading.
  title: 'Manufacturing Process',
  items: [
    {
      body: 'ISO 9001, ISO 45001 and ISO 27001 certifications for Module Manufacturing Assembly',
    },
    {
      body: 'MES integration for real-time and data-driven quality assurance',
    },
    {
      body: 'Integrated with intelligent inspection and control systems',
    },
  ],
};

/**
 * "Product Downloads" — the three module datasheets, titles verbatim from the
 * live page.
 *
 * **The hrefs point at the legacy site's files, on purpose and for now.** The
 * PDFs are served by the current sael.co under `/documents/product-downloads/`
 * and nowhere else; they are not committed here (/CLAUDE.md §8) and have not
 * been uploaded to the blob container. The client's instruction of 2026-09-21
 * was to link to where they are today. Composed on `PRODUCTION_URL` rather
 * than a bare path so the links work from a staging host — and so that it is
 * plain that **the day the new site takes over www.sael.co, these become
 * 404s** unless the three files have been moved to blob storage and the hrefs
 * rebuilt with `tryBlobUrl()`. That is a cutover task.
 *
 * No sizes: the legacy page shows none and the files were not fetched to
 * measure them.
 */
export const moduleDownloads = {
  title: 'Product Downloads',
  items: [
    {
      title: 'SAEL Solar TOPCon Bifacial G12R 615 635 Wp',
      href: `${PRODUCTION_URL}/documents/product-downloads/sael-solar-topcon-bifacial-g12r-615-635-wp.pdf`,
    },
    {
      title: 'SAEL Solar TOPCon Bifacial M10R 580 600 Wp',
      href: `${PRODUCTION_URL}/documents/product-downloads/sael-solar-topcon-bifacial-m10r-580-600-wp.pdf`,
    },
    {
      title: 'SAEL Solar Mono PERC Bifacial M10R 540 560 Wp',
      href: `${PRODUCTION_URL}/documents/product-downloads/sael-solar-mono-perc-bifacial-m10r-540-560-wp.pdf`,
    },
  ],
} satisfies Pick<ProductDownloadsProps, 'title' | 'items'>;
