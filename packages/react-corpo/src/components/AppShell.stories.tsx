import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { Topbar } from './Topbar';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Amount } from './Amount';
import { Button } from './Button';
import { Table } from './Table';

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

const SECTIONS = [
  {
    items: [{ id: 'overview', label: 'Overview' }],
  },
  {
    title: 'Billing',
    items: [
      { id: 'invoices', label: 'Invoices', badge: <Badge color="amber">4</Badge> },
      { id: 'payments', label: 'Payments' },
      { id: 'reports', label: 'Reports' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { id: 'people', label: 'People' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];

function ShellDemo() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeId, setActiveId] = useState('invoices');
  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          aria-label="Sections"
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
          <Table
            grid
            striped
            columns={[
              { key: 'id', label: 'Invoice', mono: true },
              { key: 'client', label: 'Client' },
              { key: 'due', label: 'Due', mono: true },
              { key: 'total', label: 'Total', numeric: true },
              { key: 'status', label: 'Status' },
            ]}
            rows={[
              {
                id: 'INV-1048',
                client: 'Ostara Foods',
                due: '2026-10-12',
                total: { content: <Amount value={1180} />, numeric: true },
                status: { content: 'Pending', status: 'warn' },
              },
              {
                id: 'INV-1039',
                client: 'Keel Marine Supply',
                due: '2026-08-01',
                total: { content: <Amount value={860} />, numeric: true },
                status: { content: 'Overdue', status: 'err' },
              },
              {
                id: 'INV-1051',
                client: 'Sable Clinic Group',
                due: '2026-10-18',
                total: { content: <Amount value={2460} />, numeric: true },
                status: { content: 'Pending', status: 'warn' },
              },
              {
                id: 'INV-1054',
                client: 'Veld Instruments',
                due: '2026-09-19',
                total: { content: <Amount value={3150} />, numeric: true },
                status: { content: 'Overdue', status: 'err' },
              },
            ]}
          />
        </AppShell.Content>
        <BottomNav
          aria-label="Primary"
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setNavOpen(false);
          }}
          items={[
            { id: 'overview', label: 'Overview', icon: <span aria-hidden="true" /> },
            { id: 'invoices', label: 'Invoices', icon: <span aria-hidden="true" /> },
            { id: 'payments', label: 'Payments', icon: <span aria-hidden="true" /> },
            { id: 'reports', label: 'Reports', icon: <span aria-hidden="true" /> },
          ]}
        />
      </AppShell.Main>
    </AppShell>
  );
}

/** Resize below 768px: the sidebar becomes a drawer, and the bottom nav is the phone bar. */
export const Default: Story = {
  render: () => <ShellDemo />,
};
