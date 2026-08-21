import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './BarChart';

const meta = {
  title: 'Display/Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HiringByQuarter: Story = {
  args: {
    labels: ['Q1', 'Q2', 'Q3'],
    series: [
      { label: 'Engineering', data: [14, 18, 22] },
      { label: 'Sales', data: [8, 11, 15] },
      { label: 'Support', data: [5, 6, 9] },
    ],
    style: { height: 280 },
  },
};

export const SingleSeries: Story = {
  args: {
    labels: ['Acme Inc.', 'Northwind', 'Globex', 'Initech'],
    series: [{ label: 'Open invoices', data: [12, 7, 4, 9] }],
    style: { height: 220 },
  },
};

/** `stacked` shows composition over time — 2px surface gaps between fills, rounded top on the stack, tooltip includes the column total. */
export const Stacked: Story = {
  args: {
    stacked: true,
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      { label: 'Subscriptions', data: [82_000, 91_500, 98_200, 104_000] },
      { label: 'Services', data: [24_000, 21_800, 26_500, 31_200] },
      { label: 'Licenses', data: [11_500, 12_200, 10_900, 13_400] },
    ],
    yFormat: (v: number) => `$${v.toLocaleString('en-US')}`,
    style: { height: 300 },
  },
};
