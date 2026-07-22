import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'open', label: 'Open', count: 12 },
  { id: 'paid', label: 'Paid', count: 84 },
  { id: 'overdue', label: 'Overdue', count: 3 },
];

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { tabs },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Underline: Story = {};
export const Pills: Story = { args: { pills: true } };
