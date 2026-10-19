'use client';

import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type SubmitEvent } from 'react';
import { flushSync } from 'react-dom';
import { ArrowGlyph } from '@/components/ui/arrow-glyph';
import { Button } from '@/components/ui/button';
import { FormErrorSummary } from '@/components/ui/form-error-summary';
import { FormField } from '@/components/ui/form-field';
import { FormStatus, type FormStatusMessage } from '@/components/ui/form-status';
import { HoneypotField } from '@/components/ui/honeypot-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_PHONE_PATTERN, contactFormSchema } from '@/lib/forms/contact';
import {
  buildSubmission,
  CONTACT_ENQUIRY_PATH,
  CONTACT_FIELDS,
  loadContactOptions,
  submitEnquiry,
  type ContactField,
  type ContactOptionsLoad,
} from '@/lib/forms/contact-enquiry';
import { MOCK_CONTACT_FORM_OPTIONS, submitMockEnquiry } from '@/lib/forms/contact-enquiry-mock';
import {
  fieldErrorCode,
  fieldErrorsFrom,
  type FieldErrorCode,
  type FieldErrors,
} from '@/lib/forms/contract';
import { focusField } from '@/lib/utils/focus-field';

/** Every word the form shows. All of it is the page's copy — `_content/contact-us.ts`. */
export interface ContactFormCopy {
  /**
   * Each field's label and placeholder, verbatim from the legacy form. The
   * subject's placeholder is the select's prompt, "Select Option".
   */
  fields: Record<ContactField, { label: string; placeholder: string }>;
  /** The legacy form's `*`. */
  requiredMarker: string;
  submit: string;
  /** The button's label while sending. */
  pending: string;
  /** The honeypot's label, read only if the CSS fails. */
  honeypotLabel: string;
  /**
   * A sentence per field per code. `invalid` is required on every field, and
   * stands in for a code the field has no sentence of its own for. `{max}` in
   * a sentence is the limit from the options — the message's length.
   */
  errors: Record<ContactField, Partial<Record<FieldErrorCode, string>> & { invalid: string }>;
  /** The line above the list of errors. */
  summaryTitle: string;
  /** Sent. */
  sent: string;
  /** The reference line under "sent", with `{referenceId}` in it. */
  reference: string;
  /** Not sent: too many attempts. */
  rateLimited: string;
  /** Not sent: anything else — the backend down, the network gone. */
  unavailable: string;
  /** In place of the form, when there is no form to show. */
  formUnavailable: string;
}

export interface ContactFormProps {
  copy: ContactFormCopy;
  /** The id of the heading that names the form. */
  labelledBy: string;
  /**
   * `CONTENT_SOURCE`. With `mock`, the options and the submission are
   * stand-ins (`lib/forms/contact-enquiry-mock.ts`) and the backend is never
   * called.
   */
  source: 'mock' | 'api';
}

type OptionsState = ContactOptionsLoad | { state: 'loading' };

const controlId = (field: ContactField) => `contact-${field}`;

function isContactField(name: string): name is ContactField {
  return (CONTACT_FIELDS as readonly string[]).includes(name);
}

/** The control an event bubbled up from, if it is one with a value. */
function controlOf(
  target: EventTarget,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
    ? target
    : null;
}

/** A field's value from the form, as a string. A select left on its placeholder posts nothing. */
function valueOf(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value : '';
}

/**
 * The Contact Us form. It posts JSON from the browser straight to the
 * backend, `POST /app/v1/contact-enquiry`, on the site's own origin
 * (docs/api-contracts.md §8, /CLAUDE.md §6) — never through the Next server,
 * which would make every visitor share its one rate limit.
 *
 * **The options come first.** The subjects, the message's limit and the
 * honeypot's name are the backend's, read from `/app/v1/contact-form/options`
 * when the form mounts. Until they arrive the form is shown without subjects.
 * If they do not arrive, or say the form is closed, the form gives way to a
 * line with the email address (`loadContactOptions` in `lib/forms/contact-enquiry.ts`).
 *
 * **Validation, in the browser, for the visitor's sake** — the backend's
 * check is the real one (`lib/forms/contact.ts`):
 *
 *  - A field is checked when it is left, if it has something in it — so
 *    tabbing through an empty form does not paint it red — and rechecked on
 *    every change once it has an error, so the error goes the moment the
 *    field is right.
 *  - On submit, every field. If any fails: each shows its error, the summary
 *    above the fields lists them, and focus moves to the first, scrolled
 *    into view with its label and error (`focusField`). The backend's
 *    `fieldErrors`, when it disagrees, are shown the same way.
 *
 * **Submitting.** The button says it is sending and is marked
 * `aria-disabled`, but not `disabled`: a disabled button drops focus to the
 * page, and a keyboard user would lose their place. A second press while one
 * request is in flight does nothing (`inFlight`). Sent — a 2xx with a
 * receipt, and nothing else — the form clears and the outcome is announced
 * from the live region beside the button. Not sent, the fields are left as
 * they were, so nothing has to be retyped.
 *
 * **Without JavaScript** there are no options, so no subject can be chosen;
 * the form still posts rather than putting a name, email and phone number
 * into the URL of a GET. The backend accepts only JSON and refuses that post,
 * and the address, phone and email above the form are the way in.
 */
