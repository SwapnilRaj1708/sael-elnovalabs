import type { NewsItem } from '@/lib/content';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { NewsCard, NewsCardLink } from '@/components/ui/news-card';
import { Rail } from '@/components/ui/rail/rail';
import { RailArrows } from '@/components/ui/rail/rail-arrows';
import { RailTrack } from '@/components/ui/rail/rail-track';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_NEWS_CARD } from '@/lib/utils/image-sizes';

/**
 * How many cards cascade in one after another; the rest share the last one's
 * delay. Six covers every card on screen at first sight up to the 1920px the
 * design is reviewed at, where five show, the last cut off. A card further
 * along only enters when the rail scrolls
 * it into view, and an uncapped stagger kept the twelfth one blank for most
 * of a second after it arrived, nearly half of each auto-advance step.
 */
const STAGGERED_CARDS = 6;

export interface NewsCarouselProps {
  title: string;
  items: NewsItem[];
  /**
   * "opens in a new tab" — appended to the accessible name of a card that
   * links out to its publication, as the Newsroom's grid does.
   */
  newTabNote: string;
  snap?: boolean;
  /**
   * How long each step of the rail's auto-advance waits, in milliseconds. It
   * moves one card at a time and returns to the first after the last; it
   * holds still under a pointer, focus or a finger, off screen, and entirely
   * under a reduced-motion preference. See `<Rail autoAdvanceMs>`.
   */
  autoAdvanceMs?: number;
}

/**
 * "In the News" — news items on a paging rail. docs/features/04 §11, rebuilt
 * to `SAEL Home v2`.
 *
 * **The card lost its box.** It was a bordered, rounded panel with a date chip
 * over a 16:10 thumbnail; v2 draws no panel at all. A hairline across the top,
 * the date above the image rather than on it, a 5:4 thumbnail, the headline,
 * and the action at the base — the card is defined by the rule it hangs from
 * and by its own alignment, not by an outline. The accent fills across that
 * rule on hover, which is the same gesture the Business Portfolio's rows make.
 * The card itself is `<NewsCard>` since 2026-10-01, shared with the Newsroom;
 * this rail takes its defaults — paper ground, always standing, 5:4.
 *
 * The items come from the repository, never from this file and never from the
 * page's static content: they are the one surface on the homepage that changes
 * without a deploy. docs/content-model.md §1. An empty list renders nothing at
 * all — a heading over an empty rail is worse than no section.
 *
 * Two rules make a row of these read as a row:
 *
 *  - **Every card is the same height**, whatever its headline runs to. The
 *    rail stretches its children and the card is a column, so the parts that
 *    vary take the slack instead of the card's outline.
 *  - **The headline clamps to three lines.** These range from eight words to
 *    thirty-five, and left alone the tallest one sets the height of the entire
 *    rail. `line-clamp` truncates visually while leaving the full string in the
 *    accessibility tree and in the page's text, so a screen reader and a search
 *    engine both still get the whole headline.
 *
 * **The rail advances on its own**, one card every `autoAdvanceMs`, at the
 * client's request of 2026-10-13. The arrows and a swipe still work, and each
 * buys a full interval before it moves again.
 *
 * A Server Component apart from the rail's arrows and its timer.
 */
export function NewsCarousel({
  title,
  items,
  newTabNote,
  snap = false,
  autoAdvanceMs = 2500,
}: NewsCarouselProps) {
  if (items.length === 0) return null;

  return (
    <Section
      data-snap-section
      background="paper-dots"
      fullBleed
      spacing="tight"
      className={cn('flex items-center', snap && 'min-h-viewport snap-start')}
    >
      <Rail autoAdvanceMs={autoAdvanceMs}>
        <div className="flex w-full flex-col gap-flow">
          <Container className="flex flex-wrap items-center justify-between gap-stack">
            <Reveal order={0}>
              <Eyebrow tone="deep">{title}</Eyebrow>
            </Reveal>

            <RailArrows previousLabel="Previous news" nextLabel="Next news" tone="paper" />
          </Container>

          <RailTrack label="SAEL in the news" gap="wide">
            {items.map((item, index) => (
              <li key={item.id} className="flex w-news-card shrink-0 snap-start">
                {/* 2, 3, 4 … — the label is 0 and 1 is skipped, so the cards
                    cascade in after it rather than alongside it. */}
                <Reveal order={Math.min(index, STAGGERED_CARDS - 1) + 2} className="flex w-full">
                  <NewsCard
                    title={item.title}
                    publishedAt={item.publishedAt}
                    imageUrl={item.imageUrl}
                    // Decorative here, as it has been since FE-04: the
                    // headline under it is the card's subject.
                    imageAlt=""
                    sizes={SIZES_NEWS_CARD}
                    action={
                      // The visible label is generic, so the accessible name
                      // carries the headline. "Read More" repeated six times is
                      // a list of identical links to a screen-reader user.
                      <NewsCardLink
                        href={item.href}
                        label="Read More"
                        accessibleLabel={`Read more: ${item.title}`}
                        newTabNote={item.category === 'in-the-news' ? newTabNote : undefined}
                      />
                    }
                  />
                </Reveal>
              </li>
            ))}
          </RailTrack>
        </div>
      </Rail>
    </Section>
  );
}
