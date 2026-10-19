import type { Metadata } from 'next';
import { CapabilitySplit, type CapabilityItem } from '@/components/sections/capability-split';
import { PageHero } from '@/components/sections/page-hero';
import { ProjectsMap } from '@/components/sections/projects-map';
import { ProseSplit } from '@/components/sections/prose-split';
import {
  AutomationMark,
  ChainMark,
  HandshakeMark,
  TargetMark,
} from '@/components/sections/value-grid/business-marks';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  solarCellHero,
  solarCellHighlights,
  solarCellMeta,
  solarCellOverview,
  solarCellProjects,
  solarCellSites,
} from '../_content/solar-cell-manufacturing';

export const metadata: Metadata = buildMetadata({
  title: solarCellMeta.title,
  description: solarCellMeta.description,
  // The legacy URL, trailing slash included. /CLAUDE.md §2 rule 6.
  path: '/solar-cell-manufacturing/',
});

/** Drawn marks, in entry order — see `business-marks.tsx`. */
const HIGHLIGHT_MARKS = [
  <ChainMark key="chain" ground="paper" />,
  <AutomationMark key="automation" ground="paper" />,
  <TargetMark key="target" ground="paper" />,
  <HandshakeMark key="handshake" ground="paper" />,
];

const highlightItems: CapabilityItem[] = solarCellHighlights.items.map((item, index) => ({
  ...item,
  mark: HIGHLIGHT_MARKS[index],
}));

/**
 * Solar Cell Manufacturing — the Solar Energy template, four sections.
 *
 * Built to SAEL's reference screenshot for layout and to
 * https://www.sael.co/solar-cell-manufacturing/ for every word, on SAEL's
 * instruction of 2026-09-18 for the four business pages. That instruction still
 * stands for them; it is not the general rule (/CLAUDE.md §2 rule 8). Hero,
 * overview beside a masked photograph, the projects map with its one pin,
 * and the four highlights beside a masked photograph. No practice cards: the
 * live page has none and neither does the screenshot. No portfolio figure
 * either — see the note in `_content/solar-cell-manufacturing.ts`.
 *
 * **The page snaps**, as Solar Energy does. See the note there.
 *
 * A Server Component, and so is every section under it.
 */
export default function SolarCellManufacturingPage() {
  return (
    <div data-snap-sections className="-mt-header business-ramp-cell lg:mt-0">
      <PageHero titleGradient="cell" {...solarCellHero} snap />
      {/* Overview and Highlights on paper, the rest on the black ground — the
          client's alternation of 2026-10-14, as the homepage alternates. */}
      <ProseSplit titleGradient="cell" {...solarCellOverview} ground="paper" snap />
      <ProjectsMap
        titleGradient="cell"
        eyebrow={solarCellProjects.eyebrow}
        title={solarCellProjects.title}
        body={[...solarCellProjects.body]}
        figure={solarCellProjects.figure}
        map={solarCellProjects.map}
        mapLabel={solarCellProjects.mapLabel}
        sites={solarCellSites}
        snap
      />
      <CapabilitySplit
        titleGradient="cell"
        eyebrow={solarCellHighlights.eyebrow}
        title={solarCellHighlights.title}
        items={highlightItems}
        media={solarCellHighlights.media}
        ground="paper"
        snap
      />
    </div>
  );
}
