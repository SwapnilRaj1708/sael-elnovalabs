'use client';

import { Play } from 'lucide-react';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  NEWS_CARD_ACTION_VARIANT,
  newsCardAction,
  type NewsCardGround,
  type NewsCardLayout,
} from '@/components/ui/news-card-action';
import { useHydrated } from '@/hooks/use-hydrated';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { NewsVideo } from '@/lib/content';
import { vimeoEmbedUrl } from '@/lib/utils/vimeo';
import { youtubeEmbedUrl } from '@/lib/utils/youtube';

export interface VideoDialogProps {
  video: NewsVideo;
  /**
   * Where the action links before hydration — the video's own page, or the
   * file. Resolved on the server by the data layer (the card's `href`), so
   * this client module needs nothing from it but a type.
   */
  href: string;
  /** The video's title, verbatim — the dialog's name and the player's. */
  title: string;
  /** The visible action — "Watch Video". */
  label: string;
  /** The accessible name, which carries the title — "Watch video: …". */
  accessibleLabel: string;
  /** The close button's accessible name — "Close". */
  closeLabel: string;
  ground?: NewsCardGround;
  layout?: NewsCardLayout;
}

/**
 * The player for one video, mounted only while the dialog is open.
 *
 * YouTube and Vimeo are their providers' iframes. A file we host plays in
 * the browser's own `<video>`, with native controls — there is nothing to
 * embed and no third party to load.
 */
function Player({
  video,
  title,
  autoplay,
}: {
  video: NewsVideo;
  title: string;
  autoplay: boolean;
}) {
  switch (video.provider) {
    case 'youtube':
    case 'vimeo':
      return (
        <iframe
          src={
            video.provider === 'youtube'
              ? youtubeEmbedUrl(video.id, { autoplay })
              : vimeoEmbedUrl(video.id, { autoplay })
          }
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          // YouTube refuses to play an embed that sends no referrer.
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      );
    case 'hosted':
      return (
        <video
          src={video.fileUrl}
          title={title}
          controls
          autoPlay={autoplay}
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full"
        />
      );
  }
}

/**
 * A Multimedia card's action: the video, played in a dialog, loaded only
 * when asked for — from YouTube, from Vimeo, or from our own storage.
 *
 * **A click-to-load facade.** The card shows the item's artwork (for YouTube,
 * the video's own thumbnail where the item has none), served through
 * `next/image`, and no player. The player exists only while the dialog is
 * open, so a listing of thirteen videos loads no provider script and sets no
 * third-party cookie until a visitor presses play — and then only for that
 * one video, from `youtube-nocookie.com` or with Vimeo's `dnt`. Closing the
 * dialog unmounts the player, which is also what stops the sound.
 *
 * **A dialog rather than playing inline**, for three reasons. A card in a
 * three- or four-column grid is ~330px wide, which is a poor size to watch
 * anything at; the dialog plays at up to 1152px, and never taller than the
 * screen. Only one player can exist at a time, so two videos cannot play over
 * each other and nothing has to coordinate them. And a native `<dialog>`
 * opened with `showModal()` does the accessibility work correctly for free —
 * focus moves into it, it is trapped there, Escape closes it, and focus
 * returns to this button — which is why `<BioDisclosure>` uses one too. The
 * legacy site opened a lightbox, so this is also the behaviour returning
 * visitors expect.
 *
 * **Autoplay only because the visitor just pressed play**, and never under
 * `prefers-reduced-motion: reduce` — then the player loads paused and waits
 * for a second, deliberate press.
 *
 * **Without JavaScript** the action is a plain link to the video's own page
 * (or the file). It is rendered that way on the server and becomes a button
 * only once hydrated, so the card is never a button that does nothing.
 */
export function VideoDialog({
  video,
  href,
  title,
  label,
  accessibleLabel,
  closeLabel,
  ground = 'dark',
  layout = 'stack',
}: VideoDialogProps) {
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Opened from an effect rather than in the click handler, so the player is
  // already in the dialog when `showModal()` moves focus into it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog !== null && !dialog.open) dialog.showModal();
  }, [open]);

  /** A click on the dialog element itself came from the backdrop. */
  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  const actionClassName = newsCardAction({ layout });
  const variant = NEWS_CARD_ACTION_VARIANT[ground];
  const content = (
    <>
      <span className="sr-only">{accessibleLabel}</span>
      <span aria-hidden="true" className="inline-flex items-center gap-tight">
        {label}
        <Play
          className="size-4 shrink-0"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        />
      </span>
    </>
  );

  return (
    <>
      {hydrated ? (
        <Button
          variant={variant}
          size="micro"
          aria-haspopup="dialog"
          onClick={() => {
            setOpen(true);
          }}
          className={actionClassName}
        >
          {content}
        </Button>
      ) : (
        <Button href={href} variant={variant} size="micro" className={actionClassName}>
          {content}
        </Button>
      )}

      {hydrated && (
        <dialog
          ref={dialogRef}
          aria-labelledby={titleId}
          // Every way of closing — Escape, the button, the backdrop — ends
          // here, and unmounting the player is what stops playback.
          onClose={() => {
            setOpen(false);
          }}
          onClick={closeOnBackdrop}
          className="m-auto w-(--video-dialog-w) max-w-none overflow-visible border-0 bg-transparent p-0 text-white backdrop:bg-scrim-dialog"
        >
          <div className="flex flex-col gap-tight">
            <div className="flex items-center justify-between gap-stack">
              <p id={titleId} className="line-clamp-2 text-body-sm text-white">
                {title}
              </p>

              {/* First in the dialog, so it is where `showModal()` puts focus:
                  a keyboard user lands on the way out, and the player is one
                  Tab away. */}
              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => dialogRef.current?.close()}
                className="flex size-touch flex-none cursor-pointer items-center justify-center border border-hairline-grid bg-surface-black text-h3 leading-none text-body-on-dark transition-colors hover:text-white focus-visible:outline-white"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="relative aspect-video w-full bg-surface-black">
              {open && <Player video={video} title={title} autoplay={!reducedMotion} />}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
