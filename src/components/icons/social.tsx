import type { SVGProps } from 'react';
import type { SocialPlatform } from '@/lib/content/static/footer';

/**
 * Social platform brand marks, from each platform's own brand resources.
 *
 * Inline components rather than files, because they inherit `currentColor` —
 * the footer paints them `--color-footer-icon` on white, the mobile drawer
 * paints them differently. A fixed-colour file could not do both.
 * docs/asset-inventory.md §3.
 *
 * Every path is `fill="currentColor"` and every glyph is drawn inside a
 * 24×24 box, so they line up optically at any size without per-icon nudging.
 *
 * These carry no `aria-label` and no `<title>`. They are always rendered
 * inside a link that already has an accessible name, and a second name on the
 * icon would have the platform announced twice.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </Svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Drawn from geometry (2026-10-13): a rounded-square frame, the lens ring
          and the dot, one even 2-unit stroke throughout, cut with `evenodd`.
          The earlier path was malformed — its frame was thin at the sides and
          thick at the top and bottom, with the edges bulging. */}
      <path
        fillRule="evenodd"
        d="M7.8 2.2H16.2A5.6 5.6 0 0 1 21.8 7.8V16.2A5.6 5.6 0 0 1 16.2 21.8H7.8A5.6 5.6 0 0 1 2.2 16.2V7.8A5.6 5.6 0 0 1 7.8 2.2ZM7.8 4.2H16.2A3.6 3.6 0 0 1 19.8 7.8V16.2A3.6 3.6 0 0 1 16.2 19.8H7.8A3.6 3.6 0 0 1 4.2 16.2V7.8A3.6 3.6 0 0 1 7.8 4.2ZM7.2 12a4.8 4.8 0 1 0 9.6 0a4.8 4.8 0 1 0 -9.6 0ZM9.2 12a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0ZM15.95 6.8a1.25 1.25 0 1 0 2.5 0a1.25 1.25 0 1 0 -2.5 0Z"
      />
    </Svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.32 20.5h3.32V8.98H3.32V20.5Zm5.4-11.52h3.18v1.58h.05c.44-.84 1.53-1.73 3.14-1.73 3.36 0 3.98 2.21 3.98 5.08v6.59h-3.32v-5.84c0-1.39-.03-3.18-1.94-3.18-1.94 0-2.24 1.52-2.24 3.08v5.94H8.72V8.98Z" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M17.53 3h3.06l-6.69 7.64L21.75 21h-6.16l-4.83-6.3L5.24 21H2.18l7.15-8.17L2.5 3h6.32l4.36 5.77L17.53 3Zm-1.07 16.17h1.69L7.6 4.74H5.79l10.67 14.43Z" />
    </Svg>
  );
}

/** Lookup by platform, so a `SocialLink` can render without a switch at each site. */
export const SOCIAL_ICONS: Record<SocialPlatform, (props: IconProps) => React.JSX.Element> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
};
