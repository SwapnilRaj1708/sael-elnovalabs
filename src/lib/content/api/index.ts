import 'server-only';

import { z } from 'zod';
import {
  ContentUnavailableError,
  type ContentRepository,
  type NewsItemsQuery,
} from '../repository';
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
} from '../types';
import {
  ApiClient,
  InvalidContentError,
  isr,
  NO_STORE,
  rejectItem,
  type ApiClientOptions,
} from './client';
import {
  sectionCodeOf,
  toInvestorTile,
  toInvestorTilePage,
  toInvestorTilePagePreview,
  toInvestorTilePreview,
} from './documents';
import {
  newsTypeOf,
  toNewsArticle,
  toNewsArticlePreview,
  toNewsItem,
  toNewsPreviewItem,
} from './news';
import { mapPreviewRecord, mapPreviewRecords } from './preview';
import {
  documentCategoryPageSchema,
  documentCategorySchema,
  documentPreviewCategorySchema,
  documentPreviewPageSchema,
  newsDetailSchema,
  newsListItemSchema,
  newsPreviewDetailSchema,
  newsPreviewListItemSchema,
  previewSessionSchema,
  type NewsListItemBody,
} from './schemas';

export type ApiContentRepositoryOptions = ApiClientOptions;

/**
 * Live news feeds ISR pages: reused for five minutes (docs/architecture.md
 * §7), and refreshed at once when the backend's revalidation webhook names
 * the page (docs/api-contracts.md §7).
 */
const NEWS_CACHE = isr(300);

const NEWS_LIVE = '/app/v1/news-live';

/**
 * Investor documents feed ISR pages on the same terms as news: five
 * minutes, and at once when the webhook names the section or the tile
 * (docs/api-contracts.md §7.1).
 */
const DOCUMENTS_CACHE = isr(300);

const DOCUMENTS_LIVE = '/app/v1/documents-live';

const NEWS_PREVIEW = '/app/v1/news-live-preview';

const DOCUMENTS_PREVIEW = '/app/v1/documents-live-preview';

/**
 * A preview record before it is checked: the envelope is validated by the
 * client, each record by `mapPreviewRecord`, which keeps the ones that fail
 * as incomplete rather than dropping them (`./preview.ts`).
 */
const RAW = z.unknown();

const PREVIEW_SESSION = '/app/v1/preview/session';

/**
 * The backend's refusals of a preview read, as outcomes rather than errors
 * (docs/api-contracts.md §2.4, §5.1). `null` for anything else, which the
 * caller rethrows.
 *
 * `NEWS_TYPE_SCOPE_MISMATCH` is the same fact as a 403: the session is for
 * another Newsroom section. It arrives as a 400 only because the request names
 * the section it wants — which every preview read here does, so that a session
 * for In The News can never fill the Press Release page with In The News items.
 */
function previewRefusal(error: unknown): PreviewRead<never> | null {
  if (!(error instanceof ContentUnavailableError)) return null;
  if (error.status === 401) return { ok: false, reason: 'session-ended' };
  if (
    error.status === 403 ||
    error.code === 'NEWS_TYPE_SCOPE_MISMATCH' ||
    // Documents say the same with a field error, `section` / `Mismatch`. The
    // client keeps only the code, and the one other `VALIDATION_FAILED` on a
    // preview read — an unknown section — cannot happen with the codes sent.
    (error.status === 400 && error.code === 'VALIDATION_FAILED')
  ) {
    return { ok: false, reason: 'wrong-screen' };
  }
  if (error.status === 404) return { ok: false, reason: 'switched-off' };
  return null;
}

/** The exchange's refusals: a malformed token (400) and the four 401s (§6.2). */
function isExchangeRefusal(error: ContentUnavailableError): boolean {
  return (
    (error.status === 400 && error.code === 'VALIDATION_FAILED') ||
    (error.status === 401 && (error.code ?? '').startsWith('PREVIEW_TOKEN_'))
  );
}

/**
 * The most an article's or a tile's existence check may hold up a request.
 * It runs in `src/proxy.ts` on every such request, cache hits included, and fails
 * open, so a slow backend should cost a visitor little: past this, the page
 * is served as it would have been without the check.
 */
const EXISTENCE_CHECK_TIMEOUT_MS = 2000;

/**
 * Map each validated body, applying {@link rejectItem} to one the site
 * cannot render — the same policy as a schema failure: thrown in
 * development, logged and omitted in production.
 */
function mapNewsItems(bodies: readonly NewsListItemBody[], endpoint: string): NewsItem[] {
  return bodies.flatMap((body) => {
    try {
      return [toNewsItem(body, endpoint)];
    } catch (error) {
      if (!(error instanceof InvalidContentError)) throw error;
      rejectItem(error);
      return [];
    }
  });
}

