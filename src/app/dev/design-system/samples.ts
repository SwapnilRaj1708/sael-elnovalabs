import { formatDate, formatMonthYear } from '@/lib/utils/format-date';
import { formatFileSize } from '@/lib/utils/format-file-size';

/**
 * Worked examples for the kitchen sink, computed once here so the page stays
 * readable.
 *
 * The date cases are the ones worth eyeballing: each is an instant late enough
 * in UTC that a host in IST reads it as the *next* day. Because the formatters
 * pin `Asia/Kolkata`, these render identically on the server and in the
 * browser — which is the whole point, and the bug the pinning prevents would
 * only ever show up on rows like these.
 */

export const DATE_SAMPLES: readonly (readonly [string, string])[] = [
  ['formatDate("2026-06-10T20:30:00Z") — 02:00 IST next day', formatDate('2026-06-10T20:30:00Z')],
  ['formatDate("2026-12-31T19:00:00Z") — 00:30 IST, new year', formatDate('2026-12-31T19:00:00Z')],
  ['formatDate("2026-01-01T00:00:00Z")', formatDate('2026-01-01T00:00:00Z')],
  ['formatMonthYear("2026-06-10T20:30:00Z")', formatMonthYear('2026-06-10T20:30:00Z')],
  ['formatDate("not a date") — empty, never a throw', `"${formatDate('not a date')}"`],
];

export const FILE_SIZE_SAMPLES: readonly (readonly [string, string])[] = [
  ['formatFileSize(512)', formatFileSize(512)],
  ['formatFileSize(148_221)', formatFileSize(148_221)],
  ['formatFileSize(2_411_724)', formatFileSize(2_411_724)],
  ['formatFileSize(3_400_000_000)', formatFileSize(3_400_000_000)],
  ['formatFileSize(-1) — empty', `"${formatFileSize(-1)}"`],
];
