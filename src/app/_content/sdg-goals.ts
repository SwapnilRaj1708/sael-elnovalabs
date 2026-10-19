import type { StaticImageData } from 'next/image';
import { cdnImage } from '@/lib/assets/cdn';

export interface SdgGoalEntry {
  /** The goal's UN number. */
  number: number;
  /** The goal's name as Our Key ESG Metrics writes it. */
  title: string;
  /**
   * The UN's official colour icon, unaltered. `null` when the blob container
   * is not configured, and a placeholder holds its box.
   */
  icon: StaticImageData | null;
  /** The icon's asset name, for that placeholder — `sdg/goal-03`. */
  iconPending: string;
}

/**
 * One goal and its icon, which lives in the blob container at
 * `web-assets/media/sdg/goal-NN.png`. Every icon is 1024 × 1024, read from
 * the blobs themselves.
 */
function goal(number: number, title: string): SdgGoalEntry {
  const file = `goal-${String(number).padStart(2, '0')}`;
  return {
    number,
    title,
    icon: cdnImage(`web-assets/media/sdg/${file}.png`, 1024, 1024),
    iconPending: `sdg/${file}`,
  };
}

/**
 * The ten UN Sustainable Development Goals SAEL commits to, in numeric
 * order — shared by Our Key ESG Metrics' icon grid and the SDG page, so the
 * two name and draw them identically.
 *
 * The ten, and their names, are the live Our Key ESG Metrics page's. The
 * icons are the UN's official colour files, downloaded from un.org on
 * 2026-10-06 ("17 SDG Icons (WEB)", `E-Goal-NN-1024x1024.png`) — not the
 * live site's copies, which are not confirmed to be current (goal 10's icon
 * was redrawn in 2018). They were committed under `src/assets/images/sdg/`
 * until the client uploaded them to the blob container on 2026-10-08; the
 * blobs are byte-identical to those files. See `<SdgGrid>` for what the UN's
 * guidelines allow on top of them, which is nothing.
 */
export const SDG_GOALS: readonly SdgGoalEntry[] = [
  goal(3, 'Good Health & Well-Being'),
  goal(5, 'Gender Equality'),
  goal(7, 'Affordable & Clean Energy'),
  goal(8, 'Decent Work & Economic Growth'),
  goal(9, 'Industry, Innovation, & Infrastructure'),
  goal(10, 'Reduced Inequality'),
  goal(11, 'Sustainable Cities & Communities'),
  goal(12, 'Responsible Consumption & Production'),
  goal(13, 'Climate Action'),
  goal(15, 'Life On Land'),
];

/** The SDG page, as the navigation and sitemap address it. */
export const SDG_PAGE_PATH = '/sustainable-development-goals/';

/**
 * A goal's block on the SDG page — the live site's own anchors (`#sdg-N`),
 * written with the trailing slash the route carries.
 */
export const sdgHref = (n: number): string => `${SDG_PAGE_PATH}#sdg-${String(n)}`;

/** The block's `id` that `sdgHref` lands on. */
export const sdgAnchor = (n: number): string => `sdg-${String(n)}`;
