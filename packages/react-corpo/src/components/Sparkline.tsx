import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { CpSparkline } from '@nukleas/corpo/charts';
import type { SparklineApi } from '@nukleas/corpo/charts';
import { cn } from '../lib/cn';

export interface SparklineProps extends HTMLAttributes<HTMLSpanElement> {
  data: number[];
  /** Any CSS color; defaults to var(--corpo-chart-1). */
  color?: string;
}

/**
 * Inline trend line for stat tiles — 2px line with an end dot, no axes or
 * tooltip. Wraps the vanilla `CpSparkline` engine (120×32px by default;
 * override via className/style).
 */
export function Sparkline({ data, color, className = '', ...rest }: SparklineProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const apiRef = useRef<SparklineApi | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const api = CpSparkline(host, { data, color });
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
    apiRef.current?.update({ data, color });
  }, [data, color]);

  return <span ref={hostRef} className={cn('cp-sparkline', className)} {...rest} />;
}
