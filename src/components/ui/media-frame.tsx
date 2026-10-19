import Image, { type StaticImageData } from 'next/image';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * An image slot that renders correctly whether or not the image exists yet.
 *
 * Most of the homepage's artwork has not been supplied — `src/assets/images/`
 * holds four navigation thumbnails and the logo, and nothing else.
 * docs/asset-inventory.md §9 lists what is outstanding. Rather than block the
 * whole component layer on a set of JPEGs, or invent substitutes for them, an
 * absent image renders as a neutral block that **holds the exact same box** as
 * the real one will.
 *
 * That distinction is the point. The frame is always laid out by its parent,
 * never by its content, so aspect ratio, reflow, the 360px overflow check and
 * cumulative layout shift are all genuinely exercised now, and binding the
 * real asset later is a one-line data change with no layout consequence.
 *
 * The placeholder is deliberately unmistakable rather than decorative — a flat
 * token colour, no shimmer, no icon. It should never read as a design choice
 * that someone might leave in. `data-pending` carries the asset's name from
 * docs/asset-inventory.md so it is identifiable in devtools without shipping
 * a visible label to users.
 *
 * Delete this primitive's placeholder branch once every asset has landed; the
 * `image` prop can then narrow from `StaticImageData | null` to
 * `StaticImageData` and TypeScript will find every call site that still cares.
 */
export interface MediaFrameProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** `null` until the asset is supplied. */
  image: StaticImageData | null;
  /** Meaningful description, or `''` when the image is decorative. */
  alt: string;
  /**
   * Required, with no default. An unset `sizes` on a fill image ships a
   * 1920px asset to a phone. docs/design-guidelines.md §6.
   */
  sizes: string;
  /** Above-the-fold only. Exactly one image per page should set this. */
  priority?: boolean;
  /** The asset's name in docs/asset-inventory.md, e.g. `hero/solar-modules`. */
  pending?: string;
  /** Classes for the `<img>` itself — object-position, a Ken Burns class. */
  imageClassName?: string;
}

export function MediaFrame({
  image,
  alt,
  sizes,
  priority = false,
  pending,
  imageClassName,
  className,
  ...props
}: MediaFrameProps) {
  return (
    <div className={cn('relative overflow-hidden bg-surface-deep', className)} {...props}>
      {image === null ? (
        <span
          // Decorative by definition: there is no image, so there is nothing
          // to describe. The `alt` the caller passed belongs to the asset that
          // will replace this, and announcing it now would describe a
          // photograph the user cannot see.
          aria-hidden="true"
          data-pending={pending}
          className="absolute inset-0 bg-inert/10"
        />
      ) : (
        <Image
          src={image}
          alt={alt}
          // A decorative image needs both halves. `alt=""` keeps it out of the
          // accessible name; `aria-hidden` keeps the node itself out of the
          // tree, so a screen reader cannot land on an empty graphic while
          // walking the section. docs/design-guidelines.md §6.
          aria-hidden={alt === '' ? true : undefined}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', imageClassName)}
        />
      )}
    </div>
  );
}
