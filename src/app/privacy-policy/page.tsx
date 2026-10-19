import type { Metadata } from 'next';
import { privacyPolicyPage } from '@/app/_content/legal';
import { LongformProse } from '@/components/sections/longform-prose';
import { SubPage } from '@/components/sections/sub-page';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: privacyPolicyPage.meta.title,
  // `trailingSlash: true`, and the legacy URL is `/privacy-policy/`. /CLAUDE.md §2 rule 6.
  path: privacyPolicyPage.path,
});

/**
 * Privacy Policy — sael.co's text, a flagged stand-in awaiting SAEL's sign-off (see
 * `_content/legal.ts`). Opens as Offer Documents does: the ripple masthead
 * with the page's name and no breadcrumb. The document has no headings, so
 * it has no table of contents.
 */
export default function PrivacyPolicyPage() {
  return (
    <SubPage title={privacyPolicyPage.title} masthead="ripple">
      <LongformProse blocks={privacyPolicyPage.blocks} measure="legacy-doc" />
    </SubPage>
  );
}
