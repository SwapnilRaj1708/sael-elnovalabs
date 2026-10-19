import type { ProseBlock } from '@/components/sections/longform-prose';

/**
 * The three site-wide legal pages: Disclaimer, Privacy Policy, Terms &
 * Conditions.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ STAND-IN TEXT — NOT REVIEWED BY SAEL FOR THE NEW SITE.                  │
 * │                                                                         │
 * │ Every word below is sael.co's (the previous site), transcribed verbatim │
 * │ from the raw HTML of /disclaimer/, /privacy-policy/ and                 │
 * │ /terms-and-conditions/ on 2026-10-06. No SAEL-reviewed legal text       │
 * │ existed when these pages were built, and a legal page of TODOs is worse │
 * │ than the old one. /CLAUDE.md §2 rule 8, docs/content-model.md §1.1:     │
 * │ this is a flagged stand-in, awaiting SAEL / legal sign-off.             │
 * │                                                                         │
 * │ Do not edit it to "correct" it — typos and all, it is legal text, and   │
 * │ changing a word changes its meaning. It changes when SAEL supply        │
 * │ reviewed text.                                                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * The emails were Cloudflare-obfuscated (`data-cfemail`) on the legacy pages
 * and are decoded here, not guessed. The legacy pages state no "last
 * updated" date, so none is shown. Their `<title>`s are carried over
 * verbatim; their `<meta name="description">` is empty, so there is none.
 *
 * This is **not** the investor area's consent disclaimer
 * (`gate.disclaimerHtml`, maintained in the admin panel). That is a
 * different document; the two share nothing.
 */

export interface LegalPage {
  path: string;
  /** The `<h1>`, verbatim. */
  title: string;
  meta: { title: string };
  blocks: readonly ProseBlock[];
}

export const disclaimerPage: LegalPage = {
  path: '/disclaimer/',
  title: 'Disclaimer',
  meta: { title: 'Disclaimer - SAEL' },
  blocks: [
    {
      kind: 'paragraph',
      children: [
        'All the information published on this official website- ',
        { kind: 'strong', children: ['www.sael.co'] },
        ' - provides general information about SAEL (the ‘Company’). The Company has made reasonable efforts to keep the information regarding its business profile, company structure, products, services, facilities etc. and it does not make any representations or warranties about the completeness, reliability and accuracy of this information. Any action taken after consuming the information from this website, is strictly at your own risk. The Company will not be responsible for any losses occur to you in connection with information obtained from our website. Please consult a professional for specific advice related to your situation.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'You are authorized to collect the information from our website for your own consumption and benefit. Any modification, alteration, reproduction or distribution of the information obtained from this website is completely prohibited. Spread of information including the publication, whether in hard copy or software form for commercial gain is also prohibited.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'On our official website you may find the useful and quality links of other external websites which certainly not in our control. The content of those websites may change by the owners without our notice, for which Company is not responsible.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'You agree to indemnify, defend and hold the Company, its affiliates, its employees and all other representatives harmless from and against any and all claims, damages, losses, costs (including without limitation reasonable attorney’s fees) or other expenses that arise directly or indirectly out of or from your activities in connection with this website.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'After visiting and viewing this website, you are giving consent for jurisdiction of the courts at Delhi, India in respect of any action or dispute arising therefrom or relater hereto.',
      ],
    },
  ],
};

