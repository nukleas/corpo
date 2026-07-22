import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Display/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: 'Overdue' },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {};
export const Removable: Story = { args: { onRemove: () => {} } };

export const FilterRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Chip onRemove={() => {}}>Status: Overdue</Chip>
      <Chip onRemove={() => {}}>Client: Acme Ltd</Chip>
    </div>
  ),
};
