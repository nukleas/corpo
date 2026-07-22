import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Display/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Exports a CSV of the current view', children: <Button size="sm">Export</Button> },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};
export const Bottom: Story = { args: { side: 'bottom' } };
