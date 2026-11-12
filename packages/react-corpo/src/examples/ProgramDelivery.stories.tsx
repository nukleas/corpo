import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { DependencyGraph } from '../components/DependencyGraph';
import type { DepGraphNode } from '../components/DependencyGraph';
import { DescriptionList } from '../components/DescriptionList';
import { Empty } from '../components/Empty';
import { Section } from '../components/Section';
import { Stepper } from '../components/Stepper';
import { StatusPill } from '../components/StatusPill';
import { Timeline } from '../components/Timeline';
import { Brand } from '../components/Brand';

const meta = {
  title: 'Examples/Program delivery console',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', corpoFlush: true },
} satisfies Meta;
export default meta;

const INITIAL_NODES: DepGraphNode[] = [
  {
    id: 'vendor-eval',
    label: 'Vendor evaluation',
    state: 'done',
    owner: 'Priya N.',
    estimate: '3 wk',
    desc: 'Shortlist and score replacement billing providers.',
  },
  { id: 'data-audit', label: 'Data audit', state: 'done', owner: 'Marcus T.', estimate: '2 wk' },
  {
    id: 'contract',
    label: 'Contract signed',
    state: 'done',
    dependsOn: ['vendor-eval'],
    owner: 'Priya N.',
    estimate: '1 wk',
  },
  {
    id: 'schema-mapping',
    label: 'Schema mapping',
    state: 'in-progress',
    dependsOn: ['data-audit'],
    owner: 'Ana S.',
    estimate: '4 wk',
    desc: 'Field-level mapping from the legacy ledger to the new provider model.',
  },
  {
    id: 'invoice-cutover',
    label: 'Invoice cutover plan',
    state: 'ready',
    dependsOn: ['contract'],
    owner: 'Marcus T.',
    estimate: '2 wk',
  },
  {
    id: 'pilot-migration',
    label: 'Pilot migration',
    state: 'blocked',
    dependsOn: ['schema-mapping', 'invoice-cutover'],
    owner: 'Ana S.',
    estimate: '3 wk',
  },
  {
    id: 'reporting-rebuild',
    label: 'Reporting rebuild',
    state: 'blocked',
    dependsOn: ['schema-mapping'],
    owner: 'Devon K.',
    estimate: '6 wk',
  },
  {
    id: 'full-rollout',
    label: 'Full rollout',
    state: 'blocked',
    dependsOn: ['pilot-migration', 'reporting-rebuild'],
    owner: 'Priya N.',
    estimate: '4 wk',
  },
];

const OWNERS = {
  'Priya N.': { role: 'Program manager', team: 'Platform PMO' },
  'Marcus T.': { role: 'Data engineer', team: 'Billing platform' },
  'Ana S.': { role: 'Staff engineer', team: 'Payments platform' },
  'Devon K.': { role: 'Analytics engineer', team: 'Business intelligence' },
} satisfies Record<string, { role: string; team: string }>;

const STATE = {
  done: { label: 'Done', tone: 'ok' },
  'in-progress': { label: 'In progress', tone: 'info' },
  ready: { label: 'Ready', tone: 'warn' },
  blocked: { label: 'Blocked', tone: 'idle' },
} as const;

const ownerFor = (name: string) =>
  // SAFETY: guarded by the `in` check against the literal-keyed map.
  name in OWNERS ? OWNERS[name as keyof typeof OWNERS] : null;

const ACTIVITY = [
  {
    title: 'Schema mapping at 60%',
    timestamp: 'Aug 20, 4:12 PM',
    description: 'Ledger accounts mapped; export feeds remain.',
    tone: 'warn' as const,
  },
  {
    title: 'Contract signed',
    timestamp: 'Aug 14, 11:02 AM',
    description: 'Three-year term with the new provider.',
    tone: 'ok' as const,
  },
  { title: 'Data audit complete', timestamp: 'Aug 8, 3:40 PM', tone: 'ok' as const },
];

