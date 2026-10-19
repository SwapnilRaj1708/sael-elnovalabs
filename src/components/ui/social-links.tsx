import { cva } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';
import { SOCIAL_ICONS } from '@/components/icons/social';
import { SOCIAL_MARK_ON_FILL_CLASS, SocialBrandFill } from '@/components/ui/social-brand-fill';
import type { SocialLink } from '@/lib/content/static/footer';
import { cn } from '@/lib/utils/cn';

export interface SocialLinksProps {
  links: readonly SocialLink[];
  /** Appended to each link's name for screen readers — "opens in a new tab". */
  newTabNote: string;
  /**
   * `solid`, the default, is the footer's: white discs, dark marks, icon only.
   * `chip` is for the black page ground — Contact Us's "Join Our Online
   * Community": a pill in the form fields' outline colour carrying the mark
   * in a brand-gradient disc, the platform's name and an outward arrow, so
   * each says where it goes before it is pressed.
   */
  variant?: 'solid' | 'chip';
  className?: string;
}

const link = cva(
  [
    'group/social inline-flex min-h-touch items-center rounded-pill',
    'transition duration-(--duration-micro)',
    'hover:-translate-y-(--lift-social) focus-visible:-translate-y-(--lift-social)',
    'motion-reduce:transform-none',
  ],
  {
    variants: {
      variant: {
        solid: 'relative size-touch justify-center bg-white text-footer-icon',
        chip: [
          'w-full gap-tight border border-outline-dark py-1 pr-stack pl-1 text-body-sm text-white',
          'hover:border-white focus-visible:border-white focus-visible:outline-white',
        ],
      },
    },
    defaultVariants: { variant: 'solid' },
  },
);

/**
 * The social profiles as a row of links, each the platform's mark — the
 * footer's row of white discs, and Contact Us's chips. Pulled out of the
 * footer on 2026-10-01 when Contact Us became the second place to draw it.
 *
 * Each opens in a new tab, and says so in its accessible name, which is the
 * platform's name — shown on a chip, read from `sr-only` text on a disc. The
 * mark itself is unlabelled (`icons/social.tsx`), so the name is never
 * announced twice. Each is at least a 44px target, and lifts on hover and on
 * keyboard focus alike; a chip's arrow leans out with it, and a disc fills
 * with its platform's colour from the centre out, as the social FAB's do
 * (`<SocialBrandFill>`).
 *
 * Chips sit in one row where there is room for all four — from `sm` while
 * the row is full width, and from `xl` beside a heading — and as an even
 * 2 × 2 everywhere else, so four never break three over one.
 *
 * Renders nothing for an empty list — a row of links to nowhere is worse than
 * no row.
 *
 * A Server Component.
 */
export function SocialLinks({ links, newTabNote, variant = 'solid', className }: SocialLinksProps) {
  if (links.length === 0) return null;
  const chip = variant === 'chip';

  return (
    <ul
      className={cn(
        'list-none items-center gap-3',
        chip ? 'grid grid-cols-2 sm:flex sm:flex-wrap lg:grid xl:flex' : 'flex flex-wrap',
        className,
      )}
    >
      {links.map((social) => {
        const Icon = SOCIAL_ICONS[social.platform];
        return (
          <li key={social.platform}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={link({ variant })}
            >
              {chip ? (
                <>
                  <span
                    aria-hidden="true"
                    className="flex size-icon-mark flex-none items-center justify-center rounded-pill bg-(image:--gradient-cta)"
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="flex-1">{social.label}</span>
                  <ArrowUpRight
                    className="size-4 flex-none text-on-dark-soft transition duration-(--duration-micro) group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5 group-hover/social:text-white group-focus-visible/social:text-white motion-reduce:transition-none motion-reduce:group-hover/social:translate-x-0 motion-reduce:group-hover/social:translate-y-0"
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span className="sr-only"> — {newTabNote}</span>
                </>
              ) : (
                <>
                  <SocialBrandFill platform={social.platform} />
                  <Icon className={cn('size-5', SOCIAL_MARK_ON_FILL_CLASS)} />
                  <span className="sr-only">
                    {social.label} — {newTabNote}
                  </span>
                </>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
