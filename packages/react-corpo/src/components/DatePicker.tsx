import { useState } from 'react';
import { Popover } from './Popover';
import { Calendar } from './Calendar';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  /** Custom date formatter. @default toLocaleDateString short */
  format?: (date: Date) => string;
}

function defaultFormat(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Corpo date picker — an input-styled trigger opening a {@link Calendar} in a {@link Popover}. */
export function DatePicker({ value, onChange, placeholder = 'Select a date', format = defaultFormat }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button type="button" className="cp-input" style={{ textAlign: 'left', cursor: 'pointer' }}>
          {value ? format(value) : <span style={{ color: 'var(--corpo-text-dim)' }}>{placeholder}</span>}
        </button>
      }
    >
      <Calendar
        value={value}
        onChange={(d) => {
          onChange?.(d);
          setOpen(false);
        }}
      />
    </Popover>
  );
}
