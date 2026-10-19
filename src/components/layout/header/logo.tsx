import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/images/sael-logo.png';
import { siteConfig } from '@/lib/config/site';
import { cn } from '@/lib/utils/cn';

/**
 * The masthead logo, linking home.
 *
 * A raster by decision on 2026-08-04 — the client has not supplied the vector,
 * and `docs/asset-inventory.md` §4 records the swap as outstanding. The
 * committed master is 1600px wide against a 42px rendered height, so it stays
 * sharp; `sizes` is set from the rendered height rather than left to default,
 * or `next/image` would ship the full-width asset to a phone.
 *
 * The `alt` is the company name, not "SAEL logo". It is the site's home link,
 * and a screen reader announcing "link, SAEL logo" says one word too many.
 * The strapline is baked into the artwork, so it is not repeated in text.
 */
export interface LogoProps {
  className?: string;
  /** Rendered height follows the header, which is shorter below lg. */
  priority?: boolean;
}

export function Logo({ className, priority = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex shrink-0 items-center', className)}
      aria-label={`${siteConfig.name} — home`}
    >
      <Image
        src={logo}
        alt={siteConfig.name}
        priority={priority}
        sizes="(min-width: 64rem) 170px, 130px"
        className="h-8 w-auto lg:h-logo"
      />
    </Link>
  );
}
