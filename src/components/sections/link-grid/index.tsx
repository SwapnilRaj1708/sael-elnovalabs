import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { GlowFrame } from '@/components/ui/glow-frame';
import { cn } from '@/lib/utils/cn';

export interface LinkGridItem {
  /** The link text, verbatim. */
  name: string;
  /** Root-relative, trailing slash included. */
  href: string;
  /** A decorative mark — the page supplies it, since a mark is a node. */
  mark?: ReactNode;
}

export interface LinkGridProps {
  /** Names the list for assistive technology — the area, e.g. "Offer Documents". */
  label: string;
  items: readonly LinkGridItem[];
  /**
   * Centre a short last row instead of hanging it left: one per row below
   * `sm`, two to `xl`, three above — so five tiles fall as 2 + 2 + 1 and
   * 3 + 2, never four over a lone one. For a count the four-column grid does
   * not divide; Financials & Reports has five. Off by default, so eight
   * tiles keep their 4 × 2.
   */
  balance?: boolean;
}

/**
 * An area's index: a tile per page, each one a link.
 *
 * The legacy Offer Documents index is exactly this — an icon and a title per
 * sub-page, three to a row — and the Financials & Reports index will be the
 * same shape, which is why it is a section and not markup in a page.
 *
 * **Columns come from breakpoints, not from `auto-fit`**: one below `sm`,
 * two to `xl`, four above. Eight tiles then fall as 8, 4 × 2 and 2 × 4 — never
 * a row of three over a row of two — which `auto-fit` cannot promise across
 * the widths in between.
 *
 * **Each tile is an outlined `<Card>` in a `<GlowFrame>`** — the React Bits
 * border glow the Careers panel carries, at the client's request of
 * 2026-09-29, in the same heading-ramp colours. Unlike the Careers panel it
 * does not sweep round on arrival (`intro={false}`): the border lights under
 * the pointer as it nears an edge, and all the way round when the tile's
 * link has keyboard focus — which is the tile's focus indicator: the link
 * draws no outline of its own, and the tile takes one only in forced-colours
 * mode, where the light is stripped. It replaced the hairline card's accent bar and
 * the Aceternity dotted glow the tiles had until then; `hoverEffect={false}`
 * keeps the outlined card's own hover gradient off too, so there is one light
 * per tile, not two. Tuned `strength="strong"` — lighting nearer the centre,
 * sooner and brighter — and lifted 5% on hover or focus, the client's asks
 * of 2026-09-29, as is the Careers panel's rising glow on every tile's
 * ground. The corner is --radius-card rather than the outlined
 * card's 40px, which on a tile a phone draws 90px tall is half a pill — and
 * the frame is told the same radius so its ring sits on the card's border.
 *
 * On a touch screen there is no hover, so no light; the tile is a plain
 * outlined link, which is what it needs to be there.
 *
 * The link's hit area is stretched over the whole card with a pseudo-element
 * rather than by wrapping the card in the link, so the accessible name is
 * the title and nothing else. The mark is decorative; the title says where
 * the link goes. There is no trailing arrow — the client took it off on
 * 2026-09-29 — so the lit frame and the pointer cursor are what say "link".
 *
 * Below `sm` a tile is a row — mark beside title — so eight of them do not
 * stack into a thousand pixels of phone; from `sm` it stands up, mark over
 * title.
 *
 * A `<ul>` with `aria-label`: a screen reader hears "Offer Documents, list,
 * 8 items", which is the right summary of the page.
 *
 * A Server Component; `<GlowFrame>` is the client leaf, for the pointer.
 */
export function LinkGrid({ label, items, balance = false }: LinkGridProps) {
  return (
    <ul
      aria-label={label}
      className={cn(
        'gap-x-gap-grid gap-y-stack sm:gap-y-flow',
        balance
          ? 'flex flex-wrap justify-center'
          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
      )}
    >
      {items.map((item) => (
        <li
          key={item.href}
          className={cn(
            'flex',
            balance &&
              'w-full flex-none sm:w-auto sm:basis-(--link-grid-basis-2) xl:basis-(--link-grid-basis-3)',
          )}
        >
          <GlowFrame
            intro={false}
            radius="card"
            strength="strong"
            // A 5% lift under the pointer or keyboard focus — the frame, not
            // the card, so the light grows with it. `hover:` only fires where a
            // pointer can hover, and neither moves under reduced motion.
            className={cn(
              'flex w-full transition-transform duration-(--duration-card)',
              'motion-safe:hover:scale-(--scale-tile-hover) motion-safe:has-focus-visible:scale-(--scale-tile-hover)',
            )}
          >
            <Card
              shape="outlined"
              ground="dark"
              inset="none"
              hoverEffect={false}
              // The lit frame is the tile's focus indicator (see below). In
              // forced-colours mode the frame's shadows and masks are dropped,
              // so there the tile takes a real outline instead, in the
              // system's own focus colour.
              // The Careers "Looking for your dream job?" panel's glow — brand
              // purple rising from the top edge — the client's ask of
              // 2026-09-29, so the tiles read as lit rather than as outlines.
              className="h-full rounded-(--radius-card) bg-(image:--gradient-panel-glow) forced-colors:has-focus-visible:outline-2 forced-colors:has-focus-visible:outline-offset-2"
            >
              <div className="flex w-full items-center gap-stack sm:flex-col sm:items-start">
                {item.mark !== undefined && (
                  <span aria-hidden="true" className="flex-none text-brand-red-bright">
                    {item.mark}
                  </span>
                )}

                <Link
                  href={item.href}
                  // Stretched over the card — `<Card>` is the positioned
                  // ancestor — so the mark and the padding are part of the target.
                  // No outline of its own: it would box the title inside a
                  // tile whose whole frame is already lit by this focus.
                  className="flex-1 text-h3 text-pretty text-white before:absolute before:inset-0 focus-visible:outline-none"
                >
                  {item.name}
                </Link>
              </div>
            </Card>
          </GlowFrame>
        </li>
      ))}
    </ul>
  );
}
