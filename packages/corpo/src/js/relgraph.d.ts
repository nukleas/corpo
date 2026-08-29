export interface RelGraphNode {
  id: string;
  /** Node label; unlabeled nodes render as dots only. */
  label?: string;
  /** Category — drives color (chart series in first-seen order, neutral past five). */
  kind?: string;
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

export interface RelGraphOptions extends RelGraphModel {
  onSelect?: (id: string | null, node: RelGraphNode | null) => void;
  onHover?: (id: string | null) => void;
}

export interface RelGraphApi {
  select(id: string | null): void;
  getSelection(): string | null;
  replaceModel(model: RelGraphModel): void;
  fit(padding?: number): void;
  zoomTo(id: string): void;
  /** Re-resolve --corpo-* tokens — call after a theme class change. */
  refreshTheme(): void;
  destroy(): void;
}

export function CpRelGraph(root: HTMLElement, opts?: RelGraphOptions): RelGraphApi;
