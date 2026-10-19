'use client';

import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';
import { cn } from '@/lib/utils/cn';

export interface MapEmbedProps {
  /** The map's embed URL — from the page's content file, never written in a component. */
  embedUrl: string;
  /** The same place in Google Maps itself — where "show" goes without JavaScript. */
  mapsUrl: string;
  /** The iframe's title: what the map shows. A screen reader announces it on entering. */
  title: string;
  /** The control that loads the map — "Show map". */
  loadLabel: string;
  /** Appended to the no-JavaScript link's name — "opens in a new tab". */
  newTabNote: string;
  /** The picture above the control until the map loads (`<MapBeacon>`). Decorative. */
  preview?: ReactNode;
  className?: string;
}

/**
 * A Google Map, loaded only when asked for — **a click-to-load facade**, as
 * the Newsroom's video cards are.
 *
 * The legacy page embeds the map outright, so every visitor loads Google
 * Maps' scripts and takes its cookies whether or not they look at the map.
 * Here the frame shows the site's own picture of the place and one control;
 * the iframe exists only once it is pressed, and only for that visitor.
 * `loading="lazy"` stays on it as a second line.
 *
 * **Just the frame.** What the map shows, how to get there and what loading
 * it does are words, and the page sets them beside it (`<ContactRow>`). The
 * frame is the form fields' — `--color-outline-dark` at `--radius-card` on
 * the page's own ground — so it reads as part of the same page as the form
 * above it. The same box before and after (`--aspect-map-embed`), so nothing
 * moves when the map arrives, and nothing is ever laid over the loaded map:
 * Google's controls and attribution sit at its corners and must stay
 * visible.
 *
 * **Without JavaScript** the control is a link to the place in Google Maps,
 * in a new tab — rendered so on the server and made a button once hydrated,
 * so it is never a button that does nothing.
 *
 * Loading the map moves focus into it, so a keyboard user who pressed the
 * button is where the map is rather than on a button that has gone.
 */
export function MapEmbed({
  embedUrl,
  mapsUrl,
  title,
  loadLabel,
  newTabNote,
  preview,
  className,
}: MapEmbedProps) {
  const hydrated = useHydrated();
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (loaded) frameRef.current?.focus();
  }, [loaded]);

  const icon = <MapPin className="size-4 shrink-0" aria-hidden="true" focusable="false" />;

  return (
    <div
      className={cn(
        'relative isolate aspect-map-embed w-full overflow-hidden rounded-card border border-outline-dark md:aspect-map-embed-md lg:aspect-map-embed-lg',
        className,
      )}
    >
      {loaded ? (
        <iframe
          ref={frameRef}
          src={embedUrl}
          title={title}
          loading="lazy"
          allowFullScreen
          // Google's embed needs no more than the origin, and gets no more.
          referrerPolicy="strict-origin-when-cross-origin"
          // Inset, because the box clips anything drawn outside it.
          className="absolute inset-0 size-full border-0 focus-visible:-outline-offset-2 focus-visible:outline-white"
        />
      ) : (
        <div className="grid size-full grid-rows-[minmax(0,1fr)_auto] justify-items-center gap-stack p-stack">
          <div className="flex h-full min-h-0 items-center justify-center">{preview}</div>

          {hydrated ? (
            <Button
              variant="onDark"
              size="sm"
              onClick={() => {
                setLoaded(true);
              }}
            >
              {icon}
              {loadLabel}
            </Button>
          ) : (
            <Button variant="onDark" size="sm" href={mapsUrl} target="_blank">
              {icon}
              {loadLabel}
              <span className="sr-only"> ({newTabNote})</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
