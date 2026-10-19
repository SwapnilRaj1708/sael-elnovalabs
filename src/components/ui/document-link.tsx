import { cva, type VariantProps } from 'class-variance-authority';
import { ExternalLink } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { PdfIcon } from '@/components/icons/pdf';
import { cn } from '@/lib/utils/cn';
import { formatFileSize } from '@/lib/utils/format-file-size';

/**
 * A link to an investor document — used on every page under `/investors/`.
 *
 * The documents are PDFs in Azure Blob Storage. They are **linked, not
 * proxied**: the href is the blob's absolute URL and the browser handles it.
 * docs/asset-inventory.md §8.
 *
 * The accessible name is the whole of it — *"Annual Return FY 2024-25, PDF,
 * 2.4 MB, opens in a new tab"*. Sighted users read the type and size from the
 * meta line; without the `sr-only` span a screen-reader user would hear only
 * the title, follow the link, and land in a 40MB download with no warning.
 * The visible meta is `aria-hidden` so it is not announced twice.
 *
 * **`ground` was added 2026-09-21** for the business pages' "Product
 * Downloads" block, which sits on the black dot ground. Same link, the dark
 * ramp: the hairline, the title and the meta each swap to their on-dark
 * token, and the hover takes the footer's `brand-red-bright` rather than
 * paper's `accent-hover`, which is the red the footer already found too dim
 * on black. Paper stays the default so no existing call site changes — but
 * the investor pages, built from Offer Documents on, are dark like the rest
 * of the site and pass `ground="dark"` (docs/design-guidelines.md §1).
 *
 * **Split in two with Offer Documents** so a gated row can share it: the
 * row's classes (`documentRow`) and its contents (`<DocumentRowBody>`) are
 * exported, and `<DocumentLink>` is those two inside an `<a>`. The gated row
 * in `ui/gated-document-link.tsx` is the same two inside a `<button>`,
 * because until its disclaimer is confirmed it has no URL to link to. The
 * rendered link is unchanged by the split.
 *
 * The row's classes, exported for an element that is a document row but not
 * a link, so the two cannot drift apart.
 */
export const documentRow = cva(
  [
    'group flex items-start justify-between gap-4 border-b py-4',
    'transition-colors duration-(--duration-micro)',
  ],
  {
    variants: {
      ground: {
        paper: 'border-border hover:text-accent-hover',
        // The global ring is --color-brand-blue, 1.84:1 on the black ground
        // and under WCAG 1.4.11's 3.0 floor; white is the dark surfaces' own
        // override. Added with Offer Documents — Product Downloads, the other
        // dark call site, had the invisible ring until then.
        dark: 'border-hairline-dark hover:text-brand-red-bright focus-visible:outline-white',
      },
    },
    defaultVariants: { ground: 'paper' },
  },
);

const TITLE_CLASS: Record<'paper' | 'dark', string> = {
  paper: 'text-ink group-hover:text-accent-hover',
  dark: 'text-white group-hover:text-brand-red-bright',
};
const META_CLASS: Record<'paper' | 'dark', string> = {
  paper: 'text-body-soft',
  dark: 'text-on-dark-soft',
};
/** The file-type mark takes the brand red of the ground it sits on. */
const MARK_CLASS: Record<'paper' | 'dark', string> = {
  paper: 'text-brand-red',
  dark: 'text-brand-red-bright',
};

export interface DocumentRowBodyProps {
  title: string;
  /** Shown verbatim, e.g. `"PDF"`. */
  fileType?: string;
  /** Size in bytes. Omitted when the backend does not report one. */
  fileSize?: number;
  /**
   * The end of the accessible name, after the type and size — what activating
   * the row does, e.g. `"opens in a new tab"`. Omitted when the element says
   * that itself, as a `<button aria-haspopup="dialog">` does.
   */
  action?: string;
  ground?: 'paper' | 'dark' | null;
  /**
   * Lead the row with a PDF mark when the file is one — the client's ask of
   * 2026-09-29 for the investor pages, so a PDF reads as one at a glance.
   * Off by default, so the business pages' Product Downloads are unchanged.
   * Decorative: the accessible name already says "PDF".
   */
  typeMark?: boolean;
}

/**
 * The inside of a document row — the optional PDF mark, title, meta line,
 * the accessible name's tail, and the glyph. Shared by `<DocumentLink>` and
 * the gated row, which differ only in the element around it.
 */
export function DocumentRowBody({
  title,
  fileType = 'PDF',
  fileSize,
  action,
  ground,
  typeMark = false,
}: DocumentRowBodyProps) {
  const size = fileSize === undefined ? '' : formatFileSize(fileSize);
  const meta = [fileType, size].filter((part) => part !== '');
  const tail = [...meta, ...(action === undefined ? [] : [action])];
  const g = ground ?? 'paper';
  const showMark = typeMark && fileType === 'PDF';
  // With the mark shown, the visible line drops the type: the icon already
  // says "PDF" (client, 2026-10-06). The accessible name keeps it, via `tail`.
  const visibleMeta = showMark ? meta.filter((part) => part !== fileType) : meta;

  return (
    <>
      {showMark && <PdfIcon className={cn('size-icon-mark shrink-0', MARK_CLASS[g])} />}

      {/* Takes the room between the mark and the glyph, so a long title wraps
          rather than pushing the glyph off the row. */}
      <span className="flex flex-1 flex-col gap-1">
        <span className={cn('text-h3', TITLE_CLASS[g])}>{title}</span>

        {visibleMeta.length > 0 && (
          <span className={cn('text-body-sm', META_CLASS[g])} aria-hidden="true">
            {visibleMeta.join(' · ')}
          </span>
        )}

        {tail.length > 0 && <span className="sr-only">, {tail.join(', ')}</span>}
      </span>

      <ExternalLink className="mt-1 size-5 shrink-0" aria-hidden="true" focusable="false" />
    </>
  );
}

export interface DocumentLinkProps
  extends
    Omit<ComponentPropsWithRef<'a'>, 'children' | 'href' | 'title'>,
    VariantProps<typeof documentRow> {
  /** The document's absolute URL. Compose it with `blobUrl()`. */
  href: string;
  title: string;
  /** Shown verbatim, e.g. `"PDF"`. */
  fileType?: string;
  /** Size in bytes. Omitted when the backend does not report one. */
  fileSize?: number;
  /** Lead with a PDF mark. See `<DocumentRowBody>`. */
  typeMark?: boolean;
}

export function DocumentLink({
  href,
  title,
  fileType = 'PDF',
  fileSize,
  ground,
  typeMark,
  className,
  ...props
}: DocumentLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(documentRow({ ground }), className)}
      {...props}
    >
      <DocumentRowBody
        title={title}
        fileType={fileType}
        fileSize={fileSize}
        action="opens in a new tab"
        ground={ground}
        typeMark={typeMark}
      />
    </a>
  );
}
