import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { SkeletonRow } from './SkeletonRow';

const meta: Meta<typeof Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Text: Story = { render: () => <div style={{ width: 240 }}><Skeleton variant="text" /></div> };
export const Heading: Story = { render: () => <div style={{ width: 240 }}><Skeleton variant="heading" /></div> };
export const Block: Story = { render: () => <div style={{ width: 320 }}><Skeleton variant="block" /></div> };
export const Row: Story = { render: () => <div style={{ width: 280 }}><SkeletonRow /></div> };
