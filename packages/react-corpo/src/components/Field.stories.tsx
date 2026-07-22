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
    <Field label="Company registration number" hint="Found on your certificate of incorporation.">
      <Input placeholder="e.g. 04123456" />
    </Field>
  ),
};
export const WithError: Story = {
  render: () => (
    <Field label="VAT number" required error="Enter a valid VAT number to continue.">
      <Input error defaultValue="GB000" />
    </Field>
  ),
};
