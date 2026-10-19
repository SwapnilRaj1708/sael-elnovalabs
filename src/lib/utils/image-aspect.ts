import type { CSSProperties } from 'react';
import type { StaticImageData } from 'next/image';

/**
 * The photograph's ratio as `--media-aspect`, a plain number, for a box that
 * takes it only at some widths — `aspect-(--media-aspect) lg:aspect-auto`.
 * Unlike an inline `aspect-ratio`, a utility can be switched off by a
 * breakpoint. `undefined` while the asset is pending.
 */
export function imageAspectVar(image: StaticImageData | null): CSSProperties | undefined {
  if (image === null) return undefined;
  return { '--media-aspect': image.width / image.height } as CSSProperties & Record<string, number>;
}

/**
 * The box of a photograph that arrives already cut to its shape: its own
 * ratio, so a frame drawn from it is never stretched or cropped. A runtime
 * value read off the asset, which is why it is an inline style and not a
 * token. `undefined` while the asset is pending, so the frame keeps the
 * aspect utility its caller gave it. Carries `--media-aspect` too.
 */
export function imageAspect(image: StaticImageData | null): CSSProperties | undefined {
  if (image === null) return undefined;
  return {
    aspectRatio: `${String(image.width)} / ${String(image.height)}`,
    ...imageAspectVar(image),
  };
}
