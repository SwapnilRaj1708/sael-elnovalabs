import type { StaticImageData } from 'next/image';
import { MediaFrame } from '@/components/ui/media-frame';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';
import { SIZES_GOAL_CARD, SIZES_GOAL_ICON } from '@/lib/utils/image-sizes';

export interface Goal {
  id: string;
  /** "Mission". Set as written — the design does not uppercase these. */
  title: string;
  body: string;
  /** Full-bleed background photograph. */
  image: StaticImageData | null;
  /**
   * The goal's line mark. The client's own artwork, supplied on 2026-08-21 in
   * place of the `lucide-react` stand-ins that stood here.
   *
   * A file rather than an inlined component: each of the three declares its
   * own `clippath` id, and three of them inlined on one page would collide on
   * that id. docs/asset-inventory.md §3 draws the same line. They are drawn in
   * near-black, so the card inverts them — see the note at the call site.
   */
  icon: StaticImageData | null;
}

export interface GoalsGridProps {
  title: string;
  goals: Goal[];
  snap?: boolean;
}

/**
 * "Our Goals" — Mission, Vision and Ethos as three photographic cards.
 * docs/features/04 §10, rebuilt to `SAEL Home v2`.
 *
 * Three cards a hairline apart inside a hairline frame, on the black ground.
 * The 1px gaps are the grid's own background showing through, which is what
 * draws the rules between cards without any card owning a border its
 * neighbour also owns.
 *
 * **The resting state shows the photograph as it is.** That is the client's
 * call on 2026-08-20 and it is a change from both the design file and the
 * build before it, each of which laid a permanent scrim over the image. At
 * rest a card is its photograph, its mark and its name, centred; the scrim and
 * the description both arrive with the pointer.
 *
 * **The pointer opens the card rather than swapping its face.** Until
 * 2026-08-25 the mark and the name faded out as the description faded in, in
 * the same place — two states cross-fading, so at the halfway point the card
 * showed neither clearly. The client asked for the earlier build's movement
 * back, keeping the current marks: the mark and the name are carried *upward*
 * and stay legible, a rule appears under them, and the description rises into
 * the space that opens below it. Nothing is exchanged for anything; the card
 * simply has more in it. How the height is animated without a magic number is
 * the note on the panel itself.
 *
 * Which leaves the mark and the name sitting on an untreated photograph, so
 * they carry `--shadow-goal-title` rather than leaning on a scrim that is not
 * there. Two of the three backgrounds are bright enough that they would
 * otherwise be unreadable — the orange one especially, where white on that
 * orange is about 2:1.
 *
 * Everything hover-driven is gated on `(hover: hover)`. A touch device cannot
 * hover, and a card whose description is behind an interaction nobody can
 * perform is a card with no description. There the scrim is simply on and both
 * states are stacked and visible, which is the arrangement the design draws.
 *
 * The photographs carry meaning only by association, so they are decorative:
 * each card's title and body say everything the card means, and describing
 * "a close-up of green leaves" to a screen-reader user adds noise, not
 * information. Hence `alt=""` and no `alt` on the interface.
 *
 * A Server Component. Nothing here is interactive.
 */
