import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList } from './DescriptionList';

const invoiceItems = [
  { label: 'Invoice number', value: 'INV-2041' },
  { label: 'Bill to', value: 'Acme Inc.' },
  { label: 'Amount due', value: '$4,200.00' },
  { label: 'Due date', value: 'Aug 30, 2026' },
  { label: 'Payment terms', value: 'Net 30' },
  { label: 'Purchase order', value: 'PO-8841' },
];

const meta: Meta<typeof DescriptionList> = {
  title: 'Display/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  args: { items: invoiceItems },
};
export default meta;

type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
  args: { style: { maxWidth: 420 } },
};

export const Compact: Story = {
  args: {
    compact: true,
    style: { maxWidth: 320 },
    items: [
      { label: 'Cardholder', value: 'Maya Chen' },
      { label: 'Card', value: 'Visa ending 4421' },
      { label: 'Expires', value: '08/28' },
      { label: 'Billing ZIP', value: '10013' },
    ],
  },
};
