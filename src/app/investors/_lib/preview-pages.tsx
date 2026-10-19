import { notFound } from 'next/navigation';
import {
  incompleteMessage,
  previewBanner,
  previewFacts,
  previewLiveLinkLabel,
  previewMessages,
  previewScreenNames,
} from '@/app/_content/preview';
import {
  incompleteBlock,
  noticeMessage,
  previewSessionToken,
  refusalMessage,
  type SearchParams,
} from '@/app/_lib/preview';
import {
  revealPreviewGatedDocument,
  revealPreviewGatedVideo,
} from '@/app/investors/preview-actions';
import { PreviewBanner, type PreviewBannerProps } from '@/components/sections/preview-banner';
import { PreviewMessage } from '@/components/sections/preview-message';
import {
  getContentRepository,
  type IncompleteRecord,
  type InvestorSection,
  type InvestorTile,
  type PreviewListing,
  type PreviewState,
  type PreviewTilePage,
  type Previewed,
} from '@/lib/content';
import { documentsPreviewPage } from '@/lib/preview/pages';
import { AreaIndex } from './area-index';
import { allDocuments } from './documents';
import {
  areaNavFor,
  areaPages,
  NotificationsPageBody,
  TilePage,
  type TileGateActions,
} from './tile-page';
import { auditTileRoutes, INVESTOR_AREAS } from './tile-routes';

/**
 * The investor area's Live Preview pages, written once for its four
 * sections — the `…-preview` route files are each a few lines around one of
 * these. docs/api-contracts.md §5–§6.
 *
 * **Each renders the live route's own component** — `<AreaIndex>`,
 * `<TilePage>`, `<NotificationsPageBody>` — given the section's tiles and
 * documents in their most recent state rather than their published one.
 * Never fork any of them for a preview: a preview that has drifted from the
 * live page is worse than none, because the checker approves something that
 * then publishes differently.
 *
 * What differs is where things come from, not how they look:
 *
 *  - the draft banner above, listing what is not yet live and what is too
 *    incomplete to draw;
 *  - links between pages stay inside the preview (a tile's page, the side
 *    list, "I Do Not Confirm"), except to the static pages, which have none;
 *  - **a gate is shown exactly as on live**, and the URLs it guards are read
 *    through the reviewer's session after "I Confirm" (`../preview-actions.ts`).
 *    A draft document's file is a short-lived signed URL to private storage.
 */

type IndexedSection = Exclude<InvestorSection, 'notifications'>;

const PREVIEW_GATE_ACTIONS: TileGateActions = {
  document: revealPreviewGatedDocument,
  video: revealPreviewGatedVideo,
};

/** A section as the reviewer knows it, and the live page a message offers as the way out. */
function sectionNames(section: InvestorSection) {
  const name = previewScreenNames[documentsPreviewPage(section).screenCode];
  return {
    name,
    liveLink: { href: INVESTOR_AREAS[section].path, label: previewLiveLinkLabel(name) },
  };
}

/** A tile's page inside the preview — `/investors/offer-documents-preview/drhp/`. */
function previewTilePath(section: InvestorSection, slug: string): string {
  return `${documentsPreviewPage(section).root}${slug}/`;
}

/**
 * The tiles a preview links to, and those it cannot. The same route check as
 * live (`tile-routes.ts`) — a tile the live site would leave off is left off
 * here too — but **never thrown and never silent**: each tile with no page is
 * named in the banner, with the incomplete ones. Each linked tile's path is
 * its preview page.
 */
function routablePreviewTiles(
  section: InvestorSection,
  listing: PreviewListing<InvestorTile>,
): { tiles: InvestorTile[]; incomplete: IncompleteRecord[] } {
  const audit = auditTileRoutes(
    INVESTOR_AREAS[section],
    listing.records.map(({ record }) => record),
  );
  const stateOf = new Map(listing.records.map(({ record, preview }) => [record.id, preview]));

  return {
    tiles: audit.routable.map((tile) => ({ ...tile, path: previewTilePath(section, tile.slug) })),
    incomplete: [
      ...listing.incomplete,
      ...audit.problems.map(({ tile }) => ({
        id: tile.id,
        title: tile.title,
        missing: ['route' as const],
        preview: stateOf.get(tile.id) ?? null,
        heading: null,
      })),
    ],
  };
}

function bannerBase(): Pick<PreviewBannerProps, 'label' | 'labelNote' | 'audience'> {
  return {
    label: previewBanner.label,
    labelNote: previewBanner.labelNote,
    audience: previewBanner.audience,
  };
}

/** An index's banner: each tile not yet live, by title, and each tile with no page. */
function indexBanner(
  records: readonly Previewed<InvestorTile>[],
  incomplete: readonly IncompleteRecord[],
): PreviewBannerProps {
  return {
    ...bannerBase(),
    heading: previewBanner.listingHeading,
    emptyNote: previewBanner.listingNothingPending,
    rows: records
      .filter(({ preview }) => preview.isDraft)
      .map(({ record, preview }) => ({ title: record.title, facts: previewFacts(preview) })),
    incomplete: incompleteBlock(incomplete),
  };
}

/**
 * A tile page's banner: the tile itself, if its own version is not live, then
 * each document not yet live, in page order, then whatever cannot be drawn.
 */
function tilePageBanner(
  { page, documentStates, incomplete }: PreviewTilePage,
  tileState: PreviewState,
  routeProblems: readonly IncompleteRecord[],
): PreviewBannerProps {
  const documents = allDocuments(page).flatMap((document) => {
    const state = documentStates[document.id];
    return state?.isDraft === true ? [{ title: document.title, facts: previewFacts(state) }] : [];
  });

  return {
    ...bannerBase(),
    heading: previewBanner.tilePageHeading,
    emptyNote: previewBanner.tilePageNothingPending,
    rows: [
      ...(tileState.isDraft
        ? [{ title: previewBanner.tileOwnRow, facts: previewFacts(tileState) }]
        : []),
      ...documents,
    ],
    incomplete: incompleteBlock([...routeProblems, ...incomplete]),
  };
}

