import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { CpDonutChart } from '@nukleas/corpo/charts';
import type { DonutApi, DonutDatum } from '@nukleas/corpo/charts';
import { cn } from '../lib/cn';

export type { DonutDatum } from '@nukleas/corpo/charts';

export interface DonutChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Slices in fixed categorical order (--corpo-chart-1…5); five max — fold the tail into "Other". */
  data: DonutDatum[];
  /** Formatter for the center total and tooltip values. */
  format?: (value: number) => string;
  /** Caption under the center total. @default 'Total' */
  centerLabel?: string;
}

/**
 * Composition donut — annular segments with 2px surface gaps, the total as a
 * center hero number, per-segment value + share tooltip, legend for 2+
 * segments. Wraps the vanilla `CpDonutChart` engine; size it via the host.
 */
export function DonutChart({ data, format, centerLabel, className = '', ...rest }: DonutChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<DonutApi | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const api = CpDonutChart(host, { data, format, centerLabel });
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
    // The engine is created once; model updates flow through update below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    apiRef.current?.update({ data, format, centerLabel });
  }, [data, format, centerLabel]);

  return <div ref={hostRef} className={cn('cp-chart', className)} {...rest} />;
}
