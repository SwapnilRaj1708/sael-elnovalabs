import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { contactFormSchema } from './contact.ts';
import { MOCK_CONTACT_FORM_OPTIONS, submitMockEnquiry } from './contact-enquiry-mock.ts';
import {
  buildSubmission,
  CONTACT_ENQUIRY_PATH,
  CONTACT_OPTIONS_PATH,
  fieldErrorsFromResponse,
  loadContactOptions,
  submitEnquiry,
  type ContactFormOptions,
} from './contact-enquiry.ts';

/** The backend's options as §8.1 documents them. */
const OPTIONS: ContactFormOptions = {
  enabled: true,
  subjects: [
    { code: 'BUSINESS_ENQUIRY', label: 'Business Enquiry' },
    { code: 'JOB_VACANCY', label: 'Job Vacancy' },
    { code: 'OTHER', label: 'Other' },
  ],
  maxMessageLength: 5000,
  antibot: { provider: 'NONE', siteKey: null },
  honeypotField: 'company_website',
};

const VALUES = {
  fullName: 'Asha Rao',
  email: 'asha@example.com',
  phone: '+91 98765 43210',
  subjectCode: 'BUSINESS_ENQUIRY',
  message: 'Hello',
};

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function html(status: number): Response {
  return new Response('<html><body>Bad Gateway</body></html>', {
    status,
    headers: { 'Content-Type': 'text/html' },
  });
}

/** Replaces `fetch` for one test; the returned mock records every call. */
function answerWith(respond: () => Response | Promise<Response>) {
  return mock.method(globalThis, 'fetch', () => Promise.resolve(respond()));
}

function requestOf(fetchMock: ReturnType<typeof answerWith>) {
  const args = fetchMock.mock.calls[0]?.arguments;
  assert.ok(args !== undefined, 'fetch was not called');
  const [url, init] = args;
  assert.ok(init !== undefined, 'fetch was called without options');
  return { url, init };
}

afterEach(() => {
  mock.restoreAll();
});

describe('buildSubmission', () => {
  it('buildSubmission_validValues_usesTheBackendFieldNames', () => {
    const payload = buildSubmission(VALUES, OPTIONS, { sourcePage: '/contact-us/', honeypot: '' });

    assert.deepEqual(payload, {
      fullName: 'Asha Rao',
      email: 'asha@example.com',
      phone: '+91 98765 43210',
      subjectCode: 'BUSINESS_ENQUIRY',
      message: 'Hello',
      sourcePage: '/contact-us/',
      captchaToken: null,
      company_website: '',
    });
  });

  it('buildSubmission_honeypotRenamedInOptions_sendsItUnderTheNewName', () => {
    const payload = buildSubmission(
      VALUES,
      { honeypotField: 'fax_number' },
      { sourcePage: '/contact-us/', honeypot: 'filled by a bot' },
    );

    assert.equal(payload.fax_number, 'filled by a bot');
    assert.equal('company_website' in payload, false);
    assert.equal('website' in payload, false);
  });

  it('buildSubmission_sourcePageOver200_isNotSent', () => {
    const payload = buildSubmission(VALUES, OPTIONS, {
      sourcePage: `/${'a'.repeat(200)}`,
      honeypot: '',
    });

    assert.equal(payload.sourcePage, null);
  });
});

