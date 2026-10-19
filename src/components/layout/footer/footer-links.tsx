import Link from 'next/link';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { FOOTER_GROUPS, type FooterLink } from '@/lib/content/static/footer';
import { cn } from '@/lib/utils/cn';

/**
 * The footer's link grid: four columns at md and up, accordions below.
 *
 * **Both are rendered, and CSS picks one.** That is the pattern
 * `docs/responsive-strategy.md` §4 mandates for the vision timeline, and the
 * reasoning carries: choosing with a JS media query means the server renders
 * one and the client swaps to the other, which flashes. Rendering both keeps
 * everything server-rendered and correct on first paint. The hidden branch is
 * `display: none`, so screen readers encounter each link once, not twice.
 *
 * The cost is sixteen duplicated anchors in the HTML. That is a few hundred
 * bytes against a guaranteed-correct first paint.
 */

function FooterAnchor({ link }: { link: FooterLink }) {
  const className = cn(
    // 44px for a finger, 32 for a mouse. Five links at 44 was 220px of a
    // column the client twice called too tall; `hover-hover:` is the only
    // place it is safe to trade, and 32 still clears WCAG 2.5.8 AA. See the
    // token, and docs/responsive-strategy.md §5.
    'text-body-sm inline-flex min-h-touch items-center text-body-on-dark',
    'hover-hover:min-h-touch-fine',
    // Red on hover, matching the ledger's "Know More" and the news card's
    // "Read More" — the client's ask on 2026-08-27. `-bright`, not
    // `--color-brand-red`, which fails contrast on this ground; see the token.
    'transition-colors duration-(--duration-micro)',
    'hover:text-brand-red-bright focus-visible:text-brand-red-bright',
  );

  // A link that leaves the site is a plain anchor — there is no client-side
  // navigation to prefetch. None does today; /career/ did until it became a
  // page on 2026-09-22.
  return link.external === true ? (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function FooterLinks() {
  return (
    <nav aria-label="Footer">
      {/* md and up — four columns */}
      <div className="hidden gap-gap-grid md:grid md:grid-cols-2 lg:grid-cols-4">
        {FOOTER_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="mb-tight text-label text-white underline underline-offset-8">
              {group.title}
            </h2>
            <ul className="flex list-none flex-col">
              {group.links.map((link) => (
                <li key={link.href}>
                  <FooterAnchor link={link} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* below md — accordions, collapsed by default */}
      <div className="md:hidden">
        <Accordion allowMultiple>
          {FOOTER_GROUPS.map((group) => (
            <AccordionItem
              key={group.title}
              value={group.title}
              headingAs="h2"
              title={
                <span key={group.title} className="text-label">
                  {group.title}
                  {/* The rule draws itself in from the left as the panel opens
                      and retracts the same way as it closes — the eyebrow's
                      own gesture, off the trigger's `aria-expanded` rather
                      than any state of its own. Decorative, so aria-hidden.
                      `w-full` is the label's width: the span is a flex item,
                      so it is only as wide as its text. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-2 block h-px w-full origin-left scale-x-0 bg-current',
                      'transition-transform duration-(--duration-underline) ease-(--ease-entrance)',
                      'group-aria-expanded:scale-x-100',
                      'motion-reduce:transition-none',
                    )}
                  />
                </span>
              }
              className="border-hairline-dark"
              triggerClassName="group text-white hover:text-body-on-dark"
            >
              <ul className="flex list-none flex-col">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </nav>
  );
}
