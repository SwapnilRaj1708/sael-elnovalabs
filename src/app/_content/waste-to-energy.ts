import type { StaticImageData } from 'next/image';
// The map in this business's own ramp — the homepage map, recoloured.
import dottedMap from '@/assets/images/agri-waste-to-energy-map.svg';
import type { CapabilityItem, CapabilitySplitProps } from '@/components/sections/capability-split';
import type { PageHeroProps } from '@/components/sections/page-hero';
import type { PresenceSite } from '@/components/sections/presence-map';
import type { ProjectsMapProps } from '@/components/sections/projects-map';
import type { ProseSplitProps } from '@/components/sections/prose-split';
import type { ValueGridItem, ValueGridProps } from '@/components/sections/value-grid';
import { cdnImage } from '@/lib/assets/cdn';
import { TODO_CONTENT } from '@/lib/config/site';
import { tryBlobUrl } from '@/lib/utils/blob-url';
import { SIZES_BUSINESS_OVERVIEW_MEDIA } from '@/lib/utils/image-sizes';

/**
 * The Agri Waste-to-Energy page's static content.
 *
 * **Every string here but the page's name is transcribed verbatim from
 * https://www.sael.co/waste-to-energy/**, read from its HTML on 2026-09-19
 * with only its source whitespace collapsed — including its curly apostrophes
 * (`SAEL’s`), the en dash in the standfirst, and its own inconsistent casing
 * of "Waste-To-Energy" / "Waste-to-Energy" from one heading to the next.
 * That is **SAEL's instruction of 2026-09-18 for the four business pages, and
 * it still stands for them**: their reference screenshot fixes the structure,
 * their live page fixes the copy. It is specific to these pages, not the
 * general rule, which is that SAEL's reviewed content for the new site is the
 * authority for display copy and sael.co is not (/CLAUDE.md §2 rule 8).
 * Follows `solar-energy.ts` section for section.
 *
 * **The page's name is SAEL's, not sael.co's.** SAEL renamed it "Agri
 * Waste-to-Energy" on 2026-10-01 (`5494e70`), in the `<title>` and the hero;
 * the page transcribed on 2026-09-19 said "Waste To Energy". The rename stands
 * — sael.co is not grounds for undoing it.
 *
 * ## Where the screenshot and the live page disagree
 *
 * - **Six benefit cards, not four.** The screenshot's four identical cards are
 *   placeholder art; the live page has six distinct benefits and all six are
 *   carried.
 * - **The label reads "Why Waste-to-Energy?"** and the heading "Benefits of
 *   Waste-to-Energy", as the live page casts them; the screenshot capitalises
 *   "To".
 * - **The portfolio figure lands on 164.9 MW.** Live markup:
 *   `<span data-target="164">0</span><span>.9</span> MW` — the counter stops
 *   at 164 and the ".9" is static, so the settled figure is 164.9, which is
 *   also what the homepage ledger sets.
 * - **"More Details" on the Ferozepur and Jaitu pins** link to project-detail
 *   pages the new site does not have. Only "Visit Location" is carried.
 *
 * ## Two Bikaner pins
 *
 * The live page lists **Bikaner (Rajasthan) 14.9 MW twice**, with two
 * different Google Maps destinations — two plants in one district. Both are
 * carried as separate pins with distinct ids, placed a few units apart so
 * neither hides the other; which is which on the ground is not something the
 * page says.
 *
 * ## The artwork
 *
 * The hero video and the two masked photographs live in Azure Blob Storage
 * under `<container>/web-assets/media/waste-to-energy/`, supplied 2026-09-21.
 * The photographs are described by `cdnImage(path, width, height)` with
 * **dimensions read from the blobs themselves** — see `lib/assets/cdn.ts` for
 * why that matters — and the video by `tryBlobUrl()`, so only
 * container-relative paths are committed and no hostname enters the
 * repository (/CLAUDE.md §7). The hero poster is still `null`: with
 * `AZURE_BLOB_BASE_URL` unset, or before the first frame, the hero holds its
 * box as a placeholder. The shapes the photographs are clipped to are the
 * Solar Energy pair, carried as `--mask-solar-*` in theme.css. The map is the
 * homepage's map, recoloured to this business's ramp (`agri-waste-to-energy-map.svg`).
 */