/**
 * The Spring Boot implementation, against `/app/v1` as docs/api-contracts.md
 * describes it. docs/content-model.md §5.
 *
 * **Every method is wired.** The four that threw `NotImplementedError` —
 * capacity figures, team, board, committees — were removed with the
 * interface's methods on 2026-10-02: the backend has no endpoint for any of
 * them (api-contracts.md §9), and their content is static in `app/_content/`.
 */
export class ApiContentRepository implements ContentRepository {
  private readonly client: ApiClient;
  private readonly timeoutMs: number;

  constructor(options: ApiContentRepositoryOptions) {
    this.client = new ApiClient(options);
    this.timeoutMs = options.timeoutMs;
  }

  /**
   * `GET /app/v1/news-live?type=…` — every page of it, or the first `limit`
   * items in one request. docs/api-contracts.md §3.1. The backend's order is
   * kept as served.
   */
  async getNewsItems({ category, limit }: NewsItemsQuery): Promise<NewsItem[]> {
    const params = { type: newsTypeOf(category) };
    const endpoint = this.client.label(NEWS_LIVE, params);

    const bodies =
      limit === undefined
        ? await this.client.getAll(NEWS_LIVE, params, newsListItemSchema, NEWS_CACHE)
        : (
            await this.client.getPage(
              NEWS_LIVE,
              { ...params, page: '0', size: String(limit) },
              newsListItemSchema,
              NEWS_CACHE,
            )
          ).items;

    return mapNewsItems(bodies, endpoint);
  }

  /**
   * `GET /app/v1/news-live?type=IN_THE_NEWS&limit=…&size=…`.
   * docs/api-contracts.md §3.3. `limit` is what the backend reads to choose
   * the rail — the highlighted items, or the latest K — and `size` is the
   * same number so that one page holds the whole answer; one request, never
   * the paging loop.
   */
  async getInTheNewsRail(limit: number): Promise<NewsItem[]> {
    const params = { type: newsTypeOf('in-the-news'), limit: String(limit), size: String(limit) };
    const page = await this.client.getPage(NEWS_LIVE, params, newsListItemSchema, NEWS_CACHE);
    return mapNewsItems(page.items, this.client.label(NEWS_LIVE, params));
  }

  /**
   * `GET /app/v1/news-live/{slug}?type=…` — `null` on the backend's 404,
   * which covers an unknown slug and an unpublished one alike (§3.2).
   */
  async getNewsArticle(category: NewsArticleCategory, slug: string): Promise<NewsArticle | null> {
    const path = `${NEWS_LIVE}/${encodeURIComponent(slug)}`;
    const params = { type: newsTypeOf(category) };

    const body = await this.client.getObject(path, params, newsDetailSchema, NEWS_CACHE);
    return body === null ? null : toNewsArticle(body, category, this.client.label(path, params));
  }

  /**
   * `HEAD /app/v1/news-live/{slug}?type=…`: the same endpoint as
   * {@link getNewsArticle}, without the body. docs/api-contracts.md §3.2.
   */
  hasNewsArticle(category: NewsArticleCategory, slug: string): Promise<boolean> {
    return this.client.exists(
      `${NEWS_LIVE}/${encodeURIComponent(slug)}`,
      { type: newsTypeOf(category) },
      Math.min(this.timeoutMs, EXISTENCE_CHECK_TIMEOUT_MS),
    );
  }

  /**
   * `GET /app/v1/documents-live?section=…` — every page of it, in the
   * panel's order. docs/api-contracts.md §4.2. A tile that fails the schema
   * or the mapping is handled by {@link rejectItem}, as a news card is.
   */
  async getInvestorTiles(section: InvestorSection): Promise<InvestorTile[]> {
    const params = { section: sectionCodeOf(section) };
    const endpoint = this.client.label(DOCUMENTS_LIVE, params);
    const bodies = await this.client.getAll(
      DOCUMENTS_LIVE,
      params,
      documentCategorySchema,
      DOCUMENTS_CACHE,
    );

    return bodies.flatMap((body) => {
      try {
        return [toInvestorTile(body, section, endpoint)];
      } catch (error) {
        if (!(error instanceof InvalidContentError)) throw error;
        rejectItem(error);
        return [];
      }
    });
  }

  /**
   * `GET /app/v1/documents-live/{slug}?section=…` — `null` on the backend's
   * 404, which covers an unknown slug and an unpublished tile alike.
   * docs/api-contracts.md §4.3. Not paginated: one response holds the page.
   */
  async getInvestorTilePage(
    section: InvestorSection,
    slug: string,
  ): Promise<InvestorTilePage | null> {
    const path = `${DOCUMENTS_LIVE}/${encodeURIComponent(slug)}`;
    const params = { section: sectionCodeOf(section) };

    const body = await this.client.getObject(
      path,
      params,
      documentCategoryPageSchema,
      DOCUMENTS_CACHE,
    );
    return body === null
      ? null
      : toInvestorTilePage(body, section, this.client.label(path, params));
  }

