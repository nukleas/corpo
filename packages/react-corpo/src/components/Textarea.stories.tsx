import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { placeholder: 'Add a note for the reviewer…' },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
export const Error: Story = { args: { error: true, defaultValue: 'Missing required detail.' } };
