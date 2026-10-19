'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TeamTabsGroup {
  /** Stable, and used to build the `id`s that wire tab to panel. */
  id: string;
  /** The tab's visible label. */
  label: string;
  /** The panel's contents — **server rendered** and passed in as a node. */
  panel: ReactNode;
}

export interface TeamTabsProps {
  groups: readonly TeamTabsGroup[];
  /** Names the tab list for assistive technology, e.g. "Our Team". */
  label: string;
}

/**
 * The Leadership / Management switch.
 *
 * **A client component that renders almost nothing of its own.** Both panels
 * arrive as `ReactNode` props already rendered on the server — every card,
 * every portrait, every biography — and this owns only which of them is
 * `hidden`. That is the /CLAUDE.md §5 rule about putting `'use client'` at the
 * leaf, applied to a control that sits above the content it toggles: the
 * alternative, making the grid a client component so the tabs could own it,
 * would ship seventeen people's markup to the browser twice.
 *
 * Both panels stay mounted and the inactive one is `hidden`. Switching tabs is
 * then instant and the page's height does not jump, and — the reason that
 * matters beyond feel — a browser's find-in-page and a crawler both still see
 * the whole roster. `hidden` takes the inactive panel out of the accessibility
 * tree, so nothing is announced twice.
 *
 * Keyboard behaviour follows the APG tabs pattern, which is what the design
 * file implements too: a roving `tabIndex` so the group is one tab stop, arrow
 * keys to move between tabs, `Home`/`End` to jump to either end, and automatic
 * activation — the panel follows the focused tab rather than waiting for
 * `Enter`. Automatic activation is the right choice here because switching is
 * free; it is the wrong one when a panel has to be fetched.
 */
export function TeamTabs({ groups, label }: TeamTabsProps) {
  const [selected, setSelected] = useState(groups[0]?.id ?? '');
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = groups.findIndex((group) => group.id === selected);
    if (current === -1) return;

    let next = current;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % groups.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current - 1 + groups.length) % groups.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = groups.length - 1;
        break;
      default:
        return;
    }

    // `next` is always in range — every branch above is a modulo or a bound —
    // but `noUncheckedIndexedAccess` does not know that, and asserting would
    // be a worse trade than one guard.
    const target = groups[next];
    if (target === undefined) return;

    // Only now, so a key this pattern does not claim — Tab, or a character
    // that starts a find-in-page — still does what the browser intends.
    event.preventDefault();
    setSelected(target.id);
    // The roving tabIndex means the newly selected tab is the group's only tab
    // stop; focus has to follow it, or the next Tab press would leave from an
    // element that is no longer reachable.
    tabRefs.current.get(target.id)?.focus();
  }

  return (
    <div className="flex flex-col gap-flow">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-flow border-b border-hairline-grid"
      >
        {groups.map((group) => {
          const isSelected = group.id === selected;

          return (
            <button
              key={group.id}
              ref={(node) => {
                if (node === null) tabRefs.current.delete(group.id);
                else tabRefs.current.set(group.id, node);
              }}
              type="button"
              role="tab"
              id={`tab-${group.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${group.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                setSelected(group.id);
              }}
              className={cn(
                'relative min-h-touch cursor-pointer py-tight text-h3 transition-colors',
                // The global ring is --color-brand-blue, which is 1.84:1 on
                // --color-surface-black — under WCAG 1.4.11's 3.0 floor, and
                // so effectively invisible on this page's ground. White is
                // 19.9:1. The same override `<Button>`'s dark variant makes.
                'focus-visible:outline-white',
                isSelected ? 'text-white' : 'text-on-dark-soft hover:text-white',
              )}
            >
              {group.label}

              {/* The gradient rule under the active tab. Always painted and
                  faded rather than mounted and unmounted, so the transition
                  has something to run on, and `aria-hidden` because
                  `aria-selected` already carries which tab is current. */}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 -bottom-px h-rule-accent',
                  'bg-(image:--gradient-eyebrow-bright) transition-opacity',
                  'motion-reduce:transition-none',
                  isSelected ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
          );
        })}
      </div>

      {groups.map((group) => (
        <div
          key={group.id}
          role="tabpanel"
          id={`panel-${group.id}`}
          aria-labelledby={`tab-${group.id}`}
          hidden={group.id !== selected}
        >
          {/* The panel is named by its tab, but the cards inside it are
              `<h3>`s and a document should not step from `<h1>` to `<h3>`.
              This is the `<h2>` in between, visible only to assistive
              technology because the tab above already shows the word. */}
          <h2 className="sr-only">{group.label}</h2>
          {group.panel}
        </div>
      ))}
    </div>
  );
}
