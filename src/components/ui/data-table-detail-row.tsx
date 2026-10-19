'use client';

import { useId, useState, type ReactNode } from 'react';

export interface DataTableDetailRowProps {
  /** The row's own cells, server-rendered `<td>`s. */
  cells: ReactNode;
  /** What the toggle reveals, server-rendered. `null`: no toggle. */
  detail: ReactNode | null;
  /** The full width of the table, so the detail row spans it. */
  colSpan: number;
  /** The toggle's accessible name — "About Jasbir Singh". */
  toggleLabel: string;
}

/**
 * One table row and, under it, a full-width row it opens — the legacy Board
 * of Directors' "+" and the biography it reveals.
 *
 * **Its own `<tbody>`**, which a table may have any number of: the pair is
 * one unit, and grouping it lets this client leaf own the open state of both
 * rows without owning the table. The cells and the detail arrive already
 * rendered on the server; this renders nothing of its own but the button.
 *
 * **Full width on purpose.** A 2,600-character biography in the third of
 * three columns is a ribbon of text a word wide on a phone. Opened as a row
 * of its own it reads at the table's whole width — the legacy page's own
 * answer, and the only one that works at 360px without scrolling sideways.
 *
 * The detail is in the HTML from the start, `hidden` until opened, so a
 * crawler and a no-script reader both have it. The button is a real button
 * with `aria-expanded` and `aria-controls`, named for the row it opens.
 */
export function DataTableDetailRow({
  cells,
  detail,
  colSpan,
  toggleLabel,
}: DataTableDetailRowProps) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  return (
    <tbody className="border-b border-hairline-dark">
      <tr>
        {cells}
        <td className="py-stack text-center align-top">
          {detail !== null && (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailId}
              aria-label={toggleLabel}
              onClick={() => {
                setOpen((current) => !current);
              }}
              className="inline-flex size-touch cursor-pointer items-center justify-center border border-hairline-grid text-h3 leading-none text-body-on-dark transition-colors duration-(--duration-micro) hover:text-white focus-visible:outline-white"
            >
              {/* The legacy glyphs; the name and state come from ARIA. */}
              <span aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
          )}
        </td>
      </tr>
      <tr id={detailId} hidden={!open}>
        <td colSpan={colSpan} className="pb-stack">
          {detail}
        </td>
      </tr>
    </tbody>
  );
}
