import { TODO_CONTENT } from '@/lib/config/site';
import type { BreadcrumbTrailItem } from '@/lib/seo/json-ld';

/**
 * The Offer Documents area's static content — its index page, which is the
 * one page of the area that is not a tile.
 *
 * **The tiles and everything on them come from the backend**
 * (`documents-live?section=OFFER_DOCUMENTS`): their names, their order,
 * their documents, which of them are gated, and the disclaimer each gated
 * one shows. Until 2026-10-02 the eight pages, their two SEBI notices and
 * the Outstanding Dues table were transcribed here; a tile a maker added in
 * the panel then had no page, and a notice SAEL corrected in the panel
 * never reached the site. The transcriptions now live in the mock's
 * fixtures (`lib/content/mock/data/investor-tiles.json`), as the HTML the
 * backend serves them in, so the mock still renders the legacy pages word
 * for word.
 *
 * The index's `<title>` is the legacy page's own, verbatim.
 */

/** The area's index, and the root every path below hangs from. */
export const OFFER_DOCUMENTS_PATH = '/investors/offer-documents/';

/** "Investors" names the menu group; there is no `/investors/` page. */
const investorsRung: BreadcrumbTrailItem = { name: 'Investors' };

/**
 * A page's `<title>` and description. Every `<title>` is the legacy page's
 * own, verbatim — "… - SAEL". The legacy pages all ship
 * `<meta name="description" content="">`, so there is nothing to transcribe
 * and nothing is invented: `buildMetadata()` drops the marker rather than
 * emitting it.
 */
interface PageMeta {
  title: string;
  description: string;
}

/** The index. */
export const offerDocumentsIndex: {
  meta: PageMeta;
  title: string;
  breadcrumb: readonly BreadcrumbTrailItem[];
} = {
  meta: { title: 'Offer Documents - SAEL', description: TODO_CONTENT },
  // The legacy <h1> letter-spaces its first word with an inline style; the
  // text is "Offer Documents".
  title: 'Offer Documents',
  breadcrumb: [
    { name: 'Home', href: '/' },
    investorsRung,
    { name: 'Offer Documents', href: OFFER_DOCUMENTS_PATH },
  ],
};

/**
 * Home › Investors › Offer Documents › this page.
 *
 * **Not rendered.** The client had the breadcrumb taken off every Offer
 * Documents page on 2026-09-29. This and `offerDocumentsIndex.breadcrumb`
 * are kept so it can come back by passing `breadcrumb` to `<SubPage>` again —
 * the same arrangement About Us has for its own trail.
 */
export function subPageBreadcrumb(current: {
  name: string;
  path: string;
}): readonly BreadcrumbTrailItem[] {
  return [...offerDocumentsIndex.breadcrumb, { name: current.name, href: current.path }];
}
