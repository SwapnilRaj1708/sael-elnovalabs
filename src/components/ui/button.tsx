import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The site's action primitive.
 *
 * Renders `<Link>` when given an `href`, a plain `<a>` when that href leaves
 * the site, and `<button>` when given none. **Never a `<div>` with an
 * `onClick`** — that is not focusable, not activated by Enter or Space, and
 * not announced as anything.
 *
 * The primitive has no idea what "Know More" means. Every label is a prop.
 * /CLAUDE.md §5.
 *
 * docs/design-guidelines.md §4.
 */
const button = cva(
  [
    'inline-flex items-center justify-center gap-2 text-center',
    // No font size here, deliberately: `size` owns it. Two `text-*` utilities
    // on one element are only resolved by tailwind-merge if it recognises both
    // as font sizes, and it does not recognise this project's custom scale —
    // it would read `text-action` as a colour and leave `text-cta` standing.
    // One source of the size, and the conflict cannot happen.
    'uppercase',
    'cursor-pointer transition duration-(--duration-micro)',
    // The visual can be shorter than the touch target; the hit area cannot.
    // docs/responsive-strategy.md §5.
    'min-h-touch',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        /** The gradient CTA. Square by design — --radius-none. */
        primary:
          'rounded-none bg-(image:--gradient-cta) text-white hover:brightness-(--brightness-cta-hover)',
        /** Text plus an underline on hover. For a secondary action. */
        ghost:
          'rounded-none text-brand-red hover:text-accent-hover hover:underline underline-offset-4',
        /**
         * The gradient CTA, held back until it is wanted: an outline at rest,
         * filling in on hover. For a grid of cards where four solid gradient
         * buttons compete with the content they belong to.
         *
         * The border is drawn with the same gradient so the resting and hover
         * states are the same shape in the same colours — `border-image` is the
         * only way to put a gradient on a border, and it takes no radius, which
         * is why this variant is square. It already is by design.
         */
        outline: [
          'rounded-none border-2 [border-image:var(--gradient-cta)_1]',
          'gradient-text bg-(image:--gradient-cta)',
          'hover:bg-clip-border hover:text-white',
        ],
        /**
         * Quiet by default, brand on hover. For a link that sits at the foot of
         * a card and should not shout over the headline above it.
         */
        quiet: 'rounded-none text-ink hover:text-brand-red hover:underline underline-offset-4',
        /**
         * `quiet` on a dark ground — the Newsroom's cards sit on black. The
         * hover red is the `-bright` one, which is tuned to clear 4.5:1 on
         * --color-surface-black where the flat red does not, and the ring is
         * white for the reason `onDark`'s is.
         */
        quietOnDark:
          'rounded-none text-white hover:text-brand-red-bright hover:underline underline-offset-4 focus-visible:outline-white',
        /* On a dark background the shared blue focus ring has almost no
         * contrast against the surface, so this variant brings its own. */
        onDark:
          'rounded-none border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white',
        /**
         * A pill outlined in the bright ramp, white label, on the black
         * ground — Our Core Beliefs' ESG Report link (FE-14). The one round
         * button in the set, because the design draws it round: it sits
         * under four 40px-radius cards and a square button there reads as
         * from another page. The border is `gradient-outline`, which is
         * what lets a ramp follow the radius. Brings its own focus ring, as
         * `onDark` does.
         */
        pill: [
          'rounded-pill gradient-outline text-white',
          'hover:brightness-(--brightness-cta-hover) focus-visible:outline-white',
        ],
        /**
         * `pill` on paper: the `deep` ramp round the paper ground, an ink
         * label, and the site's own focus ring, which reads on paper. For
         * the ESG Report link under a belief that is drawn on paper
         * (2026-10-14). The hover is paper's link red rather than the
         * brightness lift, which barely moves a near-white pill.
         */
        pillOnPaper: 'rounded-pill gradient-outline-paper text-ink hover:text-accent-hover',
      },
      size: {
        sm: 'text-cta px-4 py-2 lg:px-5 lg:py-2.5',
        /** No horizontal padding, so the label lines up with the copy above
         *  it. For a text link inside a card that is already padded. */
        flush: 'text-cta px-0 py-2',
        /**
         * `flush`, one step down the scale.
         *
         * `SAEL Home v2` sets a card's "Know More" and "Read More" well below
         * its other actions — they sit at the foot of a card whose headline is
         * the subject, and --text-cta (15 → 17) out-weighs that headline. The
         * hit area is unchanged: `min-h-touch` is on the base and the label
         * simply sits smaller inside it.
         */
        micro: 'text-action px-0 py-2',
        /* 10px/24px → 12px/32px. The prototype's 33px is rounded to the
         * spacing scale; a 1px difference is not worth an arbitrary value. */
        md: 'text-cta px-6 py-2.5 lg:px-8 lg:py-3',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-fit',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

type ButtonVariants = Omit<VariantProps<typeof button>, 'fullWidth'> & {
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
};

export type ButtonProps = ButtonVariants &
  (
    | ({ href: string } & Omit<ComponentPropsWithRef<'a'>, 'href' | 'className' | 'children'>)
    | ({ href?: undefined } & Omit<ComponentPropsWithRef<'button'>, 'className' | 'children'>)
  );

/** Anything that is not a same-origin path gets a real anchor, not a Link. */
function isExternal(href: string): boolean {
  return /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(href);
}

export function Button({ variant, size, fullWidth, className, children, ...props }: ButtonProps) {
  const classes = cn(button({ variant, size, fullWidth }), className);

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props;

    if (isExternal(href)) {
      return (
        <a
          href={href}
          // Applied here rather than left to the caller: `noopener` closes a
          // real cross-origin attack, and forgetting it is silent.
          rel={anchorProps.target === '_blank' ? 'noopener noreferrer' : anchorProps.rel}
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  // `href` is present on the type but `undefined` in this branch, so React
  // drops it. Destructuring it out just to discard it reads worse.
  const { type = 'button', ...buttonProps } = props;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
