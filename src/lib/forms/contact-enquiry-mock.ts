import type { ContactFormOptions, EnquiryOutcome } from './contact-enquiry';

/**
 * The contact form while `CONTENT_SOURCE=mock`: options and a submission
 * that need no backend, so the form can be built and reviewed without one.
 * The options are docs/api-contracts.md §8.1's example, verbatim.
 *
 * **Nothing is sent or kept.** The reference says so, and so does the
 * console. A build made with `mock` is not a site anyone should be writing to
 * (/CLAUDE.md §7: a production build is made with `CONTENT_SOURCE=api`).
 */
export const MOCK_CONTACT_FORM_OPTIONS: ContactFormOptions = {
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

export function submitMockEnquiry(): Promise<EnquiryOutcome> {
  console.info('[contact] CONTENT_SOURCE=mock: the enquiry was not sent anywhere.');
  return Promise.resolve({ ok: true, reference: 'ENQ-MOCK-000000' });
}
