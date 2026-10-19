import { FileX } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ConsentCopy } from '@/components/ui/consent-actions';
import { DocumentLink } from '@/components/ui/document-link';
import { EmptyState } from '@/components/ui/empty-state';
import { GatedDocumentLink } from '@/components/ui/gated-document-link';

/** A document whose URL may be in the page. */
export interface DocumentListLink {
  id: string;
  title: string;
  /** Absolute. Composed from a blob path by the repository. */
  href: string;
  fileType?: string;
  /** Bytes. Omit to show no size — which is the caller's call, per page. */
  fileSize?: number;
}

/** A document behind a consent notice: no URL until the reader confirms. */
export interface DocumentListGatedItem {
  id: string;
  title: string;
  fileType?: string;
}

/**
 * A published document with nothing to open — a hosted file the backend
 * never promoted to public storage. **Shown, never left out**: a statutory
 * disclosure must not vanish from its page because its file is missing.
 */
export interface DocumentListUnavailableItem {
  id: string;
  title: string;
  /** What the row says in place of a link — functional copy. */
  unavailable: string;
}

/** What every row in a gated list shares. */
export interface DocumentListGate {
  copy: ConsentCopy;
  /** Server-rendered notice text. */
  notice: ReactNode;
  /** A Server Action: the URL for a document id, or `null`. */
  reveal: (id: string) => Promise<string | null>;
}

interface DocumentListBaseProps {
  /**
   * The list's heading, verbatim. Omitted for a list that sits under a
   * heading of its own already — the documents of a group that also has
   * subgroups.
   */
  heading?: string;
  /**
   * The section's anchor, and the root of its heading's id — the backend's
   * anchor, as given, because a published deep link points at it:
   * `#fy2025`. Omitted only for the documents under no heading, which have
   * no heading to link to.
   */
  id?: string;
  /**
   * `h2` under the page title; `h3` for a list inside another section — a
   * year inside General Meeting's "Extra-Ordinary General Meeting" — which
   * also steps the heading's size down, so the outline reads by eye too.
   */
  headingLevel?: 'h2' | 'h3';
  /**
   * Shown in place of the list when there is nothing in it. Omit it and an
   * empty list renders its heading alone — for a heading the source page
   * carries with nothing under it, where a failure message would be untrue.
   */
  emptyTitle?: string;
  emptyDescription?: string;
}

export type DocumentListProps = DocumentListBaseProps &
  (
    | { items: readonly (DocumentListLink | DocumentListUnavailableItem)[]; gate?: undefined }
    | {
        items: readonly (DocumentListGatedItem | DocumentListUnavailableItem)[];
        gate: DocumentListGate;
      }
  );

/**
 * The row for a document with nothing to open: the title, and a line saying
 * so, with no link and no hover. Muted so it does not read as a link, and
 * the note is visible text rather than a tooltip, so it is announced too.
 */
function UnavailableRow({ item }: { item: DocumentListUnavailableItem }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline-dark py-4">
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-h3 text-on-dark-soft">{item.title}</span>
        <span className="text-body-sm text-on-dark-muted">{item.unavailable}</span>
      </span>
      <FileX
        className="mt-1 size-5 shrink-0 text-on-dark-muted"
        aria-hidden="true"
        focusable="false"
      />
    </div>
  );
}

/** One `<li>` per document — a plain link, a gated row, or an unavailable one. */
function rows(props: DocumentListProps): ReactNode {
  if (props.gate === undefined) {
    return props.items.map((item) =>
      'unavailable' in item ? (
        <li key={item.id}>
          <UnavailableRow item={item} />
        </li>
      ) : (
        <li key={item.id}>
          <DocumentLink
            ground="dark"
            href={item.href}
            title={item.title}
            fileType={item.fileType}
            fileSize={item.fileSize}
            // The investor pages' PDF mark — `<DocumentRowBody>`.
            typeMark
          />
        </li>
      ),
    );
  }

  const { gate } = props;
  return props.items.map((item) =>
    'unavailable' in item ? (
      <li key={item.id}>
        <UnavailableRow item={item} />
      </li>
    ) : (
      <li key={item.id}>
        <GatedDocumentLink
          ground="dark"
          id={item.id}
          title={item.title}
          fileType={item.fileType}
          copy={gate.copy}
          notice={gate.notice}
          reveal={gate.reveal}
        />
      </li>
    ),
  );
}

/**
 * A heading over a list of documents — the body of every investor page that
 * lists files.
 *
 * **Two kinds of list, one look.** Given plain items it renders
 * `<DocumentLink>`s, whose URLs are in the HTML like any link. Given a
 * `gate`, the items carry no URL at all — the type will not accept one — and
 * each row is a `<GatedDocumentLink>` that asks for consent and fetches its
 * URL only then. Whether a list is gated is the tile's, from the backend's
 * `gate`; this component cannot be persuaded to put a gated URL on the page,
 * because it is never given one. Either kind of list can hold unavailable
 * rows — documents with nothing to open, shown as such.
 *
 * The heading, when given, takes `--text-h2`, under the page's
 * `--text-hero` and over the rows' `--text-h3`.
 *
 * Empty — a listing with nothing in it — renders `<EmptyState>` under the
 * heading when the caller gives it the copy, and the heading alone when it
 * does not. /CLAUDE.md §6.
 *
 * Dark ground only: every investor page is dark (docs/design-guidelines.md §1).
 * A Server Component; only the gated rows are client.
 */
export function DocumentList(props: DocumentListProps) {
  const { heading, id, headingLevel: Heading = 'h2', emptyTitle, emptyDescription } = props;
  const headingId = id === undefined ? undefined : `${id}-heading`;
  const empty = props.items.length === 0;

  return (
    <section
      id={id}
      aria-labelledby={heading === undefined ? undefined : headingId}
      className="flex flex-col gap-stack"
    >
      {heading !== undefined && (
        <Heading
          id={headingId}
          className={Heading === 'h2' ? 'text-h2 text-white' : 'text-h3 text-on-dark-soft'}
        >
          {heading}
        </Heading>
      )}

      {empty ? (
        emptyTitle !== undefined && (
          <EmptyState ground="dark" title={emptyTitle} description={emptyDescription} />
        )
      ) : (
        <ul className="flex flex-col">{rows(props)}</ul>
      )}
    </section>
  );
}
