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
