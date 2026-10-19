'use client';

import type { ReactNode } from 'react';
import type { ConsentCopy } from '@/components/ui/consent-actions';
import { ConsentGate } from '@/components/ui/consent-gate';
import { VideoPlayer, type VideoPlayerSource } from '@/components/ui/video-player';

export interface GatedVideoProps {
  /** The video's accessible name. */
  title: string;
  /** Passed through to the player verbatim. */
  fallback?: string;
  copy: ConsentCopy;
  /** Server-rendered notice text. */
  notice: ReactNode;
  /** Where "I Do Not Confirm" goes. */
  exitHref: string;
  /**
   * The key `reveal` is called with — the listing whose video this is. A
   * plain string, validated by the action, rather than a bound argument:
   * nothing is encrypted into the page, so no key has to be shared across
   * server instances.
   */
  revealKey: string;
  /**
   * A Server Action. Resolves the video's sources for `revealKey`, or `null`.
   * Called only on "I Confirm".
   */
  reveal: (key: string) => Promise<VideoPlayerSource | null>;
}

/**
 * A disclosure video behind a consent notice — the DRHP audio-visual pages.
 *
 * The page renders this with the notice and a Server Action; the video's URL,
 * its poster and its captions are fetched by that action on "I Confirm" and
 * exist nowhere in the page before then. `<ConsentGate>` owns the behaviour;
 * this only says what to reveal and how to show it.
 */
export function GatedVideo({
  title,
  fallback,
  copy,
  notice,
  exitHref,
  revealKey,
  reveal,
}: GatedVideoProps) {
  return (
    <ConsentGate
      heading={copy.heading}
      notice={notice}
      confirmLabel={copy.confirmLabel}
      declineLabel={copy.declineLabel}
      exitHref={exitHref}
      errorMessage={copy.errorMessage}
      reveal={() => reveal(revealKey)}
    >
      {(source) => <VideoPlayer {...source} title={title} fallback={fallback} />}
    </ConsentGate>
  );
}
