import type { Metadata } from 'next';
import { CutoutSplit } from '@/components/sections/cutout-split';
import { PageHero } from '@/components/sections/page-hero';
// import { ProseSplit } from '@/components/sections/prose-split';
import { ValueGrid, ValueMark, type ValueGridItem } from '@/components/sections/value-grid';
import {
  ExcellenceMark,
  GrowthMark,
  SustainabilityMark,
} from '@/components/sections/value-grid/pillar-marks';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  aboutHero,
  aboutMeta,
  guidingPrinciples,
  ourAmbition,
  // ourEndeavours,
  strategicPillars,
} from '../_content/about-us';

export const metadata: Metadata = buildMetadata({
  title: aboutMeta.title,
  description: aboutMeta.description,
  // `trailingSlash: true` in next.config.ts, and the legacy site's URL is
  // `/about-us/`. /CLAUDE.md §2 rule 6 — the canonical must match exactly.
  path: '/about-us/',
});

/**
 * The three pillar marks, in the order the design lists their cards.
 *
 * Joined here rather than in `_content/about-us.ts` because a mark is a React
 * node and the content file is data. Same division the homepage draws when it
 * joins static tile copy to live capacity figures.
 */
const PILLAR_MARKS = [
  <GrowthMark key="growth" />,
  <ExcellenceMark key="excellence" />,
  <SustainabilityMark key="sustainability" />,
];

const pillarItems: ValueGridItem[] = strategicPillars.items.map((pillar, index) => ({
  ...pillar,
  mark: PILLAR_MARKS[index],
}));

const principleItems: ValueGridItem[] = guidingPrinciples.items.map((principle) => ({
  name: principle.name,
  body: principle.body,
  // The set's coloured variants, drawn as supplied on the paper ground.
  mark: <ValueMark image={principle.icon} ground="paper" />,
}));

/**
 * About Us — the first content page, and the template FE-07 → FE-15 inherit.
 *
 * Built to `About Us.dc.html` (Claude Design project
 * `f05dd0a1-42c8-4f44-b688-f8dceb7f677b`), read through the design MCP.
 *
 * **Five sections against the design's seven.** The design wraps its stats
 * band (§03) and its Mission/Vision/Ethos triad (§06) in `sc-if` flags whose
 * placeholder value is `false` — that is, it draws the page with both off, and
 * both already exist on the homepage. `docs/features/06-about-us.md` §3–4 asks
 * for both to be reused here. The client's call on 2026-09-10 was to follow
 * the design and omit them; the deviation is recorded in the tracker so it can
 * be reversed with two lines if that ruling changes.
 *
 * **The page snaps again**, as the homepage does: the client's call of
 * 2026-10-11, which also covers Career and the four business pages. The
 * design removed snapping on 2026-09-10 and FE-07 → FE-11 inherited a
 * template without it; this restores it through the homepage's mechanism,
 * `data-snap-sections` in globals.css. Each section is a screen with its
 * content centred, a scroll lands on the next, and the footer is the last
 * stop. A section taller than the screen scrolls freely inside and snaps at
 * its edges.
 *
 * `-mt-header lg:mt-0`: below `lg` the bar overlays the page and slides away
 * as you scroll, so the sections start at the viewport top, which means
 * giving back the `pt-header` the root layout puts on `<main>`. From `lg` the
 * bar offsets instead and the padding is correct as it stands. See the note
 * on --spacing-viewport in theme.css.
 *
 * A Server Component, and so is every section under it — nothing on this page
 * is interactive beyond links and CSS hover states.
 */
export default function AboutUsPage() {
  return (
    <div data-snap-sections className="-mt-header lg:mt-0">
      <PageHero {...aboutHero} snap />
      {/* "Our Endeavours" is withheld for now, on the client's instruction of
          2026-09-17. Its copy and artwork stay in `_content/about-us.ts`. */}
      {/* <ProseSplit {...ourEndeavours} /> */}
      <CutoutSplit {...ourAmbition} snap />
      {/* Outlined cards, to the client's reference of 2026-09-17. The accent
          went with the hairline it ran along. */}
      <ValueGrid
        title={strategicPillars.title}
        items={pillarItems}
        spacing="tight"
        variant="outlined"
        snap
      />
      <ValueGrid
        // "What We Believe" withheld on the client's instruction of 2026-09-17.
        // eyebrow={guidingPrinciples.eyebrow}
        title={guidingPrinciples.title}
        items={principleItems}
        columns="wide"
        // The accent that fills across the hairline on hover — the client's
        // ask of 2026-09-17, matching the team cards.
        accent
        // On paper, the client's alternation of 2026-10-14, as the homepage
        // alternates; the sections above it stay on the black ground.
        ground="paper"
        snap
      />
    </div>
  );
}
