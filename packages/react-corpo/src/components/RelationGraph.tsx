import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { CpRelGraph } from '@nukleas/corpo/relgraph';
import type {
  RelGraphApi,
  RelGraphDragPhase,
  RelGraphEdge,
  RelGraphFilters,
  RelGraphKind,
  RelGraphLabelMode,
  RelGraphLayout,
  RelGraphNode,
} from '@nukleas/corpo/relgraph';
import { cn } from '../lib/cn';
import { useTheme } from '../theme/ThemeProvider';

export type {
  RelGraphApi,
  RelGraphDragPhase,
  RelGraphEdge,
  RelGraphFilters,
  RelGraphKind,
  RelGraphLabelMode,
  RelGraphLayout,
  RelGraphNode,
} from '@nukleas/corpo/relgraph';

export interface RelationGraphProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onDrag'> {
  nodes: RelGraphNode[];
  edges: RelGraphEdge[];
  /** Per-kind color/label overrides; kinds default to chart-series colors in first-seen order. */
  kinds?: Record<string, RelGraphKind>;
  /**
   * `preset` uses node x/y (spiral fill-in), `force` self-organizes via a
   * worker simulation, `radial` is concentric BFS rings, `tiers` is layered.
   * @default 'preset'
   */
  layout?: RelGraphLayout;
  /**
   * `lod` fades labels in with zoom, `gutter` packs them in the margins with
   * leader lines, `focus` labels only the selection neighborhood.
   * @default 'lod'
   */
  labels?: RelGraphLabelMode;
  /** Kind/group inclusion filters. Edges hide when either end is filtered out. */
  filters?: RelGraphFilters;
  /** Controlled scope; double-click a node (or Enter) drills in. */
  scopeId?: string | null;
  /**
   * When the model has no `parent` links, scope is an N-hop neighborhood.
   * @default 1
   */
  scopeHops?: number;
  /** Overview minimap in the lower-right. @default true */
  minimap?: boolean;
  /**
   * Search-and-jump: highlight nodes whose id or label contains this string,
   * select the first, and pan the camera to it. Empty string clears.
   */
  query?: string;
  /** Controlled selection sync; the graph also selects internally on click. */
  selectedId?: string | null;
  /** Controlled multi-select; wins over `selectedId` when passed. */
  selectedIds?: string[];
  onSelect?: (id: string | null, node: RelGraphNode | null) => void;
  onSelectIds?: (ids: string[]) => void;
  onHover?: (id: string | null) => void;
  /** Fired when a layout finishes (force: when the simulation cools). */
  onLayoutEnd?: (layout: RelGraphLayout) => void;
  onScope?: (id: string | null, node: RelGraphNode | null) => void;
  onDrag?: (id: string, pt: { x: number; y: number }, phase: RelGraphDragPhase) => void;
}

/**
 * Large interactive relationship graph — canvas-rendered, pan/zoom, hover
 * tooltips, click-to-select with neighborhood highlighting, level-of-detail
 * or gutter labels, kind/group filters, scope drill-down, search-and-jump,
 * node dragging, box-select, minimap. Wraps the vanilla `CpRelGraph` scene
 * engine; targets ~10k nodes.
 */
export function RelationGraph({
  nodes,
  edges,
  kinds,
  layout = 'preset',
  labels = 'lod',
  filters,
  scopeId,
  scopeHops,
  minimap = true,
  query,
  selectedId,
  selectedIds,
  onSelect,
  onSelectIds,
  onHover,
  onLayoutEnd,
  onScope,
  onDrag,
  className = '',
  ...rest
}: RelationGraphProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<RelGraphApi | null>(null);
  const handlers = useRef({ onSelect, onSelectIds, onHover, onLayoutEnd, onScope, onDrag });
  useEffect(() => {
    handlers.current = { onSelect, onSelectIds, onHover, onLayoutEnd, onScope, onDrag };
  });
  const mounted = useRef(false);
  const queryReady = useRef(false);
  const theme = useTheme();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const api = CpRelGraph(host, {
      nodes,
      edges,
      kinds,
      layout,
      labels,
      filters,
      scopeId,
      scopeHops,
      minimap,
      onSelect: (id, node) => handlers.current.onSelect?.(id, node),
      onSelectIds: (ids) => handlers.current.onSelectIds?.(ids),
      onHover: (id) => handlers.current.onHover?.(id),
      onLayoutEnd: (name) => handlers.current.onLayoutEnd?.(name),
      onScope: (id, node) => handlers.current.onScope?.(id, node),
      onDrag: (id, pt, phase) => handlers.current.onDrag?.(id, pt, phase),
    });
    if (query) api.search(query);
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the engine is created once; model updates flow through replaceModel below
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    apiRef.current?.replaceModel({ nodes, edges, kinds });
  }, [nodes, edges, kinds]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    if (selectedIds) {
      const cur = api.getSelections();
      if (cur.length !== selectedIds.length || selectedIds.some((id, i) => cur[i] !== id)) {
        api.selectMany(selectedIds);
      }
      return;
    }
    if (selectedId === undefined) return;
    if (api.getSelection() !== selectedId) api.select(selectedId);
  }, [selectedId, selectedIds]);

  useEffect(() => {
    if (mounted.current) apiRef.current?.runLayout(layout);
  }, [layout]);

  useEffect(() => {
    if (mounted.current) apiRef.current?.setLabels(labels);
  }, [labels]);

  const kindsKey = (filters?.kinds ?? []).join('\0');
  const groupsKey = (filters?.groups ?? []).join('\0');
  useEffect(() => {
    if (mounted.current) apiRef.current?.setFilters(filters ?? {});
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- keyed on filter contents so a fresh-but-equal object doesn't re-filter
  }, [kindsKey, groupsKey]);

  useEffect(() => {
    const api = apiRef.current;
    if (!mounted.current || !api || scopeId === undefined) return;
    if (api.getScope() !== scopeId) api.setScope(scopeId);
  }, [scopeId]);

  useEffect(() => {
    if (mounted.current) apiRef.current?.setMinimap(minimap);
  }, [minimap]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || query === undefined) return;
    if (!queryReady.current) {
      queryReady.current = true;
      return;
    }
    if (query) api.search(query);
    else api.clearSearch();
  }, [query]);

  // Canvas colors are resolved token values, not live var() references.
  useEffect(() => {
    if (mounted.current) apiRef.current?.refreshTheme();
  }, [theme]);

  return <div ref={hostRef} className={cn('cp-relgraph', className)} {...rest} />;
}
