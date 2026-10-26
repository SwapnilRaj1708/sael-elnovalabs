import { PRODUCTION_URL } from '@/lib/config/site';

/**
 * The Green Web Foundation's green-hosting badge (client, 2026-10-26). Static —
 * it is a third party's image, not content from the backend, so it does not go
 * through the content repository.
 *
 * The `src` and `alt` are Green Web's own embed snippet for the host, from its
 * check page. The host is `PRODUCTION_URL`'s rather than written out again, so
 * moving production to the apex moves the badge with it. Every deployment shows
 * the production host's badge, staging included: it is a claim about where
 * www.sael.co runs, not about the box serving the page.
 *
 * **The image is Green Web's verdict, drawn live.** `nocache=true` asks for a
 * fresh check, and the badge reads whatever it finds. On 2026-10-26 that was
 * "Hosted by Cloudflare" — the legacy site's front door. If the cut-over leaves
 * Cloudflare out, the badge will name the new host or stop saying green.
 */
export interface GreenHostingBadge {
  src: string;
  alt: string;
  /** The artwork's own size, in px — it is never drawn larger. */
  width: number;
  height: number;
}

export const GREEN_HOSTING_BADGE: GreenHostingBadge = {
  src: `https://app.greenweb.org/api/v3/greencheckimage/${new URL(PRODUCTION_URL).host}?nocache=true`,
  alt: 'This website runs on green hosting - verified by thegreenwebfoundation.org',
  width: 200,
  height: 95,
};
