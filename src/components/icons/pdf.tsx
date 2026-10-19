import type { SVGProps } from 'react';

/**
 * A PDF file: a page with its corner turned, and "PDF" set on it.
 *
 * Drawn here because lucide has no PDF-specific glyph, only generic files —
 * and the point, at the client's request of 2026-09-29, is that a document
 * link says "PDF" at a glance. The legacy site marked its PDF links the same
 * way, with Boxicons' PDF file.
 *
 * On lucide's 24-unit grid with its 2-unit stroke, so it sits beside the
 * lucide icons elsewhere on the page without looking borrowed. The label is
 * live text in the page's own face (DIN), in `currentColor` like the stroke.
 *
 * Decorative: always rendered inside a link whose accessible name already
 * says "PDF", so it is `aria-hidden` and carries no title.
 */
export function PdfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <text
        x="12"
        y="17.5"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="6.5"
        fontWeight="700"
      >
        PDF
      </text>
    </svg>
  );
}
