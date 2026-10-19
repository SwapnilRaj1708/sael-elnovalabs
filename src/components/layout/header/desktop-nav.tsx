'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { MegaMenu } from '@/components/layout/header/mega-menu';
import { isNavItemActive, NAV_CTA_LABEL, NAV_ITEMS } from '@/components/layout/header/nav-config';
import { cn } from '@/lib/utils/cn';

/**
 * The inline navigation at lg and above.
 *
 * A client component, which `docs/responsive-strategy.md` §6 asks to be
 * justified: it needs `usePathname()` for the active-route underline (a root
 * layout is not re-rendered on client navigation, so the path cannot come from
 * the server), and it owns hover-intent and keyboard state for the dropdowns.
 * It renders no content of its own — the nav data is a static import, so this
 * costs the bundle the interaction logic and nothing else.
 *
 * **One full-screen panel, not a dropdown per item.** Pointing at any link
 * opens {@link MegaMenu} with that section's column lit; moving along the bar
 * moves the highlight, and the panel never closes and reopens between
 * neighbours. That is the client's navbar design, and it is also why the
 * open/close state here is a single `activeLabel` rather than one flag per
 * item.
 *
 * Hover intent: open after 120ms, close after 200ms. The close delay is the
 * important one — without it, the pointer travelling diagonally from the bar
 * to the panel clips the gap and the menu shuts under the cursor.
 */

const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 200;

/**
 * How long the pointer may rest on the panel's own background before the menu
 * gives up and closes.
 *
 * Longer than the leave delay on purpose: leaving the panel is a decision, and
 * 200ms is only there to survive the diagonal travel between bar and columns.
 * Sitting in the empty space is not a decision, so it gets a beat to become
 * one before the menu takes it as "done here".
 */
const IDLE_CLOSE_MS = 1400;

export function DesktopNav() {
  const pathname = usePathname();
  const baseId = useId();
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  /** Set when the keyboard opened the panel, so focus moves but hover does not steal it. */
  const focusOnOpen = useRef(false);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(
    (label: string) => {
      clearTimer();
      timer.current = setTimeout(() => {
        setOpenLabel(label);
      }, OPEN_DELAY_MS);
    },
    [clearTimer],
  );

  const scheduleClose = useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => {
      setOpenLabel(null);
    }, CLOSE_DELAY_MS);
  }, [clearTimer]);

  /** The pointer is on the panel but not on anything in it. */
  const scheduleIdleClose = useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => {
      setOpenLabel(null);
    }, IDLE_CLOSE_MS);
  }, [clearTimer]);

  const close = useCallback(
    (returnFocusTo?: string) => {
      clearTimer();
      setOpenLabel(null);
      if (returnFocusTo !== undefined) triggerRefs.current.get(returnFocusTo)?.focus();
    },
    [clearTimer],
  );

  // A navigation should never leave a menu hanging open over the new page.
  //
  // Adjusted during render rather than in an effect: React re-runs this
  // component before touching the DOM, so the menu is never painted open on
  // the new route. An effect would close it one frame late, which is a visible
  // flash. https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpenLabel(null);
  }

  // Cancelling the pending timer is a side effect, so it stays in an effect —
  // otherwise a hover that started just before the click would reopen the
  // menu on the page the user just navigated to.
  useEffect(() => {
    clearTimer();
  }, [pathname, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  // Move focus into the panel only when the keyboard opened it.
  useEffect(() => {
    if (openLabel !== null && focusOnOpen.current) {
      focusOnOpen.current = false;
      firstLinkRef.current?.focus();
    }
  }, [openLabel]);

  const menuId = `${baseId}-mega`;
  const open = openLabel !== null;

  return (
    <>
      <nav
        aria-label="Main"
        className="hidden flex-1 justify-center lg:flex"
        onPointerLeave={scheduleClose}
      >
        {/* The design's own gap, which closes to 4px on a narrow laptop — see
            --spacing-nav-gap. With the pills gone the gap is the only thing
            separating two labels, so it can no longer be a token-free `gap-1`. */}
        <ul className="flex list-none items-center gap-nav-gap">
          {NAV_ITEMS.filter((item) => item.label !== NAV_CTA_LABEL).map((item) => {
            const active = isNavItemActive(item, pathname);
            const isOpen = openLabel === item.label;

            // No pill. `SAEL Home v2` sets these six as bare tracked labels
            // on the bar's own ground — nothing but the type and a colour
            // change — and the client's 2026-08-26 note is to copy that middle
            // section across. So the tinted box and its radius are gone, along
            // with `--color-nav-pill` and `--radius-nav-pill`, which nothing
            // else used.
            //
            // What is kept from this build is the light palette (the bar stays
            // light — the client's 2026-08-25 call) and the current item's
            // marker. The design has no current-page state at all, which is
            // fine for a prototype and not for a site: the rule is what tells a
            // reader which of the six they are inside. It survives the pill
            // because it was never attached to it — it is inset from the
            // link's own box, so it sits under the label either way.
            //
            // `min-h-touch` also stays, and is now invisible: with no
            // background to draw it, the 44px hit area costs nothing visually
            // and the design's 33px would have been the only thing lost.
            //
            // The current section looks exactly as a hovered one does — the
            // accent and the gradient rule — which is the client's call of
            // 2026-10-13, after an inverted ink pill was tried and dropped.
            const linkClasses = cn(
              'text-nav-item text-nav-link relative inline-flex items-center gap-1 uppercase',
              'min-h-touch px-2',
              'transition-colors duration-(--duration-micro)',
              'hover:text-nav-accent',
              (active || isOpen) && [
                'text-nav-accent',
                'after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5',
                'after:rounded-pill after:bg-(image:--gradient-nav-cta) after:content-[""]',
              ],
            );

            // Every top-level item opens the panel on hover, including the two
            // that are pages in their own right — the design lights a column
            // for each of the six, and skipping two would leave gaps in the
            // bar. They stay real links, so a click still navigates.
            const shared = {
              onPointerEnter: () => {
                scheduleOpen(item.label);
              },
              'aria-expanded': isOpen,
              'aria-controls': open ? menuId : undefined,
            };

            if (item.href !== undefined) {
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={linkClasses}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => {
                      close();
                    }}
                    {...shared}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <button
                  type="button"
                  ref={(node) => {
                    triggerRefs.current.set(item.label, node);
                  }}
                  aria-haspopup="true"
                  className={cn(linkClasses, 'cursor-pointer')}
                  onClick={() => {
                    clearTimer();
                    setOpenLabel(isOpen ? null : item.label);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      close(item.label);
                      return;
                    }
                    if (event.key === 'ArrowDown' || (event.key === 'Enter' && !isOpen)) {
                      event.preventDefault();
                      clearTimer();
                      focusOnOpen.current = true;
                      setOpenLabel(item.label);
                    }
                  }}
                  {...shared}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        onKeyDown={(event) => {
          if (event.key === 'Escape') close(openLabel ?? undefined);
        }}
      >
        <MegaMenu
          id={menuId}
          items={NAV_ITEMS.filter((item) => item.label !== NAV_CTA_LABEL)}
          open={open}
          activeLabel={openLabel}
          onClose={() => {
            close();
          }}
          onPointerOverContent={clearTimer}
          onPointerOverBackground={scheduleIdleClose}
          onPointerLeave={scheduleClose}
          firstLinkRef={firstLinkRef}
        />
      </div>
    </>
  );
}
