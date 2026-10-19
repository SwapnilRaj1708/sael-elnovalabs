import type { StaticImageData } from 'next/image';

export interface SolutionSlide {
  id: string;
  /** `null` until the photograph is supplied. */
  image: StaticImageData | null;
  /** Describes the photograph, not the plant — the plaque already names that. */
  alt: string;
  /** The plaque's first line, e.g. "Mizoram". Uppercased by CSS. */
  place: string;
  /** The plaque's second line, e.g. "21 MW Solar Plant". */
  descriptor: string;
}

export interface SolutionsCarouselProps {
  eyebrow: string;
  title: string;
  /** The single paragraph under the heading. */
  lead: string;
  slides: SolutionSlide[];
  snap?: boolean;
}
