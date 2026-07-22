import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';
import { Button } from './Button';

const meta: Meta<typeof Dropdown> = {
  title: 'Navigation/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  args: {
    trigger: <Button size="sm">Actions ▾</Button>,
    items: [
      { id: 'edit', label: 'Edit' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete', danger: true },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {};
export const RightAligned: Story = { args: { align: 'right' } };
