import type {
  InvestorSection,
  InvestorTile,
  InvestorTilePage,
  NewsArticle,
  NewsArticleCategory,
  NewsCategory,
  NewsItem,
  PreviewDetail,
  PreviewExchange,
  PreviewListing,
  PreviewRead,
  PreviewTilePage,
} from './types';

/** {@link ContentRepository.getNewsItems}'s options. */
export interface NewsItemsQuery {
  /**
   * One Newsroom section. Required: the backend has no "every category"
   * call and answers one without a type with `400`.
   */
  category: NewsCategory;
  /** The first `limit` items only. Omitted, the whole section. */
  limit?: number;
}

/**
 * The entire boundary between the application and its content. **Adding a
 * dynamic surface means adding a method here first**, then implementing it in
 * *both* the mock and the API adapter, and only then building the UI.
 * docs/content-model.md §3.
 *
 * **Only what the backend serves is here**: news and investor documents.
 * The capacity figures, the team, the board and its committees were methods
 * of this interface until 2026-10-02, when they became static content
 * (`app/_content/`): the backend has no endpoint for any of them — SAEL
 * descoped the team and board on 20 Sep 2026 (backend row 5.24), and the
 * figures were never specified (docs/api-contracts.md §9). A method that
 * existed only to throw in the API adapter told the reader of this interface
 * that the backend served something it does not. The investor methods follow
 * the backend's sections → tiles → documents (docs/api-contracts.md §4).
 *
 * Contract:
 *
 *  1. Every method resolves or throws {@link ContentUnavailableError}. Never
 *     `undefined`, never a silent `null` for a list — an empty list is `[]`.
 *  2. **Callers handle failure locally.** A page wraps its call and renders an
 *     empty state; one failed fetch must not take down the page around it.
 *     **Except live news and investor documents**, whose pages are ISR: there
 *     an empty state would be cached for the whole window, so their loaders
 *     let the failure throw, and Next keeps the last good page
 *     (`app/newsroom/_lib/news.ts`, `app/investors/_lib/documents.ts`).
 *  3. Both implementations, always. The API side may throw
 *     {@link NotImplementedError} while its endpoint is being built, but the
 *     method must exist, so that the cutover is a checklist rather than an
 *     excavation. **A surface the backend will never serve is not a method
 *     here at all** — it is static content in `app/_content/`.
 */
export interface ContentRepository {
  /**
   * One Newsroom section's items, **in the source's order** — the panel's
   * Reorder screen sets it: items nobody has placed yet first, newest first,
   * then the placed ones in the editor's order. That order is editorial;
   * neither the adapter nor a page re-sorts it.
   *
   * Without `limit` this is **every** item in the section, however many
   * pages the backend serves them in. With it, the first `limit`.
   */
  getNewsItems(options: NewsItemsQuery): Promise<NewsItem[]>;
  /**
   * The homepage's "In the News" rail: In The News items, at most `limit`,
   * in the source's order.
   *
   * A method of its own rather than `getNewsItems({ category, limit })`
   * because the backend chooses this list itself: the items SAEL marked for
   * the homepage, in their chosen order, when any are marked, and otherwise
   * the first K of the listing (`content.home.in-the-news.limit`). So the
   * rail may return fewer than `limit`, by the business's choice, and must
   * render exactly what it gets — no re-sort, no padding. That choice belongs
   * to the rail alone; the Newsroom's own rows must not be cut by it.
   * docs/api-contracts.md §3.3.
   */
  getInTheNewsRail(limit: number): Promise<NewsItem[]>;
  /**
   * One Press Release or Our Views article, body included, by its slug.
   * `null` when there is no such article — the page 404s — and a throw only
   * when the source itself failed.
   */
  getNewsArticle(category: NewsArticleCategory, slug: string): Promise<NewsArticle | null>;
  /**
   * Whether `slug` is a published article, without fetching it. Never cached.
   *
   * For `src/proxy.ts`, which answers an unknown slug with the root
   * not-found page before the article route renders: a `notFound()` thrown
   * from the page itself reaches the visitor as an empty HTML shell that only
   * JavaScript fills. Throws when the source failed, like the rest.
   */
  hasNewsArticle(category: NewsArticleCategory, slug: string): Promise<boolean>;
  /**
   * Every live tile of one section, **in the panel's order** — the
   * section's index renders them as given. However many pages the backend
   * serves them in. `[]` for a section with no live tile.
   */
  getInvestorTiles(section: InvestorSection): Promise<InvestorTile[]>;
  /**
   * One tile's page — the tile, and every published document on it under
   * the backend's headings. `null` when no live tile has that slug in that
   * section (the page 404s); a throw only when the source itself failed.
   */
  getInvestorTilePage(section: InvestorSection, slug: string): Promise<InvestorTilePage | null>;
  /**
   * Whether `slug` is a live tile of `section`, without fetching its page.
   * Never cached. For `src/proxy.ts`, as {@link hasNewsArticle} is.
   */
  hasInvestorTile(section: InvestorSection, slug: string): Promise<boolean>;

