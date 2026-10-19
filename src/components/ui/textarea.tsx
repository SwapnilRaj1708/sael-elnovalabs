import type { ComponentPropsWithRef } from 'react';
import { fieldControl } from '@/components/ui/field-control';
import { cn } from '@/lib/utils/cn';

export type TextareaProps = ComponentPropsWithRef<'textarea'>;

/**
 * A multi-line text control in the site's field style (`field-control.ts`).
 *
 * Sized by `rows` — a count of lines at the field's own type size, so it
 * scales with the type rather than being a height in pixels — and resizable
 * vertically only, so a visitor can make room for a long message without
 * pushing the form sideways.
 *
 * Unlabelled on its own. Render it inside `<FormField>`.
 */
export function Textarea({ className, rows = 6, ...props }: TextareaProps) {
  return <textarea rows={rows} className={cn(fieldControl(), 'resize-y', className)} {...props} />;
}
