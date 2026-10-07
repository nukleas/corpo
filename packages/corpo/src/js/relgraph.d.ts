export interface RelGraphNode {
  id: string;
  /** Node label; unlabeled nodes render as dots only. */
  label?: string;
  /** Category — drives color (chart series in first-seen order, neutral past five). */
  kind?: string;
  /** Second filter axis (cluster, team, region, …). */
  group?: string;
  /** Hierarchical parent — when any node sets this, scope drill-down is a subtree. */
  parent?: string;
  /** World-space position. Nodes without one are placed on a golden-angle spiral. */
  x?: number;
  y?: number;
  /** Node radius in world units. Default 4. */
  r?: number;
}

export interface RelGraphEdge {
  source: string;
  target: string;
}

export interface RelGraphKind {
  /** Any CSS color; overrides the automatic chart-series assignment. */
  color?: string;
  label?: string;
}

export interface RelGraphModel {
  nodes: RelGraphNode[];
  edges: RelGraphEdge[];
  kinds?: Record<string, RelGraphKind>;
}

/**
 * `preset` uses provided x/y (spiral fill-in); `force` runs Barnes-Hut in a
 * Web Worker with progressive settle; `radial` is concentric BFS rings;
 * `tiers` is the layered longest-path layout shared with CpDepGraph.
 */
export type RelGraphLayout = 'preset' | 'force' | 'radial' | 'tiers';

/**
 * `lod` fades labels in with zoom (highest-degree first).
 * `gutter` packs labels into the left/right margins with leader lines.
 * `focus` labels only the selection neighborhood, hover, and search hits.
 */
export type RelGraphLabelMode = 'lod' | 'gutter' | 'focus';

export type RelGraphDragPhase = 'start' | 'move' | 'end';

/** Inclusion filters. An omitted or empty list means that axis is unrestricted. */
export interface RelGraphFilters {
  kinds?: string[];
  groups?: string[];
}

export interface RelGraphOptions extends RelGraphModel {
  /** Layout applied at load and on replaceModel. Default 'preset'. */
  layout?: RelGraphLayout;
  /** Label strategy. Default 'lod'. */
  labels?: RelGraphLabelMode;
  /** Kind/group inclusion filters. Edges hide when either end is filtered out. */
  filters?: RelGraphFilters;
  /** Initial scope — see `setScope`. */
  scopeId?: string | null;
  /**
   * When the model has no `parent` links, scope is an N-hop neighborhood.
   * Default 1.
   */
  scopeHops?: number;
  /** Draw the overview minimap. Default true. */
  minimap?: boolean;
  onSelect?: (id: string | null, node: RelGraphNode | null) => void;
  /** Fires on every selection change, including box-select. */
  onSelectIds?: (ids: string[]) => void;
  onHover?: (id: string | null) => void;
  /** Fired when a layout finishes (force: when the simulation cools). */
  onLayoutEnd?: (layout: RelGraphLayout) => void;
  onScope?: (id: string | null, node: RelGraphNode | null) => void;
  onDrag?: (id: string, pt: { x: number; y: number }, phase: RelGraphDragPhase) => void;
}

export interface RelGraphApi {
  select(id: string | null): void;
  /** Replace the selection with `ids` (empty clears). */
  selectMany(ids: string[]): void;
  getSelection(): string | null;
  getSelections(): string[];
  replaceModel(model: RelGraphModel): void;
  fit(padding?: number): void;
  zoomTo(id: string): void;
  /** Re-run a layout (defaults to the current one) and refit the view. */
  runLayout(layout?: RelGraphLayout): void;
  /** Stop a running force simulation, keeping current positions. */
  stopLayout(): void;
  setLabels(mode: RelGraphLabelMode): void;
  getLabels(): RelGraphLabelMode;
  setFilters(filters: RelGraphFilters): void;
  getFilters(): RelGraphFilters;
  /**
   * Drill into a node: hierarchical subtree when `parent` is in use,
   * otherwise an N-hop neighborhood. `null` clears.
   */
  setScope(id: string | null): void;
  getScope(): string | null;
  setMinimap(on: boolean): void;
  /** Nodes whose id or label contains `query` (visible nodes only). */
  find(query: string): RelGraphNode[];
  /** Highlight matches, select the first, and jump the camera to it. */
  search(query: string): RelGraphNode[];
  clearSearch(): void;
  /** Current copies of nodes (with live positions) and edges. */
  getModel(): RelGraphModel;
  /** Re-resolve --corpo-* tokens — call after a theme class change. */
  refreshTheme(): void;
  destroy(): void;
}

export function CpRelGraph(root: HTMLElement, opts?: RelGraphOptions): RelGraphApi;
