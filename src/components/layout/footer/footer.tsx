import Image from 'next/image';
import Link from 'next/link';
import logoDark from '@/assets/images/sael-logo-dark.svg';
import { FooterLinks } from '@/components/layout/footer/footer-links';
import { FooterPixelStrip } from '@/components/sections/footer-pixel-strip';
import { Container } from '@/components/ui/container';
import { siteConfig, TODO_CONTENT } from '@/lib/config/site';
import { LEGAL_LINKS } from '@/lib/content/static/footer';

/**
 * The site footer. A Server Component; only the accordions inside
 * `<FooterLinks>` are client.
 *
 * Two deviations from `docs/features/03-app-shell-header-footer.md` §3, both
 * decided on 2026-08-04 and recorded in docs/asset-inventory.md:
 *
 *  - **The logo sits on a white plate.** No white variant of the mark exists,
 *    and the colour logo is a purple→red gradient over a black strapline, so
 *    it cannot go straight onto `--color-footer-bg`. Rather than set the
 *    wordmark as text — which loses the mark entirely — the real artwork gets
 *    its own light surface. Decided with the client on 2026-08-05.
 *  - **No background image.** `footer-background.jpg` was not in the client
 *    handover, so the flat token colour stands in. `responsive-strategy.md` §4
 *    already sanctions this below md; it now applies at every width, which
 *    also means the copy's contrast is predictable rather than dependent on
 *    an image crop.
 *
 * The corporate block is present on the live site but not the prototype. §3
 * says include it, and it is legally useful.
 *
 * **`data-snap-section` makes it the last stop on a snapping page.** It is the
 * same attribute every homepage section carries, and it is inert everywhere
 * else — globals.css scopes both snap rules to `html:has([data-snap-sections])`,
 * which only the homepage renders. The footer became a snap target on
 * 2026-08-27, when the client asked for the page to behave the same from top
 * to bottom; the tail scrolled normally before that. See the comment above the
 * rules in globals.css.
 */
export function Footer() {
  // Computed per render, never hardcoded — a stale copyright year is a small
  // but very visible sign of an unmaintained site.
  const year = new Date().getFullYear();
  const hasEmail = siteConfig.email !== TODO_CONTENT;

  return (
    <footer data-snap-section className="bg-footer-bg text-white">
      {/* First child, so the strip's solid edge is the footer's top edge.
          Full-bleed and outside <Container> — it is a band across the whole
          width, not content that sits on the page gutter. */}
      <FooterPixelStrip />
      <Container>
        {/* **Tightened on 2026-08-27** — the client found the footer too tall
            on desktop. Everything below is padding and gaps; no row was
            re-laid-out and the strip above is untouched, both by their ask.
            Roughly 155px comes off at 1920 and 68px at 360.

            The top padding is the asymmetric one, and deliberately: the strip
            above dissolves *downward*, so its lowest rows are nearly empty and
            the content already has 100px-odd of visual air over it. The bottom
            has nothing below it but the viewport edge, so it keeps more.

            The link rows are the obvious remaining target and are **not** to be
            touched: five links at `min-h-touch` is 220px of the column, and
            that 44px is `responsive-strategy.md` §5's floor for every
            interactive element, not slack. */}
        <div className="pt-flow pb-flow">
          <FooterLinks />

          {/* Corporate block — the address, with the wordmark beside it.
              Stacks below md, address first: that is DOM order, reading order
              and the order the client asked for, so nothing has to be
              re-ordered visually. `items-start` keeps the wordmark on the same
              left edge as the address it belongs to rather than stretching or
              centring it; from md the two take opposite ends of the row and
              centre against each other. */}
          <div className="mt-flow flex flex-col items-start gap-stack md:flex-row md:items-center md:justify-between">
            {/* `min-w-0` so the registered-office line wraps inside the row
                rather than pushing the wordmark off it — a flex item's floor is
                its content's min-content width until you say otherwise. */}
            <address className="min-w-0 text-body-sm text-on-dark-soft not-italic">
              <span className="block font-bold text-white">{siteConfig.legalName}</span>
              <span className="block">Registered Office: {siteConfig.registeredOffice}</span>
              <span className="block">CIN: {siteConfig.cin}</span>
              <span className="block">
                Telephone:{' '}
                <a
                  href={`tel:${siteConfig.telephone.replace(/[^\d+]/g, '')}`}
                  className="hover:text-white"
                >
                  {siteConfig.telephone}
                </a>
                {' · '}
                Email:{' '}
                {hasEmail ? (
                  // Plain mailto. The legacy site Cloudflare-obfuscates this;
                  // obfuscation does not stop scrapers and does break assistive
                  // technology. features/03 §3.
                  <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                    {siteConfig.email}
                  </a>
                ) : (
                  siteConfig.email
                )}
              </span>
            </address>

            {/* No `sizes`: `next/image` serves an SVG as-is — there is no
                srcset to steer, and one raster width to pick would be the
                wrong one. `w-auto` lets the file's own ratio set the width, so
                nothing is squeezed. */}
            <Link href="/" className="shrink-0" aria-label={`${siteConfig.name} — home`}>
              <Image src={logoDark} alt={siteConfig.name} className="h-footer-logo w-auto" />
            </Link>
          </div>

          <hr className="mt-stack border-hairline-dark" />

          {/* Legal bar — copyright, legal links, and the socials.
              **The socials had a row of their own above the link grid until
              2026-08-27**, and after the wordmark moved down to the corporate
              block that row held four icons and 68px of nothing else. Folding
              them in here costs no height: the bar was already 44px tall
              because its own links carry `min-h-touch`, which is exactly what
              a social button is. `flex-wrap` because three items is one more
              than this row was built for, and at md they would otherwise
              squeeze rather than break. */}
          <div className="mt-stack flex flex-col items-center gap-stack text-body-sm text-on-dark-soft md:flex-row md:flex-wrap md:justify-between">
            <p>
              © {year} {siteConfig.name} | All Rights Reserved
            </p>
            <ul className="flex list-none flex-wrap items-center justify-center gap-x-6">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-touch items-center transition-colors duration-(--duration-micro) hover:text-brand-red-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
