import { cn } from '@/lib/utils/cn';

/**
 * The header's background layer.
 *
 * As soon as the page leaves the top the bar firms up — a more opaque veil and
 * a heavier hairline — so it stays legible over photography. That is the whole
 * of this component.
 *
 * **The outer bar is `SAEL Home v2`'s, turned over into the light.** Its `#hdr`
 * rule is copied structurally rather than literally, because the design draws
 * a dark masthead and this site's stays light — the client's 2026-08-25 note
 * covers both halves of that. What came across is everything that is not a
 * hue: one flat translucent fill instead of the vertical gradient this used to
 * carry, at the design's 0.70 → 0.86; the hairline at its 0.09 → 0.13; its
 * `blur(22px) saturate(1.4)`; its `.3s` transition on background and border
 * colour; its 68px height; its threshold, which is 8px of scroll and not the
 * 80 this used to wait for.
 *
 * **And no shadow.** The design has none at any scroll position — the bar
 * separates itself with the hairline and the opacity step alone. `shadow-header`
 * went with it; it had no other consumer.
 *
 * **The scroll listener used to live here.** It moved to `<HeaderShell>` when
 * the bar gained its mobile auto-hide, because that reads the same
 * `window.scrollY` this did and one listener is enough for both. This is now
 * presentational: it renders what it is told.
 *
 * `backdrop-filter` lives here rather than on `<header>` on purpose. See the
 * note in header.tsx: on the header it would become the containing block for
 * the desktop mega menu's `position: fixed`.
 */
export interface HeaderGlassProps {
  /** `true` once the page has left the top — see `<HeaderShell>`. */
  scrolled: boolean;
}

export function HeaderGlass({ scrolled }: HeaderGlassProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 -z-10',
        'border-b',
        'transition-[background-color,border-color] duration-(--duration-header)',
        'motion-reduce:transition-none',
        // Without backdrop-filter the translucent veil would sit over raw page
        // content, so the fallback is a near-opaque background instead. It is
        // the base layer in both states and the veil paints over it, which is
        // why the two `bg-*` classes below are not in conflict.
        'bg-header-solid',
        'supports-[backdrop-filter]:backdrop-blur-header',
        'supports-[backdrop-filter]:backdrop-saturate-(--saturate-glass)',
        scrolled
          ? 'border-header-hairline-scrolled supports-[backdrop-filter]:bg-header-veil-scrolled'
          : 'border-header-hairline supports-[backdrop-filter]:bg-header-veil',
      )}
    />
  );
}
