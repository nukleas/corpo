import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible } from './Collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'Display/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  args: { trigger: 'Show raw request payload', children: 'POST /v1/invoices { "amount": 4200, "currency": "GBP" }' },
};
export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {};
export const DefaultOpen: Story = { args: { defaultOpen: true } };
