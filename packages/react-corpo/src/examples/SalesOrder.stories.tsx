import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ActivityLog, type ActivityEntry } from '../components/ActivityLog';
import { AppShell } from '../components/AppShell';
import { AttachmentList, type Attachment } from '../components/AttachmentList';
import { Amount } from '../components/Amount';
import { Avatar } from '../components/Avatar';
import { Breadcrumb } from '../components/Breadcrumb';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DataTable, sumColumn } from '../components/DataTable';
import type { DataTableColumn, DataTableRow } from '../components/DataTable';
import { DatePicker } from '../components/DatePicker';
import { DateRangePicker } from '../components/DateRangePicker';
import type { DateRange } from '../components/DateRangePicker';
import { Field } from '../components/Field';
import { FormSection } from '../components/FormGrid';
import { Input } from '../components/Input';
import { LineItems, lineItemTotals } from '../components/LineItems';
import type { LineItem, LineItemProduct } from '../components/LineItems';
import { RecordPage } from '../components/RecordPage';
import { SectionHeader } from '../components/SectionHeader';
import { Select } from '../components/Select';
import { SideNav } from '../components/SideNav';
import { StatusPill } from '../components/StatusPill';
import { Tabs } from '../components/Tabs';
import { Textarea } from '../components/Textarea';
import { Topbar } from '../components/Topbar';

const meta = {
  title: 'Examples/Sales order',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

type OrderStatus = 'Draft' | 'Confirmed' | 'Shipped';
const TONE = { Draft: 'idle', Confirmed: 'info', Shipped: 'ok' } as const;

interface Order {
  id: string;
  customer: string;
  contact: string;
  po: string;
  ordered: Date;
  due: Date;
  terms: string;
  notes: string;
  status: OrderStatus;
  lines: LineItem[];
  history: ActivityEntry[];
  attachments: Attachment[];
}

const PRODUCTS: LineItemProduct[] = [
  {
    value: 'CHR-100',
    label: 'CHR-100 Task chair',
    description: 'Ergonomic task chair, graphite',
    unitPrice: 349,
    taxRate: 7.75,
  },
  {
    value: 'DSK-210',
    label: 'DSK-210 Standing desk',
    description: 'Electric standing desk, 60 in',
    unitPrice: 899,
    taxRate: 7.75,
  },
  { value: 'MON-27', label: 'MON-27 Monitor arm', description: 'Dual monitor arm', unitPrice: 129, taxRate: 7.75 },
  {
    value: 'SVC-001',
    label: 'SVC-001 Assembly',
    description: 'On-site assembly, per visit',
    unitPrice: 75,
    taxRate: 0,
  },
];

const line = (id: string, sku: string, quantity: number, discount: number | null = null): LineItem => {
  const p = PRODUCTS.find((x) => x.value === sku);
  return {
    id,
    item: sku,
    description: p?.description ?? '',
    quantity,
    unitPrice: p?.unitPrice ?? null,
    discount,
    taxRate: p?.taxRate ?? null,
  };
};

const ORDERS: Order[] = [
  {
    id: 'SO-10482',
    customer: 'Northwind Traders',
    contact: 'Maria Anders',
    po: 'PO-88231',
    ordered: new Date(2026, 9, 5),
    due: new Date(2026, 10, 4),
    terms: 'net30',
    notes: 'Deliver to the loading dock before 3 PM.',
    status: 'Draft',
    lines: [line('a1', 'CHR-100', 4, 10), line('a2', 'DSK-210', 1), line('a3', 'SVC-001', 1)],
    attachments: [
      {
        id: 'f1',
        name: 'PO-88231 signed.pdf',
        size: 248_312,
        href: '#po-88231.pdf',
        uploadedBy: 'Maria Anders',
        uploadedAt: 'Oct 5',
      },
    ],
    history: [{ id: 'h1', type: 'event', title: 'Draft created', timestamp: 'Oct 5, 9:12 AM' }],
  },
  {
    id: 'SO-10479',
    customer: 'Globex',
    contact: 'Hank Scorpio',
    po: 'GX-2210',
    ordered: new Date(2026, 9, 2),
    due: new Date(2026, 10, 1),
    terms: 'net30',
    notes: '',
    status: 'Confirmed',
    lines: [line('b1', 'DSK-210', 6, 5), line('b2', 'MON-27', 6)],
    attachments: [],
    history: [
      { id: 'h2', type: 'event', title: 'Order confirmed', timestamp: 'Oct 2, 2:40 PM', tone: 'ok' },
      { id: 'h3', type: 'event', title: 'Draft created', timestamp: 'Oct 2, 11:03 AM' },
    ],
  },
  {
    id: 'SO-10471',
    customer: 'Initech',
    contact: 'Bill Lumbergh',
    po: 'IT-5531',
    ordered: new Date(2026, 8, 24),
    due: new Date(2026, 9, 24),
    terms: 'net15',
    notes: '',
    status: 'Shipped',
    lines: [line('c1', 'CHR-100', 12, 15), line('c2', 'SVC-001', 2)],
    attachments: [],
    history: [
      { id: 'h4', type: 'event', title: 'Shipped', timestamp: 'Sep 29, 8:15 AM', tone: 'ok' },
      { id: 'h5', type: 'event', title: 'Order confirmed', timestamp: 'Sep 24, 4:02 PM', tone: 'ok' },
      { id: 'h6', type: 'event', title: 'Draft created', timestamp: 'Sep 24, 3:47 PM' },
    ],
  },
];

const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Order', mono: true, sortable: true, summary: (rows) => `${rows.length} orders` },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'ordered', label: 'Ordered', mono: true, sortable: true },
  {
    key: 'total',
    label: 'Total',
    numeric: true,
    sortable: true,
    summary: (rows) => ({ content: <Amount value={sumColumn(rows, 'total')} /> }),
  },
  { key: 'status', label: 'Status', sortable: true },
];

