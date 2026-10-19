'use client';

import { ChevronDown } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * An accessible disclosure group. Used by the mobile nav drawer, the mobile
 * footer link columns, and investor document grouping.
 *
 * Built on a `<button aria-expanded>` controlling a region, rather than
 * `<details>`/`<summary>`: `<details>` cannot animate its own height, and
 * Safari still announces `<summary>` inconsistently. The tradeoff is that this
 * needs JavaScript, which is why it is the one primitive marked `'use client'`.
 *
 * The panel is unmounted when closed, not hidden. Content inside a `hidden`
 * panel stays in the tab order in some browsers, which puts focus somewhere
 * invisible.
 */

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion(): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (context === null) {
    throw new Error('<AccordionItem> must be rendered inside an <Accordion>.');
  }
  return context;
}

export interface AccordionProps extends ComponentPropsWithRef<'div'> {
  /** Allow more than one panel open at a time. */
  allowMultiple?: boolean;
  /** Values open on first render. */
  defaultOpen?: readonly string[];
}

export function Accordion({
  allowMultiple = false,
  defaultOpen = [],
  className,
  children,
  ...props
}: AccordionProps) {
  const [open, setOpen] = useState<readonly string[]>(defaultOpen);

  const isOpen = useCallback((value: string) => open.includes(value), [open]);

  const toggle = useCallback(
    (value: string) => {
      setOpen((current) => {
        if (current.includes(value)) return current.filter((item) => item !== value);
        return allowMultiple ? [...current, value] : [value];
      });
    },
    [allowMultiple],
  );

  const context = useMemo(() => ({ isOpen, toggle }), [isOpen, toggle]);

  return (
    <AccordionContext value={context}>
      <div className={cn('flex flex-col', className)} {...props}>
        {children}
      </div>
    </AccordionContext>
  );
}

export interface AccordionItemProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Identifies the panel within its group. Must be unique in the group. */
  value: string;
  title: ReactNode;
  children: ReactNode;
  /**
   * The heading level wrapping the trigger. Defaults to `h3`, which is right
   * inside a section that already has an `h2`. Set it to fit the page's
   * outline — the footer's link columns and the mobile nav sit at different
   * depths. `'none'` omits the wrapper for a disclosure that is not a heading.
   */
  headingAs?: 'h2' | 'h3' | 'h4' | 'none';
  /**
   * Applied to the trigger button. Needed wherever the accordion sits on a
   * dark surface: the chevron inherits `currentColor`, so without an override
   * it stays ink-coloured and disappears against the footer.
   */
  triggerClassName?: string;
}

export function AccordionItem({
  value,
  title,
  headingAs = 'h3',
  className,
  triggerClassName,
  children,
  ...props
}: AccordionItemProps) {
  const { isOpen, toggle } = useAccordion();
  const id = useId();
  const open = isOpen(value);

  const panelId = `${id}-panel`;
  const triggerId = `${id}-trigger`;
  const Heading = headingAs === 'none' ? 'div' : headingAs;

  return (
    <div className={cn('border-b border-border', className)} {...props}>
      <Heading className="m-0">
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            toggle(value);
          }}
          className={cn(
            'flex w-full items-center justify-between gap-4 text-left text-h3 text-ink',
            'min-h-touch cursor-pointer py-4',
            'transition-colors duration-(--duration-micro) hover:text-accent-hover',
            triggerClassName,
          )}
        >
          {title}
          <ChevronDown
            className={cn(
              'size-5 shrink-0 transition-transform duration-(--duration-micro)',
              'motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden="true"
            focusable="false"
          />
        </button>
      </Heading>

      {open && (
        <div id={panelId} role="region" aria-labelledby={triggerId} className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
