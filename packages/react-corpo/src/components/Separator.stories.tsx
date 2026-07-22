import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'Display/Separator',
  component: Separator,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = { render: () => <div style={{ width: 320 }}><Separator /></div> };
export const Labeled: Story = { render: () => <div style={{ width: 320 }}><Separator label="Or continue with" /></div> };
