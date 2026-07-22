import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Client reference number' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Accent: Story = { args: { accent: true, placeholder: 'Search invoices…' } };
export const Error: Story = { args: { error: true, defaultValue: 'GB00 1234' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked' } };
