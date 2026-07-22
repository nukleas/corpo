import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Forms/Radio',
  component: Radio,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Radio>;

export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Radio name="billing" label="Monthly" defaultChecked />
      <Radio name="billing" label="Annual (save 15%)" />
    </div>
  ),
};
export const Disabled: Story = { args: { label: 'Not available on this plan', disabled: true } };
