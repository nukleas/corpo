import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: 'Email me weekly statements' },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true } };
