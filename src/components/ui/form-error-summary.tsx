'use client';

import { CircleAlert } from 'lucide-react';
import { focusField } from '@/lib/utils/focus-field';

export interface FormErrorSummaryItem {
  /** The invalid control's `id` — where its link goes. */
  controlId: string;
  /** The field's error, as shown beside it. */
  message: string;
}

export interface FormErrorSummaryProps {
  /** The line above the list. */
  title: string;
  /** Empty, and the summary is not shown. */
  items: readonly FormErrorSummaryItem[];
  /** Changes with every failed submit, so a repeat is announced again. */
  announcement?: number;
  className?: string;
}

/**
 * Every error a submit found, at the head of the form, each a link to its
 * field — so a visitor who cannot see the whole form at once learns how many
 * things are wrong and can go straight to each.
 *
 * **Announced, not focused.** On a failed submit the form moves focus to the
 * first invalid field, which a screen reader announces with its error. This
 * region is polite, so the summary is read after that rather than over it.
 * The region is always rendered and only its contents change, which is what
 * makes the announcement reliable (see `<FormStatus>`).
 *
 * **A snapshot of the submit**, as GOV.UK's pattern has it: it lists what
 * the last attempt found and stays until the next one, while each field's own
 * error clears the moment the field is fixed. A summary that rewrote itself
 * as the visitor typed would be re-announced on every keystroke that fixed
 * something.
 *
 * A link moves focus to its field and scrolls the whole field — label and
 * error included — into view (`lib/utils/focus-field.ts`), which a plain
 * fragment link does not reliably do. The `href` stays, so the link is still
 * a link to everything that reads one.
 */
export function FormErrorSummary({
  title,
  items,
  announcement = 0,
  className,
}: FormErrorSummaryProps) {
  return (
    <div aria-live="polite" aria-atomic="true" className={className}>
      {items.length > 0 && (
        <div
          key={announcement}
          className="flex flex-col gap-tight rounded-(--radius-card) border border-error-on-dark bg-surface-black p-stack text-body-sm"
        >
          <p className="flex items-start gap-tight font-bold text-white">
            <span className="flex h-lh shrink-0 items-center">
              <CircleAlert
                className="size-5 text-error-on-dark"
                aria-hidden="true"
                focusable="false"
              />
            </span>
            {title}
          </p>

          <ul className="flex flex-col gap-tight">
            {items.map((item) => (
              <li key={item.controlId}>
                <a
                  href={`#${item.controlId}`}
                  onClick={(event) => {
                    event.preventDefault();
                    focusField(item.controlId);
                  }}
                  className="text-error-on-dark underline underline-offset-4 hover:text-white focus-visible:outline-white"
                >
                  {item.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
