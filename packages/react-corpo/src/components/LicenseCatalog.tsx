import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

/** License tier. Shown as plain sentence-case text, never colored. */
export type LicenseTier = 'free' | 'standard' | 'professional' | 'enterprise';

/** Display label for a {@link LicenseTier}. */
export const LICENSE_TIER_LABEL = {
  free: 'Free',
  standard: 'Standard',
  professional: 'Professional',
  enterprise: 'Enterprise',
} satisfies Record<LicenseTier, string>;

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
  /** Total seats on the contract; shown as "N seats" in the catalog row. */
  seats?: number;
  /** Detail rows (cost, renewal, seats in use, …) for {@link LicenseDetail}. */
  details?: LicenseDetailRow[];
  desc?: string;
}

export interface LicenseCatalogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: LicenseItem[];
  selectedId?: string | null;
  /** Licenses already assigned to the active person — marked with a dot after the name. */
  assignedIds?: string[];
  onSelect?: (item: LicenseItem) => void;
  /** Assign intent — double-click or Enter on a row. */
  onActivate?: (item: LicenseItem) => void;
}

/** License catalog: one compact row per license (name, tier, seats), click to select, activate to assign. */
export function LicenseCatalog({
  items,
  selectedId,
  assignedIds,
  onSelect,
  onActivate,
  className = '',
  ...rest
}: LicenseCatalogProps) {
  return (
    <div className={cn('cp-license-list', className)} {...rest}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            'cp-license-row',
            selectedId === item.id && 'is-selected',
            assignedIds?.includes(item.id) && 'is-assigned',
          )}
          onClick={() => onSelect?.(item)}
          onDoubleClick={() => onActivate?.(item)}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              onActivate?.(item);
            }
          }}
        >
          <span className="cp-license-row__name">{item.name}</span>
          <span>{LICENSE_TIER_LABEL[item.tier]}</span>
          <span className="cp-license-row__seats">{item.seats == null ? '–' : `${item.seats} seats`}</span>
        </button>
      ))}
    </div>
  );
}
