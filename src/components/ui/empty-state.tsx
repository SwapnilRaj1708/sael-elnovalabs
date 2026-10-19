import { FileQuestion, type LucideIcon } from 'lucide-react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The universal fallback: shown when a repository call returns `[]`, and when
 * one fails.
 *
 * Both cases land here deliberately. A malformed backend response degrades to
 * an empty state rather than throwing — a newsroom with no items is a page
 * with a message on it, not a 500. /CLAUDE.md §6.
 *
 * The message is a prop. This primitive knows nothing about news, or
 * documents, or SAEL.
 *
 * `ground` was added by FE-07, its first real consumer: `/our-team/` is drawn
 * on `--color-surface-black`, where the paper palette's near-black type is
 * invisible. The default stays `paper` so nothing that already renders one
 * changes, but most of this site is dark and most callers will want `dark`.
 * Three colours move together per ground, which is why they are a lookup here
 * rather than three `cva` variants that a caller could set inconsistently.
 */
const TONE = {
  paper: { icon: 'text-inert', title: 'text-ink', description: 'text-body-soft' },
  dark: { icon: 'text-on-dark-muted', title: 'text-white', description: 'text-on-dark-soft' },
} as const;

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** A lucide icon component. Decorative — the message carries the meaning. */
  icon?: LucideIcon;
  /** A recovery route, typically a `<Button>`. */
  action?: ReactNode;
  /** Which ground this is drawn on. Follow the surrounding `<Section>`. */
  ground?: keyof typeof TONE;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileQuestion,
  action,
  ground = 'paper',
  className,
  ...props
}: EmptyStateProps) {
  const tone = TONE[ground];

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-stack py-section-y-tight text-center',
        className,
      )}
      {...props}
    >
      <Icon className={cn('size-10', tone.icon)} aria-hidden="true" focusable="false" />
      <p className={cn('text-h3', tone.title)}>{title}</p>
      {description !== undefined && description !== null && (
        <p className={cn('max-w-(--measure) text-body', tone.description)}>{description}</p>
      )}
      {action}
    </div>
  );
}
