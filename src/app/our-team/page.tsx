import type { Metadata } from 'next';
import { TeamGrid } from '@/components/sections/team-grid';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  ourTeamEmpty,
  ourTeamGroups,
  ourTeamHero,
  ourTeamMembers,
  ourTeamMeta,
} from '../_content/our-team';

export const metadata: Metadata = buildMetadata({
  title: ourTeamMeta.title,
  // No description: the design file carries a `<title>` and no
  // `<meta name="description">`, and `buildMetadata` omits the tag rather than
  // emitting a placeholder. /CLAUDE.md §2 rule 3. {{TODO: content}} — a meta
  // description for /our-team/.
  //
  // `trailingSlash: true` in next.config.ts, and the legacy site's URL is
  // `/our-team/`. /CLAUDE.md §2 rule 6 — the canonical must match exactly.
  path: '/our-team/',
});

/**
 * Our Team — the roster on two tabs, Leadership and Management.
 *
 * Built to `Our Team.dc.html` (Claude Design project
 * `a6a044b5-3829-44df-baae-d700f52344ec`), read through the design MCP.
 *
 * **Static content, not repository content.** The roster is `ourTeamMembers`
 * in `_content/our-team.ts`: SAEL descoped the backend's team endpoint on
 * 20 Sep 2026 (backend row 5.24), so there is no fetch here and nothing that
 * can fail, in either `CONTENT_SOURCE`. A change to the team is a release.
 *
 * The page passes and the section renders, which is the split /CLAUDE.md §5
 * asks for: `<TeamGrid>` never imports content, so it can be shown anything —
 * a full roster, one group, or nothing.
 *
 * **No `<PageHero>`** — the one place this departs from `about-us/page.tsx`,
 * and it is explained on `<TeamGrid>` itself. It also does not snap: it never
 * has, and the client's 2026-10-11 call that put snapping back on About Us
 * did not name this page.
 *
 * A Server Component, and so is everything under it bar two leaves — the tab
 * list, and the biography dialog on each card.
 */
export default function OurTeamPage() {
  return (
    <TeamGrid
      title={ourTeamHero.title}
      intro={ourTeamHero.intro}
      breadcrumb={ourTeamHero.breadcrumb}
      groups={ourTeamGroups}
      members={ourTeamMembers}
      emptyTitle={ourTeamEmpty.title}
      emptyDescription={ourTeamEmpty.description}
    />
  );
}
