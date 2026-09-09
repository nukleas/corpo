import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Amount } from './Amount';
import { Button } from './Button';
import { DataTable } from './DataTable';
import type { DataTableRow } from './DataTable';

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
    cells: { id: 'INV-1042', client: 'Acme Inc.', amount: { content: <Amount value={12_400} /> }, status: { content: 'Paid', status: 'ok' } },
    values: { amount: 12_400, status: 'Paid' },
  },
  {
    id: 'INV-1043',
    cells: { id: 'INV-1043', client: 'Northwind', amount: { content: <Amount value={8_150} /> }, status: { content: 'Pending', status: 'warn' } },
    values: { amount: 8_150, status: 'Pending' },
  },
  {
    id: 'INV-1039',
    cells: { id: 'INV-1039', client: 'Globex', amount: { content: <Amount value={-1_200} /> }, status: { content: 'Credited', status: 'idle' } },
    values: { amount: -1_200, status: 'Credited' },
  },
  {
    id: 'INV-1040',
    cells: { id: 'INV-1040', client: 'Initech', amount: { content: <Amount value={860} /> }, status: { content: 'Overdue', status: 'err' } },
    values: { amount: 860, status: 'Overdue' },
  },
];

/** Click a header to sort — asc, desc, then cleared. Amount sorts on its raw value from `values`, so `(1,200.00)` orders as −1200. */
export const Sortable: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} />,
};

/** `searchable` adds the toolbar quick filter across every column's raw values, with a filtered count. */
export const Filterable: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} searchable />,
};

/** Selection is controlled — the page owns the ids and renders its own batch actions. Header checkbox toggles the visible (filtered) rows. */
export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['INV-1043']);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button size="sm" disabled={selected.length === 0}>
            Send reminders ({selected.length})
          </Button>
        </div>
        <DataTable
          columns={COLUMNS}
          rows={ROWS}
          searchable
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          compact
        />
      </div>
    );
  },
};
