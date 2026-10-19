import { z } from 'zod';
import type { FieldErrorCode, FieldErrors } from './contract';

/**
 * The Contact Us form's contract with the backend, as the browser speaks it —
 * docs/api-contracts.md §8. These are the only backend calls the browser
 * makes (/CLAUDE.md §6).
 *
 * **Relative URLs, same origin.** nginx sends `/app/v1/` to the backend on the
 * site's own host (deploy/nginx.conf.sample), so the visitor's browser opens
 * the connection and the backend's per-IP limits count the visitor. Through a
 * Next server proxy every visitor would share the server's one address and
 * one quota. `next dev` reaches the backend through a development-only
 * rewrite in next.config.ts.
 *
 * **Field names are the backend's** (`ContactEnquirySubmission`), from the
 * inputs' `name`s to the payload to the `fieldErrors` it answers with, so an
 * error lands on its input without a lookup table.
 *
 * **Never reports success on failure.** Only a 2xx that carries a receipt is
 * `ok`. Anything the visitor cannot fix — a network failure, a 5xx, an error
 * page from a proxy, a refusal that names no field on the form — is
 * `unavailable`, and the form offers the email address instead.
 *
 * Imports nothing but zod at runtime, so `node --test` loads it as it is
 * (`contact-enquiry.test.ts`).
 */

export const CONTACT_OPTIONS_PATH = '/app/v1/contact-form/options';
export const CONTACT_ENQUIRY_PATH = '/app/v1/contact-enquiry';

/** The visitor's five fields, in the form's order: the order errors are listed and the first one focused. */
export const CONTACT_FIELDS = ['fullName', 'email', 'phone', 'subjectCode', 'message'] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

/** `sourcePage`'s bound on the backend; a longer path is not sent. */
const SOURCE_PAGE_MAX = 200;

/**
 * Long enough for a slow mobile connection, short enough that a request that
 * will never answer does not leave the button spinning.
 */
const REQUEST_TIMEOUT_MS = 15_000;

const contactFormOptionsSchema = z.object({
  enabled: z.boolean(),
  subjects: z.array(z.object({ code: z.string().min(1), label: z.string().min(1) })),
  maxMessageLength: z.number().int().positive(),
  antibot: z.object({ provider: z.string(), siteKey: z.string().nullable() }),
  honeypotField: z.string().min(1),
});

export type ContactFormOptions = z.infer<typeof contactFormOptionsSchema>;

/**
 * The options, or the reason there is no form to show. `unavailable` covers
 * every case the visitor meets the same way: the options did not load, the
 * form is switched off (`enabled: false`), or it could not be submitted if it
 * were shown — see {@link usableOptions}.
 */
export type ContactOptionsLoad =
  { state: 'ready'; options: ContactFormOptions } | { state: 'unavailable' };

export type EnquiryOutcome =
  | { ok: true; reference: string }
  | { ok: false; error: 'invalid'; fieldErrors: FieldErrors<ContactField> }
  | { ok: false; error: 'rate-limited' }
  | { ok: false; error: 'unavailable' };

const UNAVAILABLE = { ok: false, error: 'unavailable' } as const;

/** Every key the payload names itself. A honeypot by one of these names would overwrite it. */
const PAYLOAD_KEYS: readonly string[] = [...CONTACT_FIELDS, 'sourcePage', 'captchaToken'];

/**
 * Whether the form can be shown with these options. Not when the backend has
 * it switched off, nor when it lists no subject (no submission could pass),
 * nor when it asks for an anti-bot token: this site renders no CAPTCHA widget,
 * and the backend refuses every submission without a token while one is
 * enforced. A form that is bound to fail is not worth a visitor's typing.
 */
function usableOptions(options: ContactFormOptions): boolean {
  return (
    options.enabled &&
    options.subjects.length > 0 &&
    options.antibot.provider === 'NONE' &&
    !PAYLOAD_KEYS.includes(options.honeypotField)
  );
}

/** A response body as JSON, or `null` if it is empty or not JSON. */
async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

