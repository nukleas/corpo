import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { CpBarChart } from '@nukleas/corpo/charts';
import type { ChartApi, ChartSeries } from '@nukleas/corpo/charts';
import { cn } from '../lib/cn';

export interface BarChartProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Series in fixed categorical order (--corpo-chart-1…5). More than five
   * render in the neutral overflow color — fold extras into an "Other" series.
   */
  series: ChartSeries[];
  /** X-axis category labels. */
  labels?: string[];
  /** Tooltip value formatter. Defaults to en-US number formatting. */
  yFormat?: (value: number) => string;
}

/**
 * Grouped bar chart — non-negative values, rounded data-ends, per-bar
 * tooltip, legend for 2+ series. Wraps the vanilla `CpBarChart` engine;
 * size it via the host element (it fills its container).
 */
export function BarChart({ series, labels, yFormat, className = '', ...rest }: BarChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ChartApi | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const api = CpBarChart(host, { series, labels, yFormat });
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
    apiRef.current?.update({ series, labels, yFormat });
  }, [series, labels, yFormat]);

  return <div ref={hostRef} className={cn('cp-chart', className)} {...rest} />;
}
