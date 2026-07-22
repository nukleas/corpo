import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 62, label: 'Import progress' },
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {};
export const Thick: Story = { args: { thick: true } };
export const Success: Story = { args: { value: 100, tone: 'success', label: 'Backup complete' } };
export const Danger: Story = { args: { value: 18, tone: 'danger', label: 'Storage remaining' } };
