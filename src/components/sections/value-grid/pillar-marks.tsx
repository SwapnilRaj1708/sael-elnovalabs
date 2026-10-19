import Image from 'next/image';
import growthChart from '@/assets/icons/growth/animated/1a-growth-bar-chart-white-animated.svg';
import excellenceChart from '@/assets/icons/operational-excellence/animated/2a-excellence-thumbs-up-white-animated.svg';
import sustainabilityChart from '@/assets/icons/sustainability/animated/3a-sustainability-infinity-white-animated.svg';
import { cn } from '@/lib/utils/cn';

/**
 * The three "Our Strategic Pillars" marks: the supplied animated icons
 * (2026-10-08), which replaced the hand-drawn line art.
 *
 * Files rather than inline SVG. Each is fixed-colour white, carries its own
 * gradient id and animates itself with SMIL on a 3.5s loop, so it neither needs
 * `currentColor` nor any CSS from `animations.css`, and inlining would let two
 * icons' ids collide. The card's `<h3>` is the mark's name, so each is
 * decorative: `alt=""` with `aria-hidden`.
 */

/** Sized by the token, not by width/height attributes, so one value governs. */
const MARK_CLASS = 'size-(--value-mark-size) shrink-0 object-contain';

export function GrowthMark({ className }: { className?: string }) {
  return <Image src={growthChart} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

export function ExcellenceMark({ className }: { className?: string }) {
  return <Image src={excellenceChart} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

export function SustainabilityMark({ className }: { className?: string }) {
  return (
    <Image src={sustainabilityChart} alt="" aria-hidden className={cn(MARK_CLASS, className)} />
  );
}
