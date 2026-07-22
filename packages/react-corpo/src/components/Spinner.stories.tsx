import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};
export const WithLabel: Story = { args: { label: 'Loading statement' } };
export const Large: Story = { args: { size: 28, label: 'Generating report' } };
