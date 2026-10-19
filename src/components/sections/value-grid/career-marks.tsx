import Image from 'next/image';
import empowermentIcon from '@/assets/icons/empowerment/animated/40b-empowerment-rising-white-animated.svg';
import appreciationIcon from '@/assets/icons/appreciation/animated/41b-appreciation-hand-star-white-animated.svg';
import teamworkIcon from '@/assets/icons/teamwork/animated/42c-team-venn-white-animated.svg';
import integrityIcon from '@/assets/icons/integrity/animated/43c-integrity-hand-shield-white-animated.svg';
import balanceIcon from '@/assets/icons/balance/animated/44c-balance-work-life-white-animated.svg';
import cultureIcon from '@/assets/icons/positive-work-culture/animated/45a-culture-handshake-people-white-animated.svg';
import pathIcon from '@/assets/icons/long-term-career-paths/animated/46b-career-road-flag-white-animated.svg';
import leadershipIcon from '@/assets/icons/people-oriented-leadership/animated/47b-leadership-leading-team-white-animated.svg';
import { cn } from '@/lib/utils/cn';

/**
 * The Careers page's eight marks (icons 40-47 of the supplied set,
 * 2026-10-08), which replaced the line art drawn here on 2026-09-22.
 *
 * Files rather than inline SVG: each is fixed-colour white, carries its own
 * gradient id and animates itself with SMIL on a 3.5s loop, so none needs
 * `currentColor` and inlining would let ids collide. Every mark is decorative:
 * the card's heading is its name.
 */

/** Sized by the token, not by width/height attributes, so one value governs. */
const MARK_CLASS = 'size-(--value-mark-size) shrink-0 object-contain';

interface MarkProps {
  className?: string;
}

/** Empowerment */
export function EmpowermentMark({ className }: MarkProps) {
  return <Image src={empowermentIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Appreciation */
export function AppreciationMark({ className }: MarkProps) {
  return <Image src={appreciationIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Teamwork */
export function TeamworkMark({ className }: MarkProps) {
  return <Image src={teamworkIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Integrity */
export function IntegrityMark({ className }: MarkProps) {
  return <Image src={integrityIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Balance */
export function BalanceMark({ className }: MarkProps) {
  return <Image src={balanceIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Positive Work Culture */
export function CultureMark({ className }: MarkProps) {
  return <Image src={cultureIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** Long-Term Career Paths */
export function PathMark({ className }: MarkProps) {
  return <Image src={pathIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}

/** People-Oriented Leadership */
export function LeadershipMark({ className }: MarkProps) {
  return <Image src={leadershipIcon} alt="" aria-hidden className={cn(MARK_CLASS, className)} />;
}
