import Link from 'next/link';
import { NAV_CTA_LABEL, NAV_ITEMS } from '@/components/layout/header/nav-config';
import { cn } from '@/lib/utils/cn';

/**
 * "Contact Us", as the masthead's one button.
 *
 * Not `<Button variant="primary">`: that primitive is the *page's* CTA — square
 * corners, `--gradient-cta`, uppercase, 44px minimum. The masthead's is a
 * different object in the client's design, and forcing one component to be
 * both would mean three new variants on a primitive used everywhere. It shares
 * the token layer instead, which is where the coupling belongs.
 *
 * The href is read from `NAV_ITEMS` rather than written here, so the button and
 * the mobile drawer cannot end up pointing at different pages.
 *
 * Shown from `xl`, not `lg`, and that is a measurement rather than a taste.
 * The inline nav is six items wide; at 1024 the logo, those six and a 130px
 * button together overrun the content width and the button is clipped off the
 * right edge. Between `lg` and `xl` the bar is logo plus nav, and Contact Us
 * is reachable as the last item of the drawer's own list — which is the same
 * list, so nothing is lost at any width.
 */
export function HeaderCta() {
  const href = NAV_ITEMS.find((item) => item.label === NAV_CTA_LABEL)?.href;
  if (href === undefined) return null;

  return (
    <Link
      href={href}
      className={cn(
        'hidden shrink-0 items-center xl:inline-flex',
        'rounded-nav-cta px-5 py-3',
        'text-nav text-white',
        'bg-(image:--gradient-nav-cta) shadow-nav-cta',
        'transition duration-(--duration-micro)',
        'hover:-translate-y-0.5 hover:shadow-nav-cta-hover',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
      )}
    >
      {NAV_CTA_LABEL}
    </Link>
  );
}
