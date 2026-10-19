'use client';

import { useEffect, useRef } from 'react';

/**
 * The attribute a tapped card carries while its hover light is on. The
 * layers read it as `group-data-touch-lit:`, and `<DottedGlowBackground>`
 * watches it to start and stop its canvas.
 */
export const TOUCH_LIT_ATTR = 'data-touch-lit';

/** The one card lit by touch, if any. There is never more than one. */
let litCard: HTMLElement | null = null;
let listening = false;

function light(card: HTMLElement | null): void {
  if (litCard === card) return;
  litCard?.removeAttribute(TOUCH_LIT_ATTR);
  litCard = card;
  card?.setAttribute(TOUCH_LIT_ATTR, '');
}

/**
 * One document listener for every card, not one per card: a touch that
 * lands anywhere outside the lit card — including the start of a scroll —
 * puts its light out.
 */
function listenForTouchesElsewhere(): void {
  if (listening) return;
  listening = true;
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType !== 'touch' || litCard === null) return;
      if (event.target instanceof Node && litCard.contains(event.target)) return;
      light(null);
    },
    { passive: true },
  );
}

/**
 * The card hover light on a touch screen, where there is no hover — part of
 * the Aceternity UI trial, client request of 2026-09-25. See ui/card.tsx.
 *
 * A tap lights the card; a second tap on it, a tap on another card, or a
 * touch anywhere else puts it out. It listens for `pointerup`, not
 * `pointerdown`: a finger that starts a scroll gets a `pointercancel`
 * instead, so swiping down a column of cards lights none of them. Mouse and
 * pen are ignored — they have real hover, which CSS already handles.
 *
 * Renders an empty, hidden span only so it can find the card it sits in;
 * `<Card>` places it as a direct child.
 */
export function TouchLight() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = anchor.current?.parentElement;
    if (!card) return;

    listenForTouchesElsewhere();

    const handleTap = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      light(litCard === card ? null : card);
    };

    card.addEventListener('pointerup', handleTap);
    return () => {
      card.removeEventListener('pointerup', handleTap);
      if (litCard === card) light(null);
    };
  }, []);

  return <span ref={anchor} hidden />;
}