export const privacyPolicyPage: LegalPage = {
  path: '/privacy-policy/',
  title: 'Privacy Policy',
  meta: { title: 'Privacy Policy - SAEL' },
  blocks: [
    {
      kind: 'paragraph',
      children: [
        'We, SAEL (the ‘Company’) always respect the privacy and provide security to the information shared by you to our official website.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'You can access Company’s official website without providing the personal information until or unless it’s required by you to provide. The definition of ‘Personal Information’ is broadly explained under Rule 2 (1) (i) of the Information Technology (Reasonable security practices and procedures and sensitive personal data or information) Rules, 2011, same is reproduced hereunder:-',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        {
          kind: 'em',
          children: [
            '“(i) "Personal information" means any information that relates to a natural person, which, either directly or indirectly, in combination with other information available or likely to be available with a body corporate, is capable of identifying such person.”',
          ],
        },
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'Therefore, in case of an individual or a corporate, the personal information may include the credentials such as name, title, company, address, phone number, email address, comments, suggestions etc.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'This official website of the Company contains a number of pages that may give options to you to submit personal information to the Company. Any proposal, request, enquiry, application or suggestion made by you may be passed or made available internally within the Company or to a third parties. In the event of receipt of these personal information, the Company or the other third parties are required to comply with the ‘Privacy Policy’ to protect the personal information shared by you.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'It is noteworthy to mention that, the said information may be considered for the purpose(s) for which it was submitted including but not limited to the related business purposes, queries, enquiry etc. You, by submitting personal information on this website, shall be consenting to consume the information in the manner as described above.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'The Company has absolute right to revise its ‘Privacy Policy’ from time to time as and when required and revision to our ‘Privacy Policy’ shall have retrospective effect to all personal information or data shared by you earlier through Company’s official website. Needless to say that, access to any other third party websites through Company’s official website are not covered by this ‘Privacy Policy’ and the Company does not hold or accept any responsibility or liability in respect of such third party websites.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'Our primary aim is to preserve your information in a very same manner as it was provided initially. If you have any query regarding personal information or would like to change, revise or delete the details provided to us, please write us on our e-mail at ',
        { kind: 'strong', children: [{ kind: 'email', address: 'info@sael.co' }] },
        '; and for investors at: ',
        { kind: 'strong', children: [{ kind: 'email', address: 'investors@sael.co' }] },
        '.',
      ],
    },
  ],
};

