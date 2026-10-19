import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

export interface PreviewBannerRow {
  /** The record's title, on a listing; `null` on an article page, which is one record. */
  title: string | null;
  /** "Pending approval", "Version 3", "Last changed by …" — already worded. */
  facts: readonly string[];
}

export interface PreviewBannerProps {
  /** "Draft preview" — the strip's label, which stays on screen. */
  label: string;
  /** "This is not the live website". */
  labelNote: string;
  /** Who can see the page, and that nothing on it is public yet. */
  audience: string;
  /** What the rows are — "Not yet live on this page". */
  heading: string;
  /** The records that differ from the live site. Empty when none does. */
  rows: readonly PreviewBannerRow[];
  /** Shown instead of the rows when there are none. */
  emptyNote: string;
  /**
   * Records the page below cannot draw, each naming what it lacks. Omitted,
   * or with no rows, when every record could be drawn.
   */
  incomplete?: {
    heading: string;
    note: string;
    rows: readonly PreviewBannerRow[];
  };
}

/** The rows of one block — a listing's records in the source's order, whose titles may repeat. */
function BannerRows({ rows }: { rows: readonly PreviewBannerRow[] }) {
  return (
    <ul className="flex flex-col gap-tight">
      {rows.map((row, index) => (
        <li key={`${String(index)}-${row.title ?? ''}`} className="flex flex-col">
          {row.title !== null && <span className="text-white">{row.title}</span>}
          <span className={cn(row.title !== null && 'text-on-dark-soft')}>
            {row.facts.join(' · ')}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The banner over every Live Preview page, so a reviewer can never take a
 * preview for the live site. docs/api-contracts.md §6.2.
 *
 * Two parts, returned side by side so both are children of `<main>`:
 *
 *  - **The strip** — "Draft preview · This is not the live website" — is
 *    `sticky` under the fixed header, in the deep brand red, so it is on
 *    screen however far down the reviewer scrolls. Sticky only works across
 *    the whole page because its parent is `<main>`; wrapped in an element of
 *    its own it would scroll away with that element.
 *  - **The details** sit under it once, in the flow: each record that is not
 *    yet live, with its workflow status, version and who last changed it. Not
 *    sticky, because a listing with several drafts would otherwise cover half
 *    a phone's screen. Then, when there are any, **the records the page
 *    cannot draw**, each with what it lacks — a half-written draft the live
 *    site would leave out, which the reviewer must still be able to find.
 *
 * **Not a heading.** The page's `<h1>` is in its masthead below, and a
 * heading here would come before it.
 *
 * Content-agnostic: every word arrives as a prop. A Server Component.
 */
export function PreviewBanner({
  label,
  labelNote,
  audience,
  heading,
  rows,
  emptyNote,
  incomplete,
}: PreviewBannerProps) {
  return (
    <>
      <div
        role="note"
        aria-label={label}
        className="sticky top-header z-(--z-preview-banner) bg-brand-red-deep text-white"
      >
        <Container className="flex flex-wrap items-baseline gap-x-stack gap-y-tight py-tight text-meta uppercase">
          <strong className="font-bold">{label}</strong>
          <span>{labelNote}</span>
        </Container>
      </div>

      <div className="border-b border-hairline-dark bg-surface-deep text-body-on-dark">
        <Container className="flex flex-col gap-stack py-stack text-body">
          <p className="text-on-dark-soft">{audience}</p>

          <div className="flex flex-col gap-tight">
            <p className="font-bold text-white">{heading}</p>
            {rows.length === 0 ? <p>{emptyNote}</p> : <BannerRows rows={rows} />}
          </div>

          {incomplete !== undefined && incomplete.rows.length > 0 && (
            <div className="flex flex-col gap-tight border-l-2 border-brand-red-bright pl-stack">
              <p className="font-bold text-white">{incomplete.heading}</p>
              <p>{incomplete.note}</p>
              <BannerRows rows={incomplete.rows} />
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
