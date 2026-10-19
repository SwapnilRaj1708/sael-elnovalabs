'use server';

import { previewSessionToken } from '@/app/_lib/preview';
import type { VideoPlayerSource } from '@/components/ui/video-player';
import { getContentRepository, type InvestorSection, type InvestorTilePage } from '@/lib/content';
import { allDocuments, documentUrl } from './_lib/documents';
import { parseDocumentKey, parseTileKey } from './_lib/gate-keys';

/**
 * The gate's Server Actions on a **Live Preview** tile page — `actions.ts`'s
 * twins, reading the tile through the reviewer's preview session instead of
 * from the live site. A draft document is not on the live tile at all, and a
 * draft gate's disclaimer is not the live one, so the live actions would
 * reveal nothing, or the wrong thing.
 *
 * **The gate is the same; only where the URL comes from differs.** The
 * reviewer sees the notice exactly as a visitor will, and the URL is kept out
 * of the page until "I Confirm", as on live: the disclaimer is part of what
 * they are approving, and a preview that skipped it would hide a mistake in
 * it.
 *
 * **The session is the preview cookie**, which the browser sends with the
 * action's POST because the action posts to the page's own URL, under the
 * cookie's `Path`. No session, a session the backend refuses, or a session
 * for another section resolves `null`, as does anything on a tile that is
 * not gated in its most recent state. Keys are parsed as on live
 * (`_lib/gate-keys.ts`). What is returned is a short-lived signed URL for a
 * draft file; it is used at once and never stored.
 */

/** The tile's preview page, if the reviewer has a session and the tile is gated; `null` otherwise. */
async function gatedPreviewTile(
  section: InvestorSection,
  slug: string,
): Promise<InvestorTilePage | null> {
  const token = await previewSessionToken();
  if (token === null) return null;

  const read = await getContentRepository().getInvestorTilePagePreview(section, slug, token);
  if (!read.ok || read.value?.complete !== true) return null;
  const { page } = read.value.value.record;
  return page.tile.gate.enabled ? page : null;
}

/** The URL of one gated document on a preview — `revealGatedDocument`'s twin. */
export async function revealPreviewGatedDocument(key: string): Promise<string | null> {
  const parsed = parseDocumentKey(key);
  if (parsed === null) return null;
  const { section, slug, documentId } = parsed;

  try {
    const page = await gatedPreviewTile(section, slug);
    const document =
      page === null ? undefined : allDocuments(page).find((d) => d.id === documentId);
    return document === undefined ? null : documentUrl(document);
  } catch (error) {
    console.error('[investors] revealPreviewGatedDocument failed.', error);
    return null;
  }
}

/** The recording on one gated tile on a preview — `revealGatedVideo`'s twin. */
export async function revealPreviewGatedVideo(key: string): Promise<VideoPlayerSource | null> {
  const parsed = parseTileKey(key);
  if (parsed === null) return null;
  const { section, slug } = parsed;

  try {
    const page = await gatedPreviewTile(section, slug);
    const file =
      page === null ? null : (allDocuments(page).find((d) => d.file !== null)?.file ?? null);
    return file === null
      ? null
      : { src: file.url, type: file.mimeType, poster: null, captions: [] };
  } catch (error) {
    console.error('[investors] revealPreviewGatedVideo failed.', error);
    return null;
  }
}
