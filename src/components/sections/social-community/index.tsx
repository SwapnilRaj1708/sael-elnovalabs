import { ContactRow } from '@/components/sections/contact-split/contact-row';
import { SocialLinks } from '@/components/ui/social-links';
import type { SocialLink } from '@/lib/content/static/footer';

export interface SocialCommunityProps {
  /** Verbatim — "Join Our Online Community". */
  heading: string;
  links: readonly SocialLink[];
  /** "opens in a new tab". */
  newTabNote: string;
}

/**
 * The social profiles under a heading — the band at the foot of the legacy
 * Contact Us page, at the legacy band's own size: a heading and a row of
 * icons, nothing more.
 *
 * Redrawn on 2026-10-06 to sit in the page rather than on it: a
 * `<ContactRow>`, so the heading starts on the details' left edge and the
 * links on the form's, under a hairline. The links are `SocialLinks`'
 * `chip`s — each the platform's mark in a brand-gradient disc, its name and
 * an outward arrow, in the form fields' ring — so each says where it goes,
 * and none repeats the footer's white discs a screen below. (A large lit
 * panel of tiles, tried on 2026-10-01, read as a separate section and was
 * taken back to this size at the client's request.)
 *
 * A Server Component.
 */
export function SocialCommunity({ heading, links, newTabNote }: SocialCommunityProps) {
  return (
    <ContactRow
      labelledBy="social-community-heading"
      className="lg:items-center"
      aside={
        <h2 id="social-community-heading" className="text-h3 text-white">
          {heading}
        </h2>
      }
    >
      <SocialLinks links={links} newTabNote={newTabNote} variant="chip" />
    </ContactRow>
  );
}
