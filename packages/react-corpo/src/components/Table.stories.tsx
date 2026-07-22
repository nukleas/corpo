import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';

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

const rows = [
  { id: 'INV-2041', client: 'Acme Ltd', amount: '£4,200.00', status: 'Paid', statusStatus: 'ok' },
  { id: 'INV-2042', client: 'Northwind', amount: '£1,180.00', status: 'Pending', statusStatus: 'warn' },
  { id: 'INV-2043', client: 'Globex', amount: '£860.00', status: 'Overdue', statusStatus: 'err' },
];

export const Default: Story = { args: { columns, rows } };
export const Compact: Story = { args: { columns, rows, compact: true } };
