'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SOCIAL_ICONS } from '@/components/icons/social';
import { isNavItemActive, NAV_ITEMS } from '@/components/layout/header/nav-config';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SOCIAL_LINKS } from '@/lib/content/static/footer';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { cn } from '@/lib/utils/cn';

/**
 * The navigation below lg.
 *
 * **New design — the prototype has no mobile nav at all.** Built to
 * `docs/features/03-app-shell-header-footer.md` §2 for design to review as a
 * working page rather than a description.
 *
 * The panel is opaque `--color-surface`, not a translucent scrim: the content
 * behind is photography and dense type, and reading a nav through it is
 * unpleasant. It unmounts when closed, so nothing inside can hold focus while
 * invisible.
 *
 * **The panel portals to `<body>`.** It used to render in place, inside
 * `<header>`, which worked only because nothing on the header carried a
 * transform: a `transform` or `translate` other than `none` makes an element
 * a containing block for `position: fixed` descendants, and `fixed inset-0`
 * would then resolve against the 68px bar instead of the viewport — the panel
 * would be a sliver across the top. The bar now translates below `lg` to slide
 * itself out of the way on scroll (see header-shell.tsx), so the drawer is
 * moved out of its subtree rather than left depending on the bar never moving.
 * It is the same trap header.tsx describes for `backdrop-filter`.
 *
 * Accessibility here is not negotiable — focus trapped while open, `Esc`
 * closes, focus returns to the hamburger, `aria-expanded` on the trigger,
 * `role="dialog"` and `aria-modal` on the panel, body scroll locked without
 * the scrollbar's disappearance shifting the page.
 */

/** Everything focusable, in DOM order, excluding anything disabled. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useLockBodyScroll(open);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // Navigating closes the drawer. Without this it stays open over the page the
  // user just asked for.
  //
  // Adjusted during render, not in an effect: the drawer is a full-screen
  // overlay, so closing it a frame late means the new page is briefly hidden
  // behind it. React re-runs this component before painting.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Focus moves into the drawer on open and back to the hamburger on close.
  // Returning focus matters more than it looks: without it, focus falls back
  // to <body> and the next Tab starts from the top of the document.
  //
  // **Only on a close — never on mount.** The effect also runs on the first
  // render, with `open` false and focus on <body> as it always is on a fresh
  // load, and it used to take that for a close: every page load focused the
  // hamburger. With no pointer interaction yet, the browser counts that as
  // keyboard focus, so a phone showed the ring until the first tap elsewhere.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    // Only reclaim focus if it is not already somewhere deliberate — a route
    // change moves focus itself.
    if (document.activeElement === document.body) triggerRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (panel === null) return;

      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (first === undefined || last === undefined) return;

      // The trap: wrap at both ends rather than letting focus escape to the
      // page behind, which the user cannot see.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        ref={triggerRef}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open main navigation"
        onClick={() => {
          setOpen(true);
        }}
        className="inline-flex size-touch cursor-pointer items-center justify-center text-nav-link"
      >
        <Menu className="size-6" aria-hidden="true" focusable="false" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className={cn(
              // Sits above the header's z-100.
              'fixed inset-0 z-(--z-drawer) flex flex-col overflow-y-auto bg-surface',
              // The trigger's `lg:hidden` wrapper is no longer an ancestor, so
              // the panel carries the breakpoint itself. Without it, opening the
              // drawer and then widening the window past `lg` would leave it
              // covering the desktop layout.
              'lg:hidden',
              'pb-section-y',
              // The slide is decoration on an already-open panel, so under
              // reduced motion it simply appears. See styles/animations.css.
              'anim-drawer-in',
            )}
          >
            {/* The gutter comes from Container, never from this component —
              the drawer's left edge has to line up with the page behind it. */}
            <Container className="flex flex-1 flex-col">
              <div className="flex h-header shrink-0 items-center justify-end">
                <button
                  type="button"
                  ref={closeRef}
                  onClick={() => {
                    close();
                    triggerRef.current?.focus();
                  }}
                  aria-label="Close main navigation"
                  className="-mr-2 inline-flex size-touch cursor-pointer items-center justify-center text-nav-link"
                >
                  <X className="size-6" aria-hidden="true" focusable="false" />
                </button>
              </div>

              <nav aria-label="Main" className="flex-1">
                <Accordion>
                  {NAV_ITEMS.map((item) => {
                    const active = isNavItemActive(item, pathname);
                    const children = item.children ?? [];

                    if (children.length === 0 && item.href !== undefined) {
                      return (
                        <div key={item.label} className="border-b border-border">
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex min-h-touch items-center py-4 text-h3',
                              // The current page in the brand gradient, white,
                              // as the desktop menu has it (client, 2026-10-13):
                              // the gradient runs to the column's edges and the
                              // label steps in, as a section's current row
                              // does below.
                              active ? 'bg-(image:--gradient-nav-cta) px-4 text-white' : 'text-ink',
                            )}
                          >
                            {item.label}
                          </Link>
                        </div>
                      );
                    }

                    return (
                      <AccordionItem
                        key={item.label}
                        value={item.label}
                        headingAs="none"
                        title={
                          <span className={cn(active && 'text-accent-hover')}>{item.label}</span>
                        }
                      >
                        <ul className="flex list-none flex-col">
                          {children.map((child) =>
                            child.href === undefined ? null : (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  aria-current={
                                    isNavItemActive(child, pathname) ? 'page' : undefined
                                  }
                                  className={cn(
                                    'flex min-h-touch items-center py-2 pl-4 text-body',
                                    // The current page in the brand
                                    // gradient, as above.
                                    isNavItemActive(child, pathname)
                                      ? 'bg-(image:--gradient-nav-cta) text-white'
                                      : 'text-body-base hover:text-accent-hover',
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ),
                          )}
                        </ul>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </nav>

              <div className="mt-flow flex flex-col gap-flow">
                <Button href="/contact-us/" fullWidth>
                  Contact Us
                </Button>

                {/* Renders nothing until the client supplies the profile URLs —
                see lib/content/static/footer.ts. */}
                {SOCIAL_LINKS.length > 0 && (
                  <ul className="flex list-none items-center justify-center gap-4">
                    {SOCIAL_LINKS.map((social) => {
                      const Icon = SOCIAL_ICONS[social.platform];
                      return (
                        <li key={social.platform}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'rounded-pill bg-surface-alt text-footer-icon',
                              'inline-flex size-touch items-center justify-center',
                              'transition-colors duration-(--duration-micro) hover:text-accent-hover',
                            )}
                          >
                            <Icon className="size-5" />
                            <span className="sr-only">{social.label} — opens in a new tab</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </Container>
          </div>,
          document.body,
        )}
    </div>
  );
}
