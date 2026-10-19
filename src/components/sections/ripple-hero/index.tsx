import { BackgroundRipple } from '@/components/ui/background-ripple';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import type { BreadcrumbTrailItem } from '@/lib/seo/json-ld';
import { cn } from '@/lib/utils/cn';

export interface RippleHeroProps {
  /** The page title. Rendered as the page's single `<h1>`, centred. */
  title: string;
  /** Root first, current page last. See `<Breadcrumb>`. */
  breadcrumb?: readonly BreadcrumbTrailItem[];
  /**
   * `hero`, the default, is display type for a page's name — two words to
   * seven. `article` is `--text-h2` at the article measure, for a Newsroom
   * article whose title *is* its `<h1>` and runs to thirty-five words: at
   * hero size that is a screen of headline on a phone.
   */
  titleSize?: 'hero' | 'article';
  /**
   * One line under the title, centred with it — the SDG page's "Our
   * Commitment to The UN SDGs", its live page's subheading (2026-10-07).
   */
  intro?: string;
}

/**
 * A band across the top half of the screen with the page title centred in
 * it, over `<BackgroundRipple>` — the client's replacement, on 2026-09-29,
 * for the legacy Offer Documents banner, whose title also sat centred in a
 * violet-to-red band. It opens all nine Offer Documents pages, each with its
 * own title: "Offer Documents" on the index, the page's name on the rest.
 *
 * Titles run from two words to seven ("Information with respect to Group
 * Companies"), so the band is a minimum height, not a fixed one: a long
 * title on a narrow phone grows it rather than overflowing it, and the grid
 * behind is tall enough to fill it either way.
 *
 * **Full-bleed**, so the Section renders no Container and the copy carries
 * its own. **No `<Reveal>`**: it is above the fold on arrival, as
 * `<PageHero>` is, and content that animates in when it was already on
 * screen reads as a glitch.
 *
 * **The grid stays live under the title.** The copy is `pointer-events:
 * none`, so hovering across the title still lights the cells behind it and a
 * click there still ripples; only the breadcrumb's links take the pointer
 * back. The price is that the title cannot be selected with a mouse, which a
 * two-word heading does not need.
 *
 * An optional breadcrumb sits centred above the title. The Offer Documents
 * pages pass none, at the client's request of 2026-09-29.
 *
 * The band is `--ripple-hero-h` tall — half the screen less the masthead,
 * cut by a quarter, and by 30% from `lg` (`--ripple-hero-h-lg`), the
 * client's call of 2026-09-30 so the content starts higher — starting under
 * the masthead, which `<main>` already offsets.
 *
 * The title sits below the band's centre by a quarter of the top padding
 * of the section under it (`--ripple-title-shift`), also the client's call of
 * 2026-09-30.
 *
 * A Server Component; `<BackgroundRipple>` is the client leaf.
 */
export function RippleHero({ title, breadcrumb, titleSize = 'hero', intro }: RippleHeroProps) {
  return (
    <Section background="black-dots" spacing="none" fullBleed>
      <div className="relative flex min-h-(--ripple-hero-h) w-full items-center overflow-hidden lg:min-h-(--ripple-hero-h-lg)">
        <BackgroundRipple />

        <Container
          // Centred in the band, then moved down by a quarter of the top padding
          // of the section beneath it (--ripple-title-shift). A translate rather
          // than a margin: in a centred flex row a margin moves the copy by
          // only half itself. The bottom padding (40 → 65) is larger than the
          // shift (12 → 24), so even when a long title sets the band's height
          // the title stays inside it.
          className="pointer-events-none relative z-10 flex translate-y-(--ripple-title-shift) flex-col items-center gap-stack py-section-y-tight text-center"
        >
          {breadcrumb !== undefined && (
            <Breadcrumb items={breadcrumb} className="pointer-events-auto" />
          )}

          <h1
            className={cn(
              'text-balance text-white',
              // An article's title takes the pointer back, so a reader can
              // select and copy a headline worth quoting; the grid still
              // lights around it.
              titleSize === 'article'
                ? 'pointer-events-auto max-w-(--measure-article) text-h2'
                : 'max-w-(--measure) text-hero',
            )}
          >
            {title}
          </h1>

          {intro !== undefined && (
            <p className="max-w-(--measure) text-body text-pretty text-body-on-dark">{intro}</p>
          )}
        </Container>
      </div>
    </Section>
  );
}
