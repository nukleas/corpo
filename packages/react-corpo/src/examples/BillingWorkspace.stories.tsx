import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { DescriptionList } from '../components/DescriptionList';
import { DonutChart } from '../components/DonutChart';
import { LineChart } from '../components/LineChart';
import { SectionHeader } from '../components/SectionHeader';
import { Sheet } from '../components/Sheet';
import { Sparkline } from '../components/Sparkline';
import { Stat } from '../components/Stat';
import { Table } from '../components/Table';
import { Timeline } from '../components/Timeline';

const meta = {
  title: 'Examples/Billing workspace',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

const money = (v: number) => `$${v.toLocaleString('en-US')}`;

interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  tone: 'ok' | 'warn' | 'err';
  issued: string;
  due: string;
  terms: string;
  history: { title: string; timestamp: string; description?: string; tone?: 'ok' | 'warn' | 'err' | 'idle' }[];
}

const INVOICES: Invoice[] = [
  {
    id: 'INV-2041', client: 'Acme Inc.', amount: '$4,200.00', status: 'Paid', tone: 'ok',
    issued: 'Aug 4, 2026', due: 'Sep 3, 2026', terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Aug 4, 9:14 AM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Aug 4, 9:16 AM', description: 'Sent to billing@acme.com', tone: 'ok' },
      { title: 'Payment received', timestamp: 'Aug 15, 10:41 AM', description: '$4,200.00 posted to the ledger', tone: 'ok' },
    ],
  },
  {
    id: 'INV-2042', client: 'Northwind', amount: '$1,180.00', status: 'Pending', tone: 'warn',
    issued: 'Aug 12, 2026', due: 'Sep 11, 2026', terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Aug 12, 2:03 PM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Aug 12, 2:05 PM', tone: 'ok' },
    ],
  },
  {
    id: 'INV-2043', client: 'Globex', amount: '$860.00', status: 'Overdue', tone: 'err',
    issued: 'Jul 2, 2026', due: 'Aug 1, 2026', terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Jul 2, 11:20 AM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Jul 2, 11:22 AM', tone: 'ok' },
      { title: 'Reminder sent', timestamp: 'Aug 5, 8:00 AM', description: 'Second notice to accounts@globex.com', tone: 'warn' },
      { title: 'Payment overdue', timestamp: 'Aug 15, 12:00 AM', description: '14 days past due', tone: 'err' },
    ],
  },
];

const SECTIONS = [
  { items: [{ id: 'overview', label: 'Overview' }] },
  {
    title: 'Billing',
    items: [
      { id: 'invoices', label: 'Invoices', badge: <Badge color="amber">3</Badge> },
      { id: 'payments', label: 'Payments' },
      { id: 'reports', label: 'Reports' },
    ],
  },
];

function BillingWorkspaceExample() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeId, setActiveId] = useState('invoices');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = INVOICES.find((inv) => inv.id === selectedId) ?? null;

  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          brand="Halcyon Group"
          sections={SECTIONS}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setNavOpen(false); }}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="sm" initials="AS" status="online" />
              <span style={{ fontSize: 'var(--corpo-text-sm)' }}>Ana Sørensen</span>
            </div>
          }
        />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Topbar
          title="Invoices"
          onNavToggle={() => setNavOpen(true)}
          actions={
            <>
              <Button size="sm" variant="primary">New invoice</Button>
              <Avatar size="sm" initials="AS" />
            </>
          }
        />
        <AppShell.Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
              <Stat label="Outstanding" value="$12,480" delta="3 overdue" deltaTone="down" />
              <Stat label="Collected this month" value="$48,120" delta="+4.2%" deltaTone="up" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stat label="Weekly active seats" value="1,284" />
                <Sparkline data={[1180, 1195, 1170, 1224, 1231, 1219, 1256, 1284]} />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: '3 1 320px', minWidth: 0, height: 280 }}>
                <LineChart
                  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']}
                  series={[
                    { label: 'Revenue', data: [128000, 132500, 141200, 138900, 149800, 155200, 161700, 168400] },
                    { label: 'Operating cost', data: [94000, 96200, 99800, 103500, 104100, 108900, 110300, 114600] },
                  ]}
                  yFormat={money}
                />
              </div>
              <div style={{ flex: '2 1 260px', minWidth: 0, height: 280 }}>
                <DonutChart
                  data={[
                    { label: 'Payroll', value: 182000 },
                    { label: 'Cloud infrastructure', value: 64500 },
                    { label: 'Licenses', value: 28900 },
                    { label: 'Facilities', value: 21300 },
                    { label: 'Other', value: 9800 },
                  ]}
                  format={money}
                  centerLabel="Monthly spend"
                />
              </div>
            </div>
            <div>
              <SectionHeader title="Open invoices" description="Click an invoice to see its detail and history." />
              <Table
                columns={[
                  { key: 'id', label: 'Invoice', mono: true },
                  { key: 'client', label: 'Client' },
                  { key: 'amount', label: 'Amount', numeric: true },
                  { key: 'status', label: 'Status' },
                ]}
                rows={INVOICES.map((inv) => ({
                  id: {
                    content: (
                      <button
                        type="button"
                        onClick={() => setSelectedId(inv.id)}
                        style={{ all: 'unset', cursor: 'pointer', color: 'var(--corpo-accent)', fontFamily: 'var(--corpo-font-mono)', fontSize: 'var(--corpo-text-xs)' }}
                      >
                        {inv.id}
                      </button>
                    ),
                  },
                  client: inv.client,
                  amount: inv.amount,
                  status: { content: inv.status, status: inv.tone },
                }))}
              />
            </div>
          </div>
        </AppShell.Content>
      </AppShell.Main>
      <Sheet
        open={selected != null}
        onClose={() => setSelectedId(null)}
        title={selected?.id}
        footer={
          <>
            <Button size="sm" onClick={() => setSelectedId(null)}>Close</Button>
            <Button size="sm" variant="primary">Send reminder</Button>
          </>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <DescriptionList
              compact
              items={[
                { label: 'Client', value: selected.client },
                { label: 'Amount', value: selected.amount },
                { label: 'Status', value: selected.status },
                { label: 'Issued', value: selected.issued },
                { label: 'Due', value: selected.due },
                { label: 'Payment terms', value: selected.terms },
              ]}
            />
            <div>
              <SectionHeader title="History" />
              <Timeline items={selected.history} />
            </div>
          </div>
        )}
      </Sheet>
    </AppShell>
  );
}

/** A full billing app screen — AppShell + SideNav + Topbar hosting stats with sparklines, the line and donut charts, a shorthand-cell invoice table, and a Sheet detail with DescriptionList + Timeline. */
export const Default: StoryObj = {
  render: () => <BillingWorkspaceExample />,
};