/** `GET /app/v1/contact-form/options`, fresh every time (§8.1: `no-store`). Never throws. */
export async function loadContactOptions(): Promise<ContactOptionsLoad> {
  let response: Response;
  try {
    response = await fetch(CONTACT_OPTIONS_PATH, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return { state: 'unavailable' };
  }
  if (!response.ok) return { state: 'unavailable' };

  const options = contactFormOptionsSchema.safeParse(await readJson(response));
  return options.success && usableOptions(options.data)
    ? { state: 'ready', options: options.data }
    : { state: 'unavailable' };
}

/**
 * The request body: the visitor's fields as validated, the page they were on,
 * and the honeypot under the name the options gave it, carrying whatever the
 * hidden input held — empty, from a person.
 */
export function buildSubmission(
  values: Record<ContactField, string>,
  options: Pick<ContactFormOptions, 'honeypotField'>,
  context: { sourcePage: string; honeypot: string },
): Record<string, string | null> {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    subjectCode: values.subjectCode,
    message: values.message,
    sourcePage: context.sourcePage.length <= SOURCE_PAGE_MAX ? context.sourcePage : null,
    captchaToken: null,
    [options.honeypotField]: context.honeypot,
  };
}

const receiptSchema = z.object({ reference: z.string().min(1) });

const errorResponseSchema = z.object({
  code: z.string(),
  // Omitted by the backend when there are none (`ErrorResponse`).
  fieldErrors: z.array(z.object({ field: z.string(), code: z.string() })).optional(),
});

function isContactField(name: string): name is ContactField {
  return (CONTACT_FIELDS as readonly string[]).includes(name);
}

/**
 * The backend's codes are the Bean Validation constraint that failed
 * (`EnquirySubmissionValidation`). The words are the form's own copy, so only
 * the kind of failure crosses over.
 */
function fieldErrorCodeOf(constraint: string): FieldErrorCode {
  if (constraint === 'NotBlank') return 'required';
  if (constraint === 'Size') return 'too-long';
  return 'invalid';
}

/**
 * The backend's `fieldErrors` list as one code per form field, first entry
 * winning. Entries for fields the visitor cannot see — `sourcePage`,
 * `captchaToken` — are dropped: there is nowhere to show them.
 */
export function fieldErrorsFromResponse(
  entries: readonly { field: string; code: string }[],
): FieldErrors<ContactField> {
  const errors: FieldErrors<ContactField> = {};
  for (const { field, code } of entries) {
    if (isContactField(field) && errors[field] === undefined)
      errors[field] = fieldErrorCodeOf(code);
  }
  return errors;
}

/** `POST /app/v1/contact-enquiry`. Never throws. */
export async function submitEnquiry(
  payload: Record<string, string | null>,
): Promise<EnquiryOutcome> {
  let response: Response;
  try {
    response = await fetch(CONTACT_ENQUIRY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return UNAVAILABLE;
  }

  const body = await readJson(response);

  if (response.ok) {
    // A 2xx without a receipt is not the backend's answer — an HTML page from
    // something in between, say — so it is not reported as sent.
    const receipt = receiptSchema.safeParse(body);
    return receipt.success ? { ok: true, reference: receipt.data.reference } : UNAVAILABLE;
  }

  if (response.status === 429) return { ok: false, error: 'rate-limited' };

  if (response.status === 400) {
    // Only INTAKE_VALIDATION_FAILED names fields. The body-size refusal shares
    // the code and names none; INTAKE_CAPTCHA_FAILED and MALFORMED_REQUEST are
    // nothing the visitor can correct.
    const error = errorResponseSchema.safeParse(body);
    if (error.success && error.data.code === 'INTAKE_VALIDATION_FAILED') {
      const fieldErrors = fieldErrorsFromResponse(error.data.fieldErrors ?? []);
      if (Object.keys(fieldErrors).length > 0) return { ok: false, error: 'invalid', fieldErrors };
    }
  }

  return UNAVAILABLE;
}
