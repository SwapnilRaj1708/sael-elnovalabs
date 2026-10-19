import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils/cn';

/**
 * Eyebrow → title → description, with the spacing between them decided once.
 *
 * Twelve sections need this arrangement. Without a primitive, twelve sections
 * invent their own margins and the vertical rhythm of the page comes apart at
 * the breakpoints where the tokens change.
 *
 * Renders `h2` by default. Pass `as="h1"` on the one heading per page that is
 * the page title, and `as="h3"` where the section sits inside another. The
 * component will not guess: heading level is a document-structure decision,
 * and getting it wrong breaks the outline a screen-reader user navigates by.
 */
export interface SectionHeadingProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  align?: 'start' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = 'h2',
  align = 'start',
  className,
  children,
  ...props
}: SectionHeadingProps) {
  const centred = align === 'center';

  return (
    <div
      className={cn('flex flex-col gap-stack', centred && 'items-center text-center', className)}
      {...props}
    >
      {eyebrow !== undefined && eyebrow !== null && <Eyebrow>{eyebrow}</Eyebrow>}

      {/* h1 is the only level that takes the hero size; everything else is a
          section heading and takes --text-h2 regardless of its level, because
          level is about structure and size is about hierarchy on the page. */}
      <Heading className={cn(Heading === 'h1' ? 'text-hero' : 'text-h2')}>{title}</Heading>

      {description !== undefined && description !== null && (
        <p className={cn('max-w-(--measure) text-body', centred && 'mx-auto')}>{description}</p>
      )}

      {children}
    </div>
  );
}
