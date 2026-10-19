import { Breadcrumb } from '@/components/ui/breadcrumb';
import { EmptyState } from '@/components/ui/empty-state';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import type { BreadcrumbTrailItem } from '@/lib/seo/json-ld';
import { TeamCard } from './team-card';
import { TeamTabs, type TeamTabsGroup } from './team-tabs';
import type { TeamGroup, TeamMember } from './types';

export type { TeamGroup, TeamMember } from './types';

export interface TeamGridGroup {
  id: TeamGroup;
  /** The tab's label, e.g. "Leadership". */
  label: string;
}

export interface TeamGridProps {
  /** The page's single `<h1>`. */
  title: string;
  /** The standfirst under it. */
  intro?: string;
  /** Root first, current page last. See `<Breadcrumb>`. */
  breadcrumb: readonly BreadcrumbTrailItem[];
  /** The tabs, in the order they are shown. */
  groups: readonly TeamGridGroup[];
  /** The whole roster, in the order the page lists it. Never re-sorted here. */
  members: readonly TeamMember[];
  /** Shown in place of the tabs when `members` is empty. */
  emptyTitle: string;
  emptyDescription?: string;
}

/**
 * The Our Team directory: heading, breadcrumb, and a tabbed grid of people.
 *
 * Built to **`Our Team.dc.html`** (Claude Design project
 * `a6a044b5-3829-44df-baae-d700f52344ec`), read through the design MCP.
 *
 * **This page has no `<PageHero>`, and that is the one place it departs from
 * `docs/features/07-our-team.md` §1.** The design opens on the `black-dots`
 * ground with the `<h1>` and a standfirst, not on a full-bleed banner — and
 * there is no Our Team banner photograph in `docs/asset-inventory.md` to put
 * behind one. The client's ruling on 2026-09-10 was to follow the design and
 * keep the breadcrumb, which the design also omits: `BreadcrumbList` is
 * required on every page below the root by
 * `docs/accessibility-and-seo.md` §3, and dropping the trail would have traded
 * a real SEO obligation for a visual detail. So the section renders the
 * design's opening with `<Breadcrumb>` restored above the title.
 *
 * That makes this the **second** inner-page opening, beside
 * `sections/page-hero/`. It is not a rival template: a page with a banner
 * photograph still uses `<PageHero>`. This is what a page without one looks
 * like, and FE-08 → FE-15 should pick by whether the client has supplied
 * artwork, not by which came first.
 *
 * **One section, not two.** The design draws the heading, the tabs and the
 * cards inside a single `SAEL.Section`, and splitting them would put a seam of
 * `--spacing-section-y` between a tab and the panel it controls.
 *
 * Content-agnostic, like every section: the title, the standfirst, the trail,
 * the tab labels and the roster all arrive as props. It knows that a team has
 * groups; it does not know that they are called Leadership and Management.
 *
 * A Server Component. Only `<TeamTabs>` and each card's `<BioDisclosure>` are
 * client leaves, and both panels are rendered here and passed down as nodes.
 */
export function TeamGrid({
  title,
  intro,
  breadcrumb,
  groups,
  members,
  emptyTitle,
  emptyDescription,
}: TeamGridProps) {
  // Partitioned, never re-sorted: the roster's own order is the only thing
  // that decides who comes first.
  // A group with nobody in it is dropped rather than rendered as an empty
  // panel behind a tab that leads nowhere.
  const tabs: TeamTabsGroup[] = groups
    .map((group) => ({
      id: group.id,
      label: group.label,
      members: members.filter((member) => member.group === group.id),
    }))
    .filter((group) => group.members.length > 0)
    .map((group) => ({
      id: group.id,
      label: group.label,
      panel: (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,var(--team-grid-col-min)),1fr))] gap-x-gap-grid gap-y-flow">
          {group.members.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      ),
    }));

  return (
    <Section background="black-dots">
      <div className="flex w-full flex-col gap-flow">
        <div className="flex flex-col gap-stack">
          <Reveal order={0}>
            <Breadcrumb items={breadcrumb} />
          </Reveal>

          <Reveal order={1}>
            <h1 className="max-w-(--hero-measure) text-hero text-white">{title}</h1>
          </Reveal>

          {intro !== undefined && (
            <Reveal order={2}>
              <p className="max-w-(--measure) text-body text-pretty text-body-on-dark">{intro}</p>
            </Reveal>
          )}
        </div>

        {/* The whole directory arrives as one `<Reveal>`, not one per card —
            seventeen cards cascading a step apart would still be arriving long
            after the reader reached them. Same call `<ValueGrid>` makes, and
            the reasoning in docs/design-reconciliation.md §9. */}
        <Reveal order={3}>
          {tabs.length === 0 ? (
            <EmptyState ground="dark" title={emptyTitle} description={emptyDescription} />
          ) : (
            <TeamTabs groups={tabs} label={title} />
          )}
        </Reveal>
      </div>
    </Section>
  );
}