export interface AreaIndexPreviewProps {
  section: IndexedSection;
  searchParams: SearchParams;
}

/**
 * A section's preview index — where the admin panel's Live Preview button on
 * any tile or document of the section sends the reviewer (docs/api-contracts.md
 * §6.1). The link's `pt` never reaches it: `src/proxy.ts` hands it to
 * `app/api/preview/route.ts`, which exchanges it and redirects here without it.
 */
export async function AreaIndexPreview({ section, searchParams }: AreaIndexPreviewProps) {
  const { name, liveLink } = sectionNames(section);

  const notice = noticeMessage(searchParams, name);
  if (notice !== null) return <PreviewMessage {...notice} liveLink={liveLink} />;

  const token = await previewSessionToken();
  if (token === null) return <PreviewMessage {...previewMessages.noSession} liveLink={liveLink} />;

  const read = await getContentRepository().getInvestorTilesPreview(section, token);
  if (!read.ok) return <PreviewMessage {...refusalMessage(read, name)} liveLink={liveLink} />;

  const { tiles, incomplete } = routablePreviewTiles(section, read.value);
  return (
    <>
      <PreviewBanner {...indexBanner(read.value.records, incomplete)} />
      <AreaIndex section={section} pages={areaPages(section, tiles)} />
    </>
  );
}

export interface TilePagePreviewProps {
  section: IndexedSection;
  slug: string;
}

/**
 * One tile's preview page, reached from the section's preview index: the
 * tile and every document in its most recent state, under the headings of
 * its most recent outline — empty headings and the unheaded group included,
 * as on live — with the side list of the section's tiles, all inside the
 * preview. A slug the session's section does not have is a 404, as on live;
 * a tile too incomplete to draw says what it lacks.
 */
export async function TilePagePreview({ section, slug }: TilePagePreviewProps) {
  const { name, liveLink } = sectionNames(section);

  const token = await previewSessionToken();
  if (token === null) return <PreviewMessage {...previewMessages.noSession} liveLink={liveLink} />;

  const repository = getContentRepository();
  const [read, listing] = await Promise.all([
    repository.getInvestorTilePagePreview(section, slug, token),
    repository.getInvestorTilesPreview(section, token),
  ]);
  if (!read.ok) return <PreviewMessage {...refusalMessage(read, name)} liveLink={liveLink} />;
  if (!listing.ok) return <PreviewMessage {...refusalMessage(listing, name)} liveLink={liveLink} />;
  if (read.value === null) notFound();
  if (!read.value.complete) {
    return <PreviewMessage {...incompleteMessage(read.value.record)} liveLink={liveLink} />;
  }

  const { record, preview } = read.value.value;
  const { tiles } = routablePreviewTiles(section, listing.value);
  const currentPath = previewTilePath(section, record.page.tile.slug);
  const routeProblems = routablePreviewTiles(section, {
    records: [{ record: record.page.tile, preview }],
    incomplete: [],
  }).incomplete;

  return (
    <>
      <PreviewBanner {...tilePageBanner(record, preview, routeProblems)} />
      <TilePage
        page={record.page}
        nav={areaNavFor(section, tiles, currentPath)}
        gateActions={PREVIEW_GATE_ACTIONS}
        exitHref={documentsPreviewPage(section).root}
      />
    </>
  );
}

const NOTIFICATIONS = INVESTOR_AREAS.notifications;

/**
 * Notifications' preview — the section's one tile, `notifications`, as its
 * page, with the section's other tiles listed only so that one the site
 * cannot show is named in the banner rather than unseen, as live logs it.
 */
export async function NotificationsPreview({ searchParams }: { searchParams: SearchParams }) {
  const { name, liveLink } = sectionNames(NOTIFICATIONS.section);

  const notice = noticeMessage(searchParams, name);
  if (notice !== null) return <PreviewMessage {...notice} liveLink={liveLink} />;

  const token = await previewSessionToken();
  if (token === null) return <PreviewMessage {...previewMessages.noSession} liveLink={liveLink} />;

  const repository = getContentRepository();
  const [read, listing] = await Promise.all([
    repository.getInvestorTilePagePreview(NOTIFICATIONS.section, NOTIFICATIONS.sectionTile, token),
    repository.getInvestorTilesPreview(NOTIFICATIONS.section, token),
  ]);
  if (!read.ok) return <PreviewMessage {...refusalMessage(read, name)} liveLink={liveLink} />;
  if (!listing.ok) return <PreviewMessage {...refusalMessage(listing, name)} liveLink={liveLink} />;
  if (read.value !== null && !read.value.complete) {
    return <PreviewMessage {...incompleteMessage(read.value.record)} liveLink={liveLink} />;
  }

  const { incomplete } = routablePreviewTiles(NOTIFICATIONS.section, listing.value);
  const banner =
    read.value === null
      ? indexBanner(listing.value.records, incomplete)
      : tilePageBanner(read.value.value.record, read.value.value.preview, incomplete);

  return (
    <>
      <PreviewBanner {...banner} />
      <NotificationsPageBody
        tilePage={read.value === null ? null : read.value.value.record.page}
        gateActions={PREVIEW_GATE_ACTIONS}
        exitHref={documentsPreviewPage(NOTIFICATIONS.section).root}
      />
    </>
  );
}
