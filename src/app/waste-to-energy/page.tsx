import type { Metadata } from 'next';
import { CapabilitySplit, type CapabilityItem } from '@/components/sections/capability-split';
import { PageHero } from '@/components/sections/page-hero';
import { ProjectsMap } from '@/components/sections/projects-map';
import { ProseSplit } from '@/components/sections/prose-split';
import { ValueGrid, type ValueGridItem } from '@/components/sections/value-grid';
import {
  AirCooledMark,
  AirQualityMark,
  BaleMark,
  BoilerMark,
  CycleMark,
  FossilMark,
  RuralMark,
  SheafMark,
  SteadyMark,
  ThreePassMark,
} from '@/components/sections/value-grid/business-marks';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  wasteToEnergyBenefits,
  wasteToEnergyHero,
  wasteToEnergyMeta,
  wasteToEnergyOverview,
  wasteToEnergyProjects,
  wasteToEnergySites,
  wasteToEnergyTechnology,
} from '../_content/waste-to-energy';

export const metadata: Metadata = buildMetadata({
  title: wasteToEnergyMeta.title,
  description: wasteToEnergyMeta.description,
  // The legacy URL, trailing slash included. /CLAUDE.md §2 rule 6.
  path: '/waste-to-energy/',
});

/** Drawn marks, in entry order — see `business-marks.tsx`. */
const TECHNOLOGY_MARKS = [
  <BoilerMark key="boiler" />,
  <BaleMark key="bale" />,
  <ThreePassMark key="three-pass" />,
  <AirCooledMark key="air-cooled" />,
];

const BENEFIT_MARKS = [
  <CycleMark key="cycle" ground="paper" />,
  <RuralMark key="rural" ground="paper" />,
  <AirQualityMark key="air-quality" ground="paper" />,
  <FossilMark key="fossil" ground="paper" />,
  <SteadyMark key="steady" ground="paper" />,
  <SheafMark key="sheaf" ground="paper" />,
];

const technologyItems: CapabilityItem[] = wasteToEnergyTechnology.items.map((item, index) => ({
  ...item,
  mark: TECHNOLOGY_MARKS[index],
}));

const benefitItems: ValueGridItem[] = wasteToEnergyBenefits.items.map((item, index) => ({
  ...item,
  mark: BENEFIT_MARKS[index],
}));

/**
 * Agri Waste-to-Energy — the Solar Energy template, all five sections.
 *
 * Built to SAEL's reference screenshot for layout and to
 * https://www.sael.co/waste-to-energy/ for every word, on SAEL's instruction
 * of 2026-09-18 for the four business pages. That instruction still stands for
 * them; it is not the general rule (/CLAUDE.md §2 rule 8). The page's name is
 * the exception: SAEL renamed it on 2026-10-01, and theirs stands. Hero, overview beside
 * a masked photograph, the projects map with its eleven plant pins and
 * portfolio figure, the four technology entries beside a masked photograph,
 * and six benefit cards — six, because that is what the live page has; the
 * screenshot's four identical cards were placeholder art.
 *
 * **The page snaps**, as Solar Energy does. See the note there.
 *
 * A Server Component apart from the portfolio figure's count-up.
 */
export default function WasteToEnergyPage() {
  return (
    <div data-snap-sections className="-mt-header business-ramp-agri lg:mt-0">
      <PageHero titleGradient="agri" {...wasteToEnergyHero} snap />
      {/* Overview and "Why Waste-to-Energy?" on paper, the rest on the black ground — the
          client's alternation of 2026-10-14, as the homepage alternates. */}
      <ProseSplit titleGradient="agri" {...wasteToEnergyOverview} ground="paper" snap />
      <ProjectsMap
        titleGradient="agri"
        {...wasteToEnergyProjects}
        sites={wasteToEnergySites}
        snap
      />
      <CapabilitySplit
        titleGradient="agri"
        eyebrow={wasteToEnergyTechnology.eyebrow}
        title={wasteToEnergyTechnology.title}
        items={technologyItems}
        media={wasteToEnergyTechnology.media}
        snap
      />
      <ValueGrid
        titleGradient="agri"
        eyebrow={wasteToEnergyBenefits.eyebrow}
        title={wasteToEnergyBenefits.title}
        items={benefitItems}
        variant="outlined"
        // Six cards as two rows of three from `xl`, so they fit the one
        // screen the page snaps to.
        columns="thirds"
        ground="paper"
        frosted
        snap
      />
    </div>
  );
}
