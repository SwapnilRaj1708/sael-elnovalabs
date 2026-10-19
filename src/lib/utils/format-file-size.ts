/**
 * Format a byte count for a document link, e.g. `"2.4 MB"`.
 *
 * Investor PDFs are linked, not proxied, so the size is the only warning a
 * visitor on a metered connection gets before a 40MB annual report starts
 * downloading. It is part of the link's accessible name — see
 * `components/ui/document-link.tsx` and docs/asset-inventory.md §8.
 *
 * Units are decimal (1 kB = 1000 bytes), matching what the OS download UI and
 * Azure's blob metadata report. One decimal place from MB up; whole numbers
 * below that, because "1.4 kB" is noise.
 */

const UNITS = ['bytes', 'kB', 'MB', 'GB'] as const;

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1000) return `${String(Math.round(bytes))} bytes`;

  let value = bytes;
  let unit = 0;

  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }

  // `unit` is bounded by the loop condition, so this is always in range —
  // noUncheckedIndexedAccess cannot see that.
  const suffix = UNITS[unit] ?? 'bytes';
  const rounded = unit >= 2 ? value.toFixed(1) : String(Math.round(value));

  return `${rounded} ${suffix}`;
}
