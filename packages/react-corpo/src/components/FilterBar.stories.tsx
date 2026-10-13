import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { FilterBar, type ActiveFilter } from './FilterBar';
import { Amount } from './Amount';
import { Button } from './Button';
import { DataTable, type DataTableColumn, type DataTableRow } from './DataTable';
import { Dropdown } from './Dropdown';
import { StatusPill } from './StatusPill';
import { Tabs } from './Tabs';

const meta: Meta<typeof FilterBar> = {
  title: 'Display/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof FilterBar>;

export const Default: Story = {
  args: {
    filters: [
      { id: 'status', label: 'Status: Overdue' },
      { id: 'client', label: 'Client: Acme Inc.' },
    ],
    count: '2 of 84 invoices',
    onRemove: () => {},
    onClearAll: () => {},
    children: <Button size="sm">Add filter ▾</Button>,
  },
};

type Field = 'status' | 'client';
type Status = 'Overdue' | 'Open' | 'Paid';
interface Filter {
  field: Field;
  value: string;
}
interface Invoice {
  id: string;
  client: string;
  status: Status;
  amount: number;
}

const INVOICES: Invoice[] = [
  { id: 'INV-2041', client: 'Acme Inc.', status: 'Overdue', amount: 4200 },
  { id: 'INV-2040', client: 'Globex', status: 'Open', amount: 12850 },
  { id: 'INV-2038', client: 'Acme Inc.', status: 'Paid', amount: 980 },
  { id: 'INV-2035', client: 'Initech', status: 'Open', amount: 6300 },
  { id: 'INV-2031', client: 'Northwind Traders', status: 'Paid', amount: 2210 },
];
const TONE = { Overdue: 'err', Open: 'info', Paid: 'ok' } satisfies Record<Status, 'err' | 'info' | 'ok'>;
const FIELDS: { field: Field; label: string; values: string[] }[] = [
  { field: 'status', label: 'Status', values: ['Open', 'Overdue', 'Paid'] },
  { field: 'client', label: 'Client', values: ['Acme Inc.', 'Globex', 'Initech', 'Northwind Traders'] },
];
const fieldLabel = (field: Field) => FIELDS.find((f) => f.field === field)?.label ?? field;
const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', mono: true },
  { key: 'client', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', numeric: true },
];

function InvoiceViews() {
  const [views, setViews] = useState<{ id: string; label: string; filters: Filter[] }[]>([
    { id: 'all', label: 'All', filters: [] },
    { id: 'overdue', label: 'Overdue', filters: [{ field: 'status', value: 'Overdue' }] },
    { id: 'acme', label: 'Acme', filters: [{ field: 'client', value: 'Acme Inc.' }] },
  ]);
  const [view, setView] = useState('all');
  const [filters, setFilters] = useState<Filter[]>([]);

  const shown = INVOICES.filter((inv) => filters.every((f) => inv[f.field] === f.value));
  const rows: DataTableRow[] = shown.map((inv) => ({
    id: inv.id,
    cells: {
      id: inv.id,
      client: inv.client,
      status: { content: <StatusPill tone={TONE[inv.status]}>{inv.status}</StatusPill> },
      amount: { content: <Amount value={inv.amount} /> },
    },
    values: { amount: inv.amount, status: inv.status },
  }));
  const active: ActiveFilter[] = filters.map((f) => ({ id: f.field, label: `${fieldLabel(f.field)}: ${f.value}` }));
  const setFilter = (field: Field, value: string) =>
    setFilters([...filters.filter((f) => f.field !== field), { field, value }]);

  return (
    <Tabs
      pills
      aria-label="Saved views"
      tabs={views.map((v) => ({ id: v.id, label: v.label }))}
      active={view}
      onChange={(id) => {
        setView(id);
        setFilters(views.find((v) => v.id === id)?.filters ?? []);
      }}
    >
      <DataTable
        columns={COLUMNS}
        rows={rows}
        toolbar={
          <FilterBar
            filters={active}
            onRemove={(id) => setFilters(filters.filter((f) => f.field !== id))}
            onClearAll={() => setFilters([])}
            count={`${shown.length} of ${INVOICES.length} invoices`}
          >
            <Dropdown
              trigger={<Button size="sm">Add filter ▾</Button>}
              items={FIELDS.map(({ field, label, values }) => ({
                id: field,
                type: 'submenu',
                label,
                items: values.map((v) => ({
                  id: v,
                  type: 'radio',
                  label: v,
                  checked: filters.some((f) => f.field === field && f.value === v),
                  onCheckedChange: () => setFilter(field, v),
                })),
              }))}
            />
            <Button
              size="sm"
              variant="ghost"
              disabled={filters.length === 0}
              onClick={() => {
                const id = `view-${views.length}`;
                setViews([...views, { id, label: filters.map((f) => f.value).join(', '), filters }]);
                setView(id);
              }}
            >
              Save view
            </Button>
          </FilterBar>
        }
      />
    </Tabs>
  );
}

/**
 * Saved views over a filtered table: pill {@link Tabs} switch views, the FilterBar sits in the DataTable
 * toolbar, filters are added from a Dropdown with submenus and radio items, and the current filters can be
 * saved as a new view. The page owns the filter state and filters its own rows.
 */
export const SavedViews: Story = {
  render: () => <InvoiceViews />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const count = () => canvas.getByText(/of 5 invoices/);

    await userEvent.click(canvas.getByRole('tab', { name: 'Overdue' }));
    await expect(canvas.getByText('Status: Overdue')).toBeInTheDocument();
    await expect(count()).toHaveTextContent('1 of 5 invoices');

    await userEvent.click(canvas.getByRole('button', { name: 'Remove filter Status: Overdue' }));
    await expect(count()).toHaveTextContent('5 of 5 invoices');

    await userEvent.click(canvas.getByRole('button', { name: /Add filter/ }));
    await userEvent.click(canvas.getByRole('menuitem', { name: /Client/ }));
    await userEvent.click(canvas.getByRole('menuitemradio', { name: 'Acme Inc.' }));
    await userEvent.keyboard('{Escape}{Escape}');
    await expect(count()).toHaveTextContent('2 of 5 invoices');

    await userEvent.click(canvas.getByRole('button', { name: 'Save view' }));
    await expect(canvas.getByRole('tab', { name: 'Acme Inc.' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await expect(count()).toHaveTextContent('5 of 5 invoices');
  },
};
