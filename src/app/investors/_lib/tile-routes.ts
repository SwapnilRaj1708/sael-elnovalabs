import type { InvestorSection, InvestorTile } from '@/lib/content';

/**
 * Which investor URLs the site serves, and the check that every live tile
 * is one of them.
 *
 * **Why this exists.** The backend builds each tile's page address, and the
 * paths its publish webhook asks the site to refresh, from the section's
 * `basePath` and the tile's `slug` (docs/api-contracts.md §7.1). A tile
 * whose address the site does not serve fails three ways at once, and none
 * of them reports itself: its link 404s or opens some other page, the
 * webhook refreshes a path that is not a route, and the webhook still
 * answers 2xx, so the backend records the publish as delivered.
 *
 * The routes are fixed by SAEL's legacy URLs and the redirect map, so when
 * the two disagree **the tile is what has to change**, in the panel or in
 * the import — never a route renamed to match.
 */

export interface InvestorArea {
  section: InvestorSection;
  /** The area's own URL. The backend's `section.basePath` must equal it. */
  path: string;
  /**
   * How a tile's page is served. `slug-route` — each tile at
   * `path + slug + "/"`, by the area's `[slug]` route. `section-page` — the
   * area is one page, showing the single tile `sectionTile`; no other tile
   * of the section has a page at all.
   */
  pages: 'slug-route' | 'section-page';
  /** The `section-page` area's one tile. */
  sectionTile?: string;
  /**
   * Pages of the area that are not tiles: static routes beside `[slug]`,
   * which win over it. A tile with one of these slugs is never shown — the
   * static page answers its URL.
   */
  staticPages: readonly string[];
  /**
   * The last segment of every legacy URL in the area that is a tile, in the
   * legacy order — read from the live https://www.sael.co/investors/ section
   * pages on 2026-10-02 with the backend's own extractor
   * (`tools/migration-extract`, `parseSectionLanding`). Each must be a live
   * tile, or its URL, which the redirect map and search engines point at,
   * 404s.
   */
  legacyTiles: readonly string[];
}

export const INVESTOR_AREAS = {
  'offer-documents': {
    section: 'offer-documents',
    path: '/investors/offer-documents/',
    pages: 'slug-route',
    staticPages: [],
    legacyTiles: [
      'drhp',
      'corrigendum-to-drhp',
      'addendum-to-drhp',
      'industry-report',
      'drhp-audio-visuals-english',
      'drhp-audio-visuals-hindi',
      'outstanding-dues-to-material-creditors',
      'information-with-respect-to-group-companies',
    ],
  },
  'corporate-governance': {
    section: 'corporate-governance',
    path: '/investors/corporate-governance/',
    pages: 'slug-route',
    // Not tiles in the backend either: descope note S1 withdrew the modules
    // that would have served them, and backend row 3.24 is the open question.
    staticPages: ['board-of-directors', 'board-committees'],
    legacyTiles: [
      'codes-and-policies',
      'sustainability-reports',
      'csr',
      'general-meeting',
      'familiarization-programme',
      'other-documents',
    ],
  },
  'financials-and-reports': {
    section: 'financials-and-reports',
    path: '/investors/financials-and-reports/',
    pages: 'slug-route',
    staticPages: [],
    legacyTiles: [
      'annual-return',
      'consolidated-financials-of-the-company',
      'standalone-financials-of-the-company',
      'standalone-financials-of-material-subsidiary-companies',
      'investor-downloads',
    ],
  },
  notifications: {
    section: 'notifications',
    path: '/investors/notifications/',
    // One FY-grouped tile, never one per year (backend feature doc §3). Its
    // page is the section's page; the webhook's second path for it,
    // `/investors/notifications/notifications/`, is not a route and refreshes
    // nothing — harmless, since the first, the section's, is this page.
    pages: 'section-page',
    sectionTile: 'notifications',
    staticPages: [],
    legacyTiles: ['notifications'],
  },
} as const satisfies Record<InvestorSection, InvestorArea>;

/** Why a live tile has no page on the site. */
export type TileRouteProblem =
  /** A static page answers the tile's URL, so its documents are never shown. */
  | { kind: 'shadowed'; tile: InvestorTile }
  /** The area is one page, and this is not its tile. */
  | { kind: 'no-route'; tile: InvestorTile }
  /** The backend files the section under another URL, so its webhook paths are not routes. */
  | { kind: 'base-path'; tile: InvestorTile };

export interface TileRouteAudit {
  /** The tiles the site serves, in the order given. Only these are linked to. */
  routable: InvestorTile[];
  problems: TileRouteProblem[];
  /** Legacy URLs' segments with no live tile — each such URL 404s. */
  missing: string[];
  /** Live tiles with a page that is not a legacy URL — new addresses, legitimately. */
  added: string[];
}

export function auditTileRoutes(
  area: InvestorArea,
  tiles: readonly InvestorTile[],
): TileRouteAudit {
  const problems: TileRouteProblem[] = [];
  const routable: InvestorTile[] = [];

  for (const tile of tiles) {
    if (tile.sectionPath !== area.path) problems.push({ kind: 'base-path', tile });
    else if (area.staticPages.includes(tile.slug)) problems.push({ kind: 'shadowed', tile });
    else if (area.pages === 'section-page' && tile.slug !== area.sectionTile) {
      problems.push({ kind: 'no-route', tile });
    } else routable.push(tile);
  }

  const live = new Set(routable.map((tile) => tile.slug));
  const legacy = new Set<string>(area.legacyTiles);
  return {
    routable,
    problems,
    missing: area.legacyTiles.filter((slug) => !live.has(slug)),
    added: [...live].filter((slug) => !legacy.has(slug)),
  };
}

/** One line a person can act on — which string differs, and where to fix it. */
export function describeTileRouteProblem(area: InvestorArea, problem: TileRouteProblem): string {
  const { tile } = problem;
  const named = `Tile "${tile.title}" (slug "${tile.slug}", publicId ${tile.id})`;
  switch (problem.kind) {
    case 'shadowed':
      return `${named} is never shown: ${area.path}${tile.slug}/ is a static page of the site. Give the tile another slug in the panel.`;
    case 'no-route':
      return `${named} has no page: ${area.path} shows only the tile "${area.sectionTile ?? ''}". The webhook refreshes ${tile.path}, which is not a route.`;
    case 'base-path':
      return `${named} is filed by the backend under ${tile.sectionPath}, but the site serves this section at ${area.path}. Every webhook path for it is a path the site does not serve.`;
  }
}

export function describeMissingTiles(area: InvestorArea, audit: TileRouteAudit): string {
  const added =
    audit.added.length === 0
      ? ''
      : ` Live tiles at addresses that are not legacy URLs: ${audit.added.join(', ')} — if one of them is meant to be at a URL above, its slug is wrong.`;
  if (area.pages === 'section-page') {
    return `No live tile "${area.sectionTile ?? ''}": ${area.path} shows that nothing is published.${added}`;
  }
  const urls = audit.missing.map((slug) => `${area.path}${slug}/`).join(', ');
  return `No live tile for ${urls}: each of these legacy URLs 404s.${added}`;
}