export const termsAndConditionsPage: LegalPage = {
  path: '/terms-and-conditions/',
  title: 'Terms & Conditions',
  meta: { title: 'Terms & Conditions - SAEL' },
  blocks: [
    { kind: 'heading', level: 2, text: 'AGREEMENT WITH USER' },
    {
      kind: 'paragraph',
      children: [
        'Welcome to the official website ',
        { kind: 'strong', children: ['www.sael.co'] },
        ' (the ‘Website’), which is fully owned and operated by SAEL (the ‘Company’). By accessing or visiting the Website for any purpose whatsoever, you shall be deemed to have accepted the following terms and conditions (the ‘Terms and Conditions’), which govern and regulate the usage of the Website by its user. Please read the following Terms and Conditions carefully before using the website.',
      ],
    },
    { kind: 'heading', level: 3, text: '1. Conditions of Use' },
    {
      kind: 'paragraph',
      children: [
        'By using this website, you certify that you have read and reviewed these Terms and Conditions and that you agree to comply with all the guidelines and recommendations mentioned therein. If you disagree with any part of these Terms and Conditions and/or do not want to be bound by the Terms and Conditions, you are advised to stop using the Website accordingly. The company only grants use and access of this website, its products, and its services to those who have accepted its terms and conditions.',
      ],
    },
    { kind: 'heading', level: 3, text: '2. License' },
    {
      kind: 'paragraph',
      children: [
        'By using this Website, you are granted a limited, non-exclusive, non-transferable right to view the content and materials on the Website in connection with your normal, non-commercial use of the Website. You should not transmit, modify, interrupt, attempt to interrupt, intrude, or attempt to intrude on the operation of the website. Further, you should not post anything obscene, defamatory, obscure, annoying, intimidating, or harmful to anyone, including the company, in any manner.',
      ],
    },
    { kind: 'heading', level: 3, text: '3. User Acknowledgement' },
    {
      kind: 'paragraph',
      children: [
        'You acknowledge that you may only view or download the content on this website for your own non-commercial usage. On our Website you may find the useful and quality links of other third-party websites, which certainly are not in our control. The content of those websites may change by the owners without our notice, for which the company is not responsible.',
      ],
    },
    { kind: 'heading', level: 3, text: '4. Privacy Policy' },
    {
      kind: 'paragraph',
      children: [
        'We respect privacy and provide security for the information shared by you on our Website. It is advisable, before you continue using our Website, to read our policy regarding our user data collection. It will help you better understand our practices.',
      ],
    },
    { kind: 'heading', level: 3, text: '5. Age Restriction' },
    {
      kind: 'paragraph',
      children: [
        'This Website is intended for use by individuals 18 (eighteen) years of age or older. This Website is not directed for use by individuals under the age of 18 without getting the assistance of a parent or guardian to use this Website. By using this Website, you warrant that you are at least 18 years of age, and you may legally adhere to the Terms and Conditions. The company assumes no responsibility for liabilities related to age misrepresentation by any user.',
      ],
    },
    { kind: 'heading', level: 3, text: '6. Registration or User Accounts' },
    {
      kind: 'ordered-list',
      items: [
        [
          'This Website contains a number of pages, and, as a user, you may be asked to register with us and provide personal information such as name, title, age, gender, company, address, phone number, email address, etc. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information. You are also responsible for all activities that occur under your account or password.',
        ],
        [
          'If you think there are any possible issues regarding the security of your account on the Website, inform us immediately so we may address them accordingly.',
        ],
        [
          'We reserve all rights to terminate accounts, edit or remove content, and cancel orders at our sole discretion.',
        ],
      ],
    },
    { kind: 'heading', level: 3, text: '7. Intellectual Property Rights' },
    {
      kind: 'paragraph',
      children: [
        'You agree that all materials, products, and services provided on this Website are the property of the Company, its affiliates, directors, officers, employees, agents, suppliers, or licensors, including all copyrights, trade secrets, trademarks, patents, and other intellectual property. You also agree that you will not reproduce or redistribute the company’s intellectual property in any way, including electronic, digital, or new trademark registrations.',
      ],
    },
    {
      kind: 'paragraph',
      children: [
        'You grant the Company a royalty-free and non-exclusive license to display, use, copy, transmit, and broadcast the content you upload and publish. For issues regarding intellectual property claims, you should contact the company on our e-mail at ',
        { kind: 'strong', children: [{ kind: 'email', address: 'info@sael.co' }] },
        '.',
      ],
    },
    { kind: 'heading', level: 3, text: '8. Limitation of Liability' },
    {
      kind: 'paragraph',
      children: [
        'The Company shall not be liable for any damage that may occur to you as a result of your misuse of our Website. We reserve the right to edit, modify, and change these Terms and Conditions. We shall let our users know about these changes through e-mails. These Terms and Conditions are an understanding between the Company and the user, and this supersedes and replaces all prior agreements regarding the use of this Website.',
      ],
    },
    { kind: 'heading', level: 3, text: '9. Indemnification' },
    {
      kind: 'paragraph',
      children: [
        'You agree to indemnify the Company, its affiliates, its employees, and its representatives against legal claims and demands that may arise from your use or misuse of our services. We reserve the right to select our own legal counsel.',
      ],
    },
    { kind: 'heading', level: 3, text: '10. Disclaimer of Warranties' },
    {
      kind: 'paragraph',
      children: [
        'Your use of this Website is at your sole risk. The Website and services available therein are offered on an "as is" and "as available" basis. It is advisable, before you continue using our Website, to read. It will help you better understand our practices.',
      ],
    },
    { kind: 'heading', level: 3, text: '11. Governing Laws' },
    {
      kind: 'paragraph',
      children: [
        'By using this Website, you are consenting that the laws of India and the courts at Delhi, India, shall have the exclusive jurisdiction on any action or dispute that may arise out of the use of this Website.',
      ],
    },
  ],
};