  /**
   * `HEAD /app/v1/documents-live/{slug}?section=…`: the same endpoint as
   * {@link getInvestorTilePage}, without the body.
   */
  hasInvestorTile(section: InvestorSection, slug: string): Promise<boolean> {
    return this.client.exists(
      `${DOCUMENTS_LIVE}/${encodeURIComponent(slug)}`,
      { section: sectionCodeOf(section) },
      Math.min(this.timeoutMs, EXISTENCE_CHECK_TIMEOUT_MS),
    );
  }

  /**
   * `POST /app/v1/preview/session` — docs/api-contracts.md §6.1. A refusal is
   * a result; a failure of the backend itself throws.
   */
  async startPreviewSession(token: string): Promise<PreviewExchange> {
    try {
      const body = await this.client.postJson(PREVIEW_SESSION, { token }, previewSessionSchema);
      return {
        ok: true,
        session: {
          token: body.sessionToken,
          expiresInSeconds: body.expiresInSeconds,
          screenCode: body.screenCode,
          issuedFor: body.issuedFor,
        },
      };
    } catch (error) {
      if (error instanceof ContentUnavailableError && isExchangeRefusal(error)) {
        return { ok: false, reason: 'refused', code: error.code };
      }
      throw error;
    }
  }

  /**
   * `GET /app/v1/news-live-preview?type=…` with the session as the bearer —
   * every page of it, never cached. `type` is sent although the session
   * already names the screen: see {@link previewRefusal}.
   *
   * An item the site cannot map is kept as incomplete (`./preview.ts`), never
   * dropped as on live.
   */
  async getNewsPreview(
    category: NewsCategory,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewListing<NewsItem>>> {
    const params = { type: newsTypeOf(category) };
    const endpoint = this.client.label(NEWS_PREVIEW, params);

    let raws;
    try {
      raws = await this.client.getAll(NEWS_PREVIEW, params, RAW, NO_STORE, {
        bearer: sessionToken,
      });
    } catch (error) {
      const refusal = previewRefusal(error);
      if (refusal === null) throw error;
      return refusal;
    }

    return {
      ok: true,
      value: mapPreviewRecords(
        raws,
        newsPreviewListItemSchema,
        (body) => toNewsPreviewItem(body, endpoint),
        endpoint,
      ),
    };
  }

  /** `GET /app/v1/news-live-preview/{slug}?type=…` — `null` on the backend's 404. */
  async getNewsArticlePreview(
    category: NewsArticleCategory,
    slug: string,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewDetail<NewsArticle> | null>> {
    const path = `${NEWS_PREVIEW}/${encodeURIComponent(slug)}`;
    const params = { type: newsTypeOf(category) };
    const endpoint = this.client.label(path, params);

    let raw;
    try {
      raw = await this.client.getObject(path, params, RAW, NO_STORE, { bearer: sessionToken });
    } catch (error) {
      const refusal = previewRefusal(error);
      if (refusal === null) throw error;
      return refusal;
    }

    return {
      ok: true,
      value:
        raw === null
          ? null
          : mapPreviewRecord(
              raw,
              newsPreviewDetailSchema,
              (body) => toNewsArticlePreview(body, category, endpoint),
              { endpoint },
            ),
    };
  }

  /**
   * `GET /app/v1/documents-live-preview?section=…` — every page of it, never
   * cached. `section` is sent although the session names the screen: without
   * it, nothing stops a session for one section filling another's page.
   */
  async getInvestorTilesPreview(
    section: InvestorSection,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewListing<InvestorTile>>> {
    const params = { section: sectionCodeOf(section) };
    const endpoint = this.client.label(DOCUMENTS_PREVIEW, params);

    let raws;
    try {
      raws = await this.client.getAll(DOCUMENTS_PREVIEW, params, RAW, NO_STORE, {
        bearer: sessionToken,
      });
    } catch (error) {
      const refusal = previewRefusal(error);
      if (refusal === null) throw error;
      return refusal;
    }

    return {
      ok: true,
      value: mapPreviewRecords(
        raws,
        documentPreviewCategorySchema,
        (body) => toInvestorTilePreview(body, section, endpoint),
        endpoint,
      ),
    };
  }

  /**
   * `GET /app/v1/documents-live-preview/{slug}?section=…` — `null` on the
   * backend's 404. The tile and its documents are checked one by one, so a
   * half-written document is shown as incomplete rather than failing the page.
   */
  async getInvestorTilePagePreview(
    section: InvestorSection,
    slug: string,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewDetail<PreviewTilePage> | null>> {
    const path = `${DOCUMENTS_PREVIEW}/${encodeURIComponent(slug)}`;
    const params = { section: sectionCodeOf(section) };

    let body;
    try {
      body = await this.client.getObject(path, params, documentPreviewPageSchema, NO_STORE, {
        bearer: sessionToken,
      });
    } catch (error) {
      const refusal = previewRefusal(error);
      if (refusal === null) throw error;
      return refusal;
    }

    return {
      ok: true,
      value:
        body === null
          ? null
          : toInvestorTilePagePreview(body, section, this.client.label(path, params)),
    };
  }
}
