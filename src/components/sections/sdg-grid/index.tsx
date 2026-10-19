import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import { DisplayHeading } from '@/components/ui/display-heading';
import { Eyebrow } from '@/components/ui/eyebrow';
import { MediaFrame } from '@/components/ui/media-frame';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_SDG_TILE } from '@/lib/utils/image-sizes';

export interface SdgGoal {
  /** The goal's UN number, 1–17. */
  number: number;
  /** The goal's name as the page writes it — part of the link's accessible name. */
  title: string;
  /** Where the tile goes: the goal's own section on the SDG page. */
  href: string;
  /** The UN's official colour icon for the goal, unaltered. `null` until supplied. */
  icon: StaticImageData | null;
  /** The icon's asset name, for the placeholder while it is `null`. */
  iconPending?: string;
}

export interface SdgGridProps {
  eyebrow?: string;
  title: string;
  /** In numeric order. The grid does not sort them. */
  goals: readonly SdgGoal[];
  /**
   * `dark` is the site's default. `paper` sets the label and heading in their
   * paper ramps and gives the tiles the site's own focus ring, which reads on
   * paper where the dark ground's white one does not — Our Key ESG Metrics,
   * since 2026-10-14. The icons are the UN's either way.
   */
  ground?: 'dark' | 'paper';
  /**
   * Opt into the page's section snapping — a screen tall, content centred.
   * See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

/**
 * The UN Sustainable Development Goals SAEL commits to, as the UN's own
 * icons — Our Key ESG Metrics (FE-13), built to `Our Key ESG Metrics
 * v2.dc.html` in its grid form (the design also offers a carousel; the grid
 * needs nothing new and lays the icons out the way the guidelines prefer).
 *
 * **The icons are shown exactly as the UN issues them, and that constrains
 * everything here** (SDG Guidelines, Sep 2023, as the design's handoff reads
 * them):
 *
 *  - the official colour version, whole — number, name and pictogram — with
 *    `object-contain`, never cropped;
 *  - square, with no radius, mask or clip, which is why the tiles have no
 *    card around them and no `--radius-sdg` on them;
 *  - no filter, overlay, opacity, shadow or hover effect, so a tile answers
 *    the pointer with nothing and the keyboard with a focus ring only;
 *  - in numeric order — five across from `md`, two below.
 *
 * From `lg` the grid stops at `--sdg-grid-w`, so the section — heading and
 * two rows of icons — fits one screen on a page that snaps. The grid is
 * centred in the row (the client's call of 2026-10-07); the label and
 * heading stay at the row's start, in line with every other section's on
 * the page (2026-10-08).
 *
 * **Nothing under the icons**, at the client's request of 2026-10-07. The
 * UN's disclaimer and its two links, which the icon guidelines ask for on
 * the same page and which sat here until then, were removed with the rest.
 *
 * Each tile links to its goal on the SDG page. The icon is `alt=""` inside
 * the link because the link itself is named — "SDG 7: Affordable & Clean
 * Energy" — and the picture would only say it again.
 *
 * The files are SAEL's own copies, in the blob container (`web-assets/media/sdg/`),
 * rather than hotlinked from un.org, which the guidelines' own download page
 * asks of users. `<MediaFrame>` draws each, so an unconfigured container
 * shows a placeholder in the tile rather than a broken image; it adds
 * nothing over an icon that is there.
 *
 * A Server Component; only `<Reveal>` is client.
 */
export function SdgGrid({ eyebrow, title, goals, ground = 'dark', snap = false }: SdgGridProps) {
  const headingOrder = eyebrow === undefined ? 0 : 1;
  const paper = ground === 'paper';

  return (
    <Section
      background={paper ? 'paper-dots' : 'black-dots'}
      spacing="tight"
      data-snap-section
      className={cn(snap && 'flex min-h-viewport snap-start items-center')}
    >
      <div className="flex flex-col gap-flow">
        <div className="flex flex-col gap-stack">
          {eyebrow !== undefined && (
            <Reveal order={0}>
              <Eyebrow tone={paper ? 'deep' : 'bright'}>{eyebrow}</Eyebrow>
            </Reveal>
          )}

          <Reveal order={headingOrder}>
            <DisplayHeading ground={ground} className="w-fit">
              {title}
            </DisplayHeading>
          </Reveal>
        </div>

        <Reveal order={headingOrder + 1}>
          <ul className="mx-auto grid grid-cols-2 gap-stack md:grid-cols-5 lg:max-w-(--sdg-grid-w)">
            {goals.map((goal) => (
              <li key={goal.number}>
                <Link
                  href={goal.href}
                  aria-label={`SDG ${String(goal.number)}: ${goal.title}`}
                  className={cn(
                    'relative block aspect-square outline-offset-4',
                    !paper && 'focus-visible:outline-white',
                  )}
                >
                  <MediaFrame
                    image={goal.icon}
                    alt=""
                    sizes={SIZES_SDG_TILE}
                    pending={goal.iconPending}
                    className="absolute inset-0"
                    imageClassName="object-contain"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
