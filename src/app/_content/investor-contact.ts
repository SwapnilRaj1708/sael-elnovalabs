import type { ContactBlock } from '@/components/sections/contact-blocks';
import { investorPage, type InvestorPage } from './investors';

/**
 * The Investor Contact page — static, because it is: three addresses and a
 * named officer that change with a board resolution and a deploy, not with a
 * database row. /CLAUDE.md §6, docs/content-model.md §1.
 *
 * **Transcribed from the legacy https://www.sael.co/investors/contact-us/**,
 * read from its raw HTML on 2026-09-30 by parser, not by eye: every label
 * with its colon ("Email ID:", "Phone No.:"), every value with only the
 * source's whitespace collapsed. The Registered Office address is this
 * page's own wording ("Guruharsahai, Firozpur, Punjab, 152022"), which is
 * not the footer's (`site.ts`) — each page keeps its own.
 *
 * **The email addresses were decoded, not guessed.** The legacy page shows
 * "[email protected]": Cloudflare replaces each address with a hex string in
 * `data-cfemail`, whose first byte is a key that each following byte is
 * XORed with to give one character. Decoded on 2026-09-30:
 *
 *   Registered Office  533a3d353c132032363f7d303c    → info@sael.co
 *   Corporate Office   fa93949c95ba899b9f96d49995    → info@sael.co
 *   Investor Contact   432030033022262f6d202c        → cs@sael.co
 *
 * No form and no map — the legacy page has neither. No consent notice.
 */
export const investorContactPage: InvestorPage = investorPage(
  '/investors/',
  'contact-us',
  'Investor Contact',
  'Investor Contact - SAEL',
);

/**
 * The three blocks, in the legacy tab order. `id` is the legacy tab id, so
 * `…/contact-us/#investorContact` still lands on the right block.
 */
export const investorContactBlocks: readonly ContactBlock[] = [
  {
    id: 'registeredOffice',
    heading: 'Registered Office',
    intro: null,
    fields: [
      { label: 'Company:', value: 'SAEL Industries Limited', kind: 'text' },
      {
        label: 'Address:',
        value: 'H. No. 44, Model Town, Guruharsahai, Firozpur, Punjab, 152022',
        kind: 'text',
      },
      { label: 'CIN:', value: 'U40106PB2022PLC055755', kind: 'text' },
      { label: 'Email ID:', value: 'info@sael.co', kind: 'email' },
      { label: 'Telephone:', value: '011-44910011', kind: 'tel' },
    ],
  },
  {
    id: 'corporateOffice',
    heading: 'Corporate Office',
    intro: null,
    fields: [
      { label: 'Company:', value: 'SAEL Industries Limited', kind: 'text' },
      {
        label: 'Address:',
        value:
          'SAEL, Unit No. 302-305, Third Floor, Worldmark-1, Aerocity, IGI Airport, New Delhi - 110037',
        kind: 'text',
      },
      { label: 'Email ID:', value: 'info@sael.co', kind: 'email' },
      { label: 'Telephone:', value: '011-44910011', kind: 'tel' },
    ],
  },
  {
    id: 'investorContact',
    heading: 'Investor Contact',
    intro: 'Name of the contact person in case of query/grievance:',
    fields: [
      { label: 'Name:', value: 'Mr. Vishal Garg', kind: 'text' },
      { label: 'Designation:', value: 'Company Secretary', kind: 'text' },
      { label: 'Company:', value: 'SAEL Industries Limited', kind: 'text' },
      { label: 'Phone No.:', value: '011-44910011', kind: 'tel' },
      { label: 'Email:', value: 'cs@sael.co', kind: 'email' },
    ],
  },
];
