import { env } from '@/lib/config/env';
import { legacyOrBlobUrl } from '@/lib/utils/blob-url';
import { newsItemHref, newsPreviewItemHref, newsVideoThumbnail } from '../news-links';
import type { ContentRepository, NewsItemsQuery } from '../repository';
import type {
  BlobFile,
  InvestorDocument,
  InvestorDocumentGroup,
  InvestorDocumentKind,
  InvestorSection,
  InvestorTile,
  InvestorTileDisplayMode,
  InvestorTilePage,
  NewsArticle,
  NewsArticleCategory,
  NewsCategory,
  NewsItem,
  NewsVideo,
  PreviewDetail,
  PreviewExchange,
  PreviewListing,
  PreviewRead,
  PreviewScreenCode,
  PreviewState,
  PreviewTilePage,
} from '../types';
import investorDocuments from './data/investor-documents.json';
import investorTiles from './data/investor-tiles.json';
import newsroomItems from './data/newsroom-items.json';

/**
 * A file as the fixtures store it: a path within the blob container, never a
 * URL. `blobFile()` composes the URL at read time.
 */
interface FixtureFile extends Omit<BlobFile, 'url'> {
  path: string;
}

/**
 * A tile as `investor-tiles.json` stores it: the tile, and its headings as
 * the backend stores an outline — label, **stored** anchor, one level of
 * subheadings. The anchors in the file are written out, not computed here:
 * the fixture stands in for the backend, which stores them, and the site
 * never derives one (docs/api-contracts.md §4.3).
 */
interface TileFixture {
  section: InvestorSection;
  slug: string;
  title: string;
  displayMode: InvestorTileDisplayMode;
  gateDisclaimerHtml: string | null;
  descriptionHtml: string | null;
  outline: {
    label: string;
    anchor: string;
    subheadings: { label: string; anchor: string }[];
  }[];
}

/**
 * A document as `investor-documents.json` stores it: filed under its tile,
 * and under a heading and subheading by their anchors (`null` for none).
 *
 * One field the domain type does not have: `legacyPath`, the file's path on
 * the legacy www.sael.co, recorded so the client can upload every file to
 * its blob path in one pass. It is never handed to a component as such —
 * see `fixtureUrl()` for the one, temporary, way it becomes a URL.
 */
interface DocumentFixture {
  id: string;
  title: string;
  section: InvestorSection;
  tile: string;
  heading: string | null;
  subheading: string | null;
  kind: InvestorDocumentKind;
  publishedAt: string | null;
  financialYear: string | null;
  file: FixtureFile;
  legacyPath: string;
  externalUrl: string | null;
}

/**
 * A fixture file's URL: its legacy copy while `LEGACY_ASSET_BASE_URL` is set,
 * its blob path otherwise — `null` if neither can be composed.
 *
 * **The legacy branch is temporary**, the client's instruction of 2026-09-29:
 * the Offer Documents files are not in the container yet, so until they are,
 * the links point at the live site's own copies rather than 404ing. The path
 * is the one the fixture already records. The rule itself, and when to retire
 * it, is `legacyOrBlobUrl()`'s.
 */
function fixtureUrl(path: string | null, legacyPath: string | null): string | null {
  return legacyOrBlobUrl(path, legacyPath);
}

/** Resolve a fixture file to a `BlobFile`, or `null` if it has no URL. */
function blobFile({ path, ...file }: FixtureFile, legacyPath: string | null): BlobFile | null {
  const url = fixtureUrl(path, legacyPath);
  return url === null ? null : { ...file, url };
}

const TILE_PATHS: Record<InvestorSection, string> = {
  'offer-documents': '/investors/offer-documents/',
  'corporate-governance': '/investors/corporate-governance/',
  'financials-and-reports': '/investors/financials-and-reports/',
  notifications: '/investors/notifications/',
};

