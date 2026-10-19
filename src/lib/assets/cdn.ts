import type { StaticImageData } from 'next/image';
import { tryBlobUrl } from '@/lib/utils/blob-url';

/**
 * Describe an image that lives in Azure Blob Storage so `next/image` can lay
 * it out without the bundler ever seeing the file.
 *
 * ## Why this exists
 *
 * A bundled `import` carries the intrinsic width and height the bundler
 * measured, and `next/image` needs both in order to reserve the right box and
 * avoid a layout shift. A bare URL string throws that away — which is why the
 * About Us artwork was committed to `src/assets/images/about-us/` while the
 * client's CDN was outstanding.
 *
 * The client uploaded that folder on 2026-09-17, so the files came out of the
 * repository. This closes the gap they left: the returned object is shaped
 * exactly like the `StaticImageData` an `import` produces, so every
 * `StaticImageData` prop downstream is untouched and cannot tell the
 * difference, but the bytes are fetched from the container at runtime rather
 * than bundled at build time. docs/asset-inventory.md §8.
 *
 * ## The dimensions are not guesswork
 *
 * `width` and `height` must be the asset's true intrinsic size, because that
 * is the ratio the browser reserves before a single byte arrives. Getting one
 * wrong is a layout shift that no test catches. The values passed at each call
 * site were read from the blobs themselves, not from the local copies that
 * preceded them — the two are not always byte-identical.
 *
 * ## No hostname enters the repository
 *
 * Only the *path* is passed here; the host comes from `AZURE_BLOB_BASE_URL` at
 * render time, via `blobUrl()`. That is /CLAUDE.md §7's "no hardcoded
 * hostnames", and it lets one call work against any environment's container.
 *
 * ## An unset container degrades, it does not crash
 *
 * `AZURE_BLOB_BASE_URL` is optional in `lib/config/env.ts`, so this returns
 * `null` rather than throwing when it is missing — the same bargain
 * `tryBlobUrl()` makes for the team roster. Every consumer of this helper
 * already accepts `null` and renders a placeholder that holds the same box, so
 * a misconfigured environment shows an unmistakably empty page rather than a
 * 500. See `ui/media-frame.tsx`.
 *
 * ## SVG
 *
 * Next's image optimizer refuses a remote SVG unless `dangerouslyAllowSVG` is
 * set, which it is not and should not be. A vector asset described here must
 * therefore be rendered with `unoptimized` — which is what the Next docs
 * recommend for vectors regardless, since there is nothing to optimise. See
 * `sections/cutout-split`.
 *
 * @param path Container-relative, e.g. `web-assets/media/about-us/cutout.png`.
 * @param width The asset's true intrinsic width, in pixels.
 * @param height The asset's true intrinsic height, in pixels.
 */
export function cdnImage(path: string, width: number, height: number): StaticImageData | null {
  const src = tryBlobUrl(path);

  if (src === null) return null;

  return { src, width, height };
}
