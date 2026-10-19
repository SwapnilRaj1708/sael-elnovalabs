import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { DisplayHeading } from '@/components/ui/display-heading';
import { GlowFrame } from '@/components/ui/glow-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface CtaPanelProps {
  /** The panel's heading. Rendered as the section's `<h2>`. */
  title: string;
  /** One entry per paragraph, in order. */
  body: string[];
  /**
   * The call to action — a `<Button>`. Optional, because the destination
   * may not be configured: the Careers page's job portal is an environment
   * variable, and a panel with no button is better than a button that goes
   * nowhere.
   */
  action?: ReactNode;
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm. See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

/**
 * A heading, a line or two of copy and one action, centred in a lit panel —
 * the Careers page's "Looking for your dream job?".
 *
 * The live page draws this as a full-width band, which at 1920 puts three
 * short lines across 1608px of ground. The panel is capped at
 * `--panel-max-w` and centred instead, so the copy and its button read as
 * one object with the ground around it.
 *
 * It is the outlined `<Card>` the strategic pillars and the "Why Join" points
 * take, lit two ways because this is the one panel on the page that asks the
 * reader to *do* something: a glow (`--gradient-panel-glow`) rising from the
 * top edge into the black ground, and — the client's ask of 2026-09-22 — a
 * `<GlowFrame>` whose border lights up and sweeps once round the panel each
 * time the section reveals. The block padding is a section's tight rhythm
 * rather than a card's inset, so the panel reads as a band with room around
 * its button.
 *
 * Dark only: the site is a dark site (docs/design-guidelines.md §8) and the
 * client asked on 2026-09-22 for this page to be dark throughout.
 *
 * Content-agnostic: the heading, the paragraphs and the action are props.
 * A Server Component — the sweep is CSS, keyed off `<Reveal>`'s attribute.
 */
export function CtaPanel({ title, body, action, snap = false }: CtaPanelProps) {
  return (
    <Section
      background="black-dots"
      spacing={snap ? 'tight' : 'default'}
      // <GlowFrame>'s halo reaches --glow-halo-radius past the panel so its
      // outer shadow is not cut off, and on a phone that is past the
      // viewport's edge — a horizontal scroll, lit or not. `clip`, not
      // `hidden`, so the halo above and below is left alone.
      data-snap-section
      className={cn('overflow-x-clip', snap && 'flex min-h-viewport snap-start items-center')}
    >
      <Reveal className="mx-auto w-full max-w-(--panel-max-w)">
        <GlowFrame>
          <Card
            shape="outlined"
            ground="dark"
            inset="none"
            // It has a light of its own in <GlowFrame>, and clips its
            // overflow, so the outlined card's hover gradient is left off.
            hoverEffect={false}
            className="flex-col items-center gap-flow overflow-hidden bg-(image:--gradient-panel-glow) py-section-y-tight text-center"
          >
            <DisplayHeading ground="dark">{title}</DisplayHeading>

            <div className="flex max-w-(--ledger-measure) flex-col gap-stack">
              {body.map((paragraph) => (
                <p key={paragraph} className="text-body text-pretty text-body-on-dark">
                  {paragraph}
                </p>
              ))}
            </div>

            {action}
          </Card>
        </GlowFrame>
      </Reveal>
    </Section>
  );
}
