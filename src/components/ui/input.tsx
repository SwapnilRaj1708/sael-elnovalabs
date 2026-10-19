import type { ComponentPropsWithRef } from 'react';
import { fieldControl } from '@/components/ui/field-control';
import { cn } from '@/lib/utils/cn';

export type InputProps = ComponentPropsWithRef<'input'>;

/**
 * A single-line text control — text, email, tel — in the site's field style
 * (`field-control.ts`). Everything else is the native `<input>`'s: pass
 * `type`, `inputMode`, `autoComplete` and `pattern` for what the field holds,
 * because those are what give a phone the right keyboard and autofill the
 * right value.
 *
 * Unlabelled on its own. Render it inside `<FormField>`, which gives it its
 * label, its error and the ARIA that ties them together.
 */
export function Input({ className, type = 'text', ...props }: InputProps) {
  return <input type={type} className={cn(fieldControl(), className)} {...props} />;
}
