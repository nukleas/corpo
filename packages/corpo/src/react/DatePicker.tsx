import { useState } from 'react';
import { cx } from './cx';
import { useFieldControlProps } from './field-context';
import { Popover } from './Popover';
import { Calendar } from './Calendar';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  /** Custom date formatter. @default toLocaleDateString short */
  format?: (date: Date) => string;
  /** Trigger height. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

function defaultFormat(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Corpo date picker — an input-styled trigger opening a {@link Calendar} in a {@link Popover}. */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Select a date',
  format = defaultFormat,
  size = 'md',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const fieldProps = useFieldControlProps(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          {...fieldProps}
          className={cx('cp-input', 'cp-input--trigger', size !== 'md' && `cp-input--${size}`)}
        >
          {value ? format(value) : <span className="cp-input__placeholder">{placeholder}</span>}
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
