import { useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Item ids open by default. */
  defaultOpen?: string[];
  /** Allow more than one item open at once. @default false */
  multiple?: boolean;
  className?: string;
}

/** Corpo accordion — collapsible sections with a smooth grid-based expand. */
export function Accordion({ items, defaultOpen = [], multiple = false, className }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const isOpen = prev.includes(id);
      if (isOpen) return prev.filter((x) => x !== id);
      return multiple ? [...prev, id] : [id];
    });
  };

  return (
    <div className={cn('cp-accordion', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id} className="cp-accordion__item" data-open={isOpen}>
            <button type="button" className="cp-accordion__trigger" aria-expanded={isOpen} onClick={() => toggle(item.id)}>
              {item.title}
              <span className="cp-accordion__chevron" aria-hidden="true" />
            </button>
            <div className="cp-accordion__collapse">
              <div className="cp-accordion__content">
                <div className="cp-accordion__content-inner">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
