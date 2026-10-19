import type { Metadata } from 'next';
import { RippleHero } from '@/components/sections/ripple-hero';
import { SdgDetailList } from '@/components/sections/sdg-detail';
import { buildMetadata } from '@/lib/seo/metadata';
import { SDG_PAGE_PATH } from '../_content/sdg-goals';
import {
  sdgDetailLabels,
  sdgDetails,
  sdgPageHero,
  sdgPageMeta,
} from '../_content/sustainable-development-goals';

export const metadata: Metadata = buildMetadata({
  title: sdgPageMeta.title,
  description: sdgPageMeta.description,
  // `trailingSlash: true` in next.config.ts, and the legacy site's URL is
  // `/sustainable-development-goals/`. /CLAUDE.md §2 rule 6.
  path: SDG_PAGE_PATH,
});

/**
 * Sustainable Development Goals (FE-15) — the ten UN goals SAEL commits to,
 * each with the material issue, pillar and focus area SAEL aligns to it.
 *
 * Built on 2026-10-07 at the client's request, as the page Our Key ESG
 * Metrics' SDG icons open, which is what they do on the live site. There is
 * no design for it, so it is composed of the site's own pieces: the ripple
 * masthead that opens every investor page, with the live page's heading and
 * subheading, and `<SdgDetailList>`, the live page's table as one block per
 * goal. The copy is the live page's; see `_content/sustainable-development-goals.ts`.
 *
 * `docs/features/15-sustainable-development-goals.md` asks for a
 * `<PageHero>`, a framing paragraph and supporting figures. The page has no
 * photograph, and SAEL have written neither the paragraph nor the figures,
 * so none of the three is drawn: the masthead takes the hero's place, and
 * nothing is invented for the other two (/CLAUDE.md §2 rule 3).
 *
 * **Every block carries the live page's anchor**, `#sdg-N`. The page does not
 * snap, so `<html>`'s `scroll-padding-top` lands each one under the masthead.
 *
 * A Server Component; the reveals and the masthead's grid are client.
 */
export default function SustainableDevelopmentGoalsPage() {
  return (
    <>
      <RippleHero {...sdgPageHero} />
      <SdgDetailList goals={sdgDetails} labels={sdgDetailLabels} />
    </>
  );
}
