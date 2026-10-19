import type { StaticImageData } from 'next/image';
import type { CtaPanelProps } from '@/components/sections/cta-panel';
import type { GalleryGridProps } from '@/components/sections/gallery-grid';
import type { PageHeroProps } from '@/components/sections/page-hero';
import type { PointStackItem } from '@/components/sections/point-stack';
import type { ProseSplitProps } from '@/components/sections/prose-split';
import type { ValueGridItem, ValueGridProps } from '@/components/sections/value-grid';
import { cdnImage } from '@/lib/assets/cdn';
import { env } from '@/lib/config/env';
import { TODO_CONTENT } from '@/lib/config/site';

/**
 * The Careers page's static content.
 *
 * Static rather than dynamic for the same reason the other pages' is: this
 * is corporate copy that changes with a review and a deploy, not with a
 * database row. docs/content-model.md §2.
 *
 * **Every string here is transcribed verbatim from the live
 * https://www.sael.co/career/**, read from its HTML on 2026-09-22 and with
 * only its source whitespace collapsed. /CLAUDE.md §2 rule 3: nothing is
 * paraphrased, nothing missing has been invented, and the live page's own
 * choices stand — "Career At SAEL" in the hero against "Career at SAEL" in
 * the label under it and in the `<title>`, "recognize" and "harmonize" with
 * a z, and straight apostrophes throughout.
 *
 * ## The artwork
 *
 * Six images in `<container>/web-assets/media/career/`. The client uploaded
 * the gallery's four on 2026-09-22, matched to their slots by hash: each is
 * byte-identical to the file the live page serves, so that mapping is the
 * live page's own. The hero and the intro photograph were supplied by the
 * client on 2026-10-12 and are not the live page's.
 *
 * | Blob                  | Live file              | Intrinsic   | Slot                   |
 * |-----------------------|------------------------|-------------|------------------------|
 * | `career-hero.webp`    | —                      | 1600 × 739  | hero                   |
 * | `career-image-1.webp` | —                      | 1600 × 1069 | intro, beside the copy |
 * | `career-image-2.webp` | `career-banner-2.webp` | 1200 × 800  | gallery 1              |
 * | `career-image-3.webp` | `new-career-pic-2.webp`| 1200 × 800  | gallery 2              |
 * | `career-image-4.webp` | `career-banner-1.webp` | 1200 × 800  | gallery 3              |
 * | `career-image-5.jpg`  | `career-banner-3.jpg`  | 1024 × 683  | gallery 4              |
 *
 * The dimensions were read from the blobs themselves. `cdnImage()` carries
 * them so `next/image` reserves the right box before a byte arrives.
 *
 * **The hero is a photograph, not a video**, since 2026-10-12. It had been
 * the live page's looping office footage, `career-video.mp4`, with gallery 1
 * as its poster. `career-image-1.webp` was replaced under the same name on
 * the same day.
 *
 * The marks on the culture cards and the "Why Join" points are drawn, not
 * supplied — see `value-grid/career-marks.tsx` — and are joined to their
 * cards by the page, not here: a mark is a React node, and this file is data.
 */

/** Describe one asset in the Careers folder of the blob container. */
const careerAsset = (file: string, width: number, height: number): StaticImageData | null =>
  cdnImage(`web-assets/media/career/${file}`, width, height);

/**
 * The client's Oracle recruiting portal, or `null` when `CAREER_REDIRECT_URL`
 * is unset. Both CTAs on the page read this: when it is `null` they are
 * omitted rather than rendered pointing nowhere.
 */
export const careerPortalUrl: string | null = env.CAREER_REDIRECT_URL ?? null;

export const careerMeta = {
  /** The live page's own `<title>`, verbatim. */
  title: 'Career at SAEL',
  /**
   * The live page ships `<meta name="description" content="">`. Nothing to
   * transcribe, and nothing is invented: `buildMetadata()` drops the marker
   * rather than emitting it.
   */
  description: TODO_CONTENT,
} as const;

/** Alt text written from the photographs themselves; the live slots carry `alt=""`. */
const ALT = {
  hero: 'SAEL team members gathered in a boardroom in front of a screen reading ignite@SAEL',
  image1:
    'An SAEL engineer in a hard hat and safety vest checks readings on an electrical control panel',
  image2:
    'Three colleagues at a meeting table with laptops, discussing charts on a wall-mounted screen',
  image3: 'Two colleagues seated at a boardroom table, reviewing printed documents together',
  image4:
    'A technician in a hairnet and gloves operating the control panel of a manufacturing line',
  image5:
    'An engineer at a workstation studying a satellite image of a solar plant, with colleagues at desks behind',
} as const;

export const careerHero: PageHeroProps = {
  title: 'Career At SAEL',
  intro: 'A World of Opportunities Awaits You.',
  // No trail and centred copy, as every inner page has drawn since 2026-09-17.
  align: 'center',
  // A photograph; with no `video` key, <PageHero> renders an image hero.
  image: careerAsset('career-hero.webp', 1600, 739),
  imageAlt: ALT.hero,
};

