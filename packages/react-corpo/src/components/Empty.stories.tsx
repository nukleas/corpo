import type { Meta, StoryObj } from '@storybook/react';
import { Empty } from './Empty';
import { Button } from './Button';

const meta: Meta<typeof Empty> = {
  title: 'Display/Empty',
  component: Empty,
  tags: ['autodocs'],
  args: {
    title: 'No invoices yet',
    description: 'Invoices you create will show up here.',
    action: <Button variant="primary" size="sm">New invoice</Button>,
  },
};
export default meta;

type Story = StoryObj<typeof Empty>;

export const Default: Story = {};
