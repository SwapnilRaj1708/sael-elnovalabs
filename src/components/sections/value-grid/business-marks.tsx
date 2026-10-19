import Image, { type StaticImageData } from 'next/image';
import boilerIcon from '@/assets/icons/equipped-with-the-best-available-technology/animated/19a-technology-chip-white-animated.svg';
import boilerPaperIcon from '@/assets/icons/equipped-with-the-best-available-technology/animated/19a-technology-chip-notile-animated.svg';
import baleIcon from '@/assets/icons/adaptable-and-long-life-boiler-equipment/animated/20a-boiler-factory-white-animated.svg';
import balePaperIcon from '@/assets/icons/adaptable-and-long-life-boiler-equipment/animated/20a-boiler-factory-notile-animated.svg';
import threePassIcon from '@/assets/icons/secured-3-pass-straw-fired-boiler/animated/21a-boiler-shield-white-animated.svg';
import threePassPaperIcon from '@/assets/icons/secured-3-pass-straw-fired-boiler/animated/21a-boiler-shield-notile-animated.svg';
import airCooledIcon from '@/assets/icons/conserving-water-through-air-cooled-condensers/animated/22c-water-saved-white-animated.svg';
import airCooledPaperIcon from '@/assets/icons/conserving-water-through-air-cooled-condensers/animated/22c-water-saved-notile-animated.svg';
import cycleIcon from '@/assets/icons/the-cycle-of-energy/animated/23b-cycle-sun-leaf-energy-white-animated.svg';
import cyclePaperIcon from '@/assets/icons/the-cycle-of-energy/animated/23b-cycle-sun-leaf-energy-notile-animated.svg';
import ruralIcon from '@/assets/icons/augmentation-of-rural-economy/animated/24b-rural-coins-sprout-white-animated.svg';
import ruralPaperIcon from '@/assets/icons/augmentation-of-rural-economy/animated/24b-rural-coins-sprout-notile-animated.svg';
import airQualityIcon from '@/assets/icons/improves-environmental-health-and-air-quality/animated/25a-air-sun-cloud-wind-white-animated.svg';
import airQualityPaperIcon from '@/assets/icons/improves-environmental-health-and-air-quality/animated/25a-air-sun-cloud-wind-notile-animated.svg';
import fossilIcon from '@/assets/icons/reduces-reliance-on-fossil-fuels/animated/26a-fossil-power-plant-white-animated.svg';
import fossilPaperIcon from '@/assets/icons/reduces-reliance-on-fossil-fuels/animated/26a-fossil-power-plant-notile-animated.svg';
import steadyIcon from '@/assets/icons/steady-and-reliable/animated/27d-reliable-shield-leaf-white-animated.svg';
import steadyPaperIcon from '@/assets/icons/steady-and-reliable/animated/27d-reliable-shield-leaf-notile-animated.svg';
import sheafIcon from '@/assets/icons/abundant-local-fuel-supply/animated/28a-fuel-pump-leaves-white-animated.svg';
import sheafPaperIcon from '@/assets/icons/abundant-local-fuel-supply/animated/28a-fuel-pump-leaves-notile-animated.svg';
import certificateIcon from '@/assets/icons/iso-certifications/animated/29b-iso-certificate-white-animated.svg';
import certificatePaperIcon from '@/assets/icons/iso-certifications/animated/29b-iso-certificate-notile-animated.svg';
import dataIcon from '@/assets/icons/mes-integration/animated/30a-mes-live-bars-white-animated.svg';
import dataPaperIcon from '@/assets/icons/mes-integration/animated/30a-mes-live-bars-notile-animated.svg';
import inspectionIcon from '@/assets/icons/intelligent-inspection/animated/31b-inspection-eye-scan-white-animated.svg';
import inspectionPaperIcon from '@/assets/icons/intelligent-inspection/animated/31b-inspection-eye-scan-notile-animated.svg';
import chainIcon from '@/assets/icons/backward-integration/animated/32a-integration-chain-link-white-animated.svg';
import chainPaperIcon from '@/assets/icons/backward-integration/animated/32a-integration-chain-link-notile-animated.svg';
import automationIcon from '@/assets/icons/n-type-topcon-cells/animated/33a-topcon-chip-white-animated.svg';
import automationPaperIcon from '@/assets/icons/n-type-topcon-cells/animated/33a-topcon-chip-notile-animated.svg';
import targetIcon from '@/assets/icons/renewable-energy-targets/animated/34c-targets-scaling-modules-white-animated.svg';
import targetPaperIcon from '@/assets/icons/renewable-energy-targets/animated/34c-targets-scaling-modules-notile-animated.svg';
import handshakeIcon from '@/assets/icons/policy-support-and-talent/animated/35b-policy-and-talent-white-animated.svg';
import handshakePaperIcon from '@/assets/icons/policy-support-and-talent/animated/35b-policy-and-talent-notile-animated.svg';
import { cn } from '@/lib/utils/cn';

