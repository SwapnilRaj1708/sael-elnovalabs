import type { Metadata } from 'next';
import Image from 'next/image';
import biodiversityIcon from '@/assets/icons/our-biodiversity-commitment/animated/39b-biodiversity-butterfly-notile-animated.svg';
import governanceIcon from '@/assets/icons/sustainability-governance/animated/38a-governance-pillars-white-animated.svg';
import stewardshipIcon from '@/assets/icons/environmental-stewardship/animated/36b-stewardship-hand-leaf-notile-animated.svg';
import socialIcon from '@/assets/icons/our-social-impact/animated/37b-social-community-heart-white-animated.svg';
import { EsgReportLink } from '@/app/_lib/esg-report-link';
import { BeliefStack, type Belief } from '@/components/sections/belief-stack';
import { PageHero } from '@/components/sections/page-hero';
import { buildMetadata } from '@/lib/seo/metadata';
import { beliefs, coreBeliefsHero, coreBeliefsMeta } from '../_content/our-core-beliefs';

export const metadata: Metadata = buildMetadata({
  title: coreBeliefsMeta.title,
  description: coreBeliefsMeta.description,
  // `trailingSlash: true` in next.config.ts, and the legacy site's URL is
  // `/our-core-beliefs/`. /CLAUDE.md §2 rule 6.
  path: '/our-core-beliefs/',
});

/**
 * The beliefs' icons, in card order. Joined here rather than in
 * `_content/our-core-beliefs.ts` because an icon is a React node and the
 * content file is data — the division every page draws.
 *
 * The supplied animated icons (36-39, 2026-10-08), which replaced lucide's
 * leaf, users, landmark and bird. Fixed-colour files that animate themselves
 * on a 3.5s loop, sized to sit in the badge. Decorative: the badge they sit
 * in is `aria-hidden`, and the heading beside it names the belief.
 *
 * Each in the variant for its belief's ground: the set's coloured no-tile
 * file for the first and last, which are on paper since 2026-10-14, and the
 * white one for the two between.
 */
const BELIEF_ICON_CLASS = 'size-14 object-contain lg:size-16';

const BELIEF_ICONS = [
  <Image key="stewardship" src={stewardshipIcon} alt="" className={BELIEF_ICON_CLASS} />,
  <Image key="social" src={socialIcon} alt="" className={BELIEF_ICON_CLASS} />,
  <Image key="governance" src={governanceIcon} alt="" className={BELIEF_ICON_CLASS} />,
  <Image key="biodiversity" src={biodiversityIcon} alt="" className={BELIEF_ICON_CLASS} />,
];

const beliefItems: Belief[] = beliefs.map((belief, index) => ({
  ...belief,
  icon: BELIEF_ICONS[index],
}));

/**
 * Our Core Beliefs (FE-14) — a photograph hero, the four beliefs as outlined
 * cards, and the ESG Report.
 *
 * Built to `Our Core Beliefs.dc.html` (Claude Design project `6afc516d-…`,
 * 2026-10-06), read through the design MCP. Two sections:
 *
 *  - the standard `<PageHero>`, centred, with one full-bleed photograph like
 *    every other inner page — the design's three-photograph collage was
 *    replaced on 2026-10-13, at the client's request;
 *  - `<BeliefStack>`, the four beliefs as cards with their cut-outs, icons,
 *    checklists and accents, and the ESG Report pill under the last.
 *
 * **The page snaps, as the homepage does** (the client's call of 2026-10-06):
 * the hero is the first stop, each belief is a screen of its own, and the
 * footer is the last. It uses the homepage's mechanism, `data-snap-sections`
 * in globals.css, and nothing of its own. The design draws the beliefs as
 * one column with wide gaps; as screens, the gaps are the sections' own.
 *
 * `docs/features/14-our-core-beliefs.md` asks for `<HighlightGrid>` and no
 * new section components. The design draws something `<HighlightGrid>`
 * cannot — a card per belief, each with a cut-out, a checklist and its own
 * accent — so `<BeliefStack>` is new, and is the one new section here.
 * Mission/Vision/Ethos is not repeated: the design does not draw it.
 *
 * `-mt-header lg:mt-0`: below `lg` the masthead overlays the page rather than
 * offsetting it, so the sections start at the viewport top. See the homepage.
 *
 * A Server Component; only the reveals are client.
 */
export default function OurCoreBeliefsPage() {
  return (
    <div data-snap-sections className="-mt-header lg:mt-0">
      <PageHero {...coreBeliefsHero} snap />
      {/* The pill sits under the last belief, on that belief's paper. */}
      <BeliefStack beliefs={beliefItems} action={<EsgReportLink ground="paper" />} snap />
    </div>
  );
}
