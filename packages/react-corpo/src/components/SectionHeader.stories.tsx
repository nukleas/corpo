import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from './SectionHeader';
import { Button } from './Button';

const meta: Meta<typeof SectionHeader> = {
  title: 'Display/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  args: {
    title: 'Invoices',
    description: '84 invoices across all clients.',
    actions: <Button variant="primary" size="sm">New invoice</Button>,
  },
};
export default meta;

type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {};
