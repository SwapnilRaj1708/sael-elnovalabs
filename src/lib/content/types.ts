/**
 * The frontend's domain model. docs/content-model.md §2.
 *
 * These are **not** required to mirror the backend's DTOs — the API adapter
 * maps between them, so a rename in Spring Boot is a change to one mapper
 * rather than to every component.
 *
 * Conventions, all non-optional:
 *
 *  - **Dates are ISO 8601 strings**, never `Date`. `Date` does not survive the
 *    server→client boundary and forces every consumer to re-parse.
 *  - **Nullable, not optional.** `foo: string | null`, not `foo?: string`, so
 *    "the backend sent nothing" is distinguishable from "we forgot to map it".
 *  - **No invented ids.** Where the backend supplies no stable id, the adapter
 *    derives one deterministically and documents how. Never an array index.
 *
 * This file carries what the built pages consume. FE-05 adds the rest of
 * docs/content-model.md §2 — `EsgMetric`, `Paginated<T>` — alongside the
 * methods that return them. The investor types near the foot of the file
 * follow the backend's sections → tiles → documents, grouped under the
 * headings the backend supplies (docs/api-contracts.md §4).
 */

/**
 * The Newsroom's four sections, each one listing at `/newsroom/<category>/`.
 * The values are those URL segments, so the value a page asks for is the
 * value in its address bar.
 *
 *  - `press-release` and `our-views` are articles **hosted here**, each at
 *    `/newsroom/<category>/<slug>/`, with a body.
 *  - `in-the-news` links **out** to the publication that ran the piece.
 *  - `multimedia` is a video — see {@link NewsVideo}.
 */
export type NewsCategory = 'press-release' | 'in-the-news' | 'our-views' | 'multimedia';

/**
 * A Multimedia item's video, by where it is played from.
 *
 * A union rather than a bare id, because an id alone cannot say which player
 * it belongs to: a Vimeo id handed to the YouTube player is a broken card,
 * and a file we host has no id at all. Each branch carries exactly what its
 * player needs and nothing a component would have to guess.
 *
 *  - `youtube` — the id; every YouTube URL is built from it (`lib/utils/youtube.ts`).
 *  - `vimeo` — the id for the embed, and `pageUrl`, the address the maker
 *    entered, for the no-JavaScript link. The page is kept as given rather
 *    than rebuilt from the id, because an unlisted video's page carries a
 *    hash the id does not.
 *  - `hosted` — the file's absolute URL, played by the browser's own player.
 */
export type NewsVideo =
  | { provider: 'youtube'; id: string }
  | { provider: 'vimeo'; id: string; pageUrl: string }
  | { provider: 'hosted'; fileUrl: string };

/** The two categories whose items are articles on this site. */
export type NewsArticleCategory = Extract<NewsCategory, 'press-release' | 'our-views'>;

/**
 * An item on the homepage carousel or in a Newsroom listing — everything a
 * card needs, and no article body. docs/content-model.md §2.
 *
 * `imageUrl` is a URL and not a bundled import on purpose: these images come
 * from the CMS, so the frontend cannot know them at build time. A Multimedia
 * item's image is its own artwork where it has one, and a YouTube video's
 * thumbnail where it does not.
 *
 * `href` is where the card goes, resolved by the repository from the fields
 * below it: the article page, the publication, or the video itself.
 * `<Button>` tells internal from external. One field per destination rather
 * than one overloaded URL, so a card can tell an outbound link from a video
 * without parsing it.
 *
 * Which fields are set follows the category — nullable rather than a union,
 * the same trade `InvestorDocument.file` makes:
 *
 * | category        | publishedAt | slug | externalUrl | video  |
 * |-----------------|-------------|------|-------------|--------|
 * | `press-release` | set         | set  | `null`      | `null` |
 * | `in-the-news`   | set         | `null` | set       | `null` |
 * | `our-views`     | either      | set  | `null`      | `null` |
 * | `multimedia`    | either      | `null` | `null`    | set    |
 *
 * **The order of a list of these is the source's, not a sort.** The panel's
 * Reorder screen sets it — items nobody has placed yet first, newest first,
 * then the placed ones in the editor's order — which is editorial intent that
 * no comparison on these fields can reproduce.
 */