function tileDocuments(row: TileFixture): DocumentFixture[] {
  return (investorDocuments as DocumentFixture[]).filter(
    (document) => document.section === row.section && document.tile === row.slug,
  );
}

function toInvestorTile(row: TileFixture): InvestorTile {
  const sectionPath = TILE_PATHS[row.section];
  return {
    id: `${row.section}/${row.slug}`,
    section: row.section,
    title: row.title,
    slug: row.slug,
    path: `${sectionPath}${row.slug}/`,
    sectionPath,
    displayMode: row.displayMode,
    descriptionHtml: row.descriptionHtml,
    gate:
      row.gateDisclaimerHtml === null
        ? { enabled: false }
        : { enabled: true, disclaimerHtml: row.gateDisclaimerHtml },
    documentCount: tileDocuments(row).length,
    seoTitle: null,
    seoDescription: null,
  };
}

/**
 * A fixture document as the API would serve it. **A file whose URL cannot
 * be composed is kept, with `file: null`** — the shape the backend sends for
 * a file never promoted — so the page shows it as unavailable rather than
 * leaving it out. Mapped field by field, so `legacyPath` cannot ride along
 * into a component by accident.
 */
function toInvestorDocument(row: DocumentFixture): InvestorDocument {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    publishedAt: row.publishedAt,
    financialYear: row.financialYear,
    file: blobFile(row.file, row.legacyPath),
    externalUrl: row.externalUrl,
  };
}

/**
 * The backend's grouping of a tile with an outline (docs/api-contracts.md
 * §4.3), reproduced over the fixture: one group per heading in the
 * outline's order — empty ones included — each with its subheadings, then
 * the documents under no heading in a trailing group with a null label and
 * anchor. A tile with no outline and documents is one unlabelled group;
 * with neither, no groups at all. Documents keep the file's order.
 */
function toGroups(row: TileFixture): InvestorDocumentGroup[] {
  const documents = tileDocuments(row);
  const under = (heading: string | null, subheading: string | null) =>
    documents
      .filter((document) => document.heading === heading && document.subheading === subheading)
      .map(toInvestorDocument);

  const headings = new Set(row.outline.map((heading) => heading.anchor));
  const groups: InvestorDocumentGroup[] = row.outline.map((heading) => ({
    label: heading.label,
    anchor: heading.anchor,
    documents: under(heading.anchor, null),
    subgroups: heading.subheadings.map((subheading) => ({
      label: subheading.label,
      anchor: subheading.anchor,
      documents: under(heading.anchor, subheading.anchor),
    })),
  }));

  const unheaded = documents
    .filter((document) => document.heading === null || !headings.has(document.heading))
    .map(toInvestorDocument);
  if (unheaded.length > 0) {
    groups.push({ label: null, anchor: null, documents: unheaded, subgroups: [] });
  }
  return groups;
}

/**
 * A Newsroom row: the domain fields, with the image as a path pair rather
 * than a URL, and the body for an article. Generated from the legacy pages'
 * HTML — see `getNewsItems()`. Every legacy video is on YouTube, so a row
 * stores the bare `videoId` and `toNewsItem()` names the provider.
 */
interface NewsroomFixture extends Omit<NewsItem, 'category' | 'href' | 'imageUrl' | 'video'> {
  category: NewsCategory;
  image: { path: string; legacyPath: string } | null;
  videoId: string | null;
  body: string | null;
}

/**
 * A body's own images: each `src` is stored as the root-relative legacy path
 * — the legacy CMS wrote them absolute, on a development host — and is
 * resolved exactly as a card's image is, by `fixtureUrl()` with the blob path
 * `web-assets` + legacy path. An image that cannot be resolved loses its
 * `src`, and the sanitiser then drops the element.
 */
function resolveBodyImages(body: string): string {
  return body.replace(
    /(<img\b[^>]*?\ssrc=")(\/[^"]*)(")/g,
    (_match, open: string, path: string, close: string) => {
      const url = fixtureUrl(`web-assets${path}`, path);
      return url === null ? `${open}${close}` : `${open}${url}${close}`;
    },
  );
}