export type TechnologyCopy = Omit<CapabilityItem, 'mark'>;
export type BenefitCopy = Omit<ValueGridItem, 'mark'>;

const PENDING: StaticImageData | null = null;

/** Describe one asset in the Agri Waste-to-Energy folder of the blob container. */
const wteAsset = (file: string, width: number, height: number): StaticImageData | null =>
  cdnImage(`web-assets/media/waste-to-energy/${file}`, width, height);

export const wasteToEnergyMeta = {
  /**
   * SAEL's name for the page since 2026-10-01, in the legacy `<title>`
   * pattern. The live page's, transcribed on 2026-09-19, was
   * "Waste To Energy | SAEL".
   */
  title: 'Agri Waste-to-Energy | SAEL',
  /** The live page ships an empty description. Nothing invented. */
  description: TODO_CONTENT,
} as const;

export const wasteToEnergyHero: PageHeroProps = {
  title: 'Agri Waste-to-Energy',
  intro:
    'Converting Agricultural Waste Into Clean Energy – Contributing Towards Building a Sustainable Energy Ecosystem And Environment',
  align: 'center',
  // One line wherever it fits, not the 15ch hero measure — the client's call
  // of 2026-10-01, for this page only.
  titleMeasure: 'none',
  // Supplied 2026-09-21, as on Solar Energy: a video rather than a
  // photograph. `null` when the container is unconfigured, and the hero then
  // shows its poster.
  video: tryBlobUrl('web-assets/media/waste-to-energy/waste-to-energy.mp4'),
  // The poster under the video and the still for reduced motion. Not yet
  // supplied.
  image: PENDING,
  pending: 'waste-to-energy/hero-poster',
  /** The live page's own alt, verbatim. */
  imageAlt: "SAEL's Waste-To-Energy Plant Faridkot (Punjab)",
};

export const wasteToEnergyOverview: ProseSplitProps = {
  eyebrow: 'Overview',
  title: 'Agri Waste-to-Energy',
  body: [
    "SAEL's inception was rooted in a commitment to address the twin challenges of pollution and the growing energy needs of India. The pursuit of sustainable energy solutions has spurred exploration into innovative initiatives like Waste-to-Energy (WTE) projects. These projects present a promising solution, leveraging the consistent availability of paddy straw.",
    "SAEL has pioneered innovative solutions to address India's paddy straw generation and pollution challenges. By harnessing agricultural waste as a reliable resource, SAEL not only mitigates pollution on a significant scale but also offers a novel approach to overcoming the intermittent issues in the current renewable energy landscape.",
    'Our strategic objectives are bolstered by our dedication to advancing cutting-edge technologies, particularly in Waste-to-Energy projects. Through targeted efforts to embed sustainable practices across our operations, we are steadfastly committed to realising a future where sustainable energy is accessible to every household in India.',
  ],
  media: {
    image: wteAsset('mask1Image.webp', 1878, 2167),
    // The live page's slot carries no alt. Written from the photograph
    // itself, which describes what is visible and asserts nothing about
    // which plant it is.
    alt: 'A waste-to-energy plant, its blue-clad buildings and striped chimney stack reflected in the water in front of it',
    orientation: 'landscape',
    frame: 'aspect-(--aspect-solar-overview) max-w-(--business-overview-media-w)',
    intrinsic: true,
    sizes: SIZES_BUSINESS_OVERVIEW_MEDIA,
  },
};

/**
 * The eleven sites the live page's map carries, in its order, each capacity
 * as published. Coordinates are fitted through the homepage's state pins, as
 * Solar Energy's are — see the note there. **They want an eye before this
 * ships**, and the Punjab cluster (Ferozepur, Jaitu, Channu within a few
 * units of each other) most of all.
 */
