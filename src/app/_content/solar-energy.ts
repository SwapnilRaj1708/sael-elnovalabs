import type { StaticImageData } from 'next/image';
// The map in this business's own ramp — the homepage map, recoloured.
import dottedMap from '@/assets/images/solar-energy-map.svg';
import type { CapabilityItem, CapabilitySplitProps } from '@/components/sections/capability-split';
import type { PageHeroProps } from '@/components/sections/page-hero';
import type { PresenceSite } from '@/components/sections/presence-map';
import type { ProjectsMapProps } from '@/components/sections/projects-map';
import type { ProseSplitProps } from '@/components/sections/prose-split';
import type { ValueGridItem, ValueGridProps } from '@/components/sections/value-grid';
import { cdnImage } from '@/lib/assets/cdn';
import { TODO_CONTENT } from '@/lib/config/site';
import { SIZES_BUSINESS_OVERVIEW_MEDIA } from '@/lib/utils/image-sizes';
import { tryBlobUrl } from '@/lib/utils/blob-url';

/**
 * The Solar Energy page's static content.
 *
 * Static rather than dynamic for the same reason About Us's is: this is
 * corporate copy that changes with a review and a deploy, not with a database
 * row. docs/content-model.md §2.
 *
 * **Every string here is transcribed verbatim from the live
 * https://www.sael.co/solar-energy/**, read from its HTML on 2026-09-18 and
 * with only its source whitespace collapsed. /CLAUDE.md §2 rule 3: nothing is
 * paraphrased, nothing missing has been invented, and the live page's own
 * spellings stand — "Karnatka", "Nagamangla", "Gr. Noida", "TL-related" — as
 * do its straight apostrophes.
 *
 * **That is SAEL's instruction of 2026-09-18 for the four business pages, and
 * it still stands for them**: their reference screenshot fixes the structure,
 * their live page fixes the copy, so where the two differ the live page was
 * followed. It is specific to these pages, not the general rule, which is
 * that SAEL's reviewed content for the new site is the authority for display
 * copy and sael.co is not (/CLAUDE.md §2 rule 8).
 *
 * ## The portfolio figure
 *
 * **The homepage ledger's, "8.3 GWp"**, since the client's request of
 * 2026-10-07 that every business page's Projects figure match the Business
 * Portfolio row on the homepage. Until then it was the live page's
 * **8299.5 MWp**, carried under SAEL's 2026-09-18 instruction for this page
 * (the live counter lands on 8299 and a static ".5" follows it). The
 * disagreement the backend's `docs/client/static-content-sign-off.md` §4
 * recorded between the two is settled in the ledger's favour.
 *
 * ## The artwork
 *
 * The overview and execution photographs and the hero video live in Azure
 * Blob Storage under `<container>/web-assets/media/solar-energy/`, as of the
 * client's move of 2026-09-21; they were committed to
 * `src/assets/images/solarEnergy/` for three days before that. The two
 * photographs are described by `cdnImage(path, width, height)` — see
 * `lib/assets/cdn.ts` — with **dimensions read from the blobs themselves**,
 * and are clipped to the two shapes that stayed in the repository
 * (`solarEnergy/mask1.svg`, `mask2.svg`, carried as `--mask-solar-*` in
 * theme.css). The hero poster is still `null` with a `pending` name. The map
 * is the homepage's, recoloured to this business's ramp (`solar-energy-map.svg`).
 *
 * The marks are joined to their cards by the page, not here: a `mark` is a
 * React node, and this file is data.
 */

/** A capability's copy. The page supplies its mark. */
export type CapabilityCopy = Omit<CapabilityItem, 'mark'>;

/** A practice card's copy. The page supplies its mark. */
export type PracticeCopy = Omit<ValueGridItem, 'mark'>;

/**
 * A photograph the client has not yet supplied.
 *
 * Typed as `StaticImageData | null` so each slot becomes an `import` — and a
 * type error at every call site that still reads it as possibly absent — the
 * day the asset lands.
 */
const PENDING: StaticImageData | null = null;

/** Describe one asset in the Solar Energy folder of the blob container. */
const solarAsset = (file: string, width: number, height: number): StaticImageData | null =>
  cdnImage(`web-assets/media/solar-energy/${file}`, width, height);

