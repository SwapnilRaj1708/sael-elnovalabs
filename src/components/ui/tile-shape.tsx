import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The chamfered business-tile surface — a rectangle with its bottom-right
 * corner cut away.
 *
 * **Built, no current consumer — retained for future surfaces.** *(Ruled
 * 2026-08-26.)* The v2 homepage replaced the business tiles with ledger rows
 * and `ui/card.tsx` no longer wraps this (**C-1**), so nothing on the site
 * renders it and only `/dev/design-system` still shows it. It is kept
 * deliberately, on the same reasoning as `ui/date-badge.tsx`: this is a
 * correctly-built primitive **between consumers**, not dead code. The chamfer
 * is a distinctive SAEL form that a later page may well want, and the hard part
 * — getting it to survive `clip-path` without an SVG — is already solved here.
 *
 * `--drop-shadow-tile`, `--drop-shadow-tile-hover` and `--lift-card` are
 * **retained-dormant** alongside it. See docs/design-reconciliation.md §5, and
 * note the distinction drawn there: those tokens describe a form that still
 * exists and is merely unused, not a surface the client cancelled.
 *
 * **Drawn in CSS. Do not import `rtile-*.svg`.** Those files are a single path
 * with `preserveAspectRatio="none"`, so stretching one to a tall mobile tile
 * turns its corner radii into ellipses, and its `fill` is hardcoded where a
 * token belongs. docs/asset-inventory.md §4.
 *
 * Known limitation, called out in that document: `clip-path` and
 * `border-radius` do not compose on every engine. Where they do not, the
 * corners render square and the chamfer still reads correctly — an acceptable
 * degradation, and the reason the radius is applied rather than baked into the
 * polygon. The final call belongs to the FE-04 design review.
 */
export type TileShapeProps = ComponentPropsWithRef<'div'>;

export function TileShape({ className, children, ...props }: TileShapeProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-tile-surface',
        '[clip-path:polygon(0_0,100%_0,100%_calc(100%-var(--tile-chamfer)),calc(100%-var(--tile-chamfer))_100%,0_100%)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
