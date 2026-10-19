import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import addressIcon from '@/assets/icons/address/animated/48a-contact-address-pin-notile-animated.svg';
import emailIcon from '@/assets/icons/email/animated/50b-contact-email-send-notile-animated.svg';
import phoneIcon from '@/assets/icons/phone/animated/49a-contact-phone-waves-notile-animated.svg';
import { cn } from '@/lib/utils/cn';

export interface ContactDetail {
  /** What the value is, which decides its icon and its link. */
  kind: 'address' | 'tel' | 'email';
  /** Verbatim — "Address". */
  label: string;
  /** Verbatim — the number as published, not as dialled. */
  value: string;
}

export interface ContactDetailsProps {
  items: readonly ContactDetail[];
  /**
   * A plain link under the address to the same place in a maps app — so the
   * address works on a phone without anyone loading the embedded map.
   */
  mapLink?: { label: string; href: string };
  /** Appended to the map link's accessible name — "opens in a new tab". */
  newTabNote: string;
  className?: string;
}

/** The supplied animated icons (48-50, 2026-10-08), coloured, on a 3.5s loop. */
const ICON = { address: addressIcon, tel: phoneIcon, email: emailIcon } as const;

/** `tel:` takes digits and a leading `+` only — the footer's rule, so the two agree. */
function telHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, '')}`;
}

const linkClass = cn(
  'inline-flex min-h-touch items-center gap-tight wrap-break-word',
  'underline decoration-hairline-dark underline-offset-4',
  'transition-colors duration-(--duration-micro) hover:text-brand-red-bright hover:decoration-current',
  'focus-visible:text-brand-red-bright focus-visible:outline-white',
);

/**
 * How to reach the company — the legacy Contact Us page's Address, Phone and
 * Email, each under its icon.
 *
 * An `<address>`, the element for contact details of the page's subject,
 * around a description list: each label a `<dt>`, its value a `<dd>`, so a
 * screen reader pairs them. **No heading of its own**, because the legacy page
 * has none — its "Reach out to us" is commented out in the source.
 *
 * The phone number is a `tel:` link and the email a `mailto:` link, each
 * showing the value as published. They, and the map link, are full 44px
 * targets: on a phone these are the page's quickest way to get in touch, and
 * they are tapped, not read.
 *
 * Rows hang from hairlines, as the investor pages' side list does, rather
 * than sitting in a card: nothing here is interactive as a whole, and a card
 * would light on hover as though it were.
 *
 * A Server Component.
 */
export function ContactDetails({ items, mapLink, newTabNote, className }: ContactDetailsProps) {
  return (
    <address className={cn('not-italic', className)}>
      <dl className="flex flex-col border-t border-hairline-dark">
        {items.map((item) => {
          const Icon = ICON[item.kind];

          return (
            <div key={item.kind} className="flex gap-stack border-b border-hairline-dark py-stack">
              <Image src={Icon} alt="" aria-hidden className="size-10 shrink-0 object-contain" />

              <div className="flex min-w-0 flex-col">
                <dt className="text-body-sm font-bold text-white">{item.label}</dt>
                <dd className="text-body text-body-on-dark">
                  {item.kind === 'address' && item.value}
                  {item.kind === 'tel' && (
                    <a href={telHref(item.value)} className={linkClass}>
                      {item.value}
                    </a>
                  )}
                  {item.kind === 'email' && (
                    <a href={`mailto:${item.value}`} className={linkClass}>
                      {item.value}
                    </a>
                  )}
                </dd>

                {item.kind === 'address' && mapLink !== undefined && (
                  <dd className="text-body-sm text-body-on-dark">
                    <a
                      href={mapLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {mapLink.label}
                      <ArrowUpRight
                        className="size-4 shrink-0"
                        aria-hidden="true"
                        focusable="false"
                      />
                      <span className="sr-only"> ({newTabNote})</span>
                    </a>
                  </dd>
                )}
              </div>
            </div>
          );
        })}
      </dl>
    </address>
  );
}
