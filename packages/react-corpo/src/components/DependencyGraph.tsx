import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { CpDepGraph } from '@nukleas/corpo/depgraph';
import type { DepGraphApi, DepGraphNode } from '@nukleas/corpo/depgraph';
import { cn } from '../lib/cn';

export type { DepGraphNode, DepGraphState } from '@nukleas/corpo/depgraph';

export interface DependencyGraphProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Graph model. Node state is owned by the host — pass updated nodes to re-render. */
  nodes: DepGraphNode[];
  /** Tier axis: left-to-right (default) or top-to-bottom. */
  direction?: 'ltr' | 'ttb';
  /** Controlled selection sync; the graph also selects internally on click. */
  selectedId?: string | null;
  /** Fired on node selection (null when cleared). */
  onSelect?: (id: string | null, node: DepGraphNode | null) => void;
  /** Advance request — fired when a `ready` or `in-progress` node is activated while selected. */
  onAdvance?: (id: string, node: DepGraphNode) => void;
  /** Fired on node hover (null on leave). */
  onHover?: (id: string | null) => void;
}

/**
 * Interactive milestone/initiative dependency graph — pan, zoom, dependency
 * tooltips, click-to-select, activate-to-advance. Wraps the vanilla
 * `CpDepGraph` scene engine.
 */
export function DependencyGraph({
  nodes,
  direction = 'ltr',
  selectedId,
  onSelect,
  onAdvance,
  onHover,
  className = '',
  ...rest
}: DependencyGraphProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<DepGraphApi | null>(null);
  const handlers = useRef({ onSelect, onAdvance, onHover });
  handlers.current = { onSelect, onAdvance, onHover };
  const mounted = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const api = CpDepGraph(host, {
      nodes,
      direction,
      onSelect: (id, node) => handlers.current.onSelect?.(id, node),
      onAdvance: (id, node) => handlers.current.onAdvance?.(id, node),
      onHover: (id) => handlers.current.onHover?.(id),
    });
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
    // The engine is created once; model updates flow through replaceModel below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    apiRef.current?.replaceModel({ nodes, direction });
  }, [nodes, direction]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || selectedId === undefined) return;
    if (api.getSelection() !== selectedId) api.select(selectedId);
  }, [selectedId]);

  return <div ref={hostRef} className={cn('cp-depgraph', className)} {...rest} />;
}
