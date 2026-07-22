import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = {
  title: 'Display/Stat',
  component: Stat,
  tags: ['autodocs'],
  args: { label: 'Monthly recurring revenue', value: '£48,120' },
};
export default meta;

type Story = StoryObj<typeof Stat>;

export const Default: Story = {};
export const Up: Story = { args: { delta: '+4.2%', deltaTone: 'up', hint: 'vs last month' } };
export const Down: Story = { args: { label: 'Churned accounts', value: '3', delta: '-1', deltaTone: 'down' } };
