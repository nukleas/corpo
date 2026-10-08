import { useState } from 'react';
import { cn } from '../lib/cn';
import { useFieldControlProps } from '../lib/field-context';
import { Calendar } from './Calendar';
import { Popover } from './Popover';

/** An inclusive span of days. */
export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateRangePreset {
  label: string;
  /** The span this preset selects, relative to `today`. */
  range: (today: Date) => DateRange;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  /** Shortcuts beside the calendar. Pass your own for fiscal periods. @default DEFAULT_DATE_RANGE_PRESETS */
  presets?: DateRangePreset[];
  /** Custom range formatter. @default short dates joined by an en dash */
  format?: (range: DateRange) => string;
  /** Trigger height. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

const day = (y: number, m: number, d: number) => new Date(y, m, d);
const quarterStart = (t: Date) => t.getMonth() - (t.getMonth() % 3);

/** Calendar-period shortcuts for reporting screens. */
export const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'This month',
    range: (t) => ({ start: day(t.getFullYear(), t.getMonth(), 1), end: day(t.getFullYear(), t.getMonth() + 1, 0) }),
  },
  {
    label: 'Last month',
    range: (t) => ({ start: day(t.getFullYear(), t.getMonth() - 1, 1), end: day(t.getFullYear(), t.getMonth(), 0) }),
  },
  {
    label: 'This quarter',
    range: (t) => ({
      start: day(t.getFullYear(), quarterStart(t), 1),
      end: day(t.getFullYear(), quarterStart(t) + 3, 0),
    }),
  },
  {
    label: 'Last quarter',
    range: (t) => ({
      start: day(t.getFullYear(), quarterStart(t) - 3, 1),
      end: day(t.getFullYear(), quarterStart(t), 0),
    }),
  },
  {
    label: 'Year to date',
    range: (t) => ({ start: day(t.getFullYear(), 0, 1), end: day(t.getFullYear(), t.getMonth(), t.getDate()) }),
  },
];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function defaultFormat({ start, end }: DateRange): string {
  const short = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const year = (d: Date) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return start.getFullYear() === end.getFullYear() ? `${short(start)} – ${year(end)}` : `${year(start)} – ${year(end)}`;
}

/**
 * Corpo date range picker — an input-styled trigger opening presets beside a
 * {@link Calendar}. The first click picks the start, the second the end
 * (either order); a preset applies at once. The range is inclusive.
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Select a date range',
  presets = DEFAULT_DATE_RANGE_PRESETS,
  format = defaultFormat,
  size = 'md',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  // First click of a new range — the end is still pending.
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const fieldProps = useFieldControlProps(false);

  const commit = (range: DateRange) => {
    onChange?.(range);
    setPendingStart(null);
    setOpen(false);
  };
  const pickDay = (d: Date) => {
    if (!pendingStart) return setPendingStart(d);
    commit(d < pendingStart ? { start: d, end: pendingStart } : { start: pendingStart, end: d });
  };
  const today = new Date();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPendingStart(null);
      }}
      trigger={
        <button
          type="button"
          {...fieldProps}
          className={cn('cp-input', 'cp-input--trigger', size !== 'md' && `cp-input--${size}`)}
        >
          {value ? format(value) : <span className="cp-input__placeholder">{placeholder}</span>}
        </button>
      }
    >
      <div className="cp-daterange">
        {presets.length > 0 && (
          <div className="cp-daterange__presets" role="group" aria-label="Presets">
            {presets.map((p) => {
              const r = p.range(today);
              const active = value != null && sameDay(value.start, r.start) && sameDay(value.end, r.end);
              return (
                <button
                  key={p.label}
                  type="button"
                  className="cp-daterange__preset"
                  aria-pressed={active}
                  onClick={() => commit(r)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
        <div>
          <Calendar range={pendingStart ? { start: pendingStart } : value} onChange={pickDay} />
          <p className="cp-daterange__hint" aria-live="polite">
            {pendingStart ? 'Select the end date' : 'Select the start date'}
          </p>
        </div>
      </div>
    </Popover>
  );
}