  /**
   * Spend a preview link's `pt` for a session. docs/api-contracts.md §6.
   * **Never cached, and single-use on the backend**: a second call with the
   * same token is refused. Throws only when the source failed, in which case
   * the token may or may not have been spent.
   */
  startPreviewSession(token: string): Promise<PreviewExchange>;
  /**
   * One Newsroom section as its preview shows it: every item in its most
   * recent state, draft or live, in the source's order. `href` on an article
   * card is its **preview** page, so a reviewer stays inside the preview.
   * An item the site cannot map is in `incomplete`, never dropped. Never
   * cached.
   */
  getNewsPreview(
    category: NewsCategory,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewListing<NewsItem>>>;
  /**
   * One article as its preview shows it — or as incomplete, naming what it
   * lacks — or `null` when the session's screen has no such slug. Never cached.
   */
  getNewsArticlePreview(
    category: NewsArticleCategory,
    slug: string,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewDetail<NewsArticle> | null>>;
  /**
   * One investor section's tiles as its preview shows them: every tile in its
   * most recent state, in the panel's order, and the tiles the site cannot
   * map in `incomplete`. Never cached.
   */
  getInvestorTilesPreview(
    section: InvestorSection,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewListing<InvestorTile>>>;
  /**
   * One tile's page as its preview shows it: the tile and every document in
   * its most recent state, under the headings of the tile's most recent
   * outline. `null` when the session's section has no such slug. Never cached.
   */
  getInvestorTilePagePreview(
    section: InvestorSection,
    slug: string,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewDetail<PreviewTilePage> | null>>;
}

/**
 * Content could not be retrieved. Carries where it happened, so the server log
 * says which endpoint failed rather than just that something did.
 */
export class ContentUnavailableError extends Error {
  /** The backend's error `code` — `NEWS_TYPE_REQUIRED` — when it sent one. */
  readonly code: string | undefined;
  /**
   * The backend's `correlationId` for the failed request, when it sent one.
   * With it, the backend team can find the request in their logs.
   */
  readonly correlationId: string | undefined;

  constructor(
    readonly endpoint: string,
    readonly status?: number,
    options?: { cause?: unknown; code?: string; correlationId?: string },
  ) {
    const details = [
      status === undefined ? null : `HTTP ${String(status)}`,
      options?.code,
      options?.correlationId === undefined ? null : `correlationId ${options.correlationId}`,
    ].filter((part) => part !== null && part !== undefined);

    super(
      `Content unavailable from "${endpoint}"${details.length === 0 ? '' : ` (${details.join(', ')})`}.`,
      options,
    );
    this.name = 'ContentUnavailableError';
    this.code = options?.code;
    this.correlationId = options?.correlationId;
  }
}

/** A repository method that exists to satisfy the contract but is not wired. */
export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`${method}() is not implemented by this repository yet.`);
    this.name = 'NotImplementedError';
  }
}
