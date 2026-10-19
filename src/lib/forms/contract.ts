import type { z } from 'zod';

/**
 * Field errors as the site's forms carry them, whichever side found them —
 * the form's own schema in the browser, or the backend's `fieldErrors`
 * (`contact-enquiry.ts`, docs/api-contracts.md §8.2).
 *
 * **Errors travel as codes, not sentences.** A field is rejected as
 * `required`, `invalid` or `too-long`; the words a visitor reads are the
 * form's own copy, keyed by those codes, in the page's content file. So no
 * sentence from the backend reaches the screen, and every string the visitor
 * can see is in one file the client can review.
 */

export const FIELD_ERROR_CODES = ['required', 'invalid', 'too-long'] as const;
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

/** One code per rejected field, keyed by the field's name in the request. */
export type FieldErrors<Field extends string = string> = Partial<Record<Field, FieldErrorCode>>;

function isFieldErrorCode(value: string): value is FieldErrorCode {
  return (FIELD_ERROR_CODES as readonly string[]).includes(value);
}

/** The code a field's schema raised for one value — its first issue's. */
export function fieldErrorCode(error: z.ZodError): FieldErrorCode {
  const message = error.issues[0]?.message ?? 'invalid';
  return isFieldErrorCode(message) ? message : 'invalid';
}

/**
 * A schema's issues as one code per field — the first issue on each, which is
 * the one the schema puts first (`required` before `invalid`). Each form's
 * schema raises its codes as the issue's message; anything else it raises,
 * Zod's own wording included, is reported as `invalid`. Issues on fields the
 * form does not have are dropped: there is nowhere to show them.
 */
export function fieldErrorsFrom<Field extends string>(
  error: z.ZodError,
  fields: readonly Field[],
): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {};

  for (const issue of error.issues) {
    const field = fields.find((name) => name === issue.path[0]);
    if (field === undefined || errors[field] !== undefined) continue;
    errors[field] = isFieldErrorCode(issue.message) ? issue.message : 'invalid';
  }

  return errors;
}
