import type { Meta, StoryObj } from '@storybook/react';
import { KbdGroup } from './KbdGroup';

const meta: Meta<typeof KbdGroup> = {
  title: 'Display/KbdGroup',
  component: KbdGroup,
  tags: ['autodocs'],
  args: { keys: ['Cmd', 'K'] },
};
export default meta;

type Story = StoryObj<typeof KbdGroup>;

export const Default: Story = {};
export const ThreeKeys: Story = { args: { keys: ['Ctrl', 'Shift', 'P'] } };
