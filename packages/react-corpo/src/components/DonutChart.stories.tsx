import type { Meta, StoryObj } from '@storybook/react';
import { DonutChart } from './DonutChart';

const meta = {
  title: 'Display/Charts/DonutChart',
  component: DonutChart,
  tags: ['autodocs'],
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

const money = (v: number) => `$${v.toLocaleString('en-US')}`;

export const SpendByCategory: Story = {
  args: {
    data: [
      { label: 'Payroll', value: 182_000 },
      { label: 'Cloud infrastructure', value: 64_500 },
      { label: 'Licenses', value: 28_900 },
      { label: 'Facilities', value: 21_300 },
      { label: 'Other', value: 9_800 },
    ],
    format: money,
    centerLabel: 'Monthly spend',
    style: { height: 300 },
  },
};

/** A single segment shows no legend; the center still carries the total. */
export const SingleSegment: Story = {
  args: {
    data: [{ label: 'Engineering', value: 42 }],
    centerLabel: 'Seats',
    style: { height: 240 },
  },
};
