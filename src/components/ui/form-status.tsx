import { CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FormStatusMessage {
  tone: 'success' | 'error';
  /** The outcome, in a sentence. */
  title: string;
  /** A second line, when there is more to say — a reference number. */
  detail?: string;
}

export interface FormStatusProps {
  message: FormStatusMessage | null;
  /**
   * A count that changes with every outcome. The message is keyed by it, so
   * the same failure twice in a row is a fresh node in the region and is
   * announced again rather than ignored as unchanged.
   */
  announcement?: number;
  className?: string;
}

const TONE = {
  success: { Icon: CircleCheck, border: 'border-success-on-dark', icon: 'text-success-on-dark' },
  error: { Icon: CircleAlert, border: 'border-error-on-dark', icon: 'text-error-on-dark' },
} as const;

/**
 * A form's outcome — sent, or not sent and why — in a polite live region, so
 * a screen reader announces it where it appears without moving focus there.
 *
 * **The region is always rendered, and only its contents change.** A live
 * region added to the page with its message already inside is not reliably
 * announced; one that is already there and gains a message is.
 *
 * The tone is an icon and a coloured frame, and the words say it too, so
 * neither depends on colour. Place it beside the control that caused it —
 * the submit button — where the eye already is.
 *
 * A Server Component; the form that owns it passes the message.
 */
export function FormStatus({ message, announcement = 0, className }: FormStatusProps) {
  const tone = message === null ? null : TONE[message.tone];

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={className}>
      {message !== null && tone !== null && (
        <div
          key={announcement}
          className={cn(
            'flex items-start gap-tight rounded-(--radius-card) border bg-surface-black p-stack',
            tone.border,
          )}
        >
          <span className="flex h-lh shrink-0 items-center text-body-sm">
            <tone.Icon className={cn('size-5', tone.icon)} aria-hidden="true" focusable="false" />
          </span>
          <div className="flex flex-col gap-tight text-body-sm">
            <p className="font-bold text-white">{message.title}</p>
            {message.detail !== undefined && <p className="text-body-on-dark">{message.detail}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
