import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DependencyGraph } from './DependencyGraph';
import type { DepGraphNode } from './DependencyGraph';

const meta = {
  title: 'Operations/DependencyGraph',
  component: DependencyGraph,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DependencyGraph>;
export default meta;
type Story = StoryObj<typeof meta>;

// Billing platform migration: phases are auto-computed as the longest
// dependency path from the roots.
const NODES: DepGraphNode[] = [
  { id: 'vendor-eval', label: 'Vendor evaluation', state: 'done', owner: 'Priya N.', estimate: '3 wk', desc: 'Shortlist and score replacement billing providers.' },
  { id: 'data-audit', label: 'Data audit', state: 'done', owner: 'Marcus T.', estimate: '2 wk', desc: 'Inventory every table and export feed the current provider owns.' },
  { id: 'contract', label: 'Contract signed', state: 'done', dependsOn: ['vendor-eval'], owner: 'Priya N.', estimate: '1 wk' },
  { id: 'schema-mapping', label: 'Schema mapping', state: 'in-progress', dependsOn: ['data-audit'], owner: 'Ana S.', estimate: '4 wk', desc: 'Field-level mapping from the legacy ledger to the new provider model.' },
  { id: 'invoice-cutover', label: 'Invoice cutover plan', state: 'ready', dependsOn: ['contract'], owner: 'Marcus T.', estimate: '2 wk' },
  { id: 'pilot-migration', label: 'Pilot migration', state: 'blocked', dependsOn: ['schema-mapping', 'invoice-cutover'], owner: 'Ana S.', estimate: '3 wk', desc: 'Migrate ten low-volume accounts end to end.' },
  { id: 'reporting-rebuild', label: 'Reporting rebuild', state: 'blocked', dependsOn: ['schema-mapping'], owner: 'Devon K.', estimate: '6 wk' },
  { id: 'full-rollout', label: 'Full rollout', state: 'blocked', dependsOn: ['pilot-migration', 'reporting-rebuild'], owner: 'Priya N.', estimate: '4 wk', desc: 'Cut all remaining accounts over and decommission the legacy provider.' },
];

export const MigrationPlan: Story = {
  args: { nodes: NODES, style: { height: 420 } },
};

export const TopToBottom: Story = {
  args: { nodes: NODES, direction: 'ttb', style: { height: 560 } },
};

/** Click a node to select it, then click it again (or press Enter) to advance it — ready → in progress → done. Blocked work becomes ready once every dependency is done. */
export const Interactive: Story = {
  args: { nodes: NODES },
  render: () => {
    const [nodes, setNodes] = useState(NODES);
    return (
      <DependencyGraph
        nodes={nodes}
        style={{ height: 420 }}
        onAdvance={(id) => {
          setNodes((prev) => {
            const next = prev.map((n): DepGraphNode =>
              n.id === id
                ? { ...n, state: n.state === 'ready' ? 'in-progress' : 'done' }
                : n,
            );
            return next.map((n) =>
              n.state === 'blocked'
                && (n.dependsOn ?? []).every((d) => next.find((x) => x.id === d)?.state === 'done')
                ? { ...n, state: 'ready' as const }
                : n,
            );
          });
        }}
      />
    );
  },
};