/**
 * The marks for the Waste-to-Energy, Module Manufacturing and Solar Cell
 * Manufacturing pages (icons 19-35 of the supplied set, 2026-10-08), which
 * replaced the line art drawn here at the client's request of 2026-09-18.
 *
 * Files rather than inline SVG: each is fixed-colour, carries its own
 * gradient id and animates itself with SMIL on a 3.5s loop, so none needs
 * `currentColor` and inlining would let ids collide. Every mark is decorative:
 * the card's heading is its name.
 *
 * Two files per mark since 2026-10-14, when a section on each of the three
 * pages went to paper: the set's white variant for the dark ground and its
 * coloured no-tile variant for paper, picked by `ground`.
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

/** Equipped With the Best Available Technology */
export function BoilerMark({ className, ground }: MarkProps) {
  return <Mark dark={boilerIcon} paper={boilerPaperIcon} ground={ground} className={className} />;
}

/** Adaptable and Long-Life Boiler Equipment */
export function BaleMark({ className, ground }: MarkProps) {
  return <Mark dark={baleIcon} paper={balePaperIcon} ground={ground} className={className} />;
}

/** Secured 3-Pass Straw-Fired Boiler */
export function ThreePassMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={threePassIcon} paper={threePassPaperIcon} ground={ground} className={className} />
  );
}

/** Conserving Water Through Air-Cooled Condensers */
export function AirCooledMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={airCooledIcon} paper={airCooledPaperIcon} ground={ground} className={className} />
  );
}

/** The Cycle of Energy */
export function CycleMark({ className, ground }: MarkProps) {
  return <Mark dark={cycleIcon} paper={cyclePaperIcon} ground={ground} className={className} />;
}

/** Augmentation of Rural Economy */
export function RuralMark({ className, ground }: MarkProps) {
  return <Mark dark={ruralIcon} paper={ruralPaperIcon} ground={ground} className={className} />;
}

/** Improves Environmental Health and Air Quality */
export function AirQualityMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={airQualityIcon} paper={airQualityPaperIcon} ground={ground} className={className} />
  );
}

/** Reduces Reliance on Fossil Fuels */
export function FossilMark({ className, ground }: MarkProps) {
  return <Mark dark={fossilIcon} paper={fossilPaperIcon} ground={ground} className={className} />;
}

/** Steady and Reliable */
export function SteadyMark({ className, ground }: MarkProps) {
  return <Mark dark={steadyIcon} paper={steadyPaperIcon} ground={ground} className={className} />;
}

/** Abundant Local Fuel Supply */
export function SheafMark({ className, ground }: MarkProps) {
  return <Mark dark={sheafIcon} paper={sheafPaperIcon} ground={ground} className={className} />;
}

/** ISO certifications */
export function CertificateMark({ className, ground }: MarkProps) {
  return (
    <Mark
      dark={certificateIcon}
      paper={certificatePaperIcon}
      ground={ground}
      className={className}
    />
  );
}

/** MES integration */
export function DataMark({ className, ground }: MarkProps) {
  return <Mark dark={dataIcon} paper={dataPaperIcon} ground={ground} className={className} />;
}

/** Intelligent inspection */
export function InspectionMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={inspectionIcon} paper={inspectionPaperIcon} ground={ground} className={className} />
  );
}

/** Backward integration */
export function ChainMark({ className, ground }: MarkProps) {
  return <Mark dark={chainIcon} paper={chainPaperIcon} ground={ground} className={className} />;
}

/** N-type TOPCon cells */
export function AutomationMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={automationIcon} paper={automationPaperIcon} ground={ground} className={className} />
  );
}

/** Renewable energy targets */
export function TargetMark({ className, ground }: MarkProps) {
  return <Mark dark={targetIcon} paper={targetPaperIcon} ground={ground} className={className} />;
}

/** Policy support and talent */
export function HandshakeMark({ className, ground }: MarkProps) {
  return (
    <Mark dark={handshakeIcon} paper={handshakePaperIcon} ground={ground} className={className} />
  );
}
