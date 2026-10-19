import type { Metadata } from 'next';
import { governanceIndex, governanceStaticPages } from '@/app/_content/corporate-governance';
import { financialsIndex } from '@/app/_content/financials-and-reports';
import {
  areaNav,
  companyFilterCopy,
  consentCopy,
  documentUnavailable,
  investorDocumentsNone,
  jumpLinksLabel,
  videoFallback,
  type InvestorPage,
} from '@/app/_content/investors';
import { notificationsPage } from '@/app/_content/notifications';
import { offerDocumentsIndex } from '@/app/_content/offer-documents';
import { revealGatedDocument, revealGatedVideo } from '@/app/investors/actions';
import { SubPage, type SubPageNavProps } from '@/components/sections/sub-page';
import { DocumentFilter, type DocumentFilterCopy } from '@/components/ui/document-filter';
import { DocumentGroups } from '@/components/ui/document-groups';
import { GatedVideo } from '@/components/ui/gated-video';
import type { VideoPlayerSource } from '@/components/ui/video-player';
import { EmptyState } from '@/components/ui/empty-state';
import { NoticeHtml } from '@/components/ui/notice-text';
import { TODO_CONTENT } from '@/lib/config/site';
import type { InvestorSection, InvestorTile, InvestorTilePage } from '@/lib/content';
import { buildMetadata } from '@/lib/seo/metadata';
import { sanitizeArticle } from '@/lib/utils/sanitize-article';
import { allDocuments, toGatedGroups, toLinkGroups } from './documents';
import { INVESTOR_AREAS } from './tile-routes';

/**
 * A tile's page — the one template every investor tile renders through,
 * whatever its slug. Page code, beside the `[slug]` routes that use it.
 */

/** What an area adds around its tiles that the backend does not serve. */
interface AreaChrome {
  /** The side list's heading — the legacy `<h3>` over the area's pages. */
  navLabel: string;
  /** Pages of the area that are not tiles, which lead the side list. */
  staticPages: readonly InvestorPage[];
  /**
   * The company filter over a tile's documents, by slug — Material
   * Subsidiaries' sixty-four filings. A presentation choice for a page the
   * site already knows, not a route: a tile not named here renders without.
   */
  filters: Readonly<Record<string, DocumentFilterCopy>>;
}

const AREA_CHROME: Record<Exclude<InvestorSection, 'notifications'>, AreaChrome> = {
  'offer-documents': { navLabel: offerDocumentsIndex.title, staticPages: [], filters: {} },
  'corporate-governance': {
    navLabel: governanceIndex.title,
    staticPages: governanceStaticPages,
    filters: {},
  },
  'financials-and-reports': {
    navLabel: financialsIndex.title,
    staticPages: [],
    filters: { 'standalone-financials-of-material-subsidiary-companies': companyFilterCopy },
  },
};

/** An area's pages for its index and side list: the static ones first, then the tiles. */
export function areaPages(
  section: Exclude<InvestorSection, 'notifications'>,
  tiles: readonly InvestorTile[],
): { slug: string; name: string; path: string }[] {
  return [
    ...AREA_CHROME[section].staticPages.map(({ slug, name, path }) => ({ slug, name, path })),
    ...tiles.map(({ slug, title, path }) => ({ slug, name: title, path })),
  ];
}

/** The side list beside every page of an area, the one at `currentPath` marked current. */
export function areaNavFor(
  section: Exclude<InvestorSection, 'notifications'>,
  tiles: readonly InvestorTile[],
  currentPath: string,
): SubPageNavProps {
  return areaNav(AREA_CHROME[section].navLabel, areaPages(section, tiles), currentPath);
}

/**
 * A tile page's metadata. **What the maker wrote in the panel wins**; where
 * they left it blank, the legacy pattern — the page's name, " - SAEL" —
 * which is every legacy investor `<title>` exactly. The legacy pages carry
 * no description, so none is invented. The canonical is the site's own
 * route for the tile.
 */
export function tileMetadata(page: InvestorTilePage): Metadata {
  const { tile } = page;
  return buildMetadata({
    title: tile.seoTitle ?? `${tile.title} - SAEL`,
    description: tile.seoDescription ?? TODO_CONTENT,
    path: `${INVESTOR_AREAS[tile.section].path}${tile.slug}/`,
  });
}

/**
 * The one recording a gated media tile plays in the page — the legacy DRHP
 * audio-visual pages, gated on arrival with the video inline. Only when the
 * tile holds exactly one document and it is a hosted recording; any other
 * gated tile lists its documents, each behind the notice, so nothing on it
 * is left out for want of a player.
 */
function inlineRecording(page: InvestorTilePage): boolean {
  if (!page.tile.gate.enabled || page.tile.displayMode !== 'media-list') return false;
  const documents = allDocuments(page);
  const [only] = documents;
  return (
    documents.length === 1 &&
    only !== undefined &&
    /^(video|audio)\//.test(only.file?.mimeType ?? '')
  );
}

/**
 * The Server Actions a gated tile reveals its URLs through, after "I Confirm".
 * Keys are `section/slug/documentId` for a document and `section/slug` for a
 * tile's recording (`gate-keys.ts`).
 */
