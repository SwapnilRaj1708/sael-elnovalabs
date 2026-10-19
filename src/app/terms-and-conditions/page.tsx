import type { Metadata } from 'next';
import { termsAndConditionsPage } from '@/app/_content/legal';
import { LongformProse } from '@/components/sections/longform-prose';
import { SubPage } from '@/components/sections/sub-page';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: termsAndConditionsPage.meta.title,
  // `trailingSlash: true`, and the legacy URL is `/terms-and-conditions/`. /CLAUDE.md §2 rule 6.
  path: termsAndConditionsPage.path,
});

/**
 * Terms & Conditions — sael.co's text, a flagged stand-in awaiting SAEL's
 * sign-off (see `_content/legal.ts`). Opens as Offer Documents does: the
 * ripple masthead with the page's name and no breadcrumb. The body is one
 * centred column at sael.co's width; no table of contents beside it, at the
 * client's request (2026-10-06). Its headings keep their ids, so a link to
 * `#7-intellectual-property-rights` still lands.
 */
export default function TermsAndConditionsPage() {
  return (
    <SubPage title={termsAndConditionsPage.title} masthead="ripple">
      <LongformProse blocks={termsAndConditionsPage.blocks} measure="legacy-doc" />
    </SubPage>
  );
}
