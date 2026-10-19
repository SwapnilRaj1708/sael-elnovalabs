import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { fieldControl } from '@/components/ui/field-control';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  /** What the form posts. */
  value: string;
  /** What the list shows, verbatim. */
  label: string;
}

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  options: readonly SelectOption[];
  /**
   * The prompt shown before a choice is made — the legacy form's "Select
   * Option". Rendered as a first option with an empty value, disabled so it
   * cannot be chosen back. Give the select `defaultValue=""` to start on it.
   */
  placeholder?: string;
}

/**
 * A choice from a short list — **the native `<select>`**, restyled, rather
 * than a custom listbox. On a phone that opens the platform's own picker,
 * which is the most usable list a touch screen has; and the keyboard, the
 * screen reader and autofill all work as they do on every other site.
 *
 * Only the closed control is styled: the field's frame, and a chevron in
 * place of the browser's arrow, clear of the text by the same inset the
 * document filter's glyph takes. The open list is the platform's, dark by
 * `scheme-dark`, with each option painted on the field's own ground for the
 * browsers that use the control's colours there.
 *
 * Until a choice is made, a **required** select shows its placeholder in the
 * placeholder colour — read from `:invalid`, which a required select is
 * exactly while its empty first option is selected.
 *
 * Unlabelled on its own. Render it inside `<FormField>`.
 */
export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldControl(),
          'cursor-pointer appearance-none pr-(--spacing-filter-inset)',
          'invalid:text-on-dark-muted',
          '*:bg-surface-black *:text-white',
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-stack size-5 -translate-y-1/2 text-on-dark-soft"
        aria-hidden="true"
        focusable="false"
      />
    </div>
  );
}
