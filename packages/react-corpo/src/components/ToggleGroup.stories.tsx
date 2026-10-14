import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
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
    return (
      <ToggleGroup
        {...args}
        value={value}
        onChange={(v) => {
          if (!Array.isArray(v)) setValue(v);
        }}
      />
    );
  },
};

/** One tab stop on the pressed option; arrows move focus, Space selects. */
export const Keyboard: Story = {
  ...SingleSelect,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Week' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Month' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('button', { name: 'Month' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('button', { name: 'Day' })).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Month' })).toHaveAttribute('tabindex', '-1');
  },
};