export const solarEnergyMeta = {
  /** The live page's own `<title>`, verbatim. */
  title: 'Solar Energy | SAEL',
  /**
   * The live page ships `<meta name="description" content="">`. Nothing to
   * transcribe, and nothing is invented: `buildMetadata()` drops the marker
   * rather than emitting it.
   */
  description: TODO_CONTENT,
} as const;

export const solarEnergyHero: PageHeroProps = {
  title: 'Solar Energy Generation',
  intro: 'Harnessing the Sun to Tread the Path of Sustainable Growth',
  // No trail, as on About Us since 2026-09-17 and as the reference draws it.
  align: 'center',
  // The client's ask of 2026-09-18: a video, not a photograph. The path is
  // container-relative and the host comes from AZURE_BLOB_BASE_URL, so no
  // hostname enters the repository (/CLAUDE.md §7); `null` when it is unset,
  // and the hero then shows the poster.
  video: tryBlobUrl('web-assets/media/solar-energy/solar-energy.mp4'),
  // The poster under the video and the still for reduced motion. Not yet
  // supplied.
  image: PENDING,
  pending: 'solar-energy/hero-poster',
  // The live page's own alt, verbatim. The reference screenshot's boardroom
  // photograph is flagged as placeholder art in the handover note.
  imageAlt: 'Solar Panel Inspection',
};

export const solarOverview: ProseSplitProps = {
  eyebrow: 'Overview',
  title: 'About Solar Energy Generation',
  body: [
    'At SAEL, we are spearheading the energy transition by engineering projects that harness the Sun. Our engineering prowess enables us to tailor solutions that strike a harmonious balance between innovation and practicality.',
    'Each project commences with a meticulous analysis encompassing technology, land suitability, solar irradiation, and existing grid infrastructure. We also consider factors such as geographical location, climate conditions affecting equipment, local amenities, and potential maintenance requirements. This comprehensive approach ensures that all our capital investment endeavours are undertaken with thorough risk assessment and meticulous planning.',
  ],
  media: {
    // Arrives already cut to its shape; next/image serves derived sizes.
    image: solarAsset('mask1Image.webp', 2418, 1890),
    // The live page's slot carries no alt. Written from the photograph,
    // which shows what is described and nothing more.
    alt: 'Rows of solar panels spread across green hillsides under a blue sky',
    orientation: 'landscape',
    frame: 'aspect-(--aspect-solar-overview) max-w-(--business-overview-media-w)',
    intrinsic: true,
    sizes: SIZES_BUSINESS_OVERVIEW_MEDIA,
  },
};

/**
 * The twenty-three sites the live page's map carries, in its own order, with
 * each capacity exactly as it publishes it.
 *
 * `href` is the live page's "Visit Location" destination where it has one —
 * fourteen of the twenty-three. The other nine render a pin with a callout and
 * no link, which is also what the live page does for them.
 *
 * Coordinates are points in the artwork's own 311.33 × 337.45 viewBox —
 * `src/assets/images/dotted-map.svg`. **They are fitted, not measured**, by
 * the same route the homepage's eleven state pins took: a lon→x / lat→y
 * linear fit through those eleven, with each site's approximate location
 * pushed through it. The three "Other Locations" entries have no single
 * place, so each sits near its state's centroid, offset from the named site
 * in the same state. Khavda sits at the artwork's western edge and was
 * clamped inward so its pin stays on the landmass. Several pairs are close —
 * Delhi and Gr. Noida, Solapur and Tadwal, Patiala and the other Punjab
 * sites — and their callouts open away from each other by the figure's own
 * edge rule. **The pins want an eye before this ships.**
 */
export const solarSites: readonly PresenceSite[] = [
  {
    id: 'punjab',
    name: 'Punjab',
    x: 86.8,
    y: 59.9,
    figures: [{ metric: 'solar-ipp', value: '685.6 MW' }],
  },
  {
    id: 'haryana',
    name: 'Haryana',
    x: 79.1,
    y: 76,
    figures: [{ metric: 'solar-ipp', value: '5.3 MW' }],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    x: 94.6,
    y: 84,
    figures: [{ metric: 'solar-ipp', value: '1 MW' }],
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    x: 125,
    y: 108.4,
    figures: [{ metric: 'solar-ipp', value: '196.2 MW' }],
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    x: 48.4,
    y: 116.3,
    figures: [{ metric: 'solar-ipp', value: '298 MW' }],
  },
  {
    id: 'assam',
    name: 'Assam',
    x: 270.4,
    y: 116,
    figures: [{ metric: 'solar-ipp', value: '1 MW' }],
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    x: 262.8,
    y: 156.4,
    figures: [{ metric: 'solar-ipp', value: '21 MW' }],
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    x: 33,
    y: 172.6,
    figures: [{ metric: 'solar-ipp', value: '2620 MW' }],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    x: 64,
    y: 204.6,
    figures: [
      { metric: 'solar-ipp', value: '133.4 MW' },
      { metric: 'solar-ipp', plus: 'storage', value: '275 MW' },
    ],
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    x: 109.8,
    y: 261,
    figures: [
      { metric: 'solar-ipp', value: '1599 MW' },
      { metric: 'solar-ipp', plus: 'storage', value: '1646 MW' },
    ],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    x: 71.4,
    y: 253,
    figures: [{ metric: 'solar-ipp', value: '1356 MW' }],
  },
];

