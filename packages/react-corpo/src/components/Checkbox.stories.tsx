import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Send a copy to accounting' },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: 'A read-only copy is emailed once the invoice is approved.' },
};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