describe('submitEnquiry', () => {
  const payload = buildSubmission(VALUES, OPTIONS, { sourcePage: '/contact-us/', honeypot: '' });

  it('submitEnquiry_anyCall_postsJsonToTheRelativeBackendPath', async () => {
    const fetchMock = answerWith(() => json(202, { reference: 'ENQ-2026-000123', message: 'x' }));

    await submitEnquiry(payload);

    const { url, init } = requestOf(fetchMock);
    assert.equal(url, CONTACT_ENQUIRY_PATH);
    assert.equal(url, '/app/v1/contact-enquiry');
    assert.equal(init.method, 'POST');
    assert.deepEqual(init.headers, {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    assert.ok(typeof init.body === 'string');
    assert.deepEqual(JSON.parse(init.body), payload);
  });

  it('submitEnquiry_202WithReceipt_isSent', async () => {
    answerWith(() =>
      json(202, { reference: 'ENQ-2026-000123', message: "Thank you — we'll be in touch." }),
    );

    assert.deepEqual(await submitEnquiry(payload), { ok: true, reference: 'ENQ-2026-000123' });
  });

  it('submitEnquiry_2xxWithoutReceipt_isNotSent', async () => {
    answerWith(() => new Response('<html>Welcome</html>', { status: 200 }));
    assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'unavailable' });

    mock.restoreAll();
    answerWith(() => json(202, { message: 'no reference' }));
    assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'unavailable' });
  });

  it('submitEnquiry_400WithFieldErrorList_mapsEachEntryToItsField', async () => {
    answerWith(() =>
      json(400, {
        timestamp: '2026-10-08T10:00:00.000+05:30',
        correlationId: 'c0ffee',
        code: 'INTAKE_VALIDATION_FAILED',
        message: 'Please check the form and try again.',
        fieldErrors: [
          { field: 'fullName', code: 'NotBlank', message: 'Name is required.' },
          { field: 'email', code: 'Email', message: 'Please enter a valid email address.' },
          { field: 'phone', code: 'Pattern', message: 'Contact may contain only …' },
          { field: 'subjectCode', code: 'Subject', message: 'Please choose a subject …' },
          { field: 'message', code: 'Size', message: 'Message must be at most 5000 …' },
          { field: 'sourcePage', code: 'Size', message: 'Source page must be at most 200 …' },
        ],
      }),
    );

    assert.deepEqual(await submitEnquiry(payload), {
      ok: false,
      error: 'invalid',
      fieldErrors: {
        fullName: 'required',
        email: 'invalid',
        phone: 'invalid',
        subjectCode: 'invalid',
        message: 'too-long',
      },
    });
  });

  it('submitEnquiry_400NamingNoFormField_isUnavailable', async () => {
    answerWith(() =>
      json(400, {
        code: 'INTAKE_VALIDATION_FAILED',
        message: 'x',
        fieldErrors: [{ field: 'sourcePage', code: 'Size', message: 'x' }],
      }),
    );
    assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'unavailable' });

    // ContactFormBodyGuard: the same code, no fieldErrors at all.
    mock.restoreAll();
    answerWith(() =>
      json(400, { code: 'INTAKE_VALIDATION_FAILED', message: 'The submission is too large.' }),
    );
    assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'unavailable' });
  });

  it('submitEnquiry_400OtherCodes_isUnavailable', async () => {
    for (const code of ['INTAKE_CAPTCHA_FAILED', 'MALFORMED_REQUEST']) {
      mock.restoreAll();
      answerWith(() => json(400, { code, message: 'x' }));
      assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'unavailable' }, code);
    }
  });

  it('submitEnquiry_429_isRateLimited', async () => {
    answerWith(() =>
      json(
        429,
        { code: 'INTAKE_RATE_LIMITED', message: 'Too many submissions.' },
        { 'Retry-After': '2400' },
      ),
    );
    assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'rate-limited' });

    // nginx's own 429 page is still a 429.
    mock.restoreAll();
    answerWith(() => html(429));
    assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'rate-limited' });
  });

  it('submitEnquiry_5xx_isUnavailable', async () => {
    const answers = [
      () => json(503, { code: 'INTAKE_DISABLED', message: 'x' }),
      () => json(500, { code: 'INTERNAL_ERROR', message: 'x' }),
      () => html(502),
      () => html(504),
    ];
    for (const answer of answers) {
      mock.restoreAll();
      answerWith(answer);
      assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'unavailable' });
    }
  });

  it('submitEnquiry_networkFailure_isUnavailable', async () => {
    mock.method(globalThis, 'fetch', () => Promise.reject(new TypeError('Failed to fetch')));

    assert.deepEqual(await submitEnquiry(payload), { ok: false, error: 'unavailable' });
  });
});

describe('fieldErrorsFromResponse', () => {
  it('fieldErrorsFromResponse_repeatedField_keepsTheFirstEntry', () => {
    assert.deepEqual(
      fieldErrorsFromResponse([
        { field: 'email', code: 'NotBlank' },
        { field: 'email', code: 'Email' },
        { field: 'captchaToken', code: 'Size' },
      ]),
      { email: 'required' },
    );
  });
});

