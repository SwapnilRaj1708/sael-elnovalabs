/**
 * The animated icon set is nested (`icons/<name>/animated/*-animated.svg`),
 * which the SVGR rule in next.config.ts does not reach — its glob matches only
 * direct children of `icons/`. These are therefore **files**, like the brand
 * artwork: each carries its own gradient id and SMIL animation, so they must
 * not be inlined.
 *
 * **Declared before the `icons/*.svg` pattern on purpose.** Both patterns have
 * the same prefix, and TypeScript breaks that tie in declaration order.
 */
declare module '@/assets/icons/*-animated.svg' {
  import type { StaticImageData } from 'next/image';

  const asset: StaticImageData;
  export default asset;
}

/**
 * SVGs under `src/assets/icons/` are React components, via SVGR — see the
 * `turbopack.rules` entry in next.config.ts.
 *
 * The pattern is deliberately narrow. Next's own `next/image-types/global`
 * declares `*.svg` as a `StaticImageData`, which is right for the brand
 * artwork in `src/assets/images/`: those are fixed-colour files handed to
 * `next/image`. Only the icons — which have to inherit `currentColor` — are
 * components, and TypeScript resolves the longer, more specific pattern first.
 * docs/asset-inventory.md §3.
 *
 * ```tsx
 * import SolarIcon from '@/assets/icons/business-solar-generation.svg';
 * <SolarIcon className="size-8 text-brand-red" aria-hidden />
 * ```
 */
declare module '@/assets/icons/*.svg' {
  import type { FC, SVGProps } from 'react';

  const ReactComponent: FC<SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}

/**
 * SVGs under `src/assets/images/` are **files**, handed to `next/image` like
 * any other asset — fixed-colour brand artwork that must not be inlined,
 * because each declares its own gradient and class ids and two of them on one
 * page would collide. docs/asset-inventory.md §4.
 *
 * Next's `next/image-types/global` types `*.svg` as `any` rather than
 * `StaticImageData`, because it cannot know whether a project runs SVGR. That
 * `any` then spreads silently through every consumer — `no-unsafe-assignment`
 * catches it at the import, which is how this declaration came to exist.
 *
 * The wildcard matches path separators, so this covers nested folders, and
 * TypeScript resolves the longer `@/assets/icons/` pattern above in preference
 * to it.
 */
declare module '@/assets/images/*.svg' {
  import type { StaticImageData } from 'next/image';

  const asset: StaticImageData;
  export default asset;
}