export interface NewsItem {
  id: string;
  category: NewsCategory;
  /** Verbatim, as the legacy card reads. */
  title: string;
  /**
   * ISO 8601, or `null` for an item that shows no date — Our Views and
   * Multimedia, whose legacy cards carry none. Rendered by `formatDate()`,
   * and the `<time>` is omitted outright when this is `null`.
   */
  publishedAt: string | null;
  href: string;
  /** `null` when the item has no artwork; the card then shows its empty frame. */
  imageUrl: string | null;
  /**
   * The image's alternative text, verbatim from the legacy `alt`, or `null`
   * when the source has none. A card falls back to the title.
   */
  imageAlt: string | null;
  /** The article's URL segment, verbatim — legacy artefacts and all. */
  slug: string | null;
  /** In The News: the publication's own URL. */
  externalUrl: string | null;
  /** Multimedia: the video and where it plays from. */
  video: NewsVideo | null;
  /**
   * The publication's name — "The Hindu BusinessLine". `null` in every
   * mock row: the legacy In The News cards do not show one, so none is
   * transcribed. The backend sends it as `sourcePublication`.
   */
  publication: string | null;
}

/**
 * A Press Release or Our Views article: its card fields, plus the body and
 * what the maker wrote for search engines.
 *
 * `body` is HTML from the CMS — paragraphs, headings from `h2` down, lists,
 * tables, links and the odd figure. The article page sanitises it again
 * before rendering: `lib/utils/sanitize-article.ts`.
 *
 * The four SEO fields are the panel's own, `null` where the maker left them
 * blank. The page falls back for each one — see `articleMetadata()` — and
 * never derives a value where the maker supplied one.
 */
export interface NewsArticle extends NewsItem {
  category: NewsArticleCategory;
  slug: string;
  body: string;
  /** The card's plain-text summary, or `null`. */
  summary: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Absolute URL of the share image, or `null` to use the card's. */
  ogImageUrl: string | null;
}

/* ---------- Investors ---------- */

/**
 * The four investor sections, by the URL segment each lives at under
 * `/investors/`. As with {@link NewsCategory}, the value a page asks for is
 * the value in its address bar; the API adapter maps it to the backend's
 * `section` code. docs/api-contracts.md §4.1.
 */
export type InvestorSection =
  'offer-documents' | 'corporate-governance' | 'financials-and-reports' | 'notifications';

/**
 * How a tile's page is laid out, as the panel sets it. `media-list` is the
 * one a page branches on: its documents are videos and audio.
 * `external-link` is reserved by the backend and not offered in the panel.
 */
export type InvestorTileDisplayMode =
  'single-document' | 'document-list' | 'media-list' | 'fy-grouped-list' | 'external-link';

/**
 * The SEBI disclaimer a tile shows before its documents. A union so that a
 * gated tile cannot exist without its text: the backend refuses to submit a
 * gated tile whose disclaimer is blank, and the adapter refuses one that
 * arrives that way rather than showing gated documents with no notice.
 *
 * **An interstitial, not access control.** The document URLs arrive in the
 * same response as the disclaimer. docs/api-contracts.md §4.4.
 */
export type InvestorGate = { enabled: false } | { enabled: true; disclaimerHtml: string };

/**
 * One tile on a section's index — the API calls it a `category`. Its page
 * is {@link InvestorTile.path}. docs/api-contracts.md §4.2.
 *
 * **The order of a list of these is the panel's**, display order then
 * title. Never re-sorted.
 */
export interface InvestorTile {
  id: string;
  section: InvestorSection;
  /** Verbatim — "Draft Red Herring Prospectus (DRHP)". The page's `<h1>`. */
  title: string;
  /** The tile page's URL segment. Must equal a route; see `app/investors/_lib/tile-routes.ts`. */
  slug: string;
  /**
   * Root-relative, trailing slash: the section's `basePath` as the backend
   * sends it, plus the slug. The same string the backend's revalidation
   * webhook names for this tile, which is why it is composed from the
   * backend's `basePath` and not from the site's own.
   */
  path: string;
  /** The section's `basePath` as the backend sends it — `/investors/offer-documents/`. */
  sectionPath: string;
  displayMode: InvestorTileDisplayMode;
  /** Sanitised HTML shown above the documents, or `null`. Outstanding Dues' table is one. */
  descriptionHtml: string | null;
  gate: InvestorGate;
  /** Published documents on the tile's page. `0` is a real answer. */
  documentCount: number;
  /** The panel's own, `null` where the maker left them blank. */
  seoTitle: string | null;
  seoDescription: string | null;
}

