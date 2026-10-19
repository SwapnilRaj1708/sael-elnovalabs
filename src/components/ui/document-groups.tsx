import {
  DocumentList,
  type DocumentListGate,
  type DocumentListGatedItem,
  type DocumentListLink,
  type DocumentListUnavailableItem,
} from '@/components/ui/document-list';
import { EmptyState } from '@/components/ui/empty-state';
import { JumpLinks } from '@/components/ui/jump-links';

export interface DocumentSubgroupData<T> {
  /** Verbatim — "FY 2026". */
  label: string;
  /** The backend's anchor, as given. */
  anchor: string;
  items: readonly T[];
}

export interface DocumentGroupData<T> {
  /** Verbatim — "FY 2025", "FY2026", "Statutory Policies". `null`: no heading. */
  label: string | null;
  /**
   * The section's id — the backend's anchor, as given, which for a year is
   * the legacy tab id, `#fy2025`. `null` exactly when `label` is.
   */
  anchor: string | null;
  /** Documents directly under the heading. */
  items: readonly T[];
  /** A second tier of headings under this one, each with its own documents. */
  subgroups: readonly DocumentSubgroupData<T>[];
}

/** A plain list's rows: links, and documents with nothing to open. */
export type DocumentLinkRow = DocumentListLink | DocumentListUnavailableItem;
/** A gated list's rows: no URLs at all. */
export type DocumentGatedRow = DocumentListGatedItem | DocumentListUnavailableItem;

interface DocumentGroupsBaseProps {
  /** The jump row's accessible name — functional copy, "On this page". */
  jumpLabel: string;
  /** Shown when there are no groups at all — a tile with nothing published. */
  emptyTitle: string;
  emptyDescription?: string;
}

export type DocumentGroupsProps = DocumentGroupsBaseProps &
  (
    | { groups: readonly DocumentGroupData<DocumentLinkRow>[]; gate?: undefined }
    | { groups: readonly DocumentGroupData<DocumentGatedRow>[]; gate: DocumentListGate }
  );

/**
 * A listing under its headings — **the one year-group pattern every investor
 * page uses**, for financial years and for named groups alike.
 *
 * Every group is a section with an `<h2>`, stacked, newest first where the
 * business orders it so; a group with subgroups carries an `<h3>` per
 * subgroup (General Meeting's "Extra-Ordinary General Meeting", by year).
 * When there are two or more headings, a row of `<JumpLinks>` above them
 * takes the reader straight to one — the legacy tab row, which hid every
 * year but one, turned into links to years that are all on the page.
 *
 * **Why headings and not tabs or a disclosure.** Most of these pages hold
 * one to four documents a year, and there, hiding years behind controls is
 * clicks for nothing. Stacked headings put every document in the HTML with
 * no script — crawlable, found by find-in-page, readable by any screen
 * reader's heading navigation — and the jump row gives back the one thing the
 * tabs were good for, reaching a year directly, while keeping the legacy tab
 * ids as anchors so old deep links land. The one long page, Material
 * Subsidiaries, adds a company filter over the same markup rather than a
 * second pattern (`<DocumentFilter>`).
 *
 * **The groups are the backend's, rendered as given** — their order, labels
 * and anchors. A heading with nothing under it renders its heading alone,
 * as the legacy page does ("Postal Ballot"). The documents under no heading
 * render with no heading, never dropped. A page with no groups at all
 * renders `<EmptyState>`.
 *
 * Given a `gate`, every list is gated: one tile, one notice.
 *
 * Holds no state and no hooks, so it renders on the server and inside the
 * filter, which is client, alike.
 */
/**
 * One list, plain or gated. A function rather than a spread of `gate`, so
 * the plain/gated pairing of rows and gate is checked here, once.
 */
function list(
  props: DocumentGroupsProps,
  items: readonly DocumentLinkRow[] | readonly DocumentGatedRow[],
  { key, ...rest }: { key?: string; id?: string; heading?: string; headingLevel?: 'h2' | 'h3' },
) {
  return props.gate === undefined ? (
    <DocumentList key={key} {...rest} items={items as readonly DocumentLinkRow[]} />
  ) : (
    <DocumentList
      key={key}
      {...rest}
      items={items as readonly DocumentGatedRow[]}
      gate={props.gate}
    />
  );
}

/** The unheaded group's React key. Its `id` is absent — it has no heading to link to. */
const UNHEADED = 'unheaded';

export function DocumentGroups(props: DocumentGroupsProps) {
  const { groups, jumpLabel, emptyTitle, emptyDescription } = props;
  if (groups.length === 0) {
    return <EmptyState ground="dark" title={emptyTitle} description={emptyDescription} />;
  }

  const headed = groups.flatMap((group) =>
    group.label === null || group.anchor === null
      ? []
      : [{ label: group.label, href: `#${group.anchor}` }],
  );

  return (
    <div className="flex flex-col gap-flow">
      {headed.length >= 2 && <JumpLinks label={jumpLabel} links={headed} />}

      <div className="flex flex-col gap-section-y-tight">
        {groups.map((group) => {
          const key = group.anchor ?? UNHEADED;
          const anchor = group.anchor ?? undefined;

          return group.subgroups.length === 0 ? (
            list(props, group.items, {
              key,
              id: anchor,
              heading: group.label ?? undefined,
            })
          ) : (
            <section
              key={key}
              id={anchor}
              aria-labelledby={
                group.label === null || anchor === undefined ? undefined : `${anchor}-heading`
              }
              className="flex flex-col gap-flow"
            >
              {group.label !== null && (
                <h2
                  id={anchor === undefined ? undefined : `${anchor}-heading`}
                  className="text-h2 text-white"
                >
                  {group.label}
                </h2>
              )}

              {group.items.length > 0 &&
                list(props, group.items, {
                  id: anchor === undefined ? undefined : `${anchor}-documents`,
                })}

              {group.subgroups.map((subgroup) =>
                list(props, subgroup.items, {
                  key: subgroup.anchor,
                  id: subgroup.anchor,
                  heading: subgroup.label,
                  headingLevel: 'h3',
                }),
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
