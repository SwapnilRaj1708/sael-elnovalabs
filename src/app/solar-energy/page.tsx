import type { Metadata } from 'next';
import { CapabilitySplit, type CapabilityItem } from '@/components/sections/capability-split';
import { PageHero } from '@/components/sections/page-hero';
import { ProjectsMap } from '@/components/sections/projects-map';
import { ProseSplit } from '@/components/sections/prose-split';
import { ValueGrid, type ValueGridItem } from '@/components/sections/value-grid';
import {
  DevelopmentMark,
  EfficiencyMark,
  EvacuationMark,
  PlanMark,
  ScadaMark,
  SelectionMark,
  TeamMark,
} from '@/components/sections/value-grid/solar-marks';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  solarCapabilities,
  solarEnergyHero,
  solarEnergyMeta,
  solarOverview,
  solarPractices,
  solarProjects,
  solarSites,
} from '../_content/solar-energy';

export const metadata: Metadata = buildMetadata({
  title: solarEnergyMeta.title,
  description: solarEnergyMeta.description,
  // `trailingSlash: true` in next.config.ts, and the legacy site's URL is
  // `/solar-energy/`. /CLAUDE.md §2 rule 6 — the canonical must match exactly.
  path: '/solar-energy/',
});

/**
 * The marks are joined here rather than in `_content/solar-energy.ts`
 * because a mark is a React node and the content file is data — the same
 * division About Us draws.
 *
 * Drawn in `value-grid/solar-marks.tsx` at the client's request of
 * 2026-09-18, in card order. See the note there on swapping one for a
 * supplied file.
 */
const CAPABILITY_MARKS = [
  <SelectionMark key="selection" />,
  <EfficiencyMark key="efficiency" />,
  <DevelopmentMark key="development" />,
];

const PRACTICE_MARKS = [
  <TeamMark key="team" ground="paper" />,
  <PlanMark key="plan" ground="paper" />,
  <EvacuationMark key="evacuation" ground="paper" />,
  <ScadaMark key="scada" ground="paper" />,
];

const capabilityItems: CapabilityItem[] = solarCapabilities.items.map((item, index) => ({
  ...item,
  mark: CAPABILITY_MARKS[index],
}));

const practiceItems: ValueGridItem[] = solarPractices.items.map((item, index) => ({
  ...item,
  mark: PRACTICE_MARKS[index],
}));

/**
 * Solar Energy — the first business page, on the About Us template.
 *
 * Built to SAEL's reference screenshot for layout and to
 * https://www.sael.co/solar-energy/ for every word, on SAEL's instruction of
 * 2026-09-18 for the four business pages. That instruction still stands for
 * them; it is not the general rule (/CLAUDE.md §2 rule 8). Five sections: the hero,
 * an overview beside a photograph, the projects map beside its copy and
 * portfolio figure, the three execution capabilities beside a photograph, and
 * the four EPC and O&M practice cards.
 *
 * **The page snaps, as the homepage does** (the client's call of 2026-10-11,
 * for the four business pages, Career and About Us): each section is a screen
 * with its content centred, and a scroll lands on the next, footer last. It
 * uses the homepage's mechanism, `data-snap-sections` in globals.css, and
 * nothing of its own. A section taller than the screen scrolls freely inside
 * and snaps at its edges.
 *
 * `-mt-header lg:mt-0`: below `lg` the masthead overlays the page rather than
 * offsetting it, so the sections start at the viewport top. See the homepage.
 *
 * A Server Component, and so is every section under it apart from the
 * portfolio figure's count-up.
 */
export default function SolarEnergyPage() {
  return (
    <div data-snap-sections className="-mt-header business-ramp-solar lg:mt-0">
      <PageHero titleGradient="solar" {...solarEnergyHero} snap />
      {/* Overview and "How We Reduce Cost?" on paper, the rest on the black ground — the
          client's alternation of 2026-10-14, as the homepage alternates. */}
      <ProseSplit titleGradient="solar" {...solarOverview} ground="paper" snap />
      <ProjectsMap titleGradient="solar" {...solarProjects} sites={solarSites} snap />
      <CapabilitySplit
        titleGradient="solar"
        eyebrow={solarCapabilities.eyebrow}
        title={solarCapabilities.title}
        items={capabilityItems}
        media={solarCapabilities.media}
        snap
      />
      {/* Outlined cards, as the reference draws them and as About Us's
          strategic pillars already are. */}
      <ValueGrid
        titleGradient="solar"
        eyebrow={solarPractices.eyebrow}
        title={solarPractices.title}
        items={practiceItems}
        variant="outlined"
        ground="paper"
        frosted
        snap
      />
    </div>
  );
}
