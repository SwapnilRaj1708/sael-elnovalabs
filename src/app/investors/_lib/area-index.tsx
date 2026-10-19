import type { ComponentType } from 'react';
import { governanceIndex } from '@/app/_content/corporate-governance';
import { financialsIndex } from '@/app/_content/financials-and-reports';
import { offerDocumentsIndex } from '@/app/_content/offer-documents';
import { LinkGrid } from '@/components/sections/link-grid';
import {
  AddendumMark,
  AnnualReturnMark,
  AvEnglishMark,
  AvHindiMark,
  BoardCommitteesMark,
  BoardOfDirectorsMark,
  CodesPoliciesMark,
  ConsolidatedMark,
  CorrigendumMark,
  CsrMark,
  DownloadsMark,
  DrhpMark,
  FamiliarizationMark,
  GeneralMeetingMark,
  GroupCompaniesMark,
  IndustryReportMark,
  OtherDocumentsMark,
  OutstandingDuesMark,
  StandaloneMark,
  SubsidiaryMark,
  SustainabilityReportsMark,
} from '@/components/sections/link-grid/investor-marks';
import { SubPage } from '@/components/sections/sub-page';
import type { InvestorSection } from '@/lib/content';

/**
 * An investor area's index — the tiles of Offer Documents, Corporate
 * Governance and Financials & Reports. Page code, beside the routes that
 * render it: **the live index and its Live Preview both**, so what a
 * reviewer approves is laid out by the markup that will publish it.
 */

type MarkComponent = ComponentType<{ className?: string }>;

type IndexedSection = Exclude<InvestorSection, 'notifications'>;

interface AreaIndexChrome {
  title: string;
  /**
   * The tiles' marks, by slug, and the one a tile a maker adds takes until a
   * mark is chosen for it here. The supplied animated icons (2026-10-08), one
   * per tile; the fallback is the "other documents" mark. Decorative — the
   * title names the tile.
   */
  marks: Readonly<Record<string, MarkComponent>>;
  fallbackMark: MarkComponent;
  /**
   * Whether a short last row is centred rather than left under a full one —
   * Financials' five tiles, 3 + 2 on a desktop, rather than four over a lone
   * fifth. It balances any count the panel produces.
   */
  balance: boolean;
}

const CHROME: Record<IndexedSection, AreaIndexChrome> = {
  'offer-documents': {
    title: offerDocumentsIndex.title,
    marks: {
      drhp: DrhpMark,
      'corrigendum-to-drhp': CorrigendumMark,
      'addendum-to-drhp': AddendumMark,
      'industry-report': IndustryReportMark,
      'drhp-audio-visuals-english': AvEnglishMark,
      'drhp-audio-visuals-hindi': AvHindiMark,
      'outstanding-dues-to-material-creditors': OutstandingDuesMark,
      'information-with-respect-to-group-companies': GroupCompaniesMark,
    },
    fallbackMark: OtherDocumentsMark,
    balance: false,
  },
  'corporate-governance': {
    title: governanceIndex.title,
    marks: {
      'board-of-directors': BoardOfDirectorsMark,
      'board-committees': BoardCommitteesMark,
      'codes-and-policies': CodesPoliciesMark,
      'sustainability-reports': SustainabilityReportsMark,
      csr: CsrMark,
      'general-meeting': GeneralMeetingMark,
      'familiarization-programme': FamiliarizationMark,
      'other-documents': OtherDocumentsMark,
    },
    fallbackMark: OtherDocumentsMark,
    balance: false,
  },
  'financials-and-reports': {
    title: financialsIndex.title,
    marks: {
      'annual-return': AnnualReturnMark,
      'consolidated-financials-of-the-company': ConsolidatedMark,
      'standalone-financials-of-the-company': StandaloneMark,
      'standalone-financials-of-material-subsidiary-companies': SubsidiaryMark,
      'investor-downloads': DownloadsMark,
    },
    fallbackMark: OtherDocumentsMark,
    balance: true,
  },
};

export interface AreaIndexProps {
  section: IndexedSection;
  /** The area's pages, in order — `areaPages()`: static pages first, then the tiles. */
  pages: readonly { slug: string; name: string; path: string }[];
}

/**
 * The ripple band with the area's name, then a tile for each page, each
 * linking to its page and not to a file. On `<SubPage>` without its side
 * panel, since this page *is* that list. Nothing is gated here; the notices
 * live on the pages they guard.
 *
 * A Server Component; the ripple grid and the tiles' border glow are the
 * client leaves.
 */
export function AreaIndex({ section, pages }: AreaIndexProps) {
  const { title, marks, fallbackMark, balance } = CHROME[section];

  return (
    <SubPage masthead="ripple" title={title}>
      <LinkGrid
        label={title}
        balance={balance}
        items={pages.map((page) => {
          const Mark = marks[page.slug] ?? fallbackMark;
          return {
            name: page.name,
            href: page.path,
            mark: <Mark className="size-investor-mark" />,
          };
        })}
      />
    </SubPage>
  );
}
