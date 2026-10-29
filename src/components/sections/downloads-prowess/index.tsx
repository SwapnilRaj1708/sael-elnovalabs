import {
  ProductDownloadsLayout,
  type ProductDownloadsLayoutProps,
} from '@/components/sections/product-downloads';
import { ValueGridLayout, type ValueGridLayoutProps } from '@/components/sections/value-grid';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface DownloadsProwessProps {
  /** The product datasheets: heading and list. */
  downloads: ProductDownloadsLayoutProps;
  /** The cards under them — "Manufacturing Process". */
  prowess: ValueGridLayoutProps;
  /**
   * The section's ground, and both halves' — set here once rather than on
   * each, so the two cannot disagree. `paper` since 2026-10-14. The prowess
   * marks are the caller's: pass each its own `ground` too.
   */
  ground?: 'dark' | 'paper';
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm. See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

/**
 * Module Manufacturing's Product Downloads and Manufacturing Process, as one
 * section — the client's request of 2026-10-12. Each was a screen of its own
 * until then, and both are short, so the page snapped onto two screens that
 * were mostly empty. Merged, they share one, with no change to either's
 * content. The live page's order is kept: the datasheets, then the cards.
 *
 * It composes the two sections' own layouts — `<ProductDownloadsLayout>` and
 * `<ValueGridLayout>` — rather than redrawing them, so each stays one
 * component wherever it is used. The same move Our Key ESG Metrics'
 * `<ReportingStakeholders>` makes.
 *
 * The two halves sit `--spacing-section-y-tight` apart, more than any gap
 * inside either, so the second heading reads as a new part rather than a
 * continuation of the first.
 *
 * `overflow-x-clip` because the prowess cards are outlined, and an outlined
 * card's hover gradient reaches past the viewport's edge on a phone — see
 * `<ValueGrid>`.
 *
 * A Server Component; only the reveals are client.
 */
export function DownloadsProwess({
  downloads,
  prowess,
  ground = 'dark',
  snap = false,
}: DownloadsProwessProps) {
  return (
    <Section
      background={ground === 'paper' ? 'paper-dots' : 'black-dots'}
      spacing={snap ? 'tight' : 'default'}
      data-snap-section
      className={cn('overflow-x-clip', snap && 'flex min-h-viewport snap-start items-center')}
    >
      <div className="flex w-full flex-col gap-section-y-tight">
        {/* No datasheets, no heading for them: an item without a URL is left
            out upstream, and a "Product Downloads" title over an empty list
            reads as broken. */}
        {downloads.items.length > 0 && <ProductDownloadsLayout {...downloads} ground={ground} />}
        <ValueGridLayout {...prowess} ground={ground} />
      </div>
    </Section>
  );
}
