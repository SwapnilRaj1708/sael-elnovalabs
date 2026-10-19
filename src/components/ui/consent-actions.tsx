import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * A gate's own words. Every one is verbatim from the page's content file —
 * the button labels because the notice quotes them, the heading because the
 * legacy dialog carries it — except `closeLabel` and `errorMessage`, which
 * the legacy site has no equivalent for and which are functional copy.
 */
export interface ConsentCopy {
  /** "Disclaimer". */
  heading: string;
  confirmLabel: string;
  declineLabel: string;
  /** Accessible name of the dialog's × button. Unused by the in-page gate. */
  closeLabel: string;
  /** Shown when the guarded content could not be fetched after confirming. */
  errorMessage: string;
}

/**
 * What declining does. The two legacy gates differ here, and which one a
 * page gets is a compliance decision recorded in its content file, never a
 * default this component picks.
 */
export type ConsentDecline =
  /** Leave for another page — the DRHP audio-visual pages' behaviour. */
  | { kind: 'exit'; href: string }
  /** Dismiss the notice and stay — the DRHP document's behaviour. */
  | { kind: 'dismiss'; onDismiss: () => void };

export interface ConsentActionsProps {
  /** "I Confirm", verbatim — the notice text names the button by its label. */
  confirmLabel: string;
  /** "I Do Not Confirm", verbatim, for the same reason. */
  declineLabel: string;
  onConfirm: () => void;
  decline: ConsentDecline;
  /** True while the gated content is being fetched after confirmation. */
  pending?: boolean;
  /** Shown above the buttons, announced, when that fetch failed. */
  error?: string | null;
  className?: string;
}

/**
 * The two buttons under a consent notice, and the failure message above them.
 *
 * **The labels are not styled uppercase**, unlike every other `<Button>`.
 * The notice they sit under tells the reader to press "the button marked
 * “I Confirm”", so the label is quoted text and its capitalisation is the
 * source's; `normal-case` undoes the primitive's default.
 *
 * **Decline, then confirm**, in DOM order and on screen — the legacy order,
 * left to right. Below `sm` they stack full width in the same order: two
 * labels this long do not fit side by side at 360px without wrapping, and a
 * reversed stack would put focus order and reading order at odds.
 *
 * Exiting is a real link, so "I Do Not Confirm" works before hydration and
 * without script at all; dismissing is a button, since there is nowhere to
 * go. Confirming always needs script — it fetches what the notice guards.
 *
 * While pending, confirm is `aria-disabled` rather than `disabled`: a
 * disabled button drops focus to `<body>`, and inside a modal that strands a
 * keyboard user. The click is ignored instead.
 *
 * No `'use client'`: it holds no state, and it is only ever rendered by the
 * two client gates, which bring it into the client graph themselves.
 */
export function ConsentActions({
  confirmLabel,
  declineLabel,
  onConfirm,
  decline,
  pending = false,
  error = null,
  className,
}: ConsentActionsProps) {
  // Full width while stacked, natural width once they sit side by side.
  const width = 'sm:w-fit';

  return (
    <div className={cn('flex flex-col gap-tight', className)}>
      {error !== null && (
        <p role="alert" className="text-body-sm text-brand-red-bright">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-tight sm:flex-row sm:justify-end">
        {decline.kind === 'exit' ? (
          <Button
            href={decline.href}
            variant="onDark"
            size="sm"
            fullWidth
            className={cn('normal-case', width)}
          >
            {declineLabel}
          </Button>
        ) : (
          <Button
            variant="onDark"
            size="sm"
            fullWidth
            className={cn('normal-case', width)}
            onClick={decline.onDismiss}
          >
            {declineLabel}
          </Button>
        )}

        <Button
          size="sm"
          fullWidth
          // The primary's ring is the global brand blue, 1.84:1 on this
          // black ground; white is the dark surfaces' own override.
          className={cn('normal-case focus-visible:outline-white', width)}
          aria-disabled={pending || undefined}
          aria-busy={pending || undefined}
          onClick={() => {
            if (!pending) onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
