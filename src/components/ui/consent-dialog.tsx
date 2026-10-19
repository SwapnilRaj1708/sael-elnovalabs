'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { ConsentActions, type ConsentDecline } from '@/components/ui/consent-actions';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { cn } from '@/lib/utils/cn';

export interface ConsentDialogProps {
  /** Controlled. The dialog opens and closes only through this. */
  open: boolean;
  /** The dialog's title — "Disclaimer" on the legacy site. */
  heading: string;
  /** Accessible name of the × button. It carries only a glyph. */
  closeLabel: string;
  /** The notice itself, server-rendered and passed through. */
  children: ReactNode;
  confirmLabel: string;
  declineLabel: string;
  onConfirm: () => void;
  /**
   * What "I Do Not Confirm", × and `Esc` do — all three, always the same.
   * The legacy site treats × exactly as it treats declining, on both of its
   * gates, and `Esc` is × for a keyboard.
   */
  decline: ConsentDecline;
  pending?: boolean;
  error?: string | null;
  /**
   * Where focus goes when the dialog closes — the control that opened it.
   * Without it, focus goes back to whatever was focused on opening, which a
   * mouse click in Safari (and any scripted open) leaves as `<body>`.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * A consent notice as a modal: the reader must confirm or decline before
 * whatever opened it goes ahead.
 *
 * Built for the DRHP, whose legacy page opens its disclaimer when the
 * document link is clicked and opens the PDF only on "I Confirm". It knows
 * nothing about documents — the caller decides what confirming does.
 *
 * **A native `<dialog>` with `showModal()`**, as the team biography dialog
 * is: the top layer makes the page behind it inert, focus stays inside, and
 * focus returns to the trigger on close. It is also returned to it
 * explicitly, through `returnFocusRef`: Safari does not focus a button on
 * click, so the browser's own restore would put a mouse user's focus on
 * `<body>`, and a confirmed document opens in another tab besides.
 *
 * **It is a real way out, not a trap.** × , "I Do Not Confirm" and `Esc` all
 * leave — dismissing, or navigating away, as `decline` says. `Esc` is caught
 * at `cancel` so it follows the same path rather than slipping past it; and
 * if a browser closes the dialog anyway (Chrome will on a second `Esc`
 * without an intervening gesture), `close` routes to the same place so the
 * state never disagrees with the screen.
 *
 * **Focus lands on the notice, not on a button.** The first thing in the
 * dialog a screen reader meets is the text the reader is being asked to
 * agree to. The notice is a `role="document"` region — the APG's advice for
 * a dialog that is mostly prose, so reading mode applies inside it — and it
 * is focusable because it is the scroller: arrow keys and Page Down have to
 * reach it, and not every engine makes a scroller focusable on its own.
 *
 * **On a phone it is the whole screen**; from `md` it is a centred panel.
 * Either way the header and the buttons stay put and only the notice
 * scrolls, so both buttons are on screen from the moment it opens. The
 * button bar clears the home indicator on a notched phone.
 *
 * Page scroll is locked while it is open — a modal `<dialog>` does not stop
 * the wheel reaching the page behind it on its own.
 */
export function ConsentDialog({
  open,
  heading,
  closeLabel,
  children,
  confirmLabel,
  declineLabel,
  onConfirm,
  decline,
  pending = false,
  error = null,
  returnFocusRef,
}: ConsentDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const headingId = useId();

  useLockBodyScroll(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (open && !dialog.open) {
      returnFocusTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      // Every opening starts at the top of the notice — the legacy site asks
      // afresh each time, and so should the scroll position.
      noticeRef.current?.scrollTo({ top: 0 });
      noticeRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      (returnFocusRef?.current ?? returnFocusTo.current)?.focus();
    }
  }, [open, returnFocusRef]);

  function leave() {
    if (decline.kind === 'exit') router.push(decline.href);
    else decline.onDismiss();
  }

  const closeClass =
    'flex size-touch flex-none cursor-pointer items-center justify-center border border-hairline-grid text-h3 leading-none text-body-on-dark transition-colors hover:text-white focus-visible:outline-white';

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        leave();
      }}
      onClose={() => {
        if (open) leave();
      }}
      className={cn(
        // Closed, the element is `display: none`; open, a column whose middle
        // row scrolls.
        'hidden flex-col open:flex',
        'bg-surface-black text-body-on-dark backdrop:bg-scrim-dialog',
        // A phone: the whole screen, so the notice has every line there is.
        'h-dvh max-h-none w-full max-w-none',
        // From `md`: a centred panel, capped to the viewport with a margin.
        'md:m-auto md:h-fit md:max-h-(--consent-dialog-max-h) md:w-(--consent-dialog-w) md:border md:border-hairline-grid',
      )}
    >
      <div className="flex flex-none items-center justify-between gap-stack border-b border-hairline-dark p-inset">
        <h2 id={headingId} className="text-h3 text-white">
          {heading}
        </h2>

        {decline.kind === 'exit' ? (
          <Link href={decline.href} aria-label={closeLabel} className={closeClass}>
            <span aria-hidden="true">×</span>
          </Link>
        ) : (
          <button
            type="button"
            aria-label={closeLabel}
            onClick={decline.onDismiss}
            className={closeClass}
          >
            {/* The multiplication sign, as the legacy dialog and the team
                dialog both draw it; the name comes from aria-label. */}
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      <div
        ref={noticeRef}
        role="document"
        aria-labelledby={headingId}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-inset focus-visible:-outline-offset-2 focus-visible:outline-white"
      >
        {children}
      </div>

      <ConsentActions
        confirmLabel={confirmLabel}
        declineLabel={declineLabel}
        onConfirm={onConfirm}
        decline={decline}
        pending={pending}
        error={error}
        className="flex-none border-t border-hairline-dark p-inset pb-[max(var(--spacing-inset),env(safe-area-inset-bottom))]"
      />
    </dialog>
  );
}
