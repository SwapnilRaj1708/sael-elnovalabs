import type { ReactNode } from 'react';
import { DataTableDetailRow } from '@/components/ui/data-table-detail-row';
import { cn } from '@/lib/utils/cn';

export interface DataTableColumn {
  /** The header cell, verbatim. */
  label: string;
  /**
   * `end` for a numeric column, so its figures line up on the decimal point
   * — with `tabular-nums`, every digit is the same width.
   */
  align?: 'start' | 'end';
}

export interface DataTableProps {
  /** The table's heading, verbatim. Rendered as the heading above it. */
  heading: string;
  /** The section's anchor, and the root of the heading's id. */
  id: string;
  headingLevel?: 'h2' | 'h3';
  columns: readonly DataTableColumn[];
  /**
   * Cell text, one array per row, in column order. Strings, not numbers:
   * a disclosed figure is shown exactly as it was published — `4.32`, not
   * whatever a number formatter makes of it.
   */
  rows: readonly (readonly string[])[];
  /**
   * A last column whose cell opens a full-width row under its own — the Board
   * of Directors' "About". Added for that page; see `<DataTableDetailRow>`.
   */
  detail?: DataTableDetail;
}

export interface DataTableDetail {
  /** The column's header, verbatim — "About". */
  column: string;
  /** Per row, in row order: what the row opens, server-rendered, or `null`. */
  content: readonly (ReactNode | null)[];
  /**
   * The toggle's accessible name for a row. Defaults to the column and the
   * row's first cell — "About Jasbir Singh" — which names both what opens and
   * whose it is.
   */
  toggleLabel?: (cells: readonly string[]) => string;
}

/**
 * A heading over a table of figures — a disclosure's own table, reproduced.
 *
 * Real table markup, with `scope="col"` headers and the heading wired to the
 * table as its accessible name, so a screen reader can announce each cell
 * with its column. Built for Outstanding Dues to Material Creditors, and
 * general enough for the other investor tables still to come.
 *
 * Headers keep the source's capitalisation — no `uppercase` — because they
 * are published labels ("S. No.") rather than house chrome.
 *
 * **Narrow screens.** The table fills its column and its cells wrap, which
 * holds three columns comfortably at 360px. The wrapper scrolls sideways
 * only if a future table is too wide to wrap, rather than overflowing the
 * page.
 *
 * **`detail`** adds a column of toggles, each opening a full-width row
 * beneath its own — for text too long for a cell. The Board of Directors'
 * biographies are the case: the legacy "+" / "About" arrangement, kept.
 *
 * Dark ground only, with the hairline idiom: a rule under the header, a rule
 * between rows. Rows are keyed by position — this is a fixed transcription,
 * not a backend list that can reorder.
 *
 * A Server Component.
 */
export function DataTable({
  heading,
  id,
  headingLevel: Heading = 'h2',
  columns,
  rows,
  detail,
}: DataTableProps) {
  const headingId = `${id}-heading`;

  const cellsOf = (cells: readonly string[]) =>
    cells.map((cell, index) => (
      <td
        key={columns[index]?.label ?? index}
        className={cn(
          'py-stack pr-stack align-top text-body-on-dark last:pr-0',
          columns[index]?.align === 'end' ? 'text-right tabular-nums' : 'text-left',
        )}
      >
        {cell}
      </td>
    ));

  return (
    <section id={id} aria-labelledby={headingId} className="flex flex-col gap-stack">
      <Heading id={headingId} className="text-h2 text-white">
        {heading}
      </Heading>

      <div className="w-full overflow-x-auto">
        <table aria-labelledby={headingId} className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-hairline-grid">
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={cn(
                    'py-stack pr-stack align-bottom font-bold text-white last:pr-0',
                    column.align === 'end' ? 'text-right' : 'text-left',
                  )}
                >
                  {column.label}
                </th>
              ))}
              {detail !== undefined && (
                <th
                  scope="col"
                  className="w-touch py-stack text-center align-bottom font-bold text-white"
                >
                  {detail.column}
                </th>
              )}
            </tr>
          </thead>

          {detail === undefined ? (
            <tbody>
              {rows.map((cells, row) => (
                <tr key={row} className="border-b border-hairline-dark">
                  {cellsOf(cells)}
                </tr>
              ))}
            </tbody>
          ) : (
            rows.map((cells, row) => (
              <DataTableDetailRow
                key={row}
                cells={cellsOf(cells)}
                detail={detail.content[row] ?? null}
                colSpan={columns.length + 1}
                toggleLabel={
                  detail.toggleLabel?.(cells) ?? `${detail.column} ${cells[0] ?? ''}`.trim()
                }
              />
            ))
          )}
        </table>
      </div>
    </section>
  );
}
