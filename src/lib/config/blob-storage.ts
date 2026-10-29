/**
 * The Azure Blob containers the site reads from, by name.
 *
 * **One variable, two containers.** `AZURE_BLOB_BASE_URL` is the storage
 * account — `https://<account>.blob.core.windows.net`, or Azurite's
 * `http://127.0.0.1:10000/devstoreaccount1` — and every URL is that account,
 * then one of these containers, then the path the data carries. The names are
 * the same in every environment, so they are constants here rather than more
 * configuration. Until 2026-10-29 the variable named a container itself, and
 * a second container would have needed a second variable.
 *
 * No imports, so `lib/config/env.ts` can check a value against these names
 * and the unit test can run without Next's path alias.
 */
export const BLOB_CONTAINERS = {
  /**
   * The site's own files: the artwork and documents its pages name by path,
   * under `web-assets/`. Composed by `blobUrl()` and `tryBlobUrl()`.
   */
  site: 'sael-website',
  /**
   * The backend's public media: what the admin panel publishes, and Module
   * Manufacturing's datasheets under `documents/module-manufacturing/`.
   * Composed by `tryMediaUrl()`.
   */
  media: 'sael-media-public',
} as const;

export type BlobContainer = keyof typeof BLOB_CONTAINERS;

/**
 * `<account>/<container>/<path>`, with exactly one slash at each join however
 * the account and the path were written.
 */
export function composeBlobUrl(account: string, container: BlobContainer, path: string): string {
  const base = account.replace(/\/+$/, '');
  return `${base}/${BLOB_CONTAINERS[container]}/${path.trim().replace(/^\/+/, '')}`;
}

/**
 * Whether a URL already ends in one of the containers — the format
 * `AZURE_BLOB_BASE_URL` had before 2026-10-29. Every URL composed on such a
 * value would name its container twice, and 404.
 */
export function endsInContainer(url: string): boolean {
  const last = new URL(url).pathname.replace(/\/+$/, '').split('/').pop() ?? '';
  return Object.values<string>(BLOB_CONTAINERS).includes(last);
}
