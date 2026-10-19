import type { CSSProperties } from 'react';
import type { StaticImageData } from 'next/image';
import { MediaFrame } from '@/components/ui/media-frame';
import { cn } from '@/lib/utils/cn';
import { SIZES_MAP } from '@/lib/utils/image-sizes';
import { MAP_VIEWBOX } from './dots';

type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>;

export interface MapBeaconProps {
  /** The dotted India artwork — the presence map's. `null` until supplied. */
  map: StaticImageData | null;
  /** The point, in the artwork's own viewBox (`MAP_VIEWBOX`), as a site pin's is. */
  x: number;
  y: number;
  className?: string;
}

/** Three halos, each a step behind the last, so the beacon pulses outward in rings. */
const RINGS = [0, 1, 2];

/**
 * One place on the dotted India map, marked by a beacon — a solid core with
 * rings pulsing out of it. Contact Us's office on its map preview.
 *
 * **The presence map's geometry, exactly**, so a point plotted here lands
 * where it does on the business pages: the same `--aspect-map-india` box,
 * the artwork contained in it, the point placed by percentage of
 * `MAP_VIEWBOX`. The box is sized by its height (`h-full`) and takes its
 * width from the ratio, so it must sit in a space wider than the map is —
 * a narrower one would clamp the width and the point would drift off its
 * place. Every caller today gives it a landscape cell.
 *
 * The rings are the presence map's own `anim-map-ping`, staggered by
 * `--anim-index`; under reduced motion they are absent and the core stays.
 *
 * Decorative: whatever renders it says in words where the place is.
 *
 * A Server Component.
 */
export function MapBeacon({ map, x, y, className }: MapBeaconProps) {
  return (
    <div aria-hidden="true" className={cn('relative aspect-map-india h-full', className)}>
      <MediaFrame
        image={map}
        alt=""
        sizes={SIZES_MAP}
        pending="map/dotted-map"
        className="absolute inset-0 bg-transparent"
        imageClassName="object-contain"
      />

      <span
        className="absolute size-0"
        style={
          {
            left: `${String((x / MAP_VIEWBOX.width) * 100)}%`,
            top: `${String((y / MAP_VIEWBOX.height) * 100)}%`,
          } satisfies StyleWithVars
        }
      >
        {RINGS.map((ring) => {
          const stagger: StyleWithVars = { '--anim-index': ring };
          return (
            <span
              key={ring}
              className="anim-map-ping absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red-bright"
              style={stagger}
            />
          );
        })}
        <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-red-bright bg-white" />
      </span>
    </div>
  );
}
