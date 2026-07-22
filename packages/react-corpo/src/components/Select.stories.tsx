import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <option>Net 30</option>
      <option>Net 60</option>
      <option>Due on receipt</option>
    </Select>
  ),
};
export const Error: Story = {
  args: { error: true },
  render: (args) => (
    <Select {...args}>
      <option>Choose a currency</option>
    </Select>
  ),
};
