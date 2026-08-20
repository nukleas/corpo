import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import { Badge } from './Badge';

const meta: Meta<typeof Table> = {
  title: 'Display/Table',
  component: Table,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Table>;

const columns = [
  { key: 'id', label: 'Invoice', mono: true },
  { key: 'client', label: 'Client' },
  { key: 'amount', label: 'Amount', numeric: true },
  { key: 'status', label: 'Status' },
];

// Row values are cell shorthand: bare content, or { content, status } for a
// status dot.
const rows = [
  { id: 'INV-2041', client: 'Acme Inc.', amount: '$4,200.00', status: { content: 'Paid', status: 'ok' as const } },
  { id: 'INV-2042', client: 'Northwind', amount: '$1,180.00', status: { content: 'Pending', status: 'warn' as const } },
  { id: 'INV-2043', client: 'Globex', amount: '$860.00', status: { content: 'Overdue', status: 'err' as const } },
];

export const Default: Story = { args: { columns, rows } };
export const Compact: Story = { args: { columns, rows, compact: true } };

/** Per-cell shorthand overrides: element content via `{ content }`, a column default overridden with `numeric: false`, and a missing value rendering an empty aligned cell. */
export const CellShorthand: Story = {
  args: {
    columns: [
      { key: 'plan', label: 'Plan' },
      { key: 'seats', label: 'Seats', numeric: true },
      { key: 'state', label: 'State' },
    ],
    rows: [
      { plan: 'Enterprise', seats: 12, state: { content: <Badge color="green">Active</Badge> } },
      { plan: 'Standard', seats: { content: 'Unlimited', numeric: false }, state: { content: 'Renewal due', status: 'warn' } },
      { plan: 'Trial', seats: 3 },
    ],
  },
};
