export type DepGraphState = 'blocked' | 'ready' | 'in-progress' | 'done';

export interface DepGraphNode {
  id: string;
  label: string;
  /** Explicit column/row; auto-computed as longest path from roots when omitted. */
  tier?: number;
  state?: DepGraphState;
  /** Dependency node ids — edges are derived from these. */
  dependsOn?: string[];
  /** Owning person or team; rendered on the node and in the tooltip. */
  owner?: string;
  /** Display-only effort/size tag, e.g. "6 wk" or "L". */
  estimate?: string;
  /** Per-node stroke/dot color; any CSS color. Defaults to the state's status token. */
  color?: string;
  /** Tooltip body text. */
  desc?: string;
}

export interface DepGraphModel {
  nodes: DepGraphNode[];
  direction?: 'ltr' | 'ttb';
}

export interface DepGraphOptions extends DepGraphModel {
  onSelect?: (id: string | null, node: DepGraphNode | null) => void;
  /**
   * Advance request — fired when a `ready` or `in-progress` node is activated
   * while selected. The engine never mutates state; apply via setState/replaceModel.
   */
  onAdvance?: (id: string, node: DepGraphNode) => void;
  onHover?: (id: string | null) => void;
}

export interface DepGraphApi {
  select(id: string | null): void;
  getSelection(): string | null;
  setState(id: string, state: DepGraphState): void;
  replaceModel(model: DepGraphModel): void;
  fit(padding?: number): void;
  zoomTo(id: string): void;
  destroy(): void;
}

export function CpDepGraph(root: HTMLElement, opts?: DepGraphOptions): DepGraphApi;