const PHASES = [{ label: 'Plan' }, { label: 'Build' }, { label: 'Pilot' }, { label: 'Rollout' }];

function phaseFor(nodes: DepGraphNode[]): number {
  if (nodes.find((n) => n.id === 'full-rollout')?.state !== 'blocked') return 3;
  if (nodes.find((n) => n.id === 'pilot-migration')?.state !== 'blocked') return 2;
  return 1;
}

function ProgramDeliveryExample() {
  const [navOpen, setNavOpen] = useState(false);
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [selectedId, setSelectedId] = useState<string | null>('schema-mapping');
  const selected = useMemo(() => nodes.find((n) => n.id === selectedId) ?? null, [nodes, selectedId]);
  const owner = selected?.owner ? ownerFor(selected.owner) : null;

  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          brand={<Brand name="Halcyon PMO" detail="Program delivery" />}
          sections={[
            {
              title: 'Programs',
              items: [
                { id: 'billing', label: 'Billing migration' },
                { id: 'datacenter', label: 'Data center exit' },
                { id: 'sso', label: 'SSO consolidation' },
              ],
            },
            {
              title: 'Workspace',
              items: [
                { id: 'people', label: 'People' },
                { id: 'reports', label: 'Reports' },
              ],
            },
          ]}
          activeId="billing"
          onSelect={() => setNavOpen(false)}
        />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Topbar
          title="Billing platform migration"
          onNavToggle={() => setNavOpen(true)}
          actions={
            <>
              <Button size="sm">Export status report</Button>
              <Avatar size="sm" initials="PN" />
            </>
          }
        />
        <AppShell.Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Stepper items={PHASES} current={phaseFor(nodes)} />
            <Section title="Milestones" description="Click a ready or in-progress milestone twice to advance it.">
              <div style={{ height: 360 }}>
                <DependencyGraph
                  nodes={nodes}
                  onSelect={(id) => setSelectedId(id)}
                  onAdvance={(id) => {
                    setNodes((prev) => {
                      const next = prev.map((n): DepGraphNode =>
                        n.id === id ? { ...n, state: n.state === 'ready' ? 'in-progress' : 'done' } : n,
                      );
                      return next.map((n) =>
                        n.state === 'blocked' &&
                        (n.dependsOn ?? []).every((d) => next.find((x) => x.id === d)?.state === 'done')
                          ? { ...n, state: 'ready' as const }
                          : n,
                      );
                    });
                  }}
                />
              </div>
            </Section>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <Section title={selected?.label ?? 'Milestone'}>
                  {selected ? (
                    <DescriptionList
                      compact
                      items={[
                        {
                          label: 'Status',
                          value: (
                            <StatusPill tone={STATE[selected.state ?? 'ready'].tone}>
                              {STATE[selected.state ?? 'ready'].label}
                            </StatusPill>
                          ),
                        },
                        { label: 'Owner', value: selected.owner ?? '–' },
                        { label: 'Role', value: owner ? `${owner.role}, ${owner.team}` : '–' },
                        { label: 'Estimate', value: selected.estimate ?? '–' },
                        {
                          label: 'Depends on',
                          value:
                            (selected.dependsOn ?? [])
                              .map((id) => nodes.find((n) => n.id === id)?.label)
                              .filter(Boolean)
                              .join(', ') || '–',
                        },
                      ]}
                    />
                  ) : (
                    <Empty title="No milestone selected" description="Click a milestone in the plan." />
                  )}
                </Section>
              </div>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <Section title="Recent activity">
                  <Timeline items={ACTIVITY} />
                </Section>
              </div>
            </div>
          </div>
        </AppShell.Content>
      </AppShell.Main>
    </AppShell>
  );
}

/** A program status screen: the phase Stepper, the interactive DependencyGraph driving the selected milestone's facts (DescriptionList), and a Timeline feed. */
export const Default: StoryObj = {
  render: () => <ProgramDeliveryExample />,
};
