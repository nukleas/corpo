import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../components/AppShell';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/Button';
import { CardGrid } from '../components/CardGrid';
import { Field } from '../components/Field';
import { FormGrid } from '../components/FormGrid';
import { Input } from '../components/Input';
import { NavigationMenu } from '../components/NavigationMenu';
import { SideNav } from '../components/SideNav';
import { Stat } from '../components/Stat';
import { StatusBar } from '../components/StatusBar';
import { Topbar } from '../components/Topbar';

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
            brand="Halcyon Group"
            activeId={active}
            onSelect={choose}
            sections={[
              { items: [{ id: 'overview', label: 'Overview' }] },
              {
                title: 'Billing',
                items: [
                  { id: 'invoices', label: 'Invoices', badge: <Badge color="amber">3</Badge> },
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
          >
            <NavigationMenu
              aria-label="Pages"
              activeId={active}
              onSelect={choose}
              items={[
                { id: 'overview', label: 'Overview', href: '#overview' },
                { id: 'invoices', label: 'Invoices', href: '#invoices' },
                { id: 'payments', label: 'Payments', href: '#payments' },
                { id: 'orders', label: 'Orders', href: '#orders' },
                { id: 'customers', label: 'Customers', href: '#customers' },
                { id: 'reports', label: 'Reports', href: '#reports' },
              ]}
            />
          </Topbar>
          <AppShell.Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <CardGrid columns={4}>
                <Stat label="Outstanding" value="$12,480" delta="+3 overdue" deltaTone="down" />
                <Stat label="Paid this month" value="$48,120" delta="+4.2%" deltaTone="up" />
                <Stat label="Average days" value="21" />
                <Stat label="Open orders" value="36" delta="+9" deltaTone="up" />
              </CardGrid>
              <FormGrid columns={3}>
                <Field label="Customer">
                  <Input defaultValue="Northwind Traders" />
                </Field>
                <Field label="Contact">
                  <Input defaultValue="Maria Anders" />
                </Field>
                <Field label="Customer PO">
                  <Input defaultValue="PO-88231" />
                </Field>
              </FormGrid>
              <StatusBar
                items={[
                  { id: 'books', label: 'Books', value: 'Open' },
                  { id: 'period', label: 'Period', value: 'Oct 2026' },
                  { id: 'entity', label: 'Entity', value: 'Halcyon US' },
                  { id: 'source', label: 'Source', value: 'Regulations.gov (EPA, OSHA, PHMSA)' },
                  { id: 'sync', label: 'Sync', value: '2 minutes ago' },
                ]}
              />
            </div>
          </AppShell.Content>
          <BottomNav aria-label="Primary" items={PRIMARY} activeId={active} onSelect={choose} />
        </AppShell.Main>
      </AppShell>
    );
  },
};
