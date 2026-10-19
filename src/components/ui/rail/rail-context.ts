'use client';

import { createContext, useContext, type RefObject } from 'react';

/**
 * What a rail knows about itself, shared between the parts that render it.
 *
 * The rail is split into three components — a provider, the track, and the
 * arrows — because `SAEL Home v2` sets the arrows in the section's heading
 * row rather than over the artwork, and a single component cannot render one
 * of its own parts into a sibling's layout. Splitting them lets each section
 * place the pair exactly where its design puts it, without either one owning
 * the other's markup.
 *
 * Everything here is client state. The cards themselves stay server-rendered:
 * they are passed through `<Rail>` as children, so making the arrows
 * interactive costs the bundle the arrows and nothing else.
 */
export interface RailState {
  /** Attached by `<RailTrack>`; read by the provider to scroll and measure. */
  trackRef: RefObject<HTMLUListElement | null>;
  /** Scrolled fully left. The previous arrow is spent. */
  atStart: boolean;
  /** Scrolled fully right. The next arrow is spent. */
  atEnd: boolean;
  /** Move by exactly one card, in either direction. */
  page: (direction: 1 | -1) => void;
  /** Re-read the scroll position. The track calls this on every scroll. */
  measure: () => void;
}

const RailContext = createContext<RailState | null>(null);

export const RailContextProvider = RailContext.Provider;

/**
 * Read the enclosing rail.
 *
 * Throws rather than returning null: a track or an arrow outside a `<Rail>`
 * is a wiring mistake, and the alternative is a control that silently does
 * nothing when clicked.
 */
export function useRail(): RailState {
  const rail = useContext(RailContext);
  if (rail === null) {
    throw new Error('useRail must be used inside a <Rail>.');
  }
  return rail;
}
