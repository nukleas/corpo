import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Forms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: { children: 'Billable' },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: (args) => {
    const [pressed, setPressed] = useState(false);
    return <Toggle {...args} pressed={pressed} onPressedChange={setPressed} />;
  },
};
