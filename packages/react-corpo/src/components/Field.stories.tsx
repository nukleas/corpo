import type { Meta, StoryObj } from '@storybook/react';
import { Field } from './Field';
import { Input } from './Input';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <Field label="Employer identification number" hint="Found on your IRS confirmation letter.">
      <Input placeholder="e.g. 12-3456789" />
    </Field>
  ),
};
export const WithError: Story = {
  render: () => (
    <Field label="Tax ID" required error="Enter a valid EIN to continue.">
      <Input error defaultValue="12-345" />
    </Field>
  ),
};
