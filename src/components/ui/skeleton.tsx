import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * A loading placeholder for a Suspense boundary.
 *
 * `aria-hidden`, because a skeleton has nothing to announce — the boundary's
 * content will announce itself when it arrives, and a screen reader reading
 * out a row of grey boxes is noise. The pulse stops under
 * `prefers-reduced-motion`, leaving a static block.
 *
 * Give it a size with utilities: `<Skeleton className="h-6 w-40" />`.
 */
export type SkeletonProps = ComponentPropsWithRef<'div'>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-card bg-surface-alt motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
