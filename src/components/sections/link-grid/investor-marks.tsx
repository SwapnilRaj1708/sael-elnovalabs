import Image from 'next/image';
import drhpIcon from '@/assets/icons/draft-red-herring-prospectus-(drhp)/animated/51c-drhp-signing-notile-animated.svg';
import corrigendumIcon from '@/assets/icons/corrigendum-to-drhp/animated/52a-corrigendum-strike-edit-notile-animated.svg';
import addendumIcon from '@/assets/icons/addendum-to-drhp/animated/53a-addendum-plus-notile-animated.svg';
import industryReportIcon from '@/assets/icons/industry-report/animated/54c-industry-report-pie-notile-animated.svg';
import avEnglishIcon from '@/assets/icons/drhp---audio-visual-(english)/animated/55c-av-english-camera-notile-animated.svg';
import avHindiIcon from '@/assets/icons/drhp---audio-visual-(hindi)/animated/56c-av-hindi-camera-notile-animated.svg';
import outstandingDuesIcon from '@/assets/icons/outstanding-dues-to-material-creditors/animated/57c-dues-calendar-rupee-notile-animated.svg';
import groupCompaniesIcon from '@/assets/icons/information-with-respect-to-group-companies/animated/58a-group-buildings-notile-animated.svg';
import boardOfDirectorsIcon from '@/assets/icons/board-of-directors/animated/59a-board-at-table-notile-animated.svg';
import boardCommitteesIcon from '@/assets/icons/board-committees/animated/60a-committees-around-doc-notile-animated.svg';
import codesPoliciesIcon from '@/assets/icons/codes-&-policies/animated/61c-codes-policy-lock-notile-animated.svg';
import sustainabilityReportsIcon from '@/assets/icons/sustainability-reports/animated/62a-sustainability-report-leaf-notile-animated.svg';
import csrIcon from '@/assets/icons/csr/animated/63c-csr-heart-sprout-notile-animated.svg';
import generalMeetingIcon from '@/assets/icons/general-meeting/animated/64a-meeting-presentation-notile-animated.svg';
import familiarizationIcon from '@/assets/icons/familiarization-programme/animated/65a-familiarization-trainer-notile-animated.svg';
import otherDocumentsIcon from '@/assets/icons/other-documents/animated/66c-other-docs-more-notile-animated.svg';
import annualReturnIcon from '@/assets/icons/annual-return/animated/67b-annual-return-doc-notile-animated.svg';
import consolidatedIcon from '@/assets/icons/consolidated-financials-of-the-company/animated/68a-consolidated-pie-notile-animated.svg';
import standaloneIcon from '@/assets/icons/standalone-financials-of-the-company/animated/69a-standalone-doc-rupee-notile-animated.svg';
import subsidiaryIcon from '@/assets/icons/standalone-financials-of-material-subsidiary-companies/animated/70a-subsidiary-linked-building-notile-animated.svg';
import downloadsIcon from '@/assets/icons/investor-downloads/animated/71a-downloads-cloud-notile-animated.svg';
import { cn } from '@/lib/utils/cn';

/**
 * The investor index tiles' marks (icons 51-71 of the supplied set,
 * 2026-10-08), which replaced lucide stand-ins.
 *
 * The coloured, no-tile variant: a red-to-purple gradient line glyph with no
 * background. Files rather than inline SVG: each carries its own gradient id
 * and animates itself with SMIL on a 3.5s loop, and inlining would let ids
 * collide. Every mark is decorative: the tile's title
 * names it. They take the `size-investor-mark` class the index passes.
 */

/** Sized by the token, not by width/height attributes, so one value governs. */
const MARK_CLASS = 'shrink-0 object-contain';

interface MarkProps {
  className?: string;
}

/** Draft Red Herring Prospectus */
export function DrhpMark({ className }: MarkProps) {
  return <Image src={drhpIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Corrigendum to DRHP */
export function CorrigendumMark({ className }: MarkProps) {
  return <Image src={corrigendumIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Addendum to DRHP */
export function AddendumMark({ className }: MarkProps) {
  return <Image src={addendumIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Industry Report */
export function IndustryReportMark({ className }: MarkProps) {
  return (
    <Image src={industryReportIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** DRHP audio-visual (English) */
export function AvEnglishMark({ className }: MarkProps) {
  return <Image src={avEnglishIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** DRHP audio-visual (Hindi) */
export function AvHindiMark({ className }: MarkProps) {
  return <Image src={avHindiIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Outstanding dues to material creditors */
export function OutstandingDuesMark({ className }: MarkProps) {
  return (
    <Image src={outstandingDuesIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** Information with respect to group companies */
export function GroupCompaniesMark({ className }: MarkProps) {
  return (
    <Image src={groupCompaniesIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** Board of Directors */
export function BoardOfDirectorsMark({ className }: MarkProps) {
  return (
    <Image src={boardOfDirectorsIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** Board committees */
export function BoardCommitteesMark({ className }: MarkProps) {
  return (
    <Image src={boardCommitteesIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** Codes and policies */
export function CodesPoliciesMark({ className }: MarkProps) {
  return <Image src={codesPoliciesIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Sustainability reports */
export function SustainabilityReportsMark({ className }: MarkProps) {
  return (
    <Image
      src={sustainabilityReportsIcon}
      alt=""
      aria-hidden
      className={cn(MARK_CLASS, className)}
    />
  );
}

/** CSR */
export function CsrMark({ className }: MarkProps) {
  return <Image src={csrIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** General meeting */
export function GeneralMeetingMark({ className }: MarkProps) {
  return (
    <Image src={generalMeetingIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** Familiarization programme */
export function FamiliarizationMark({ className }: MarkProps) {
  return (
    <Image src={familiarizationIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** Other documents */
export function OtherDocumentsMark({ className }: MarkProps) {
  return (
    <Image src={otherDocumentsIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}

/** Annual return */
export function AnnualReturnMark({ className }: MarkProps) {
  return <Image src={annualReturnIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Consolidated financials */
export function ConsolidatedMark({ className }: MarkProps) {
  return <Image src={consolidatedIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Standalone financials */
export function StandaloneMark({ className }: MarkProps) {
  return <Image src={standaloneIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Standalone financials of material subsidiaries */
export function SubsidiaryMark({ className }: MarkProps) {
  return <Image src={subsidiaryIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Investor downloads */
export function DownloadsMark({ className }: MarkProps) {
  return <Image src={downloadsIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}
