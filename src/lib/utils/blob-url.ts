import { composeBlobUrl, type BlobContainer } from '@/lib/config/blob-storage';
import { env } from '@/lib/config/env';

/**
 * Compose an absolute URL for an asset in the site's own container,
 * `sael-website`.
 *
 * News images, investor PDFs and team photos all live in Blob Storage and the
 * backend refers to them by path. Concatenating the base at each call site is
 * how you end up with `//` in half the URLs and a missing slash in the other
 * half, so it happens exactly here. docs/asset-inventory.md §8.
 *
 * `AZURE_BLOB_BASE_URL` is the storage account; the container is added here,
 * from lib/config/blob-storage.ts. It is not a `NEXT_PUBLIC_` variable, so
 * this is server-only — which is fine, because every consumer composes its
 * URLs during server rendering.
 *
 * Values that are already absolute pass through untouched. That matters during
 * the mock-to-API cutover (FE-23): a fixture can carry a full URL and a real
 * API response can carry a bare path, and neither needs a special case.
 */
export function blobUrl(path: string): string {
  return containerUrl('site', path);
}

/** `blobUrl()` for any container: the one place a blob URL is put together. */
function containerUrl(container: BlobContainer, path: string): string {
  const trimmed = path.trim();

  if (trimmed === '') {
    throw new Error('A blob URL was asked for with an empty path.');
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const account = env.AZURE_BLOB_BASE_URL;

  if (account === undefined) {
    throw new Error(
      `Cannot resolve the blob path "${trimmed}": AZURE_BLOB_BASE_URL is not set. ` +
        'Add it to .env.local — see .env.example.',
    );
  }

  return composeBlobUrl(account, container, trimmed);
}

/**
 * The non-throwing form, for rendering a list where one item has a broken
 * asset reference. Returns `null` instead of taking the page down — a
 * malformed backend response degrades to an empty state. /CLAUDE.md §6.
 */
export function tryBlobUrl(path: string | null | undefined): string | null {
  if (path === null || path === undefined) return null;

  try {
    return blobUrl(path);
  } catch {
    return null;
  }
}

/**
 * `tryBlobUrl()` for the backend's public media container,
 * `sael-media-public` — on the same account, beside the site's container
 * rather than inside it. The module datasheets live there. Same rules: the
 * data carries the path, the account comes from `AZURE_BLOB_BASE_URL`, and an
 * unset account or an empty path gives `null` rather than a broken link.
 * docs/asset-inventory.md §8.
 */
export function tryMediaUrl(path: string): string | null {
  try {
    return containerUrl('media', path);
  } catch {
    return null;
  }
}

/**
 * An asset that is still on the legacy site and not yet in the container:
 * its legacy copy while `LEGACY_ASSET_BASE_URL` is set, its blob path
 * otherwise — `null` if neither can be composed.
 *
 * **The legacy branch is temporary**, the client's instruction of 2026-09-29
 * for the Offer Documents files, since used for the Newsroom's images and
 * Contact Us's hero video. The origin comes from the environment, not from a
 * call site (/CLAUDE.md §7). Unset the variable once the files are uploaded —
 * and before cutover at the latest, when that origin becomes this site and the
 * legacy paths stop existing — and every asset falls back to its blob path
 * with no code change.
 */
export function legacyOrBlobUrl(blobPath: string | null, legacyPath: string | null): string | null {
  const legacyBase = env.LEGACY_ASSET_BASE_URL;
  if (legacyBase !== undefined && legacyPath !== null) {
    return `${legacyBase.replace(/\/+$/, '')}${legacyPath}`;
  }
  return tryBlobUrl(blobPath);
}
