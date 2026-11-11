import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ActionBar } from '../components/ActionBar';
import { ActivityLog, type ActivityEntry } from '../components/ActivityLog';
import { Amount } from '../components/Amount';
import { Approvals, type Approver } from '../components/Approvals';
import { AppShell } from '../components/AppShell';
import { AttachmentList, type Attachment } from '../components/AttachmentList';
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
import { LineItems, lineItemTotals, type LineItem, type LineItemProduct } from '../components/LineItems';
import { ModuleLauncher, type LauncherModule } from '../components/ModuleLauncher';
import { RecordPage } from '../components/RecordPage';
import { RecordPager } from '../components/RecordPager';
import { ShortcutKeys, ShortcutsProvider, useShortcut } from '../components/Shortcuts';
import { SideNav, type SideNavItem, type SideNavSection } from '../components/SideNav';
import { SplitButton } from '../components/SplitButton';
import { Stepper } from '../components/Stepper';
import { StatusPill } from '../components/StatusPill';
import { Table } from '../components/Table';
import { Tabs, type TabItem } from '../components/Tabs';
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

const PRODUCTS: LineItemProduct[] = [
  { value: 'OIL-500', label: 'OIL-500 Olive oil, 5 L', description: 'Extra virgin, tin', unitPrice: 42, taxRate: 5 },
  { value: 'FLR-250', label: 'FLR-250 Bread flour, 25 kg', description: 'Strong white', unitPrice: 31.5, taxRate: 0 },
  { value: 'SPC-012', label: 'SPC-012 Spice kit', description: '12 jars, assorted', unitPrice: 64, taxRate: 20 },
  {
    value: 'PAL-001',
    label: 'PAL-001 Pallet delivery',
    description: 'Per pallet, next day',
    unitPrice: 85,
    taxRate: 20,
  },
  { value: 'BOX-060', label: 'BOX-060 Shipping cartons', description: 'Pack of 60', unitPrice: 18, taxRate: 20 },
];

const line = (id: string, product: string, quantity: number, discount: number | null = null): LineItem => {
  const p = PRODUCTS.find((x) => x.value === product);
  return {
    id,
    item: product,
    description: p?.description ?? '',
    quantity,
    unitPrice: p?.unitPrice ?? null,
    discount,
    taxRate: p?.taxRate ?? null,
  };
};

type Tone = 'ok' | 'warn' | 'err' | 'idle';

interface OrderRecord {
  id: string;
  client: string;
  status: string;
  tone: Tone;
  /** 0 picked … 3 delivered. */
  stage: number;
  /** Share of the total invoiced, and share of that paid. */
  invoiced: number;
  paid: number;
  lines: LineItem[];
  attachments: Attachment[];
  approvers: Approver[];
  history: ActivityEntry[];
}

const approvers = (sales: Approver['decision'], finance: Approver['decision']): Approver[] => [
  {
    id: 'sales',
    name: 'Priya Natarajan',
    role: 'Sales manager',
    decision: sales,
    decidedAt: sales === 'pending' ? undefined : 'Nov 4, 9:12 AM',
  },
  {
    id: 'me',
    name: 'Ana Sørensen',
    role: 'Finance controller',
    decision: finance,
    decidedAt: finance === 'pending' ? undefined : 'Nov 4, 2:40 PM',
  },
];

