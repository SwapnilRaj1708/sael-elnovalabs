import type { Metadata } from 'next';
import { StorySplit } from '@/components/sections/story-split';
import { buildMetadata } from '@/lib/seo/metadata';
import { stories, storyMeta, storyTitle } from '../_content/story-of-our-influence';

export const metadata: Metadata = buildMetadata({
  title: storyMeta.title,
  description: storyMeta.description,
  // `trailingSlash: true` in next.config.ts, and the legacy site's URL is
  // `/story-of-our-influence/`. /CLAUDE.md §2 rule 6.
  path: '/story-of-our-influence/',
});

/**
 * Story of Our Influence (FE-12) — three stories, one screen each.
 *
 * Built to `Story of Our Influence.dc.html` (Claude Design project
 * `6afc516d-…`, 2026-10-06), read through the design MCP. **No hero, and the
 * page snaps**: each story is a full screen with its photograph and copy
 * centred in it, and a scroll lands on the next. It was the first inner page
 * to snap after About Us set the template not to on 2026-09-10 (About Us and
 * five others snap again since 2026-10-11), and it does so through the homepage's own
 * mechanism, `data-snap-sections` in globals.css, so the footer is the last
 * stop here as it is there.
 *
 * The design asks for `proximity` snapping on phones so a short screen can
 * still scroll within a story. The site's one rule is `mandatory`, and it
 * already allows that: a story taller than the screen scrolls freely and
 * snaps only at its edges (css-scroll-snap-1 §6.2, see globals.css), so no
 * second rule was added.
 *
 * The `<h1>` is not drawn — with no hero there is nowhere it belongs in the
 * design — but it is there, first, for assistive technology and search; a
 * page with only `<h2>`s has no title in its outline.
 *
 * `-mt-header lg:mt-0` because the page snaps: below `lg` the masthead
 * overlays the first story rather than pushing it down. See the homepage.
 *
 * A Server Component; only the reveals are client.
 */
export default function StoryOfOurInfluencePage() {
  return (
    <div data-snap-sections className="-mt-header lg:mt-0">
      <h1 className="sr-only">{storyTitle}</h1>
      {stories.map((story) => (
        <StorySplit key={story.id} {...story} snap />
      ))}
    </div>
  );
}
