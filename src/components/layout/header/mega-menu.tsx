'use client';

import { Play } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, RefObject } from 'react';
import { isNavItemActive, type NavItem } from '@/components/layout/header/nav-config';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

export interface MegaMenuProps {
  id: string;
  items: readonly NavItem[];
  open: boolean;
  /** The column under the pointer, or focused. Highlighted; the rest are not. */
  activeLabel: string | null;
  onClose: () => void;
  /** The pointer is over a column — hold the menu open. */
  onPointerOverContent: () => void;
  /**
   * The pointer is over the panel's own background. The menu is still open and
   * still usable; the caller starts an idle countdown rather than closing now.
   */
  onPointerOverBackground: () => void;
  onPointerLeave: () => void;
  /** The first link of the active column, so the keyboard can be sent there. */
  firstLinkRef: RefObject<HTMLAnchorElement | null>;
}

/**
 * The masthead's menu: one full-screen panel, not a dropdown per item.
 *
 * Every top-level section is a column and all of them are on screen at once,
 * so the whole site is visible in one gesture. Pointing at a nav link opens
 * the panel and lights that section's column; moving along the bar moves the
 * highlight without the panel ever closing and reopening.
 *
 * ---------------------------------------------------------------------------
 * **It stays mounted and goes `inert` when closed**, rather than unmounting.
 * A transition needs something to run on, and a panel that appears in the DOM
 * at the moment it should already be animating gets no transition at all — it
 * simply pops. `inert` is what makes that safe: closed, the panel takes no
 * focus, no clicks and no screen-reader cursor, so leaving it mounted costs
 * nothing in behaviour. It is also why `aria-hidden` is not used here; the two
 * together are redundant, and `aria-hidden` over focusable children is exactly
 * the combination that produces an unreachable-but-announced menu.
 *
 * Resting the pointer on the panel's background rather than on a column
 * closes the menu after a beat. Leaving the panel closes it quickly; sitting
 * in the empty space closes it slowly. Both are "you are finished with this",
 * arrived at differently. See `IDLE_CLOSE_MS` in desktop-nav.tsx.
 *
 * The columns are staggered in CSS off `--mm-index`, not by JavaScript timers,
 * so an interrupted open reverses cleanly instead of leaving half the columns
 * mid-flight.
 *
 * **The page you are on is marked** in the brand gradient — the masthead
 * button's own, `--gradient-nav-cta` — white on it, with
 * `aria-current="page"`. The client's call
 * of 2026-10-13, so the panel says where you are as well as where you can go.
 * It takes neither the lit column's wash nor its inset change: it is already
 * marked.
 *
 * Each row's cue is a small play mark (client, 2026-10-13; it was a `→`) in
 * the lit column's own plum, softened (`--color-mega-cue`). It slides in on
 * the lit column and under the pointer, and stays on the current page, where
 * it is white.
 *
 * Below `lg` this never renders: the drawer covers that width, and two
 * navigations answering the same links is two things to keep in step.
 */