export const wasteToEnergySites: readonly PresenceSite[] = [
  {
    id: 'punjab',
    name: 'Punjab',
    x: 86.8,
    y: 59.9,
    figures: [{ metric: 'agri-waste', value: '60.5 MW' }],
  },
  {
    id: 'haryana',
    name: 'Haryana',
    x: 79.1,
    y: 76,
    figures: [{ metric: 'agri-waste', value: '15 MW' }],
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    x: 48.4,
    y: 116.3,
    figures: [{ metric: 'agri-waste', value: '89.4 MW' }],
  },
];

export const wasteToEnergyProjects: Omit<ProjectsMapProps, 'sites'> = {
  eyebrow: 'Projects',
  title: 'Pioneering in Waste-to-Energy Generation',
  body: [
    'SAEL has made significant strides in the Waste-to-Energy (WTE) sector, focusing on converting agricultural waste into valuable energy resources. SAEL is the largest Agri WTE operator in India based on the operational capacity (CRISIL). By implementing advanced technologies and innovative processes, SAEL is transforming organic waste into renewable energy, thus contributing to a sustainable and environmentally friendly energy landscape.',
  ],
  figure: { value: '164.9 MW', label: 'Waste-to-Energy Capacity' },
  map: { image: dottedMap },
  mapLabel: 'Map of SAEL waste-to-energy plants across India',
  business: 'agri-waste',
};

export const wasteToEnergyTechnology: {
  eyebrow: CapabilitySplitProps['eyebrow'];
  title: CapabilitySplitProps['title'];
  items: readonly TechnologyCopy[];
  media: CapabilitySplitProps['media'];
} = {
  eyebrow: 'Technology',
  title: 'Waste-to-Energy Supplier & Technology',
  items: [
    {
      name: 'Equipped With the Best Available Technology',
      body: 'SAEL’s boilers are optimised to deliver and maintain high boiler thermal efficiency and Low maintenance & operation costs.',
    },
    {
      name: 'Adaptable and Long-Life Boiler Equipment',
      body: 'The straw feeding system is adaptable to different types of bales in size. It is designed to operate with corrosive and sticky ash caused by paddy straw combustion-giving longer lifetime and reliable operation.',
    },
    {
      name: 'Secured 3-Pass Straw-Fired Boiler',
      body: 'By straw-firing, the bales are conveyed through belt conveyors to the stokers, where the bale is pushed through the water-cooled ducts to the grate.',
    },
    {
      name: 'Conserving Water Through Air-Cooled Condensers',
      body: 'SAEL’s plants are equipped with the latest air-cooled condensers instead of the more commonly used water-cooled Condensers.',
    },
  ],
  media: {
    image: wteAsset('mask2Image.webp', 2419, 1889),
    // The live page's slot carries no alt. Written from the photograph.
    alt: 'Straw heaped on a conveyor running through a covered steel gallery',
  },
};

export const wasteToEnergyBenefits: {
  eyebrow: string;
  title: ValueGridProps['title'];
  items: readonly BenefitCopy[];
} = {
  eyebrow: 'Why Waste-to-Energy?',
  title: 'Benefits of Waste-to-Energy',
  items: [
    {
      name: 'The Cycle of Energy',
      body: 'Biomass is like solar energy but stored in organic matter. It is a renewable energy source because new plants, trees, and crops grow and replenish the supply.',
    },
    {
      name: 'Augmentation of Rural Economy',
      body: 'Generates direct and indirect employment as well as income through the value chain and empowers the rural offset to gain financial independence.',
    },
    {
      name: 'Improves Environmental Health and Air Quality',
      body: 'The biomass industry can divert millions of tons of agricultural waste, and prevent open burning agricultural byproducts.',
    },
    {
      name: 'Reduces Reliance on Fossil Fuels',
      body: 'Biomass represents a homegrown energy solution and enhances our national security by reducing our dependency on fossil fuels.',
    },
    {
      name: 'Steady and Reliable',
      body: 'Biomass is solar energy stored in organic matter. It is a renewable energy source because new plants, trees, and crops will grow and replenish the supply.',
    },
    {
      name: 'Abundant Local Fuel Supply',
      body: 'Biomass fuels are abundantly available; India is rich with a lot of underutilized agricultural waste.',
    },
  ],
};
