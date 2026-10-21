'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Set on a pin while a tap holds it open. The pin and callout read `group-data-open:`. */
const OPEN_ATTR = 'data-open';

/** Marks a pin, so a tap can find its neighbours. Set in `MapPin`'s markup. */
const PIN_ATTR = 'data-map-pin';

/** The one pin open by touch, if any. There is never more than one. */
let openPin: HTMLElement | null = null;
let listening = false;

function open(pin: HTMLElement | null): void {
  if (openPin === pin) return;
  openPin?.removeAttribute(OPEN_ATTR);
  openPin = pin;
  pin?.setAttribute(OPEN_ATTR, '');
}

/**
 * One pair of document listeners for every pin, as `<TouchLight>` has for
 * the cards. A touch anywhere but a pin closes the open one, including the
 * start of a scroll. A touch on a pin is left to that pin's click, which may
 * hand it to a neighbour (see `nearestPin`). Escape closes it too.
 */
function listenForTouchesElsewhere(): void {
  if (listening) return;
  listening = true;
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (openPin === null) return;
      if (event.target instanceof Element && event.target.closest(`[${PIN_ATTR}]`)) return;
      open(null);
    },
    { passive: true },
  );
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') open(null);
  });
}

/**
 * The pin on this map whose point is nearest the tap.
 *
 * Every pin's control is `--spacing-touch` square, but the map is only about
 * 350px wide on a phone, so where sites are close the squares overlap. The
 * later one in the DOM paints on top and takes the tap. Punjab's square, for
 * one, lies under Haryana's, so a tap on Punjab's dot used to land on Haryana.
 * Measuring from each pin's point gives the tap to the dot it was aimed at.
 */
function nearestPin(tapped: HTMLElement, x: number, y: number): HTMLElement {
  const pins = tapped.parentElement?.querySelectorAll<HTMLElement>(`:scope > [${PIN_ATTR}]`) ?? [];
  let nearest = tapped;
  let best = Infinity;
  for (const pin of pins) {
    // A pin's box is 0 × 0, sitting on its point.
    const { left, top } = pin.getBoundingClientRect();
    const distance = Math.hypot(left - x, top - y);
    if (distance < best) {
      best = distance;
      nearest = pin;
    }
  }
  return nearest;
}

export interface MapPinProps {
  /** Places the pin on the map — its `left` / `top`, and its ping's stagger. */
  style: CSSProperties;
  /**
   * The pin is an `<a>`. A tap then opens the callout first and follows the
   * link only on the second, as a pointer's hover-then-click would.
   */
  link: boolean;
  /** The pin's control and its callout, which read `group-data-open:`. */
  children: ReactNode;
}

/**
 * One pin on `<PresenceMapFigure>`: the `group` its control and callout sit
 * in, plus the one state CSS cannot reach on a phone, *tapped open*.
 *
 * **Why this exists.** The callout opens on `group-hover` and
 * `group-focus-within`, and on an iPhone neither ever happens. Tailwind v4
 * scopes `hover:` to `@media (hover: hover)`, which a touch screen does not
 * match. And iOS Safari, unlike Chrome, does not focus a `<button>` or an
 * `<a>` when it is tapped. Android only ever worked because Chrome does.
 *
 * So a tap sets `data-open`, which the callout and the pin read beside their
 * hover and focus rules. A touch anywhere off the map's pins closes it, as
 * does Escape, and opening one pin closes the last. It is the same contract
 * as the cards' `<TouchLight>`, which this cannot reuse for two reasons. A
 * link pin has to hold back its navigation on the first tap, or the tap
 * opens a new tab before the callout has shown what is at the pin. And a tap
 * goes to the nearest pin rather than to whichever control is on top — see
 * `nearestPin`.
 *
 * Touch and pen only. A mouse has real hover, and a keyboard has focus, and
 * CSS already handles both of those.
 */
export function MapPin({ style, link, children }: MapPinProps) {
  const pin = useRef<HTMLDivElement>(null);
  // Set on `pointerdown` and read by the `click` that follows it. A click
  // from the keyboard has no pointer, so it leaves this false.
  const tapped = useRef(false);

  useEffect(() => {
    const element = pin.current;
    listenForTouchesElsewhere();
    return () => {
      if (openPin === element) open(null);
    };
  }, []);

  return (
    <div
      ref={pin}
      data-map-pin=""
      className="group absolute size-0"
      style={style}
      onPointerDown={(event) => {
        tapped.current = event.pointerType !== 'mouse';
      }}
      onClick={(event) => {
        if (!tapped.current) return;
        tapped.current = false;

        const target = nearestPin(event.currentTarget, event.clientX, event.clientY);
        const wasOpen = target.hasAttribute(OPEN_ATTR);

        if (target === event.currentTarget) {
          if (link && !wasOpen) event.preventDefault();
        } else {
          // The finger landed on this pin's control but nearer another's
          // point. This pin's link is not the one meant, and on Android the
          // tap has focused this control, which would open its callout
          // beside the right one.
          event.preventDefault();
          const focused = document.activeElement;
          if (focused instanceof HTMLElement && event.currentTarget.contains(focused)) {
            focused.blur();
          }
          // A second tap on an open link pin follows its link. Its own click
          // handler ignores this one, which has no pointer.
          if (wasOpen) target.querySelector('a')?.click();
        }

        open(target);
      }}
    >
      {children}
    </div>
  );
}
