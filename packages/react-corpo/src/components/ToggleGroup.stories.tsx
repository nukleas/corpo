import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup } from './ToggleGroup';

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const meta: Meta<typeof ToggleGroup> = {
  title: 'Forms/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  args: { options },
};
export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const SingleSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState('week');
    return <ToggleGroup {...args} value={value} onChange={(v) => setValue(v as string)} />;
  },
};