function OrderList({ orders, onOpen }: { orders: Order[]; onOpen: (id: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [period, setPeriod] = useState<DateRange | undefined>({
    start: new Date(2026, 8, 1),
    end: new Date(2026, 9, 31),
  });
  const inPeriod = orders.filter((o) => !period || (o.ordered >= period.start && o.ordered <= period.end));
  const rows: DataTableRow[] = inPeriod.map((o) => {
    const { total } = lineItemTotals(o.lines);
    return {
      id: o.id,
      cells: {
        id: {
          content: (
            <button type="button" className="cp-table__link" onClick={() => onOpen(o.id)}>
              {o.id}
            </button>
          ),
        },
        customer: o.customer,
        ordered: shortDate(o.ordered),
        total: { content: <Amount value={total} /> },
        status: { content: <StatusPill tone={TONE[o.status]}>{o.status}</StatusPill> },
      },
      values: { id: o.id, ordered: o.ordered.getTime(), total, status: o.status },
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader
        title="Sales orders"
        description="Orders placed in the selected period."
        actions={
          <div style={{ width: 240 }}>
            <DateRangePicker value={period} onChange={setPeriod} size="sm" />
          </div>
        }
      />
      <DataTable
        columns={COLUMNS}
        rows={rows}
        grid
        searchable
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={<Button size="sm">Export selected</Button>}
      />
    </div>
  );
}

function OrderRecord({
  order,
  onChange,
  onBack,
}: {
  order: Order;
  onChange: (next: Order) => void;
  onBack: () => void;
}) {
  const totals = lineItemTotals(order.lines);
  const editable = order.status === 'Draft';
  const confirm = () =>
    onChange({
      ...order,
      status: 'Confirmed',
      history: [
        { id: 'h7', type: 'event', title: 'Order confirmed', timestamp: 'Just now', tone: 'ok' },
        ...order.history,
      ],
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Breadcrumb
        items={[
          { label: 'Sales orders', as: 'button', linkProps: { type: 'button', onClick: onBack } },
          { label: order.id },
        ]}
      />
      <RecordPage
        eyebrow="Sales order"
        title={order.id}
        status={<StatusPill tone={TONE[order.status]}>{order.status}</StatusPill>}
        actions={
          editable ? (
            <>
              <Button size="sm">Save draft</Button>
              <Button size="sm" variant="primary" onClick={confirm}>
                Confirm order
              </Button>
            </>
          ) : (
            <Button size="sm">Print</Button>
          )
        }
        facts={[
          { label: 'Customer', value: order.customer },
          { label: 'Ordered', value: shortDate(order.ordered) },
          { label: 'Due', value: shortDate(order.due) },
          { label: 'Lines', value: order.lines.length },
          { label: 'Total', value: <Amount value={totals.total} /> },
        ]}
        aside={
          <>
            <Card title="Activity">
              <ActivityLog
                entries={order.history}
                onComment={(body) =>
                  onChange({
                    ...order,
                    history: [
                      {
                        id: `h${order.history.length + 100}`,
                        type: 'comment',
                        author: 'Ana Sørensen',
                        timestamp: 'Just now',
                        body,
                      },
                      ...order.history,
                    ],
                  })
                }
              />
            </Card>
            <Card title="Attachments">
              <AttachmentList
                attachments={order.attachments}
                onRemove={(id) => onChange({ ...order, attachments: order.attachments.filter((a) => a.id !== id) })}
                onAdd={(files) =>
                  onChange({
                    ...order,
                    attachments: [
                      ...order.attachments,
                      ...files.map((f, n) => ({
                        id: `f${order.attachments.length + n + 1}`,
                        name: f.name,
                        size: f.size,
                        uploadedBy: 'Ana Sørensen',
                        uploadedAt: 'Just now',
                      })),
                    ],
                  })
                }
              />
            </Card>
          </>
        }
      >
        <Tabs
          aria-label="Order sections"
          tabs={[
            {
              id: 'details',
              label: 'Details',
              panel: (
                <div>
                  <FormSection title="Customer" columns={3} disabled={!editable}>
                    <Field label="Customer" required>
                      <Input
                        value={order.customer}
                        onChange={(e) => onChange({ ...order, customer: e.target.value })}
                      />
                    </Field>
                    <Field label="Contact">
                      <Input value={order.contact} onChange={(e) => onChange({ ...order, contact: e.target.value })} />
                    </Field>
                    <Field label="Customer PO">
                      <Input value={order.po} onChange={(e) => onChange({ ...order, po: e.target.value })} />
                    </Field>
                  </FormSection>
                  <FormSection title="Terms" columns={3} disabled={!editable}>
                    <Field label="Payment terms">
                      <Select value={order.terms} onChange={(e) => onChange({ ...order, terms: e.target.value })}>
                        <option value="net15">Net 15</option>
                        <option value="net30">Net 30</option>
                        <option value="net60">Net 60</option>
                      </Select>
                    </Field>
                    <Field label="Due date">
                      <DatePicker value={order.due} onChange={(due) => onChange({ ...order, due })} />
                    </Field>
                    <Field label="Notes" span="full">
                      <Textarea
                        rows={2}
                        value={order.notes}
                        onChange={(e) => onChange({ ...order, notes: e.target.value })}
                      />
                    </Field>
                  </FormSection>
                </div>
              ),
            },
            {
              id: 'lines',
              label: 'Lines',
              count: order.lines.length,
              panel: (
                <LineItems
                  value={order.lines}
                  onChange={(lines) => onChange({ ...order, lines })}
                  products={PRODUCTS}
                  currency="$"
                  readOnly={!editable}
                />
              ),
            },
          ]}
        />
      </RecordPage>
    </div>
  );
}

function SalesOrderExample() {
  const [orders, setOrders] = useState(ORDERS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const open = orders.find((o) => o.id === openId);

  return (
    <AppShell navOpen={navOpen} onNavClose={() => setNavOpen(false)} style={{ height: '100vh' }}>
      <AppShell.Sidebar>
        <SideNav
          brand="Halcyon Group"
          activeId="orders"
          onSelect={() => setOpenId(null)}
          sections={[
            {
              title: 'Sales',
              items: [
                { id: 'orders', label: 'Sales orders' },
                { id: 'customers', label: 'Customers' },
                { id: 'products', label: 'Products' },
              ],
            },
          ]}
        />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Topbar
          title="Sales"
          onNavToggle={() => setNavOpen(true)}
          actions={
            <>
              <Button size="sm" variant="primary">
                New order
              </Button>
              <Avatar size="sm" initials="AS" />
            </>
          }
        />
        <AppShell.Content>
          {open ? (
            <OrderRecord
              order={open}
              onChange={(next) => setOrders((all) => all.map((o) => (o.id === next.id ? next : o)))}
              onBack={() => setOpenId(null)}
            />
          ) : (
            <OrderList orders={orders} onOpen={setOpenId} />
          )}
        </AppShell.Content>
      </AppShell.Main>
    </AppShell>
  );
}

/**
 * The ERP proof point, built only from corpo components: an order list (DataTable grid with totals,
 * bulk actions, and a DateRangePicker period) opens a RecordPage with Details and Lines tabs
 * (FormSections, LineItems) and an activity aside. Confirming the draft locks the form and lines.
 */
export const Workspace: StoryObj = {
  render: () => <SalesOrderExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const listTotal = () => canvasElement.querySelector('tfoot [data-numeric]')?.textContent ?? '';
    await expect(listTotal()).toContain('12,738.54');

    await userEvent.click(canvas.getByRole('button', { name: 'SO-10482' }));
    await expect(canvas.getByRole('heading', { level: 1, name: 'SO-10482' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('tab', { name: /Lines/ }));
    const qty = canvas.getByRole('spinbutton', { name: 'Quantity, line 3' });
    await userEvent.click(qty);
    await userEvent.clear(qty);
    await userEvent.type(qty, '2');
    await userEvent.tab();
    const facts = canvasElement.querySelector('.cp-record__facts');
    await expect(facts).toHaveTextContent('2,472.44');

    await userEvent.click(canvas.getByRole('button', { name: 'Confirm order' }));
    await expect(canvas.getByText('Confirmed', { selector: '.cp-record__title-row *' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Add line' })).toBeNull();
    await userEvent.click(canvas.getByRole('tab', { name: 'Details' }));
    await expect(canvas.getByRole('textbox', { name: /Customer PO/ })).toBeDisabled();

    const crumbs = within(canvas.getByRole('navigation', { name: 'Breadcrumb' }));
    await userEvent.click(crumbs.getByRole('button', { name: 'Sales orders' }));
    await expect(listTotal()).toContain('12,813.54');
  },
};
