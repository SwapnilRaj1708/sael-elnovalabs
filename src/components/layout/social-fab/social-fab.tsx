import type { CSSProperties } from 'react';
import { SOCIAL_ICONS } from '@/components/icons/social';
import {
  BRAND_PILL,
  SOCIAL_MARK_ON_FILL_CLASS,
  SocialBrandFill,
} from '@/components/ui/social-brand-fill';
import type { SocialLink } from '@/lib/content/static/footer';
import { cn } from '@/lib/utils/cn';

export interface SocialFabProps {
  links: readonly SocialLink[];
  /** Appended to each link's name for screen readers — "opens in a new tab". */
  newTabNote: string;
}

/**
 * The social profiles as a column of discs fixed to the bottom-right of every
 * page. Added 2026-10-13 at the client's request; mounted once, in the root
 * layout.
 *
 * **Always open** since 2026-10-14, the client's call: the button that used
 * to open the column, and its halo, are gone, and the four discs stand on
 * their own. Each fills with its platform's own colour from the centre out
 * under the pointer or keyboard focus and lifts, as the footer's do
 * (`<SocialBrandFill>`), and its platform's name slides in to its left on the
 * same platform colour.
 *
 * **Sized to stay out of the way on a phone.** A disc is `--spacing-fab-item`
 * — 36px on a phone, growing to 44px — and the corner offset closes in with
 * it, so the column is a narrow strip at the screen's edge. The link around
 * each disc never drops below `--spacing-touch`: the disc is what is drawn,
 * the 44px square is what a finger hits. The name only appears on hover or
 * focus, so a touch screen never shows it; it is the link's name to a screen
 * reader everywhere, with the new-tab note.
 *
 * The discs rise in one after another as the page loads (`anim-fab-in`).
 * Under a reduced-motion preference they are simply there, and neither the
 * lift nor the name's slide moves.
 *
 * It stacks under the masthead (`--z-fab`), so the mega menu and the mobile
 * drawer cover it. Renders nothing without profiles.
 *
 * A Server Component: nothing here needs script.
 */
export function SocialFab({ links, newTabNote }: SocialFabProps) {
  if (links.length === 0) return null;

  return (
    <ul
      aria-label="SAEL on social media"
      className="fixed right-fab-offset bottom-fab-offset z-(--z-fab) flex flex-col lg:gap-tight print:hidden"
    >
      {links.map((social, index) => {
        const Icon = SOCIAL_ICONS[social.platform];
        return (
          <li
            key={social.platform}
            style={{ '--anim-index': index } as CSSProperties}
            className="anim-fab-in"
          >
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/social relative flex size-touch items-center justify-center rounded-pill"
            >
              {/* The disc: the fill grows inside it, and it lifts on its own so
                  the 44px target stays where it is. */}
              <span
                aria-hidden="true"
                className={cn(
                  'relative flex size-fab-item items-center justify-center rounded-pill',
                  'bg-white text-footer-icon shadow-fab-item',
                  'transition-transform duration-(--duration-micro)',
                  'group-hover/social:-translate-y-(--lift-social)',
                  'group-focus-visible/social:-translate-y-(--lift-social)',
                  'motion-reduce:transform-none',
                )}
              >
                <SocialBrandFill platform={social.platform} />
                <Icon className={cn('size-4 lg:size-5', SOCIAL_MARK_ON_FILL_CLASS)} />
              </span>

              {/* The name, sliding in from the disc's edge. Hidden is not gone:
                  at opacity 0 it is still the link's name to a screen reader. */}
              <span
                className={cn(
                  'pointer-events-none absolute right-full mr-1',
                  'rounded-pill border border-hairline-dark px-3 py-1',
                  BRAND_PILL[social.platform],
                  'text-body-sm whitespace-nowrap text-white shadow-fab-item',
                  'translate-x-2 opacity-0',
                  'transition-[opacity,translate] duration-(--duration-fab) ease-entrance',
                  'group-hover/social:translate-x-0 group-hover/social:opacity-100',
                  'group-focus-visible/social:translate-x-0 group-focus-visible/social:opacity-100',
                  'motion-reduce:translate-x-0',
                )}
              >
                {social.label}
                <span className="sr-only"> — {newTabNote}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
