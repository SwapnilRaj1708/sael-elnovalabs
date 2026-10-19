import { z } from 'zod';
import type { ContactField, ContactFormOptions } from './contact-enquiry';
import type { FieldErrorCode } from './contract';

/**
 * The Contact Us form's checks in the browser, for the visitor's sake. The
 * backend's are the real ones (`EnquirySubmissionValidation`); these are
 * aligned with them, so the form does not send what the backend will refuse,
 * nor refuse what it would accept — with one deliberate exception, the phone
 * number's digit count (below).
 *
 * **The fields are the backend's**, by name: `fullName`, `email`, `phone`,
 * `subjectCode`, `message`, all required (docs/api-contracts.md §8.2). Their
 * labels and placeholders are copy, and live in `app/_content/contact-us.ts`.
 *
 * **Two rules come from the options**, because SAEL change them without a
 * release: the subject must be one of today's codes, and the message must fit
 * `maxMessageLength`. Until the options arrive, no subject can be chosen.
 */

/** The backend's `@Size` bounds (`ContactEnquirySubmission`). The message's is in the options. */
export const CONTACT_LIMITS = {
  fullName: 180,
  email: 255,
  phone: 32,
} as const;

/**
 * A phone number as people write one: an optional leading `+`, then 7 to 15
 * digits with spaces, hyphens and brackets anywhere between them —
 * `011 4491 0011`, `+91-11-4491-0011`, `(011) 44910011`.
 *
 * **Stricter than the backend**, which takes any run of digits, spaces and
 * `+ ( ) -` up to 32 characters. The characters are the same; the digit count
 * is this form's own check that what was typed could be a phone number.
 *
 * **The legacy field was `type="number"`**, which rejected a `+`, dropped a
 * leading zero and offered a spinner. The field is `type="tel"` now, and this
 * one source is both the schema's rule and the input's `pattern` attribute,
 * so the two cannot drift. Written to compile under the `v` flag, which is
 * how a browser compiles `pattern`: every bracket and hyphen in a class is
 * escaped.
 */
export const CONTACT_PHONE_PATTERN = String.raw`\+?[ \(\)\-]*(?:[0-9][ \(\)\-]*){7,15}`;

const PHONE = new RegExp(`^(?:${CONTACT_PHONE_PATTERN})$`);

/**
 * The backend's `EMAIL_SHAPE`: something, an `@`, something with a dot in it.
 * Anything stricter refuses real addresses.
 */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const REQUIRED: FieldErrorCode = 'required';
const INVALID: FieldErrorCode = 'invalid';
const TOO_LONG: FieldErrorCode = 'too-long';

/**
 * A text's length as the backend measures the message (`codePointCount`):
 * a surrogate pair is one character, so an emoji counts once, not twice.
 */
function codePointCount(text: string): number {
  return text.length - (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)?.length ?? 0);
}

/** Absent is `required`; present but not a string — a crafted request — is `invalid`. */
function presence(issue: { input: unknown }): FieldErrorCode {
  return issue.input === undefined ? REQUIRED : INVALID;
}

/** Trimmed before it is measured, so a field of spaces is empty. */
function text(max: number) {
  return z.string({ error: presence }).trim().min(1, REQUIRED).max(max, TOO_LONG);
}

/** The schema for one set of options, or for none while they load. */
export function contactFormSchema(
  options: Pick<ContactFormOptions, 'subjects' | 'maxMessageLength'> | null,
) {
  const codes = options?.subjects.map((subject) => subject.code) ?? [];
  const maxMessageLength = options?.maxMessageLength;

  return z.object({
    fullName: text(CONTACT_LIMITS.fullName),
    email: text(CONTACT_LIMITS.email).regex(EMAIL, INVALID),
    phone: z
      .string({ error: presence })
      .trim()
      .min(1, REQUIRED)
      .max(CONTACT_LIMITS.phone, INVALID)
      .regex(PHONE, INVALID),
    // The placeholder option, "Select Option", posts an empty string.
    subjectCode: z
      .string({ error: presence })
      .min(1, REQUIRED)
      .refine((code) => codes.includes(code), INVALID),
    message: z
      .string({ error: presence })
      .trim()
      .min(1, REQUIRED)
      .refine(
        (message) => maxMessageLength === undefined || codePointCount(message) <= maxMessageLength,
        TOO_LONG,
      ),
  } satisfies Record<ContactField, z.ZodType<string>>);
}