/**
 * A file in Azure Blob Storage, as a component needs it.
 *
 * `url` is absolute. The mock composes it from a container path with
 * `tryBlobUrl()`; the API returns it whole. Either way no hostname is ever
 * written in this repository. docs/asset-inventory.md §8.
 *
 * **No file name.** The backend sends none; a row's type label comes from
 * `mimeType`, which the backend checks against the file's own bytes at
 * upload, not from an extension.
 */
export interface BlobFile {
  url: string;
  /** `application/pdf`, `video/mp4` — the backend's `contentType`. */
  mimeType: string;
  /** `null` when the backend does not report one. */
  sizeBytes: number | null;
}

/** What a document is: a hosted file, a link out, or a recording. */
export type InvestorDocumentKind = 'file' | 'external-link' | 'video' | 'audio';

/**
 * One document on a tile's page.
 *
 * **`file` and `externalUrl` can both be `null`**, and the document is still
 * published and still shown. `file` is `null` for an external link (which
 * has `externalUrl`) and for a hosted file the backend never promoted to
 * public storage (which has nothing). A page renders the second as a
 * visible "unavailable" row, never as an absence: a statutory disclosure
 * that silently disappears from its page is the failure this rules out.
 * docs/api-contracts.md §0.3.
 */
export interface InvestorDocument {
  id: string;
  /** As the link reads, verbatim — "Draft Red Herring Prospectus". */
  title: string;
  kind: InvestorDocumentKind;
  /** ISO 8601 date, or `null`. The backend's `documentDate`. */
  publishedAt: string | null;
  /** The stored label — "FY 2026" — or `null`. Metadata; headings come from the groups. */
  financialYear: string | null;
  file: BlobFile | null;
  externalUrl: string | null;
}

/** A subheading and the documents under it. One level only. */
export interface InvestorDocumentSubgroup {
  /** Verbatim — "FY 2026". */
  label: string;
  /** The backend's anchor, as given. Never derived here. */
  anchor: string;
  documents: InvestorDocument[];
}

/**
 * A heading on a tile's page and what sits under it, exactly as the backend
 * groups it.
 *
 * - **`label` and `anchor` are `null` together**, for documents under no
 *   heading. Such a group is rendered without a heading and never dropped.
 * - **A heading with nothing under it is still a group**, and renders as a
 *   heading alone: General Meeting's "Postal Ballot".
 * - **`anchor` is the backend's, used as given.** It is frozen at the
 *   heading's first publish so a published deep link keeps landing; a page
 *   that computed its own from the label would break exactly that.
 */
export interface InvestorDocumentGroup {
  /** Verbatim — "Statutory Policies", "FY2026", "FY 2024-25". */
  label: string | null;
  anchor: string | null;
  documents: InvestorDocument[];
  subgroups: InvestorDocumentSubgroup[];
}

/**
 * One tile's page: the tile, and its documents under their headings, in the
 * order the backend gives — groups, subgroups and documents alike. CSR runs
 * oldest first, and no sort on these fields could know that.
 *
 * `groups` is `[]` for a tile with no headings and nothing published. That
 * is a page with nothing on it yet, not a missing page.
 */
export interface InvestorTilePage {
  tile: InvestorTile;
  groups: InvestorDocumentGroup[];
}

/* ---------- Preview ---------- */

/**
 * The admin panel's eight previewable screens, as the backend names them. A
 * preview session is scoped to exactly one of these, never to one record
 * (docs/api-contracts.md §6.2).
 */
export type PreviewScreenCode =
  | 'NEWS_PRESS_RELEASE'
  | 'NEWS_IN_THE_NEWS'
  | 'NEWS_OUR_VIEWS'
  | 'NEWS_MULTIMEDIA'
  | 'DOC_OFFER_DOCUMENTS'
  | 'DOC_CORPORATE_GOVERNANCE'
  | 'DOC_FINANCIALS_REPORTS'
  | 'DOC_NOTIFICATIONS';

/**
 * What spending a `pt` link token bought: a session for one screen.
 * `token` is a bearer credential. It is only ever held server-side or in an
 * `HttpOnly` cookie, and never reaches client JavaScript or a log line.
 */
