import { BackgroundRipple } from '@/components/ui/background-ripple';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { EsgWheel } from './esg-wheel';

export interface EsgHeroProps {
  /** The page title. Rendered as the page's single `<h1>`. */
  title: string;
  /** The small uppercase label above the title — the nav group. */
  eyebrow?: string;
  /** One line under the title. */
  intro?: string;
  /**
   * Opt into the page's section snapping — a screen tall, content centred.
   * See `data-snap-sections` in globals.css. Without it the hero has the
   * design's own floor from `lg`, `--esg-hero-min-h`.
   */
  snap?: boolean;
}

/**
 * Our Key ESG Metrics' hero (FE-13) — the animated ESG wheel over the page's
 * eyebrow, title and standfirst, all centred, on the investor mastheads'
 * ripple grid.
 *
 * Built to `Our Key ESG Metrics v2.dc.html`, the client's pick of the two
 * hero treatments: the wheel from `ESG Animated Banner.dc.html`, restyled
 * for the black ground. It is the only page hero on the site that is not a
 * photograph.
 *
 * **Two changes at the client's request of 2026-10-07**, both departures
 * from the design:
 *
 *  - **Centred at every width.** The design sets the wheel beside the copy
 *    from `lg`; it is now stacked over it, centred, as it always was below
 *    `lg`. The wheel shrinks with the screen's height (`--spacing-esg-wheel`)
 *    so the stack fits the one screen the page snaps to.
 *  - **`<BackgroundRipple>` behind it**, the grid that opens every investor
 *    page, in place of the design's three drifting glows. This hero is a
 *    screen tall where the investor band is a strip, so the grid takes its
 *    `screen` fade: solid across the top half, fading from the middle, gone
 *    at the foot.
 *
 * **The grid stays live under the copy**, as it does under the investor
 * titles: the copy is `pointer-events: none`, so the pointer lights the
 * cells behind the wheel and title and a click there ripples. Nothing in
 * the copy is a control.
 *
 * Below `lg` the masthead overlays the page, so the stack clears it with
 * padding, as `<PageHero>` does.
 *
 * **The motion runs on arrival, not on scroll.** It is the hero, so it is
 * on screen from the first paint and there is nothing to reveal — which is
 * why `<PageHero>` takes no `<Reveal>` either. The wheel's motion is CSS and
 * skipped under reduced motion (`anim-esg-*`); so is the grid's click wave.
 *
 * A Server Component; `<BackgroundRipple>` is the client leaf.
 */
export function EsgHero({ title, eyebrow, intro, snap = false }: EsgHeroProps) {
  return (
    <Section
      background="black-dots"
      spacing="none"
      fullBleed
      data-snap-section
      className={cn(
        'flex items-center overflow-hidden',
        snap ? 'min-h-viewport snap-start' : 'lg:min-h-(--esg-hero-min-h)',
      )}
    >
      {/* Rows for the tallest screen at the smallest cell: 28 × 44px. */}
      <BackgroundRipple rows={28} fade="screen" />

      <Container
        className={cn(
          'pointer-events-none relative z-10 flex flex-col items-center gap-flow text-center',
          'pt-[calc(var(--spacing-header)+var(--spacing-flow))] pb-section-y lg:py-section-y-tight',
        )}
      >
        <div className="size-esg-wheel shrink-0">
          <EsgWheel />
        </div>

        <div className="flex w-full max-w-(--esg-hero-copy-w) flex-col items-center gap-stack">
          {eyebrow !== undefined && (
            <div className="anim-esg-rise">
              <Eyebrow tone="bright">{eyebrow}</Eyebrow>
            </div>
          )}

          <h1 className="anim-esg-rise anim-esg-rise-2 text-hero text-balance text-white">
            {title}
          </h1>

          {intro !== undefined && (
            <p className="anim-esg-rise anim-esg-rise-2 text-body text-pretty text-body-on-dark">
              {intro}
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
