import { useState } from 'react';
import { cn } from '../lib/cn';

export interface CalendarProps {
  /** Selected day. */
  value?: Date;
  /** Highlight a span: both endpoints render selected, the days between get a band. `end` may be pending. */
  range?: { start: Date; end?: Date };
  /** Month shown first. @default value, range start, or today */
  defaultMonth?: Date;
  onChange?: (date: Date) => void;
  isDisabled?: (date: Date) => boolean;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** Corpo calendar — month grid with prev/next navigation, no external date library. */
export function Calendar({ value, range, defaultMonth, onChange, isDisabled }: CalendarProps) {
  const [month, setMonth] = useState(() => defaultMonth ?? value ?? range?.start ?? new Date());
  const today = new Date();
  const days = buildGrid(month);

  return (
    <div className="cp-calendar">
      <div className="cp-calendar__header">
        <button
          type="button"
          className="cp-calendar__nav"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="cp-calendar__label">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          className="cp-calendar__nav"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="cp-calendar__grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="cp-calendar__weekday">
            {w}
          </span>
        ))}
        {days.map((d) => {
          const outside = d.getMonth() !== month.getMonth();
          const selected =
            (value != null && sameDay(d, value)) ||
            (range != null && (sameDay(d, range.start) || (range.end != null && sameDay(d, range.end))));
          const inRange = range?.end != null && !selected && d > range.start && d < range.end;
          const isToday = sameDay(d, today);
          const disabled = isDisabled?.(d) ?? false;
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              className={cn(
                'cp-calendar__day',
                outside && 'cp-calendar__day--outside',
                isToday && 'cp-calendar__day--today',
                selected && 'cp-calendar__day--selected',
                inRange && 'cp-calendar__day--in-range',
              )}
              aria-pressed={selected}
              onClick={() => onChange?.(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