export interface PreviewSession {
  token: string;
  expiresInSeconds: number;
  screenCode: PreviewScreenCode;
  /** Who the panel issued the link to — an e-mail address. */
  issuedFor: string;
}

/**
 * The exchange's result. `refused` covers every reason the backend gives for
 * not exchanging a token (invalid, expired, already used, revoked, malformed),
 * because the reviewer's next step is the same for all of them.
 */
export type PreviewExchange =
  | { ok: true; session: PreviewSession }
  /** `code` is the backend's — `PREVIEW_TOKEN_CONSUMED` — for the log line, never for the copy. */
  | { ok: false; reason: 'refused'; code: string | undefined };

/**
 * A record's state in the panel, from the preview response's `preview` block.
 * `isDraft` is the backend's call on whether this differs from what the public
 * sees: anything not `PUBLISHED`, so a `SCHEDULED` item counts as a draft.
 */
export interface PreviewState {
  /** The workflow status, verbatim — `PENDING_APPROVAL`. Shown, never branched on. */
  status: string;
  versionNo: number;
  isDraft: boolean;
  /** Who made the version shown — a display name or e-mail; `null` if unknown. */
  lastUpdatedBy: string | null;
  /** ISO 8601 with offset, or `null`. */
  lastUpdatedAt: string | null;
}

/** A record as a preview shows it: the same domain type the live page renders, and its state. */
export interface Previewed<T> {
  record: T;
  preview: PreviewState;
}

/**
 * What a record lacks that its page needs, in the site's terms rather than
 * the backend's field names. The preview names each one to the reviewer.
 *
 *  - `link` — the address an In The News card or a link document opens.
 *  - `video` — a Multimedia item's video: its provider, id, page or file.
 *  - `disclaimer` — a gated tile's notice text.
 *  - `route` — a tile whose slug is not an address the site serves
 *    (`app/investors/_lib/tile-routes.ts`); found by the page, not the adapter.
 *  - `other` — anything the site cannot name more precisely. The server log
 *    has the backend's field.
 */
export type IncompleteField =
  | 'title'
  | 'slug'
  | 'link'
  | 'video'
  | 'date'
  | 'image'
  | 'disclaimer'
  | 'display-mode'
  | 'file'
  | 'kind'
  | 'section'
  | 'route'
  | 'other';

/**
 * A record a preview could not map to the type its page renders — a draft
 * that is half-written, by definition. **On a live page such a record is
 * left out; on a preview it must never be**, because the reviewer was sent
 * to approve it, and a record they cannot see is one they cannot approve.
 * The page names it and what it lacks instead.
 */
export interface IncompleteRecord {
  /** The backend's `publicId`, when the record carried a readable one. */
  id: string | null;
  /** The record's title, when it has a usable one. */
  title: string | null;
  /** What it lacks. Never empty. */
  missing: readonly IncompleteField[];
  /** Its workflow state, when the `preview` block itself was readable. */
  preview: PreviewState | null;
  /** For a document: the heading it sits under on the page, or `null`. */
  heading: string | null;
}

/** A preview listing: the records the page renders, and those it cannot. */
export interface PreviewListing<T> {
  records: Previewed<T>[];
  incomplete: IncompleteRecord[];
}

/** One record on a preview's detail page, or why it cannot be drawn. */
export type PreviewDetail<T> =
  { complete: true; value: Previewed<T> } | { complete: false; record: IncompleteRecord };

/**
 * A tile's page as its preview shows it: the page the live route renders,
 * the tile's own state, each document's state by id, and the documents that
 * could not be mapped. A document's state is beside the page rather than on
 * the document, so `page` is exactly the type the live page renders.
 */
export interface PreviewTilePage {
  page: InvestorTilePage;
  documentStates: Readonly<Record<string, PreviewState>>;
  incomplete: IncompleteRecord[];
}

/**
 * A preview read. A refusal is an expected outcome, so it is a value rather
 * than a throw; only a failure of the source itself throws.
 *
 *  - `session-ended` — no session, or it expired or was revoked (backend 401).
 *  - `wrong-screen` — a valid session for another screen (backend 403, or 400
 *    when the type sent contradicts the session).
 *  - `switched-off` — preview is disabled in the panel (backend 404 on a listing).
 */
export type PreviewRead<T> =
  { ok: true; value: T } | { ok: false; reason: 'session-ended' | 'wrong-screen' | 'switched-off' };
