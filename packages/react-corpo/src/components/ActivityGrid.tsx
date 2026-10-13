import { useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const DAY = 86_400_000;

export interface ActivityDatum {
  /** Calendar day, `YYYY-MM-DD`. Days missing from `data` count as zero. */
  date: string;
  value: number;
}

export interface ActivityGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  data: ActivityDatum[];
  /** Names the chart, e.g. "Approvals per day, last 12 months". */
  label: string;
  /** Describes one day's value in the tooltip and the cell's accessible name. @default the number */
  format?: (value: number) => string;
}

const parseDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const dayLabel = (ms: number) =>
  new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const monthLabel = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });

/** Level 0 is no activity; 1–4 split the busiest day's value into quarters. */
const levelOf = (value: number, max: number) => (value <= 0 ? 0 : Math.min(4, Math.ceil((value / max) * 4)));

/**
 * Corpo activity grid — a calendar heatmap of one count per day (approvals,
 * postings, logins): weeks run left to right, days top to bottom, and a
 * one-hue sequential ramp shows magnitude. Hover a day for its value; every
 * day is also named for screen readers ("Oct 13, 2026: 4 approvals").
 */
export function ActivityGrid({ data, label, format = String, className, ...rest }: ActivityGridProps) {
  const [tip, setTip] = useState<{ index: number; x: number; y: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const values = new Map<number, number>();
  for (const d of data) {
    const day = parseDay(d.date);
    values.set(day, (values.get(day) ?? 0) + d.value);
  }
  const days = [...values.keys()];
  const first = days.length ? Math.min(...days) : 0;
  const last = days.length ? Math.max(...days) : 0;
  const start = first - new Date(first).getUTCDay() * DAY; // back to Sunday
  const max = Math.max(1, ...values.values());

  const cells = [];
  const months: { week: number; text: string }[] = [];
  for (let t = start, i = 0; days.length > 0 && t <= last; t += DAY, i++) {
    const week = Math.floor(i / 7);
    if (new Date(t).getUTCDate() === 1 && t >= first) months.push({ week, text: monthLabel(t) });
    if (t < first) continue;
    const value = values.get(t) ?? 0;
    cells.push({ t, week, weekday: i % 7, value, level: levelOf(value, max) });
  }
  // Label the opening partial month too, when there is room before the next label.
  if (cells.length > 0 && (months[0]?.week ?? Infinity) >= 3) months.unshift({ week: 0, text: monthLabel(first) });

  // Keep the tooltip inside the chart — measured after render, so the node is moved directly.
  useLayoutEffect(() => {
    const el = tipRef.current;
    const box = root.current;
    if (!tip || !el || !box) return;
    const left = tip.x + 8 + el.offsetWidth > box.clientWidth ? tip.x - el.offsetWidth - 18 : tip.x + 8;
    el.style.left = `${Math.max(0, left)}px`;
    el.style.top = `${Math.max(0, tip.y - el.offsetHeight - 6)}px`;
  }, [tip]);

  const active = tip ? cells[tip.index] : undefined;

  return (
    <div ref={root} role="group" aria-label={label} className={cn('cp-activity', className)} {...rest}>
      <div
        className="cp-activity__grid"
        onMouseMove={(e) => {
          const cell = e.target instanceof HTMLElement ? e.target.closest<HTMLElement>('[data-index]') : null;
          if (cell && Number(cell.dataset.index) !== tip?.index)
            setTip({ index: Number(cell.dataset.index), x: cell.offsetLeft + cell.offsetWidth, y: cell.offsetTop });
        }}
        onMouseLeave={() => setTip(null)}
      >
        {months.map((m) => (
          <span
            key={`${m.week}-${m.text}`}
            className="cp-activity__month"
            style={{ gridColumn: `${m.week + 2} / span 4` }}
          >
            {m.text}
          </span>
        ))}
        {(['Mon', 'Wed', 'Fri'] as const).map((d, i) => (
          <span key={d} className="cp-activity__weekday" style={{ gridRow: i * 2 + 3 }}>
            {d}
          </span>
        ))}
        {cells.map((c, i) => (
          <span
            key={c.t}
            role="img"
            aria-label={`${dayLabel(c.t)}: ${format(c.value)}`}
            className={cn('cp-activity__cell', c.level > 0 && `cp-activity__cell--${c.level}`)}
            style={{ gridColumn: c.week + 2, gridRow: c.weekday + 2 }}
            data-index={i}
          />
        ))}
      </div>
      <div className="cp-activity__legend" aria-hidden="true">
        Less
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={cn('cp-activity__cell', l > 0 && `cp-activity__cell--${l}`)} />
        ))}
        More
      </div>
      {active && (
        <div ref={tipRef} className="cp-chart__tip" aria-hidden="true">
          <span className="cp-chart__tip-title">{dayLabel(active.t)}</span>
          <span className="cp-chart__tip-row">
            <span className="cp-chart__tip-value">{format(active.value)}</span>
          </span>
        </div>
      )}
    </div>
  );
}
