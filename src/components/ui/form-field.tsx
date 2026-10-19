import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** What `<FormField>` hands its control, to spread onto it. */
export interface FieldControlProps {
  id: string;
  required: boolean;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
}

export interface FormFieldProps {
  /** The control's `id`. The label points at it and the error's id is built from it. */
  id: string;
  /** The visible label, verbatim. A placeholder is not a label. */
  label: string;
  required?: boolean;
  /**
   * The mark after a required field's label — the legacy form's `*`. Shown,
   * and hidden from assistive technology, which hears "required" from the
   * control's own `required` instead of "star".
   */
  requiredMarker?: string;
  /** The error, in words, or nothing. Its presence is what marks the field invalid. */
  error?: string | null;
  /** A standing instruction under the label, if the field needs one. */
  hint?: string;
  className?: string;
  /** The control, given its id, its required state and its description. */
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * A form field: the label, an optional hint, the error, and the control —
 * `<Input>`, `<Select>` or `<Textarea>` — wired together, so a field cannot
 * be built without its label or with its error unconnected.
 *
 * The control comes in as a function of the props it needs, and spreads them:
 * its `id`, its `required`, `aria-invalid` while there is an error, and
 * `aria-describedby` naming the error and hint, so a screen reader reads the
 * error when the control takes focus.
 *
 * **The error sits between the label and the control**, not under the
 * control. On a phone the browser scrolls a focused field just clear of the
 * on-screen keyboard; an error under the control would land behind the
 * keyboard while the visitor types the correction it describes, and one above
 * it stays in view. `lib/utils/focus-field.ts` scrolls to this wrapper
 * (`data-form-field`) for the same reason.
 *
 * The error carries an icon and words, never colour alone.
 *
 * A Server Component; it holds no state, so a client form uses it as is.
 */
export function FormField({
  id,
  label,
  required = false,
  requiredMarker,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const invalid = error !== undefined && error !== null && error !== '';
  const describedBy =
    [invalid ? errorId : null, hint !== undefined ? hintId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div data-form-field className={cn('flex flex-col gap-tight', className)}>
      <label htmlFor={id} className="text-body-sm font-bold text-white">
        {label}
        {required && requiredMarker !== undefined && (
          <span aria-hidden="true" className="text-brand-red-bright">
            {' '}
            {requiredMarker}
          </span>
        )}
      </label>

      {hint !== undefined && (
        <p id={hintId} className="text-body-sm text-on-dark-soft">
          {hint}
        </p>
      )}

      {invalid && (
        <p id={errorId} className="flex items-start gap-tight text-body-sm text-error-on-dark">
          {/* A box one line tall, so the icon centres on the first line of
              an error that wraps. */}
          <span className="flex h-lh shrink-0 items-center">
            <CircleAlert className="size-4" aria-hidden="true" focusable="false" />
          </span>
          {error}
        </p>
      )}

      {children({
        id,
        required,
        'aria-invalid': invalid ? true : undefined,
        'aria-describedby': describedBy,
      })}
    </div>
  );
}
