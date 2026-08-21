export interface ChartSeries {
  label: string;
  /** Values aligned to `labels`; null renders a gap (line) or no bar. */
  data: (number | null)[];
  /** Override the fixed categorical color for this series; any CSS color. */
  color?: string;
}

export interface ChartModel {
  /**
   * Series in fixed categorical order (--corpo-chart-1…5). More than five
   * render in the neutral overflow color — fold extras into an "Other" series.
   */
  series: ChartSeries[];
  /** X-axis category labels. */
  labels?: string[];
  /** Value formatter for the tooltip. Defaults to en-US number formatting. */
  yFormat?: (value: number) => string;
}

export interface ChartApi {
  update(model: Partial<ChartModel>): void;
  destroy(): void;
}

/** Multi-series line chart — crosshair + shared tooltip on hover. */
export function CpLineChart(root: HTMLElement, opts?: ChartModel): ChartApi;

/** Grouped non-negative bar chart — rounded data-ends, per-bar tooltip. */
export function CpBarChart(root: HTMLElement, opts?: ChartModel): ChartApi;

export interface SparklineModel {
  data: number[];
  /** Any CSS color; defaults to var(--corpo-chart-1). */
  color?: string;
}

export interface SparklineApi {
  update(model: Partial<SparklineModel>): void;
  destroy(): void;
}

/** Inline trend line for stat tiles — no axes, no tooltip. */
export function CpSparkline(root: HTMLElement, opts?: SparklineModel): SparklineApi;
