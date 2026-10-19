import { DisplayHeading, type BusinessGradient } from '@/components/ui/display-heading';
import { DocumentLink } from '@/components/ui/document-link';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface ProductDownload {
  /** The sheet's title, as the link reads — "SAEL Solar TOPCon Bifacial G12R 615 635 Wp". */
  title: string;
  /** The file's absolute URL. Never a path into this repo — /CLAUDE.md §8. */
  href: string;
  /** Size in bytes, when known. */
  fileSize?: number;
}

export interface ProductDownloadsProps {
  eyebrow?: string;
  title: string;
  /**
   * Sets the heading in a business's mark ramp instead of the ground's — the
   * four business pages. See BUSINESS_GRADIENT_CLASS.
   */
  titleGradient?: BusinessGradient;
  items: readonly ProductDownload[];
  /**
   * `dark` is the site's default. `paper` sets the heading block and the
   * rows in their paper ramps and inks — Module Manufacturing's downloads,
   * inside `<DownloadsProwess>`, since 2026-10-14.
   */
  ground?: 'dark' | 'paper';
  /**
   * `tight` for a block between two taller sections. Defaults to `tight` on
   * a snapping section and `default` otherwise.
   */
  spacing?: 'default' | 'tight';
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm. See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

/**
 * A heading over a short list of product sheets — the business pages'
 * "Product Downloads".
 *
 * Built 2026-09-21 for Module Manufacturing, whose live page lists three
 * module datasheets between the projects map and the prowess cards. It had
 * been left out (see `_content/module-manufacturing.ts`) because the PDFs live
 * under the legacy site's `/documents/`; the client asked for the block back,
 * linking to those files where they are for now.
 *
 * It is the investor pages' `<DocumentLink>` on the dark ground, and nothing
 * more: a list of files is a list of files whichever page it is on, and a
 * second list idiom for three links would be exactly the duplication the
 * primitives exist to prevent. The list is a `<ul>` because it is one — a
 * screen reader announcing "list, three items" is the right summary of it.
 *
 * **Two columns from `lg`.** A three-row list capped at the body measure and
 * pinned to the left gutter left the right half of a 1920px section empty —
 * the client's note of 2026-09-21. So above `lg` the heading takes the first
 * third and the list the other two, on the same column gap the capability
 * rows use; the row reads across the width the way the map section above it
 * does. Below `lg` it stacks, heading over list, and the list is uncapped
 * because its column is the cap.
 *
 * Like `<ValueGrid>`, the list arrives as one `<Reveal>` after the heading:
 * three rows cascading separately would still be landing when the reader
 * reached them.
 *
 * A Server Component. The rows are plain links.
 */
export function ProductDownloads({ spacing, snap = false, ...props }: ProductDownloadsProps) {
  return (
    <Section
      background={props.ground === 'paper' ? 'paper-dots' : 'black-dots'}
      spacing={spacing ?? (snap ? 'tight' : 'default')}
      data-snap-section
      className={cn(snap && 'flex min-h-viewport snap-start items-center')}
    >
      <ProductDownloadsLayout {...props} />
    </Section>
  );
}

/** {@link ProductDownloads}' own props, less the two that belong to its section. */
export type ProductDownloadsLayoutProps = Omit<ProductDownloadsProps, 'spacing' | 'snap'>;

/**
 * The heading and the list, without the `<Section>` around them.
 *
 * Exported so `<DownloadsProwess>` can set it above the prowess cards in one
 * section (Module Manufacturing, 2026-10-12). Everything documented on
 * {@link ProductDownloads} applies here.
 */
export function ProductDownloadsLayout({
  eyebrow,
  title,
  titleGradient,
  items,
  ground = 'dark',
}: ProductDownloadsLayoutProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-flow',
        'lg:grid lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-x-ledger-col-gap',
      )}
    >
      <div className="flex flex-col gap-stack">
        {eyebrow !== undefined && (
          <Reveal order={0}>
            <Eyebrow tone={ground === 'paper' ? 'deep' : 'bright'}>{eyebrow}</Eyebrow>
          </Reveal>
        )}

        <Reveal order={eyebrow === undefined ? 0 : 1}>
          <DisplayHeading ground={ground} business={titleGradient}>
            {title}
          </DisplayHeading>
        </Reveal>
      </div>

      <Reveal order={2}>
        <ul className="flex w-full flex-col">
          {items.map((item) => (
            <li key={item.href}>
              <DocumentLink
                ground={ground}
                href={item.href}
                title={item.title}
                fileSize={item.fileSize}
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
