import type { Metadata } from 'next';
import { EsgReportLink } from '@/app/_lib/esg-report-link';
import { EsgHero } from '@/components/sections/esg-hero';
import { ReportingStakeholders } from '@/components/sections/reporting-stakeholders';
import { SdgGrid } from '@/components/sections/sdg-grid';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  esgMetricsHero,
  esgMetricsMeta,
  reportingFramework,
  sdgCommitments,
  stakeholders,
} from '../_content/our-key-esg-metrics';

export const metadata: Metadata = buildMetadata({
  title: esgMetricsMeta.title,
  description: esgMetricsMeta.description,
  // `trailingSlash: true` in next.config.ts, and the legacy site's URL is
  // `/our-key-esg-metrics/`. /CLAUDE.md §2 rule 6.
  path: '/our-key-esg-metrics/',
});

/**
 * Our Key ESG Metrics (FE-13) — the ESG wheel, the SDGs SAEL commits to,
 * its reporting framework and its stakeholders.
 *
 * Built to `Our Key ESG Metrics v2.dc.html` (Claude Design project
 * `6afc516d-…`, 2026-10-06), read through the design MCP: the version with
 * the animated wheel from `ESG Animated Banner.dc.html` as its hero, which
 * supersedes the first version's hex mosaic, and with the SDGs as a grid
 * rather than the alternative carousel.
 *
 * **Changed at the client's request of 2026-10-07:** the hero is centred
 * over the investor mastheads' ripple grid; the SDG icons are centred, with
 * nothing under them, and each opens its goal on the SDG page; and the
 * Reporting Framework and Stakeholder's Map are one section, so they share
 * a screen, with Our Core Beliefs' ESG Report button under the reporting
 * heading.
 *
 * **There are no metrics on it, and that is deliberate.** The live page
 * reports none and the design adds none, so
 * `docs/features/13-our-key-esg-metrics.md`'s `<EsgMetricsSection>` —
 * figures from `getEsgMetrics()`, each with its reporting period — has
 * nothing to render and is not built. The `EsgMetric` type and that method
 * stay specified in docs/content-model.md for the day SAEL publish figures.
 *
 * **The page snaps, as the homepage does** (the client's call of 2026-10-06):
 * every section is a screen with its content centred, and a scroll lands on
 * the next, footer last. It uses the homepage's mechanism,
 * `data-snap-sections` in globals.css. On a phone the SDG grid and the
 * stakeholder tree are taller than the screen; each scrolls freely inside
 * and snaps at its edges.
 *
 * `-mt-header lg:mt-0`: below `lg` the masthead overlays the page rather than
 * offsetting it, so the sections start at the viewport top. See the homepage.
 *
 * A Server Component; the reveals and the hero's grid are client.
 */
export default function OurKeyEsgMetricsPage() {
  return (
    <div data-snap-sections className="-mt-header lg:mt-0">
      <EsgHero {...esgMetricsHero} snap />
      {/* On paper, the client's ask of 2026-10-14; hero and reporting stay dark. */}
      <SdgGrid {...sdgCommitments} ground="paper" snap />
      <ReportingStakeholders
        reporting={{ ...reportingFramework, action: <EsgReportLink /> }}
        stakeholders={stakeholders}
        snap
      />
    </div>
  );
}
