import type { SocialPlatform } from '@/lib/content/static/footer';
import { cn } from '@/lib/utils/cn';

/** Each platform's own colour, as a background. See --color-brand-* and --gradient-brand-instagram. */
export const BRAND_FILL: Record<SocialPlatform, string> = {
  facebook: 'bg-brand-facebook',
  instagram: 'bg-(image:--gradient-brand-instagram)',
  linkedin: 'bg-brand-linkedin',
  x: 'bg-brand-x',
};

/**
 * The same colours for a pill carrying text. Only Instagram differs: its
 * brand gradient is too light for white text where it turns yellow.
 */
export const BRAND_PILL: Record<SocialPlatform, string> = {
  ...BRAND_FILL,
  instagram: 'bg-(image:--gradient-brand-instagram-pill)',
};

/**
 * The hover classes for a social mark drawn over `<SocialBrandFill>`: it
 * turns white as the colour arrives behind it, and stands above the fill.
 */
export const SOCIAL_MARK_ON_FILL_CLASS =
  'relative transition-colors duration-(--duration-social-fill) group-hover/social:text-white group-focus-visible/social:text-white';

export interface SocialBrandFillProps {
  platform: SocialPlatform;
}

/**
 * A social disc's platform colour, filling it from the centre outwards under
 * the pointer or keyboard focus and drawing back in when they leave — the
 * footer's discs and the social FAB's alike (2026-10-13).
 *
 * Place it first inside a link that is `group/social`, `relative` and round,
 * and give the mark after it `SOCIAL_MARK_ON_FILL_CLASS`. The circle grows
 * on `scale` with the entrance ease, so it lands softly rather than stopping
 * hard at the rim. Under a reduced-motion preference it does not grow: the
 * colour simply fades in.
 *
 * Decorative: the link names the platform.
 */
export function SocialBrandFill({ platform }: SocialBrandFillProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute inset-0 scale-0 rounded-pill opacity-0',
        'transition-[scale,opacity] duration-(--duration-social-fill) ease-entrance',
        'group-hover/social:scale-100 group-hover/social:opacity-100',
        'group-focus-visible/social:scale-100 group-focus-visible/social:opacity-100',
        'motion-reduce:scale-100',
        BRAND_FILL[platform],
      )}
    />
  );
}
