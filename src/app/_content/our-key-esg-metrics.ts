import type { EsgHeroProps } from '@/components/sections/esg-hero';
import type { ProseSplitProps } from '@/components/sections/prose-split';
import type { SdgGridProps } from '@/components/sections/sdg-grid';
import type { StakeholderMapProps } from '@/components/sections/stakeholder-map';
import { TODO_CONTENT } from '@/lib/config/site';
import { SDG_GOALS, sdgHref } from './sdg-goals';

/**
 * Our Key ESG Metrics' static content (FE-13).
 *
 * ## The copy
 *
 * The design's, `Our Key ESG Metrics v2.dc.html` (Claude Design project
 * `6afc516d-…`, 2026-10-06), which its handoff records as the live page's
 * word for word, line breaks collapsed — including "Stakeholder's Map",
 * "Investors/ Lenders", "Govt./ Regulatory Bodies" and the curly apostrophe
 * in "SAEL’s". **No metrics, figures or group labels are added**: the live
 * page has none, and neither does the design. The only numbers are the SDG
 * numbers, which are the live page's.
 *
 * The UN's disclaimer and two links, which the UN's guidelines for using the
 * icons ask for on the same page, sat under the SDG icons until 2026-10-07,
 * when the client asked for everything under the icons removed.
 *
 * **The ESG Report button under "Reporting Framework"** is Our Core Beliefs'
 * own link (`esgReport` in `our-core-beliefs.ts`), added at the client's
 * request of 2026-10-07. It opens the Sustainability Reports page under
 * Corporate Governance.
 *
 * ## The SDG icons
 *
 * The ten goals, their names and the UN's icons are `SDG_GOALS`
 * (`sdg-goals.ts`), shared with the SDG page. Each links to its goal's block
 * on that page (`#sdg-N`), the live page's own links, written with the
 * trailing slash the route carries.
 */

export const esgMetricsMeta = {
  /** The live page's own `<title>`, verbatim. */
  title: 'Our Key ESG Metrics - SAEL',
  /**
   * The live page ships `<meta name="description" content="">`. Nothing to
   * transcribe; `buildMetadata()` drops the marker rather than emitting it.
   */
  description: TODO_CONTENT,
} as const;

export const esgMetricsHero: Omit<EsgHeroProps, 'snap'> = {
  eyebrow: 'Sustainability',
  title: 'Our Key ESG Metrics',
  intro:
    'SAEL dutifully focuses on ESG (Environmental, Social, and Governance) metrics, prioritizing sustainability',
};

export const sdgCommitments: Omit<SdgGridProps, 'snap'> = {
  eyebrow: 'Sustainable Development Goals',
  title: 'Our Commitment to The UN SDGs',
  // The live page's ten, in numeric order, named as it names them.
  goals: SDG_GOALS.map((goal) => ({ ...goal, href: sdgHref(goal.number) })),
};

export const reportingFramework: Omit<ProseSplitProps, 'snap'> = {
  eyebrow: 'ESG Reporting',
  title: 'Reporting Framework',
  body: [
    'We rely on several widely accepted ESG reporting methodologies to inform us of our approach to sharing SAEL’s sustainability progress and key performance indicators (KPIs). This helps us ensure the framework we use is aligned with industry standards, allowing us to inform our stakeholders of our ESG efforts in a streamlined manner.',
  ],
  copyBeside: true,
};

export const stakeholders: Omit<StakeholderMapProps, 'snap'> = {
  eyebrow: "Stakeholder's Map",
  title: 'Our Key Stakeholders',
  // The live page's two groups, in its order: the six it draws in blue,
  // then the two in green.
  outer: [
    'Media/NGOs',
    'Customers',
    'Investors/ Lenders',
    'Vendors/ Suppliers',
    'Govt./ Regulatory Bodies',
    'Local Communities',
  ],
  inner: ['Employees', 'Contractual Workforce'],
};
