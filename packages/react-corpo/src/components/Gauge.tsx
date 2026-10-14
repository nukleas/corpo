import { useId, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const SWEEP = 240;
const START = 150; // degrees, clockwise from 3 o'clock: the arc opens at the bottom
const CX = 60;
const CY = 60;
const R = 50;

const point = (deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return `${(CX + R * Math.cos(rad)).toFixed(2)} ${(CY + R * Math.sin(rad)).toFixed(2)}`;
};
const arc = (from: number, to: number) => `M ${point(from)} A ${R} ${R} 0 ${to - from > 180 ? 1 : 0} 1 ${point(to)}`;

export interface GaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** What is measured — the caption under the value and the meter's accessible name. */
  label: string;
  /** Formats the center value. @default rounds and appends "%" when the range is 0–100 */
  format?: (value: number) => string;
  /**
   * Severity of the reading. The page decides it (e.g. against its own
   * thresholds); `warn`/`err` are status colors, so say why in nearby text.
   * @default 'accent'
   */
  tone?: 'accent' | 'ok' | 'warn' | 'err';
}

/**
 * Corpo gauge — a calm radial meter for one KPI against a range: utilization,
 * quota attainment, capacity. The fill carries severity and the track is a
 * lighter step of the same color. For several values use a bar chart; for a
 * bare number use {@link Stat}.
 */
export function Gauge({ value, min = 0, max = 100, label, format, tone = 'accent', className, ...rest }: GaugeProps) {
  const labelId = useId();
  const clamped = Math.min(max, Math.max(min, value));
  const share = max > min ? (clamped - min) / (max - min) : 0;
  const percent = min === 0 && max === 100;
  const text = format?.(value) ?? `${Math.round(value)}${percent ? '%' : ''}`;

  return (
    <div
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={text}
      aria-labelledby={labelId}
      className={cn('cp-gauge', tone !== 'accent' && `cp-gauge--${tone}`, className)}
      {...rest}
    >
      <svg className="cp-gauge__svg" viewBox="0 0 120 92" aria-hidden="true">
        <path className="cp-gauge__track" d={arc(START, START + SWEEP)} />
        {share > 0 && <path className="cp-gauge__fill" d={arc(START, START + SWEEP * share)} />}
        <text className="cp-gauge__value" x={CX} y={CY + 8}>
          {text}
        </text>
      </svg>
      <span id={labelId} className="cp-gauge__label">
        {label}
      </span>
    </div>
  );
}