const SEED: OrderRecord[] = [
  {
    id: 'SO-2208',
    client: 'Calder & Bright',
    status: 'Confirmed',
    tone: 'ok',
    stage: 3,
    invoiced: 1,
    paid: 1,
    lines: [line('l1', 'OIL-500', 120, 5), line('l2', 'SPC-012', 60), line('l3', 'PAL-001', 6)],
    attachments: [
      { id: 'a1', name: 'PO-55102.pdf', size: 182_400, uploadedBy: 'Calder & Bright', uploadedAt: 'Oct 28' },
      { id: 'a2', name: 'Proof of delivery.jpg', size: 1_204_000, uploadedBy: 'Driver app', uploadedAt: 'Nov 6' },
    ],
    approvers: approvers('approved', 'approved'),
    history: [
      {
        id: 'h1',
        type: 'event',
        title: 'Delivered to Calder & Bright, Leeds',
        timestamp: 'Nov 6, 11:02 AM',
        tone: 'ok',
      },
      { id: 'h2', type: 'event', title: 'Invoice INV-1061 paid', timestamp: 'Nov 5, 4:18 PM', tone: 'ok' },
      {
        id: 'h3',
        type: 'change',
        author: 'Priya Natarajan',
        initials: 'PN',
        timestamp: 'Oct 29, 10:30 AM',
        changes: [{ field: 'Status', from: 'Draft', to: 'Confirmed' }],
      },
    ],
  },
  {
    id: 'SO-2209',
    client: 'Keel Marine Supply',
    status: 'Draft',
    tone: 'idle',
    stage: 0,
    invoiced: 0,
    paid: 0,
    lines: [line('l1', 'BOX-060', 20), line('l2', 'PAL-001', 2)],
    attachments: [],
    approvers: approvers('pending', 'pending'),
    history: [
      { id: 'h1', type: 'event', title: 'Order created from quote Q-0912', timestamp: 'Nov 7, 3:05 PM', tone: 'idle' },
    ],
  },
  {
    id: 'SO-2210',
    client: 'Ostara Foods',
    status: 'Draft',
    tone: 'idle',
    stage: 1,
    invoiced: 0.5,
    paid: 1,
    lines: [line('l1', 'OIL-500', 40), line('l2', 'FLR-250', 30, 10), line('l3', 'PAL-001', 2)],
    attachments: [
      { id: 'a1', name: 'Ostara PO-77120.pdf', size: 96_000, uploadedBy: 'Ostara Foods', uploadedAt: 'Nov 3' },
    ],
    approvers: approvers('approved', 'pending'),
    history: [
      {
        id: 'h1',
        type: 'comment',
        author: 'Priya Natarajan',
        initials: 'PN',
        timestamp: 'Nov 4, 9:14 AM',
        body: 'Approved at list price. Deposit invoice sent; balance on delivery.',
      },
      {
        id: 'h2',
        type: 'change',
        author: 'Priya Natarajan',
        initials: 'PN',
        timestamp: 'Nov 3, 4:40 PM',
        changes: [{ field: 'Flour discount', from: '0%', to: '10%' }],
      },
      { id: 'h3', type: 'event', title: 'Order created from quote Q-0907', timestamp: 'Nov 3, 4:02 PM', tone: 'idle' },
    ],
  },
  {
    id: 'SO-2211',
    client: 'Northwind Traders',
    status: 'Awaiting approval',
    tone: 'warn',
    stage: 0,
    invoiced: 0,
    paid: 0,
    lines: [line('l1', 'SPC-012', 25), line('l2', 'OIL-500', 15), line('l3', 'PAL-001', 1)],
    attachments: [
      { id: 'a1', name: 'Credit check.pdf', size: 41_200, uploadedBy: 'Ana Sørensen', uploadedAt: 'Nov 8' },
    ],
    approvers: approvers('approved', 'pending'),
    history: [
      { id: 'h1', type: 'event', title: 'Sent for finance approval', timestamp: 'Nov 8, 10:20 AM', tone: 'warn' },
    ],
  },
];

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const STAGES = [{ label: 'Picked' }, { label: 'Packed' }, { label: 'Shipped' }, { label: 'Delivered' }];

const holds = (item: SideNavItem, page: string): boolean =>
  item.id === page || (item.items ?? []).some((child) => holds(child, page));

/** Which module holds a page, for the launcher's current module and the breadcrumb. */
function moduleOf(page: string): LauncherModule | undefined {
  const section = NAV[1]?.items.find((m) => holds(m, page));
  return MODULES.find((m) => m.id === section?.id);
}