/** A Newsroom row as a card needs it, or `null` if it has nowhere to go. */
function toNewsItem(row: NewsroomFixture): NewsItem | null {
  const video: NewsVideo | null =
    row.videoId === null || row.videoId === '' ? null : { provider: 'youtube', id: row.videoId };
  const href = newsItemHref({ ...row, video });
  if (href === null) return null;

  return {
    id: row.id,
    category: row.category,
    title: row.title,
    publishedAt: row.publishedAt,
    href,
    imageUrl:
      row.image === null
        ? newsVideoThumbnail(video)
        : fixtureUrl(row.image.path, row.image.legacyPath),
    imageAlt: row.imageAlt,
    slug: row.slug,
    externalUrl: row.externalUrl,
    video,
    publication: row.publication,
  };
}

/**
 * The local-development and pre-backend implementation. docs/content-model.md §4.
 *
 * Seeded from the live site rather than from Lorem: every news item and
 * investor document is transcribed from www.sael.co. Realistic data is not a
 * nicety — placeholder text hides the layout failures that real copy exposes.
 *
 * **This survives the cutover.** FE-23 flips `CONTENT_SOURCE` per environment
 * and keeps the mock as the local default and as a fixture source. It is not
 * scaffolding to be deleted.
 */
/**
 * The mock's preview credentials, so a preview page can be exercised with no
 * backend: the link token `mock:NEWS_PRESS_RELEASE` exchanges for a session on
 * that screen, and anything else is refused. Not a secret and not a stand-in
 * for one — the mock serves the same fixtures it serves live.
 */
/**
 * The backend's default for `content.home.in-the-news.limit`: how many of the
 * latest In The News items the homepage rail shows while SAEL has marked none
 * for it.
 */
const HOME_RAIL_LATEST = 9;

const MOCK_LINK_PREFIX = 'mock:';
const MOCK_SESSION_PREFIX = 'mock-session:';

const NEWS_SCREENS = {
  'press-release': 'NEWS_PRESS_RELEASE',
  'in-the-news': 'NEWS_IN_THE_NEWS',
  'our-views': 'NEWS_OUR_VIEWS',
  multimedia: 'NEWS_MULTIMEDIA',
} as const satisfies Record<NewsCategory, PreviewScreenCode>;

const DOCUMENT_SCREENS = {
  'offer-documents': 'DOC_OFFER_DOCUMENTS',
  'corporate-governance': 'DOC_CORPORATE_GOVERNANCE',
  'financials-and-reports': 'DOC_FINANCIALS_REPORTS',
  notifications: 'DOC_NOTIFICATIONS',
} as const satisfies Record<InvestorSection, PreviewScreenCode>;

const SCREEN_CODES: readonly string[] = [
  ...Object.values(NEWS_SCREENS),
  ...Object.values(DOCUMENT_SCREENS),
];

/** Every fixture is published, so its preview shows it as live. */
const MOCK_PREVIEW_STATE: PreviewState = {
  status: 'PUBLISHED',
  versionNo: 1,
  isDraft: false,
  lastUpdatedBy: null,
  lastUpdatedAt: null,
};

/** The backend's session check, reproduced: 401 for no session, 403 for another screen. */
function mockSessionCheck(
  sessionToken: string,
  screenCode: PreviewScreenCode,
): PreviewRead<never> | null {
  if (!sessionToken.startsWith(MOCK_SESSION_PREFIX)) return { ok: false, reason: 'session-ended' };
  return sessionToken === `${MOCK_SESSION_PREFIX}${screenCode}`
    ? null
    : { ok: false, reason: 'wrong-screen' };
}

