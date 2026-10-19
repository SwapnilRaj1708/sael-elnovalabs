import type { DocumentGroupData } from '@/components/ui/document-groups';
import type {
  DocumentListGatedItem,
  DocumentListLink,
  DocumentListUnavailableItem,
} from '@/components/ui/document-list';
import { isBuildPhase, isProduction } from '@/lib/config/env';
import {
  getContentRepository,
  type InvestorDocument,
  type InvestorDocumentGroup,
  type InvestorSection,
  type InvestorTile,
  type InvestorTilePage,
} from '@/lib/content';
import {
  auditTileRoutes,
  describeMissingTiles,
  describeTileRouteProblem,
  INVESTOR_AREAS,
} from './tile-routes';

/**
 * What the investor pages share between the repository and the document
 * components. Page code, so it lives beside the pages — a section never
 * fetches (docs/architecture.md §3) — in a `_lib` folder the router ignores.
 *
 * **Every loader throws on failure, in every environment**, as the
 * Newsroom's do (`app/newsroom/_lib/news.ts`, which says why at length): an
 * empty list would be cached as the page for the whole ISR window, and on a
 * statutory page that is a disclosure that has silently gone. A throw is not
 * cached — Next keeps serving the last good page — and at build time it
 * fails the build.
 */

/**
 * Whether a tile with no page should stop what is running. During the build
 * and in development: yes, so the mismatch is fixed before it ships. In a
 * running production server: no — the tile is logged and left off the
 * index, and every other tile still renders.
 */
function failHard(): boolean {
  return !isProduction || isBuildPhase;
}

/**
 * One section's live tiles that the site can serve, in the panel's order —
 * for an index and for the side list beside each tile page.
 *
 * **Checked against the site's routes on every call** (`tile-routes.ts`). A
 * tile whose address the site does not serve throws during the build and in
 * development; in production it is logged and left out, so no link goes to
 * a page that would not show it. A legacy URL with no live tile behind it is
 * logged in every environment — not thrown, because a tile SAEL drop at
 * sign-off is a decision, and its URL a matter for the redirect map.
 */
export async function loadAreaTiles(section: InvestorSection): Promise<InvestorTile[]> {
  const area = INVESTOR_AREAS[section];
  const audit = auditTileRoutes(area, await getContentRepository().getInvestorTiles(section));

  if (audit.problems.length > 0) {
    const message = `[investors] ${audit.problems.length === 1 ? 'A tile has' : 'Tiles have'} no page on the site:\n  ${audit.problems.map((problem) => describeTileRouteProblem(area, problem)).join('\n  ')}`;
    if (failHard()) throw new Error(message);
    console.error(`${message}\n  Left off ${area.path}; the rest are shown.`);
  }
  if (audit.missing.length > 0) {
    console.error(`[investors] ${describeMissingTiles(area, audit)}`);
  }

  return audit.routable;
}

/**
 * The slugs for a `[slug]` route's `generateStaticParams` — the pages built
 * ahead of the first visitor, not the pages that exist: the routes set
 * `dynamicParams = true`, so a tile published after the deploy renders on
 * its first request. Goes through {@link loadAreaTiles}, so a tile with no
 * page fails the build.
 */
export async function loadTileParams(section: InvestorSection): Promise<{ slug: string }[]> {
  return (await loadAreaTiles(section)).map(({ slug }) => ({ slug }));
}

/**
 * One tile's page, or `null` for a slug that is not a live tile of the
 * section. **Not caught**: a source failure is not a 404.
 */
export function loadTilePage(
  section: InvestorSection,
  slug: string,
): Promise<InvestorTilePage | null> {
  return getContentRepository().getInvestorTilePage(section, slug);
}

/**
 * The label a row shows for its file type — "PDF" — **from the file's MIME
 * type**, which the backend verifies against the file's own bytes at upload.
 * The API sends no file name, and an extension would be the weaker evidence
 * anyway. These are the types the media library accepts
 * (`media.upload.allowed-mime-types`); another would be named by nothing
 * rather than guessed.
 */
const TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'video/mp4': 'MP4',
  'audio/mpeg': 'MP3',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
};

/** For a document with no file: what its link leads to. */
const LINK_LABELS: Record<InvestorDocument['kind'], string> = {
  file: 'Link',
  'external-link': 'Link',
  video: 'Video',
  audio: 'Audio',
};

function typeLabel(document: InvestorDocument): string {
  return document.file === null
    ? LINK_LABELS[document.kind]
    : (TYPE_LABELS[document.file.mimeType] ?? '');
}

/** Where a document opens: its file, else its link, else nowhere. */
export function documentUrl(document: InvestorDocument): string | null {
  return document.file?.url ?? document.externalUrl;
}

/** What a document with nowhere to open says in place of a link. */
export interface UnavailableCopy {
  label: string;
}

function unavailable(
  document: InvestorDocument,
  copy: UnavailableCopy,
): DocumentListUnavailableItem {
  return { id: document.id, title: document.title, unavailable: copy.label };
}

function mapGroups<T>(
  groups: readonly InvestorDocumentGroup[],
  row: (document: InvestorDocument) => T,
): DocumentGroupData<T>[] {
  return groups.map((group) => ({
    label: group.label,
    anchor: group.anchor,
    items: group.documents.map(row),
    subgroups: group.subgroups.map((subgroup) => ({
      label: subgroup.label,
      anchor: subgroup.anchor,
      items: subgroup.documents.map(row),
    })),
  }));
}

/**
 * A tile page's groups as `<DocumentGroups>` takes them, **one for one** —
 * every group, subgroup, label, anchor and document, in the order given.
 * Nothing is grouped, sorted, merged or dropped here; a document with no
 * file and no link becomes an "unavailable" row.
 *
 * **No size**, although the repository has one: the legacy pages show none.
 */
export function toLinkGroups(
  page: InvestorTilePage,
  copy: UnavailableCopy,
): DocumentGroupData<DocumentListLink | DocumentListUnavailableItem>[] {
  return mapGroups(page.groups, (document) => {
    const href = documentUrl(document);
    return href === null
      ? unavailable(document, copy)
      : { id: document.id, title: document.title, href, fileType: typeLabel(document) };
  });
}

/**
 * The same, for a gated tile: **the URL is dropped here**, on the server, so
 * it never reaches the props of a client component and so never reaches the
 * page. A row's id is the key `revealGatedDocument` resolves —
 * `section/slug/documentId` — since the action takes no bound arguments.
 */
export function toGatedGroups(
  page: InvestorTilePage,
  copy: UnavailableCopy,
): DocumentGroupData<DocumentListGatedItem | DocumentListUnavailableItem>[] {
  const { section, slug } = page.tile;
  return mapGroups(page.groups, (document) =>
    documentUrl(document) === null
      ? unavailable(document, copy)
      : {
          id: gatedDocumentKey(section, slug, document.id),
          title: document.title,
          fileType: typeLabel(document),
        },
  );
}

export function gatedDocumentKey(
  section: InvestorSection,
  slug: string,
  documentId: string,
): string {
  return `${section}/${slug}/${documentId}`;
}

/** Every document on the page, headings and subheadings flattened, in page order. */
export function allDocuments(page: InvestorTilePage): InvestorDocument[] {
  return page.groups.flatMap((group) => [
    ...group.documents,
    ...group.subgroups.flatMap((subgroup) => subgroup.documents),
  ]);
}