export const solarProjects: Omit<ProjectsMapProps, 'sites'> = {
  eyebrow: 'Projects',
  title: 'Our Achievements in Solar Energy Generation',
  body: [
    'SAEL has made significant strides in the solar energy sector, emphasizing rapid expansion and enhancing manufacturing capabilities while prioritizing sustainability goals.',
    "Today, the company is catering to the electricity needs of energy deficient India and has been successful in setting up large scale solar power projects across states like Rajasthan, Gujarat, Andhra Pradesh, Uttar Pradesh, Maharashtra, Punjab, Mizoram, and Karnataka contributing substantially to the national grid and supporting India's renewable energy targets.",
  ],
  // The homepage ledger's figure. See the note at the top of this file.
  figure: {
    value: '8.3 GWp',
    label: 'Solar Energy Generation Capacity',
    note: '(contracted and awarded)',
  },
  map: { image: dottedMap },
  mapLabel: 'Map of SAEL solar project sites across India',
};

export const solarCapabilities: {
  eyebrow: CapabilitySplitProps['eyebrow'];
  title: CapabilitySplitProps['title'];
  items: readonly CapabilityCopy[];
  media: CapabilitySplitProps['media'];
} = {
  eyebrow: 'How Do We Work?',
  title: 'Proven Execution Capabilities',
  items: [
    {
      name: 'Project Selection and Monitoring',
      body: 'We have established multiple internal committees along with a dedicated Project Monitoring Committee to rigorously evaluate projects and mitigate risks effectively. Our in-house team is dedicated to continuously monitoring asset performance to maintain operational excellence.',
    },
    {
      name: 'Sustain Operational Efficiencies',
      body: 'We continually refine and enhance our solar plant design and execution capabilities, integrating advanced monitoring, tracking, and predictive analytics technologies for operational excellence.',
    },
    {
      name: 'Robust Development Capabilities',
      body: 'Vast relationships across business segments in the key states help in ensuring superior site selection. A strong local presence provides a better regulatory interface.',
    },
  ],
  media: {
    image: solarAsset('mask2Image.webp', 2332, 2299),
    // The live page's slot carries no alt. Written from the photograph.
    alt: 'Two people in front of a wall of screens showing satellite weather imagery',
  },
};

export const solarPractices: {
  eyebrow: string;
  title: ValueGridProps['title'];
  items: readonly PracticeCopy[];
} = {
  // The live page's label, under SAEL's 2026-09-18 instruction for this page
  // (copy from the live page, structure from the screenshot). The reference
  // screenshot reads "How do we reduce cost?".
  eyebrow: 'How We Reduce Cost?',
  title: 'Our EPC And O&M Practices',
  items: [
    {
      name: 'Dedicated Manpower and Supervisory Team',
      body: 'Dedicated team for regular cleaning of the module to ensure optimum generation. Pipeline with booster pumps installed across the plant layouts to ensure faster cleaning of modules.',
    },
    {
      name: 'Implementation & Monitoring of Pre-approved Plan',
      body: 'Daily, Weekly, and Monthly monitoring tests for preventive maintenance of all plant equipment including electrical, mechanical, and other to improve plant availability.',
    },
    {
      name: 'Designated Engineer for Evacuation',
      body: 'A dedicated engineer is assigned to monitor transmission line from plant to sub-station, to avoid any grid failure due to TL-related issues.',
    },
    {
      name: 'Advanced SCADA Technologies',
      body: 'Continuous monitoring of plant performance through SCADA and online monitoring systems, both at site and HO.',
    },
  ],
};
