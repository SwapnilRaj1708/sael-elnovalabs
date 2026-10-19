import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadAreaTiles, loadTileParams, loadTilePage } from '@/app/investors/_lib/documents';
import { areaNavFor, TilePage, tileMetadata } from '@/app/investors/_lib/tile-page';

const SECTION = 'corporate-governance';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * **`true`, and it must stay `true`.** A tile published after the deploy
 * renders on its first request rather than 404ing until the next build. The
 * page is then cached as ISR (/CLAUDE.md §7) and refreshed when the
 * backend's webhook names it. A slug that is not a live tile still 404s.
 */
export const dynamicParams = true;

/** The tiles live at build time, checked against the site's routes — a mismatch fails the build. */
export function generateStaticParams(): Promise<{ slug: string }[]> {
  return loadTileParams(SECTION);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await loadTilePage(SECTION, (await params).slug);
  return page === null ? {} : tileMetadata(page);
}

/**
 * One Corporate Governance tile, at its legacy URL — the tile's slug is the
 * route segment. Board of Directors and Board Committees are static routes
 * beside this one, and win over it.
 */
export default async function CorporateGovernanceTilePage({ params }: PageProps) {
  const { slug } = await params;
  const [page, tiles] = await Promise.all([loadTilePage(SECTION, slug), loadAreaTiles(SECTION)]);
  if (page === null) notFound();

  return <TilePage page={page} nav={areaNavFor(SECTION, tiles, page.tile.path)} />;
}
