import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { Amount } from '../components/Amount';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { CardGrid } from '../components/CardGrid';
import { DataTable, sumColumn, type DataTableColumn } from '../components/DataTable';
import { DescriptionList } from '../components/DescriptionList';
import { LineChart } from '../components/LineChart';
import { Section } from '../components/Section';
import { Sheet } from '../components/Sheet';
import { Stat } from '../components/Stat';
import { Timeline } from '../components/Timeline';
import { Brand } from '../components/Brand';

const meta = {
  title: 'Examples/Billing workspace',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', corpoFlush: true },
} satisfies Meta;
export default meta;

const money = (v: number) => `$${v.toLocaleString('en-US')}`;

interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  tone: 'ok' | 'warn' | 'err';
  issued: string;
  due: string;
  terms: string;
  history: { title: string; timestamp: string; description?: string; tone?: 'ok' | 'warn' | 'err' | 'idle' }[];
}

const INVOICES: Invoice[] = [
  {
    id: 'INV-2041',
    client: 'Acme Inc.',
    amount: 4200,
    status: 'Paid',
    tone: 'ok',
    issued: 'Aug 4, 2026',
    due: 'Sep 3, 2026',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Aug 4, 9:14 AM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Aug 4, 9:16 AM', description: 'Sent to billing@acme.com', tone: 'ok' },
      {
        title: 'Payment received',
        timestamp: 'Aug 15, 10:41 AM',
        description: '$4,200.00 posted to the ledger',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'INV-2042',
    client: 'Northwind',
    amount: 1180,
    status: 'Pending',
    tone: 'warn',
    issued: 'Aug 12, 2026',
    due: 'Sep 11, 2026',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Aug 12, 2:03 PM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Aug 12, 2:05 PM', tone: 'ok' },
    ],
  },
  {
    id: 'INV-2043',
    client: 'Globex',
    amount: 860,
    status: 'Overdue',
    tone: 'err',
    issued: 'Jul 2, 2026',
    due: 'Aug 1, 2026',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Jul 2, 11:20 AM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Jul 2, 11:22 AM', tone: 'ok' },
      {
        title: 'Reminder sent',
        timestamp: 'Aug 5, 8:00 AM',
        description: 'Second notice to accounts@globex.com',
        tone: 'warn',
      },
      { title: 'Payment overdue', timestamp: 'Aug 15, 12:00 AM', description: '14 days past due', tone: 'err' },
    ],
  },
];

const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true, summary: (rows) => `${rows.length} invoices` },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'issued', label: 'Issued' },
  { key: 'due', label: 'Due' },
  {
    key: 'amount',
    label: 'Amount (USD)',
    numeric: true,
    sortable: true,
    summary: (rows) => ({ content: <Amount value={sumColumn(rows, 'amount')} /> }),
  },
  { key: 'status', label: 'Status', sortable: true },
];

const SECTIONS = [
  { items: [{ id: 'overview', label: 'Overview' }] },
  {
    title: 'Billing',
    items: [
      { id: 'invoices', label: 'Invoices' },
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
          brand={<Brand name="Halcyon Group" />}
          sections={SECTIONS}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setNavOpen(false);
          }}
        />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Topbar
          title={activeId === 'overview' ? 'Overview' : 'Invoices'}
          onNavToggle={() => setNavOpen(true)}
          actions={
            <>
              {activeId === 'invoices' && (
                <Button size="sm" variant="primary">
                  New invoice
                </Button>
              )}
              <Avatar size="sm" initials="AS" />
            </>
          }
        />
        <AppShell.Content>
          {activeId === 'overview' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <CardGrid columns={2}>
                <Stat label="Outstanding" value="$2,040" delta="1 overdue" deltaTone="down" />
                <Stat label="Collected this month" value="$48,120" delta="+4.2%" deltaTone="up" />
              </CardGrid>
              <div style={{ height: 280 }}>
                <LineChart
                  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']}
                  series={[
                    { label: 'Invoiced', data: [128000, 132500, 141200, 138900, 149800, 155200, 161700, 168400] },
                    { label: 'Collected', data: [121000, 129800, 133100, 137400, 141900, 150300, 154800, 160200] },
                  ]}
                  yFormat={money}
                />
              </div>
            </div>
          ) : (
            <DataTable
              compact
              searchable
              columns={COLUMNS}
              rows={INVOICES.map((inv) => ({
                id: inv.id,
                cells: {
                  id: {
                    content: (
                      <button type="button" className="cp-table__link" onClick={() => setSelectedId(inv.id)}>
                        {inv.id}
                      </button>
                    ),
                  },
                  client: inv.client,
                  issued: inv.issued,
                  due: inv.due,
                  amount: { content: <Amount value={inv.amount} /> },
                  status: { content: inv.status, status: inv.tone },
                },
                values: { id: inv.id, amount: inv.amount, status: inv.status },
              }))}
            />
          )}
        </AppShell.Content>
      </AppShell.Main>
      <Sheet
        open={selected != null}
        onClose={() => setSelectedId(null)}
        title={selected?.id}
        footer={
          <>
            <Button size="sm" onClick={() => setSelectedId(null)}>
              Close
            </Button>
            {selected?.status === 'Overdue' && (
              <Button size="sm" variant="primary">
                Send reminder
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DescriptionList
              compact
              items={[
                { label: 'Client', value: selected.client },
                { label: 'Amount (USD)', value: <Amount value={selected.amount} /> },
                { label: 'Status', value: selected.status },
                { label: 'Issued', value: selected.issued },
                { label: 'Due', value: selected.due },
                { label: 'Payment terms', value: selected.terms },
              ]}
            />
            <Section title="History" level={3}>
              <Timeline items={selected.history} />
            </Section>
          </div>
        )}
      </Sheet>
    </AppShell>
  );
}

/** A billing app: a compact invoice DataTable with a totals row that opens a Sheet (DescriptionList + Timeline), and an Overview dashboard, the one page that carries Stat tiles and a chart. */
export const Default: StoryObj = {
  render: () => <BillingWorkspaceExample />,
};
