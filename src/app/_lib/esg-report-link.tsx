import { ArrowRight } from 'lucide-react';
import { esgReport } from '@/app/_content/our-core-beliefs';
import { Button } from '@/components/ui/button';

export interface EsgReportLinkProps {
  /** The ground the pill sits on. `dark` unless the section under it is paper. */
  ground?: 'dark' | 'paper';
}

/**
 * The ESG Report pill — a link to the Sustainability Reports page under
 * Corporate Governance, in the same tab.
 *
 * Our Core Beliefs draws it under its last belief, and Our Key ESG Metrics
 * under "Reporting Framework" (the client's request of 2026-10-07). One
 * component, so the two pages cannot link different places. Where it goes,
 * and why, is on `esgReport` in `_content/our-core-beliefs.ts`.
 *
 * `ArrowRight`, not the `ArrowUpRight` it took while it opened a PDF in a
 * new tab: it is a page on this site now.
 *
 * The full width on a phone, where the pill is the easier target; its own
 * width from `sm`.
 *
 * `ground="paper"` under Our Core Beliefs' last belief, drawn on paper since
 * 2026-10-14.
 */
export function EsgReportLink({ ground = 'dark' }: EsgReportLinkProps) {
  return (
    <Button
      href={esgReport.href}
      variant={ground === 'paper' ? 'pillOnPaper' : 'pill'}
      className="w-full sm:w-fit"
    >
      {esgReport.label}
      <ArrowRight className="size-5 shrink-0" aria-hidden="true" focusable="false" />
    </Button>
  );
}