export function ContactForm({ copy, labelledBy, source }: ContactFormProps) {
  const [optionsState, setOptionsState] = useState<OptionsState>(() =>
    source === 'mock'
      ? { state: 'ready', options: MOCK_CONTACT_FORM_OPTIONS }
      : { state: 'loading' },
  );
  const [errors, setErrors] = useState<FieldErrors<ContactField>>({});
  const [summary, setSummary] = useState<FieldErrors<ContactField>>({});
  const [status, setStatus] = useState<FormStatusMessage | null>(null);
  const [pending, setPending] = useState(false);
  const [announcement, setAnnouncement] = useState(0);
  const inFlight = useRef(false);

  useEffect(() => {
    if (source === 'mock') return;
    // An answer that lands after unmount — or after Strict Mode's rehearsal
    // unmount in development — is dropped.
    let active = true;
    void loadContactOptions().then((loaded) => {
      if (active) setOptionsState(loaded);
    });
    return () => {
      active = false;
    };
  }, [source]);

  const options = optionsState.state === 'ready' ? optionsState.options : null;
  const schema = useMemo(() => contactFormSchema(options), [options]);
  const subjectOptions = useMemo(
    () => (options?.subjects ?? []).map(({ code, label }) => ({ value: code, label })),
    [options],
  );

  function sentence(field: ContactField, code: FieldErrorCode): string {
    const text = copy.errors[field][code] ?? copy.errors[field].invalid;
    return options === null
      ? text
      : text.replace('{max}', options.maxMessageLength.toLocaleString('en-IN'));
  }

  function check(field: ContactField, value: string): FieldErrorCode | undefined {
    const result = schema.shape[field].safeParse(value);
    return result.success ? undefined : fieldErrorCode(result.error);
  }

  /** Shows a failed submit: every error, the summary, and focus on the first. */
  function reject(found: FieldErrors<ContactField>) {
    // Committed before focus moves, so the error the control is described by
    // is already in the page when the screen reader reads it.
    flushSync(() => {
      setErrors(found);
      setSummary(found);
      setStatus(null);
      setAnnouncement((count) => count + 1);
    });
    const first = CONTACT_FIELDS.find((field) => found[field] !== undefined);
    if (first !== undefined) focusField(controlId(first));
  }

  function recheck(name: string, value: string, onlyIfShowing: boolean) {
    if (!isContactField(name)) return;
    if (onlyIfShowing && errors[name] === undefined) return;
    setErrors((current) => ({ ...current, [name]: check(name, value) }));
  }

  async function send(form: HTMLFormElement) {
    const data = new FormData(form);
    const values = Object.fromEntries(CONTACT_FIELDS.map((field) => [field, valueOf(data, field)]));

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      reject(fieldErrorsFrom(parsed.error, CONTACT_FIELDS));
      return;
    }
    // Unreachable without options: no subject passes the schema until they load.
    if (options === null) return;

    inFlight.current = true;
    setPending(true);
    setStatus(null);

    const outcome =
      source === 'mock'
        ? await submitMockEnquiry()
        : await submitEnquiry(
            buildSubmission(parsed.data, options, {
              sourcePage: window.location.pathname,
              honeypot: valueOf(data, options.honeypotField),
            }),
          );

    inFlight.current = false;
    setPending(false);

    if (outcome.ok) {
      form.reset();
      setErrors({});
      setSummary({});
      setStatus({
        tone: 'success',
        title: copy.sent,
        detail: copy.reference.replace('{referenceId}', outcome.reference),
      });
      setAnnouncement((count) => count + 1);
      return;
    }

    if (outcome.error === 'invalid') {
      reject(outcome.fieldErrors);
      return;
    }

    setStatus({
      tone: 'error',
      title: outcome.error === 'rate-limited' ? copy.rateLimited : copy.unavailable,
    });
    setAnnouncement((count) => count + 1);
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    void send(event.currentTarget);
  }

  if (optionsState.state === 'unavailable') {
    return <FormStatus message={{ tone: 'error', title: copy.formUnavailable }} />;
  }

  const summaryItems = CONTACT_FIELDS.flatMap((field) => {
    const code = summary[field];
    return code === undefined
      ? []
      : [{ controlId: controlId(field), message: sentence(field, code) }];
  });

  const fieldProps = (field: ContactField) => {
    const code = errors[field];
    return {
      id: controlId(field),
      label: copy.fields[field].label,
      required: true,
      requiredMarker: copy.requiredMarker,
      error: code === undefined ? null : sentence(field, code),
    };
  };

  return (
    <form
      // Without JavaScript, still a POST — never a GET that would put the
      // visitor's details in a URL.
      action={CONTACT_ENQUIRY_PATH}
      method="post"
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={onSubmit}
      // Delegated: `blur` and `change` from every field bubble to here. Left
      // empty, a field is only rechecked if it already shows an error.
      onBlur={(event) => {
        const control = controlOf(event.target);
        if (control !== null) recheck(control.name, control.value, control.value.trim() === '');
      }}
      onChange={(event) => {
        const control = controlOf(event.target);
        if (control !== null) recheck(control.name, control.value, true);
      }}
      className="flex flex-col gap-flow"
    >
      {/* Both live regions stay in the page while empty, so that what they
          later say is announced (see `<FormStatus>`). Empty, each cancels
          the gap beside it, or the form would carry space for a message it
          is not showing. */}
      <FormErrorSummary
        title={copy.summaryTitle}
        items={summaryItems}
        announcement={announcement}
        className="empty:-mb-flow"
      />

      <div className="grid grid-cols-1 gap-x-gap-grid gap-y-flow md:grid-cols-2">
        <FormField {...fieldProps('fullName')}>
          {(control) => (
            <Input
              {...control}
              name="fullName"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              placeholder={copy.fields.fullName.placeholder}
            />
          )}
        </FormField>

        <FormField {...fieldProps('email')}>
          {(control) => (
            <Input
              {...control}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder={copy.fields.email.placeholder}
            />
          )}
        </FormField>

        <FormField {...fieldProps('phone')}>
          {(control) => (
            // The legacy field was `type="number"`, which refused "+91" and
            // dropped a leading zero. A phone number is text that a keypad
            // types: `tel` gives the phone keypad and keeps every character.
            <Input
              {...control}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              pattern={CONTACT_PHONE_PATTERN}
              enterKeyHint="next"
              placeholder={copy.fields.phone.placeholder}
            />
          )}
        </FormField>

        <FormField {...fieldProps('subjectCode')}>
          {(control) => (
            <Select
              {...control}
              name="subjectCode"
              defaultValue=""
              placeholder={copy.fields.subjectCode.placeholder}
              options={subjectOptions}
            />
          )}
        </FormField>

        <FormField {...fieldProps('message')} className="md:col-span-2">
          {(control) => (
            <Textarea {...control} name="message" placeholder={copy.fields.message.placeholder} />
          )}
        </FormField>
      </div>

      {options !== null && (
        <HoneypotField
          id="contact-honeypot"
          name={options.honeypotField}
          label={copy.honeypotLabel}
        />
      )}

      <div className="flex flex-col items-start gap-stack">
        <Button
          type="submit"
          aria-disabled={pending || undefined}
          // `<Button>` lets clicks pass through an aria-disabled button. Not
          // here: a second click would land on the page behind it and take
          // focus off the button. It is kept, and `inFlight` ignores it.
          // The ring is white, as every other control's here: the global
          // blue is 1.84:1 on this ground.
          className="group focus-visible:outline-white aria-disabled:pointer-events-auto aria-disabled:cursor-progress"
        >
          {pending ? (
            <>
              <LoaderCircle
                className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
                focusable="false"
              />
              {copy.pending}
            </>
          ) : (
            <>
              {copy.submit}
              <ArrowGlyph />
            </>
          )}
        </Button>

        <FormStatus
          message={status}
          announcement={announcement}
          className="w-full empty:-mt-stack"
        />
      </div>
    </form>
  );
}
