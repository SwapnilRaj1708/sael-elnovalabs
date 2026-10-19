import type { StaticImageData } from 'next/image';
import type { StorySplitProps } from '@/components/sections/story-split';
import { cdnImage } from '@/lib/assets/cdn';
import { TODO_CONTENT } from '@/lib/config/site';

/**
 * Story of Our Influence's static content (FE-12).
 *
 * Static for the reason About Us's is: corporate copy that changes with a
 * review and a deploy, not with a database row. docs/content-model.md §2.
 *
 * ## The copy
 *
 * The headings and stories are the design's, `Story of Our Influence.dc.html`
 * (Claude Design project `6afc516d-…`, 2026-10-06), whose handoff records
 * them as the live page's word for word with line breaks collapsed and the
 * "ﬁ" ligature written as plain "fi". The straight apostrophes and the
 * quotation marks round "PS 6 - Biodiversity Conservation," are the live
 * page's own and stand.
 *
 * **The three eyebrows are the designer's suggestions, not SAEL's copy** —
 * "Community", "Biodiversity", "Public Health". The live page has none.
 * They are on SAEL's sign-off list; delete a line to drop one, and the
 * section closes up.
 *
 * ## The photographs
 *
 * The live page's own three files, in the blob container under
 * `web-assets/media/story-of-our-influence/` since 2026-10-08, renamed for
 * the story each illustrates (`women-farmer.jpg` is `community.jpg`,
 * `Great_Indian_Bustard.webp` is `biodiversity.webp`, `in-4.webp` is
 * `public-health.webp`). Until then they were read from the legacy site.
 * Dimensions are read from the blobs themselves, and match the legacy
 * files'. See `cdnImage()`.
 *
 * The alt text is written from the photographs. **The third is not what the
 * design's handoff guessed from its file name** ("a family in their
 * village"): it is a power plant, and it is described as one.
 */

/** Describe one of the page's photographs. See the note above. */
const storyImage = (file: string, width: number, height: number): StaticImageData | null =>
  cdnImage(`web-assets/media/story-of-our-influence/${file}`, width, height);

export const storyMeta = {
  /** The live page's own `<title>`, verbatim. */
  title: 'Story of Our Influence - SAEL',
  /**
   * The live page ships `<meta name="description" content="">`. Nothing to
   * transcribe; `buildMetadata()` drops the marker rather than emitting it.
   */
  description: TODO_CONTENT,
} as const;

/**
 * The page's `<h1>`. The design draws no hero — the first story is the first
 * screen — so the title is the page's name for assistive technology and
 * search alone, and is not drawn.
 */
export const storyTitle = 'Story of Our Influence';

/** In page order. The photograph alternates sides from `lg`: start, end, start. */
export const stories: readonly Omit<StorySplitProps, 'snap'>[] = [
  {
    id: 'community',
    eyebrow: 'Community',
    title: 'Empowering Local Communities through Employment and Economic Growth',
    body: "In the heart of rural Punjab, Rajasthan, and Haryana, where the shadow of agricultural waste looms large, SAEL's presence has become a beacon of hope. Being instrumental in transforming lives, SAEL began purchasing agricultural waste from local farmers. Not only did this initiative provide them with a steady income, but it also offered a lifeline to the fragile ecosystems surrounding the villages. With biodiversity rapidly declining due to climate change and habitat destruction, SAEL's commitment to waste management not only empowers the community but also serves as a vital lifeline for countless species that call these fields home.",
    media: {
      image: storyImage('community.webp', 1679, 2304),
      alt: 'Two women harvesting wheat by hand in a sunlit field',
      pending: 'story-of-our-influence/community',
    },
    side: 'start',
  },
  {
    id: 'biodiversity',
    eyebrow: 'Biodiversity',
    title: 'Protecting Biodiversity and Ecosystems through Waste Management',
    body: 'At SAEL, we value and seek to protect the ecosystems that we work in. We strive to be good environmental stewards and take pride in our efforts to help these ecosystems thrive, while maintaining high standards of service for our customers. At our power generation and manufacturing facilities, we collaborate with biologists to actively monitor and protect local and migratory species, ensuring strict adherence to environmental permits and deploying adaptive mitigation strategies to maintain high environmental standards. We adhere to IFC Performance Standards, notably "PS 6 - Biodiversity Conservation," conducting thorough Environmental and Social Screening to preemptively avoid selecting lands with biodiversity sensitivities. If identified, we actively seek alternative locations for our projects.',
    media: {
      image: storyImage('biodiversity.webp', 2378, 2299),
      alt: 'A rhinoceros and its calf standing in grassland',
      pending: 'story-of-our-influence/biodiversity',
    },
    side: 'end',
  },
  {
    id: 'health',
    eyebrow: 'Public Health',
    title: 'Improving Public Health and Mitigating Air Pollution',
    body: "In the villages of Haryana, where the air once hung heavy with the acrid scent of burning waste, the Kumar family's story is one of resilience and renewal. Amidst the looming threat of respiratory ailments and compromised health, SAEL's Waste-to-Energy Plants emerged as beacons of clean air and hope. Today, as the Kumar family breathes in the crisp, pollution-free air, they bear witness to the transformative power of SAEL's commitment to environmental stewardship. In an era defined by climate crisis and ecological upheaval, SAEL's efforts not only safeguard public health but also serve as a bulwark against the tide of biodiversity loss, ensuring that future generations inherit a world teeming with life and possibility.",
    media: {
      image: storyImage('public-health.webp', 2419, 1892),
      alt: 'An elderly woman laughing among her neighbours in a village lane',
      pending: 'story-of-our-influence/public-health',
    },
    side: 'start',
    // On paper, the client's ask of 2026-10-14; the first two stay dark.
    ground: 'paper',
  },
];