describe('loadContactOptions', () => {
  it('loadContactOptions_anyCall_getsTheRelativePathUncached', async () => {
    const fetchMock = answerWith(() => json(200, OPTIONS));

    await loadContactOptions();

    const { url, init } = requestOf(fetchMock);
    assert.equal(url, CONTACT_OPTIONS_PATH);
    assert.equal(url, '/app/v1/contact-form/options');
    assert.equal(init.method, undefined);
    assert.equal(init.cache, 'no-store');
  });

  it('loadContactOptions_validOptions_areReady', async () => {
    answerWith(() => json(200, OPTIONS));

    assert.deepEqual(await loadContactOptions(), { state: 'ready', options: OPTIONS });
  });

  it('loadContactOptions_failedRequest_isUnavailable', async () => {
    const answers = [
      () => json(500, { code: 'INTERNAL_ERROR' }),
      () => html(502),
      () => json(404, { code: 'RESOURCE_NOT_FOUND' }),
      () => new Response('not json', { status: 200 }),
      () => json(200, { enabled: true }),
    ];
    for (const answer of answers) {
      mock.restoreAll();
      answerWith(answer);
      assert.deepEqual(await loadContactOptions(), { state: 'unavailable' });
    }

    mock.restoreAll();
    mock.method(globalThis, 'fetch', () => Promise.reject(new TypeError('Failed to fetch')));
    assert.deepEqual(await loadContactOptions(), { state: 'unavailable' });
  });

  it('loadContactOptions_formThatCannotBeSubmitted_isUnavailable', async () => {
    const unusable: ContactFormOptions[] = [
      { ...OPTIONS, enabled: false },
      { ...OPTIONS, subjects: [] },
      { ...OPTIONS, antibot: { provider: 'TURNSTILE', siteKey: 'site-key' } },
      { ...OPTIONS, honeypotField: 'email' },
    ];
    for (const options of unusable) {
      mock.restoreAll();
      answerWith(() => json(200, options));
      assert.deepEqual(await loadContactOptions(), { state: 'unavailable' });
    }
  });
});

describe('mock mode', () => {
  it('mockOptions_matchTheDocumentedExample', () => {
    assert.deepEqual(MOCK_CONTACT_FORM_OPTIONS, OPTIONS);
  });

  it('submitMockEnquiry_anyCall_neverCallsFetch', async () => {
    const fetchMock = answerWith(() => json(500, {}));
    mock.method(console, 'info', () => undefined);

    const outcome = await submitMockEnquiry();

    assert.equal(fetchMock.mock.callCount(), 0);
    assert.equal(outcome.ok, true);
  });
});

describe('contactFormSchema', () => {
  it('contactFormSchema_subjectNotInOptions_isInvalid', () => {
    const schema = contactFormSchema(OPTIONS);

    assert.equal(schema.safeParse(VALUES).success, true);
    assert.equal(schema.safeParse({ ...VALUES, subjectCode: 'Business Enquiry' }).success, false);
  });

  it('contactFormSchema_beforeOptionsLoad_acceptsNoSubject', () => {
    const result = contactFormSchema(null).safeParse(VALUES);

    assert.ok(!result.success);
    assert.deepEqual(
      result.error.issues.map((issue) => issue.path[0]),
      ['subjectCode'],
    );
  });

  it('contactFormSchema_messageLength_isTheOptionsLimitInCodePoints', () => {
    const schema = contactFormSchema({ ...OPTIONS, maxMessageLength: 3 });

    // Three emoji: six UTF-16 units, three characters to the backend.
    assert.equal(schema.safeParse({ ...VALUES, message: '🌞🌞🌞' }).success, true);
    assert.equal(schema.safeParse({ ...VALUES, message: '🌞🌞🌞🌞' }).success, false);
  });

  it('contactFormSchema_lengthBounds_matchTheBackend', () => {
    const schema = contactFormSchema(OPTIONS);

    assert.equal(schema.safeParse({ ...VALUES, fullName: 'a'.repeat(180) }).success, true);
    assert.equal(schema.safeParse({ ...VALUES, fullName: 'a'.repeat(181) }).success, false);
    assert.equal(
      schema.safeParse({ ...VALUES, email: `${'a'.repeat(243)}@example.com` }).success,
      true,
    );
    assert.equal(
      schema.safeParse({ ...VALUES, email: `${'a'.repeat(244)}@example.com` }).success,
      false,
    );
  });
});
