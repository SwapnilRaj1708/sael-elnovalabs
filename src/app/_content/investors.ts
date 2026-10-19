import type { SubPageNavProps } from '@/components/sections/sub-page';
import type { ConsentCopy } from '@/components/ui/consent-actions';
import type { DocumentFilterCopy } from '@/components/ui/document-filter';
import { TODO_CONTENT } from '@/lib/config/site';

/**
 * What every investor area's content file shares: the page record, the side
 * list, and the functional copy the investor templates need.
 *
 * **The tiles are not here.** Which pages an area has, their names and
 * their order come from the backend (`documents-live`), so a tile a maker
 * adds in the panel appears without a release. What stays here is what the
 * backend does not serve: each area's own index page, the pages that are
 * not tiles (Board of Directors, Board Committees, Investor Contact), and
 * the words for states and controls.
 */

/**
 * A page's `<title>` and description. Every `<title>` is the legacy page's
 * own, verbatim — "… - SAEL". Every legacy investor page ships
 * `<meta name="description" content="">`, so there is nothing to transcribe
 * and nothing is invented: `buildMetadata()` drops the marker rather than
 * emitting it.
 */
export interface PageMeta {
  title: string;
  description: string;
}

/** A page that is not a tile — static content, at its legacy URL. */
export interface InvestorPage {
  /** The last segment of the legacy URL. */
  slug: string;
  /** Root-relative, trailing slash — the legacy URL exactly. */
  path: string;
  /**
   * The page's name, verbatim. On the legacy site one string is the index
   * tile, the side-list entry and the `<h1>`, on every page.
   */
  name: string;
  meta: PageMeta;
}

/**
 * One investor page. `title` is written out at each call rather than
 * composed from `name`, so a reviewer can check it against the legacy
 * `<title>` without doing arithmetic.
 */
export function investorPage(
  areaPath: string,
  slug: string,
  name: string,
  title: string,
): InvestorPage {
  return {
    slug,
    path: `${areaPath}${slug}/`,
    name,
    meta: { title, description: TODO_CONTENT },
  };
}

/** An area's side list: its heading over its pages, the one at `currentPath` marked current. */
export function areaNav(
  label: string,
  pages: readonly { name: string; path: string }[],
  currentPath: string,
): SubPageNavProps {
  return {
    label,
    items: pages.map(({ name, path }) => ({ name, href: path })),
    currentHref: currentPath,
  };
}

/* ---------------------------------------------------------------------------
 * Functional copy — words the legacy site has no equivalent for, because
 * they name controls and states it did not have. Kept here so every investor
 * page says them the same way, and marked so they are not mistaken for
 * transcription.
 * ------------------------------------------------------------------------- */

/** The accessible name of the row of links to a page's headings. */
export const jumpLinksLabel = 'On this page';

/**
 * A tile page with nothing published on it yet — a real state, and not a
 * failure: a failure does not render this, because the loaders throw and
 * the last good page is served instead.
 */
export const investorDocumentsNone = {
  title: 'No documents have been published here yet',
} as const;

/**
 * A published document whose file cannot be opened — a hosted file the
 * backend never promoted to public storage. Shown in place of the link, so
 * the document is still on the page.
 */
export const documentUnavailable = {
  label: 'File not available online at present',
} as const;

/**
 * The consent gates' own words, for any tile the backend gates. Heading and
 * labels verbatim from both legacy dialogs; the notice itself is the tile's
 * `gate.disclaimerHtml`, maintained in the admin panel.
 */
export const consentCopy: ConsentCopy = {
  heading: 'Disclaimer',
  confirmLabel: 'I Confirm',
  declineLabel: 'I Do Not Confirm',
  // Functional copy: the legacy × has no accessible name at all.
  closeLabel: 'Close',
  // Functional copy: the legacy site has no failure state to transcribe.
  errorMessage: 'This could not be opened just now. Please refresh the page and try again.',
};

/** The legacy `<video>`'s fallback text, verbatim. */
export const videoFallback = 'Your browser does not support the video tag.';

/** The company filter on Standalone Financials of Material Subsidiary Companies. */
export const companyFilterCopy: DocumentFilterCopy = {
  label: 'Find a company',
  results: '{shown} of {total} documents',
  noMatches: 'No company matches that name.',
};
