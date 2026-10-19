import type { StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_SDG_DETAIL_ICON } from '@/lib/utils/image-sizes';

export interface SdgDetail {
  /** The block's `id` — `sdg-3` — which every link to the goal lands on. */
  id: string;
  /** The goal's UN number. */
  number: number;
  /** The goal's name. */
  title: string;
  /** The UN's official colour icon for the goal, unaltered. `null` until supplied. */
  icon: StaticImageData | null;
  /** The icon's asset name, for the placeholder while it is `null`. */
  iconPending?: string;
  pillar: string;
  issue: string;
  description: string;
  focusArea: string;
}

/** The four headings the cells sit under — the source table's own. */
export interface SdgDetailLabels {
  pillar: string;
  issue: string;
  description: string;
  focusArea: string;
}

export interface SdgDetailListProps {
  /** In the order to draw them; the list does not sort. */
  goals: readonly SdgDetail[];
  labels: SdgDetailLabels;
}

/** One labelled cell. A `<div>` inside a `<dl>` groups its term and detail. */
function Fact({
  label,
  className,
  detailClassName,
  children,
}: {
  label: string;
  /** The pair's placement in the grid. */
  className?: string;
  /** The detail's type. */
  detailClassName: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <dt className="text-meta text-on-dark-faint uppercase">{label}</dt>
      <dd className={detailClassName}>{children}</dd>
    </div>
  );
}

/**
 * The SDG page's goals (FE-15) — one block per goal, each the goal's UN icon
 * beside its name and the four things SAEL's table says about it.
 *
 * **The live page sets this as one five-column table**: Strategic Pillar,
 * Material Issue, Description of Issue, Focus Area, and the icon under "SDG
 * Alignment". Five columns of running text do not survive a phone, so each
 * row becomes a block and each cell a labelled pair under the table's own
 * heading — a `<dl>`, which keeps the pairing a table's header gave a screen
 * reader. Nothing is dropped: the fifth column is the icon, drawn whole.
 *
 * **Anchors are the requirement** (features/15): every block carries the
 * live page's `id="sdg-N"`, which Our Key ESG Metrics' icons link to. The
 * page does not snap, so `scroll-padding-top` on `<html>` (globals.css)
 * lands each block under the masthead rather than behind it, and every icon
 * above an anchor sits in a box its token sizes before the image arrives,
 * so nothing moves the target after a cold load has scrolled to it. The
 * icons are blobs (`<MediaFrame>`, a placeholder in the same box when the
 * container is unconfigured). The first block
 * has no rule and no top padding of its own, so it takes a scroll margin
 * instead.
 *
 * The layout, mobile first:
 *
 *  - **Icon beside the name** at every width, in `--sdg-detail-cols`; the
 *    icon grows from 80px on a phone to 160px at 1440 (`--spacing-sdg-detail-icon`).
 *  - **The facts under both** below `md`; from `md` in the name's column,
 *    with the icon spanning the two rows; Strategic Pillar and Focus Area
 *    side by side from `sm`.
 *  - **From `lg`, two columns of facts**: the issue and its description on
 *    the left, the pillar and focus area on the right
 *    (`--sdg-detail-facts-cols`).
 *
 * The icon is `alt=""`: the block names its goal in text, number and name,
 * so the picture would only say it again. The UN's guidelines allow nothing
 * on top of an icon (see `<SdgGrid>`), and none is drawn.
 *
 * A Server Component; only `<Reveal>` is client.
 */
export function SdgDetailList({ goals, labels }: SdgDetailListProps) {
  return (
    <Section background="black-dots" spacing="closing">
      <ol className="flex list-none flex-col">
        {goals.map((goal) => (
          <li
            key={goal.id}
            id={goal.id}
            className="border-t border-outline-dark py-flow first:scroll-mt-flow first:border-t-0 first:pt-0 last:pb-0"
          >
            <Reveal className="grid grid-cols-(--sdg-detail-cols) items-start gap-x-flow gap-y-stack">
              <MediaFrame
                image={goal.icon}
                alt=""
                sizes={SIZES_SDG_DETAIL_ICON}
                pending={goal.iconPending}
                className="size-sdg-detail-icon md:row-span-2"
                imageClassName="object-contain"
              />

              <div className="flex flex-col gap-tight self-center md:self-start">
                <p className="text-meta text-on-dark-faint uppercase">SDG {goal.number}</p>
                <h2 className="text-h2 text-balance text-white">{goal.title}</h2>
              </div>

              <dl
                className={cn(
                  'col-span-2 grid gap-x-flow gap-y-stack sm:grid-cols-2',
                  'md:col-span-1 md:col-start-2 lg:grid-cols-(--sdg-detail-facts-cols)',
                )}
              >
                <Fact
                  label={labels.issue}
                  className="sm:col-span-2 lg:col-span-1"
                  detailClassName="text-h3 text-pretty text-white"
                >
                  {goal.issue}
                </Fact>
                <Fact
                  label={labels.description}
                  className="sm:col-span-2 lg:col-span-1 lg:row-start-2"
                  detailClassName="text-body text-pretty text-body-on-dark"
                >
                  {goal.description}
                </Fact>
                <Fact
                  label={labels.pillar}
                  className="lg:col-start-2 lg:row-start-1"
                  detailClassName="text-body text-white"
                >
                  {goal.pillar}
                </Fact>
                <Fact
                  label={labels.focusArea}
                  className="lg:col-start-2 lg:row-start-2"
                  detailClassName="text-body text-white"
                >
                  {goal.focusArea}
                </Fact>
              </dl>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
