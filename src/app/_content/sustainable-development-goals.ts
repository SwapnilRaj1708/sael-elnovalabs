import type { RippleHeroProps } from '@/components/sections/ripple-hero';
import type { SdgDetail, SdgDetailLabels } from '@/components/sections/sdg-detail';
import { TODO_CONTENT } from '@/lib/config/site';
import { SDG_GOALS, sdgAnchor } from './sdg-goals';

/**
 * The Sustainable Development Goals page's static content (FE-15).
 *
 * **Transcribed verbatim from the live https://www.sael.co/sustainable-development-goals/**,
 * read from its HTML on 2026-10-07 with only its source whitespace collapsed.
 * There is no design for this page and no copy for it in this repository, so
 * the live page is the only source there is (/CLAUDE.md §2 rule 3): the
 * client asked for it to be built as the page the SDG icons on Our Key ESG
 * Metrics open, as they do on the live site. Its spellings, en dashes and
 * curly apostrophe stand, as does a description that reads like the UN's
 * own wording rather than SAEL's (SDG 12, "by 2020").
 *
 * The live page is a heading, a subheading and one five-column table: a row
 * per goal, `id="sdg-N"` on each, its last cell the goal's icon. Here each row
 * is a block with the same anchor, its cells under the table's own column
 * headings; see `<SdgDetailList>`.
 *
 * Two things are not the live page's:
 *
 *  - **Each block names its goal** ("SDG 3", "Good Health & Well-Being"), as
 *    Our Key ESG Metrics names it (`SDG_GOALS`). The live table carries the
 *    goal only as an icon with an empty `alt`, so the name is the icon's
 *    text, written out.
 *  - **The subheading's case** follows Our Key ESG Metrics' heading, "Our
 *    Commitment to The UN SDGs", where the live page sets "To".
 */

export const sdgPageMeta = {
  /** The live page's own `<title>`, verbatim. */
  title: 'Sustainable Development Goals - SAEL',
  /**
   * The live page ships `<meta name="description" content="">`. Nothing to
   * transcribe; `buildMetadata()` drops the marker rather than emitting it.
   */
  description: TODO_CONTENT,
} as const;

export const sdgPageHero: RippleHeroProps = {
  // The live page's `<h1>`.
  title: 'UN SDGs',
  intro: 'Our Commitment to The UN SDGs',
};

/** The live table's column headings, verbatim. */
export const sdgDetailLabels: SdgDetailLabels = {
  pillar: 'Strategic Pillar',
  issue: 'Material Issue',
  description: 'Description of Issue',
  focusArea: 'Focus Area',
};

/** One live table row's four text cells, keyed by its goal's number. */
const ROWS: Record<number, Omit<SdgDetail, 'number' | 'title' | 'icon' | 'id'>> = {
  3: {
    pillar: 'Contributing to Society',
    issue:
      'Health, Safety, Sustainability, Environment and Wellbeing (Community, Occupational Health & Safety)',
    description:
      'Company promotes OHS services which are needed to eliminate health and safety hazards, monitoring and reporting of related incidences, conducting root – cause analysis and taking corrective actions.',
    focusArea: 'Employee & Community Welfare',
  },
  5: {
    pillar: 'Contributing to Society',
    issue: 'Diversity & Inclusion',
    description:
      'Company ensures not to discriminate, between gender, age, religion, race, physical capabilities while recruiting or in respect of pay, terms of contract and employment.',
    focusArea: 'Employee Welfare',
  },
  7: {
    pillar: 'Contributing to Society',
    issue: 'Sustainable Energy Production',
    description:
      'Company promotes the development & deployment of technologies that enable sustainable energy production & minimises the negative environmental impacts associated with energy production, such as emissions and habitat disruption',
    focusArea: 'Climate Resilience',
  },
  8: {
    pillar: 'Contributing to Society',
    issue: 'Supplier & Vendor Management',
    description:
      'Company ensures that suppliers adhere to ethical labour practices and provide decent working conditions.',
    focusArea: 'Guarding Business Integrity',
  },
  9: {
    pillar: 'Contributing to Future',
    issue: 'Asset Quality',
    description:
      'Adopting practices to ensure company’s assets such as property, plant and equipment are in a healthy state and facilitate effective, efficient, and reliable operations.',
    focusArea: 'Risk Management',
  },
  10: {
    pillar: 'Contributing to Society',
    issue: 'Stakeholder Relationship Management',
    description:
      'The company engages with stakeholders, including employees, communities, and advocacy groups, to address issues related to inequality & incorporates stakeholder feedback into business strategies.',
    focusArea: 'Guarding Business Integrity',
  },
  11: {
    pillar: 'Contributing to Environment & Society',
    issue: 'Environmental Impact & Resource Efficiency',
    description:
      'The company reduces air pollution by replacing fossil fuel-based energy generation with clean renewable energy sources. It also ensures efficient use of land & water resources in renewable energy projects to minimise environmental impact.',
    focusArea: 'Climate Resilience',
  },
  12: {
    pillar: 'Contributing to Environment',
    issue: 'Environmental & Wellbeing (Waste Management)',
    description:
      'Within the current global policy frameworks, waste services prominently feature in the targets and indicators of both SDG 11 and SDG 12, notably with commitments to prevent, reduce, recycle and reuse – as well as to properly collect and discharge – urban solid waste and halve global food waste by 2030; and to properly handle and treat chemical and other hazardous waste through the whole life cycle in accordance with international standards by 2020.',
    focusArea: 'Climate Resilience',
  },
  13: {
    pillar: 'Contributing to Environment',
    issue: 'Climate Change Action',
    description:
      'Climate change management refers to identifying adverse impacts on operations due to climate-related events and adopting appropriate mitigation measures to minimise impact.',
    focusArea: 'Climate Resilience',
  },
  15: {
    pillar: 'Contributing to Environment & Society',
    issue: 'Biodiversity Conservation',
    description:
      'The company implements measures to protect local flora and fauna during the construction and operation of renewable energy projects. In addition, established programs to monitor the impact of renewable energy projects on local biodiversity and take corrective actions if necessary.',
    focusArea: 'Climate Resilience',
  },
};

/**
 * The live table's rows, in its order — ascending, the ten goals of
 * `SDG_GOALS` — each with its goal's number, name, icon and anchor.
 */
export const sdgDetails: readonly SdgDetail[] = SDG_GOALS.flatMap((goal) => {
  const row = ROWS[goal.number];
  return row === undefined ? [] : [{ ...goal, ...row, id: sdgAnchor(goal.number) }];
});
