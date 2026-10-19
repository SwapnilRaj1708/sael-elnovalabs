import { TODO_CONTENT } from '@/lib/config/site';
import type { PageMeta } from './investors';

/**
 * The Financials & Reports area's static content: its index page.
 *
 * **Transcribed from the legacy https://www.sael.co/investors/financials-and-reports/**,
 * read from its raw HTML on 2026-09-30 — name and `<title>` verbatim, "&"
 * and all. /CLAUDE.md §2 rule 3.
 *
 * The area's five pages are tiles and come from the backend
 * (`documents-live?section=FINANCIALS_REPORTS`): their names, order,
 * headings and documents. None carries a consent notice on the legacy site;
 * a gate, if SAEL ever set one, is the tile's to declare.
 */

export const FINANCIALS_PATH = '/investors/financials-and-reports/';

export const financialsIndex: { meta: PageMeta; title: string } = {
  meta: { title: 'Financials & Reports - SAEL', description: TODO_CONTENT },
  title: 'Financials & Reports',
};
