import type { ContactFormCopy } from '@/components/forms/contact-form';
import type { ContactDetailsProps } from '@/components/sections/contact-details';
import type { PageHeroProps } from '@/components/sections/page-hero';
import type { MapEmbedProps } from '@/components/ui/map-embed';
import { TODO_CONTENT } from '@/lib/config/site';
import { SOCIAL_LINKS, type SocialLink } from '@/lib/content/static/footer';
import { CONTACT_LIMITS } from '@/lib/forms/contact';
import { legacyOrBlobUrl } from '@/lib/utils/blob-url';

/**
 * Contact Us — `/contact-us/`. Static: an address, a phone number and a form
 * that change with a deploy, not with a database row. /CLAUDE.md §6.
 *
 * **Transcribed from the legacy https://www.sael.co/contact-us/**, read from
 * its raw HTML on 2026-10-01: the title and the line under it, the hero's
 * video, the three details with their labels, the "GET IN TOUCH" eyebrow,
 * the form's labels, placeholders, options and button, the social heading
 * and its four profiles, and the map's embed URL. Each is the source's own
 * text with only its whitespace collapsed.
 *
 * Three things on the legacy page differ from what one might expect, and are
 * kept as the source has them:
 *
 *  - The line under the title is **"For any assistance, reach out to us"**.
 *    A "Reach out to us" heading also appears in the source, above the
 *    address, but it is commented out, so it is not on the page.
 *  - The phone number is written **"011 4491 0011"** here, where Investor
 *    Contact and the footer write it "011-44910011". Each page keeps its own.
 *  - The social profiles are the site's own (`SOCIAL_LINKS`), which are the
 *    four the legacy page links.
 *
 * **The email address was decoded, not guessed.** The legacy page shows
 * "[email protected]": Cloudflare replaces it with a hex string whose first
 * byte is a key, each following byte XORed with it giving one character.
 * `caa3a4aca58ab9abafa6e4a9a5`, key `0xca` → info@sael.co, decoded on
 * 2026-10-01. It is the only obfuscated address on the page.
 *
 * **New strings, written for this build and awaiting the client's approval**
 * — the legacy page has no visible equivalent: every error and status message
 * in `contactFormCopy` below (from `errors` down, `formUnavailable` included), the button's "Sending…",
 * the honeypot's label, the map's control, note and title, "Get directions"
 * and "Open in Google Maps". Each is marked
 * `NEW` where it is defined. "opens in a new tab" is the site's existing note.
 *
 * The legacy page ships `<meta name="description" content="">`, so there is
 * no description to transcribe and none is invented; `buildMetadata()` drops
 * the marker.
 */

const ADDRESS =
  'SAEL Industries Limited, Unit No. 302-305, Third Floor, Worldmark-1, Aerocity, IGI Airport, New Delhi - 110037';
const EMAIL = 'info@sael.co';
const NEW_TAB_NOTE = 'opens in a new tab';

/**
 * The address in Google Maps itself, by the documented Maps URLs search
 * (developers.google.com/maps/documentation/urls) on the address as written
 * — derived from the text above rather than copied from anywhere, so it
 * cannot point somewhere the address does not say.
 */
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

/** Directions to the address, by the same documented Maps URLs scheme. */
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;

export const contactPage: {
  path: string;
  meta: { title: string; description: string };
} = {
  path: '/contact-us/',
  meta: { title: 'Contact Us - SAEL', description: TODO_CONTENT },
};

/**
 * The hero — the business pages' `<PageHero>`, a looping video behind the
 * title, at the client's request of 2026-10-01; the page opened on the
 * investor pages' ripple band before that.
 *
 * **The video is the legacy page's own**: its banner plays
 * `/video/green-growth-video.mp4` (567 KB, where Solar Energy's is 12.6 MB),
 * muted and looping, behind the same title and line. It is not
 * in the blob container yet, so while `LEGACY_ASSET_BASE_URL` is set it plays
 * from the legacy site, as the Newsroom's images do; unset, it is read from
 * `web-assets/media/contact-us/green-growth-video.mp4`, which is where it
 * should be uploaded — the business pages' arrangement, file name kept.
 *
 * No poster yet, as on Solar Energy, Agri Waste-to-Energy and Module
 * Manufacturing: the legacy page has none, so a reduced-motion visitor sees
 * the title over the dark ground until one is supplied.
 */
export const contactHero: PageHeroProps = {
  title: 'Contact Us',
  intro: 'For any assistance, reach out to us',
  align: 'center',
  video: legacyOrBlobUrl(
    'web-assets/media/contact-us/green-growth-video.mp4',
    '/video/green-growth-video.mp4',
  ),
  image: null,
  pending: 'contact-us/hero-poster',
  // Decorative: the title and the line over it say all there is to say.
  imageAlt: '',
};