export interface TileGateActions {
  document: (key: string) => Promise<string | null>;
  video: (key: string) => Promise<VideoPlayerSource | null>;
}

const LIVE_GATE_ACTIONS: TileGateActions = {
  document: revealGatedDocument,
  video: revealGatedVideo,
};

export interface TilePageProps {
  page: InvestorTilePage;
  /** The area's side list. Omitted on a page that is a section on its own. */
  nav?: SubPageNavProps;
  /** The `<h1>`, where it is not the tile's title — Notifications' legacy name. */
  title?: string;
  /**
   * Where a gate reads the URLs it guards. The live tile by default; a Live
   * Preview passes actions that read the tile through the reviewer's
   * session, since a draft is not on the live tile at all. The gate itself —
   * its notice, its two choices, what is withheld until "I Confirm" — is the
   * same either way, because it is part of what the reviewer approves.
   */
  gateActions?: TileGateActions;
  /**
   * Where "I Do Not Confirm" on an inline recording goes. The section, by
   * default; the section's preview, on a preview.
   */
  exitHref?: string;
}

/**
 * One tile's page: the ripple band with its title, its description if it
 * has one, then its documents **under the backend's headings, exactly as
 * given** — groups, subgroups and anchors, empty headings included, the
 * documents under no heading last and never dropped.
 *
 * - **Gated** when the backend says so, with the tile's own disclaimer,
 *   maintained in the panel: every document behind the notice, its URL
 *   kept out of the page until "I Confirm" (`toGatedGroups`, the actions).
 *   A gated media tile of one recording plays it in the page instead, behind
 *   the notice on arrival, and "I Do Not Confirm" returns to the section.
 * - **A document with nothing to open** — a file never promoted — is a
 *   visible "unavailable" row.
 * - **Nothing published** is an empty state, not a 404: a tile must not
 *   vanish from a compliance page. A tile with a description and no
 *   documents (Outstanding Dues' table) shows the description alone.
 *
 * Headings take the backend's anchors as their ids, so `#fy2025` lands.
 *
 * A Server Component; the ripple band, gated rows, the player and the
 * filter are the client leaves.
 */
export function TilePage({
  page,
  nav,
  title,
  gateActions = LIVE_GATE_ACTIONS,
  exitHref,
}: TilePageProps) {
  const { tile } = page;
  const description = tile.descriptionHtml === null ? null : sanitizeArticle(tile.descriptionHtml);
  const notice = tile.gate.enabled ? (
    <NoticeHtml html={sanitizeArticle(tile.gate.disclaimerHtml) ?? ''} />
  ) : null;
  const filter =
    tile.section === 'notifications' ? undefined : AREA_CHROME[tile.section].filters[tile.slug];

  const empty = { emptyTitle: investorDocumentsNone.title, jumpLabel: jumpLinksLabel };

  let documents;
  if (notice !== null && inlineRecording(page)) {
    documents = (
      <GatedVideo
        title={tile.title}
        fallback={videoFallback}
        copy={consentCopy}
        notice={notice}
        exitHref={exitHref ?? tile.sectionPath}
        revealKey={`${tile.section}/${tile.slug}`}
        reveal={gateActions.video}
      />
    );
  } else if (notice !== null) {
    documents = (
      <DocumentGroups
        groups={toGatedGroups(page, documentUnavailable)}
        gate={{ copy: consentCopy, notice, reveal: gateActions.document }}
        {...empty}
      />
    );
  } else if (filter !== undefined) {
    documents = (
      <DocumentFilter groups={toLinkGroups(page, documentUnavailable)} copy={filter} {...empty} />
    );
  } else {
    documents = <DocumentGroups groups={toLinkGroups(page, documentUnavailable)} {...empty} />;
  }

  return (
    <SubPage masthead="ripple" title={title ?? tile.title} nav={nav}>
      <div className="flex flex-col gap-section-y-tight">
        {description !== null && (
          <div
            className="article-prose text-body text-pretty text-body-on-dark"
            // Sanitised on the server, above, as an article body is.
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {description !== null && page.groups.length === 0 ? null : documents}
      </div>
    </SubPage>
  );
}

export interface NotificationsPageBodyProps {
  /** The section's one tile, `notifications`, or `null` when it is not there. */
  tilePage: InvestorTilePage | null;
  gateActions?: TileGateActions;
  exitHref?: string;
}

/**
 * Notifications' page: the section's one tile under the legacy page's name,
 * with **no side list** — the legacy page is a page on its own, not part of
 * an area. With the tile not there, the page says nothing is published rather
 * than 404ing at a legacy URL. The live page and its Live Preview both.
 */
export function NotificationsPageBody({
  tilePage,
  gateActions,
  exitHref,
}: NotificationsPageBodyProps) {
  if (tilePage === null) {
    return (
      <SubPage masthead="ripple" title={notificationsPage.name}>
        <EmptyState ground="dark" title={investorDocumentsNone.title} />
      </SubPage>
    );
  }
  return (
    <TilePage
      page={tilePage}
      title={notificationsPage.name}
      gateActions={gateActions}
      exitHref={exitHref}
    />
  );
}
