import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = {
  title: 'Display/Stat',
  component: Stat,
  tags: ['autodocs'],
  args: { label: 'Collected in October', value: '$4,840.00' },
};
export default meta;

type Story = StoryObj<typeof Stat>;

export const Default: Story = {};
export const Up: Story = { args: { delta: '2 invoices', deltaTone: 'up', hint: 'posted to cash' } };
export const Down: Story = { args: { label: 'Overdue', value: '$4,010.00', delta: '2 invoices', deltaTone: 'down' } };
