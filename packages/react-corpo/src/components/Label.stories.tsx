import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Forms/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: 'Account status' },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {};
export const Required: Story = { args: { required: true, children: 'Registered company name' } };
