import { env } from '@/lib/config/env';
import { isProductionOrigin, PRODUCTION_URL } from '@/lib/config/production-origin';

export { PRODUCTION_URL };

/**
 * Marker for copy the client has not supplied yet. Grep for it before launch.
 * Never replace one of these with a plausible-looking value — see /CLAUDE.md §3.
 */
export const TODO_CONTENT = '{{TODO: content}}';

/**
 * Declared explicitly rather than inferred from the literal.
 *
 * With `as const`, every unsupplied field narrows to the type
 * `'{{TODO: content}}'`, and TypeScript then reports the `!== TODO_CONTENT`
 * guards at the call sites as impossible comparisons. Those guards are the
 * whole point — they are what keeps a placeholder out of the footer, out of a
 * `mailto:` and out of the `sameAs` in structured data. So the fields are
 * typed as what they will hold once the client supplies them: `string`.
 */
export interface SiteConfig {
  name: string;
  legalName: string;
  url: string;
  registeredOffice: string;
  cin: string;
  telephone: string;
  /** `TODO_CONTENT` until the client supplies it. Check before rendering. */
  email: string;
  /** Each is `TODO_CONTENT` until supplied. Check before rendering. */
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    x: string;
  };
}

export const siteConfig: SiteConfig = {
  name: 'SAEL',
  legalName: 'SAEL INDUSTRIES LIMITED',
  url: env.NEXT_PUBLIC_SITE_URL,
  registeredOffice: 'H. No. 44, Model Town, Firozpur, Guruharsahai, Punjab, India, 152022',
  cin: 'U40106PB2022PLC055755',
  telephone: '011-44910011',
  email: 'info@sael.co',
  // social: {
  //   facebook: TODO_CONTENT,
  //   instagram: TODO_CONTENT,
  //   linkedin: TODO_CONTENT,
  //   x: TODO_CONTENT,
  // },
  social: {
    facebook: 'https://www.facebook.com/SAELIndustriesLimited/',
    instagram: 'https://www.instagram.com/sael_india/',
    linkedin: 'https://www.linkedin.com/company/saelindustries',
    x: 'https://x.com/SAEL_India',
  },
};

/**
 * Whether this deployment is the real public site, which is what decides `noindex`. The build
 * prints the same decision (next.config.ts), so it is never made silently.
 */
export const isPublicSite: boolean = isProductionOrigin(siteConfig.url);
