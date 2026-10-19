import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/** One caption track, as `<track>` needs it. */
export interface VideoCaption {
  src: string;
  /** BCP 47 — `en`, `hi`. */
  srcLang: string;
  label: string;
}

/** Everything the player needs to play one file. */
export interface VideoPlayerSource {
  src: string;
  /** MIME type of `src`, e.g. `video/mp4`. */
  type: string;
  /** Still shown before playback, or `null`. */
  poster: string | null;
  captions: readonly VideoCaption[];
}

export interface VideoPlayerProps
  extends VideoPlayerSource, Omit<ComponentPropsWithRef<'video'>, 'src' | 'poster' | 'children'> {
  /** The video's accessible name — it has no visible title of its own. */
  title: string;
  /**
   * Text for a browser that cannot play `<video>`. Content, not chrome: the
   * legacy page carries a sentence here, and it is passed through verbatim.
   */
  fallback?: string;
}

/**
 * A video the reader plays themselves — native controls, no autoplay.
 *
 * **Not `<VideoFrame>`.** That primitive is a silent, looping, decorative
 * backdrop that starts on its own. This is its opposite: content with a
 * soundtrack, which for disclosure material in particular must not start
 * until the reader chooses to start it. `preload="metadata"` fetches enough
 * to show the duration and nothing more — these files are over 100 MB.
 *
 * `playsInline` keeps iOS from forcing full screen on play; the native
 * full-screen control is still there for anyone who wants it.
 *
 * **Captions.** Each track becomes a `<track kind="captions">`, the first one
 * `default`. The files live in blob storage, which is another origin, and a
 * browser only loads a cross-origin track for a `<video crossorigin>` —
 * which in turn fails the *video* outright if the container sends no CORS
 * headers. So `crossOrigin` is set only when there is a track to load. The
 * container needs a CORS rule for the site's origin before the first caption
 * file goes up; docs/asset-inventory.md §9.
 *
 * The box is 16:9, which is what both disclosure videos and their posters
 * are, reserved before a byte arrives so nothing shifts as it loads.
 */
export function VideoPlayer({
  src,
  type,
  poster,
  captions,
  title,
  fallback,
  className,
  ...props
}: VideoPlayerProps) {
  return (
    <video
      controls
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
      aria-label={title}
      crossOrigin={captions.length > 0 ? 'anonymous' : undefined}
      className={cn('aspect-video w-full bg-surface-deep focus-visible:outline-white', className)}
      {...props}
    >
      <source src={src} type={type} />
      {captions.map((track, index) => (
        <track
          key={track.src}
          kind="captions"
          src={track.src}
          srcLang={track.srcLang}
          label={track.label}
          default={index === 0}
        />
      ))}
      {fallback}
    </video>
  );
}
