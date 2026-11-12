import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Amount } from '../components/Amount';
import { AppShell } from '../components/AppShell';
import { Avatar } from '../components/Avatar';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/Button';
import { DataTable, sumColumn, type DataTableColumn } from '../components/DataTable';
import { SideNav } from '../components/SideNav';
import { Topbar } from '../components/Topbar';
import { Brand } from '../components/Brand';

const meta = {
  title: 'Examples/Responsive app shell',
  parameters: { layout: 'fullscreen', corpoFlush: true },
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const icon = (d: string) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden="true"
  >
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PRIMARY = [
  { id: 'overview', label: 'Overview', icon: icon('M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z') },
  { id: 'invoices', label: 'Invoices', icon: icon('M6 3h12v18H6zM9 8h6M9 12h6M9 16h4') },
  { id: 'orders', label: 'Orders', icon: icon('M4 6h16M4 12h16M4 18h10') },
  { id: 'reports', label: 'Reports', icon: icon('M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6') },
];

const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true, summary: (rows) => `${rows.length} invoices` },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'due', label: 'Due', sortable: true },
  {
    key: 'amount',
    label: 'Amount (USD)',
    numeric: true,
    sortable: true,
    summary: (rows) => ({ content: <Amount value={sumColumn(rows, 'amount')} /> }),
  },
  { key: 'status', label: 'Status', sortable: true },
];

const INVOICES = [
  { id: 'INV-2041', client: 'Acme Inc.', due: 'Sep 3, 2026', amount: 4200, status: 'Paid', tone: 'ok' },
  { id: 'INV-2042', client: 'Northwind Traders', due: 'Sep 11, 2026', amount: 1180, status: 'Open', tone: 'idle' },
  { id: 'INV-2043', client: 'Globex', due: 'Aug 1, 2026', amount: 860, status: 'Overdue', tone: 'err' },
  { id: 'INV-2044', client: 'Initech', due: 'Sep 18, 2026', amount: 2315.5, status: 'Open', tone: 'idle' },
] as const;

/**
 * The reference shell for an app: a top bar on every width, a sidebar on
 * desktop, and — below 768px — a bottom nav for primary destinations plus an
 * off-canvas drawer for the rest. Give the shell a viewport height so the
 * drawer, the content scroller, and the bottom nav share one screen.
 * Resize this story: 390 phone, 768 drawer, 1024 desktop.
 */
export const Pattern: Story = {
  render: function Pattern() {
    const [navOpen, setNavOpen] = useState(false);
    const [active, setActive] = useState('invoices');
    const choose = (id: string) => {
      setActive(id);
      setNavOpen(false);
    };
    return (
      <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
        <AppShell.Sidebar>
          <SideNav
            aria-label="Sections"
            brand={<Brand name="Halcyon Group" />}
            activeId={active}
            onSelect={choose}
            sections={[
              { items: [{ id: 'overview', label: 'Overview' }] },
              {
                title: 'Billing',
                items: [
                  { id: 'invoices', label: 'Invoices' },
                  { id: 'payments', label: 'Payments' },
                  { id: 'orders', label: 'Sales orders' },
                ],
              },
              {
                title: 'Workspace',
                items: [
                  { id: 'customers', label: 'Customers' },
                  { id: 'reports', label: 'Reports' },
                  { id: 'settings', label: 'Settings' },
                ],
              },
            ]}
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
            <DataTable
              compact
              columns={COLUMNS}
              rows={INVOICES.map((inv) => ({
                id: inv.id,
                cells: {
                  id: inv.id,
                  client: inv.client,
                  due: inv.due,
                  amount: { content: <Amount value={inv.amount} /> },
                  status: { content: inv.status, status: inv.tone },
                },
                values: { amount: inv.amount },
              }))}
            />
          </AppShell.Content>
          <BottomNav aria-label="Primary" items={PRIMARY} activeId={active} onSelect={choose} />
        </AppShell.Main>
      </AppShell>
    );
  },
};
