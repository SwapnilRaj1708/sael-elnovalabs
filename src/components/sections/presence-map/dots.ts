/**
 * The coordinate space the project sites are placed in.
 *
 * **Since 2026-10-06 the artwork is `map.svg`** (homepage, Contact Us) and its
 * four business recolourings (`solar-energy-map.svg`, `solar-cell-map.svg`,
 * `solar-module-map.svg`, `agri-waste-to-energy-map.svg`). They frame the
 * landmass edge to edge, where `dotted-map.svg` left a 0.7% margin.
 *
 * **All five were replaced on 2026-10-13** with artwork at 4193 × 4521 (it
 * was 4195 × 4628), and the homepage's pins were re-placed by hand against
 * it. Every other page's pins are the same states at the same points — the
 * business pages' sites and Contact Us's office are copies of the homepage's
 * — so they were moved by the same amounts. The box below was not changed.
 * The history that follows is about `dotted-map.svg`.
 *
 * It is the viewBox of `src/assets/images/dotted-map.svg`, the dotted India
 * artwork the client supplied on 2026-08-21, and it is only here so the
 * numbers in `src/app/_content/homepage.ts` have somewhere to say what they
 * are measured against. Change one and change the other.
 *
 * **The generated `DOT_PATH` that used to live here is gone.** Every dot was a
 * subpath of a single `<path>`, sampled from Natural Earth onto a 13px grid
 * and coloured by a gradient this file also defined — about 24 KB of geometry
 * shipped in the page. The supplied SVG draws the same landmass and carries
 * its own ramp, so the artwork is now a file handed to `next/image` like the
 * rest of the brand artwork, and the five `--color-map-dot-*` tokens went with
 * the path.
 *
 * The six site coordinates were carried across rather than re-measured: the
 * old geometry and the new file are the same map at different scales, so each
 * point was mapped through the ratio of the two landmasses' bounding boxes.
 * They agree closely — the two dot fields overlap at about 0.8 by Jaccard on a
 * 24 × 24 occupancy grid — but that is a derivation, not a measurement, and
 * the pins are worth an eye before this ships.
 */
export const MAP_VIEWBOX = { width: 311.33, height: 337.45 } as const;
