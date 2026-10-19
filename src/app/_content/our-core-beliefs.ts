import type { StaticImageData } from 'next/image';
import heroImage from '@/assets/images/hero/our-core-beliefs.webp';
import type { Belief } from '@/components/sections/belief-stack';
import type { PageHeroProps } from '@/components/sections/page-hero';
import { cdnImage } from '@/lib/assets/cdn';
import { TODO_CONTENT } from '@/lib/config/site';
import { GOVERNANCE_PATH } from './corporate-governance';

/**
 * Our Core Beliefs' static content (FE-14).
 *
 * ## The copy
 *
 * The design's, `Our Core Beliefs.dc.html` (Claude Design project
 * `6afc516d-…`, 2026-10-06), which its handoff records as the live page's
 * word for word, line breaks collapsed. The live page's own spellings stand —
 * "Protected Area Management- Go/No Go Framework", "Optimisation", "Active
 * member of IBBI". Nothing is added: the belief sections carry no eyebrows,
 * figures or quotes, as the live page carries none.
 *
 * ## The artwork
 *
 * The live page's own files, in the blob container under
 * `web-assets/media/our-core-beliefs/` since 2026-10-08, renamed for where
 * each is drawn: each belief's id for its cut-out (`obf-1.webp` is
 * `environmental-stewardship.webp`, `farmers-group.webp` is
 * `our-social-impact.webp`, and so on). Until then they were read from the
 * legacy site. Dimensions are read from the blobs themselves, and match the
 * legacy files'. See `cdnImage()`.
 *
 * **The hero is one photograph, in the repo** (`hero/our-core-beliefs.webp`,
 * 1672 × 941), supplied 2026-10-13 to replace the three-photograph collage so
 * the hero matches every other inner page's. It is not yet in the blob
 * container with the rest of the page's artwork.
 *
 * The four belief images are cut-outs on transparent grounds, fitted rather
 * than cropped. Alt text is written from the images themselves; the
 * design's handoff had to infer two of them from file names.
 *
 * The icons are joined to their beliefs by the page, not here: an icon is a
 * React node, and this file is data.
 */

/** Describe one of the page's images. See the note above. */
const beliefsImage = (file: string, width: number, height: number): StaticImageData | null =>
  cdnImage(`web-assets/media/our-core-beliefs/${file}`, width, height);

export const coreBeliefsMeta = {
  /** The live page's own `<title>`, verbatim. */
  title: 'Our Core Beliefs - SAEL',
  /**
   * The live page ships `<meta name="description" content="">`. Nothing to
   * transcribe; `buildMetadata()` drops the marker rather than emitting it.
   */
  description: TODO_CONTENT,
} as const;

/** The hero: the standard `<PageHero>`, one full-bleed photograph. */
export const coreBeliefsHero: Omit<PageHeroProps, 'snap'> = {
  eyebrow: 'Sustainability',
  title: 'Our Core Beliefs',
  intro:
    'Our core beliefs are rooted in Sustainability, Driven by Integrity, and Empowered by Innovation',
  // No trail, as on every inner page since 2026-09-17, and the design
  // draws none. The page jump links the live hero carries were removed at
  // the client's request.
  align: 'center',
  image: heroImage,
  imageAlt:
    'Two pairs of hands holding a seedling in soil above a meadow of wildflowers at sunrise',
};

/** A belief's copy and artwork. The page supplies its icon. */
export type BeliefCopy = Omit<Belief, 'icon'>;

/**
 * In page order. The cut-out alternates sides from `lg` — end, start, end,
 * start — and each belief takes the next stop of the bright ramp as its
 * accent.
 */
export const beliefs: readonly BeliefCopy[] = [
  {
    id: 'environmental-stewardship',
    title: 'Environmental Stewardship',
    body: 'We are dedicated to minimizing our environmental impact and promoting sustainability in every aspect of our operations. This commitment guides our practices, from resource conservation and waste reduction to energy efficiency and eco-friendly innovations.',
    points: [
      'Transition towards Green Fleet',
      'Preserving Biodiversity & Natural Landscapes',
      'GHG Emissions & Avoidance Management',
      'Waste Management Standards',
      'Natural Resource Optimisation',
      'Climate Resilience & Policy Advocacy',
    ],
    cutout: {
      image: beliefsImage('environmental-stewardship.webp', 700, 719),
      alt: 'Cupped hands holding a seedling in a mound of soil',
      pending: 'our-core-beliefs/environmental-stewardship',
      anchor: 'right',
    },
    accent: 'violet',
    side: 'end',
    // The first and last beliefs on paper, the client's ask of 2026-10-14.
    ground: 'paper',
  },
  {
    id: 'our-social-impact',
    title: 'Our Social Impact',
    body: 'We believe in the importance of social responsibility and are dedicated to addressing key social issues through a range of initiatives. Our commitment extends to fostering community development, supporting education, promoting well-being, and advocating for social equity.',
    points: [
      'Community Giving Strategy',
      'Employee Welfare & Diversity',
      'Health & Safety Standards',
      'Social Impact Assessment Initiatives',
    ],
    cutout: {
      image: beliefsImage('our-social-impact.webp', 664, 538),
      alt: 'A group of smiling farmers in white turbans and kurtas',
      pending: 'our-core-beliefs/our-social-impact',
      anchor: 'bottom-flush',
    },
    accent: 'rose',
    side: 'start',
  },
  {
    id: 'sustainability-governance',
    title: 'Sustainability Governance',
    body: 'It involves creating structures, processes, and policies to integrate sustainability into our governance framework. This includes dedicated committees, environmental management systems, and clear guidelines to ensure accountability and continual improvement.',
    points: [
      'Corporate Governance Structure',
      'Sustainability Policies & Frameworks',
      'Risk Management',
      'Supply Chain Management',
    ],
    cutout: {
      image: beliefsImage('sustainability-governance.webp', 700, 757),
      alt: 'A light bulb with a tree growing inside it',
      pending: 'our-core-beliefs/sustainability-governance',
      anchor: 'bottom-flush',
    },
    accent: 'coral',
    side: 'end',
  },
  {
    id: 'our-biodiversity-commitment',
    title: 'Our Biodiversity Commitment',
    body: 'We are championing biodiversity and are fully committed to a thriving and sustainable future. Our efforts focus on protecting and enhancing natural ecosystems, preserving diverse species, and promoting environmental stewardship.',
    points: [
      'Biodiversity Impact Assessment',
      'Protected Area Management- Go/No Go Framework',
      'Active member of IBBI',
    ],
    cutout: {
      image: beliefsImage('our-biodiversity-commitment.webp', 952, 758),
      alt: 'A black-winged kite perched on a budding branch',
      pending: 'our-core-beliefs/our-biodiversity-commitment',
      anchor: 'left',
      flip: true,
    },
    accent: 'indigo',
    side: 'start',
    ground: 'paper',
  },
];

/**
 * The ESG Report link after the last belief — a button, not the floating tab
 * the live page uses, on the design's reasoning: a tab would be a new fixed
 * element, and over the content on a phone. Our Key ESG Metrics carries the
 * same link under its "Reporting Framework" heading.
 *
 * **It opens the Sustainability Reports page**, the Corporate Governance
 * tile that lists every report SAEL has published, in the same tab — the
 * client's request of 2026-10-08. Until then it opened the CY 2023 report's
 * PDF directly, in a new tab, which left choosing between CY 2023 and the
 * later CY 2024 open; the page lists both, so the question goes away.
 */
export const esgReport = {
  label: 'ESG Report',
  href: `${GOVERNANCE_PATH}sustainability-reports/`,
} as const;
