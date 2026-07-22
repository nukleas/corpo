import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';
import { Button } from './Button';

const meta: Meta<typeof Popover> = {
  title: 'Display/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {
    trigger: <Button size="sm">Filters</Button>,
    children: <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>Filter by status, owner, or date range.</div>,
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {};
export const RightAligned: Story = { args: { align: 'right' } };
