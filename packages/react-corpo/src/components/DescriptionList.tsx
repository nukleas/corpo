import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface DescriptionListItem {
  /** Row label, e.g. "Invoice number". */
  label: ReactNode;
  /** Row value, e.g. "INV-2041". */
  value: ReactNode;
}

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  items: DescriptionListItem[];
  /** Tighter padding and no shadow. @default false */
  compact?: boolean;
}

/** Corpo description list — labeled key/value detail rows, e.g. an invoice details panel. */
export function DescriptionList({ items, compact = false, className, ...rest }: DescriptionListProps) {
  return (
    <dl className={cn('cp-desc-list', compact && 'cp-desc-list--compact', className)} {...rest}>
      {items.map((item, i) => (
        <div key={i} className="cp-desc-list__row">
          <dt className="cp-desc-list__label">{item.label}</dt>
          <dd className="cp-desc-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
