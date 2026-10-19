import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface ContactField {
  /** The label, verbatim, colon included — "Email ID:". */
  label: string;
  /** The value, verbatim. */
  value: string;
  /** `email` renders a `mailto:` link, `tel` a `tel:` link, `text` plain. */
  kind: 'text' | 'email' | 'tel';
}

export interface ContactBlock {
  /**
   * The block's anchor — the legacy tab id, `investorContact`. Nothing on
   * the page links to it now, but an old deep link still lands on its card.
   */
  id: string;
  /** Verbatim — "Registered Office". */
  heading: string;
  /** A line before the details, verbatim, or `null`. */
  intro: string | null;
  fields: readonly ContactField[];
}

export interface ContactBlocksProps {
  blocks: readonly ContactBlock[];
}

/** `tel:` takes digits only — the footer's rule, so the two agree. */
function telHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, '')}`;
}

/**
 * Contact details in blocks — an address, a company number, an officer —
 * each under its own `<h2>`, as a description list: the label is a `<dt>`,
 * the value a `<dd>`, so a screen reader pairs them.
 *
 * **Every block on the page at once**, where the legacy Investor Contact page
 * put each behind a tab: three short blocks are no reason to hide two. Each
 * block keeps its legacy tab id as its anchor. The tab row survived as a row
 * of jump links until 2026-10-01, when the client dropped it: the cards sit
 * directly under it, so the links only scrolled to what was already in view.
 *
 * Emails are `mailto:` links and phone numbers `tel:` links; the text shown
 * is the value as published. Outlined cards, one per block, stacked on a
 * phone and three across from `xl`, where the addresses still wrap in a
 * readable measure.
 *
 * **Hover, at the client's request of 2026-10-01** — the card, or a link
 * in it reached by keyboard, or a tap on a touch screen:
 *
 *  - the card takes the outlined card's light, as the About Us strategic
 *    pillars do (ui/card.tsx), its ring rounded to this card's own corner
 *    through `--card-radius`;
 *  - the heading turns from white to `--gradient-eyebrow-bright` and a rule
 *    in the same ramp draws itself in under it — the section eyebrow's
 *    treatment (ui/eyebrow.tsx), set off by hover where the eyebrow's is set
 *    off by scroll. The fill is a transition of `color` to transparent over
 *    a background already clipped to the glyphs, so it fades rather than
 *    snapping;
 *  - an email or phone link turns `--color-brand-red-bright`, as the footer's
 *    links do.
 *
 * A Server Component; `<Card>`'s touch light is the one client leaf.
 */
export function ContactBlocks({ blocks }: ContactBlocksProps) {
  return (
    <div className="grid grid-cols-1 gap-gap-grid xl:grid-cols-3">
      {blocks.map((block) => (
        <Card
          key={block.id}
          as="section"
          id={block.id}
          aria-labelledby={`${block.id}-heading`}
          shape="outlined"
          ground="dark"
          inset="none"
          className="flex-col gap-stack rounded-(--card-radius) [--card-radius:var(--radius-card)]"
        >
          {/* `w-fit`, as the eyebrow's: the rule is as wide as the heading. */}
          <div className="w-fit">
            <h2
              id={`${block.id}-heading`}
              className={cn(
                'bg-(image:--gradient-eyebrow-bright) bg-clip-text text-h3 text-white',
                'transition-colors duration-(--duration-micro) motion-reduce:transition-none',
                'group-hover:text-transparent group-has-focus-visible:text-transparent',
                'group-data-touch-lit:text-transparent',
              )}
            >
              {block.heading}
            </h2>
            <span
              aria-hidden="true"
              className={cn(
                'mt-2.5 block h-rule-h w-full origin-left scale-x-0',
                'bg-(image:--gradient-eyebrow-bright)',
                'transition-transform duration-(--duration-underline) ease-(--ease-entrance)',
                'motion-reduce:transition-none',
                'group-hover:scale-x-100 group-has-focus-visible:scale-x-100',
                'group-data-touch-lit:scale-x-100',
              )}
            />
          </div>

          {block.intro !== null && <p className="text-body-sm text-body-on-dark">{block.intro}</p>}

          <dl className="flex flex-col gap-tight text-body-sm">
            {block.fields.map((field) => (
              <div key={field.label} className="flex flex-col">
                <dt className="font-bold text-white">{field.label}</dt>
                <dd className="text-body-on-dark">
                  {field.kind === 'text' ? (
                    field.value
                  ) : (
                    <a
                      href={field.kind === 'email' ? `mailto:${field.value}` : telHref(field.value)}
                      className="break-words underline decoration-hairline-dark underline-offset-4 transition-colors duration-(--duration-micro) hover:text-brand-red-bright hover:decoration-current focus-visible:text-brand-red-bright focus-visible:outline-white"
                    >
                      {field.value}
                    </a>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}
    </div>
  );
}