export const contactDetails: ContactDetailsProps = {
  items: [
    { kind: 'address', label: 'Address', value: ADDRESS },
    { kind: 'tel', label: 'Phone', value: '011 4491 0011' },
    { kind: 'email', label: 'Email', value: EMAIL },
  ],
  // NEW — the legacy page has the embedded map and no link.
  mapLink: { label: 'Open in Google Maps', href: MAPS_URL },
  newTabNote: NEW_TAB_NOTE,
};

/**
 * The office map. `embedUrl` is the legacy iframe's `src`, verbatim: Google's
 * pin for "Worldmark 1", Aerocity. It loads only when a visitor asks for it
 * (`ui/map-embed.tsx`).
 */
export const contactMap: Omit<MapEmbedProps, 'preview' | 'className'> = {
  embedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.6394394138842!2d77.11879537559066!3d28.5505553757095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1c6bdc555555%3A0xdeec51b96759657f!2sWorldmark%201!5e0!3m2!1sen!2sin!4v1714632835093!5m2!1sen!2sin',
  mapsUrl: MAPS_URL,
  // NEW — the two below.
  title: 'Map showing the SAEL office at Worldmark-1, Aerocity, New Delhi',
  loadLabel: 'Show map',
  newTabNote: NEW_TAB_NOTE,
};

/**
 * The words beside the map (`<ContactRow>`): what it shows — the details' own
 * label and address, verbatim — a way there, and what loading it does.
 */
export const contactMapCaption = {
  label: 'Address',
  address: ADDRESS,
  // NEW — the two below.
  directions: { label: 'Get directions', href: DIRECTIONS_URL },
  note: 'The map is loaded from Google Maps, which may set cookies.',
  newTabNote: NEW_TAB_NOTE,
};

/**
 * Where the office sits on the dotted India map in the map's preview
 * (`<MapBeacon>`): Solar Energy's Delhi pin, `x: 94.6, y: 84` in
 * `_content/solar-energy.ts`, so the two maps agree. Like every pin there it
 * is fitted, not measured — at this scale all of Delhi is a few pixels, which
 * is as precise as a picture of India needs to be; the loaded map is the
 * precise one.
 */
export const contactOffice = { x: 94.6, y: 84 };

/** The form's heading. The eyebrow is the legacy "tinyText", in the source's own capitals. */
export const contactFormHeading = {
  eyebrow: 'GET IN TOUCH',
  title: 'Send us a message',
  id: 'contact-form-heading',
};

export const contactFormCopy: ContactFormCopy = {
  // Keyed by the backend's field names (docs/api-contracts.md §8.2); the
  // labels and placeholders are the legacy form's.
  fields: {
    fullName: { label: 'Name', placeholder: 'Full Name' },
    email: { label: 'Email', placeholder: 'Email Address' },
    phone: { label: 'Contact', placeholder: 'Contact Number' },
    subjectCode: { label: 'Subject', placeholder: 'Select Option' },
    message: { label: 'Message', placeholder: 'Your Message' },
  },
  requiredMarker: '*',
  submit: 'Send Message',

  // NEW — everything from here down.
  pending: 'Sending…',
  honeypotLabel: 'Leave this field empty',
  errors: {
    fullName: {
      required: 'Enter your name',
      'too-long': `Name must be ${String(CONTACT_LIMITS.fullName)} characters or fewer`,
      invalid: 'Enter your name',
    },
    email: {
      required: 'Enter your email address',
      'too-long': `Email address must be ${String(CONTACT_LIMITS.email)} characters or fewer`,
      invalid: 'Enter an email address in the correct format, like name@example.com',
    },
    phone: {
      required: 'Enter your contact number',
      invalid:
        'Enter a contact number of 7 to 15 digits. You can use +, spaces, brackets and hyphens',
    },
    subjectCode: {
      required: 'Select a subject',
      invalid: 'Select a subject from the list',
    },
    message: {
      required: 'Enter your message',
      // `{max}` is the backend's `maxMessageLength`, from the form's options.
      'too-long': 'Message must be {max} characters or fewer',
      invalid: 'Enter your message',
    },
  },
  summaryTitle: 'Please correct the following:',
  sent: 'Thank you. Your message has been sent.',
  reference: 'Your reference number is {referenceId}.',
  rateLimited:
    'Too many messages have been sent in a short time. Please wait a few minutes and try again.',
  unavailable: `Your message could not be sent. Please try again later, or email us at ${EMAIL}.`,
  // In place of the form when it cannot be shown: its options did not load,
  // or the backend has it switched off (docs/api-contracts.md §8.1).
  formUnavailable: `The form is unavailable at the moment. Please email us at ${EMAIL}.`,
};

/**
 * "Join Our Online Community", verbatim, over the site's own social profiles
 * — `SOCIAL_LINKS`, the footer's list, which since 2026-10-06 points at the
 * same four profiles the legacy page links. One list, so the page and the
 * footer cannot disagree.
 */
export const contactSocial: {
  heading: string;
  links: readonly SocialLink[];
  newTabNote: string;
} = {
  heading: 'Join Our Online Community',
  links: SOCIAL_LINKS,
  newTabNote: NEW_TAB_NOTE,
};
