import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Active' },
  argTypes: {
    color: { control: 'select', options: ['neutral', 'accent', 'green', 'red', 'amber', 'blue', 'magenta', 'purple'] },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};
export const WithDot: Story = { args: { color: 'green', dot: true, children: 'Online' } };

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge>Neutral</Badge>
      <Badge color="accent">Accent</Badge>
      <Badge color="green" dot>Paid</Badge>
      <Badge color="red" dot>Overdue</Badge>
      <Badge color="amber" dot>Pending</Badge>
      <Badge color="blue">Draft</Badge>
      <Badge color="magenta">Beta</Badge>
      <Badge color="purple">Internal</Badge>
    </div>
  ),
};
