import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Amount } from '../components/Amount';
import { DescriptionList } from '../components/DescriptionList';
import { SectionHeader } from '../components/SectionHeader';
import { Sheet } from '../components/Sheet';
import { Table } from '../components/Table';
import { Timeline } from '../components/Timeline';

const meta = {
  title: 'Examples/Billing workspace',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

const money = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Invoice {
  id: string;
  client: string;
  region: string;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  tone: 'ok' | 'warn' | 'err';
  issued: string;
  due: string;
  terms: string;
  history: { title: string; timestamp: string; description?: string; tone?: 'ok' | 'warn' | 'err' | 'idle' }[];
}

const INVOICES: Invoice[] = [
  {
    id: 'INV-1042',
    client: 'Calder & Bright',
    region: 'North America',
    total: 4200,
    status: 'Paid',
    tone: 'ok',
    issued: '2026-09-04',
    due: '2026-10-04',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Sep 4, 9:14 AM', tone: 'idle' },
      {
        title: 'Invoice sent',
        timestamp: 'Sep 4, 9:18 AM',
        description: 'Sent to accounts@calderbright.com',
        tone: 'ok',
      },
      {
        title: 'Payment received',
        timestamp: 'Oct 2, 10:41 AM',
        description: '4,200.00 posted to cash',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'INV-1048',
    client: 'Ostara Foods',
    region: 'EMEA',
    total: 1180,
    status: 'Pending',
    tone: 'warn',
    issued: '2026-09-12',
    due: '2026-10-12',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Sep 12, 2:03 PM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Sep 12, 2:06 PM', description: 'Sent to ap@ostarafoods.com', tone: 'ok' },
    ],
  },
  {
    id: 'INV-1039',
    client: 'Keel Marine Supply',
    region: 'APAC',
    total: 860,
    status: 'Overdue',
    tone: 'err',
    issued: '2026-07-02',
    due: '2026-08-01',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Jul 2, 11:20 AM', tone: 'idle' },
      {
        title: 'Invoice sent',
        timestamp: 'Jul 2, 11:22 AM',
        description: 'Sent to accounts@keelmarine.com',
        tone: 'ok',
      },
      { title: 'Reminder sent', timestamp: 'Aug 5, 8:00 AM', description: 'Second notice', tone: 'warn' },
      { title: 'Payment overdue', timestamp: 'Aug 15, 12:00 AM', description: '14 days past due', tone: 'err' },
    ],
  },
  {
    id: 'INV-1051',
    client: 'Sable Clinic Group',
    region: 'North America',
    total: 2460,
    status: 'Pending',
    tone: 'warn',
    issued: '2026-09-18',
    due: '2026-10-18',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Sep 18, 8:40 AM', tone: 'idle' },
      {
        title: 'Invoice sent',
        timestamp: 'Sep 18, 8:44 AM',
        description: 'Sent to billing@sableclinic.com',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'INV-1054',
    client: 'Veld Instruments',
    region: 'EMEA',
    total: 3150,
    status: 'Overdue',
    tone: 'err',
    issued: '2026-08-20',
    due: '2026-09-19',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Aug 20, 3:12 PM', tone: 'idle' },
      {
        title: 'Invoice sent',
        timestamp: 'Aug 20, 3:15 PM',
        description: 'Sent to finance@veldinstruments.com',
        tone: 'ok',
      },
      { title: 'Payment overdue', timestamp: 'Sep 20, 12:00 AM', description: '1 day past due', tone: 'err' },
    ],
  },
  {
    id: 'INV-1056',
    client: 'Pine Street Printers',
    region: 'North America',
    total: 640,
    status: 'Paid',
    tone: 'ok',
    issued: '2026-10-02',
    due: '2026-11-01',
    terms: 'Net 30',
    history: [
      { title: 'Invoice created', timestamp: 'Oct 2, 11:02 AM', tone: 'idle' },
      { title: 'Invoice sent', timestamp: 'Oct 2, 11:05 AM', description: 'Sent to ap@pinestreet.press', tone: 'ok' },
      {
        title: 'Payment received',
        timestamp: 'Oct 9, 4:22 PM',
        description: '640.00 posted to cash',
        tone: 'ok',
      },
    ],
  },
];

const openInvoices = INVOICES.filter((inv) => inv.status !== 'Paid');
const outstanding = openInvoices.reduce((sum, inv) => sum + inv.total, 0);

const SECTIONS = [
  { items: [{ id: 'overview', label: 'Overview' }] },
  {
    title: 'Billing',
    items: [
      { id: 'invoices', label: 'Invoices', badge: <Badge color="amber">{openInvoices.length}</Badge> },
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
          onSelect={(id) => {
            setActiveId(id);
            setNavOpen(false);
          }}
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
              <Button size="sm" variant="primary">
                New invoice
              </Button>
              <Avatar size="sm" initials="AS" />
            </>
          }
        />
        <AppShell.Content>
          <SectionHeader
            title="October 2026"
            description={`${openInvoices.length} open, ${money(outstanding)} outstanding. Select an invoice for its history.`}
          />
          <Table
            grid
            striped
            columns={[
              { key: 'id', label: 'Invoice', mono: true },
              { key: 'client', label: 'Client' },
              { key: 'region', label: 'Region' },
              { key: 'issued', label: 'Issued', mono: true },
              { key: 'due', label: 'Due', mono: true },
              { key: 'total', label: 'Total', numeric: true },
              { key: 'status', label: 'Status' },
            ]}
            rows={INVOICES.map((inv) => ({
              id: {
                content: (
                  <button
                    type="button"
                    onClick={() => setSelectedId(inv.id)}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      color: 'var(--corpo-accent)',
                      fontFamily: 'var(--corpo-font-mono)',
                      fontSize: 'var(--corpo-text-xs)',
                    }}
                  >
                    {inv.id}
                  </button>
                ),
              },
              client: inv.client,
              region: inv.region,
              issued: inv.issued,
              due: inv.due,
              total: { content: <Amount value={inv.total} />, numeric: true },
              status: { content: inv.status, status: inv.tone },
            }))}
          />
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
            {selected?.status !== 'Paid' && (
              <Button size="sm" variant="primary">
                Send reminder
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <DescriptionList
              compact
              items={[
                { label: 'Client', value: selected.client },
                { label: 'Amount', value: <Amount value={selected.total} currency="$" /> },
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

/** Invoice list first. The open balance in the header is the sum of the unpaid rows. A row opens a Sheet with DescriptionList and Timeline. */
export const Default: StoryObj = {
  render: () => <BillingWorkspaceExample />,
};