/** Section 2. The CTA is joined by the page, because it is a `<Button>` and this is data. */
export const careerIntro: Omit<ProseSplitProps, 'action' | 'aside'> & {
  cta: string;
} = {
  eyebrow: 'Career at SAEL',
  title: 'A Place Where Careers Meet Growth and Impact',
  body: [
    'SAEL offers a transformative journey where individuals continuously grow and evolve. A space where serenity and serendipity are tapped with professional development and meaningful contributions to society or industry.',
  ],
  cta: 'Explore Vacancies',
  media: {
    // 1600 × 1069 is near 3:2; the landscape frame below crops it to its own ratio.
    image: careerAsset('career-image-1.webp', 1600, 1069),
    alt: ALT.image1,
    orientation: 'landscape',
    // The orientation's own box, plus the corner the live page rounds it to.
    frame:
      'aspect-(--aspect-prose-landscape) max-w-(--prose-media-landscape-w) overflow-hidden rounded-card',
  },
};

/** A culture card's copy. The page supplies its mark. */
export type CultureCopy = Omit<ValueGridItem, 'mark'>;

/** Section 3. */
export const cultureValues: {
  eyebrow: string;
  title: ValueGridProps['title'];
  items: readonly CultureCopy[];
} = {
  eyebrow: 'Our Culture',
  title: 'How Do We Work At SAEL?',
  items: [
    {
      name: 'Empowerment',
      body: 'We foster a sense of ownership, autonomy, and self-efficacy, enabling individuals to thrive and achieve their full potential in the workplace.',
    },
    {
      name: 'Appreciation',
      body: "We recognize and acknowledge individuals' contributions, talents, and efforts within the workplace.",
    },
    {
      name: 'Teamwork',
      body: 'We leverage diverse strengths, infuse mutual respect, and cultivate a supportive environment where collective efforts lead to greater success.',
    },
    {
      name: 'Integrity',
      body: 'We imbibe and adhere to moral principles, maintain transparency, and uphold trustworthiness in our actions and decisions.',
    },
    {
      name: 'Balance',
      body: 'We harmonize work responsibilities with personal well-being and celebrate a healthy integration of professional and personal life.',
    },
  ],
};

/** A "Why Join" point's name. The page supplies its mark. */
export type PointCopy = Omit<PointStackItem, 'mark'>;

/**
 * Section 4. The live page sets "Why Join SAEL?" as its heading and the
 * tagline as a paragraph under it; here the question is the label and the
 * tagline the heading, which is the hierarchy every other section on the
 * page (and the site) draws. Every word is the same.
 */
export const whyJoin: Omit<ProseSplitProps, 'action' | 'aside' | 'media'> & {
  points: readonly PointCopy[];
} = {
  eyebrow: 'Why Join SAEL?',
  title: 'Driving Individual and Business Transformations.',
  body: [
    'SAEL offers a dynamic and innovative culture where employees are encouraged to think creatively and contribute to impactful projects. With a strong emphasis on career growth and development, employees have access to training, mentorship, and diverse opportunities to advance their skills and progress.',
    'At SAEL, join a global community dedicated to positive change through sustainable technologies and social initiatives. Competitive benefits, diversity, and inclusion ensure employees feel valued, while international opportunities and exposure to innovation enrich their experience.',
  ],
  points: [
    { name: 'Positive Work Culture' },
    { name: 'Long-Term Career Paths' },
    { name: 'People-Oriented Leadership' },
  ],
};

/**
 * Section 5. The CTA is joined by the page. This link is the applicant's
 * route: the live page's "Get In Touch" modal is never opened by anything on
 * that page, and the client confirmed on 2026-09-22 that there is no form —
 * applicants go to the portal.
 */
export const jobCta: Omit<CtaPanelProps, 'action'> & { cta: string } = {
  title: 'Looking for your dream job?',
  body: [
    "Don't worry. We've got you! Register now and find jobs based on your interest and qualifications.",
  ],
  cta: 'Explore Jobs',
};

/** Section 6. */
export const lifeAtSael: Omit<GalleryGridProps, 'ground'> = {
  eyebrow: 'Life at SAEL',
  title: 'Hard-working, Ambitious, and Determined',
  body: [
    'Our platform offers avenues for relentless excellence pursuit, achieving lofty goals, and persevering in the face of challenges. We embody resilience, tenacity, and an unwavering drive to succeed, inspiring others with dedication and grit.',
  ],
  // The live page's own order: banner-2, new-career-pic-2, banner-1, banner-3.
  images: [
    { image: careerAsset('career-image-2.webp', 1200, 800), alt: ALT.image2 },
    { image: careerAsset('career-image-3.webp', 1200, 800), alt: ALT.image3 },
    { image: careerAsset('career-image-4.webp', 1200, 800), alt: ALT.image4 },
    { image: careerAsset('career-image-5.jpg', 1024, 683), alt: ALT.image5 },
  ],
};
