import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';
import { SideNav } from './SideNav';
import { Topbar } from './Topbar';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Stat } from './Stat';

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
      { id: 'invoices', label: 'Invoices', badge: <Badge color="amber">3</Badge> },
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
              <Button size="sm" variant="primary">New invoice</Button>
              <Avatar size="sm" initials="AS" />
            </>
          }
        />
        <AppShell.Content>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Stat label="Outstanding" value="$12,480" delta="+3 overdue" deltaTone="down" />
            <Stat label="Paid this month" value="$48,120" delta="+4.2%" deltaTone="up" />
            <Stat label="Average days to pay" value="21" />
          </div>
        </AppShell.Content>
      </AppShell.Main>
    </AppShell>
  );
}

/** Resize below 768px to see the off-canvas sidebar — the topbar toggle opens it, the scrim or an item click closes it. */
export const Default: Story = {
  render: () => <ShellDemo />,
};
