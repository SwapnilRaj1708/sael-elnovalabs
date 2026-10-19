import { DisplayHeading } from '@/components/ui/display-heading';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface StakeholderMapProps {
  eyebrow?: string;
  title: string;
  /**
   * The first group — the six across the top of the tree from `lg`. The tree
   * is drawn for six; another count needs its connectors redrawn.
   */
  outer: readonly string[];
  /**
   * The second group — the two at the foot, set apart by a gradient border
   * rather than a label, under the middle two columns. Drawn for two.
   */
  inner: readonly string[];
  /**
   * Opt into the page's section snapping — a screen tall, content centred.
   * See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

/** One stakeholder's box, in either group, at either size. */
function StakeholderBox({ name, inner }: { name: string; inner: boolean }) {
  return (
    <div
      className={cn(
        'flex h-16 items-center rounded-card-outlined px-flow text-h3 text-white',
        'lg:h-stakeholder-box lg:justify-center lg:px-stack lg:text-center',
        inner ? 'gradient-outline' : 'border border-outline-dark',
      )}
    >
      {name}
    </div>
  );
}

/**
 * Our Key ESG Metrics' "Stakeholder's Map" (FE-13) — two groups of
 * stakeholders joined by connector lines, built to `Our Key ESG Metrics
 * v2.dc.html`.
 *
 * **The live page distinguishes the two groups by colour (blue and green)
 * and names neither.** The design keeps that: the second group's boxes take
 * a gradient border where the first group's take a hairline, and there are
 * still no group labels — inventing them would be content SAEL have not
 * written. They are two lists, so a screen reader hears two groups as well.
 *
 * Two drawings of one structure:
 *
 *  - **From `lg`, a tree.** The six outer boxes sit on a six-column grid;
 *    under each a stub drops to a bus that runs between the first and last
 *    columns' centres, a trunk falls from the middle of the bus, and branches
 *    to the two inner boxes, which sit under columns three and four. Every
 *    line is laid out on the boxes' own grid, with the same gap, so the
 *    lines meet the boxes' centres at every width without a single measured
 *    offset.
 *  - **Below `lg`, a spine.** One line runs down the left; each outer box
 *    hangs off it on a short tick, and the inner two on a longer one, set in
 *    further — the same two-level structure, read top to bottom.
 *
 * The lines are decoration (`aria-hidden`); the lists carry the structure.
 *
 * **The tree is tighter than the design's** since 2026-10-07, when it moved
 * under the Reporting Framework so the two share a screen: the boxes are
 * `--spacing-stakeholder-box` (80px, from 104) with less padding beside the
 * names, and the connectors 16 / 24 / 24px rather than 24 / 36 / 36.
 */
export function StakeholderMap({ snap = false, ...props }: StakeholderMapProps) {
  return (
    <Section
      background="black-dots"
      data-snap-section
      className={cn(snap && 'flex min-h-viewport snap-start items-center')}
    >
      <StakeholderMapLayout {...props} />
    </Section>
  );
}

/**
 * The map without the `<Section>` around it — heading and tree.
 *
 * Exported for `<ReportingStakeholders>`, which sets it under Our Key ESG
 * Metrics' Reporting Framework in one section, so the two share a screen
 * (the client's request of 2026-10-07). Everything documented on
 * {@link StakeholderMap} applies here.
 */
export function StakeholderMapLayout({
  eyebrow,
  title,
  outer,
  inner,
}: Omit<StakeholderMapProps, 'snap'>) {
  const headingOrder = eyebrow === undefined ? 0 : 1;

  return (
    <div className="flex flex-col gap-flow">
      <div className="flex flex-col gap-stack">
        {eyebrow !== undefined && (
          <Reveal order={0}>
            <Eyebrow tone="bright">{eyebrow}</Eyebrow>
          </Reveal>
        )}

        <Reveal order={headingOrder}>
          <DisplayHeading ground="dark" className="w-fit">
            {title}
          </DisplayHeading>
        </Reveal>
      </div>

      <Reveal order={headingOrder + 1} className="relative flex flex-col gap-3 lg:gap-0">
        {/* The spine, below `lg`: from the first box's middle to the
              last's. */}
        <span
          aria-hidden="true"
          className="absolute top-8 bottom-8 left-4 w-px bg-outline-dark lg:hidden"
        />

        <ul className="flex flex-col gap-3 lg:grid lg:grid-cols-6 lg:gap-x-inset">
          {outer.map((name) => (
            <li key={name} className="relative pl-10 lg:pl-0">
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-4 h-px w-6 bg-outline-dark lg:hidden"
              />
              <StakeholderBox name={name} inner={false} />
            </li>
          ))}
        </ul>

        {/* The tree's connectors, from `lg`. Three bands, each on the
              boxes' own grid: stubs down to the bus, the trunk, the branch
              and its two drops. */}
        <div aria-hidden="true" className="hidden lg:block">
          <div className="grid h-4 grid-cols-6 gap-x-inset">
            {outer.map((name) => (
              <span key={name} className="group relative">
                {/* The stub, down the column's centre. */}
                <span className="absolute inset-y-0 left-1/2 w-px bg-outline-dark" />
                {/* The bus along the foot: across the column and the gap
                      after it, so the pieces join — but from the centre on
                      the first column and to the centre on the last. */}
                <span className="absolute -right-inset bottom-0 left-0 h-px bg-outline-dark group-first:left-1/2 group-last:right-1/2" />
              </span>
            ))}
          </div>

          <div className="relative h-6">
            <span className="absolute inset-y-0 left-1/2 w-px bg-outline-dark" />
          </div>

          <div className="grid h-6 grid-cols-6 gap-x-inset">
            <span className="relative col-start-3">
              <span className="absolute top-0 -right-inset left-1/2 h-px bg-outline-dark" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-outline-dark" />
            </span>
            <span className="relative col-start-4">
              <span className="absolute top-0 right-1/2 left-0 h-px bg-outline-dark" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-outline-dark" />
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-3 lg:grid lg:grid-cols-6 lg:gap-x-inset">
          {inner.map((name, index) => (
            <li
              key={name}
              className={cn(
                'relative pl-18 lg:pl-0',
                index === 0 ? 'lg:col-start-3' : 'lg:col-start-4',
              )}
            >
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-4 h-px w-14 bg-outline-dark lg:hidden"
              />
              <StakeholderBox name={name} inner />
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
