import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Amount, roundCents } from './Amount';
import { Button } from './Button';
import { DataTable, sumColumn } from './DataTable';
import type { DataTableColumn, DataTableRow } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Display/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DataTable>;

const COLUMNS = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'amount', label: 'Amount', numeric: true, sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

const ROWS: DataTableRow[] = [
  {
    id: 'INV-1042',
    cells: {
      id: 'INV-1042',
      client: 'Acme Inc.',
      amount: { content: <Amount value={12_400} /> },
      status: { content: 'Paid', status: 'ok' },
    },
    values: { amount: 12_400, status: 'Paid' },
  },
  {
    id: 'INV-1043',
    cells: {
      id: 'INV-1043',
      client: 'Northwind',
      amount: { content: <Amount value={8_150} /> },
      status: { content: 'Pending', status: 'warn' },
    },
    values: { amount: 8_150, status: 'Pending' },
  },
  {
    id: 'INV-1039',
    cells: {
      id: 'INV-1039',
      client: 'Globex',
      amount: { content: <Amount value={-1_200} /> },
      status: { content: 'Credited', status: 'idle' },
    },
    values: { amount: -1_200, status: 'Credited' },
  },
  {
    id: 'INV-1040',
    cells: {
      id: 'INV-1040',
      client: 'Initech',
      amount: { content: <Amount value={860} /> },
      status: { content: 'Overdue', status: 'err' },
    },
    values: { amount: 860, status: 'Overdue' },
  },
];

/** Click a header to sort — asc, desc, then cleared. Amount sorts on its raw value from `values`, so `(1,200.00)` orders as −1200. */
export const Sortable: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstId = () => canvasElement.querySelector('tbody tr td')?.textContent;
    const amount = canvas.getByRole('button', { name: /Amount/ });
    const header = amount.closest('th');

    await userEvent.click(amount);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstId()).toBe('INV-1039'); // −1,200 sorts on its raw value, not "(1,200.00)"

    await userEvent.click(amount);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(firstId()).toBe('INV-1042');

    await userEvent.click(amount);
    await expect(header).not.toHaveAttribute('aria-sort');
    await expect(firstId()).toBe('INV-1042'); // back to source order
  },
};

/** `searchable` adds the toolbar quick filter across every column's raw values, with a filtered count. */
export const Filterable: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rows' }), 'north');
    await expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(1);
    await expect(canvas.getByText('1/4')).toBeInTheDocument();
    await userEvent.clear(canvas.getByRole('searchbox', { name: 'Filter rows' }));
    await expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(4);
  },
};

/**
 * Selection is controlled — the page owns the ids. `bulkActions` renders under the table while any
 * row is selected, with the count and a clear-selection button; the actions read `selected`
 * themselves. The header checkbox toggles the visible (filtered) rows.
 */
export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['INV-1043']);
    return (
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        searchable
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        compact
        bulkActions={
          <>
            <Button size="sm">Send reminders</Button>
            <Button size="sm">Export</Button>
          </>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('checkbox', { name: 'Select all rows' });
    await expect(all).toHaveProperty('indeterminate', true); // one of four preselected
    await expect(canvas.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('1 selected');

    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(canvas.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('4 selected');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await expect(all).not.toBeChecked();
    await expect(canvas.queryByRole('region', { name: 'Bulk actions' })).toBeNull();
  },
};

const TOTAL_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true, summary: () => 'Total' },
  { key: 'client', label: 'Client', sortable: true },
  {
    key: 'amount',
    label: 'Amount',
    numeric: true,
    sortable: true,
    summary: (rows) => ({ content: <Amount value={roundCents(sumColumn(rows, 'amount'))} /> }),
  },
  { key: 'status', label: 'Status', sortable: true },
];

/** A column `summary` adds a totals row. It is computed from the rows shown, so it follows the quick filter. */
export const Totals: Story = {
  render: () => <DataTable columns={TOTAL_COLUMNS} rows={ROWS} searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = () => canvasElement.querySelector('tfoot');
    await expect(footer()).toHaveTextContent('20,210.00');

    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rows' }), 'acme');
    await expect(footer()).toHaveTextContent('12,400.00');
  },
};

const CLIENTS = [
  'Acme Inc.',
  'Northwind',
  'Globex',
  'Initech',
  'Umbrella',
  'Hooli',
  'Stark Industries',
  'Wayne Enterprises',
];
const REGIONS = ['North America', 'EMEA', 'APAC', 'LATAM'];
const OWNERS = ['A. Shah', 'M. Okafor', 'J. Lindqvist', 'R. Tanaka', 'L. Moreau'];
const STATES = [
  { content: 'Paid', status: 'ok' },
  { content: 'Pending', status: 'warn' },
  { content: 'Overdue', status: 'err' },
  { content: 'Draft', status: 'idle' },
] as const;

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const sumCell = (key: string) => (rows: DataTableRow[]) => money(roundCents(sumColumn(rows, key)));

const GRID_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', mono: true, sortable: true, summary: (rows) => `${rows.length} invoices` },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'region', label: 'Region', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'issued', label: 'Issued', mono: true, sortable: true },
  { key: 'due', label: 'Due', mono: true, sortable: true },
  { key: 'subtotal', label: 'Subtotal', numeric: true, sortable: true, summary: sumCell('subtotal') },
  { key: 'tax', label: 'Tax', numeric: true, sortable: true, summary: sumCell('tax') },
  { key: 'total', label: 'Total', numeric: true, sortable: true, summary: sumCell('total') },
  { key: 'status', label: 'Status', sortable: true },
];

const GRID_ROWS: DataTableRow[] = Array.from({ length: 200 }, (_, i) => {
  const id = `INV-${2000 + i}`;
  const subtotal = ((i * 7919) % 48_000) + 350;
  const tax = Math.round(subtotal * 0.0775 * 100) / 100;
  const state = STATES[i % STATES.length];
  const day = (i % 28) + 1;
  return {
    id,
    cells: {
      id,
      client: CLIENTS[i % CLIENTS.length],
      region: REGIONS[(i * 3) % REGIONS.length],
      owner: OWNERS[(i * 2) % OWNERS.length],
      issued: `2026-09-${String(day).padStart(2, '0')}`,
      due: `2026-10-${String(day).padStart(2, '0')}`,
      subtotal: money(subtotal),
      tax: money(tax),
      total: money(subtotal + tax),
      status: state,
    },
    values: { subtotal, tax, total: subtotal + tax, status: state.content },
  };
});

/**
 * `grid` is the dense, spreadsheet-like treatment for record-heavy screens — reach for it instead
 * of a stack of Cards. Full gridlines, ~28px rows, a sticky header (bound the DataTable's height so
 * the grid scrolls inside itself), optional `striped` rows, and `pinFirstColumn` to keep the record
 * id in view while scrolling sideways. Column summaries stick to the bottom as a totals row, and
 * selecting rows brings up the bulk action bar.
 */
export const Grid: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <DataTable
        columns={GRID_COLUMNS}
        rows={GRID_ROWS}
        grid
        striped
        pinFirstColumn
        searchable
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={<Button size="sm">Export selected</Button>}
        style={{ height: 420, maxWidth: 900 }}
      />
    );
  },
};
