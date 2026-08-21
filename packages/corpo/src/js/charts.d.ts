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
  /** Bar chart only: stack the series instead of grouping them. */
  stacked?: boolean;
}

export interface ChartApi {
  update(model: Partial<ChartModel>): void;
  destroy(): void;
}

/** Multi-series line chart — crosshair + shared tooltip on hover. */
export function CpLineChart(root: HTMLElement, opts?: ChartModel): ChartApi;

/** Grouped non-negative bar chart — rounded data-ends, per-bar tooltip. */
export function CpBarChart(root: HTMLElement, opts?: ChartModel): ChartApi;

export interface DonutDatum {
  label: string;
  /** Non-negative slice value; zero/negative entries are skipped (color assignment stays stable). */
  value: number;
  /** Override the fixed categorical color for this slice; any CSS color. */
  color?: string;
}

export interface DonutModel {
  /** Slices in fixed categorical order; five max — fold the tail into "Other". */
  data: DonutDatum[];
  /** Formatter for the center total and tooltip values. */
  format?: (value: number) => string;
  /** Caption under the center total. @default "Total" */
  centerLabel?: string;
}

export interface DonutApi {
  update(model: Partial<DonutModel>): void;
  destroy(): void;
}

/** Composition donut — 2px segment gaps, center total, per-segment share tooltip. */
export function CpDonutChart(root: HTMLElement, opts?: DonutModel): DonutApi;

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
