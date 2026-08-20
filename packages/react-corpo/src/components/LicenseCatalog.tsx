import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

/** License tier — maps to the `cp-tier--*` modifier family. */
export type LicenseTier = 'free' | 'standard' | 'professional' | 'enterprise';

export interface LicenseDetailRow {
  label: string;
  value: ReactNode;
}

export interface LicenseItem {
  id: string;
  name: string;
  tier: LicenseTier;
  /** Category line, e.g. "Observability · Annual contract". */
  category?: string;
  /** Total seats on the contract; shown as "N seats" on the card. */
  seats?: number;
  /** Detail rows (cost, renewal, seats in use, …) for {@link LicenseDetail}. */
  details?: LicenseDetailRow[];
  desc?: string;
}

export interface LicenseCatalogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: LicenseItem[];
  /** Pad the grid with empty cells up to this count. */
  minCells?: number;
  selectedId?: string | null;
  /** Licenses already assigned to the active person — marked with a corner dot. */
  assignedIds?: string[];
  onSelect?: (item: LicenseItem) => void;
  /** Assign intent — double-click or Enter on a card. */
  onActivate?: (item: LicenseItem) => void;
}

/** Tier-tinted license/tool catalog grid with click-to-select and activate-to-assign. */
export function LicenseCatalog({
  items,
  minCells = 0,
  selectedId,
  assignedIds,
  onSelect,
  onActivate,
  className = '',
  ...rest
}: LicenseCatalogProps) {
  const padding = Math.max(0, minCells - items.length);
  return (
    <div className={cn('cp-license-grid', className)} {...rest}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            'cp-license-card',
            `cp-tier--${item.tier}`,
            selectedId === item.id && 'is-selected',
            assignedIds?.includes(item.id) && 'is-assigned',
          )}
          title={item.name}
          onClick={() => onSelect?.(item)}
          onDoubleClick={() => onActivate?.(item)}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              onActivate?.(item);
            }
          }}
        >
          <span className="cp-license-card__name">{item.name}</span>
          <span className="cp-license-card__tier">{item.tier}</span>
          {item.seats != null && (
            <span className="cp-license-card__seats">{item.seats} seats</span>
          )}
        </button>
      ))}
      {Array.from({ length: padding }, (_, i) => (
        <div key={`empty-${i}`} className="cp-license-card is-empty" />
      ))}
    </div>
  );
}
