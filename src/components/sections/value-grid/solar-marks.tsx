import Image, { type StaticImageData } from 'next/image';
import selectionIcon from '@/assets/icons/project-selection-and-monitoring/animated/12a-selection-sun-globe-white-animated.svg';
import selectionPaperIcon from '@/assets/icons/project-selection-and-monitoring/animated/12a-selection-sun-globe-notile-animated.svg';
import efficiencyIcon from '@/assets/icons/sustain-operational-efficiencies/animated/13a-efficiency-solar-panel-white-animated.svg';
import efficiencyPaperIcon from '@/assets/icons/sustain-operational-efficiencies/animated/13a-efficiency-solar-panel-notile-animated.svg';
import developmentIcon from '@/assets/icons/robust-development-capabilities/animated/14a-development-blueprint-white-animated.svg';
import developmentPaperIcon from '@/assets/icons/robust-development-capabilities/animated/14a-development-blueprint-notile-animated.svg';
import teamIcon from '@/assets/icons/dedicated-manpower-and-supervisory-team/animated/15a-manpower-team-white-animated.svg';
import teamPaperIcon from '@/assets/icons/dedicated-manpower-and-supervisory-team/animated/15a-manpower-team-notile-animated.svg';
import planIcon from '@/assets/icons/implementation-&-monitoring-of-pre-approved-plan/animated/16a-plan-checklist-white-animated.svg';
import planPaperIcon from '@/assets/icons/implementation-&-monitoring-of-pre-approved-plan/animated/16a-plan-checklist-notile-animated.svg';
import evacuationIcon from '@/assets/icons/designated-engineer-for-evacuation/animated/17a-evacuation-engineer-white-animated.svg';
import evacuationPaperIcon from '@/assets/icons/designated-engineer-for-evacuation/animated/17a-evacuation-engineer-notile-animated.svg';
import scadaIcon from '@/assets/icons/advanced-scada-technologies/animated/18b-scada-dashboard-white-animated.svg';
import scadaPaperIcon from '@/assets/icons/advanced-scada-technologies/animated/18b-scada-dashboard-notile-animated.svg';
import { cn } from '@/lib/utils/cn';

/**
 * The Solar Energy page's seven marks: three for "Proven Execution
 * Capabilities", four for "Our EPC And O&M Practices".
 *
 * The supplied animated icons (2026-10-08, icons 12–18), which replaced the
 * line art drawn here on 2026-09-18. Files rather than inline SVG: each is
 * fixed-colour, carries its own gradient id and animates itself with SMIL
 * on a 3.5s loop, so none needs `currentColor` and inlining would let ids
 * collide. Every mark is decorative — the card's `<h3>` is its name.
 *
 * Two files per mark since 2026-10-14, when "Our EPC And O&M Practices" went
 * to paper: the set's white variant for the dark ground and its coloured
 * no-tile variant for paper, picked by `ground`.
 */

/** Sized by the token, not by width/height attributes, so one value governs. */
const MARK_CLASS = 'size-(--value-mark-size) shrink-0 object-contain';

interface MarkProps {
  className?: string;
  /**
   * The ground the mark sits on. `dark` draws the white file; `paper` draws
   * the set's coloured no-tile variant of the same icon, for a section drawn
   * on paper (2026-10-14).
   */
  ground?: 'dark' | 'paper';
}

/** One mark: the white file on the dark ground, the coloured one on paper. */
function Mark({
  dark,
  paper,
  ground = 'dark',
  className,
}: MarkProps & { dark: StaticImageData; paper: StaticImageData }) {
  return (
    <Image
      src={ground === 'paper' ? paper : dark}
      alt=""
      aria-hidden
      className={cn(MARK_CLASS, className)}
    />
  );
}

/** "Project Selection and Monitoring" */
export function SelectionMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={selectionIcon} paper={selectionPaperIcon} ground={ground} className={className} />
  );
}

/** "Sustain Operational Efficiencies" */
export function EfficiencyMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={efficiencyIcon} paper={efficiencyPaperIcon} ground={ground} className={className} />
  );
}

/** "Robust Development Capabilities" */
export function DevelopmentMark({ className, ground }: MarkProps) {
  return (
    <Mark
      dark={developmentIcon}
      paper={developmentPaperIcon}
      ground={ground}
      className={className}
    />
  );
}

/** "Dedicated Manpower and Supervisory Team" */
export function TeamMark({ className, ground }: MarkProps) {
  return <Mark dark={teamIcon} paper={teamPaperIcon} ground={ground} className={className} />;
}

/** "Implementation & Monitoring of Pre-approved Plan" */
export function PlanMark({ className, ground }: MarkProps) {
  return <Mark dark={planIcon} paper={planPaperIcon} ground={ground} className={className} />;
}

/** "Designated Engineer for Evacuation" */
export function EvacuationMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={evacuationIcon} paper={evacuationPaperIcon} ground={ground} className={className} />
  );
}

/** "Advanced SCADA Technologies" */
export function ScadaMark({ className, ground }: MarkProps) {
  return <Mark dark={scadaIcon} paper={scadaPaperIcon} ground={ground} className={className} />;
}
