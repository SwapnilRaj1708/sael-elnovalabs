import type { Metadata } from 'next';
import { BusinessTiles } from '@/components/sections/business-tiles';
import { EndeavourSplit } from '@/components/sections/endeavour-split';
import { GoalsGrid } from '@/components/sections/goals-grid';
import { NewsCarousel } from '@/components/sections/news-carousel';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { IntroSplit } from '@/components/sections/intro-split';
import { PresenceMap } from '@/components/sections/presence-map';
import { SolutionsCarousel } from '@/components/sections/solutions-carousel';
import { newsCardLabels } from '@/app/_content/newsroom';
import { TODO_CONTENT } from '@/lib/config/site';
import { getContentRepository, type NewsItem } from '@/lib/content';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  aboutSael,
  businessTiles,
  heroSlides,
  presenceSites,
  ourEndeavour,
  ourGoals,
  presenceSummary,
  solutions,
} from './_content/homepage';

/**
 * The title is carried over verbatim from the live site. It is a ranking
 * title — do not "improve" it. docs/features/04 §Route.
 */
export const metadata: Metadata = buildMetadata({
  title: 'SAEL | Renewable and Green Energy Company India',
  description: TODO_CONTENT,
  path: '/',
});

/**
 * The most the backend will ever return; the backend decides between
 * highlights and the latest K. SAEL may mark up to twelve items for the
 * homepage, and when none are marked the backend sends the latest K
 * (`content.home.in-the-news.limit`, nine by default). Either way the rail
 * renders what comes back, in that order. docs/api-contracts.md §3.3.
 */
const HOME_RAIL_CEILING = 12;

/**
 * The "In the News" rail's items. **A failure throws, in every environment.**
 *
 * `<NewsCarousel>` renders nothing for an empty list, so a failure absorbed
 * here would remove the section with no visible sign, and the homepage
 * without it would then be cached for the whole ISR window. Thrown, the
 * failure is not cached: a regeneration keeps serving the last good homepage
 * and tries again later, and the build fails rather than shipping a homepage
 * without its news. The one cost is the first render with no good version
 * yet, which goes to the error boundary. This departs from
 * docs/content-model.md §3 rule 2 for live, ISR-cached content only.
 */
function resolveNewsItems(): Promise<NewsItem[]> {
  return getContentRepository().getInTheNewsRail(HOME_RAIL_CEILING);
}

/**
 * The homepage. A Server Component: it fetches the news rail and passes it
 * down with the static content, and only the hero carousel and the two rails'
 * arrows opt into the client.
 *
 * Ten sections, against the twelve `docs/features/04` lists: its §2 (stats
 * band) and §4 (business tiles) are one section in the client's design, §9
 * (the SDG marquee) is skipped at the client's request, and §7 and §8 appear
 * in neither the PDF nor this page. See docs/frontend-progress.md.
 *
 * `data-snap-sections` is what turns section snapping on. globals.css matches
 * it with `html:has(…)`, so the behaviour is scoped to this page without the
 * root layout needing to know which routes want it, and every section that
 * opts in carries `snap-start` and `min-h-viewport`.
 *
 * `-mt-header` is the third part of that same rule, and the only part that
 * cannot live in globals.css: below `lg` the masthead overlays the page rather
 * than offsetting it, so the sections have to start at the viewport top, and
 * that means giving back the `pt-header` the root layout puts on <main>. A
 * base-layer rule cannot outrank a utility, so the cancellation is a utility
 * too, and it belongs to the page that snaps rather than to every page. From
 * `lg` the offset is real again and `lg:mt-0` hands it back.
 *
 * **Snapping is CSS and nothing else.** A GSAP `Observer` used to replace
 * scrolling with one-gesture-per-section paging; it is gone. See the note in
 * globals.css.
 */
export default async function HomePage() {
  const news = await resolveNewsItems();

  return (
    <div data-snap-sections className="-mt-header lg:mt-0">
      <HeroCarousel slides={heroSlides} />
      <IntroSplit {...aboutSael} snap />
      <BusinessTiles eyebrow="Business Portfolio" tiles={businessTiles} snap />
      <PresenceMap {...presenceSummary} sites={presenceSites} snap />
      <EndeavourSplit {...ourEndeavour} snap />
      <SolutionsCarousel {...solutions} snap />
      <GoalsGrid {...ourGoals} snap />
      <NewsCarousel title="In the News" items={news} newTabNote={newsCardLabels.newTab} snap />
    </div>
  );
}
