import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ActionBar } from '../components/ActionBar';
import { AppShell } from '../components/AppShell';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Breadcrumb } from '../components/Breadcrumb';
import { Button } from '../components/Button';
import { CommandDialog, type CommandGroup } from '../components/Command';
import { Empty } from '../components/Empty';
import { EntitySwitcher, type Entity } from '../components/EntitySwitcher';
import { Field } from '../components/Field';
import { FormGrid } from '../components/FormGrid';
import { Input } from '../components/Input';
import { ModuleLauncher, type LauncherModule } from '../components/ModuleLauncher';
import { RecordPage } from '../components/RecordPage';
import { RecordPager } from '../components/RecordPager';
import { ShortcutKeys, ShortcutsProvider, useShortcut } from '../components/Shortcuts';
import { SideNav, type SideNavItem, type SideNavSection } from '../components/SideNav';
import { SplitButton } from '../components/SplitButton';
import { StatusPill } from '../components/StatusPill';
import { Tabs } from '../components/Tabs';
import { Topbar } from '../components/Topbar';
import { useMediaQuery } from '../lib/useMediaQuery';

const meta = {
  title: 'Examples/ERP workspace',
  parameters: { layout: 'fullscreen', corpoFlush: true },
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const icon = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ICONS = {
  home: icon('M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'),
  sales: icon('M4 19V9M10 19V5M16 19v-7M22 19H2'),
  finance: icon('M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6'),
  inventory: icon('M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7'),
  purchasing: icon('M3 4h2l2 12h12l2-8H7'),
  people: icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'),
  settings: icon('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2'),
};

const ENTITIES: Entity[] = [
  { id: 'uk', name: 'Halcyon UK Ltd', detail: 'GBP · London' },
  { id: 'us', name: 'Halcyon Inc.', detail: 'USD · New York' },
  { id: 'de', name: 'Halcyon GmbH', detail: 'EUR · Berlin' },
];

const NAV: SideNavSection[] = [
  { items: [{ id: 'home', label: 'Home', icon: ICONS.home }] },
  {
    title: 'Modules',
    items: [
      {
        id: 'sales',
        label: 'Sales',
        icon: ICONS.sales,
        items: [
          { id: 'quotes', label: 'Quotes' },
          { id: 'orders', label: 'Sales orders', badge: <Badge color="amber">4</Badge> },
          { id: 'invoices', label: 'Invoices' },
        ],
      },
      {
        id: 'finance',
        label: 'Finance',
        icon: ICONS.finance,
        items: [
          {
            id: 'ledger',
            label: 'General ledger',
            items: [
              { id: 'journal', label: 'Journal entries' },
              { id: 'trial-balance', label: 'Trial balance' },
            ],
          },
          { id: 'receivables', label: 'Receivables' },
          { id: 'payables', label: 'Payables' },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: ICONS.inventory,
        items: [
          { id: 'items', label: 'Items' },
          { id: 'warehouses', label: 'Warehouses' },
        ],
      },
      {
        id: 'purchasing',
        label: 'Purchasing',
        icon: ICONS.purchasing,
        items: [{ id: 'pos', label: 'Purchase orders' }],
      },
    ],
  },
  { items: [{ id: 'settings', label: 'Settings', icon: ICONS.settings }] },
];

const MODULES: LauncherModule[] = [
  { id: 'sales', label: 'Sales', description: 'Quotes, orders', icon: ICONS.sales },
  { id: 'finance', label: 'Finance', description: 'Ledger, AR, AP', icon: ICONS.finance },
  { id: 'inventory', label: 'Inventory', description: 'Items, stock', icon: ICONS.inventory },
  { id: 'purchasing', label: 'Purchasing', description: 'POs, vendors', icon: ICONS.purchasing },
  { id: 'people', label: 'People', description: 'Staff, payroll', icon: ICONS.people },
  { id: 'settings', label: 'Settings', description: 'Company, users', icon: ICONS.settings },
];
const MODULE_HOME = new Map([
  ['sales', 'orders'],
  ['finance', 'journal'],
  ['inventory', 'items'],
  ['purchasing', 'pos'],
  ['people', 'home'],
  ['settings', 'settings'],
]);

const ORDERS = [
  { id: 'SO-2208', client: 'Calder & Bright', total: '$12,400.00', status: 'Confirmed', tone: 'ok' },
  { id: 'SO-2209', client: 'Keel Marine Supply', total: '$860.00', status: 'Draft', tone: 'idle' },
  { id: 'SO-2210', client: 'Ostara Foods', total: '$4,180.00', status: 'Draft', tone: 'idle' },
  { id: 'SO-2211', client: 'Northwind Traders', total: '$2,397.44', status: 'Awaiting approval', tone: 'warn' },
] as const;

const TABS = ['Details', 'Lines', 'Invoices', 'Deliveries', 'Payments', 'Attachments', 'Approvals', 'Activity'];

const holds = (item: SideNavItem, page: string): boolean =>
  item.id === page || (item.items ?? []).some((child) => holds(child, page));

/** Which module holds a page, for the launcher's current module and the breadcrumb. */
function moduleOf(page: string): LauncherModule | undefined {
  const section = NAV[1]?.items.find((m) => holds(m, page));
  return MODULES.find((m) => m.id === section?.id);
}

function Workspace() {
  const desktop = useMediaQuery('(min-width: 769px)');
  const [page, setPage] = useState('orders');
  const [entity, setEntity] = useState('uk');
  const [at, setAt] = useState(2);
  const [rail, setRail] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [notice, setNotice] = useState('');

  const order = ORDERS[at];
  const go = (id: string) => {
    setPage(id);
    setNavOpen(false);
  };
  const run = (label: string) => () => setNotice(`${label} — ${order.id}`);
  const step = (by: number) => setAt((i) => Math.min(Math.max(i + by, 0), ORDERS.length - 1));

  useShortcut({ keys: 'mod+k', description: 'Search and run commands', onTrigger: () => setPalette(true) });
  useShortcut({ keys: '[', description: 'Collapse or expand the sidebar', onTrigger: () => setRail((r) => !r) });
  useShortcut({ keys: 'g o', description: 'Go to sales orders', group: 'Go to', onTrigger: () => go('orders') });
  useShortcut({ keys: 'g j', description: 'Go to journal entries', group: 'Go to', onTrigger: () => go('journal') });
  useShortcut({ keys: 'g h', description: 'Go home', group: 'Go to', onTrigger: () => go('home') });
  const onOrder = page === 'orders';
  useShortcut({
    keys: 'j',
    description: 'Next order',
    group: 'Sales order',
    enabled: onOrder,
    onTrigger: () => step(1),
  });
  useShortcut({
    keys: 'k',
    description: 'Previous order',
    group: 'Sales order',
    enabled: onOrder,
    onTrigger: () => step(-1),
  });

  const commands: CommandGroup[] = [
    {
      id: 'records',
      label: 'Sales orders',
      items: ORDERS.map((o, i) => ({
        id: o.id,
        label: o.id,
        description: `${o.client} · ${o.total}`,
        keywords: [o.client],
        onSelect: () => {
          setAt(i);
          go('orders');
        },
      })),
    },
    {
      id: 'go',
      label: 'Go to',
      items: [
        {
          id: 'go-orders',
          label: 'Sales orders',
          description: 'Sales',
          shortcut: <ShortcutKeys keys="g o" />,
          onSelect: () => go('orders'),
        },
        {
          id: 'go-journal',
          label: 'Journal entries',
          description: 'Finance › General ledger',
          shortcut: <ShortcutKeys keys="g j" />,
          onSelect: () => go('journal'),
        },
        {
          id: 'go-tb',
          label: 'Trial balance',
          description: 'Finance › General ledger',
          onSelect: () => go('trial-balance'),
        },
        { id: 'go-items', label: 'Items', description: 'Inventory', onSelect: () => go('items') },
      ],
    },
    {
      id: 'actions',
      label: 'Actions',
      items: [
        { id: 'confirm', label: 'Confirm order', disabled: !onOrder, onSelect: run('Confirmed') },
        { id: 'invoice', label: 'Create invoice', disabled: !onOrder, onSelect: run('Invoice drafted') },
        {
          id: 'help',
          label: 'Show keyboard shortcuts',
          shortcut: <ShortcutKeys keys="?" />,
          onSelect: () => setNotice('Press ? to see every shortcut'),
        },
      ],
    },
  ];

  const module = moduleOf(page);
  const entityName = ENTITIES.find((e) => e.id === entity)?.name ?? '';

  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          aria-label="Modules"
          collapsed={rail && desktop}
          brand={
            <EntitySwitcher
              entities={ENTITIES}
              current={entity}
              onChange={(id) => {
                setEntity(id);
                setNotice(`Switched to ${ENTITIES.find((e) => e.id === id)?.name}`);
              }}
              actions={[{ id: 'manage', label: 'Manage companies' }]}
            />
          }
          sections={NAV}
          activeId={page}
          onSelect={go}
          footer={
            desktop ? (
              <Button
                size="sm"
                variant="ghost"
                icon={rail}
                aria-label={rail ? 'Expand sidebar' : undefined}
                onClick={() => setRail((r) => !r)}
              >
                {rail ? '»' : '« Collapse'}
              </Button>
            ) : (
              <span style={{ fontSize: 'var(--corpo-text-sm)' }}>Ana Sørensen</span>
            )
          }
        />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Topbar
          onNavToggle={() => setNavOpen(true)}
          actions={
            <>
              <Button size="sm" onClick={() => setPalette(true)} aria-keyshortcuts="Meta+K Control+K">
                Search <ShortcutKeys keys="mod+k" />
              </Button>
              <ModuleLauncher
                modules={MODULES}
                activeId={module?.id}
                align="end"
                onSelect={(id) => go(MODULE_HOME.get(id) ?? 'home')}
              />
              <Avatar size="sm" initials="AS" />
            </>
          }
        >
          <Breadcrumb
            items={[
              { label: entityName, as: 'button', linkProps: { type: 'button', onClick: () => go('home') } },
              ...(module
                ? [
                    {
                      label: module.label,
                      as: 'button' as const,
                      linkProps: { type: 'button', onClick: () => go(MODULE_HOME.get(module.id) ?? 'home') },
                    },
                  ]
                : []),
              ...(onOrder
                ? [
                    {
                      label: 'Sales orders',
                      as: 'button' as const,
                      linkProps: { type: 'button', onClick: () => go('orders') },
                    },
                    { label: order.id },
                  ]
                : [{ label: page.replace('-', ' ') }]),
            ]}
          />
        </Topbar>
        <AppShell.Content>
          {notice && (
            <p
              role="status"
              style={{ margin: '0 0 12px', fontSize: 'var(--corpo-text-sm)', color: 'var(--corpo-text-muted)' }}
            >
              {notice}
            </p>
          )}
          {onOrder ? (
            <RecordPage
              eyebrow="Sales order"
              title={order.id}
              status={<StatusPill tone={order.tone}>{order.status}</StatusPill>}
              actions={
                <ActionBar
                  actions={[
                    { id: 'confirm', label: 'Confirm order', variant: 'primary', onClick: run('Confirmed') },
                    { id: 'invoice', label: 'Create invoice', onClick: run('Invoice drafted') },
                    { id: 'email', label: 'Send by email', onClick: run('Emailed') },
                    { id: 'print', label: 'Print', onClick: run('Sent to printer') },
                  ]}
                  menu={[
                    { id: 'duplicate', label: 'Duplicate', onClick: run('Duplicated') },
                    { id: 'cancel', label: 'Cancel order', danger: true, onClick: run('Cancelled') },
                  ]}
                />
              }
              pager={
                <RecordPager
                  position={at + 1}
                  total={ORDERS.length}
                  onPrevious={() => step(-1)}
                  onNext={() => step(1)}
                  title="Previous and next order (K and J)"
                />
              }
              facts={[
                { label: 'Client', value: order.client },
                { label: 'Company', value: entityName },
                { label: 'Total', value: order.total },
              ]}
            >
              <Tabs
                key={order.id}
                aria-label="Order sections"
                overflow="menu"
                tabs={TABS.map((label) => ({
                  id: label.toLowerCase(),
                  label,
                  panel:
                    label === 'Details' ? (
                      <FormGrid columns={2}>
                        <Field label="Client">
                          <Input defaultValue={order.client} />
                        </Field>
                        <Field label="Client PO">
                          <Input defaultValue="PO-77120" />
                        </Field>
                        <Field label="Delivery date">
                          <Input defaultValue="Nov 24, 2026" />
                        </Field>
                        <Field label="Payment terms">
                          <Input defaultValue="Net 30" />
                        </Field>
                      </FormGrid>
                    ) : (
                      <p style={{ margin: 0, color: 'var(--corpo-text-secondary)' }}>
                        {label} for {order.id}.
                      </p>
                    ),
                }))}
              />
              <div style={{ marginTop: 20 }}>
                <SplitButton
                  variant="primary"
                  onClick={run('Saved')}
                  items={[
                    { id: 'save-new', label: 'Save and new', onClick: run('Saved, new order started') },
                    { id: 'save-draft', label: 'Save as draft', onClick: run('Saved as draft') },
                  ]}
                >
                  Save
                </SplitButton>
              </div>
            </RecordPage>
          ) : (
            <Empty
              title={page.replace('-', ' ').replace(/^./, (c) => c.toUpperCase())}
              description="This page is a placeholder. Press G then O, or use the sidebar, to return to sales orders."
              action={<Button onClick={() => go('orders')}>Open sales orders</Button>}
            />
          )}
        </AppShell.Content>
      </AppShell.Main>
      <CommandDialog
        open={palette}
        onClose={() => setPalette(false)}
        groups={commands}
        placeholder="Search orders, pages and actions…"
      />
    </AppShell>
  );
}

/**
 * Every ERP navigation layer in one screen. Try:
 * - ⌘K / Ctrl+K: search orders by client ("ostara"), pages, and actions
 * - G then O / J / H to jump; J and K step through orders; [ collapses the sidebar; ? lists all shortcuts
 * - the company switcher (top left), the module launcher (top right), the sidebar module tree and its icon rail
 * - narrow the window: the action bar, tabs and breadcrumb overflow into menus; below 768px the sidebar is a drawer
 */
export const AllLayers: Story = {
  render: () => (
    <ShortcutsProvider>
      <Workspace />
    </ShortcutsProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('SO-2210');
    await expect(canvas.getByRole('button', { name: 'Switch company: Halcyon UK Ltd' })).toBeInTheDocument();
  },
};
