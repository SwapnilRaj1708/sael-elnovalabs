import type { Metadata } from 'next';
import {
  investorContactBlocks,
  investorContactPage as page,
} from '@/app/_content/investor-contact';
import { ContactBlocks } from '@/components/sections/contact-blocks';
import { SubPage } from '@/components/sections/sub-page';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  // `trailingSlash: true`, and this is the legacy URL exactly. /CLAUDE.md §2 rule 6.
  path: page.path,
});

/**
 * Investor Contact — the Registered Office, the Corporate Office and the
 * Company Secretary, with their addresses, CIN, phone and email. Static
 * content (`_content/investor-contact.ts`), transcribed from the legacy page
 * with its Cloudflare-hidden emails decoded.
 *
 * On the investor template with the ripple band and no side list — the
 * legacy page stands alone. No form, no map, no consent notice: the legacy
 * page has none of them.
 *
 * A Server Component; the ripple band is the one client leaf.
 */
export default function InvestorContactPage() {
  return (
    <SubPage masthead="ripple" title={page.name}>
      <ContactBlocks blocks={investorContactBlocks} />
    </SubPage>
  );
}
