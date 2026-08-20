import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { LicenseItem } from './LicenseCatalog';

export interface AssignmentSlot {
  id: string;
  /** Slot caption, e.g. "Observability" or "Design". */
  label: ReactNode;
  /** Assigned license, or null/undefined for an open slot. */
  item?: LicenseItem | null;
}

export interface AssignmentSlotsProps extends HTMLAttributes<HTMLDivElement> {
  slots: AssignmentSlot[];
  selectedSlotId?: string | null;
  onSelectSlot?: (slot: AssignmentSlot) => void;
  /** Name shown in open slots. Defaults to "Unassigned". */
  emptyLabel?: ReactNode;
}

/** Per-person assignment slot list — tier-tinted rows with click-to-select. */
export function AssignmentSlots({
  slots,
  selectedSlotId,
  onSelectSlot,
  emptyLabel = 'Unassigned',
  className = '',
  ...rest
}: AssignmentSlotsProps) {
  return (
    <div className={cn('cp-assign-slots', className)} {...rest}>
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          className={cn(
            'cp-assign-slot',
            slot.item && `cp-tier--${slot.item.tier}`,
            !slot.item && 'is-empty',
            selectedSlotId === slot.id && 'is-selected',
          )}
          onClick={() => onSelectSlot?.(slot)}
        >
          <span className="cp-assign-slot__label">{slot.label}</span>
          <span className="cp-assign-slot__name">{slot.item?.name ?? emptyLabel}</span>
          {slot.item && <span className="cp-assign-slot__tier">{slot.item.tier}</span>}
        </button>
      ))}
    </div>
  );
}