export class MockContentRepository implements ContentRepository {
  /**
   * Optional artificial delay, so loading and error states can be exercised
   * locally without a backend. `MOCK_LATENCY_MS`, default `0`.
   */
  private async settle<T>(value: T): Promise<T> {
    if (env.MOCK_LATENCY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, env.MOCK_LATENCY_MS));
    }
    return value;
  }

  /**
   * One Newsroom section, from `newsroom-items.json`: the legacy
   * https://www.sael.co/newsroom/ listings transcribed from their raw HTML on
   * 2026-10-01 by script, not by hand — every title, date, image `alt`,
   * outbound URL, video id and article body exactly as published.
   *
   * **In the file's line order, which is each legacy listing's order** —
   * newest first for the dated sections, the company's own for Our Views and
   * Multimedia. Not sorted here: the repository returns the source's order,
   * and the backend's is editorial (set on the panel's Reorder screen), which
   * no sort on these fields reproduces. A mock that sorted would hide a page that did.
   *
   * Images resolve like the investor files do: the legacy copy while
   * `LEGACY_ASSET_BASE_URL` is set, the blob path (`web-assets` + legacy
   * path) otherwise. docs/asset-inventory.md §8 lists every one for upload.
   */
  getNewsItems({ category, limit }: NewsItemsQuery): Promise<NewsItem[]> {
    const items = (newsroomItems as NewsroomFixture[])
      .filter((row) => row.category === category)
      .flatMap((row) => toNewsItem(row) ?? []);

    return this.settle(limit === undefined ? items : items.slice(0, limit));
  }

  /**
   * The homepage rail: the first In The News items of `newsroom-items.json`,
   * in its order, as the API's rail is the first of its listing. The backend
   * sends the items SAEL marked for the homepage when any are marked; the
   * mock has no such marks, so it always answers as the backend does without
   * them — the latest {@link HOME_RAIL_LATEST}, however many more `limit`
   * allows. docs/api-contracts.md §3.3.
   */
  getInTheNewsRail(limit: number): Promise<NewsItem[]> {
    return this.getNewsItems({
      category: 'in-the-news',
      limit: Math.min(limit, HOME_RAIL_LATEST),
    });
  }

  async hasNewsArticle(category: NewsArticleCategory, slug: string): Promise<boolean> {
    return (await this.getNewsArticle(category, slug)) !== null;
  }

  getNewsArticle(category: NewsArticleCategory, slug: string): Promise<NewsArticle | null> {
    const row = (newsroomItems as NewsroomFixture[]).find(
      (candidate) => candidate.category === category && candidate.slug === slug,
    );
    const item = row === undefined ? null : toNewsItem(row);

    if (row === undefined || item === null || row.body === null) return this.settle(null);

    // The legacy articles carry no summary and no SEO fields; their meta
    // description is derived from the body, as the legacy site derives it.
    return this.settle({
      ...item,
      category,
      slug,
      body: resolveBodyImages(row.body),
      summary: null,
      seoTitle: null,
      seoDescription: null,
      ogImageUrl: null,
    });
  }

  /**
   * The investor tiles, seeded from the legacy https://www.sael.co/investors/
   * section pages: every tile the four landing pages link to, in their order
   * and with their titles verbatim, read on 2026-10-02 — except Board of
   * Directors and Board Committees, which the backend does not model as
   * tiles either (backend descope note S1). Their headings are those the
   * legacy pages show, in the order shown, with the anchors the backend
   * would store for them.
   *
   * The gated tiles' disclaimers and Outstanding Dues' table are the legacy
   * pages' own text, carried as the HTML the backend serves them in — the
   * DRHP notice of twenty-two paragraphs, the audio-visual one of twelve,
   * transcribed on 2026-09-29.
   */
  getInvestorTiles(section: InvestorSection): Promise<InvestorTile[]> {
    const tiles = (investorTiles as TileFixture[])
      .filter((row) => row.section === section)
      .map(toInvestorTile);
    return this.settle(tiles);
  }

  /**
   * One tile's documents, seeded from the legacy pages read on 2026-09-29
   * and 2026-09-30: every title is the legacy link text verbatim, every size
   * the byte count the legacy server reported for that file.
   *
   * **The files are not in the container yet.** Each row's path is where
   * the client is asked to upload it, so until then a link 404s unless
   * `LEGACY_ASSET_BASE_URL` points it at the legacy copy. With neither set,
   * the document is still listed, as unavailable.
   */
  getInvestorTilePage(section: InvestorSection, slug: string): Promise<InvestorTilePage | null> {
    const row = (investorTiles as TileFixture[]).find(
      (candidate) => candidate.section === section && candidate.slug === slug,
    );
    return this.settle(
      row === undefined ? null : { tile: toInvestorTile(row), groups: toGroups(row) },
    );
  }

  async hasInvestorTile(section: InvestorSection, slug: string): Promise<boolean> {
    return (await this.getInvestorTilePage(section, slug)) !== null;
  }

  startPreviewSession(token: string): Promise<PreviewExchange> {
    const screenCode = token.startsWith(MOCK_LINK_PREFIX)
      ? token.slice(MOCK_LINK_PREFIX.length)
      : null;
    if (screenCode === null || !SCREEN_CODES.includes(screenCode)) {
      return this.settle({ ok: false, reason: 'refused', code: 'PREVIEW_TOKEN_INVALID' });
    }
    return this.settle({
      ok: true,
      session: {
        token: `${MOCK_SESSION_PREFIX}${screenCode}`,
        expiresInSeconds: 1800,
        screenCode: screenCode as PreviewScreenCode,
        issuedFor: 'mock@localhost',
      },
    });
  }

  async getNewsPreview(
    category: NewsCategory,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewListing<NewsItem>>> {
    const refusal = mockSessionCheck(sessionToken, NEWS_SCREENS[category]);
    if (refusal !== null) return refusal;

    const items = await this.getNewsItems({ category });
    return {
      ok: true,
      value: {
        records: items.map((item) => ({
          record: { ...item, href: newsPreviewItemHref(item) },
          preview: MOCK_PREVIEW_STATE,
        })),
        incomplete: [],
      },
    };
  }

  async getNewsArticlePreview(
    category: NewsArticleCategory,
    slug: string,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewDetail<NewsArticle> | null>> {
    const refusal = mockSessionCheck(sessionToken, NEWS_SCREENS[category]);
    if (refusal !== null) return refusal;

    const article = await this.getNewsArticle(category, slug);
    return {
      ok: true,
      value:
        article === null
          ? null
          : { complete: true, value: { record: article, preview: MOCK_PREVIEW_STATE } },
    };
  }

  async getInvestorTilesPreview(
    section: InvestorSection,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewListing<InvestorTile>>> {
    const refusal = mockSessionCheck(sessionToken, DOCUMENT_SCREENS[section]);
    if (refusal !== null) return refusal;

    const tiles = await this.getInvestorTiles(section);
    return {
      ok: true,
      value: {
        records: tiles.map((tile) => ({ record: tile, preview: MOCK_PREVIEW_STATE })),
        incomplete: [],
      },
    };
  }

  async getInvestorTilePagePreview(
    section: InvestorSection,
    slug: string,
    sessionToken: string,
  ): Promise<PreviewRead<PreviewDetail<PreviewTilePage> | null>> {
    const refusal = mockSessionCheck(sessionToken, DOCUMENT_SCREENS[section]);
    if (refusal !== null) return refusal;

    const page = await this.getInvestorTilePage(section, slug);
    if (page === null) return { ok: true, value: null };

    const documentStates = Object.fromEntries(
      page.groups
        .flatMap((group) => [
          ...group.documents,
          ...group.subgroups.flatMap((subgroup) => subgroup.documents),
        ])
        .map((document) => [document.id, MOCK_PREVIEW_STATE]),
    );
    return {
      ok: true,
      value: {
        complete: true,
        value: { record: { page, documentStates, incomplete: [] }, preview: MOCK_PREVIEW_STATE },
      },
    };
  }
}
