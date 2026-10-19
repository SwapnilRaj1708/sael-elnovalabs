'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ConsentActions } from '@/components/ui/consent-actions';

export interface ConsentGateProps<T> {
  /** The notice's title — "Disclaimer" on the legacy site. Rendered as `<h2>`. */
  heading: string;
  /** The notice itself, server-rendered and passed through. */
  notice: ReactNode;
  confirmLabel: string;
  declineLabel: string;
  /** Where "I Do Not Confirm" goes. An in-page notice has nothing to dismiss. */
  exitHref: string;
  /**
   * Fetches what the notice guards. Called only on "I Confirm", and resolves
   * `null` on any failure — including a rejected Server Action, which is
   * caught here — so the gate can say so and offer the button again.
   */
  reveal: () => Promise<T | null>;
  /** Shown, and announced, when `reveal` resolves `null`. */
  errorMessage: string;
  /** Renders what `reveal` returned. Only ever called after confirmation. */
  children: (value: T) => ReactNode;
}

type GateState<T> =
  { status: 'notice'; error: boolean } | { status: 'pending' } | { status: 'revealed'; value: T };

/**
 * A consent notice that stands in the page where the content it guards will
 * be, and is replaced by that content once the reader confirms.
 *
 * **The guarded content does not exist until then** — not hidden, not in the
 * HTML, not in the RSC payload. Nothing about it reaches the browser before
 * "I Confirm": `reveal` is a Server Action the page passes down, it runs on
 * the click, and only its result is rendered. The notice, by contrast, is
 * ordinary server-rendered text: a crawler indexes it and a reader without
 * script can read it.
 *
 * **In the page rather than a modal on load**, which is what the legacy
 * audio-visual pages draw. The behaviour is theirs exactly — confirm to see
 * the video, decline to be sent to the Offer Documents index, and asked again
 * on every visit — but a twelve-paragraph notice reads far better at the
 * page's own measure than in a box over it, and there is no focus to trap, so
 * there is nothing for a screen reader to get stuck in. The difference is
 * presentation, not what it takes to reach the video.
 *
 * **The buttons ride along the bottom of the screen** while the notice is on
 * it (`sticky`), so on a phone they are never a long scroll away, and they
 * come to rest under the last paragraph. They are not pinned there before the
 * reader has seen any of it: the bar sticks only once the notice is in view.
 *
 * **Consent is not remembered.** Nothing is stored — not a cookie, not
 * `sessionStorage`. The legacy site asks on every page load and so does
 * this; whether it ever should remember is a compliance decision, and it is
 * not this component's to make.
 *
 * On confirmation focus moves to the first focusable thing revealed — the
 * video, for the audio-visual pages — rather than falling to `<body>` when
 * the button that held it unmounts.
 *
 * Generic over what it reveals, and so it takes a render function; it can
 * therefore only be used from another client component — `ui/gated-video`
 * is the one there is.
 */
export function ConsentGate<T>({
  heading,
  notice,
  confirmLabel,
  declineLabel,
  exitHref,
  reveal,
  errorMessage,
  children,
}: ConsentGateProps<T>) {
  const [state, setState] = useState<GateState<T>>({ status: 'notice', error: false });
  const revealedRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  async function confirm() {
    setState({ status: 'pending' });

    let value: T | null = null;
    try {
      value = await reveal();
    } catch {
      // A network failure, or a Server Action ID that a deploy has rotated
      // out from under an open tab — either way, the reader gets the message
      // and the button again. A reload fixes the second.
      value = null;
    }

    setState(value === null ? { status: 'notice', error: true } : { status: 'revealed', value });
  }

  useEffect(() => {
    if (state.status !== 'revealed') return;

    const container = revealedRef.current;
    const target =
      container?.querySelector<HTMLElement>(
        'video, audio, a[href], button, [tabindex]:not([tabindex="-1"])',
      ) ?? container;
    target?.focus();
  }, [state.status]);

  if (state.status === 'revealed') {
    return (
      <div ref={revealedRef} tabIndex={-1} className="outline-none">
        {children(state.value)}
      </div>
    );
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-stack">
      <h2 id={headingId} className="text-h3 text-white">
        {heading}
      </h2>

      {notice}

      <ConsentActions
        confirmLabel={confirmLabel}
        declineLabel={declineLabel}
        onConfirm={() => void confirm()}
        decline={{ kind: 'exit', href: exitHref }}
        pending={state.status === 'pending'}
        error={state.status === 'notice' && state.error ? errorMessage : null}
        // Sticks to the viewport's foot while the notice scrolls past, and
        // settles under it at the end. The ground is the section's own, so
        // text passing beneath is covered rather than showing through.
        className="sticky bottom-0 z-10 border-t border-hairline-dark bg-surface-black pt-inset pb-[max(var(--spacing-inset),env(safe-area-inset-bottom))]"
      />
    </section>
  );
}
