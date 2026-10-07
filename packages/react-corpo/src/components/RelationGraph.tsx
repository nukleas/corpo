import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { CpRelGraph } from '@nukleas/corpo/relgraph';
import type { RelGraphApi, RelGraphEdge, RelGraphKind, RelGraphLayout, RelGraphNode } from '@nukleas/corpo/relgraph';
import { cn } from '../lib/cn';
import { useTheme } from '../theme/ThemeProvider';

export type { RelGraphNode, RelGraphEdge, RelGraphKind, RelGraphLayout } from '@nukleas/corpo/relgraph';

export interface RelationGraphProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
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
  /** Controlled selection sync; the graph also selects internally on click. */
  selectedId?: string | null;
  onSelect?: (id: string | null, node: RelGraphNode | null) => void;
  onHover?: (id: string | null) => void;
  /** Fired when a layout finishes (force: when the simulation cools). */
  onLayoutEnd?: (layout: RelGraphLayout) => void;
}

/**
 * Large interactive relationship graph — canvas-rendered, pan/zoom, hover
 * tooltips, click-to-select with neighborhood highlighting, level-of-detail
 * labels. Wraps the vanilla `CpRelGraph` scene engine; targets ~10k nodes.
 * Nodes without `x`/`y` are auto-placed on a spiral.
 */
export function RelationGraph({
  nodes,
  edges,
  kinds,
  layout = 'preset',
  selectedId,
  onSelect,
  onHover,
  onLayoutEnd,
  className = '',
  ...rest
}: RelationGraphProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<RelGraphApi | null>(null);
  const handlers = useRef({ onSelect, onHover, onLayoutEnd });
  handlers.current = { onSelect, onHover, onLayoutEnd };
  const mounted = useRef(false);
  const theme = useTheme();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const api = CpRelGraph(host, {
      nodes,
      edges,
      kinds,
      layout,
      onSelect: (id, node) => handlers.current.onSelect?.(id, node),
      onHover: (id) => handlers.current.onHover?.(id),
      onLayoutEnd: (name) => handlers.current.onLayoutEnd?.(name),
    });
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
    // The engine is created once; model updates flow through replaceModel below.
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
    if (!api || selectedId === undefined) return;
    if (api.getSelection() !== selectedId) api.select(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (mounted.current) apiRef.current?.runLayout(layout);
  }, [layout]);

  // Canvas colors are resolved token values, not live var() references.
  useEffect(() => {
    if (mounted.current) apiRef.current?.refreshTheme();
  }, [theme]);

  return <div ref={hostRef} className={cn('cp-relgraph', className)} {...rest} />;
}
