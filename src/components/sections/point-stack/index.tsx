import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface PointStackItem {
  /** The point's name. Rendered as `<h3>` under the surrounding section's `<h2>`. */
  name: string;
  /** Decorative — `name` carries the meaning — so whatever is passed must be `aria-hidden`. */
  mark: ReactNode;
}

/** The ground the stack sits on. Follow the surrounding section. */
export type PointStackGround = 'dark' | 'paper';

export interface PointStackProps {
  items: readonly PointStackItem[];
  ground?: PointStackGround;
  className?: string;
}

const NAME_CLASS: Record<PointStackGround, string> = {
  dark: 'text-white',
  paper: 'text-ink',
};

/**
 * A column of outlined cards, each a mark over a name — the three "Why Join
 * SAEL?" points, which the live page sets beside its copy as icon-and-title
 * pairs with no body of their own.
 *
 * Not a `<ValueGrid>`: that is a section with its own heading and ground,
 * and these points sit *inside* another section, in the column a photograph
 * would otherwise take. Not a `<ul>` either — each point is a heading, and a
 * screen reader walking headings gets the same structure a list would give
 * it without the count read twice; the same call `<CapabilitySplit>` makes.
 *
 * Capped at the prose split's landscape media width, so beside two
 * paragraphs at 1920 the cards are the size a photograph would be rather
 * than three 768px-wide plaques with a mark lost in the middle of each.
 *
 * A Server Component. Nothing here is interactive.
 */
export function PointStack({ items, ground = 'dark', className }: PointStackProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-(--prose-media-landscape-w) flex-col gap-gap-grid',
        className,
      )}
    >
      {items.map((item) => (
        <Card
          key={item.name}
          as="article"
          shape="outlined"
          ground={ground}
          inset="none"
          className="flex-col items-center gap-stack text-center"
        >
          {item.mark}
          <h3 className={cn('text-h3', NAME_CLASS[ground])}>{item.name}</h3>
        </Card>
      ))}
    </div>
  );
}
