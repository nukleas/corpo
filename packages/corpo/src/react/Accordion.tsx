import { useState, type ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  multiple?: boolean;
  className?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Accordion({ items, defaultOpen = [], multiple = false, className = '' }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const isOpen = prev.includes(id);
      if (isOpen) return prev.filter((x) => x !== id);
      return multiple ? [...prev, id] : [id];
    });
  };

  return (
    <div className={cx('cp-accordion', className)}>
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
