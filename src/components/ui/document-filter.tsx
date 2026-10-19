'use client';

import { Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import {
  DocumentGroups,
  type DocumentGroupData,
  type DocumentLinkRow,
} from '@/components/ui/document-groups';

/** The filter's own words — functional copy, from the page's content file. */
export interface DocumentFilterCopy {
  /** The field's visible label — "Find a company". */
  label: string;
  /**
   * Announced as the list narrows. `{shown}` and `{total}` are replaced with
   * counts — "{shown} of {total} documents".
   */
  results: string;
  /** Shown in place of the list when nothing matches. */
  noMatches: string;
}

export interface DocumentFilterProps {
  groups: readonly DocumentGroupData<DocumentLinkRow>[];
  copy: DocumentFilterCopy;
  /** Passed through to `<DocumentGroups>`. */
  jumpLabel: string;
  emptyTitle: string;
  emptyDescription?: string;
}

/**
 * Case, accents and runs of spaces do not count: "sael solar p4" finds
 * "SAEL Solar P4 Private Limited", and "oistein" would find "Øistein".
 */
function normalise(value: string): string {
  return (
    value
      .normalize('NFD')
      // NFD splits an accented letter into the letter and a combining mark;
      // the marks, U+0300–U+036F, are dropped.
      .replace(/[̀-ͯ]/g, '')
      .replace(/ø/gi, 'o')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * `<DocumentGroups>` with a field above it that narrows every group to the
 * documents whose titles contain what was typed — for the one listing long
 * enough to need it: Standalone Financials of Material Subsidiary Companies,
 * sixty-four filings across three years.
 *
 * **Finding one company's one year** is the job: type part of the name, and
 * each year keeps only that company's filing, under its own year heading. A
 * year with no match drops out, and so does its jump link. It matches the
 * title as written in each year, so a company whose name changed between
 * filings ("Kaithal…" / "SAEL Kaithal…") is found by the part both share —
 * which is also why the page does not merge a company's years into one row:
 * deciding that two differently named filings are the same company is not a
 * call the website should make.
 *
 * **Progressive enhancement, not a gate.** The list below renders in full on
 * the server, every document in the HTML; the field only hides rows once
 * script is running. The count is announced politely as it changes, so a
 * screen-reader user hears what the list became without being moved to it.
 */
export function DocumentFilter({
  groups,
  copy,
  jumpLabel,
  emptyTitle,
  emptyDescription,
}: DocumentFilterProps) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const needle = normalise(query);

  const total = useMemo(
    () =>
      groups.reduce(
        (sum, group) =>
          sum + group.items.length + group.subgroups.reduce((n, sub) => n + sub.items.length, 0),
        0,
      ),
    [groups],
  );

  const filtered = useMemo(() => {
    if (needle === '') return groups;
    const keep = (title: string) => normalise(title).includes(needle);

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => keep(item.title)),
        subgroups: group.subgroups
          .map((sub) => ({ ...sub, items: sub.items.filter((item) => keep(item.title)) }))
          .filter((sub) => sub.items.length > 0),
      }))
      .filter((group) => group.items.length > 0 || group.subgroups.length > 0);
  }, [groups, needle]);

  const shown = filtered.reduce(
    (sum, group) =>
      sum + group.items.length + group.subgroups.reduce((n, sub) => n + sub.items.length, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-flow">
      <div className="flex flex-col gap-tight">
        <label htmlFor={inputId} className="text-body-sm text-on-dark-soft">
          {copy.label}
        </label>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-stack size-5 -translate-y-1/2 text-on-dark-muted"
            aria-hidden="true"
            focusable="false"
          />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            autoComplete="off"
            spellCheck={false}
            className="min-h-touch w-full rounded-(--radius-card) border border-hairline-dark bg-transparent py-tight pr-stack pl-(--spacing-filter-inset) text-body text-white focus-visible:border-outline-dark focus-visible:outline-white"
          />
        </div>

        {/* Announced, not shown: the list itself shows what is left. */}
        <p role="status" aria-live="polite" className="sr-only">
          {needle === ''
            ? ''
            : copy.results.replace('{shown}', String(shown)).replace('{total}', String(total))}
        </p>
      </div>

      {needle !== '' && shown === 0 ? (
        <p className="text-body text-on-dark-soft">{copy.noMatches}</p>
      ) : (
        <DocumentGroups
          groups={filtered}
          jumpLabel={jumpLabel}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      )}
    </div>
  );
}
