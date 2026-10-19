'use client';

import type { StaticImageData } from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { MediaFrame } from '@/components/ui/media-frame';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils/cn';

export interface VideoFrameProps {
  /** Absolute URL of the file. `null` when the blob host is unconfigured. */
  src: string | null;
  /**
   * The still shown before the first frame arrives, and *instead of* the
   * video for anyone who has asked for reduced motion. `null` holds the box
   * as a plain placeholder, as `<MediaFrame>` does.
   */
  poster: StaticImageData | null;
  /** Describes the poster. The video itself is decorative — see below. */
  posterAlt: string;
  /** `sizes` for the poster image. */
  sizes: string;
  /** The asset's name in docs/asset-inventory.md, for the pending placeholder. */
  pending?: string;
  className?: string;
}

/**
 * A silent, looping, background video that holds the same box whether or
 * not it plays.
 *
 * **Decorative by contract.** This is for a moving backdrop under copy — the
 * Solar Energy, Waste-to-Energy, Module Manufacturing and Contact Us heroes —
 * not for a video that *is* the content.
 * It has no controls and no captions track, and it is `aria-hidden`,
 * because everything it would say is said by the heading and standfirst
 * laid over it. A video that carries meaning needs controls and a
 * transcript, and is a different component. An asset with speech in it does
 * not belong here at all: `muted` would silence what it has to say.
 *
 * **Reduced motion gets the poster, not a paused video.** `autoPlay` cannot
 * be gated by a media query in markup, so the choice is made here: the
 * still is rendered on the server and for anyone who prefers reduced motion,
 * and the `<video>` replaces it only once the client knows the preference
 * allows movement. /CLAUDE.md §5.
 *
 * **The poster is what paints; the video arrives behind it.** Three things
 * keep a multi-megabyte file off the critical path (2026-09-22):
 *
 *  - The `<video>` is never in the server HTML. It mounts after hydration,
 *    so the poster — a `priority` `next/image` — is the largest contentful
 *    paint and the file is not competing with the page's own assets for the
 *    first bytes.
 *  - It is drawn at zero opacity until the browser reports it is actually
 *    `playing`, then fades in over `--duration-media-fade`. Until then the
 *    poster shows through. This also covers a browser that refuses to
 *    autoplay at all — iOS in Low Power Mode, a data-saver setting — where
 *    the old build showed a frozen first frame or a black box, and this one
 *    shows the poster indefinitely, which is the correct still.
 *  - It pauses when scrolled out of view and resumes when scrolled back,
 *    so a hero that is off screen is not decoding 1080p frames nobody sees.
 *
 * `muted` is what lets a browser autoplay at all; `playsInline` keeps iOS
 * from taking it full screen; `preload="metadata"` fetches enough to size
 * and start, not the whole file up front. Picture-in-picture and remote
 * playback are switched off because a decorative loop has no business in
 * either.
 */
export function VideoFrame({ src, poster, posterAlt, sizes, pending, className }: VideoFrameProps) {
  const reducedMotion = useReducedMotion();
  const mounted = !reducedMotion && src !== null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null || !mounted || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // A rejected play() is the browser declining to autoplay. The
            // poster is already showing, so there is nothing to recover.
            video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      // Any part of the frame on screen counts: a hero half scrolled past
      // is still visibly moving along its top edge.
      { threshold: 0 },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
    };
  }, [mounted]);

  return (
    <div className={cn('relative overflow-hidden bg-surface-deep', className)}>
      <MediaFrame
        image={poster}
        alt={posterAlt}
        sizes={sizes}
        priority
        pending={pending}
        className="absolute inset-0"
      />
      {mounted && (
        <video
          ref={videoRef}
          src={src}
          poster={poster?.src}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => {
            setPlaying(true);
          }}
          className={cn(
            'absolute inset-0 size-full object-cover',
            'transition-opacity duration-(--duration-media-fade) ease-out',
            playing ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}