const note = { margin: 0, fontSize: 'var(--corpo-text-sm)', color: 'var(--corpo-text-muted)' } as const;
const stack = { display: 'flex', flexDirection: 'column', gap: 16 } as const;
const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/** The order's tabs. Each edits the record through `update`, and notable changes are logged to Activity. */
function orderTabs(
  order: OrderRecord,
  total: number,
  company: string,
  update: (next: Partial<OrderRecord>) => void,
  log: (entry: ActivityEntry) => void,
): TabItem[] {
  const event = (title: string, tone: Tone | 'info' = 'info') =>
    log({ id: `e${Date.now()}`, type: 'event', title, timestamp: `Today, ${now()}`, tone });
  const invoicedAmount = total * order.invoiced;
  const paidAmount = invoicedAmount * order.paid;
  const pendingApprovals = order.approvers.filter((a) => a.decision === 'pending').length;

  const invoices =
    order.invoiced === 0
      ? []
      : order.invoiced < 1
        ? [{ no: 'INV-1072', what: 'Deposit (50%)', amount: invoicedAmount, paid: order.paid === 1 }]
        : [{ no: 'INV-1061', what: 'Full order', amount: invoicedAmount, paid: order.paid === 1 }];

  return [
    {
      id: 'details',
      label: 'Details',
      panel: (
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
          <Field label="Selling company" hint="Change it with the company switcher, top left.">
            <Input value={company} readOnly />
          </Field>
          <Field label="Salesperson">
            <Input defaultValue="Priya Natarajan" />
          </Field>
        </FormGrid>
      ),
    },
    {
      id: 'lines',
      label: 'Lines',
      count: order.lines.length,
      panel: (
        <div style={stack}>
          <p style={note}>Edit quantities or add a line — the total in the header follows.</p>
          <LineItems value={order.lines} onChange={(lines) => update({ lines })} products={PRODUCTS} currency="$" />
        </div>
      ),
    },
    {
      id: 'invoices',
      label: 'Invoices',
      count: invoices.length,
      panel:
        invoices.length === 0 ? (
          <Empty
            title="No invoices yet"
            description="Invoice the full order now, or after delivery."
            action={
              <Button
                onClick={() => {
                  update({ invoiced: 1, paid: 0 });
                  event(`Invoice INV-1080 created for ${money(total)}`);
                }}
              >
                Create invoice
              </Button>
            }
          />
        ) : (
          <Table
            columns={[
              { key: 'no', label: 'Invoice', mono: true },
              { key: 'what', label: 'Description' },
              { key: 'amount', label: 'Amount (USD)', numeric: true },
              { key: 'status', label: 'Status' },
            ]}
            rows={invoices.map((inv) => ({
              no: inv.no,
              what: inv.what,
              amount: { content: <Amount value={inv.amount} /> },
              status: inv.paid ? { content: 'Paid', status: 'ok' } : { content: 'Open', status: 'warn' },
            }))}
          />
        ),
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      panel: (
        <div style={stack}>
          <Stepper items={STAGES} current={order.stage} />
          {order.stage >= 2 ? (
            <Table
              columns={[
                { key: 'no', label: 'Shipment', mono: true },
                { key: 'carrier', label: 'Carrier' },
                { key: 'pallets', label: 'Pallets', numeric: true },
                { key: 'status', label: 'Status' },
              ]}
              rows={[
                {
                  no: `SH-${order.id.slice(3)}-1`,
                  carrier: 'Northline Freight',
                  pallets: String(order.lines.find((l) => l.item === 'PAL-001')?.quantity ?? 1),
                  status:
                    order.stage === 3
                      ? { content: 'Delivered', status: 'ok' }
                      : { content: 'In transit', status: 'warn' },
                },
              ]}
            />
          ) : (
            <p style={note}>Nothing has shipped yet.</p>
          )}
          {order.stage < 3 && (
            <div>
              <Button
                onClick={() => {
                  const stage = order.stage + 1;
                  update({ stage });
                  event(`Marked ${STAGES[stage]?.label.toLowerCase()}`, stage === 3 ? 'ok' : 'info');
                }}
              >
                Mark {STAGES[order.stage + 1]?.label.toLowerCase()}
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'payments',
      label: 'Payments',
      panel: (
        <div style={stack}>
          <Table
            columns={[
              { key: 'what', label: '' },
              { key: 'amount', label: 'Amount (USD)', numeric: true },
            ]}
            rows={[
              { what: 'Order total', amount: { content: <Amount value={total} /> } },
              { what: 'Invoiced', amount: { content: <Amount value={invoicedAmount} zeroDash /> } },
              { what: 'Received', amount: { content: <Amount value={paidAmount} zeroDash /> } },
              {
                what: 'Balance due',
                amount: {
                  content: (
                    <strong>
                      <Amount value={total - paidAmount} zeroDash />
                    </strong>
                  ),
                },
              },
            ]}
          />
          {invoicedAmount - paidAmount > 0 && (
            <div>
              <Button
                onClick={() => {
                  update({ paid: 1 });
                  event(`Payment of ${money(invoicedAmount - paidAmount)} received`, 'ok');
                }}
              >
                Record payment
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'attachments',
      label: 'Attachments',
      count: order.attachments.length,
      panel: (
        <AttachmentList
          attachments={order.attachments}
          onRemove={(id) => update({ attachments: order.attachments.filter((a) => a.id !== id) })}
          onAdd={(files) =>
            update({
              attachments: [
                ...order.attachments,
                ...files.map((f, n) => ({
                  id: `up${Date.now()}${n}`,
                  name: f.name,
                  size: f.size,
                  uploadedBy: 'Ana Sørensen',
                  uploadedAt: 'Just now',
                })),
              ],
            })
          }
        />
      ),
    },
    {
      id: 'approvals',
      label: 'Approvals',
      count: pendingApprovals || undefined,
      panel: (
        <Approvals
          approvers={order.approvers}
          actorId="me"
          onDecide={(decision, comment) => {
            const next = order.approvers.map((a) =>
              a.id === 'me' ? { ...a, decision, comment: comment || undefined, decidedAt: `Today, ${now()}` } : a,
            );
            const approved = next.every((a) => a.decision === 'approved');
            const outcome: Partial<OrderRecord> =
              decision === 'rejected'
                ? { status: 'Rejected', tone: 'err' }
                : approved
                  ? { status: 'Approved', tone: 'ok' }
                  : {};
            update({ approvers: next, ...outcome });
            event(
              decision === 'approved' ? 'Approved by finance' : 'Rejected by finance',
              decision === 'approved' ? 'ok' : 'err',
            );
          }}
        />
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      count: order.history.length,
      panel: (
        <ActivityLog
          entries={order.history}
          onComment={(body) =>
            log({
              id: `c${Date.now()}`,
              type: 'comment',
              author: 'Ana Sørensen',
              initials: 'AS',
              timestamp: `Today, ${now()}`,
              body,
            })
          }
        />
      ),
    },
  ];
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

  const [records, setRecords] = useState(SEED);
  const order = records[at] ?? records[0];
  const total = lineItemTotals(order.lines).total;
  const update = (next: Partial<OrderRecord>) =>
    setRecords((all) => all.map((r) => (r.id === order.id ? { ...r, ...next } : r)));
  const log = (entry: ActivityEntry) => update({ history: [entry, ...order.history] });
  const go = (id: string) => {
    setPage(id);
    setNavOpen(false);
  };
  const run = (label: string) => () => setNotice(`${label} — ${order.id}`);
  const step = (by: number) => setAt((i) => Math.min(Math.max(i + by, 0), records.length - 1));

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
      items: records.map((o, i) => ({
        id: o.id,
        label: o.id,
        description: `${o.client} · ${money(lineItemTotals(o.lines).total)}`,
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
                  total={records.length}
                  onPrevious={() => step(-1)}
                  onNext={() => step(1)}
                  title="Previous and next order (K and J)"
                />
              }
              facts={[
                { label: 'Client', value: order.client },
                { label: 'Company', value: entityName },
                { label: 'Total', value: money(total) },
              ]}
            >
              <Tabs
                key={order.id}
                aria-label="Order sections"
                overflow="menu"
                tabs={orderTabs(order, total, entityName, update, log)}
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
