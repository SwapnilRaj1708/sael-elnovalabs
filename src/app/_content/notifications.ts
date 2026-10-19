import { investorPage, type InvestorPage } from './investors';

/**
 * The Notifications page's static content — its name and `<title>`,
 * verbatim from the legacy https://www.sael.co/investors/notifications/,
 * read on 2026-09-30.
 *
 * The notifications themselves are the documents of the section's one
 * tile, `notifications` (`documents-live?section=NOTIFICATIONS`), grouped
 * by financial year by the backend. A page on its own, not an area: the
 * legacy page has no side list, so it passes no `nav`.
 */
export const notificationsPage: InvestorPage = investorPage(
  '/investors/',
  'notifications',
  'Notifications',
  'Notifications - SAEL',
);