export function GoalsGrid({ title, goals, snap = false }: GoalsGridProps) {
  return (
    <Section
      data-snap-section
      background="black-dots"
      spacing="tight"
      className={cn('flex items-center', snap && 'min-h-viewport snap-start')}
    >
      <div className="flex w-full flex-col gap-flow">
        {/* The same leading label the Business Portfolio takes, so the two dark
            sections read as a pair. */}
        <Reveal order={0}>
          <Eyebrow tone="bright">{title}</Eyebrow>
        </Reveal>

        {/* The gaps are this element's own background showing between the
            cards, and the frame is the same colour — so the rules are drawn
            once, by the grid, rather than by six borders that have to agree. */}
        <div className="grid gap-px border border-hairline-grid bg-hairline-grid md:grid-cols-3">
          {goals.map((goal, index) => (
            <Reveal key={goal.id} order={index + 2} className="flex">
              <article
                // A floor, not a fixed ratio. A portrait aspect made the card
                // as tall as its width dictated, which on a wide screen was
                // taller than the section had room for — and the copy is
                // positioned inside, so it had nowhere to go but over the
                // edge. Min-height keeps the three matched by the grid while
                // letting the longest one set the height.
                className={cn(
                  'group relative flex w-full overflow-hidden',
                  // Shorter while the three are stacked — see the token.
                  'min-h-goal-card-sm md:min-h-goal-card',
                  'bg-surface-black',
                )}
              >
                <MediaFrame
                  image={goal.image}
                  alt=""
                  sizes={SIZES_GOAL_CARD}
                  pending={`goals/${goal.id}`}
                  className="absolute inset-0"
                  imageClassName={cn(
                    'scale-(--scale-goal-rest) transition-transform duration-(--duration-reveal)',
                    'group-hover:scale-(--scale-goal-hover) motion-reduce:transition-none',
                    'motion-reduce:group-hover:scale-(--scale-goal-rest)',
                  )}
                />

                {/* On at rest only where nothing can hover — see the note
                      above on why the photograph is otherwise untreated. */}
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 bg-(image:--gradient-goal-reveal)',
                    'opacity-100 transition-opacity duration-(--duration-card)',
                    'hover-hover:opacity-0',
                    'hover-hover:group-hover:opacity-100',
                    'hover-hover:group-focus-within:opacity-100',
                    'motion-reduce:transition-none',
                  )}
                />

                <div
                  className={cn(
                    'relative flex w-full flex-col items-center justify-center',
                    'p-inset text-center text-white',
                  )}
                >
                  {/* The mark and the name stay put and are carried upward by
                      the panel opening beneath them — they are not what
                      changes. No `gap` on the column above, because the gap
                      would still be there with the panel closed and would push
                      the resting composition off centre by half of itself; the
                      spacing that separates the two parts belongs to the panel
                      and arrives with it. */}
                  <div
                    className={cn(
                      'flex flex-col items-center gap-stack',
                      'text-shadow-(--shadow-goal-title)',
                    )}
                  >
                    {/*
                        The mark is supplied in near-black for use on paper.
                        `brightness-0 invert` flattens it to black and then
                        flips it to white — two filters that between them turn
                        any artwork, whatever colour it was drawn in, into a
                        clean white silhouette. It is the one way to recolour a
                        file-loaded SVG without inlining it, and inlining these
                        three would collide on their shared ids.
                      */}
                    <MediaFrame
                      image={goal.icon}
                      alt=""
                      sizes={SIZES_GOAL_ICON}
                      pending={`goals/${goal.id}-mark`}
                      className="size-goal-icon shrink-0 bg-transparent drop-shadow-(--shadow-goal-title)"
                      imageClassName="object-contain brightness-0 invert"
                    />
                    {/* `text-white` on the heading itself, not inherited from
                          the wrapper: globals.css gives every h1–h6 an explicit
                          `--color-ink` in the base layer, and an explicit
                          colour beats an inherited one however close the
                          ancestor is. */}
                    <h3 className="text-goal-name text-white">{goal.title}</h3>
                  </div>

                  {/*
                    The description panel: a grid row that opens from `0fr` to
                    `1fr`.

                    A row fraction and not a height, because there is no height
                    to write down — the body runs to a different number of
                    lines in each of the three cards and at every width, and
                    `max-height: 20rem` would make all three animate at a
                    different apparent speed and clip whichever one outgrew the
                    guess. `0fr → 1fr` is the element's own height, animated,
                    with nothing to keep in step.

                    It is also what pushes the mark and the name up. The column
                    is `justify-center`, so the panel taking height moves
                    everything above it by half of that height, at exactly the
                    rate the panel opens. Nothing has to be told how far to
                    travel.

                    Open by default and closed only under `hover-hover:`, the
                    way everything else in this card is arranged: a touch
                    device cannot hover, and a description behind an
                    interaction nobody can perform is a description nobody
                    reads.
                  */}
                  <div
                    className={cn(
                      'grid w-full grid-rows-[1fr] hover-hover:grid-rows-[0fr]',
                      'transition-[grid-template-rows] duration-(--duration-card)',
                      'hover-hover:group-hover:grid-rows-[1fr]',
                      'hover-hover:group-focus-within:grid-rows-[1fr]',
                      'motion-reduce:transition-none',
                    )}
                  >
                    {/* The clip the row's height acts on. It carries nothing
                        else — margins or padding here would be part of the
                        animated box and the panel would never close fully. */}
                    <div className="overflow-hidden">
                      <div
                        className={cn(
                          'hover-hover:translate-y-2 hover-hover:opacity-0',
                          'transition duration-(--duration-card)',
                          'hover-hover:group-hover:translate-y-0',
                          'hover-hover:group-hover:opacity-100',
                          'hover-hover:group-focus-within:translate-y-0',
                          'hover-hover:group-focus-within:opacity-100',
                          'motion-reduce:transition-none',
                        )}
                      >
                        {/* The rule between the two halves. Decorative: it
                            separates the name from the description and says
                            nothing a screen reader needs. `--hairline-on-media`,
                            not the flat-ground `--hairline-dark`: this rule
                            is drawn over a lit photograph, and the flat-ground
                            value vanished into all three images. */}
                        <span
                          aria-hidden="true"
                          className="mx-auto my-stack block h-px w-rule-w bg-hairline-on-media"
                        />
                        <p className="text-body-sm text-pretty">{goal.body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
