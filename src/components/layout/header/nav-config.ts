import type { StaticImageData } from 'next/image';
import moduleManufacturing from '@/assets/images/nav/module-manufacturing.jpg';
import solarCellManufacturing from '@/assets/images/nav/solar-cell-manufacturing.jpg';
import solarEnergy from '@/assets/images/nav/solar-energy.jpg';
import wasteToEnergy from '@/assets/images/nav/waste-to-energy.jpg';

/**
 * The site's information architecture, in one array.
 *
 * The desktop nav, the mobile drawer, the footer link grid and `sitemap.ts`
 * all read from here. **A route that is not in this array does not exist as
 * far as the site is concerned** — which is the point: adding a page means
 * adding one entry, not remembering four places.
 *
 * The seven top-level items and the routes under them were taken from the
 * legacy site in FE-03; the routes must keep matching it (URL parity,
 * /CLAUDE.md §2 rule 6). **The Businesses labels and their order are SAEL's,
 * not sael.co's.** SAEL renamed and reordered them on 2026-10-01 (`5494e70`):
 * Solar Energy Generation, Solar Module Manufacturing, Solar Cell
 * Manufacturing, Agri Waste-To-Energy. The labels they replaced were sael.co's,
 * and sael.co is not grounds for restoring them (/CLAUDE.md §2 rule 8). Do not reorder
 * without checking `docs/features/03-app-shell-header-footer.md` §1.
 */

export interface NavItem {
  label: string;
  /**
   * Always with a trailing slash — the legacy site serves `/about-us/` and URL
   * parity is non-negotiable. `undefined` marks a menu trigger that is not
   * itself a page. docs/accessibility-and-seo.md §1.
   */
  href?: string;
  children?: readonly NavItem[];
  /**
   * Desktop dropdown thumbnail. Only the Businesses menu has these; Company,
   * Sustainability and Investors render as plain link lists.
   */
  image?: { src: StaticImageData; alt: string };
  /**
   * Leaves the site, so consumers render a plain anchor with
   * `rel="noopener noreferrer"` rather than a prefetching `<Link>`. Nothing
   * sets it today: `/career/` did, until it became a page on 2026-09-22.
   */
  external?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Company',
    children: [
      { label: 'About Us', href: '/about-us/' },
      { label: 'Our Team', href: '/our-team/' },
    ],
  },
  {
    label: 'Businesses',
    children: [
      {
        label: 'Solar Energy Generation',
        href: '/solar-energy/',
        image: { src: solarEnergy, alt: 'A SAEL engineer at a solar generation site' },
      },
      {
        label: 'Solar Module Manufacturing',
        href: '/module-manufacturing/',
        image: { src: moduleManufacturing, alt: 'A robotic arm placing a solar module' },
      },
      {
        label: 'Solar Cell Manufacturing',
        href: '/solar-cell-manufacturing/',
        image: {
          src: solarCellManufacturing,
          alt: 'The production line at a SAEL solar cell facility',
        },
      },
      {
        label: 'Agri Waste-to-Energy',
        href: '/waste-to-energy/',
        image: { src: wasteToEnergy, alt: 'Paddy straw on the conveyor at a SAEL biomass plant' },
      },
    ],
  },
  {
    label: 'Sustainability',
    children: [
      { label: 'Story of Our Influence', href: '/story-of-our-influence/' },
      { label: 'Our Key ESG Metrics', href: '/our-key-esg-metrics/' },
      { label: 'Our Core Beliefs', href: '/our-core-beliefs/' },
    ],
  },
  {
    label: 'Investors',
    children: [
      { label: 'Offer Documents', href: '/investors/offer-documents/' },
      { label: 'Corporate Governance', href: '/investors/corporate-governance/' },
      { label: 'Financials & Reports', href: '/investors/financials-and-reports/' },
      { label: 'Notifications', href: '/investors/notifications/' },
      { label: 'Investor Contact', href: '/investors/contact-us/' },
    ],
  },
  { label: 'Newsroom', href: '/newsroom/' },
  { label: 'Career', href: '/career/' },
  { label: 'Contact Us', href: '/contact-us/' },
];

/**
 * The one nav entry the masthead renders as a button rather than a link.
 *
 * It stays in `NAV_ITEMS` on purpose: the mobile drawer, the footer grid and
 * `sitemap.ts` all read that array, and a route lifted out of it would quietly
 * disappear from three places to gain a different style in one. The desktop
 * bar filters on this label instead.
 */
export const NAV_CTA_LABEL = 'Contact Us';

/**
 * Whether `pathname` sits inside `item` — the item itself, or any of its
 * children. Drives the desktop nav's active underline and the drawer's
 * current-section marker.
 *
 * Compares whole path segments rather than using `startsWith`, so
 * `/investors/contact-us/` does not light up an `/investors/contact/` entry.
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const normalise = (value: string) => (value.endsWith('/') ? value : `${value}/`);
  const current = normalise(pathname);

  const matches = (href: string | undefined) =>
    href !== undefined && (current === normalise(href) || current.startsWith(normalise(href)));

  if (matches(item.href)) return true;
  return (item.children ?? []).some((child) => matches(child.href));
}
