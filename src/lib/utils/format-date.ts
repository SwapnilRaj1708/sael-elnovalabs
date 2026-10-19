/**
 * Date formatting for display, e.g. `"Jun 10, 2026"`.
 *
 * Two things make this a shared utility rather than an inline `toLocaleString`
 * at each call site:
 *
 * **The time zone is pinned.** Without an explicit `timeZone`, `Intl` uses the
 * host's. The server runs UTC on the Azure VM; a visitor in Kolkata is at
 * +05:30. A news item published at `2026-06-10T20:00:00Z` is 10 June on the
 * server and 11 June in the browser — so the server renders one date, the
 * browser hydrates another, and React logs a hydration mismatch on exactly the
 * late-evening items nobody thinks to test. Pinning to `Asia/Kolkata` also
 * happens to be correct: this is an Indian company publishing on IST.
 *
 * **The locale is pinned too.** `en-IN` orders the parts as `10 Jun 2026`;
 * the format the design calls for is `Jun 10, 2026`, which is `en-US` ordering.
 * The output format is the requirement, so the locale follows from it rather
 * than the other way round.
 */

const IST = 'Asia/Kolkata';

/** `"Jun 10, 2026"` */
const longFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/** `"June 2026"` — investor documents are grouped by month, not day. */
const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  year: 'numeric',
  month: 'long',
});

/** `"Sep 5, 2026, 8:33 AM"` — a moment, for the preview banner's "last changed". */
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function parse(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format an ISO 8601 string (or `Date`) as `"Jun 10, 2026"`.
 *
 * Returns an empty string for an unparseable value. A malformed date from the
 * backend should leave a gap in the layout, not throw and take the page with
 * it — /CLAUDE.md §6.
 */
export function formatDate(value: string | Date): string {
  const date = parse(value);
  return date === null ? '' : longFormatter.format(date);
}

/** Format as `"June 2026"`. Same failure behaviour as {@link formatDate}. */
export function formatMonthYear(value: string | Date): string {
  const date = parse(value);
  return date === null ? '' : monthYearFormatter.format(date);
}

/**
 * Format as `"Sep 5, 2026, 8:33 AM"`, in IST like every date here. Same
 * failure behaviour as {@link formatDate}.
 */
export function formatDateTime(value: string | Date): string {
  const date = parse(value);
  return date === null ? '' : dateTimeFormatter.format(date);
}

/**
 * The `datetime` attribute for a `<time>` element: always the full ISO
 * instant, never the display string, so machines read the unambiguous value
 * while people read the formatted one.
 */
export function toDateTimeAttribute(value: string | Date): string | undefined {
  const date = parse(value);
  return date === null ? undefined : date.toISOString();
}
