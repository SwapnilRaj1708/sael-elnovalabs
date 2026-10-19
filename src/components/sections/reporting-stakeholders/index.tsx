import { ProseSplitLayout, type ProseSplitProps } from '@/components/sections/prose-split';
import {
  StakeholderMapLayout,
  type StakeholderMapProps,
} from '@/components/sections/stakeholder-map';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface ReportingStakeholdersProps {
  /** The Reporting Framework: heading, copy beside it, and its action. */
  reporting: Omit<ProseSplitProps, 'snap'>;
  /** The Stakeholder's Map under it. */
  stakeholders: Omit<StakeholderMapProps, 'snap'>;
  /**
   * Opt into the page's section snapping — a screen tall, content centred.
   * See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

/**
 * Our Key ESG Metrics' Reporting Framework and Stakeholder's Map, as one
 * section — the client's request of 2026-10-07. Each was a screen of its
 * own until then, and both are short, so the page snapped onto two screens
 * that were mostly empty. Merged, they share one, with no change to either's
 * content.
 *
 * It composes the two sections' own layouts — `<ProseSplitLayout>` and
 * `<StakeholderMapLayout>` — rather than redrawing them, so each stays one
 * component wherever it is used. The ESG Report button the client asked for
 * under the "Reporting Framework" heading is the reporting half's `action`.
 *
 * The two halves sit `--spacing-section-y-tight` apart, more than any gap
 * inside either, so the second heading reads as a new part rather than a
 * continuation of the first. To fit them in one screen from 1280 × 800, the
 * tree is drawn tighter than the design's, with shorter boxes and connectors
 * (see `<StakeholderMap>`), and the section's own padding is `--spacing-flow`
 * rather than the standard: it is a snap section with its content centred,
 * so the padding is only ever seen where the content would otherwise touch
 * the screen's edges.
 *
 * A Server Component; only the reveals are client.
 */
export function ReportingStakeholders({
  reporting,
  stakeholders,
  snap = false,
}: ReportingStakeholdersProps) {
  return (
    <Section
      background="black-dots"
      spacing="none"
      data-snap-section
      className={cn('py-flow', snap && 'flex min-h-viewport snap-start items-center')}
    >
      <div className="flex w-full flex-col gap-section-y-tight">
        <ProseSplitLayout {...reporting} />
        <StakeholderMapLayout {...stakeholders} />
      </div>
    </Section>
  );
}