export function MegaMenu({
  id,
  items,
  open,
  activeLabel,
  onClose,
  onPointerOverContent,
  onPointerOverBackground,
  onPointerLeave,
  firstLinkRef,
}: MegaMenuProps) {
  const pathname = usePathname();

  return (
    <div
      id={id}
      data-mega={open ? 'open' : 'closed'}
      inert={!open}
      // `pointerover` and not `pointerenter`: enter fires once, on the way in,
      // and cannot tell that the pointer has since drifted off a column into
      // the space around it. Over fires on every element the pointer moves
      // onto, which is exactly the transition that has to be noticed.
      onPointerOver={(event) => {
        const onColumn =
          event.target instanceof Element && event.target.closest('[data-mega-col]') !== null;
        if (onColumn) onPointerOverContent();
        else onPointerOverBackground();
      }}
      onPointerLeave={onPointerLeave}
      // Clicking the panel's own background — the padding around the columns —
      // closes it. `currentTarget` so a click that lands on a column does not.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'fixed inset-0 -z-10 hidden overflow-y-auto lg:block',
        'bg-(image:--gradient-mega)',
        'supports-[backdrop-filter]:backdrop-blur-mega',
        'supports-[backdrop-filter]:backdrop-saturate-(--saturate-glass)',
        'transition-opacity duration-(--duration-mega) motion-reduce:transition-none',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {/* Cleared past the bar, so the panel opens from under it rather than
          over it — the bar stays legible and stays operable while it is open. */}
      <Container className="pt-[calc(var(--spacing-header)+var(--spacing-flow))] pb-flow">
        <nav aria-label="All sections" className="grid gap-8 lg:grid-cols-3 xl:grid-cols-6">
          {items.map((item, index) => {
            const hot = item.label === activeLabel;
            // A section with no children is still a column — it is one of the
            // site's top-level places, and leaving it out of a panel that claims
            // to show everything would be the one gap in the map.
            const links = item.children ?? [item];

            return (
              <div
                key={item.label}
                data-mega-col
                style={{ '--mm-index': index } as CSSProperties & Record<string, number>}
                className="anim-mega-col"
              >
                <p
                  className={cn(
                    'border-mega-head-rule mb-5 flex items-baseline gap-2 border-b pb-3.5',
                    'text-mega-head',
                  )}
                >
                  <span aria-hidden="true" className="text-badge opacity-50">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(hot ? 'bg-(image:--gradient-nav-cta) gradient-text' : 'text-ink')}
                  >
                    {item.label}
                  </span>
                </p>

                <ul className="list-none">
                  {links.map((link, linkIndex) => {
                    const current = isNavItemActive(link, pathname);

                    return (
                      <li key={link.label}>
                        <Link
                          ref={hot && linkIndex === 0 ? firstLinkRef : undefined}
                          href={link.href ?? '/'}
                          onClick={onClose}
                          aria-current={current ? 'page' : undefined}
                          {...(link.external === true ? { rel: 'noopener noreferrer' } : {})}
                          className={cn(
                            'group/mm-row border-mega-rule flex items-center justify-between gap-2.5',
                            'border-b py-2.5 text-body-sm',
                            'transition-[color,background-color,padding,border-color] duration-(--duration-micro)',
                            'motion-reduce:transition-none',
                            current
                              ? 'bg-(image:--gradient-nav-cta) px-3.5 text-white'
                              : [
                                  'text-body-base hover:border-nav-accent/50 hover:pl-3 hover:text-ink',
                                  'focus-visible:pl-3',
                                  // The lit column pulls in and washes without
                                  // needing a pointer on the link itself, so the
                                  // whole section reads as selected rather than
                                  // one row of it.
                                  hot && [
                                    'border-nav-accent/40 bg-(image:--gradient-mega-hot) pl-3.5 text-ink',
                                  ],
                                ],
                          )}
                        >
                          <span>{link.label}</span>
                          <Play
                            aria-hidden="true"
                            focusable="false"
                            className={cn(
                              'size-3 shrink-0 fill-current',
                              'transition-[opacity,translate] duration-(--duration-micro)',
                              'motion-reduce:transition-none',
                              current
                                ? 'translate-x-0 text-white opacity-100'
                                : [
                                    'text-mega-cue',
                                    hot
                                      ? 'translate-x-0 opacity-100'
                                      : [
                                          '-translate-x-2 opacity-0',
                                          'group-hover/mm-row:translate-x-0 group-hover/mm-row:opacity-100',
                                          'group-focus-visible/mm-row:translate-x-0 group-focus-visible/mm-row:opacity-100',
                                        ],
                                  ],
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </Container>

      <p className="pb-flow text-center text-badge tracking-strapline text-body-soft uppercase">
        Sustainable &amp; Affordable Energy for Life
      </p>
    </div>
  );
}
