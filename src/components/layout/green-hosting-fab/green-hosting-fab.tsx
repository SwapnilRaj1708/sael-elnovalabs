import Image from 'next/image';
import type { GreenHostingBadge } from '@/lib/content/static/green-hosting';

export interface GreenHostingFabProps {
  badge: GreenHostingBadge;
}

/**
 * The Green Web Foundation's green-hosting badge, fixed to the bottom-left of
 * every page: the social FAB's counterpart in the other corner. Added
 * 2026-10-26 at the client's request; mounted once, in the root layout.
 *
 * **Sized to stay out of the way on a phone**, as the social column is. It
 * is `--spacing-fab-badge` wide — 70px on a phone, growing to 140px at 1920 —
 * and the height follows the artwork's ratio. It stands off the corner by
 * `--spacing-fab-badge-offset`, 85% of the social column's
 * `--spacing-fab-offset`, which it leaves alone.
 *
 * **Not a link, and not a target.** Green Web's snippet is the image alone, so
 * this is too, and `pointer-events-none` passes a tap through to whatever the
 * badge is covering — the hero's copy on a phone, a footer link at the end of
 * the page. Nothing here is focusable.
 *
 * **Served by Green Web, not by us** (`unoptimized`). The badge is their
 * live check, and its URL answers with a redirect to a freshly signed image,
 * which the browser follows. Through the image optimiser our server would fetch
 * it, cache it, and need a remote pattern for a host we do not control.
 *
 * It rises in with the social discs (`anim-fab-in`), wears their shadow, and
 * sits on their layer (`--z-fab`), so the mega menu and the mobile drawer
 * cover it. Under a reduced-motion preference it is simply there.
 *
 * A Server Component: nothing here needs script.
 */
export function GreenHostingFab({ badge }: GreenHostingFabProps) {
  return (
    <Image
      src={badge.src}
      alt={badge.alt}
      width={badge.width}
      height={badge.height}
      unoptimized
      className="anim-fab-in pointer-events-none fixed bottom-fab-badge-offset left-fab-badge-offset z-(--z-fab) h-auto w-fab-badge shadow-fab-item print:hidden"
    />
  );
}
