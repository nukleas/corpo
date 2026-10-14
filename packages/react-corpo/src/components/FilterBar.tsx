import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { Chip } from './Chip';

export interface ActiveFilter {
  id: string;
  /** What the filter does, field first: "Status: Overdue". Also names its remove button. */
  label: string;
}

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Applied filters, shown as removable chips. */
  filters: ActiveFilter[];
  onRemove: (id: string) => void;
  /** Shows "Clear filters" while any filter is applied. */
  onClearAll?: () => void;
  /** Right-aligned result summary, e.g. "12 of 84 invoices". Announced politely as it changes. */
  count?: ReactNode;
  /** Controls that add filters — a {@link Dropdown} of fields, a {@link Select}, a {@link DateRangePicker}. */
  children?: ReactNode;
}

/**
 * Corpo filter bar — the applied filters over a list or table as removable
 * chips, the controls that add them, clear-all, and a result count. It only
 * displays filter state; the page owns it and filters its own rows. Put it in
 * {@link DataTable}'s `toolbar`, and switch saved views with pill
 * {@link Tabs} above it.
 */
export function FilterBar({ filters, onRemove, onClearAll, count, className, children, ...rest }: FilterBarProps) {
  return (
    <div role="group" aria-label="Filters" className={cn('cp-filter-bar', className)} {...rest}>
      {children}
      {filters.map((f) => (
        <Chip key={f.id} removeLabel={`Remove filter ${f.label}`} onRemove={() => onRemove(f.id)}>
          {f.label}
        </Chip>
      ))}
      {onClearAll && filters.length > 0 && (
        <Button size="sm" variant="ghost" onClick={onClearAll}>
          Clear filters
        </Button>
      )}
      {count != null && (
        <span className="cp-filter-bar__count" aria-live="polite">
          {count}
        </span>
      )}
    </div>
  );
}
