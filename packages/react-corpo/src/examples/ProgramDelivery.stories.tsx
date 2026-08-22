import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { Avatar } from '../components/Avatar';
import { BarChart } from '../components/BarChart';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { DependencyGraph } from '../components/DependencyGraph';
import type { DepGraphNode } from '../components/DependencyGraph';
import { ProfileCard } from '../components/ProfileCard';
import { SectionHeader } from '../components/SectionHeader';
import { Stepper } from '../components/Stepper';
import { StatusPill } from '../components/StatusPill';
import { Timeline } from '../components/Timeline';

const meta = {
  title: 'Examples/Program delivery console',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

const INITIAL_NODES: DepGraphNode[] = [
  { id: 'vendor-eval', label: 'Vendor evaluation', state: 'done', owner: 'Priya N.', estimate: '3 wk', desc: 'Shortlist and score replacement billing providers.' },
  { id: 'data-audit', label: 'Data audit', state: 'done', owner: 'Marcus T.', estimate: '2 wk' },
  { id: 'contract', label: 'Contract signed', state: 'done', dependsOn: ['vendor-eval'], owner: 'Priya N.', estimate: '1 wk' },
  { id: 'schema-mapping', label: 'Schema mapping', state: 'in-progress', dependsOn: ['data-audit'], owner: 'Ana S.', estimate: '4 wk', desc: 'Field-level mapping from the legacy ledger to the new provider model.' },
  { id: 'invoice-cutover', label: 'Invoice cutover plan', state: 'ready', dependsOn: ['contract'], owner: 'Marcus T.', estimate: '2 wk' },
  { id: 'pilot-migration', label: 'Pilot migration', state: 'blocked', dependsOn: ['schema-mapping', 'invoice-cutover'], owner: 'Ana S.', estimate: '3 wk' },
  { id: 'reporting-rebuild', label: 'Reporting rebuild', state: 'blocked', dependsOn: ['schema-mapping'], owner: 'Devon K.', estimate: '6 wk' },
  { id: 'full-rollout', label: 'Full rollout', state: 'blocked', dependsOn: ['pilot-migration', 'reporting-rebuild'], owner: 'Priya N.', estimate: '4 wk' },
];

const OWNERS = {
  'Priya N.': { initials: 'PN', role: 'Program manager', team: 'Platform PMO', skills: ['Vendor management', 'Rollout planning'] },
  'Marcus T.': { initials: 'MT', role: 'Data engineer', team: 'Billing platform', skills: ['ETL', 'Reconciliation'] },
  'Ana S.': { initials: 'AS', role: 'Staff engineer', team: 'Payments platform', skills: ['Kotlin', 'Postgres', 'Payments'] },
  'Devon K.': { initials: 'DK', role: 'Analytics engineer', team: 'Business intelligence', skills: ['dbt', 'Reporting'] },
} satisfies Record<string, { initials: string; role: string; team: string; skills: string[] }>;

const ownerFor = (name: string) =>
  // SAFETY: guarded by the `in` check against the literal-keyed map.
  name in OWNERS ? OWNERS[name as keyof typeof OWNERS] : null;

const ACTIVITY = [
  { title: 'Schema mapping at 60%', timestamp: 'Aug 20, 4:12 PM', description: 'Ledger accounts mapped; export feeds remain.', tone: 'warn' as const },
  { title: 'Contract signed', timestamp: 'Aug 14, 11:02 AM', description: 'Three-year term with the new provider.', tone: 'ok' as const },
  { title: 'Data audit complete', timestamp: 'Aug 8, 3:40 PM', tone: 'ok' as const },
];

const PHASES = [
  { label: 'Plan' },
  { label: 'Build' },
  { label: 'Pilot' },
  { label: 'Rollout' },
];

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
          brand="Halcyon PMO"
          sections={[
            {
              title: 'Programs',
              items: [
                { id: 'billing', label: 'Billing migration' },
                { id: 'datacenter', label: 'Data center exit' },
                { id: 'sso', label: 'SSO consolidation' },
              ],
            },
            { title: 'Workspace', items: [{ id: 'people', label: 'People' }, { id: 'reports', label: 'Reports' }] },
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
              <StatusPill tone="warn">Phase 2 of 4</StatusPill>
              <Button size="sm">Export status report</Button>
              <Avatar size="sm" initials="PN" />
            </>
          }
        />
        <AppShell.Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Stepper items={PHASES} current={phaseFor(nodes)} />
            <div>
              <SectionHeader
                title="Milestone plan"
                description="Click a milestone to see its owner; click a ready or in-progress milestone again to advance it."
              />
              <div style={{ height: 360, border: '1px solid var(--corpo-border-dim)', borderRadius: 'var(--corpo-radius-lg)', overflow: 'hidden' }}>
                <DependencyGraph
                  nodes={nodes}
                  onSelect={(id) => setSelectedId(id)}
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
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch' }}>
              <div style={{ flex: '3 1 320px', minWidth: 0, height: 300 }}>
                <BarChart
                  stacked
                  labels={['Q1', 'Q2', 'Q3', 'Q4']}
                  series={[
                    { label: 'Migration work', data: [12, 18, 26, 20] },
                    { label: 'Run the business', data: [30, 26, 20, 24] },
                    { label: 'Support', data: [8, 8, 8, 8] },
                  ]}
                  yFormat={(v) => `${v} eng-wk`}
                />
              </div>
              <div style={{ flex: '2 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selected && owner ? (
                  <ProfileCard compact>
                    <ProfileCard.Portrait>
                      <Avatar size="lg" initials={owner.initials} status="online" />
                      <StatusPill tone={selected.state === 'done' ? 'ok' : selected.state === 'blocked' ? 'idle' : 'warn'}>
                        {selected.label}
                      </StatusPill>
                    </ProfileCard.Portrait>
                    <ProfileCard.Identity name={selected.owner} role={owner.role} team={owner.team} />
                    <ProfileCard.Skills>
                      {owner.skills.map((s) => <Chip key={s}>{s}</Chip>)}
                    </ProfileCard.Skills>
                  </ProfileCard>
                ) : (
                  <SectionHeader title="No milestone selected" description="Click a node in the plan above." />
                )}
                <div>
                  <SectionHeader title="Recent activity" />
                  <Timeline items={ACTIVITY} />
                </div>
              </div>
            </div>
          </div>
        </AppShell.Content>
      </AppShell.Main>
    </AppShell>
  );
}

/** The operations trio in a real screen — Stepper phase, the interactive DependencyGraph driving a ProfileCard owner panel, stacked capacity bars, and a Timeline feed. */
export const Default: StoryObj = {
  render: () => <ProgramDeliveryExample />,
};
