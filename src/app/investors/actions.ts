'use server';

import type { VideoPlayerSource } from '@/components/ui/video-player';
import { getContentRepository, type InvestorSection, type InvestorTilePage } from '@/lib/content';
import { allDocuments, documentUrl } from './_lib/documents';
import { parseDocumentKey, parseTileKey } from './_lib/gate-keys';

/**
 * The investor area's Server Actions — how a consent gate gets the URL it
 * guards, after the reader has confirmed and not before.
 *
 * **Why an action rather than a prop.** Anything a Server Component passes to
 * a client component is serialised into the page — the HTML and the RSC
 * payload both. A gated URL passed as a prop would be in the page source
 * before anyone confirmed anything, which is precisely what the legacy DRHP
 * page did with its inline script. An action runs on the click and returns
 * only then.
 *
 * **Not access control, and not pretending to be.** An action is a POST
 * endpoint that anyone can call, and the backend sends the document URLs in
 * the same response as the disclaimer (docs/api-contracts.md §4.4). What
 * this guarantees is narrower and is the requirement: nothing gated is in
 * the page until the reader confirms.
 *
 * Every input is untrusted — the page supplies it, but anything can POST.
 * A key names a section, a tile and (for a document) its id; it is parsed
 * (`_lib/gate-keys.ts`), and resolved **only against a tile whose `gate` the backend has switched
 * on**. Anything else resolves `null` rather than reaching further, so an
 * action cannot be pointed at a tile it was not written for. Returns carry
 * only what the gate renders.
 *
 * No closures and no bound arguments, so nothing is encrypted into the page:
 * the PM2 instances need no shared `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.
 * A deploy does rotate action IDs, so a tab left open across one gets a
 * rejection here; the gates catch it and ask for a refresh.
 */

/** The tile's page, if the tile exists and is gated; `null` otherwise. */
async function gatedTile(section: InvestorSection, slug: string): Promise<InvestorTilePage | null> {
  const page = await getContentRepository().getInvestorTilePage(section, slug);
  return page?.tile.gate.enabled === true ? page : null;
}

/**
 * The URL of one gated document — or `null` if the key is not a document on
 * a gated tile, the document has nothing to open, or the repository failed.
 */
export async function revealGatedDocument(key: string): Promise<string | null> {
  const parsed = parseDocumentKey(key);
  if (parsed === null) return null;
  const { section, slug, documentId } = parsed;

  try {
    const page = await gatedTile(section, slug);
    const document =
      page === null ? undefined : allDocuments(page).find((d) => d.id === documentId);
    return document === undefined ? null : documentUrl(document);
  } catch (error) {
    console.error('[investors] revealGatedDocument failed.', error);
    return null;
  }
}

/**
 * The sources of the recording on one gated tile — or `null` if the tile is
 * not gated, has no hosted recording, or the repository failed. The backend
 * has no poster or caption tracks (docs/api-contracts.md §9), so neither is
 * returned.
 */
export async function revealGatedVideo(key: string): Promise<VideoPlayerSource | null> {
  const parsed = parseTileKey(key);
  if (parsed === null) return null;
  const { section, slug } = parsed;

  try {
    const page = await gatedTile(section, slug);
    const file =
      page === null ? null : (allDocuments(page).find((d) => d.file !== null)?.file ?? null);
    return file === null
      ? null
      : { src: file.url, type: file.mimeType, poster: null, captions: [] };
  } catch (error) {
    console.error('[investors] revealGatedVideo failed.', error);
    return null;
  }
}
