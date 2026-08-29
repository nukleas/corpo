import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RelationGraph } from './RelationGraph';
import type { RelGraphEdge, RelGraphNode } from './RelationGraph';

const meta = {
  title: 'Operations/RelationGraph',
  component: RelationGraph,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RelationGraph>;
export default meta;
type Story = StoryObj<typeof meta>;

// Deterministic PRNG so stories render identically on every load.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KINDS = ['service', 'database', 'queue', 'external'] as const;

/** Clustered service topology: hub-and-spoke clusters with sparse cross-links. */
function makeGraph(clusterCount: number, size: number, seed = 7) {
  const rand = mulberry32(seed);
  const nodes: RelGraphNode[] = [];
  const edges: RelGraphEdge[] = [];
  const GA = Math.PI * (3 - Math.sqrt(5));
  const clusterR = 26 * Math.sqrt(size);

  for (let c = 0; c < clusterCount; c++) {
    const cd = clusterR * 2.6 * Math.sqrt(c + 0.5);
    const cx = Math.cos(c * GA) * cd;
    const cy = Math.sin(c * GA) * cd;
    const hub = `c${c}-hub`;
    nodes.push({ id: hub, label: `gateway-${c}`, kind: 'service', x: cx, y: cy, r: 7 });
    for (let i = 1; i < size; i++) {
      const id = `c${c}-n${i}`;
      const d = 14 * Math.sqrt(i + 0.5);
      nodes.push({
        id,
        label: `${KINDS[i % KINDS.length]}-${c}-${i}`,
        kind: KINDS[i % KINDS.length],
        x: cx + Math.cos(i * GA) * d,
        y: cy + Math.sin(i * GA) * d,
      });
      // spoke to the hub, plus occasional intra-cluster short link
      edges.push({ source: hub, target: id });
      if (i > 1 && rand() < 0.35) edges.push({ source: `c${c}-n${1 + Math.floor(rand() * (i - 1))}`, target: id });
    }
    if (c > 0) edges.push({ source: `c${Math.floor(rand() * c)}-hub`, target: hub });
  }
  return { nodes, edges };
}

export const ServiceMap: Story = {
  args: { ...makeGraph(6, 20), style: { height: 480 } },
};

/** 5,000 nodes / ~7,600 edges — pan, zoom, and hover stay interactive; labels surface as you zoom in. */
export const LargeGraph: Story = {
  args: { ...makeGraph(40, 125), style: { height: 560 } },
};

/** Selection is reported via `onSelect` and can be synced back through `selectedId`. */
export const ControlledSelection: Story = {
  args: { nodes: [], edges: [] },
  render: () => {
    const graph = makeGraph(6, 20);
    const [selected, setSelected] = useState<string | null>('c0-hub');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="corpo-label">Selected: {selected ?? 'none'}</span>
        <RelationGraph
          {...graph}
          selectedId={selected}
          onSelect={(id) => setSelected(id)}
          style={{ height: 440 }}
        />
      </div>
    );
  },
};
