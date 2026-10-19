import type { Metadata } from 'next';
import {
  contactDetails,
  contactFormCopy,
  contactFormHeading,
  contactHero,
  contactMap,
  contactMapCaption,
  contactOffice,
  contactPage as page,
  contactSocial,
} from '@/app/_content/contact-us';
import dottedMap from '@/assets/images/map.svg';
import { ContactForm } from '@/components/forms/contact-form';
import { ContactDetails } from '@/components/sections/contact-details';
import { ContactMap } from '@/components/sections/contact-map';
import { ContactSplit } from '@/components/sections/contact-split';
import { PageHero } from '@/components/sections/page-hero';
import { MapBeacon } from '@/components/sections/presence-map/map-beacon';
import { SocialCommunity } from '@/components/sections/social-community';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { env } from '@/lib/config/env';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  // `trailingSlash: true`, and this is the legacy URL exactly. /CLAUDE.md §2 rule 6.
  path: page.path,
});

/**
 * Contact Us — the address, phone and email beside a form that sends a
 * message; the social profiles; and the office on a map. Static content
 * (`_content/contact-us.ts`), transcribed from the legacy page.
 *
 * **Opens on the business pages' video hero** (`<PageHero>`), the client's
 * ask of 2026-10-01 — the legacy page's own looping video behind the title
 * and its line, a full screen of it, with everything else underneath. It
 * opened on the investor pages' ripple band before that.
 * `-mt-header lg:mt-0` is the business pages' too: below `lg` the masthead
 * overlays the page, so a full-bleed hero has to start at the viewport top.
 *
 * **Underneath, one section on the dot ground**, in the legacy order: the
 * details and the form, the social profiles, then the map. **One column
 * system, not three sections** (the client's ask of 2026-10-06, that the
 * page scroll as one thing): the social row and the map are `<ContactRow>`s
 * on the split's own 1 : 2 columns, each under a hairline like the details'
 * rows, spaced by one gap. Nothing below the hero is a panel of its own.
 *
 * The form posts from the browser straight to the backend's
 * `/app/v1/contact-enquiry` on this origin (docs/api-contracts.md §8), and
 * with `CONTENT_SOURCE=mock` to a stand-in that sends nothing.
 *
 * `overflow-x-clip`: the social tiles' `<GlowFrame>` halos reach past their
 * cards, and on a phone past the screen's edge. `clip`, not `hidden`, so the
 * details column can still stick.
 *
 * A Server Component; the hero's video, the form, the tiles' light and the
 * map are the client leaves.
 */
export default function ContactUsPage() {
  return (
    <div className="-mt-header lg:mt-0">
      <PageHero {...contactHero} />

      <Section background="black-dots" spacing="closing" className="overflow-x-clip">
        <div className="flex flex-col gap-section-y-tight">
          <Reveal>
            <ContactSplit
              details={<ContactDetails {...contactDetails} />}
              formHeading={contactFormHeading}
              form={
                <ContactForm
                  copy={contactFormCopy}
                  labelledBy={contactFormHeading.id}
                  source={env.CONTENT_SOURCE}
                />
              }
            />
          </Reveal>

          <Reveal>
            <SocialCommunity {...contactSocial} />
          </Reveal>

          <Reveal>
            <ContactMap
              caption={contactMapCaption}
              map={contactMap}
              preview={<MapBeacon map={dottedMap} x={contactOffice.x} y={contactOffice.y} />}
            />
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
